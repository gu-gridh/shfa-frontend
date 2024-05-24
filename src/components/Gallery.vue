<template>
  <div class="gallery-container">
    <div v-if="store.isLoading" class="loading-animation">
      <img src="/interface/6-dots-rotate.svg" alt="Loading..." />
    </div>
    <div v-for="(group, groupIndex) in imageGroups" :key="group.type">
      <h3 v-if="group.items.length > 0">{{ $t("message." + group.text) }}</h3>
      <MasonryWall :key="layoutKey" :items="group.items" :ssr-columns="1" :column-width="columnWidth" :gap="10"
        class="gallery-group">
        <template #default="{ item, index }">
          <div class="grid-image card flex items-center justify-center"
            @click="$emit('image-clicked', item.iiif_file, item.id)">
            <img :src="`${item.iiif_file}/full/350,/0/default.jpg`" :alt="`Image ${index}`" @load="
      item.loaded || imageLoadLog(index, groupIndex, item.iiif_file)
      " v-on:load.once="item.loaded = true" />
            <div class="grid-item-info" id="gallery">
              <div class="grid-item-info-meta">
                <h5>{{ item.lamning_id || item.placename }}</h5>
                <h6 v-if="item.raa_id || item.lokalitet_id || item.askeladden_id">{{ item.raa_id || item.askeladden_id
      || item.lokalitet_id }}</h6>
              </div>
            </div>
          </div>
        </template>
      </MasonryWall>
    </div>
    <div class="button-container">
      <!-- Previous buttons -->
      <div class="button-group">
        <!-- Map Search Previous button -->
        <button class="loadMore left" v-if="mapGallery && previousPageUrl && !bboxSearch"
          @click="fetchPreviousData"></button>
        <!-- Search Previous button -->
        <button class="loadMore left" v-if="!mapGallery &&
      searchPreviousPageUrl &&
      !advancedSearch &&
      !bboxSearch
      " @click="searchFetchPreviousPage"></button>
        <!-- Advanced Search Previous button -->
        <button class="loadMore left" v-if="!mapGallery &&
      advancedPreviousPageUrl &&
      advancedSearch &&
      !bboxSearch
      " @click="advancedFetchPreviousPage"></button>
        <!-- Bbox Search Previous button -->
        <button class="loadMore left" v-if="mapGallery && previousPageUrl && bboxSearch"
          @click="loadPreviousPageBbox"></button>
      </div>

      <!-- Next buttons -->
      <div class="button-group">
        <!-- Map Search Next button -->
        <button class="loadMore right" v-if="mapGallery && nextPageUrl && !bboxSearch" @click="fetchData"></button>
        <!-- Search Next button -->
        <button class="loadMore right" v-if="!mapGallery && searchNextPageUrl && !advancedSearch && !bboxSearch
      " @click="loadMore"></button>
        <!-- Advanced Search Next button -->
        <button class="loadMore right" v-if="!mapGallery &&
      searchNextPageUrlAdvanced &&
      advancedSearch &&
      !bboxSearch
      " @click="loadMoreAdvanced"></button>
        <!-- Bbox Search Next button -->
        <button class="loadMore right" v-if="mapGallery && nextPageUrl && bboxSearch"
          @click="loadNextPageBbox"></button>
      </div>
    </div>
  </div>
</template>

<script>
import MasonryWall from "@yeger/vue-masonry-wall";
import { useStore } from "../stores/store.js";

export default {
  components: {
    MasonryWall,
  },
  setup() {
    const store = useStore();

    return { store };
  },
  props: {
    siteId: {
      type: [Number, String],
      required: false,
      default: null,
    },
    forceRefresh: {
      type: Number,
      required: false,
      default: 0,
    },

    /* Props for general searches */
    searchItems: {
      type: Array,
      required: false,
      default: () => [],
    },
    fetchNextPage: {
      type: Function,
      required: true,
    },
    searchFetchPreviousPage: {
      type: Function,
      required: true,
    },
    searchNextPageUrl: {
      type: [String, null],
      required: true,
      default: "",
    },
    searchPreviousPageUrl: {
      type: [String, null],
      required: true,
      default: "",
    },

    /* Props for advanced searches */
    advancedSearchResults: {
      type: Array,
      required: true,
    },
    fetchNextPageAdvanced: {
      type: Function,
      required: true,
    },
    advancedFetchPreviousPage: {
      type: Function,
      required: true,
    },
    searchNextPageUrlAdvanced: {
      type: [String, null],
      required: true,
      default: "",
    },
    advancedPreviousPageUrl: {
      type: [String, null],
      required: true,
      default: "",
    },
  },
  computed: {
    columnWidth() {
      // calculate gallery column sizes based on device width
      const screenWidth = window.innerWidth;
      let columnWidth;

      if (screenWidth < 768) {
        columnWidth = 140; // Mobile screens
      } else if (screenWidth < 1024) {
        columnWidth = 150; // Small screens (768px to 1023px)
      } else if (screenWidth < 1600) {
        columnWidth = 150; // Medium screens (1024px to 1599px)
      } else if (screenWidth < 1800) {
        columnWidth = 150; // Large screens (1600px to 1799px)
      } else if (screenWidth < 2300) {
        columnWidth = 150; // Extra large screens (2000px to 2299px)
      } else if (screenWidth < 2600) {
        columnWidth = 200; // Larger screens (2300px to 2599px)
      } else {
        columnWidth = 250; // Very large screens (2600px and above)
      }
      return columnWidth;
    },
    totalPages() {
      return Math.ceil(this.count / 25);
    },
    currentPage() {
      if (this.nextPageUrl) {
        const url = new URL(this.nextPageUrl);
        const offset = url.searchParams.get("offset");
        return offset / 25;
      } else if (this.previousPageUrl) {
        const url = new URL(this.previousPageUrl);
        const offset = url.searchParams.get("offset");
        return offset / 25 + 2;
      } else {
        // Default to 1 if no next or previous page
        return 1;
      }
    },
  },
  data() {
    return {
      mapGallery: false,
      advancedSearch: false,
      bboxSearch: false,
      nextPageUrl: null,
      previousPageUrl: null,
      loading: false,
      layoutKey: 0,
      loadedImagesCount: 0,
      count: 0,
      imageGroups: [],
      specificOrder: [
        { type: 957, text: "ortofotografi", order: 1 },
        { type: 965, text: "översiktsbild", order: 1 },
        { type: 943, text: "threedvisualization", order: 2 },
        { type: 958, text: "threedsm", order: 3 },
        { type: 959, text: "threedlaserscanning", order: 4 },
        { type: 961, text: "miljöbild", order: 5 },
        { type: 964, text: "nattfoto", order: 6 },
        { type: 942, text: "fotografi", order: 7 },
        { type: 949, text: "diabild", order: 8 },
        { type: 947, text: "negativfärg", order: 9 },
        { type: 948, text: "negativsvart", order: 10 },
        { type: 960, text: "printscreen", order: 11 },
        { type: 956, text: "photosfm", order: 12 },
        { type: 954, text: "dstretch", order: 13 },
        { type: 941, text: "frottage", order: 14 },
        { type: 946, text: "grafik", order: 15 },
        { type: 944, text: "kalkering", order: 16 },
        { type: 951, text: "ritning", order: 17 },
        { type: 955, text: "kalkeringpapper", order: 18 },
        { type: 945, text: "avgjutning", order: 19 },
        { type: 952, text: "dokument", order: 20 },
        { type: 953, text: "karta", order: 21 },
        { type: 950, text: "tidnings", order: 22 },
        { type: 962, text: "arbetsbild", order: 23 },
      ],
    };
  },
  methods: {
    loadNextPageBbox() {
      this.fetchImagesClicked(true);
    },
    loadPreviousPageBbox() {
      this.fetchImagesClicked(false);
    },
    async fetchImagesClicked(next = true) {
      // fetch images based on the bbox
      let url;
      this.loadedImagesCount = 0;
      this.store.setLoading(true);
      if (next && this.nextPageUrl) {
        url = this.nextPageUrl;
      } else if (!next && this.previousPageUrl) {
        url = this.previousPageUrl;
      } else {
        // Initial URL or fallback
        const [minX, minY, maxX, maxY] = this.store.bboxFetch;
        url = `https://diana.dh.gu.se/api/shfa/search/image/?in_bbox=${minX},${minY},${maxX},${maxY}&depth=2`;
      }
      try {
        // Make the API call
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        this.count = data.count;

        // Process and sort the images
        let typeMap = this.specificOrder.map((order) => ({
          ...order,
          items: [],
        }));

        for (let image of data.results) {
          let type = image.type;
          let item = {
            lamning_id: image.site.lamning_id,
            raa_id: image.site.raa_id,
            placename: image.site.placename,
            askeladden_id: image.site.askeladden_id,
            lokalitet_id: image.site.lokalitet_id,
            id: image.id,
            file: image.file,
            type: image.type.id,
            iiif_file: image.iiif_file,
          };

          let typeIndex = typeMap.findIndex((x) => x.type === type.id);
          if (typeIndex !== -1) {
            typeMap[typeIndex].items.push(item);
          }

          this.imageGroups = typeMap.filter((group) => group.items.length > 0);
        }

        this.imageGroups = Array.from(typeMap.values());

        // Filter out the groups with no items and sort the image groups by the specified order
        this.nextPageUrl = data.next
          ? data.next.replace(/^http:/, "https:")
          : null;
        this.previousPageUrl = data.previous
          ? data.previous.replace(/^http:/, "https:")
          : null;

        // Update page details if needed
        this.updatePageDetails();
        this.store.setLoading(false);
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        this.store.imagesFetchTriggered = false;
      }
    },
    imageLoadLog(imageIndex, groupIndex, image) {
      if (!image.loaded) {
        this.imageLoaded(image);
      }
    },
    imageLoaded(event) {
      // used for refreshing the gallery when the images are loaded
      this.loadedImagesCount += 1;
      // Check if all images are loaded
      if (
        this.loadedImagesCount ===
        this.imageGroups.reduce((count, group) => count + group.items.length, 0)
      ) {
        this.$nextTick(() => {
          this.layoutKey += 1;
        });
      }
    },

    updatePageDetails() {
      this.$emit("page-details-updated", {
        currentPage: this.currentPage,
        totalPages: this.totalPages,
        totalResults: this.count,
      });
    },

    loadMore() {
      // load the next page for the general searches
      this.fetchNextPage();
    },

    loadPrevious() {
      // load the previous page for the general searches
      this.searchFetchPreviousPage();
    },

    loadMoreAdvanced() {
      // load the next page for the advanced searches
      this.fetchNextPageAdvanced();
    },

    loadPreviousAdvanced() {
      // load the previous page for the advanced searches
      this.advancedFetchPreviousPage();
    },

    async loadInitialData() {
      if (this.loading) {
        return;
      }
      if (this.siteId) {
        this.loading = true;
        this.items = [];
        this.nextPageUrl = `https://diana.dh.gu.se/api/shfa/image/?site=${this.siteId}`;
        await this.fetchData();
        this.loading = false;
      }
    },

    async fetchData() {
      // fetch data based on point clicked
      this.bboxSearch = false;
      if (this.nextPageUrl) {
        const separator = this.nextPageUrl.includes("?") ? "&" : "?";
        const urlWithDepth = this.nextPageUrl + separator + "depth=2";

        this.store.setLoading(true);
        this.loadedImagesCount = 0;

        let response = await fetch(urlWithDepth);
        if (!response.ok) {
          this.$emit("error", "Could not fetch data");
          return;
        }

        let data = await response.json();
        this.count = data.count; // Update the total count

        if (!data.results) {
          this.$emit("error", "No results in data");
          return;
        }

        let typeMap = this.specificOrder.map((order) => ({
          ...order,
          items: [],
        }));

        for (let image of data.results) {
          let type = image.type;
          let item = {
            lamning_id: image.site.lamning_id,
            raa_id: image.site.raa_id,
            askeladden_id: image.site.askeladden_id,
            lokalitet_id: image.site.lokalitet_id,
            placename: image.site.placename,
            id: image.id,
            file: image.file,
            type: image.type.id,
            iiif_file: image.iiif_file,
          };

          let typeIndex = typeMap.findIndex((x) => x.type === type.id);
          if (typeIndex !== -1) {
            typeMap[typeIndex].items.push(item);
          }

          // Filter out the groups with no items and sort the image groups by the specified order
          this.imageGroups = typeMap.filter((group) => group.items.length > 0);
          //.sort((a, b) => a.order - b.order);
        }

        // Convert map to array for use in template
        this.imageGroups = Array.from(typeMap.values());

        this.nextPageUrl = data.next
          ? data.next.replace("http://", "https://")
          : null;
        this.previousPageUrl = data.previous
          ? data.previous.replace("http://", "https://")
          : null;

        this.updatePageDetails();
        this.store.setLoading(false);
        this.mapGallery = true;
      }
    },

    async fetchPreviousData() {
      // fetch previous page data based on point clicked
      if (this.previousPageUrl) {
        this.store.setLoading(true);
        this.loadedImagesCount = 0;

        let response = await fetch(this.previousPageUrl);
        if (!response.ok) {
          this.$emit("error", "Could not fetch data");
          return;
        }

        let data = await response.json();

        if (!data.results) {
          this.$emit("error", "No results in data");
          return;
        }

        let typeMap = this.specificOrder.map((order) => ({
          ...order,
          items: [],
        }));

        for (let image of data.results) {
          let type = image.type;
          let item = {
            lamning_id: image.site.lamning_id,
            raa_id: image.site.raa_id,
            askeladden_id: image.site.askeladden_id,
            lokalitet_id: image.site.lokalitet_id,
            placename: image.site.placename,
            id: image.id,
            file: image.file,
            type: image.type.id,
            iiif_file: image.iiif_file,
          };

          let typeIndex = typeMap.findIndex((x) => x.type === type.id);
          if (typeIndex !== -1) {
            typeMap[typeIndex].items.push(item);
          }

          // Filter out the groups with no items and sort the image groups by the specified order
          this.imageGroups = typeMap.filter((group) => group.items.length > 0);
          //.sort((a, b) => a.order - b.order);
        }

        // Convert map to array for use in template
        this.imageGroups = Array.from(typeMap.values());

        this.nextPageUrl = data.next
          ? data.next.replace("http://", "https://")
          : null;
        this.previousPageUrl = data.previous
          ? data.previous.replace("http://", "https://")
          : null;

        this.updatePageDetails();
        this.store.setLoading(false);
        this.mapGallery = true;
      }
    },
  },
  watch: {
    "store.imagesFetchTriggered"(newVal) {
      // watch the store for when the bbox search button is clicked
      if (newVal) {
        this.nextPageUrl = null;
        this.previousPageUrl = null;
        this.fetchImagesClicked();
        this.$emit("updateShowResults", true);
        this.mapGallery = true;
        this.bboxSearch = true;
        this.loadedImagesCount = 0;

        // Reset the flag after the necessary actions are completed
        this.store.imagesFetchTriggered = false;
      }
    },
    siteId() {
      this.loadInitialData();
    },
    forceRefresh(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.loadInitialData();
      }
    },
    searchItems(newItems) {
      this.imageGroups = newItems;
      this.mapGallery = false;
      this.advancedSearch = false;
      this.bboxSearch = false;
      this.loadedImagesCount = 0;
    },
    advancedSearchResults(newItems) {
      this.imageGroups = newItems;
      this.mapGallery = false;
      this.advancedSearch = true;
      this.bboxSearch = false;
      this.loadedImagesCount = 0;
    },
  },
};
</script>

<style scoped>
.loading-animation {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding-top: 50px;
  transition: all 0.5s ease-in-out;
}

.loading-animation img {
  width: 50px;
  height: 50px;
  filter: invert(0.8);
}

.gallery-container {
  padding-top: 0px;
  margin-top: -5px;
  padding-bottom: 35px;
  /* padding-left:150px; */
}

@media (max-width: 1024px) {
  .gallery-container {
    padding-top: 0px;
    padding-bottom: 35px;
  }
}

h3 {
  font-size: 17px;
  color: var(--page-text) !important;
  margin: 20px 20px 8px 0px;
}

.card {
  background-color: transparent;
  border-radius: 2px;
  overflow: hidden;
  box-shadow: var(--shadow);
}

.card img {
  transition: all 0.2s ease-in-out;
  transform: scale(1.02);
}

.card:hover img {
  filter: brightness(90%);
  cursor: pointer;
  transform: scale(1.05);
}

.grid-item-info {
  height: 100%;
  width: 100%;
  background: var(--image-hover-background);
  color: var(--page-text);
  position: absolute;
  opacity: 0;
  transition: all 0.5s ease-in-out;
  cursor: pointer;
  padding: 0px;
}

.grid-item-info:hover {
  opacity: 0.9;
  cursor: pointer;
}

.grid-item-info-meta {
  bottom: 0px;
  position: absolute;
  padding: 10px 10px;
}

.grid-item-info-meta h5 {
  font-size: 20px;
  font-weight: 550;
  line-height: 1.5;
}

.grid-item-info-meta h6 {
  font-size: 17px;
  bottom: 0px;
  line-height: 1;
}

.loadMore {
  display: block;
  padding: 0.2em 0.5em;
  font-size: 1.2em;
  border-radius: 50%;
  cursor: pointer;
  color: var(--page-text);
  text-align: center;
  width: 35px;
  height: 35px;
  overflow: hidden;
}

.loadMore:hover {
  background-color: var(--viewer-button-hover);
}

.button-container {
  display: flex;
  justify-content: center;
}

/* Button groups */
.button-group {
  position: fixed;
  bottom: 31px;
  z-index: 999;
  pointer-events: none;
}

/* Align "Load Previous" buttons to the left */
.left {
  margin-left: -100px;
  background: url(../../interface/backbuttonwhite.png);
  background-size: 35px;
  pointer-events: auto;
}

/* Align "Load More" buttons to the right */
.right {
  margin-left: 170px;
  background: url(../../interface/nextbuttonwhite.png);
  background-size: 35px;

  pointer-events: auto;
}
</style>