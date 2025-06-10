<template>
  <div v-bind="$attrs">
    <div id="search-interface" class="">
      <div class="input-unpad mb-0" id="search-main">
        <div class="autocomplete-container">

          <div class="input-wrapper" id="search-wrapper">
            <div v-for="keyword in selectedKeywords" :key="keyword.id" class="tag-example-search" id="search-selected"
              @click="deselectKeyword(keyword)">
              {{ currentLang == 'sv' ? keyword.text : keyword.english_translation }}
              <span class="remove-icon">&times;</span>
            </div>
            <input type="search" id="search" name="search"
              :placeholder="selectedKeywords.length > 0 ? '' : $t('message.sökarkiv') + '...'" class=""
              :value="searchQuery" @input="updateSearchQuery($event.target.value)" @keydown="handleBackspace($event)"
              @keydown.enter="emitSearch" autocomplete="off" />
            <button class="search-button-round" id="search-button" @click="emitSearch">
            </button>
          </div>
          <div v-show="isDropdownOpen && suggestions.length" class="suggestions suggestions-top">
            <div v-for="item in suggestions" :key="item.value" class="tag-example" @click="selectSuggestion(item)">
              {{ item.value }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="filter-interface">
      <div class="filter-text">{{ $t('message.sökförslag') }}</div>
      <div v-for="result in defaultSearchResults" :key="result.id" class="tag-example" :id="result.text"
        @click="selectResult(result)">
        {{ currentLang == 'sv' ? result.text : result.english_translation }}
      </div>
    </div>
  </div>
  <div class="search-switcher" style="display:flex; align-items: left; justify-content: left;">
    <div class="ui-mode map-switch-margin" id="map-toggle">
      <button class="item" :class="{ 'active': activePanel === 'Map Interface' }" @click="togglePanel('Map Interface')">
        {{ $t('message.karta') }}
      </button>
      <button class="item" :class="{ 'active': activePanel === 'Advanced Search' }"
        @click="togglePanel('Advanced Search')">
        {{ $t('message.avanceradsökning') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import useSearchTracking from '../composables/useSearchTracking.js';
import { useStore } from '../stores/store.js';

const store = useStore();
const router = useRouter();
const searchQuery = ref('');
const selectedKeywords = ref([]);
const activePanel = ref('Map Interface');
const emit = defineEmits(['toggle-map', 'search-term']);

const suggestions = ref([]);
const isDropdownOpen = ref(false);
let abortCtrl;
let debounceTimer;

const emitSearch = () => {
  const query = selectedKeywords.value.length > 0
    ? selectedKeywords.value[0].text
    : searchQuery.value;

  if (query) {
    emit('search-term', query);
    router.push({ name: 'SearchQuery', params: { query } });
    const { trackSearch } = useSearchTracking();
    trackSearch(query);
  }
};

const selectResult = (result) => {
  selectedKeywords.value = [result];
  searchQuery.value = '';
  emitSearch();
};

const deselectKeyword = () => {
  selectedKeywords.value = [];
};

const updateSearchQuery = (value) => {
  searchQuery.value = value;
};

const togglePanel = (panelName) => {
  if (activePanel.value !== panelName) {
    activePanel.value = panelName;
    emit('toggle-map');
  }
};

const handleBackspace = (event) => {
  if (event.key === 'Backspace' && searchQuery.value === '') {
    deselectKeyword();
  }
};

const clearSearchField = () => {
  searchQuery.value = '';
  selectedKeywords.value = [];
};

const updateSearchFromMetadata = (term) => {
  clearSearchField();
  searchQuery.value = term;
  router.push({ name: 'SearchQuery', params: { query: searchQuery.value } })
};

const fetchAutocomplete = async q => {
  if (abortCtrl) abortCtrl.abort();
  abortCtrl = new AbortController();
  try {
    const res = await fetch(
      `https://diana.dh.gu.se/api/shfa/search/autocomplete/?q=${encodeURIComponent(q)}`,
      { signal: abortCtrl.signal }
    );
    if (!res.ok) return;
    suggestions.value = await res.json();
    isDropdownOpen.value = true;
  } catch (err) {
    if (err.name !== 'AbortError') console.error(err);
  }
};

watch(searchQuery, v => {
  if (!v.trim()) {
    suggestions.value = [];
    isDropdownOpen.value = false;
    return;
  }
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => fetchAutocomplete(v.trim()), 250);
});

const selectSuggestion = item => {
selectedKeywords.value = [{
    id: Date.now(),
    text: item.value,
    english_translation: item.value //to fix
  }];
  searchQuery.value = '';
  suggestions.value = [];
  isDropdownOpen.value = false;
  store.setSelectedKeyword({ value: item.value, source: item.source })
  emitSearch();
};

const onClickOutside = e => {
  const wrapper = document.getElementById('search-wrapper');
  if (wrapper && !wrapper.contains(e.target)) isDropdownOpen.value = false;
};

onMounted(() => document.addEventListener('click', onClickOutside));
onUnmounted(() => document.removeEventListener('click', onClickOutside));

defineExpose({
  clearSearchField,
  updateSearchFromMetadata
});

defineProps({
  defaultSearchResults: {
    type: [Array, String, Object],
    default: () => []
  },
  currentLang: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.autocomplete-container {
  position: relative;
  display: block;
}

.suggestions,
.suggestions-top {
  position: absolute;
  left: 0;
  right: 0;
  overflow-y: auto;
  max-height: 300px;
  background: var(--autocomplete-background);
  border-radius: 0 0 5px 5px;
  z-index: 2001;
  contain: paint;
  padding: 10px;
  margin-top:-6px;
  box-shadow: var(--shadow-suggestion);
}

.suggestions {
  padding-top: 8px;
}

#search-interface {
  font-size: 100%;
  padding-top: 2px;
}

.map-switch-margin {
  margin-top: 30px;
  font-size: 1.1em;
  margin-left: -6px;
  color: var(--page-text);
}

.search-switcher .ui-mode {
  background-color: transparent;
  backdrop-filter: none;
  z-index: 0;
}

.search-button-round {
  border-radius: 50%;
  height: 40px;
  width: 40px;
  margin-right: 10px;
  background: var(--search-button) no-repeat 50% 50%;
  background-size: 30px 30px;
  background-color: var(--button-background);
}

.search-button-round:hover {
  background-color: var(--button-hover);
}

#filter-interface {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: center;
  gap: 0px;
  padding: 0px 0px 10px 0px;
  color: var(--page-text);
  z-index: 1000;
  margin-left: -5px;
  height: 38px;
  overflow: hidden;
}

.filter-text {
  float: left;
  padding: 5px 10px;
  border-radius: 5px;
  margin-left: 3px;
  margin-bottom: 5px;
}

@media (max-width:480px) {
  .filter-text {
    width: 100%;
  }

  #filter-interface {
    height: 70px;
    justify-content: left;
    padding: 0px 0px 0px 0px;
  }
}

.tag-example {
  float: left;
  background-color: var(--button-background);
  padding: 4px 10px;
  font-size: 15px;
  margin-bottom: 5px;
  border-radius: 5px;
  margin-left: 10px;
  cursor: pointer;
  color: var(--button-text);
}

.tag-example-search {
  float: left;
  background-color: var(--button-background);
  padding: 0.2em 0.5em 0.2em 0.5em!important;
  font-size: 1.2em;
  border-radius: 5px;
  margin-left: 10px;
  cursor: pointer;
  box-shadow: var(--shadow);
  overflow: hidden;
  /* max-height: 32px; */
  color: var(--button-text);
  font-weight: 300;
}

.tag-example-search:hover {
  background-color: var(--button-hover)!important;
}

.remove-icon {
  margin-left: 8px;
  font-weight: bold;
  font-size:1.1em!important;
  line-height: 1.0;
}

#search-selected {
  background-color: var(--selected-option);
  vertical-align: middle;
  color: var(--button-text);
  padding: 2px 10px;
  /* min-height: 10px; */
}

.tag-example:hover {
  background-color: var(--button-hover);
  cursor: pointer;
  color: var(--button-text);
}

#search {
  flex: 1;
  font-size: 1.5em;
  display: flex;
  flex-direction: column;
  margin-left: 0px;
  margin-right: 0px;
  padding: 0px 0px 0px 0px;

}

.input-wrapper {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
  font-size: 0.95rem;
  border: 0px solid var(--input-border);
}


input[type="search"] {

  border: none;
  color: var(--page-text);
  margin-top: 5px;
  padding-left: 15px !important;
  padding-right: 15px !important;
  margin-bottom: 10px;
  flex: 1;
  width: 1px !important;
}

input[type="search"]::placeholder {
  color: var(--placeholder-text);
}

input[type="search"]:focus {
  outline: none;
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

h2 {
  display: flex;
  color: var(--page-text);
  font-size: 30px;
  font-weight: 400;
  line-height: 0.8;
}

input:focus {
  outline: none;
}

.toggle-map-btn {
  background-color: var(--button-background);
  color: var(--page-text);
  border: none;
  padding: 10px 10px;
  margin-left: 10px;
  margin-right: 10px;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 5px;
}

.toggle-map-btn:hover {
  background-color: var(--button-hover);
}

.item {
  font-size: 1.1em;
}

.item.active {
  color: var(--highlighted-text);
}



</style>
