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
            ][index]
          }}
        </div>
        <div class="input-wrapper">
          <div v-for="keyword in selectedKeywords[index]" :key="keyword.id" class="tag-example-search" :id="keyword"
            style="background-color: var(--selected-option); opacity:1; background: var(--selected-option); color: var(--button-text)"
            @click="deselectKeyword(keyword, index)">
            {{ keyword.text }}
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
            ][index]" class="" :value="query" @input="updateSearchQuery($event.target.value, index)"
            @keydown="handleBackspace($event, index)" autocomplete="off" />
        </div>
        <div v-show="searchResults[index].length" class="suggestions" @scroll="onSuggestionsScroll(index, $event)">
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
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue';
import useSearchTracking from '../composables/useSearchTracking.js';
import { useStore } from '../stores/store.js'

const store = useStore() 

const fieldIndexBySource = { //mapping search results to advanced search field
  site: 0,
  'rock carving': 0,
  people: 1,
  type: 2, 
  keywords: 3,
  institution: 5
}

const MAX_KEYWORDS = 3;
const props = defineProps({
  currentLang: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['advanced-search-params']);

const searchQuery = ref(['', '', '', '', '', '', '']);
const searchResults = ref([[], [], [], [], [], [], []]);
const selectedKeywords = ref([[], [], [], [], [], [], []]);
const hoveredResultIndex = ref(-1);
const infiniteScrollUrls = ref(Array(7).fill(null));

//api URLs for autocomplete
const apiUrls = computed(() => {
  const langParam = `?language=${props.currentLang}&`;
  return [
    'https://diana.dh.gu.se/api/shfa/search/site/?site_name=',
    `https://diana.dh.gu.se/api/shfa/search/author/${langParam}auhtor_name=`,
    `https://diana.dh.gu.se/api/shfa/search/type/${langParam}image_type=`,
    `https://diana.dh.gu.se/api/shfa/search/keywords/${langParam}keyword=`,
    `https://diana.dh.gu.se/api/shfa/search/dating/${langParam}dating_tag=`,
    'https://diana.dh.gu.se/api/shfa/search/institution/?institution_name=',
    'https://diana.dh.gu.se/api/shfa/null_visualization_group/?depth=1&site='
  ];
});

const clearAdvancedSearchFields = () => {
  searchQuery.value = ['', '', '', '', '', '', ''];
  selectedKeywords.value = [[], [], [], [], [], [], []];
};

const handleSearchButtonClick = () => {
  const searchParams = {};
  const fieldNames = [
    'site_name',
    'author_name',
    'image_type',
    'keyword',
    'dating_tag',
    'institution_name',
    'group'
  ];

  searchQuery.value.forEach((query, index) => {
    let value = '';

    if (index === 3) { //keyword
      const texts = selectedKeywords.value[3].map(k => k.text);
      value = query || texts.join(',');
    } else {
      value = query || (selectedKeywords.value[index][0]?.text) || '';
    }

    if (value) {
      searchParams[fieldNames[index]] = value;
    }
  });

  emit('advanced-search-params', searchParams);

  const { trackSearch } = useSearchTracking();
  trackSearch(new URLSearchParams(searchParams).toString());
};

const selectResult = (result, index) => {
  if (index === 3) { //keyword
    const bucket = selectedKeywords.value[3];
    if (
      !bucket.some(k => k.id === result.id) &&
      bucket.length < MAX_KEYWORDS
    ) {
      bucket.push(result);
    }
  } else {
    selectedKeywords.value[index] = [result];
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
    deselectKeyword(
      selectedKeywords.value[index][selectedKeywords.value[index].length - 1],
      index
    );
  }
};

const onInputFocus = async (index) => {
  searchResults.value = searchResults.value.map((_, i) => i === index ? searchResults.value[i] : []);

  if (!searchResults.value[index].length) {
    await fetchSuggestions(searchQuery.value[index], index);
  }
};

const isScrolledToBottom = (element) => {
  return element.scrollHeight - element.scrollTop <= element.clientHeight + 1;
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
      case 6: //models
        newResults = data.results.flatMap(result => {
          const { placename, raa_id, lamning_id } = result.site;
          const suggestions = [];
          if (raa_id) suggestions.push({ id: result.group.id, text: raa_id });
          if (lamning_id) suggestions.push({ id: result.group.id, text: lamning_id });
          if (placename) suggestions.push({ id: result.group.id, text: placename });
          return suggestions;
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

function onSuggestionsScroll (idx, e) {
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
    if (!kw) return
    const idx = fieldIndexBySource[kw.source]
    if (idx === undefined) return 

    const tag = { id: Date.now(), text: kw.value }

    if (idx === 3) {
      const bucket = selectedKeywords.value[3]
      if (
        !bucket.some(k => k.text === tag.text) &&
        bucket.length < MAX_KEYWORDS
      ) {
        bucket.push(tag)
      }
    } else {
      selectedKeywords.value[idx] = [tag]
    }

    searchQuery.value[idx] = ''
  },
  { immediate: true }
)

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
  flex-wrap: wrap;
  align-items: center;
  background-color: var(--input-wrapper-background);
  border-radius: 5px;
  padding: 0px 7px;
  border: 1px solid var(--input-border);
  max-height: 80px;
  overflow-y: auto;
  overflow-x: hidden;
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
  justify-content: center;
  grid-column: 1 / -1;
}

.search-button,
.clear-button {
  margin: 20px 0 0 0;
}
</style>
