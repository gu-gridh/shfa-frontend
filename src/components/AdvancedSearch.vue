<template>
  <div class="search-container">
    <!-- <div class="search-container-title">Advanced Search</div> -->
    <div class="search-grid">
      <div v-for="(query, index) in searchQuery" :key="index" class="search-item">
        <div class="field-title">
          {{
            [
            'Site',
            'Area',
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
            class="tag-example-search accent-bg-selected"
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
               'Search area...',
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
            class="tag-example accent-bg"
            @click="selectResult(result, index)"
            @mouseover="hoverResult(index)"
            @mouseout="unhoverResult(index)"
          >
            {{ result.text }}
          </div>
        </div>
      </div>
    </div>
    <button class="search-button accent-bg" @click="handleSearchButtonClick">Search</button>
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
    };
  },
  props: {
  updateNextPageUrlAdvanced: {
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

      const newResults = data.results.map(result => ({
        id: result.id,
        iiif_file: result.iiif_file,
      }));

      // Append new results to existing ones
      this.advancedResults = [...this.advancedResults, ...newResults];

      // Handle next page URL
      if (data.next) {
        this.nextPageUrl = data.next.replace('http://', 'https://');
        this.nextPageUrl = decodeURIComponent(this.nextPageUrl);
        this.updateNextPageUrlAdvanced(this.nextPageUrl);  // Update the parent's nextPageUrl state
      } else {
        this.nextPageUrl = null;
        this.updateNextPageUrlAdvanced(null);  // Update the parent's nextPageUrl state
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
  padding: 0.1em 0.6em;
  font-size: 1.0em;
  font-weight:500;
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
font-weight:400;
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
