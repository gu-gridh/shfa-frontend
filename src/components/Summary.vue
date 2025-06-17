<template>
  <div>
    <div v-if="isLoading" class="loading-indicator">Loading summary…</div>
    <div v-else class="grid-container">
      <div class="row-wrapper">
        <div class="button-container sticky">
          <ul class="row-titles">
            <li v-for="(row, idx) in rows" :key="row.id" :class="{ 'non-clickable': idx === openRowIndex }"
              @click="idx !== openRowIndex && openRow(idx)">
              {{ row.title }}
            </li>
          </ul>
        </div>
        <div class="right-column" v-if="currentRow">
          <div class="toggle-button-group">
            <button :class="{ active: props.activeTab === 'gallery' }" @click="emit('update-tab', 'gallery')">
              Gallery
            </button>
            <button :class="{ active: props.activeTab === 'summary' }" @click="emit('update-tab', 'summary')">
              Summary
            </button>
          </div>

          <h3 class="row-heading">{{ currentRow.title }}</h3>

          <YearHistogram v-if="currentRow.id === 'years'" :data="summary.year" @selectRange="triggerSearch" />

          <ul v-else class="scroller" :class="{ 'single-column': currentRow.id === 'geographic' }">
            <li v-for="item in currentRow.items" :key="item.key" class="item" @click="triggerSearch(item.label)">
              {{ item.label }} ({{ item.count }})
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import YearHistogram from '../components/Histogram.vue'

const emit = defineEmits(['summaryClick', 'update-tab'])

const props = defineProps({
  searchItems: [Array, String, Object],
  advancedSearchResults: [Array, Object],
  bboxSearch: [Array, Object],
  selectedSiteId: [Number, String],
  activeTab: { type: String, default: 'gallery' }
})

const isLoading = ref(false)
const summary = ref({
  creators: [], institutions: [], year: [],
  types: [], motifs: [], geographic: [], site: []
})

const rows = ref([])
const openRowIndex = ref(0) //creators opened first

const currentRow = computed(() => rows.value[openRowIndex.value])
const filterTimestamps = reactive({ search: 0, advanced: 0, bbox: 0, site: 0 })
const activeFilter = computed(
  () => Object.entries(filterTimestamps).sort((a, b) => b[1] - a[1])[0]?.[0]
)

function buildRows() {
  const rowsArr = []

  const makeItems = (arr, labelFn) =>
    (arr || []).map((o, i) => ({
      key: `${labelFn(o)}-${i}`,
      label: labelFn(o),
      count: o.count
    }))

  rowsArr.push({
    id: 'creators',
    title: 'Creators',
    items: makeItems(summary.value.creators, o => o.creator),
    count: summary.value.creators.reduce((n, o) => n + o.count, 0)
  })
  rowsArr.push({
    id: 'institutions',
    title: 'Institutions',
    items: makeItems(summary.value.institutions, o => o.institution),
    count: summary.value.institutions.reduce((n, o) => n + o.count, 0)
  })
  rowsArr.push({
    id: 'types',
    title: 'Types',
    items: makeItems(summary.value.types, o => o.type),
    count: summary.value.types.reduce((n, o) => n + o.count, 0)
  })
  rowsArr.push({
    id: 'motifs',
    title: 'Motifs',
    items: makeItems(summary.value.motifs, o => o.motif || o['figurative motif']),
    count: summary.value.motifs.reduce((n, o) => n + o.count, 0)
  })
  rowsArr.push({
    id: 'geographic',
    title: 'Geographic',
    items: makeItems(summary.value.geographic, o =>
      `Parish: ${o.parish} / Municipality: ${o.municipality} / Province: ${o.province} / Country: ${o.country}`),
    count: summary.value.geographic.reduce((n, o) => n + o.count, 0)
  })
  rowsArr.push({
    id: 'site',
    title: 'Site',
    items: makeItems(summary.value.site, o => o.raa_id || 'Unknown site'),
    count: summary.value.site.reduce((n, o) => n + o.count, 0)
  })
  rowsArr.push({
    id: 'years',
    title: 'Years',
    items: (summary.value.year || []).map((o, i) => ({
      key: `year-${o.year}-${i}`,
      label: String(o.year),
      count: o.count
    })),
    count: (summary.value.year || []).reduce((n, o) => n + o.count, 0)
  })

  rows.value = rowsArr.filter(r => r.items.length)
  openRowIndex.value =
    rows.value.findIndex(r => r.id === 'creators')
  if (openRowIndex.value === -1) openRowIndex.value = 0
}

function openRow(idx) { openRowIndex.value = idx }

function buildSummaryUrl() {
  const base = 'https://diana.dh.gu.se/api/shfa/summary/'
  const p = new URLSearchParams()
  const f = activeFilter.value

  if (f === 'site' && props.selectedSiteId) p.append('site', props.selectedSiteId)
  else if (f === 'search' && props.searchItems?.toString().trim()) {
    p.append('search_type', 'general'); p.append('q', props.searchItems)
  }
  else if (f === 'bbox' && Array.isArray(props.bboxSearch) && props.bboxSearch.length === 4) {
    p.append('in_bbox', props.bboxSearch.join(',')); p.append('depth', '2')
  }
  else if (f === 'advanced' && props.advancedSearchResults && typeof props.advancedSearchResults === 'object') {
    p.append('search_type', 'advanced')
    Object.entries(props.advancedSearchResults).forEach(([k, v]) => v?.toString().trim() && p.append(k, v))
  }
  return base + (p.toString() ? '?' + p.toString() : '')
}

async function fetchSummary() {
  isLoading.value = true
  try {
    summary.value = await (await fetch(buildSummaryUrl())).json()
    buildRows()
  } catch (e) { console.error('[Summary] fetch error', e) } finally {
    isLoading.value = false
  }
}

function triggerSearch(item) {
  emit('summaryClick', item)
}

watch(() => props.searchItems, v => { if (v != null) { filterTimestamps.search = Date.now(); props.activeTab === 'summary' && fetchSummary() } })
watch(() => props.advancedSearchResults, v => { if (v != null) { filterTimestamps.advanced = Date.now(); props.activeTab === 'summary' && fetchSummary() } })
watch(() => props.bboxSearch, v => { if (v != null) { filterTimestamps.bbox = Date.now(); props.activeTab === 'summary' && fetchSummary() } })
watch(() => props.selectedSiteId, v => { if (v != null) { filterTimestamps.site = Date.now(); props.activeTab === 'summary' && fetchSummary() } })
watch(() => props.activeTab, n => { if (n === 'summary') fetchSummary() })

if (props.activeTab === 'summary') fetchSummary()
</script>

<style scoped>
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
  min-width: 70px;
  margin-top: 143px
}

.row-titles ul {
  margin: 0;
  padding: 0;
  list-style: none
}

.row-titles li {
  cursor: pointer;
  color: white;
  opacity: 0.6;
  margin-bottom: 5px;
  text-align: right;
}

h3 {
  font-weight: 600;
  font-size: 120%;
}

h3 span {
  font-weight: 300;
  font-size: 100%;
}

.row-titles li:hover {
  transform: scale(1.2) translate(-10px);
}

.row-titles li.non-clickable {
  cursor: default;
  color: inherit;
  transform: scale(1.2) translate(-10px);
  opacity: 1.0;
}

.right-column {
  flex: 1;
  padding-left: 2rem;
  padding-top: 1rem;

}

.row-heading {
  margin-bottom: 1rem
}

.scroll-wrapper {
  margin-top: 1rem
}

.scroller {
  columns: 2;
  width: 100%;
  max-width: 100%;
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  scrollbar-width: none;
}

.scroller.single-column {
  columns: 1 !important;
}

@media (max-width: 1500px) {
  .scroller {
    columns: 1;
  }
}

.scroller::-webkit-scrollbar {
  width: 0;
  height: 0
}

.item {
  padding: 0 .25rem;
  border-bottom: 1px dotted #717171;
  height: 36px;
  line-height: 36px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item:hover {
  color: var(--ui-hover);
  cursor: pointer;
}
</style>
