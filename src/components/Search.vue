<template>
  <div v-bind="$attrs">
    <div id="search-interface" class="" >
      <h2 class="input-unpad mb-0" id="search">
        <div class="input-wrapper" id="search-wrapper">
          <div
            v-for="keyword in selectedKeywords"
            :key="keyword.id"
            class="tag-example-search"
            id="search-selected"
            @click="deselectKeyword(keyword)"
          >
          {{ $t('message.'+keyword.text) }}
          </div>
          <input
            type="search"
            id="search"
            name="search"
            :placeholder="selectedKeywords.length > 0 ? '' : $t('message.sökarkiv') + '...'"
            class=""
            :value="searchQuery"
            @input="updateSearchQuery($event.target.value)"
            @keydown="handleBackspace($event)"
            @keydown.enter="triggerSearch"
            autocomplete="off"
          />
        <!--   <button class="toggle-map-btn" @click="$emit('toggle-map')">
            Advanced Search
          </button> -->
          <button class="search-button-round" id="search-button" :class="{light:isLight}" @click="triggerSearch">
          </button>
        </div>
      </h2>
    </div>
    <div id="filter-interface">
      <div class="filter-text" :class="{light:isLight}">{{ $t('message.sökförslag') }}</div>
      <div
        v-for="result in defaultSearchResults"
        :key="result.id"
        class="tag-example"
        id="search-suggestion"
        @click="selectResult(result)"
      >
        {{ $t('message.' + result.text) }}
      </div>
    </div>
  </div>
  <div class="search-switcher" style="display:flex;  align-items: left; justify-content: left;">
    <div class="ui-overlay ui-mode map-switch-margin" id="map-toggle">
        <button class="item" :class="{ 'active': activePanel === 'Map Interface' }" @click="togglePanel('Map Interface')">
          {{ $t('message.karta') }}
        </button>
        <button class="item" :class="{ 'active': activePanel === 'Advanced Search' }" @click="togglePanel('Advanced Search')">
          {{ $t('message.avanceradsökning') }}
        </button>
       
      </div>
    </div>
</template>

<script>
import { useRouter } from 'vue-router';
import useSearchTracking from '../composables/useSearchTracking.js'
import { useStore } from '../stores/store.js';

export default {
  name: 'Search',
  emits: ['toggle-map', 'search-completed', 'page-details-updated'],
  data() {
    return {
      searchQuery: '',
      searchResults: [],
      selectedKeywords: [],
      defaultSearchResults: [],
      previousPageUrl: null,
      nextPageUrl: null,
      count: 0,
      activePanel: 'Map Interface',
      isLight: false,
    };
  },
   setup() {
    const router = useRouter();

    return { router };
  },
  props: {
  updateNextPageUrl: {
    type: Function,
    required: true,
    },
  updatePreviousPageUrl: {
    type: Function,
    required: true,
    },
  },
  computed: {
    currentKeywordName() {
      return this.selectedKeywords.length > 0 ? this.selectedKeywords[0].text : '';
    },
    totalPages() {
      return Math.ceil(this.count / 25);
    },
    currentPage() {
      if (this.nextPageUrl) {
        const url = new URL(this.nextPageUrl);
        const offset = url.searchParams.get("offset");
        return (offset / 25);
      } else if (this.previousPageUrl) {
        const url = new URL(this.previousPageUrl);
        const offset = url.searchParams.get("offset");
        return (offset / 25) + 2;
      } else {
        // Default to 1 if no next or previous page
        return 1;
      }
    }
  },
  created() {
    this.coordinateStore = useStore();
    this.defaultSearchResults = [
    { id: 1, text: 'hällristningsmiljö'},
    { id: 2, text: 'nattfoto'},
    { id: 3, text: 'vattenöversilad'},
    { id: 4, text: 'laserskanning'},
    { id: 4, text: 'skepp'},
    { id: 5, text: 'djur'},
    { id: 6, text: 'vagn'},
    { id: 7, text: 'vapen'},
    { id: 8, text: 'krigare'},
    { id: 9, text: 'människofigur'},
    { id: 10, text: 'vitlycke'},
    { id: 11, text: 'skee'},
    { id: 12, text: 'kalkering'},
    { id: 13, text: 'frottage'},
    
    ];
  },  
  methods: {
    clearSearchField() {
      this.searchQuery = '';
      this.selectedKeywords = [];
    },
    updatePageDetails() {
      this.$emit('page-details-updated', { currentPage: this.currentPage, totalPages: this.totalPages, totalResults: this.count });
    },
    triggerSearch() {
      const query = this.selectedKeywords.length > 0 
        ? this.selectedKeywords[0].text 
        : this.searchQuery;

      this.$router.push({ name: 'SearchQuery', params: { query: query } });

      this.searchKeywordTags(query);
      const { trackSearch } = useSearchTracking();
      trackSearch(query);
    },
    async searchKeywordTags(query) {
      this.searchResults = []; // clear previous results

      if (!query) {
        return;
      }

      const url = `https://diana.dh.gu.se/api/shfa/search/?q=${query}&depth=1`;
      await this.fetchResults(url);
    },
    async fetchResults(url) {
      try {
        this.coordinateStore.setLoading(true);
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        const response = await fetch(url);
        const data = await response.json();
        this.count = data.count; // Update the total count

        const specificOrder = [
        { type: 957, text: 'ortofotografi', order: 1 },
        { type: 965, text: 'översiktsbild', order: 1},
        { type: 943, text: 'threedvisualization', order: 2 },
        { type: 958, text: 'threedsm', order: 3 },
        { type: 959, text: 'threedlaserscanning', order: 4 },
        { type: 961, text: 'miljöbild', order: 5 },
        { type: 964, text: 'nattfoto', order: 6 },
        { type: 942, text: 'fotografi', order: 7 },
        { type: 949, text: 'diabild', order: 8 },
        { type: 947, text: 'negativfärg', order: 9 },
        { type: 948, text: 'negativsvart', order: 10 },
        { type: 960, text: 'printscreen', order: 11 },
        { type: 956, text: 'photosfm', order: 12 },
        { type: 954, text: 'dstretch', order: 13 },
        { type: 941, text: 'frottage', order: 14 },
        { type: 946, text: 'grafik', order: 15 },
        { type: 944, text: 'kalkering', order: 16 },
        { type: 951, text: 'ritning', order: 17 },
        { type: 955, text: 'kalkeringpapper', order: 18 },
        { type: 945, text: 'avgjutning', order: 19 },
        { type: 952, text: 'dokument', order: 20 },
        { type: 953, text: 'karta', order: 21 },
        { type: 950, text: 'tidnings', order: 22 },
        { type: 962, text: 'arbetsbild', order: 23 },
        ]

    // Map the specificOrder array to an object where the keys are the types
    let typeMap = specificOrder.map(order => ({
      ...order,
      items: [],
    }));

    // Iterate over the results and map them into the correct groups
    for (let image of data.results) {
      let type = image.type;
      let item = {
        id: image.id ?? null, 
        lamning_id: image?.site?.lamning_id ?? null, 
        raa_id: image?.site?.raa_id ?? null,
        type: image?.type?.id ?? null,
        iiif_file: image.iiif_file ?? null, 
        coordinates: image?.site?.coordinates?.coordinates ?? null,
      };

      const coords = image?.site?.coordinates?.coordinates;
      if (coords) {
        const [x, y] = coords;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
      

    let typeIndex = typeMap.findIndex(x => x.type === type.id); 
      if (typeIndex !== -1) {
        typeMap[typeIndex].items.push(item);
      }
    }

    if (minX !== Infinity && maxX !== -Infinity && minY !== Infinity && maxY !== -Infinity) {
        const boundingBox = {
          topLeft: [minX, maxY],
          topRight: [maxX, maxY],
          bottomLeft: [minX, minY],
          bottomRight: [maxX, minY],
        };
        this.coordinateStore.setBoundingBox(boundingBox);
    } else {
      console.log('No valid coordinates found. Skipping setting the bounding box.');
    }

    // Filter out the groups with no items and sort the image groups by the specified order
    this.searchResults = typeMap.filter(group => group.items.length > 0)
    //.sort((a, b) => a.order - b.order);

    this.searchResults = Array.from(typeMap.values());


      // Store the next URL for future use
      if (data.next) {
        this.nextPageUrl = data.next.replace('http://', 'https://');
        this.nextPageUrl = decodeURIComponent(this.nextPageUrl);
        this.updateNextPageUrl(this.nextPageUrl);  // Update the parent's nextPageUrl state
      } else {
        this.nextPageUrl = null;
        this.updateNextPageUrl(null);  // Update the parent's nextPageUrl state
      }

      if (data.previous) {
        this.previousPageUrl = data.previous.replace('http://', 'https://');
        this.previousPageUrl = decodeURIComponent(this.previousPageUrl);
        this.updatePreviousPageUrl(this.previousPageUrl);  // Update the parent's previousPageUrl state
      } else {
        this.previousPageUrl = null;
        this.updatePreviousPageUrl(null);  // Update the parent's previousPageUrl state
      }


      } catch (error) {
        console.error(error);
      } finally {
        // After all data is loaded, emit the contents of searchResults
        this.coordinateStore.setLoading(false);
        this.$emit('search-completed', this.searchResults);
        this.updatePageDetails();
      }
    },
    async fetchNextPage() {
      if (this.nextPageUrl) {
        await this.fetchResults(this.nextPageUrl);
      } else {
        console.log("No more pages to fetch.");
      }
    },
    async fetchPreviousPage() {
  if (this.previousPageUrl) {
    await this.fetchResults(this.previousPageUrl);
  } else {
    console.log("No previous pages to fetch.");
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

.light{
  background-color:rgb(250, 250, 250);
  color:black;

}



#search-interface{
  font-size:100%;
  padding-top:02px;
}

.map-switch-margin{
  margin-top:155px; 
  font-size:1.1em;
  margin-left:-6px;
}

.light .map-switch-margin{
  color:black;
}

.search-switcher .ui-mode{
  background-color:transparent;
  backdrop-filter: none;
  z-index:0;
}
.search-button-round{
background-color:#6666;
border-radius:50%;
height:40px;
width:40px;
margin-right:10px;
background:url(../../public/interface/searchbuttonwhite.png) no-repeat 50% 50%;
background-size: 30px 30px;
background-color:#6666;
}

.search-button-round:hover{
  background-color: rgb(70,90,90);
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

@media (max-width:480px) {
  .filter-text {
  width:100%;
}
#filter-interface {
  height:70px;
  justify-content:left;
  padding: 0px 0px 0px 0px;
}
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
  background-color: rgb(80,90,100);
  padding: 0.4em 0.5em; 
  font-size: 1.2em;
  border-radius: 5px;
  margin-left: 10px;
  cursor: pointer;
  box-shadow: 0rem 2px 15px rgba(0, 0, 0, 0.2) !important;
  overflow:hidden;
  max-height:32px;
  color:white;
  font-weight:300;
}

.tag-example:hover {
  background-color: rgb(80,90,100);
  cursor: pointer;
  color:white;
 
}

#search {
  flex: 1;
  font-size:1.5em;
  display: flex;
  flex-direction: column;
  margin-left: 0px;
  margin-right: 0px;
  border-radius: 8px;
  padding: 4px 00px 0px 0px;
  background-color: transparent;
}

.input-wrapper {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  background-color: rgba(45, 45, 45, 0.8);
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
  font-size: 1rem; 
}


.input-wrapper:hover {
  background-color: rgba(45, 45, 45, 1.0);
}

input[type="search"] {
  background-color: transparent!important;
  border: none;
  color: white;
  margin-top: 5px;
  padding-left: 15px!important;
  padding-right: 15px!important;
  margin-bottom: 10px;
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
  background: url(../../public/interface/input-cancel-x.svg) no-repeat 50% 50%;
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
  background-color: rgb(80,90,100);
}

.item.active {
  color: rgb(200,225,250);
}
</style>

