<template>
  <div class="search-container">
    <!-- <div class="search-container-title">Advanced Search</div> -->
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
      ][index]" class="" :value="query" @input="updateSearchQuery($event.target.value, index)"
            @keydown="handleBackspace($event, index)" autocomplete="off" />
        </div>
        <div v-show="searchResults[index].length" class="suggestions">
          <div v-for="result in searchResults[index]" :key="result.id" class="tag-example"
            @click="selectResult(result, index)" @mouseover="hoverResult(index)" @mouseout="unhoverResult(index)">
            {{ result.text }}
          </div>
        </div>
      </div>
    </div>
    <button class="search-button" :id="$t('message.searchbutton')" @click="handleSearchButtonClick"> {{
        $t('message.searchbutton')
      }}</button>
    <button class="clear-button" :id="$t('message.clearbutton')" @click="clearAdvancedSearchFields">{{
        $t('message.clearbutton')
      }}</button>
  </div>
</template>

<script>
import useSearchTracking from '../composables/useSearchTracking.js'
import { useStore } from '../stores/store.js';

export default {
  data() {
    return {
      searchQuery: ['', '', '', '', '', ''],
      searchResults: [[], [], [], [], [], []],
      advancedResults: [],
      debouncedSearch: [null, null, null, null, null, null],
      selectedKeywords: [[], [], [], [], [], []],
      infiniteScrollUrls: Array(6).fill(null),
      hoveredResultIndex: -1,
      nextPageUrl: null,
      previousPageUrl: null,
      count: 0,
    };
  },
  props: {
    currentLang:
    {
      type: String,
    },
    updateNextPageUrlAdvanced: {
      type: Function,
      required: true,
    },
    updatePreviousPageUrlAdvanced: {
      type: Function,
      required: true,
    },
  },
  mounted() {
    this.setupScrollListener();
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  created() {
    this.coordinateStore = useStore();
    this.debouncedSearch = this.searchQuery.map(() => {
      return this.debounce((query, index) => {
        this.searchKeywordTags(query, index);
      }, 300);
    });
  },
  computed: {
    apiUrls() { //For Autocomplete
      const langParam = `?language=${this.currentLang}&`;
      return [
        'https://diana.dh.gu.se/api/shfa/search/site/?site_name=',
        `https://diana.dh.gu.se/api/shfa/search/author/${langParam}auhtor_name=`,
        `https://diana.dh.gu.se/api/shfa/search/type/${langParam}image_type=`,
        `https://diana.dh.gu.se/api/shfa/search/keywords/${langParam}keyword=`,
        `https://diana.dh.gu.se/api/shfa/search/dating/${langParam}dating_tag=`,
        'https://diana.dh.gu.se/api/shfa/search/institution/?institution_name=',
      ];
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
  methods: {
    closeAllSuggestions() {
      // Close all suggestion boxes
      this.searchResults = this.searchResults.map(() => []);
    },
    handleClickOutside(event) {
      const searchContainers = this.$el.querySelectorAll('.input-wrapper');
      let clickInsideSearchContainer = false;

      searchContainers.forEach((container) => {
        if (container.contains(event.target)) {
          clickInsideSearchContainer = true;
        }
      });

      if (!clickInsideSearchContainer) {
        this.closeAllSuggestions();
      }
    },
    setupScrollListener() {
      const suggestionBoxes = this.$el.querySelectorAll('.suggestions');
      suggestionBoxes.forEach((box, index) => {
        box.addEventListener('scroll', () => {
          // Before calling searchKeywordTags, check if infiniteScrollUrls at this index is not null
          if (this.isScrolledToBottom(box) && this.infiniteScrollUrls[index] !== null) {
            this.searchKeywordTags('', index, this.infiniteScrollUrls[index]);
          }
        });
      });
    },
    isScrolledToBottom(element) {
      return element.scrollHeight - element.scrollTop <= element.clientHeight + 1;
    },
    onInputFocus(index) {
      // Close all other suggestion boxes
      this.searchResults = this.searchResults.map(() => []);

      // Check if there is already a query or selected keywords
      if (!this.searchQuery[index] && !this.selectedKeywords[index].length) {
        // If not, perform a search to get initial results
        this.searchKeywordTags('', index);
      }

      // Make sure the suggestions for the current input are shown
      this.searchResults[index] = this.searchResults[index].length ? this.searchResults[index] : [];
    },
    clearAdvancedSearchFields() {
      this.searchQuery = ['', '', '', '', '', ''];
      this.selectedKeywords = [[], [], [], [], [], []];
    },
    updatePageDetails() {
      this.$emit('page-details-updated', { currentPage: this.currentPage, totalPages: this.totalPages, totalResults: this.count });
    },
    async fetchResults(combinedQueries = null, fetchURL = null) {
      const baseURL = 'https://diana.dh.gu.se/api/shfa/search/advance/?';
      const searchParams = new URLSearchParams();
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

      const fieldNames = [
        'site_name',
        'author_name',
        'image_type',
        'keyword',
        'dating_tag',
        'institution_name'
      ];

      if (combinedQueries) {
        combinedQueries.forEach((query, index) => {
          if (query) {
            searchParams.append(fieldNames[index], query);
          }
        });
      }

      searchParams.append('depth', '1');
      fetchURL = fetchURL ? fetchURL : baseURL + searchParams.toString();

      try {
        this.coordinateStore.setLoading(true);
        const response = await fetch(fetchURL);
        const data = await response.json();
        this.count = data.count; // Update the total count

        const specificOrder = [
          { type: 957, text: 'ortofotografi', order: 1 },
          { type: 965, text: 'översiktsbild', order: 1 },
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

          // Block to calculate minimum and maximum coordinates
          const coords = image?.site?.coordinates?.coordinates;
          if (coords) {
            const [x, y] = coords;
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
          }

          // Block to group images by type
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
        this.advancedResults = typeMap.filter(group => group.items.length > 0);
        // .sort((a, b) => a.order - b.order);

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
        this.coordinateStore.setLoading(false);
        this.updatePageDetails();

      } catch (error) {
        console.error(error);
      }
    },

    async fetchNextPage() {
      if (this.nextPageUrl) {
        await this.fetchResults(null, this.nextPageUrl);
      } else {
        console.log("No more pages to fetch.");
      }
    },

    async fetchPreviousPage() {
      if (this.previousPageUrl) {
        await this.fetchResults(null, this.previousPageUrl);
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
    async searchKeywordTags(query, index, nextPage = null) {
      let apiUrl;
      let newResults;
      let shouldAppendResults = nextPage != null;

      if (shouldAppendResults) {
        // Replace 'http://' with 'https://' if present
        apiUrl = nextPage.replace(/^http:\/\//i, 'https://');
      } else {
        apiUrl = this.apiUrls[index] + encodeURIComponent(query);
        // Clear out the current search results as we're refining the search
        this.searchResults[index] = [];
      }

      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        // If after an API call we find there is no 'next' page, do not proceed with updating results
        if (data.next) {
          this.infiniteScrollUrls[index] = data.next.replace(/^http:\/\//i, 'https://');
        } else {
          this.infiniteScrollUrls[index] = null;
        }
        switch (index) {
          case 0: // Site name: use "raa_id, lamning_id, askeladden_id, lokalitet_id, placename"
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
          case 1:
            newResults = data.results.map(result => ({
              id: result.id,
              text: this.currentLang === 'sv' ? result.name : result.english_translation
            }));
            break;
          case 2:
            newResults = data.results.map(result => ({
              id: result.id,
              text: this.currentLang === 'sv' ? result.text : result.english_translation
            }));
            break;
          case 3: // Keywords: use "text"
            newResults = data.results.map(result => ({
              id: result.id,
              text: this.currentLang === 'sv' ? result.text : result.english_translation
            }));
            break;
          case 4: // Dating: use "text"
            newResults = data.results.map(result => ({
              id: result.id,
              text: this.currentLang === 'sv' ? result.text : result.english_translation
            }));
            break;
          case 5: // Institution name: use "name"
            newResults = data.results.map(result => ({
              id: result.id,
              text: result.name
            }));
            break;
          default: // For the other cases, use the existing structure
            this.searchResults[index] = data.results.slice(0, 5);
        }
        if (newResults) {
          if (shouldAppendResults) {
            // Append the new results to the existing ones
            this.searchResults[index] = [...this.searchResults[index], ...newResults];
          } else {
            // Replace the current results with the new ones as we're refining the search
            this.searchResults[index] = newResults;
          }
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

      // Combine the selected keywords with the typed-in search queries
      const combinedQueries = this.searchQuery.map((query, index) => {
        return query || (this.selectedKeywords[index][0] && this.selectedKeywords[index][0].text) || '';
      });

      this.fetchResults(combinedQueries);

      const { trackSearch } = useSearchTracking();

      const searchParams = new URLSearchParams();

      const fieldNames = [
        'site_name',
        'author_name',
        'image_type',
        'keyword',
        'dating_tag',
        'institution_name'
      ];

      combinedQueries.forEach((query, index) => {
        if (query) {
          searchParams.append(fieldNames[index], query);
        }
      });

      trackSearch(decodeURIComponent(searchParams.toString()));
    }
  },
};
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
  /* min-height: 10px; */
}

.input-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  background-color: var(--input-wrapper-background);
  border-radius: 5px;
  padding: 5px;
  border: 0.5px solid var(--input-border);
}

input[type="search"] {
  color: var(--page-text);
  margin-top: 5px;
  margin-bottom: 5px;
  padding: 5px 10px;
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

.search-button {
  float: right;
  display: block;
  margin-top: 20px;
  margin-bottom: 20px;
  /* font-size: 1.1rem; */
  padding: 5px 20px;
  background-color: var(--button-background);
  color: var(--button-text);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
}

.search-button:hover {
  background-color: var(--button-hover);
  color: var(--page-text);
}

.clear-button {
  float: left;
  display: block;
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
  margin-left: 8px;
}

.clear-button:hover {
  background-color: var(--button-hover);
  color: var(--page-text);
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
</style>
