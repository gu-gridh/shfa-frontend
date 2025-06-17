<template>
  <div>
    <div v-if="isGalleryLoading" class="loading-indicator"></div>
    <div v-else class="grid-container">
      <div v-for="row in visibleRows" :key="row.originalIndex" class="row-wrapper"
        :id="'row-wrapper-' + row.originalIndex">
        <div v-if="row.open" class="button-container sticky">
          <div class="row-titles">
            <ul>
              <li v-for="other in getOtherRows(row.originalIndex)" :class="{ 'non-clickable': other.isCurrent }"
                @click="!other.isCurrent && onTitleClick(other.index)">
                {{ other.title }}
              </li>
            </ul>
          </div>
        </div>

        <div class="right-column">
          <div class="toggle-button-group">
            <button :class="{ active: props.activeTab === 'gallery' }" @click="emit('update-tab', 'gallery')">
              Gallery
            </button>
            <button :class="{ active: props.activeTab === 'summary' }" @click="emit('update-tab', 'summary')">
              Summary
            </button>
          </div>

          <h3 :id="'row-title-' + row.originalIndex" class="row-heading">
            {{ getRowTitle(row) }}
            <span v-if="row.count"> <span class="title-tag"> {{ row.count }} items</span> </span>
          </h3>

          <div class="next-page-wrapper">
            <div v-if="row.prevUrl" class="next-page-btn" :disabled="row.isFetching" @click="fetchPrevPage(row)">
              Previous page
            </div>
            <div v-if="row.nextUrl" class="next-page-btn" :disabled="row.isFetching" @click="fetchNextPage(row)">
              {{ row.isFetching ? 'Loading…' : 'Next page' }}
            </div>
          </div>

          <div v-if="row.open" class="scroll-wrapper" :aria-label="'Images for ' + getRowTitle(row)">
            <MasonryWall :items="row.infiniteItems" :column-width="thumbSize" :gap="10" class="masonry-wall">
              <template #default="{ item, index }">
                <div :key="item.uuid" class="item" :style="`height:${(item.height / item.width) * thumbSize}px`"
                  @click="$emit('image-clicked', item.iiif_file, item.id)">
                  <span v-if="item.is3d" class="badge-3d">3D</span>
                  <img :src="`${item.iiif_file}/full/${thumbSize},/0/default.jpg`" :alt="`Image ${index}`"
                    loading="lazy" />
                  <div class="metadata-overlay">
                    <div class="metadata-content">
                      <div v-if="item.lamning">{{ item.lamning }}</div>
                      <div v-if="item.raa">{{ item.raa }}</div>
                      <div v-if="item.askeladden || item.lokalitet">
                        {{ item.askeladden }}
                      </div>
                      <div v-if="!item.askeladden && item.lokalitet">
                        {{ item.lokalitet }}
                      </div>
                      <div v-if="item.international">
                        {{ item.placename }}
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </MasonryWall>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import MasonryWall from '@yeger/vue-masonry-wall'
import { useStore } from '../stores/store.js'

const store = useStore()
const DEPTH = 1
const thumbSize = 180
const rows = ref([])
const isGalleryLoading = ref(true)
const emit = defineEmits(['image-clicked', 'row-clicked', 'update-tab'])

const withDepth = urlString => {
  const u = new URL(urlString)
  u.searchParams.set('depth', DEPTH)
  return u.toString()
}

const props = defineProps({
  activeTab: { type: String, default: 'gallery' },
  searchItems: [Array, String, Object],
  advancedSearchResults: [Array, Object],
  bboxSearch: [Array, Object],
  selectedSiteId: [Number, String],
  currentLanguage: { type: String, default: 'sv' }
})

const formatIiif = url =>
  url.startsWith('http') ? url : 'https://img.dh.gu.se/diana/static/' + url

const filterTimestamps = reactive({ search: 0, advanced: 0, bbox: 0, site: 0 })
const activeFilter = computed(() =>
  Object.entries(filterTimestamps)
    .sort((a, b) => b[1] - a[1])[0]?.[0]
)

const buildGalleryUrl = () => {
  const base = 'https://diana.dh.gu.se/api/shfa/gallery/'
  const p = new URLSearchParams({ depth: DEPTH })
  const f = activeFilter.value

  if (f === 'site' && props.selectedSiteId) {
    p.append('site', props.selectedSiteId)
  } else if (f === 'search' && props.searchItems?.toString().trim()) {
    p.append('search_type', 'general')
    p.append('q', props.searchItems)
  } else if (f === 'bbox' && Array.isArray(props.bboxSearch) && props.bboxSearch.length === 4) {
    p.append('in_bbox', props.bboxSearch.join(','))
  } else if (f === 'advanced' && props.advancedSearchResults && typeof props.advancedSearchResults === 'object') {
    p.append('search_type', 'advanced')
    Object.entries(props.advancedSearchResults).forEach(([k, v]) => {
      if (v?.toString().trim()) p.append(k === 'group' ? 'site_name' : k, v)
    })
  }
  return base + (p.toString() ? '?' + p.toString() : '')
}

const getRowTitle = r =>
  props.currentLanguage === 'en' ? r.type_translation : r.type

const getOtherRows = idx => rows.value.map(r => ({
  index: r.originalIndex,
  title: `${getRowTitle(r)} (${r.count})`,
  isCurrent: r.originalIndex === idx
}))

const visibleRows = computed(() => {
  const anyOpen = rows.value.some(r => r.open)
  return anyOpen ? rows.value.filter(r => r.open) : rows.value
})

async function fetchGallery() {
  isGalleryLoading.value = true
  try {
    const { results } = await (await fetch(buildGalleryUrl())).json()

    rows.value = (results || []).map((sec, idx) => ({
      originalIndex: idx,
      open: false,
      infiniteItems: [],
      nextUrl: null,
      prevUrl: null,
      isFetching: false,
      type: sec.type,
      type_translation: sec.type_translation,
      count: sec.count
    }))

    if (rows.value.length) toggleRow(0)
  } finally {
    isGalleryLoading.value = false
  }
}

function toggleRow(idx) {
  rows.value.forEach(r => {
    if (r.originalIndex !== idx) {
      r.open = false
      r.infiniteItems = []
      r.nextUrl = null
      r.prevUrl = null
      r.isFetching = false
    }
  })

  const row = rows.value.find(r => r.originalIndex === idx)
  if (!row) return

  if (!row.open) {
    row.infiniteItems = []
    row.nextUrl = null
    row.isFetching = false
  }
  row.open = !row.open

  if (row.open) {
    const url = new URL(buildGalleryUrl())
    url.searchParams.set('category_type', getRowTitle(row))
    row.nextUrl = withDepth(url)
    fetchNextPage(row)
  }
}

const fetchNextPage = row => fetchPage(row, row.nextUrl)
const fetchPrevPage = row => fetchPage(row, row.prevUrl)

async function fetchPage(row, url) {
  if (row.isFetching || !url) return
  row.isFetching = true
  try {
    const res = await fetch(url)
    if (!res.ok) return (row.nextUrl = row.prevUrl = null)

    const { results = [], next, previous, bbox } = await res.json()

    row.infiniteItems = results.map(img => ({
      id: img.id,
      uuid: crypto.randomUUID(),
      category: row.originalIndex,
      iiif_file: formatIiif(img.iiif_file),
      width: img.width,
      height: img.height,
      lamning: img.site?.lamning_id || '',
      raa: img.site?.raa_id || '',
      askeladden: img.site?.askeladden_id || '',
      lokalitet: img.site?.lokalitet_id || '',
      placename: img.site?.placename || '',
      international: img.site?.internationl_site || '',
      is3d: img.group
    }))

    row.nextUrl = next || null
    row.prevUrl = previous || null

    if (bbox && store.currentBbox !== bbox && activeFilter.value !== 'site') {
      store.setBbox(bbox)
    }
  } finally {
    row.isFetching = false
  }
}

function onTitleClick(idx) {
  toggleRow(idx)
  emit('row-clicked')
}

watch(() => props.searchItems, v => { if (v != null) { filterTimestamps.search = Date.now(); fetchGallery() } })
watch(() => props.advancedSearchResults, v => { if (v != null) { filterTimestamps.advanced = Date.now(); fetchGallery() } })
watch(() => props.bboxSearch, v => { if (v != null) { filterTimestamps.bbox = Date.now(); fetchGallery() } })
watch(() => props.selectedSiteId, v => { if (v != null) { filterTimestamps.site = Date.now(); fetchGallery() } })

fetchGallery()
</script>

<style scoped>
.toggle-button-group {
  display: flex;
  justify-content: left;
  align-items: center;
  width: fit-content;
  margin-top: 50px;
  margin-bottom: 20px;
  font-size: 1.2rem;
  font-weight: 500;
  width: 100%;
}

.toggle-button-group button {
  background: none;
  border: none;
  color: var(--page-text);
  cursor: pointer;
  margin-right: 30px;

}

.toggle-button-group button:hover {
  color: var(--notice-text) !important;
}

.toggle-button-group button.active {
  color: var(--highlighted-text);
}

.masonry-wall {
  width: 100%;
}

.next-page-wrapper {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  border-radius: 6px;
  display: contents;
}

.next-page-btn {
  display: block;
  float: left;
  cursor: pointer;
  margin-right: 20px;
  color: var(--page-text);
  font-weight: 500;
  margin-top: -5px;
  margin-bottom: 15px;
}

.next-page-btn:hover {
  color: var(--ui-hover);
}

.next-page-btn:disabled {
  opacity: .5;
  cursor: default;
}

.end-of-pages {
  display: block;
  margin-top: .5rem;
  font-size: .85rem;
  opacity: .6;
}

.badge-3d {
  position: absolute;
  top: 5px;
  right: 5px;
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: center;
  font-weight: 500;
  line-height: 1.5;
  text-align: center;
  overflow: hidden;
  cursor: pointer;
  color: var(--popup-text);
  border-radius: 50%;
  width: 25px;
  height: 25px;
  opacity: 1;
  background-color: var(--threed-icon);
  z-index: 10;
}

.metadata-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, .7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity .3s ease;
  backdrop-filter: blur(5px);
  pointer-events: none;
}

.loading-indicator {
  text-align: center;
  padding: 5px 10px 10px 5px;
  font-size: 1.2rem;
}

.grid-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.row-wrapper {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: start;
}

.button-container.sticky {
  min-width: 50px;
  margin-top: 120px;
  color: var(--page-text);
}

.row-titles ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.row-titles li {
  cursor: pointer;
  opacity: 0.6;
  margin-bottom: 5px;
  text-align: right;
}

.row-titles li:hover {
  transform: scale(1.1) translate(-6px);
}

.row-titles li.non-clickable {
  cursor: default;
  opacity: 1;
  transform: scale(1.1) translate(-6px);
}

h3 {
  font-weight: 600;
  font-size: 120%;
}

h3 span {
  font-weight: 300;
  font-size: 100%;
}

.right-column {
  flex: 1;
  padding-left: 2rem;
  padding-top: 1rem;
}

.row-heading {
  margin-bottom: 1rem;
  height: 30px;
  color: var(--page-text);
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
}

.title-tag {
  background-color: rgb(40, 40, 40);
  border-radius: 6px;
  margin-left: 5px;
  font-size: 0.7em;
  padding: 5px 10px;
  font-weight: 500;
  color: white;
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
}

.scroll-wrapper {
  margin-top: 1rem;
}

.scroller {
  max-height: 80vh;
  overflow-y: auto;
  scrollbar-width: none;
}

.scroller::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.item {
  position: relative;
  overflow: hidden;
}

.item:hover .metadata-overlay {
  opacity: .9;
}

.item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.metadata-content {
  color: #fff;
  text-align: center;
  padding: 10px;
  font-size: .9rem;
  cursor: pointer;
}
</style>