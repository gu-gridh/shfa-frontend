<template>
  <div>
    <div v-if="isLoading" class="loading-container">
      <div class="loading-indicator">Loading summary… </div>
      <img src="/interface/6-dots-rotate.svg" alt="Loading..." class="inline-spinner" />
    </div>
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

          <!-- mobile dropdown -->
          <div class="mobile-row-menu">
            <button class="mobile-menu-toggle" @click="mobileMenuOpen = !mobileMenuOpen">
              <span>{{ currentRowTitle }}</span>
              <svg :class="{ rotate: mobileMenuOpen }" width="14" height="14" viewBox="0 0 24 24" fill="none"
                aria-hidden="true">
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" />
              </svg>
            </button>

            <transition name="slide-fade">
              <div v-show="mobileMenuOpen">
                <ul class="mobile-menu-list">
                  <li v-for="r in otherRows" :key="r.index" :class="{ 'non-clickable': r.isCurrent }"
                    @click="!r.isCurrent && (openRow(r.index), mobileMenuOpen = false)">
                    <div class="row-entry">
                      <span class="row-text">
                        {{ r.title }}
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </transition>
          </div>

          <h3 class="row-heading">{{ currentRow.title }}</h3>

          <LineChart v-if="currentRow.id === 'years'" :data="summary.year" :title="currentRow.title"
            :exportable="true" />
          <BarChart v-else :data="currentRow.items" :title="currentRow.title" :exportable="true"
            @select="triggerSearch" />

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import BarChart from '../components/BarChart.vue'
import LineChart from '../components/LineChart.vue'

const emit = defineEmits(['summaryClick', 'update-tab'])
const mobileMenuOpen = ref(false)
const currentRowTitle = computed(() => currentRow.value?.title || '')

const otherRows = computed(() =>
  rows.value.map((r, i) => ({
    index: i,
    title: r.title,
    isCurrent: i === openRowIndex.value
  }))
)

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
    items: (summary.value.motifs || []).map((o, i) => ({
      key: `${o.motif || o['figurative motif']}-${i}`,
      label: o.motif || o['figurative motif'],
      count: o.count,
      figurative: !!o.figurative
    })), 
    count: summary.value.motifs.reduce((n, o) => n + o.count, 0)
  })
  rowsArr.push({
    id: 'geographic',
    title: 'Geographic',
    items: makeItems(summary.value.geographic, o => {
      if (o.country === 'SVERIGE') { return `${o.parish || 'Unknown Parish'}, ${o.municipality || o.province}, ${o.country}` } //use parish and municipality info sweden, only include region if no municipality is available
      else { return `${o.municipality}, ${o.country}` }
    }),
    count: summary.value.geographic.reduce((n, o) => n + o.count, 0)
  })
  rowsArr.push({
    id: 'site',
    title: 'Site',
    items: makeItems(summary.value.site, o =>
      o.raa_id ||
      o.lamning_id ||
      (o.askeladden_id && o.placename && `${o.askeladden_id}: ${o.placename}`) ||
      o.placename ||
      'Unknown site'
    ), //use lamningnr on new swedish sites, include placename with norwegian id for better context, use placename everywhere else
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
  if (currentRow.value?.id !== 'geographic') return emit('summaryClick', item)

  const w = s => String(s ?? '').split(',')[0].trim()
  emit('summaryClick',
    typeof item === 'object' ? { ...item, label: w(item?.label) } : w(item)
  )
}

watch(() => props.searchItems, v => { if (v != null) { filterTimestamps.search = Date.now(); props.activeTab === 'summary' && fetchSummary() } })
watch(() => props.advancedSearchResults, v => { if (v != null) { filterTimestamps.advanced = Date.now(); props.activeTab === 'summary' && fetchSummary() } })
watch(() => props.bboxSearch, v => { if (v != null) { filterTimestamps.bbox = Date.now(); props.activeTab === 'summary' && fetchSummary() } })
watch(() => props.selectedSiteId, v => { if (v != null) { filterTimestamps.site = Date.now(); props.activeTab === 'summary' && fetchSummary() } })
watch(() => props.activeTab, n => { if (n === 'summary') fetchSummary() })
watch(openRowIndex, () => { mobileMenuOpen.value = false })

if (props.activeTab === 'summary') fetchSummary()
</script>

<style scoped>
.inline-spinner {
  width: 55px;
  height: 55px;
  opacity: 0.8;
  filter: invert(1); /* white */
}

.toggle-button-group {
  display: flex;
  justify-content: left;
  align-items: center;
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

.loading-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 50px;
}

.loading-indicator {
  text-align: center;
  padding: 2rem;
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
  align-items: start
}

.button-container.sticky {
  max-width: auto;
  min-width: 100px;
  margin-top: 143px;
  padding-left: 25px;
}

.row-titles ul {
  margin: 0;
  padding: 0;
  list-style: none
}

.row-titles li {
  cursor: pointer;
  color: var(--page-text);
  opacity: 0.6;
  margin-bottom: 5px;
  text-align: right;
}

h3 {
  font-weight: 600;
  font-size: 120%;
}

/* h3 span {
  font-weight: 300;
  font-size: 100%;
} */

.row-titles li:hover {
  transform: scale(1.05) translate(-3px);
}

.row-titles li.non-clickable {
  cursor: default;
  color: var(--highlighted-text);
  opacity: 1.0;
}

.right-column {
  flex: 1;
  padding-left: 2rem;
  padding-top: 1rem;
}

.row-heading {
  margin-bottom: 1rem;
  color: var(--page-text);
  font-weight: 400;
}

.mobile-row-menu {
  margin-bottom: 1rem;
}

@media (min-width: 901px) {
  .mobile-row-menu {
    display: none;
  }
}

@media (max-width: 900px) {
  .button-container.sticky {
    display: none;
  }
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

.mobile-menu-list li.non-clickable {
  cursor: default;
  opacity: 1;
}

.row-entry {
  display: inline-flex;
  align-items: center;
  font-size: 1rem;
  width: 100%;
}

.mobile-menu-list .row-text {
  white-space: normal;
  overflow: visible;
  max-width: none;
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

@media (max-width: 900px) {
  .right-column {
    width: calc(100vw - 40px);
    padding-left: 0.5rem;
    padding-top: 0rem;
    min-height: 320px;
  }
}
</style>
