<template>
  <div class="search-container">
    <div class="search-grid">
      <div v-for="(query, index) in searchQuery" :key="index" class="search-item">
        <div class="field-title" :id="query">
          {{
            [
              $t('message.site'),
              $t('message.hällristningsauthor'),
              $t('message.bildtyp'),
              $t('message.nyckelord'),
              $t('message.datering'),
              'Institution',
              $t('message.3D'),
              $t('message.geographic')
            ][index]
          }}
        </div>
        <div class="input-wrapper">
          <div class="input-left">
            <div v-for="keyword in selectedKeywords[index]" :key="keyword.id" class="tag-example-search" :id="keyword"
              @click="deselectKeyword(keyword, index)">
              {{ keyword.text }}
              <span class="remove-icon">&times;</span>
            </div>

            <input type="search" @click="onInputFocus(index)" :id="'search' + index" :name="'search' + index"
              :placeholder="selectedKeywords[index].length ? '' : [
                $t('message.searchsite'),
                $t('message.sökauthor'),
                $t('message.sökbildtyp'),
                $t('message.söknyckelord'),
                $t('message.sökdatering'),
                $t('message.sökinstitutioner'),
                $t('message.sök3D'),
                $t('message.geographicsearch'),
              ][index]" :value="query" @input="updateSearchQuery($event.target.value, index)"
              @keydown="handleBackspace($event, index)" autocomplete="off" />
          </div>

          <div v-if="toggleFields.includes(index)" class="input-right">
            <span class="op-group">
              <span class="operator-toggle" :class="{ active: fieldOperator[index] === 'OR' }"
                @click.stop="fieldOperator[index] = 'OR'">OR</span>

              <span class="operator-toggle" :class="{ active: fieldOperator[index] === 'AND' }"
                @click.stop="fieldOperator[index] = 'AND'">AND</span>
            </span>
          </div>
        </div>

        <div v-if="searchResults[index].length" class="suggestions" @scroll="onSuggestionsScroll(index, $event)">
          <div v-for="result in searchResults[index]" :key="result.id" class="tag-example"
            @click="selectResult(result, index)" @mouseover="hoverResult(index)" @mouseout="unhoverResult(index)">
            {{ result.text }}
          </div>
        </div>
      </div>

      <div class="action‑row">
        <button class="clear-button" :id="$t('message.clearbutton')" @click="clearAdvancedSearchFields">
          {{ $t('message.clearbutton') }}
        </button>

        <button class="search-button" :id="$t('message.searchbutton')" @click="handleSearchButtonClick">
          {{ $t('message.searchbutton') }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import useSearchTracking from '../composables/useSearchTracking.js';
import { useStore } from '../stores/store.js'

const store = useStore()
const toggleFields = [1, 3, 4]

const fieldOperator = reactive({
  1: 'OR',
  3: 'OR',
  4: 'OR'
})

const fieldIndexBySource = { //mapping search results to advanced search field
  site: 0,
  'rock carving': 0,
  people: 1,
  type: 2,
  keywords: 3,
  'dating tag': 4,
  institution: 5,
}

const MAX_TAGS = 3;
const props = defineProps({
  currentLang: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['advanced-search-params']);

const searchQuery = ref(['', '', '', '', '', '', '', '']);
const searchResults = ref([[], [], [], [], [], [], [], []]);
const selectedKeywords = ref([[], [], [], [], [], [], [], []]);
const hoveredResultIndex = ref(-1);
const infiniteScrollUrls = ref(Array(8).fill(null));

//api URLs for autocomplete
const apiUrls = computed(() => {
  const langParam = `?language=${props.currentLang}&`;
  return [
    'https://shfa.dh.gu.se/api/search/site/?site_name=',
    `https://shfa.dh.gu.se/api/search/author/${langParam}auhtor_name=`,
    `https://shfa.dh.gu.se/api/search/type/${langParam}image_type=`,
    `https://shfa.dh.gu.se/api/search/keywords/${langParam}keyword=`,
    `https://shfa.dh.gu.se/api/search/dating/${langParam}dating_tag=`,
    'https://shfa.dh.gu.se/api/search/institution/?institution_name=',
    'https://shfa.dh.gu.se/api/search/visualization_group/?site_name=',
    'https://shfa.dh.gu.se/api/search/region/?region_name='
  ];
});

const clearAdvancedSearchFields = () => {
  searchQuery.value = ['', '', '', '', '', '', '', ''];
  selectedKeywords.value = [[], [], [], [], [], [], [], []];
};

const handleSearchButtonClick = () => {
  const fieldNames = [
    'site_name',
    'author_name',
    'image_type',
    'keyword',
    'dating_tag',
    'institution_name',
    '3d_site',
    'region_name'
  ];

  const params = new URLSearchParams();

  searchQuery.value.forEach((query, index) => {
    if (index === 7) {
      //add one region_name param per region
      const regions = selectedKeywords.value[7].map(k => k.text);
      const typed = (searchQuery.value[7] || '').trim();
      if (!regions.length && typed) regions.push(typed);
      regions.forEach(r => params.append('region_name', r));
    } else {
      const texts = selectedKeywords.value[index].map(k => k.text);
      const value = query || texts.join(',');
      if (value) {
        params.set(fieldNames[index], value);

        //when 3D has a value
        if (index === 6) {
          params.append('image_type', '3d-visualisering&Ortofoto (SfM)');
        }
      }
    }
  });

  if (params.has('author_name')) {
    params.set('author_operator', fieldOperator[1]); //and/or
  }
  if (params.has('keyword')) {
    params.set('keyword_operator', fieldOperator[3]);
  }
  if (params.has('dating_tag')) {
    params.set('dating_operator', fieldOperator[4]);
  }

  const searchParams = Object.fromEntries(params.entries());
  const regions = params.getAll('region_name');
  if (regions.length) searchParams.region_name = regions;
  emit('advanced-search-params', searchParams);

  const qs = params.toString();

  const { trackSearch } = useSearchTracking();
  trackSearch(qs);
};

const selectResult = (result, index) => {
  const bucket = selectedKeywords.value[index];

  if (
    !bucket.some(k => k.id === result.id) &&
    bucket.length < MAX_TAGS
  ) {
    bucket.push(result);
  }

  searchResults.value[index] = [];
  searchQuery.value[index] = '';
};

const deselectKeyword = (keyword, index) => {
  selectedKeywords.value[index] = selectedKeywords.value[index].filter(
    item => item.id !== keyword.id
  );
};

const updateSearchQuery = async (value, index) => {
  searchQuery.value[index] = value;
  await fetchSuggestions(value, index);
};

const handleBackspace = (event, index) => {
  if (event.key === 'Backspace' && searchQuery.value[index] === '') {
    const bucket = selectedKeywords.value[index];
    if (bucket.length) {
      deselectKeyword(bucket[bucket.length - 1], index);
    }
  }
};

const onInputFocus = async (index) => {
  searchResults.value = searchResults.value.map((_, i) => i === index ? searchResults.value[i] : []);

  if (!searchResults.value[index].length) {
    await fetchSuggestions(searchQuery.value[index], index);
  }
};

const fetchSuggestions = async (query, index, nextPage = null) => {
  try {
    let apiUrl;
    let shouldAppendResults = nextPage != null;

    if (shouldAppendResults) {
      apiUrl = nextPage.replace(/^http:\/\//i, 'https://');
    } else {
      apiUrl = apiUrls.value[index] + encodeURIComponent(query);
      searchResults.value[index] = [];
    }

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.next) {
      infiniteScrollUrls.value[index] = data.next.replace(/^http:\/\//i, 'https://');
    } else {
      infiniteScrollUrls.value[index] = null;
    }

    let newResults;
    switch (index) {
      case 0: //site name
        newResults = data.features.flatMap(feature => {
          const { askeladden_id, lokalitet_id, placename, raa_id, lamning_id } = feature.properties;
          const suggestions = [];
          if (raa_id) suggestions.push({ id: feature.id + '-raa', text: raa_id });
          if (lamning_id) suggestions.push({ id: feature.id + '-lamning', text: lamning_id });
          if (askeladden_id) suggestions.push({ id: feature.id + '-askeladden', text: askeladden_id });
          if (lokalitet_id) suggestions.push({ id: feature.id + '-lokalitet', text: lokalitet_id });
          if (placename) suggestions.push({ id: feature.id + '-placename', text: placename });
          return suggestions;
        });
        break;
      case 1: //author
        newResults = data.results.map(result => ({
          id: result.id,
          text: props.currentLang === 'sv' ? result.name : result.english_translation
        }));
        break;
      case 2:
      case 3:
      case 4:
        newResults = data.results.map(result => ({
          id: result.id,
          text: props.currentLang === 'sv' ? result.text : result.english_translation
        }));
        break;
      case 5: //institution
        newResults = data.results.map(result => ({
          id: result.id,
          text: result.name
        }));
        break;
      case 6: //3d models
        const feats = Array.isArray(data?.results?.features)
          ? data.results.features
          : [];
        newResults = feats.flatMap(f => {
          const p = f?.properties || {};
          const out = [];
          if (p.raa_id) out.push({ id: `group:raa:${p.raa_id}`, text: p.raa_id });
          if (p.lamning_id) out.push({ id: `group:lamning:${p.lamning_id}`, text: p.lamning_id });
          if (p.placename) out.push({ id: `group:place:${p.placename}`, text: p.placename });
          return out;
        });
        break;
      case 7: //geography
        newResults = (data.results || []).map(r => {
          const region = [r.parish, r.municipality, r.province, r.country]
            .filter(Boolean)
            .join(', ');
          return {
            id: region,
            text: region,
            region
          };
        });
        break;
    }

    if (newResults) {
      if (shouldAppendResults) {
        searchResults.value[index] = [...searchResults.value[index], ...newResults];
      } else {
        searchResults.value[index] = newResults;
      }
    }
  } catch (error) {
    console.error('Fetch error:', error);
    searchResults.value[index] = [];
  }
};

const hoverResult = (index) => {
  hoveredResultIndex.value = index;
};

const unhoverResult = (index) => {
  if (hoveredResultIndex.value === index) {
    hoveredResultIndex.value = -1;
  }
};

const handleClickOutside = (e) => {
  if (!e.target.closest('.suggestions')) {
    searchResults.value = searchResults.value.map(() => []);
  }
};

function onSuggestionsScroll(idx, e) {
  const el = e.target
  if (
    el.scrollHeight - el.scrollTop <= el.clientHeight + 1 &&
    infiniteScrollUrls.value[idx]
  ) {
    fetchSuggestions('', idx, infiniteScrollUrls.value[idx])
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

watch( //assigns search results to the advanced search field
  () => store.selectedKeyword,
  kw => {
    if (!kw) return;

    const idx = fieldIndexBySource[kw.source];
    if (idx === undefined) return;

    const tag = { id: Date.now(), text: kw.value };
    const bucket = selectedKeywords.value[idx];

    if (
      !bucket.some(k => k.text === tag.text) &&
      bucket.length < MAX_TAGS
    ) {
      bucket.push(tag);
    }

    searchQuery.value[idx] = '';
  },
  { immediate: true }
);

defineExpose({
  clearAdvancedSearchFields
});
</script>

<style scoped>
.search-container {
  width: 100%;
  margin-top: 20px;
  background-color: transparent;
}

.search-container-title {
  width: 100%;
  color: var(--page-text);
  font-size: 1.3rem;
  margin-bottom: 10px;
}

.search-grid {
  display: grid;
  grid-template-columns: 48.3% 48.3%;
  padding-left: 6px;
  gap: 15px;
}

@media (max-width:480px) {
  .search-grid {
    grid-template-columns: 100%;
  }
}

.search-item {
  position: relative;
}

.field-title {
  font-size: 0.95em;
  margin-bottom: 5px;
  color: var(--page-text);
  padding-left: 4px;
}

.tag-example {
  float: left;
  background-color: var(--button-background);
  padding: 3px 8px;
  font-size: 15px;
  margin-bottom: 5px;
  border-radius: 5px;
  margin: 5px;
  cursor: pointer;
}

.tag-example-search {
  background-color: var(--selected-option);
  vertical-align: middle;
  color: var(--button-text);
  margin: 4px 4px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background-color: var(--input-wrapper-background);
  border: 1px solid var(--input-border);
  border-radius: 5px;
}

.input-left {
  flex: 1 1 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  min-width: 0;
  max-height: none;
  overflow-y: visible;
  overflow-x: hidden;
}

.input-right {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  padding-top: 2px;
  padding-right: 2px;
}

input[type="search"] {
  color: var(--page-text);
  margin-top: 5px;
  margin-bottom: 5px;
  padding: 2px 10px;
  border-radius: 5px;
  flex: 1;
  width: 1px !important;
  background: transparent;
}

input[type="search"]::placeholder {
  color: var(--placeholder-text);
}

input[type="search"]:focus {
  outline: none;
}

.suggestions {
  position: absolute;
  width: 100%;
  color: var(--button-text);
  background-color: var(--autocomplete-background);
  z-index: 1;
  box-shadow: var(--shadow);
  border-radius: 0px 0px 5px 5px;
  padding: 10px;
  margin-top: -5px;
  overflow-y: auto;
  max-height: 170px;
}

.suggestions:hover {
  color: var(--button-text);
}

.tag-example:hover {
  background-color: var(--button-hover);
  color: var(--button-text);
}

.search-button {
  /* float: inline-end;
  display: block; */
  margin-top: 20px;
  margin-bottom: 20px;
  margin-right: 5px;
  /* font-size: 1.1rem; */
  padding: 5px 20px;
  background-color: var(--button-background-accent);
  color: var(--button-text);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 550;
  width: max-content;
  margin-left: auto;
}

.search-button:hover {
  background-color: var(--button-hover-accent);
  color: var(--button-text);
}

.clear-button {
  /* float: left;
  display: block; */
  margin-top: 20px;
  margin-bottom: 20px;
  /* font-size: 1.2rem; */
  padding: 5px 20px;
  background-color: var(--button-background);
  color: var(--button-text);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  /* margin-left: 8px; */
  width: max-content;
}

.clear-button:hover {
  background-color: var(--button-hover);
}

input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
  height: 0.75em;
  width: 0.75em;
  border-radius: 50em;
  background: var(--close-button) no-repeat 50% 50%;
  background-size: contain;
  opacity: 1.0;
  pointer-events: none;
}

input[type="search"]:focus::-webkit-search-cancel-button {
  opacity: 1.0;
  pointer-events: all;
  filter: invert(1);
}

#label-wrapper {
  color: var(--page-text);
}

.action‑row {
  display: flex;
  gap: 10px;
  justify-content: right;
  grid-column: 1 / -1;
}

.search-button,
.clear-button {
  margin: 20px 0 0 0;
}

.op-group {
  display: flex;
  gap: 4px;
  white-space: nowrap;
}

.operator-toggle {
  font-size: .75rem;
  font-weight: 600;
  user-select: none;
  padding: 2px 6px 1px;
  border-radius: 3px;
  cursor: pointer;
  letter-spacing: .5px;
  color: #999;
  transition: opacity .2s;
}

.operator-toggle.active {
  color: #4da3ff;
}

.operator-toggle:hover {
  opacity: .8
}

.remove-icon {
  margin-left: 8px;
  font-weight: bold;
  font-size: 1.1em !important;
  line-height: 1.0;
}
</style>
