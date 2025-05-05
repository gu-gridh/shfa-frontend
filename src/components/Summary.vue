<template>
  <div>
    <div v-if="isLoading" class="loading-indicator">Loading summary…</div>
    <div v-else class="grid-container">
      <div class="row-wrapper">
        <div class="button-container sticky">
          <ul class="row-titles">
            <li
              v-for="(row, idx) in rows"
              :key="row.id"
              :class="{ 'non-clickable': idx === openRowIndex }"
              @click="idx !== openRowIndex && openRow(idx)"
            >
              {{ row.title }}
            </li>
          </ul>
        </div>
        <div class="right-column" v-if="currentRow">
          <h3 class="row-heading">
            {{ currentRow.title }}
          </h3>
          <div class="scroll-wrapper">
            <ul class="scroller">
              <li
                v-for="item in currentRow.items"
                :key="item.key"
                class="item"
                @click="triggerSearch(item.label)"
              >
                {{ item.label }} ({{ item.count }})
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const emit = defineEmits(['summaryClick'])

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
      `Municipality: ${o.municipality} / Parish: ${o.parish} / Province: ${o.province} / Country: ${o.country}`),
    count: summary.value.geographic.reduce((n, o) => n + o.count, 0)
  })
  rowsArr.push({
    id: 'site',
    title: 'Site',
    items: makeItems(summary.value.site, o => o.raa_id || 'Unknown site'),
    count: summary.value.site.reduce((n, o) => n + o.count, 0)
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
  max-width: 150px;
  margin-top: 60px
}

.row-titles {
  margin: 0;
  padding: 0;
  list-style: none
}

.row-titles li {
  cursor: pointer;
  color: #007bff;
  margin-bottom: .25rem
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

.scroll-wrapper {
  margin-top: 1rem
}

.scroller {
  max-height: 70vh;
  overflow-y: auto;
  scrollbar-width: none;
  margin: 0;
  padding: 0;
  list-style: none
}

.scroller::-webkit-scrollbar {
  width: 0;
  height: 0
}

.item {
  padding: 0 .25rem;
  border-bottom: 1px solid #e7e7e7;
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
