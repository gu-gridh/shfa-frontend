<template>
  <div class="search-container">
    <div class="search-grid">
      <div v-for="(query, index) in searchQuery" :key="index" class="search-item">
        <div class="field-title">
          {{
            [
              'Institution',
              'Keywords',
              'Site',
              'Image Type',
              'RAÄ-Number',
              'Datings',
            ][index]
          }}
        </div>
        <div class="input-wrapper">
          <div
            v-for="keyword in selectedKeywords[index]"
            :key="keyword.id"
            class="tag-example-search"
            @click="deselectKeyword(keyword, index)"
          >
            {{ keyword.text }}
          </div>
          <input
            type="search"
            :id="'search' + index"
            :name="'search' + index"
            :placeholder="selectedKeywords[index].length ? '' : [
                'Search institutions...',
                'Search image keywords...',
                'Search sites...',
                'Search image types...',
                'Search raä number...',
                'Search datings...'
            ][index]"
            class=""
            :value="query"
            @input="updateSearchQuery($event.target.value, index)"
            @keydown="handleBackspace($event, index)"
          />
        </div>
        <div v-show="searchResults[index].length" class="suggestions">
          <div
            v-for="result in searchResults[index]"
            :key="result.id"
            class="tag-example"
            @click="selectResult(result, index)"
            @mouseover="hoverResult(index)"
            @mouseout="unhoverResult(index)"
          >
            {{ result.text }}
          </div>
        </div>
      </div>
    </div>
    <button class="search-button" @click="handleSearchButtonClick">Search</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: ['', '', '', '', '', ''],
      searchResults: [[], [], [], [], [], []],
      debouncedSearch: [null, null, null, null, null, null],
      selectedKeywords: [[], [], [], [], [], []],
      hoveredResultIndex: -1,
    };
  },
  created() {
    this.debouncedSearch = this.searchQuery.map(() => {
      return this.debounce((query, index) => {
        this.searchKeywordTags(query, index);
      }, 300);
    });
  },
  computed: {
    apiUrls() {
      return [
        'https://diana.dh.gu.se/api/shfa/keywordtag/',
        'https://diana.dh.gu.se/api/shfa/keywordtag/',
        'https://diana.dh.gu.se/api/shfa/keywordtag/',
        'https://diana.dh.gu.se/api/shfa/keywordtag/',
        'https://diana.dh.gu.se/api/shfa/keywordtag/',
        'https://diana.dh.gu.se/api/shfa/keywordtag/',
      ];
    },
  },
  methods: {
    debounce(fn, delay) {
      let timer;
      return function () {
        clearTimeout(timer);
        timer = setTimeout(() => {
          fn.apply(this, arguments);
        }, delay);
      };
    },
    async searchKeywordTags(query, index) {
      if (!query) {
        this.searchResults[index] = [];
        return;
      }

      const apiUrl = this.apiUrls[index]; // Use the corresponding API URL

      try {
        const response = await fetch(`${apiUrl}?q=${query}`);
        const data = await response.json();
        this.searchResults[index] = data.results.slice(0, 5);
      } catch (error) {
        console.error(error);
      }
    },
    selectResult(result, index) {
    this.selectedKeywords[index] = [result]; // Replace the current keyword instead of pushing a new one
    this.searchResults[index] = this.searchResults[index].filter(
        item => item.id !== result.id,
      );
    this.searchQuery[index] = ''; // Clear the search input value when a tag is selected
    this.searchResults = this.searchResults.map(() => []); // Close all menus
    },
    deselectKeyword(keyword, index) {
      this.selectedKeywords[index] = this.selectedKeywords[index].filter(
        item => item.id !== keyword.id,
      );
    },
    updateSearchQuery(value, index) {
      this.searchQuery[index] = value;
      this.debouncedSearch[index](value, index);
      this.searchResults = this.searchResults.map((results, i) => (i === index ? results : []));
    },
    handleBackspace(event, index) {
    if (event.key === 'Backspace' && this.searchQuery[index] === '') {
      this.deselectKeyword(
        this.selectedKeywords[index][this.selectedKeywords[index].length - 1],
        index,
      );
      }
    },
    hoverResult(index) {
      this.hoveredResultIndex = index;
    },
    unhoverResult(index) {
      if (this.hoveredResultIndex === index) {
        this.hoveredResultIndex = -1;
      }
    },
    handleSearchButtonClick() {
      console.log('Search button clicked');
    },
  },
};
</script>

<style scoped>
.search-container {
  width: 100%;  
}

.search-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.search-item {
  position: relative;
}

.input-wrapper {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  background-color: rgb(45, 45, 45);
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
  font-size: 1rem;
  padding: 10px 15px;
  height: 60px;
  gap: 5px;
}

.field-title {
  font-size: 1.2em;
  margin-bottom: 5px;
  color: white;
}

.tag-example-search {
  background-color: rgb(90, 90, 90);
  padding: 0.5em 0.4em;
  font-size: 1em;
  border-radius: 5px;
  cursor: pointer;
  display: inline-block; 
  max-width: 70%; 
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis;
  color: white;
}

input[type="search"] {
  background-color: transparent;
  border: none;
  color: white;
  margin-top: 5px;
  margin-bottom: 5px;
  flex: 1;
}

input[type="search"]::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

input[type="search"]:focus {
  outline: none;
}

.suggestions {
  position: absolute;
  width: 100%;
  background-color: white;
  z-index: 1;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  padding: 10px;
}

.tag-example {
  padding: 5px;
  font-size: 1.25em;
  cursor: pointer;
  color: black;
}

.tag-example:hover {
background-color: rgb(170, 70, 70);
border-radius: 8px;
color: white;
}

.search-button {
display: block;
margin-top: 20px;
font-size: 1rem;
padding: 10px 20px;
background-color: rgb(90, 90, 90);
color: white;
border: none;
border-radius: 5px;
cursor: pointer;
}

.search-button:hover {
background-color: rgb(170, 70, 70);
}

input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
  height: 0.75em;
  width: 0.75em;
  border-radius: 50em;
  background: url(../../interface/input-cancel-x.svg) no-repeat 50% 50%;
  background-size: contain;
  opacity: 1.0;
  pointer-events: none;
}

input[type="search"]:focus::-webkit-search-cancel-button {
  opacity: 1.0;
  pointer-events: all;
  filter: invert(1);
}
</style>
