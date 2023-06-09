<template>
  <div class="search-container">
    <!-- <div class="search-container-title">Advanced Search</div> -->
    <div class="search-grid">
      <div v-for="(query, index) in searchQuery" :key="index" class="search-item">
        <div class="field-title">
          {{
            [
            'Site',
            'Rock carving object',
            'Image Type',
            'Keywords',
            'Datings',
              'Institution',
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
               'Search sites...',
               'Search rock carving objects...',
               'Search image types...',
               'Search keywords...',
               'Search datings...',
               'Search institutions...',
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
      advancedResults: [],
      debouncedSearch: [null, null, null, null, null, null],
      selectedKeywords: [[], [], [], [], [], []],
      hoveredResultIndex: -1,
      nextPageUrl: null,
      previousPageUrl: null,
    };
  },
  props: {
  updateNextPageUrlAdvanced: {
    type: Function,
    required: true,
    },
  updatePreviousPageUrlAdvanced: {
    type: Function,
    required: true,
    },
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
        'https://diana.dh.gu.se/api/shfa/search/site/?site_name=',
        'https://diana.dh.gu.se/api/shfa/search/carving/?carving_object=',
        'https://diana.dh.gu.se/api/shfa/search/type/?image_type=',
        'https://diana.dh.gu.se/api/shfa/search/keywords/?keyword=',
        'https://diana.dh.gu.se/api/shfa/search/dating/?dating_tag=',
        'https://diana.dh.gu.se/api/shfa/search/institution/?institution_name=',
      ];
    },
  },
  methods: {
  async fetchResults(fetchURL = null) {
    const baseURL = 'https://diana.dh.gu.se/api/shfa/search/advance/?';
    const searchParams = new URLSearchParams();

    const fieldNames = [
      'site_name',
      'carving_object',
      'image_type',
      'keyword',
      'dating_tag',
      'institution_name'
    ];

    this.selectedKeywords.forEach((keywords, index) => {
      if (keywords.length > 0) {
        searchParams.append(fieldNames[index], keywords[0].text);
      }
    });

    fetchURL = fetchURL ? fetchURL : baseURL + searchParams.toString();

    try {
      const response = await fetch(fetchURL);
      const data = await response.json();

      const specificOrder = [
        { type: 957, text: 'Ortofoto (sfm)', order: 1 },
        { type: 943, text: '3d-visualisering', order: 2 },
        { type: 958, text: '3d-sfm', order: 3 },
        { type: 959, text: '3d-laserskanning', order: 4 },
        { type: 961, text: 'Miljöbild', order: 5 },
        { type: 964, text: 'Natt foto', order: 6 },
        { type: 942, text: 'Foto', order: 7 },
        { type: 949, text: 'Diabild', order: 8 },
        { type: 947, text: 'Negativ, färg', order: 9 },
        { type: 948, text: 'Negativ, svart/vit', order: 10 },
        { type: 960, text: 'Printscreen av lasermodel', order: 11 },
        { type: 956, text: 'Foto av sfm bild', order: 12 },
        { type: 954, text: 'Dstretch-visualisering', order: 13 },
        { type: 941, text: 'Frottage', order: 14 },
        { type: 946, text: 'Grafik', order: 15 },
        { type: 944, text: 'Kalkering plast', order: 16 },
        { type: 951, text: 'Ritning', order: 17 },
        { type: 955, text: 'Kalkering papper', order: 18 },
        { type: 945, text: 'Avgjutning', order: 19 },
        { type: 952, text: 'Dokument', order: 20 },
        { type: 953, text: 'Karta', order: 21 },
        { type: 950, text: 'Tidningsartikel', order: 22 },
        { type: 962, text: 'Arbetsbild', order: 23 },
      ];

      // Map the specificOrder array to an object where the keys are the types
      let typeMap = specificOrder.map(order => ({
        ...order,
        items: [],
      }));

       // Iterate over the results and map them into the correct groups
      for (let image of data.results) {
        let type = image.type;
        let item = {
          id: image.id,
          iiif_file: image.iiif_file,
        };

        let typeIndex = typeMap.findIndex(x => x.type === type);
        if (typeIndex !== -1) {
          typeMap[typeIndex].items.push(item);
        }
      }

      // Filter out the groups with no items and sort the image groups by the specified order
      this.advancedResults = typeMap.filter(group => group.items.length > 0).sort((a, b) => a.order - b.order);

      // Handle next page URL
      if (data.next) {
        this.nextPageUrl = data.next.replace('http://', 'https://');
        this.nextPageUrl = decodeURIComponent(this.nextPageUrl);
        this.updateNextPageUrlAdvanced(this.nextPageUrl);  // Update the parent's nextPageUrl state
      } else {
        this.nextPageUrl = null;
        this.updateNextPageUrlAdvanced(null);  // Update the parent's nextPageUrl state
      }

      if (data.previous) {
        this.previousPageUrl = data.previous.replace('http://', 'https://');
        this.previousPageUrl = decodeURIComponent(this.previousPageUrl);
        this.updatePreviousPageUrlAdvanced(this.previousPageUrl);  // Update the parent's previousPageUrl state
      } else {
        this.previousPageUrl = null;
        this.updatePreviousPageUrlAdvanced(null);  // Update the parent's previousPageUrl state
      }

      this.$emit('advanced-search-results', this.advancedResults);

    } catch (error) {
      console.error(error);
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
        const response = await fetch(`${apiUrl}${query}`);
        const data = await response.json();
        switch(index) {
          case 0: // Site name: use "raa_id"
            this.searchResults[index] = data.features.map(feature => ({
              id: feature.id,
              text: feature.properties.raa_id
            }));
            break;
          case 1: // Carving type: use "name"
            this.searchResults[index] = data.results.map(result => ({
              id: result.id,
              text: result.name
            }));
            break;
          case 2: // Image type: use local list
          const imageTypes = [
            'ortofoto (sfm)',
            'foto',
            '3d-laserskanning',
            '3d-visualisering',
            '3d-sfm',
            'foto av sfm bild',
            'diabild',
            'kalkering plast',
            'grafik',
            'negativ, svart/vit',
            'negativ, färg',
            'natt foto',
            'kalkering papper',
            'frottage',
            'printscreen av lasermodel',
            'dstretch-visualisering',
            'ritning',
            'avgjutning',
            'karta',
            'dokument',
            'tidningsartikel',
            'miljöbild',
            'arbetsbild'
          ];
          this.searchResults[index] = imageTypes
            .filter(type => type.toLowerCase().includes(query.toLowerCase())) // Filter based on the search query
            .map((type, i) => ({ id: i, text: type })); // Map to desired result format
            break;
          case 3: // Keywords: use "text"
            this.searchResults[index] = data.results.map(result => ({
              id: result.id,
              text: result.text
            }));
            break;
          case 4: // Dating: use "text"
            this.searchResults[index] = data.results.map(result => ({
              id: result.id,
              text: result.text
            }));
            break;
          case 5: // Institution name: use "name"
            this.searchResults[index] = data.results.map(result => ({
              id: result.id,
              text: result.name
            }));
            break;
          default: // For the other cases, use the existing structure
            this.searchResults[index] = data.results.slice(0, 5);
        }
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
      this.advancedResults = []; // Reset the advancedResults array
      this.fetchResults();
    },
  },
};
</script>

<style scoped>
.search-container {
  width: 100%; 
  margin-top:125px; 
}
.search-container-title {
  width: 100%; 
  color:white;
  font-size: 1.3rem;
  margin-bottom:10px;
}
.search-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.search-item {
  position: relative;
}

.input-wrapper {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  background-color: rgb(45, 45, 45);
  border-radius: 6px;
  width: 100%;
  box-sizing: border-box;
  font-size: 1rem;
  font-weight:200;
  padding: 0px 10px;
  height: 40px;
  gap: 5px;
  overflow:hidden;
}

.field-title {
  font-size: 0.95em;
  margin-bottom: 5px;
  color: white;
}

.tag-example {
  float: left;
  background-color: rgb(90, 90, 90);
  padding: 3px 8px; 
  font-size: 15px; 
  margin-bottom: 5px;
  border-radius: 5px;
  margin: 5px;
  cursor: pointer;
}


.tag-example-search {
  background-color: rgb(170, 70, 70);
  padding: 0.1em 0.6em;
  font-size: 1.0em;
  font-weight:300;
  border-radius: 5px;
  cursor: pointer;
  display: inline-block; 
  max-width:100%; 
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis;
  color: white;
  box-shadow: 0rem 2px 15px rgba(0, 0, 0, 0.2) !important;
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

.suggestions {
  position: absolute;
  width: 100%;
  color:white;
  background-color: rgb(45,45,45);
  z-index: 1;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 0px 0px 5px 5px;
  padding: 10px;
  margin-top:-5px;
  overflow-y:auto;
  max-height:180px;
}

.search-button {
  float:right;
display: block;
margin-top: 20px;
font-size: 1.1rem;
padding: 5px 20px;
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
