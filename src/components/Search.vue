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
            :placeholder="selectedKeywords.length > 0 ? '' : 'Search Archive...'"
            class=""
            :value="searchQuery"
            @input="updateSearchQuery($event.target.value)"
            @keydown="handleBackspace($event)"
            @keydown.enter="triggerSearch"
          />
        <!--   <button class="toggle-map-btn" @click="$emit('toggle-map')">
            Advanced Search
          </button> -->
          <button class="search-button-round" @click="triggerSearch">
         
          </button>
        </div>
      </h2>
    </div>
    <div id="filter-interface">
      <div class="filter-text">Search suggestions:</div>
      <div
        v-for="result in defaultSearchResults"
        :key="result.id"
        class="tag-example"
        @click="selectResult(result)"
      >
        {{ result.text }}
      </div>
    </div>
  </div>
  <div style="display:flex;  align-items: center; justify-content: center;">
    <div class="ui-mode ui-overlay" style="margin-top:175px; font-size:1.0em">
        <button class="item" :class="{ 'active': activePanel === 'Map Interface' }" @click="togglePanel('Map Interface')">
         Map Interface
        </button>
        <button class="item" :class="{ 'active': activePanel === 'Advanced Search' }" @click="togglePanel('Advanced Search')">
          Advanced Search
        </button>
       
      </div>
    </div>
</template>

<script>
export default {
  name: 'Search',
  emits: ['toggle-map', 'search-completed'],
  data() {
    return {
      searchQuery: '',
      searchResults: [],
      selectedKeywords: [],
      defaultSearchResults: [],
      nextPageUrl: null,
      activePanel: 'Map Interface', 
    };
  },
  props: {
  updateNextPageUrl: {
    type: Function,
    required: true,
    },
  },
  computed: {
    currentKeywordName() {
      return this.selectedKeywords.length > 0 ? this.selectedKeywords[0].text : '';
    },
  },
  created() {
    this.defaultSearchResults = [
    { id: 1, text: 'Skepp'},
    { id: 2, text: 'Djur'},
    { id: 3, text: 'Vapen'},
    { id: 4, text: 'Vagn'},
    { id: 5, text: 'Vitlycke'},
    { id: 6, text: 'Lur'},
    { id: 7, text: 'Krigare'},
    { id: 8, text: 'Frottage'},
    { id: 9, text: '3d'},
    { id: 10, text: 'Nattfotografering'},
    ];
  },  
  methods: {
    triggerSearch() {
      const query = this.selectedKeywords.length > 0 
        ? this.selectedKeywords[0].text 
        : this.searchQuery;
      this.searchKeywordTags(query);
    },
    async searchKeywordTags(query) {
      this.searchResults = []; // clear previous results

      if (!query) {
        return;
      }

      const url = `https://diana.dh.gu.se/api/shfa/search/?q=${query}`;
      await this.fetchResults(url);
    },
    async fetchResults(url) {
      try {
        const response = await fetch(url);
        const data = await response.json();
        // Extract the file data from the results
        const fileData = data.results.map(result => ({
          id: result.id,
          file: result.file,
          iiif_file: result.iiif_file,
        }));
        this.searchResults = [...this.searchResults, ...fileData];

        // Store the next URL for future use
        if (data.next) {
          this.nextPageUrl = data.next.replace('http://', 'https://');
          this.nextPageUrl = decodeURIComponent(this.nextPageUrl);
          this.updateNextPageUrl(this.nextPageUrl);  // Update the parent's nextPageUrl state
        } else {
          this.nextPageUrl = null;
          this.updateNextPageUrl(null);  // Update the parent's nextPageUrl state
        }

      } catch (error) {
        console.error(error);
      } finally {
        // After all data is loaded, emit the contents of searchResults
        this.$emit('search-completed', this.searchResults);
      }
    },
    async fetchNextPage() {
      if (this.nextPageUrl) {
        await this.fetchResults(this.nextPageUrl);
      } else {
        console.log("No more pages to fetch.");
      }
    },
    selectResult(result) {
      if (this.selectedKeywords.length > 0) {
        // Add the currently selected keyword back to the defaultSearchResults
        //const currentKeyword = this.selectedKeywords[0];
       // this.defaultSearchResults.splice(currentKeyword.position, 0, currentKeyword);
      }
      // Replace the currently selected keyword with the new one
      this.selectedKeywords = [result];
      this.searchQuery = ''; // Empty the search box
      const index = this.defaultSearchResults.findIndex(item => item.id === result.id);
      if (index !== -1) {
        //this.defaultSearchResults.splice(index, 1); // Remove from suggestions
      }
      this.triggerSearch();
    },
    deselectKeyword(keyword) {
      // Add the deselected keyword back to its original position in the defaultSearchResults
      //this.defaultSearchResults.splice(keyword.position, 0, keyword);
      this.selectedKeywords = []; // Remove from selected
    },
    updateSearchQuery(value) {
      this.searchQuery = value;
    },
    togglePanel(panelName) {
        if (this.activePanel !== panelName) {
            this.activePanel = panelName;
            this.$emit('toggle-map');
        }
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
.search-button-round{
background-color:#6666;
border-radius:50%;
height:40px;
width:40px;
margin-right:10px;
background:url(../../interface/searchbuttonwhite.png) no-repeat 50% 50%;
background-size: 30px 30px;
background-color:#6666;
}

.search-button-round:hover{
  background-color: rgb(170, 70, 70);

}

#filter-interface {
  display: flex;
  flex-direction: row;
  justify-content:space-between;
  flex-wrap: wrap;
  align-items: center;
  gap: 0px;
  padding: 0px 0px 10px 0px;
  color: white;
  z-index: 1000;
  margin-left: -5px;
  height:38px;
  overflow:hidden;
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
  padding: 4px 10px; 
  font-size: 15px; 
  margin-bottom: 5px;
  border-radius: 5px;
  margin-left: 10px;
  cursor: pointer;
}

.tag-example-search {
  float: left;
  background-color: rgb(170, 70, 70);
  padding: 0.4em 0.5em; 
  font-size: 1.25em;
  border-radius: 5px;
  margin-left: 10px;
  cursor: pointer;
  box-shadow: 0rem 2px 15px rgba(0, 0, 0, 0.2) !important;
  overflow:hidden;
  max-height:32px;
}

.tag-example:hover {
  background-color: rgb(170, 70, 70);
  cursor: pointer;
}

#search {
  flex: 1;
  font-size:1.5em;
  display: flex;
  flex-direction: column;
  margin-left: 0px;
  margin-right: 0px;
  border-radius: 8px;
  padding: 8px 15px;
  background-color: transparent;
}

.input-wrapper {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  background-color: rgba(45, 45, 45, 0.3);
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
  font-size: 1rem; 
}

.input-wrapper:hover {

  background-color: rgba(45, 45, 45, 0.8);

}

input[type="search"] {
  background-color: transparent;
  border: none;
  color: white;
  margin-top: 5px;
  margin-bottom: 5px;
  flex: 1;
  width:1px!important;
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

.item.active {
  color: rgb(150,200,255);
}
</style>

