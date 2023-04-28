<template>
  <div>
    <div id="search-interface" class="">
      <h2 class="input-unpad mb-0">
        <div class="input-wrapper">
          <div
            v-for="keyword in selectedKeywords"
            :key="keyword.id"
            class="tag-example-search"
            @click="deselectKeyword(keyword)"
          >
            {{ keyword.text }}
          </div>
           <input
              type="search"
              id="search"
              name="search"
              placeholder="Search Archive..."
              class=""
              :value="searchQuery"
              @input="updateSearchQuery($event.target.value)"
              @keydown="handleBackspace($event)"
          />
          <button class="toggle-map-btn" @click="$emit('toggle-map')">
            Advanced Search
          </button>
        </div>
      </h2>
    </div>
    <div id="filter-interface">
      <div class="filter-text">Filter suggestions:</div>
      <div
        v-for="result in searchResults"
        :key="result.id"
        class="tag-example"
        @click="selectResult(result)"
      >
        {{ result.text }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Search',
  data() {
    return {
      searchQuery: '',
      searchResults: [],
      debouncedSearch: null,
      selectedKeywords: [],
    };
  },
  computed: {
    currentKeywordName() {
      return this.selectedKeywords.length > 0 ? this.selectedKeywords[0].text : '';
    },
  },
  watch: {
    searchQuery: {
      handler: function (newValue) {
        this.debouncedSearch(newValue);
      },
    },
  },
  created() {
    this.debouncedSearch = this.debounce(this.searchKeywordTags, 300);
    this.searchResults = [
      { id: 1, text: 'Sample 1' },
      { id: 2, text: 'Sample 2' },
      { id: 3, text: 'Sample 3' },
      { id: 4, text: 'Sample 4' },
      { id: 5, text: 'Sample 5' },
    ];
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
    async searchKeywordTags(query) {
      if (!query) {
        this.searchResults = [];
        return;
      }

      try {
        const response = await fetch(`https://diana.dh.gu.se/api/shfa/keywordtag/?q=${query}`);
        const data = await response.json();
        this.searchResults = data.results.slice(0, 5);
      } catch (error) {
        console.error(error);
      }
    },
    selectResult(result) {
      this.selectedKeywords = [result]; // Replace the entire array with the new keyword
      this.searchResults = this.searchResults.filter(item => item.id !== result.id);
      this.searchQuery = '';
    },
    deselectKeyword(keyword) {
      this.selectedKeywords = this.selectedKeywords.filter(item => item.id !== keyword.id);
    },
    updateSearchQuery(value) {
      this.searchQuery = value;
    },
     handleBackspace(event) {
      if (event.key === 'Backspace' && this.searchQuery === '') {
        this.deselectKeyword(this.selectedKeywords[this.selectedKeywords.length - 1]);
      }
    },
  },
};
</script>

<style scoped>
#filter-interface {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0px;
  padding: 10px 0px 10px 0px;
  color: white;
  z-index: 1000;
  margin-left: -5px;
}

.filter-text {
  float: left;
  padding: 5px 10px;
  border-radius: 5px;
  margin-left: 3px;
  margin-bottom: 5px;
}

.tag-example {
  float: left;
  background-color: rgb(90, 90, 90);
  padding: 5px 8px; /* Adjust padding for smaller text */
  font-size: 12px; /* Make the text in the keywords smaller */
  margin-bottom: 5px;
  border-radius: 5px;
  margin-left: 10px;
  cursor: pointer;
}

.tag-example-search {
  float: left;
  background-color: rgb(90, 90, 90);
  padding: 0.5em 0.4em; 
  font-size: 1.25em;
  border-radius: 5px;
  margin-left: 10px;
  cursor: pointer;
}

.tag-example:hover {
  background-color: rgb(170, 70, 70);
  cursor: pointer;
}

#search {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 0px;
  margin-right: 0px;
  border-radius: 8px;
  padding: 10px 15px;
  background-color: rgb(45, 45, 45);
}

.input-wrapper {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  background-color: rgb(45, 45, 45);
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
  font-size: 1rem; /* Add a base font-size for the input-wrapper */
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

h2 {
  display: flex;
  color: white;
  font-size: 30px;
  font-weight: 400;
  line-height: 0.8;
}

input:focus {
  outline: none;
}

.toggle-map-btn {
  background-color: rgb(90, 90, 90);
  color: white;
  border: none;
  padding: 10px 10px;
  margin-left: 10px;
  margin-right: 10px;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 5px;
}

.toggle-map-btn:hover {
  background-color: rgb(170, 70, 70);
}
</style>

