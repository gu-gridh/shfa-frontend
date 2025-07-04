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
                <div class="row-text">{{ other.title }}</div>
                <div class="row-count">{{ other.count }}</div>
              </li>
            </ul>
            <div class="total-count">{{ totalGalleryCount }} totalt</div>
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

          <!-- mobile dropdown -->
          <div v-if="row.open" class="mobile-row-menu">
            <button class="mobile-menu-toggle" @click="row.mobileMenuOpen = !row.mobileMenuOpen">
              <span>{{ getRowTitle(row) }}</span>
              <svg :class="{ rotate: row.mobileMenuOpen }" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" />
              </svg>
            </button>

            <transition name="slide-fade">
              <div v-show="row.mobileMenuOpen">
                <ul class="mobile-menu-list">
                  <li v-for="other in getOtherRows(row.originalIndex)" :key="other.index"
                    :class="{ 'non-clickable': other.isCurrent }"
                    @click="!other.isCurrent && onTitleClick(other.index); row.mobileMenuOpen = false">
                    <div class="row-entry">
                      <span class="row-text">
                        {{ other.title }}
                        <span class="row-count">{{ other.count }}</span>
                      </span>
                    </div>
                  </li>
                </ul>
                <div class="total-count">{{ totalGalleryCount }} results</div>
              </div>
            </transition>
          </div>

          <div class="title-area">
            <h3 :id="'row-title-' + row.originalIndex" class="row-heading">
              {{ getRowTitle(row) }}
              <span v-if="row.count" class="heading-count-wrapper">
                <span class="title-tag">{{ row.count }} items</span>
              </span>
            </h3>

            <div class="next-page-wrapper">
              <div class="gallery-page-button prev-page-btn" :disabled="row.isFetching"
                :class="{ 'page-button-disabled': !row.prevUrl }" @click="fetchPrevPage(row)">
              </div>
              <div class="gallery-page-info" :disabled="row.isFetching">
                Page {{ row.currentPage }}&nbsp;of&nbsp;{{ row.totalPages }}
              </div>
              <div class="gallery-page-button next-page-btn" :disabled="row.isFetching"
                :class="{ 'page-button-disabled': !row.nextUrl }" @click="fetchNextPage(row)">
              </div>
            </div>

            <img v-if="isGalleryLoading || row.isFetching" src="/interface/6-dots-rotate.svg" alt="Loading..."
              class="inline-spinner" />
          </div>

          <div v-if="row.open" class="scroll-wrapper" :aria-label="'Images for ' + getRowTitle(row)">
            <MasonryWall :items="row.infiniteItems" :column-width="thumbSize" :gap="10" class="masonry-wall">
              <template #default="{ item, index }">
                <div :key="item.uuid" class="item" :style="`height:${(item.height / item.width) * thumbSize}px`"
                  @click="$emit('image-clicked', item.iiif_file, item.id)">
                  <span v-if="item.is3d" class="badge-3d">3D</span>
                  <img :src="`${item.iiif_file}/full/${thumbSize},/0/default.jpg`" :alt="`Image ${index}`"
                    :style="`background-color:var(--gallery-image-background)`" loading="lazy" />
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
const thumbSize = 150
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

const totalGalleryCount = computed(() =>
  rows.value.reduce((sum, r) => sum + (r.count || 0), 0)
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
  title: `${getRowTitle(r)}`,
  count: `${r.count}`,
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
      mobileMenuOpen: false,
      infiniteItems: [],
      nextUrl: null,
      prevUrl: null,
      isFetching: false,
      type: sec.type,
      type_translation: sec.type_translation,
      count: sec.count,
      currentPage: 1,
      totalPages: Math.max(1, Math.ceil(sec.count / 25))
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
      r.mobileMenuOpen = false
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
    row.currentPage = 1
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

    const pageParam = new URL(url).searchParams.get('page')
    row.currentPage = pageParam ? Number(pageParam) : 1

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
.mobile-row-menu {
  margin-bottom: 1rem;
}

.mobile-menu-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  padding: 0.5rem 0;
  border: none;
  background: none;
  color: var(--page-text);
  cursor: pointer;
}

.mobile-menu-toggle svg {
  transition: transform .25s ease;
}

.mobile-menu-toggle svg.rotate {
  transform: rotate(180deg);
}

.mobile-menu-list {
  list-style: none;
  margin: 0;
  padding: 0.25rem 0 0.5rem;
}

.mobile-menu-list li {
  padding: 0.35rem 0;
  cursor: pointer;
}

.row-entry {
  display: inline-flex;
  align-items: center;
  font-size: 1rem;
  width: 100%;
}

.mobile-menu-list li.non-clickable {
  cursor: default;
  opacity: 1;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all .25s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (min-width: 901px) {
  .mobile-row-menu {
    display: none;
  }
}

.heading-count-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 0.5rem;
}

.inline-spinner {
  width: 25px;
  height: 25px;
  opacity: 0.8;
  filter: invert(1);
  /* white */
}

.toggle-button-group {
  display: flex;
  justify-content: left;
  align-items: center;
  width: fit-content;
  margin-top: 30px;
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

.title-area {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.next-page-wrapper {
  margin-left: 10px;
  /* background-color: rgba(40,40,40,1);
    border-radius:6px;
    padding:5px 5px;
    margin-top:3px; */
}

.gallery-page-info {
  float: left;
  margin-left: 5px;
  margin-right: 5px;
  font-weight: 500;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
}

.gallery-page-button {
  float: left;
  cursor: pointer;
  margin-left: 5px;
  margin-right: 5px;
  font-weight: 500;
  position: relative;
  background-size: 35px !important;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
}

.page-button-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.gallery-page-button:disabled {
  opacity: .5;
  cursor: default;
}

.next-page-btn {
  background-image: url(https://data.dh.gu.se/ui-icons/arrow_next_white.png);
  padding-right: 30px;
  background-position: right -4px;
  height: 25px;
  width: 25px;
}

.prev-page-btn {
  background-image: url(https://data.dh.gu.se/ui-icons/arrow_prev_white.png);
  padding-left: 30px;
  background-position: left -4px;
  height: 25px;
  width: 25px;
}

.gallery-page-button:hover {
  opacity: 0.5;
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
  margin-top: 133px;
  color: var(--page-text);
  padding-left: 18px;
}

.row-titles ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.row-titles li {
  cursor: pointer;
  opacity: 0.6;
  text-align: right;
  display: flex;
  justify-content: right;
  align-items: center;
  margin-bottom: 2px;
}

.row-text {
  float: right;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 110px;
  min-width: 50px;
  transition: all .3s ease;
  font-weight: 400;
}

.row-divider {
  display: none;
}

.row-count {
  display: inline;
  font-family: monospace;
  text-align: right;
  overflow: hidden;
  width: 0px;
  min-width: 0px;
  max-width: 0px;
  margin-left: 0px;
  font-size: 1.0em;
  font-weight: 400;
  padding-top: 3px;
  margin-left: 5px;
  color: var(--page-text);
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
  transition: all .2s ease;
}

.row-titles li:hover {
  transform: scale(1.02) translate(-1px);
}

.row-titles li:hover .row-text {
  overflow: visible;
}

.row-titles li:hover .row-count {
  max-width: auto;
}

.button-container.sticky:hover .row-count {
  width: auto;
  min-width: 24px;
  max-width: 40px;
  margin-left: 10px;
}

.row-titles li.non-clickable {
  cursor: default;
  opacity: 1;
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
  padding-left: 1.5rem;
  padding-top: 1rem;
  padding-bottom:30px;
}

.row-heading {
  height: auto;
  color: var(--page-text);
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
  font-weight: 400;
}

.title-tag {
  background-color: rgb(40, 40, 40);
  border-radius: 6px;
  margin-left: 0px;
  font-size: 0.8em;
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

.total-count {
  font-weight: 600;
  text-align: right;
  color: var(--page-text);
  margin-top:10px;
  margin-right:5px;
  user-select: none;
  -webkit-user-select: none;
  pointer-events: none;
}

@media (max-width: 900px) {
  .button-container.sticky { /* hide old sidebar */
    display: none;
  }

  .mobile-row-menu { /* show dropdown */
    display: block;
  }

  .right-column {
    width: calc(100vw - 40px);
    padding-left: 0.5rem;
    padding-top: 0rem;
    min-height:400px;
  }

  .mobile-menu-list .row-count {
    display: inline;
    margin-left: 6px;
    font-family: monospace;
    font-size: 0.9em;
    color: var(--page-text);
    pointer-events: none;
    opacity: 0.7;
  }

  .mobile-menu-list .row-text {
    white-space: normal;
    overflow: visible;
    max-width: none;
  }
}

@media (max-width: 900px) {
  .mobile-menu-list+.total-count {
    text-align: left;
    font-size: 0.9rem;
  }
}
</style>