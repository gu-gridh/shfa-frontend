<template>
  <div>
    <div v-if="isGalleryLoading" class="loading-indicator">Loading…</div>
    <div v-else class="grid-container">
      <div v-for="row in visibleRows" class="row-wrapper" :id="'row-wrapper-' + row.originalIndex">
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
                <img :src="item.iiif_file + '/full/200,/0/default.jpg'" alt="preview" />
                <div class="metadata-overlay">
                  <div class="metadata-content">{{ item.info }}</div>
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
              @update="(_, __, ___, end) => handleRowUpdate(end, row)"
            >
              <template #default="{ item, index }">
                <div class="item" :key="item.uuid" @click="$emit('image-clicked', item.iiif_file, item.id)">
                  <LazyThumb :src="item.iiif_file + '/full/' + thumbSize + ',/0/default.jpg'" :alt="'Image ' + index" />
                  <div class="metadata-overlay">
                    <div class="metadata-content">{{ item.info }}</div>
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
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

function getInitialCols() {
  if (typeof window === 'undefined') return 5

  const w = window.innerWidth
  const minColWidth = 300
  const colsByWidth = Math.max(1, Math.floor(w / minColWidth))

  if (w < 900) return 1
  return colsByWidth
}

const cols = getInitialCols()
const thumbSize = 150
const bufferPx = thumbSize * 6

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
  const p = new URLSearchParams()
  const f = activeFilter.value

  if (f === 'site' && props.selectedSiteId) {
    p.append('site', props.selectedSiteId)
  } else if (f === 'search' && props.searchItems?.toString().trim()) {
    p.append('search_type', 'general'); p.append('q', props.searchItems)
  } else if (f === 'bbox' && Array.isArray(props.bboxSearch) && props.bboxSearch.length === 4) {
    p.append('in_bbox', props.bboxSearch.join(',')); p.append('depth', '2')
  } else if (f === 'advanced' && props.advancedSearchResults && typeof props.advancedSearchResults === 'object') {
    p.append('search_type', 'advanced')
    Object.entries(props.advancedSearchResults).forEach(([k, v]) => {
      if (v?.toString().trim()) p.append(k === 'group' ? 'site_name' : k, v)
    })
  }
  return base + (p.toString() ? '?' + p.toString() : '')
}

async function fetchGallery() {
  isGalleryLoading.value = true
  try {
    const { results } = await (await fetch(buildGalleryUrl())).json()
    rows.value = (results || []).map((sec, idx) => ({
      originalIndex: idx,
      shortItems: (sec.images || []).map(img => ({
        id: img.id,
        iiif_file: formatIiif(img.iiif_file),
        info: 'ID: ' + img.id + (img.year ? ' | Year: ' + img.year : '')
      })),
      open: false,
      scrollerRef: null,
      infiniteItems: [],
      nextUrl: null,
      isFetching: false,
      type: sec.type,
      type_translation: sec.type_translation,
      count: sec.count
    }))
  } finally { isGalleryLoading.value = false }
}

const getRowTitle = r => props.currentLanguage === 'en' ? r.type_translation : r.type
const getOtherRows = idx => rows.value.map(r => ({
  index: r.originalIndex,
  title: getRowTitle(r) + ' (' + r.count + ')',
  isCurrent: r.originalIndex === idx
}))

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
    row.nextUrl = url.toString()
    fetchNextPage(row)
  }
}

async function fetchNextPage(row) {
  if (row.isFetching || !row.nextUrl) return
  row.isFetching = true
  try {
    const { results, next } = await (await fetch(row.nextUrl)).json()
    row.infiniteItems.push(...results.map(img => ({
      id: img.id,
      uuid: crypto.randomUUID(),
      category: row.originalIndex,
      iiif_file: formatIiif(img.iiif_file),
      info: 'ID: ' + img.id + (img.year ? ' | Year: ' + img.year : '')
    })))
    row.nextUrl = next
  } finally {
    row.isFetching = false
    await nextTick()
    row.scrollerRef?.updateVisibleItems(true)
  }
}

const handleRowUpdate = (endIdx, row) => {
  if (endIdx >= row.infiniteItems.length - cols) fetchNextPage(row)
}

function onTitleClick(idx) {
  toggleRow(idx)
  emit('row-clicked')
}

const visibleRows = computed(() => {
  const anyOpen = rows.value.some(r => r.open)
  return anyOpen ? rows.value.filter(r => r.open) : rows.value
})

watch(() => props.searchItems, v => { if (v != null) { filterTimestamps.search = Date.now(); fetchGallery() } })
watch(() => props.advancedSearchResults, v => { if (v != null) { filterTimestamps.advanced = Date.now(); fetchGallery() } })
watch(() => props.bboxSearch, v => { if (v != null) { filterTimestamps.bbox = Date.now(); fetchGallery() } })
watch(() => props.selectedSiteId, v => { if (v != null) { filterTimestamps.site = Date.now(); fetchGallery() } })

fetchGallery()
</script>

<style scoped>
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
  max-width: 130px;
  margin-top: 60px
}

.row-titles ul {
  margin: 0;
  padding: 0;
  list-style: none
}

.row-titles li {
  cursor: pointer;
  color: #007bff;
}

.row-titles li.non-clickable {
  cursor: default;
  color: inherit
}

.row-titles li:hover:not(.non-clickable) {
  text-decoration: underline
}

.right-column {
  flex: 1;
  padding-left: 1rem;
  padding-top: 1rem
}

.row-heading {
  margin-bottom: 1rem
}

.toggle-btn {
  background: #333;
  color: #fff;
  border: none;
  padding: 0.5rem 0;
  cursor: pointer;
  width: 100px;
  font-size: 15px;
  margin-left: 1rem;
  border-radius: 5px;
}

.short-preview {
  display: flex;
  gap: 1rem;
  scrollbar-width: none;
  overflow: hidden;
}

.short-item {
  flex: 1 1 0;
  min-width: 0;
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
}

.image-wrapper:hover .metadata-overlay {
  opacity: .9
}

.metadata-content {
  color: #fff;
  text-align: center;
  padding: 10px;
  font-size: .9rem
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
  padding: .25rem;
  box-sizing: border-box;
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
