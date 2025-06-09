<template>
  <div>
    <div v-if="isGalleryLoading" class="loading-indicator">Loading…</div>
    <div v-else class="grid-container">
      <div v-for="row in visibleRows" :key="row.originalIndex" class="row-wrapper" :id="'row-wrapper-' + row.originalIndex">
        <div v-if="row.open" class="button-container sticky">
          <div class="row-titles">
            <ul>
              <li v-for="other in getOtherRows(row.originalIndex)"
                @click="!other.isCurrent && onTitleClick(other.index)" :class="{ 'non-clickable': other.isCurrent }">
                {{ other.title }}
              </li>
            </ul>
          </div>
        </div>

        <div class="right-column">
          <h3 :id="'row-title-' + row.originalIndex" class="row-heading">
            {{ getRowTitle(row) }}
            <span v-if="row.count"> ({{ row.count }})</span>
            <button v-if="row.shortItems.length >= 5" class="toggle-btn" @click="toggleRow(row.originalIndex)">
              {{ row.open ? 'Hide' : 'Show more' }}
            </button>
          </h3>

          <!-- preview thumbnails -->
          <div v-if="!row.open" class="short-preview" :aria-label="'Preview images for ' + getRowTitle(row)">
            <div v-for="item in row.shortItems" class="short-item">
              <div class="image-wrapper" @click="$emit('image-clicked', item.iiif_file, item.id)">
                <span v-if="item.is3d" class="badge-3d">3D</span>
                <img :src="item.iiif_file + '/full/200,/0/default.jpg'" alt="preview" />
                <div class="metadata-overlay">
                  <div class="metadata-content">
                    <div v-if="item.lamning">{{ item.lamning }}</div>
                    <div v-if="item.raa">{{ item.raa }}</div>
                    <div v-if="item.askeladden || item.lokalitet">{{ item.askeladden }}</div>
                    <div v-if="!item.askeladden && item.lokalitet">{{ item.lokalitet }}</div>
                    <div v-if="item.international">{{ item.placename }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- expanded virtual grid -->
          <div v-else class="scroll-wrapper" :aria-label="'Images for ' + getRowTitle(row)">
            <RecycleScroller 
              :ref="el => (row.scrollerRef = el)" class="scroller" 
              :items="row.infiniteItems"
              :item-size="thumbSize" 
              :item-secondary-size="thumbSize" 
              :grid-items="cols" 
              :buffer="bufferPx"
              :type-field="'category'" 
              :key-field="'uuid'" :emit-update="true"
              @update="(start, end) => onScrollerUpdate(start, end, row)"
            >
              <template #default="{ item, index }">
                <div class="item" :key="item.uuid" @click="$emit('image-clicked', item.iiif_file, item.id)">
                  <span v-if="item.is3d" class="badge-3d">3D</span>
                  <LazyThumb :src="item.iiif_file + '/full/' + thumbSize + ',/0/default.jpg'" :alt="'Image ' + index" />
                  <div class="metadata-overlay">
                    <div class="metadata-content">
                      <div v-if="item.lamning">{{ item.lamning }}</div>
                      <div v-if="item.raa">{{ item.raa }}</div>
                      <div v-if="item.askeladden || item.lokalitet">{{ item.askeladden }}</div>
                      <div v-if="!item.askeladden && item.lokalitet">{{ item.lokalitet }}</div>
                      <div v-if="item.international">{{ item.placename }}</div>
                    </div>
                  </div>
                </div>
              </template>
            </RecycleScroller>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import LazyThumb from './LazyThumb.vue'
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { useStore } from "../stores/store.js";

const store = useStore()
const DEPTH = 1
const withDepth = urlString => {
  const u = new URL(urlString)
  u.searchParams.set('depth', DEPTH)
  return u.toString()
}

const thumbSize = 180
const bufferPx = thumbSize * 2
const cols = ref(1)

async function getInitialCols () {
  await nextTick()
  if (typeof window === 'undefined') return 1

  const el = document.getElementById('split-1')
  if (!el) return 1

  const splitWidth = el.clientWidth

  const OFFSETS  = 190

  const usable = splitWidth - OFFSETS
  // console.log('split-1 width:', splitWidth, 'usable:', usable)

  const count = Math.floor((usable) / (thumbSize))
  return Math.max(1, count)
}

const props = defineProps({
  searchItems: [Array, String, Object],
  advancedSearchResults: [Array, Object],
  bboxSearch: [Array, Object],
  selectedSiteId: [Number, String],
  currentLanguage: { type: String, default: 'sv' },
})

const emit = defineEmits(['image-clicked', 'row-clicked'])

const rows = ref([])
const isGalleryLoading = ref(true)

const formatIiif = url =>
  url.startsWith('http') ? url : 'https://img.dh.gu.se/diana/static/' + url

const filterTimestamps = reactive({
  search: 0, advanced: 0, bbox: 0, site: 0
})
const activeFilter = computed(
  () => Object.entries(filterTimestamps).sort((a, b) => b[1] - a[1])[0]?.[0]
)

const buildGalleryUrl = () => {
  const base = 'https://diana.dh.gu.se/api/shfa/gallery/'
  const p = new URLSearchParams({ depth: DEPTH })
  const f = activeFilter.value

  if (f === 'site' && props.selectedSiteId) {
    p.append('site', props.selectedSiteId)
  } else if (f === 'search' && props.searchItems?.toString().trim()) {
    p.append('search_type', 'general'); p.append('q', props.searchItems)
  } else if (f === 'bbox' && Array.isArray(props.bboxSearch) && props.bboxSearch.length === 4) {
    p.append('in_bbox', props.bboxSearch.join(','));
  } else if (f === 'advanced' && props.advancedSearchResults && typeof props.advancedSearchResults === 'object') {
    p.append('search_type', 'advanced')
    Object.entries(props.advancedSearchResults).forEach(([k, v]) => {
      if (v?.toString().trim()) p.append(k === 'group' ? 'site_name' : k, v) 
    })
  }
  return base + (p.toString() ? '?' + p.toString() : '')
}

const getRowTitle = r => props.currentLanguage === 'en' ? r.type_translation : r.type
const getOtherRows = idx => rows.value.map(r => ({
  index: r.originalIndex,
  title: getRowTitle(r) + ' (' + r.count + ')',
  isCurrent: r.originalIndex === idx
}))

const handleRowUpdate = (endIdx, row) => {
  if (endIdx >= row.infiniteItems.length - cols.value) fetchNextPage(row)
}

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
      shortItems: (sec.images || []).map(img => ({
        id:   img.id,
        iiif_file: formatIiif(img.iiif_file),
        lamning:   img.site?.lamning_id || '',
        raa:       img.site?.raa_id     || '',
        askeladden: img.site?.askeladden_id     || '',
        lokalitet: img.site?.lokalitet_id     || '',
        placename: img.site?.placename     || '',
        international: img.site?.internationl_site     || '',
        is3d:    img.type?.id === 943
      })),
      open: false,
      scrollerRef: null,
      infiniteItems: [],
      nextUrl: null,
      isFetching: false,
      pageMeta: [],
      type: sec.type,
      type_translation: sec.type_translation,
      count: sec.count
    }))
  } finally { isGalleryLoading.value = false }
}

function toggleRow(idx) {
  //close all other rows & reset them
  rows.value.forEach(r => {
    if (r.originalIndex !== idx) {
      r.open = false
      r.infiniteItems = []
      r.nextUrl = null
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

  //fetch first page once
  if (row.open) {
    const url = new URL(buildGalleryUrl())
    url.searchParams.set('category_type', getRowTitle(row))
    row.nextUrl = withDepth(url)
    fetchNextPage(row)
  }
}

async function fetchNextPage(row) {
  if (row.isFetching || !row.nextUrl) return
  row.isFetching = true
  try {
    const res   = await fetch(row.nextUrl)
    const data  = await res.json()
    const { results = [], next, bbox } = data

    const start = row.infiniteItems.length

    row.infiniteItems.push(
      ...results.map(img => ({
        id: img.id,
        uuid: crypto.randomUUID(),
        category: row.originalIndex,
        iiif_file: formatIiif(img.iiif_file),
        lamning: img.site?.lamning_id || '',
        raa:     img.site?.raa_id     || '',
        askeladden: img.site?.askeladden_id     || '',
        lokalitet: img.site?.lokalitet_id     || '',
        placename: img.site?.placename     || '',
        international: img.site?.internationl_site     || '',
        is3d:    img.type?.id === 943
      }))
    )

    const end = row.infiniteItems.length - 1
    row.pageMeta.push({ start, end, bbox })

    row.nextUrl = next ? withDepth(next) : null
  } finally {
    row.isFetching = false
    await nextTick()
    row.scrollerRef?.updateVisibleItems(true)
  }
}

function onScrollerUpdate (startIdx, endIdx, row) {
  //fetch more when near the end
  handleRowUpdate(endIdx, row)

  const meta = row.pageMeta.find(p =>
    startIdx >= p.start && startIdx <= p.end
  )
  if (meta && store.currentBbox !== meta.bbox) {
    store.setBbox(meta.bbox)
  }
}

function onTitleClick(idx) {
  toggleRow(idx)
  emit('row-clicked')
}

onMounted(async () => {
  cols.value = await getInitialCols()
})

watch(() => props.searchItems, v => { if (v != null) { filterTimestamps.search = Date.now(); fetchGallery() } })
watch(() => props.advancedSearchResults, v => { if (v != null) { filterTimestamps.advanced = Date.now(); fetchGallery() } })
watch(() => props.bboxSearch, v => { if (v != null) { filterTimestamps.bbox = Date.now(); fetchGallery() } })
watch(() => props.selectedSiteId, v => { if (v != null) { filterTimestamps.site = Date.now(); fetchGallery() } })

fetchGallery()
</script>

<style scoped>
.badge-3d {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--button-background-accent);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
}

.item:hover .metadata-overlay {
  opacity: 0.9;
}

.loading-indicator {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem
}

.grid-container {
  display: flex;
  flex-direction: column;
  gap: 2rem
}

.row-wrapper {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: start
}

.button-container.sticky {
  max-width: auto;
  min-width:160px;
  margin-top: 65px
}

.row-titles ul {
  margin: 0;
  padding: 0;
  list-style: none
}

.row-titles li {
  cursor: pointer;
  opacity:0.6;
  margin-bottom:5px;
}

h3{
  font-weight: 600;
  font-size:120%;
}

h3 span{
  font-weight: 300;
  font-size:100%;
}

.row-titles li:hover {
  transform:scale(1.2) translate(13px);
}

.row-titles li.non-clickable {
  cursor: default;
  color: inherit;
  transform:scale(1.2) translate(13px);
  opacity:1.0;
}


/* .row-titles li:hover:not(.non-clickable) {
  text-decoration: underline
} */

.right-column {
  flex: 1;
  padding-left: 1rem;
  padding-top: 1rem
}

.row-heading {
  margin-bottom: 1rem;
  height:30px;
}

.toggle-btn {
  background: #333;
  color: #fff;
  border: none;
  padding: 0.3rem 1.0rem;
  cursor: pointer;
  width: auto;;
  font-size: 15px;
  margin-left: 1rem;
  border-radius: 5px;
  margin-top:-5px;
}

.toggle-btn:hover {
  background: #222;

}

.short-preview {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  scrollbar-width: none;
  overflow: hidden;
}

.short-item {
  flex: 0 1 calc(20% - 0.8rem);
  min-width: 150px; 
}

.image-wrapper {
  position: relative;
  width: 100%;
  cursor: pointer;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover
}

.metadata-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, .7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity .3s ease;
  backdrop-filter: blur(5px);
}

.image-wrapper:hover .metadata-overlay {
  opacity: .6
}

.metadata-content {
  color: #fff;
  text-align: center;
  padding: 10px;
  font-size: .9rem;
  cursor: pointer;
}

.scroll-wrapper {
  margin-top: 1rem
}

.scroller {
  max-height: 80vh;
  overflow-y: auto;
}

.item {
  position: relative;
  width: 100%;
  height: 100%;
}

.item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #eee;
  max-height: 300px;
}

.scroller::-webkit-scrollbar,
.short-preview::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.scroller {
  scrollbar-width: none
}
</style>
