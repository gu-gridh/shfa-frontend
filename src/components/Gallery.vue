<template>
  <div style="padding-top: 35px; padding-bottom: 35px;">
    <div v-for="(group, groupIndex) in imageGroups" :key="group.type">
      <h1 v-if="group.items.length > 0">{{ $t('message.' + group.text) }}</h1>
      <MasonryWall :key="layoutKey" :items="group.items" :ssr-columns="1" :column-width="columnWidth" :gap="2" class="gallery-group">
        <template #default="{ item, index }">
          <div class="grid-image card flex items-center justify-center bg-slate-50 text-black" @click="$emit('image-clicked', item.iiif_file, item.id);">
          <img :src="`${item.iiif_file}/full/300,/0/default.jpg`" 
              :alt="`Image ${index}`" 
              @load="item.loaded || imageLoadLog(index, groupIndex, item.iiif_file)"
              v-on:load.once="item.loaded = true" />
            <div class="grid-item-info">
              <div class="grid-item-info-meta">
                <h1>{{ mapGallery ? siteLamningId : item.lamning_id }}</h1>
                <h2>{{ mapGallery ? siteRaaId : item.raa_id }}</h2>
              </div>
            </div>
          </div>
        </template>
      </MasonryWall>
    </div>

      <div class="button-container">
      <!-- Previous buttons -->
      <div class="button-group">
        <button class="loadMore left" v-if="mapGallery && previousPageUrl" @click="fetchPreviousData"></button>
        <button class="loadMore left" v-if="!mapGallery && searchPreviousPageUrl && !advancedSearch" @click="searchFetchPreviousPage"></button>
        <button class="loadMore left" v-if="!mapGallery && advancedPreviousPageUrl && advancedSearch" @click="advancedFetchPreviousPage"></button>
      </div>

      <!-- Next buttons -->
      <div class="button-group">
        <button class="loadMore right" v-if="mapGallery && nextPageUrl" @click="fetchData"></button>
        <button class="loadMore right" v-if="!mapGallery && searchNextPageUrl && !advancedSearch" @click="loadMore"></button>
        <button class="loadMore right" v-if="!mapGallery && searchNextPageUrlAdvanced && advancedSearch" @click="loadMoreAdvanced"></button>
      </div>
    </div>
  </div>
</template>

<script>
import MasonryWall from '@yeger/vue-masonry-wall'

export default {
  components: {
    MasonryWall,
  },
  props: {
    siteId: {
      type: [Number, String],
      required: false,
      default: null,
    },
    siteLamningId: {
      type: String,
      required: false,
      default: null,
    },
    siteRaaId: {
      type: String,
      required: false,
      default: null,
    },
    searchItems: {
      type: Array,
      required: false,
      default: () => [],
    },
    fetchNextPage: {
      type: Function,
      required: true,
    },
    searchNextPageUrl: {
      type: [String, null],
      required: true,
      default: '',
    },
    advancedSearchResults: {
      type: Array,
      required: true,
    },
    fetchNextPageAdvanced: {
      type: Function,
      required: true,
    },
    searchNextPageUrlAdvanced: {
      type: [String, null],
      required: true,
      default: '',
    },
    searchFetchPreviousPage: {
      type: Function,
      required: true,
    },
    searchPreviousPageUrl: {
      type: [String, null],
      required: true,
      default: '',
    },
    advancedFetchPreviousPage: {
      type: Function,
      required: true,
    },
    advancedPreviousPageUrl: {
      type: [String, null],
      required: true,
      default: '',
    },
    forceRefresh: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  computed: {
  columnWidth() {
    const screenWidth = window.innerWidth;
    let columnWidth;

    if (screenWidth < 768) {
      columnWidth = 100; // Set the column width for small screens
    } else if (screenWidth < 1024) {
      columnWidth = 200; // Set the column width for medium screens
    } else {
      columnWidth = 200; // Set the column width for large screens
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
  data() {
    return {
      mapGallery: false,
      advancedSearch: false,
      nextPageUrl: null,
      previousPageUrl: null,
      loading: false, 
      layoutKey: 0,
      loadedImagesCount: 0,
      count: 0, 
      imageGroups: [],
      specificOrder: [
        { type: 957, text: 'ortofotografi', order: 1 },
        { type: 965, text: 'översiktsbild', order: 1 },
        { type: 943, text: 'threedvisualization', order: 2 },
        { type: 958, text: 'threedsm', order: 3 },
        { type: 959, text: 'threedlaserscanning', order: 4 },
        { type: 961, text: 'miljöbild', order: 5 },
        { type: 964, text: 'nattfotografering', order: 6 },
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
    }
  },
  mounted() {
    // this.loadStartPage();
  },
  methods: {
  imageLoadLog(imageIndex, groupIndex, image) {
    // console.log(`Loading image ${imageIndex} in group ${groupIndex}`);
    if (!image.loaded) {
        this.imageLoaded(image);
    }
  },
  imageLoaded(event) {
    this.loadedImagesCount += 1;
    // Check if all images are loaded
    if (this.loadedImagesCount === this.imageGroups.reduce((count, group) => count + group.items.length, 0)) {
      this.$nextTick(() => {
        this.layoutKey += 1;
      });   
    }
  },
  updatePageDetails() {
    this.$emit('page-details-updated', { currentPage: this.currentPage, totalPages: this.totalPages, totalResults: this.count });
  },
  async loadStartPage() {
      let response = await fetch('https://diana.dh.gu.se/api/shfa/compilation/1/?depth=2');
      if (!response.ok) {
        this.$emit('error', 'Could not fetch data');
        return;
      }

      let data = await response.json();

      if (!data.images) {
        this.$emit('error', 'No results in data');
        return;
      }

      // Prepare the image groups.
      let typeMap = this.specificOrder.map(order => ({
        ...order,
        items: [],
      }));

      for (let image of data.images) {
        let type = image.type;
        let item = {
          id: image.id ?? null, 
          lamning_id: image?.site?.lamning_id ?? null, 
          raa_id: image?.site?.raa_id ?? null,
          type: image?.type?.id ?? null,
          iiif_file: image.iiif_file ?? null, 
        };

      let typeIndex = typeMap.findIndex(x => x.type === type.id); 
        if (typeIndex !== -1) {
          typeMap[typeIndex].items.push(item);
        }
      }

      // Filter out the groups with no items and sort the image groups by the specified order.
      this.imageGroups = typeMap.filter(group => group.items.length > 0)
      //.sort((a, b) => a.order - b.order);
  },

    loadMore() {
      this.fetchNextPage();
    },

    loadMoreAdvanced() {
      this.fetchNextPageAdvanced();
    },

    loadPrevious() {
      this.searchFetchPreviousPage();
    },

    loadPreviousAdvanced() {
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
      if (this.nextPageUrl) {
        this.loadedImagesCount = 0;

        let response = await fetch(this.nextPageUrl)
        if (!response.ok) {
          this.$emit('error', 'Could not fetch data');
          return;
        }

        let data = await response.json()
        this.count = data.count; // Update the total count

        if (!data.results) {
          this.$emit('error', 'No results in data');
          return;
        }

        let typeMap = this.specificOrder.map(order => ({
          ...order,
          items: [],
        }));

      for (let image of data.results) {
        let type = image.type;
        let item = {
          id: image.id,
          file: image.file,
          type: image.type,
          iiif_file: image.iiif_file,
        };

      let typeIndex = typeMap.findIndex(x => x.type === type);
      if (typeIndex !== -1) {
      typeMap[typeIndex].items.push(item);
      }
  
      // Filter out the groups with no items and sort the image groups by the specified order
      this.imageGroups = typeMap.filter(group => group.items.length > 0)
      //.sort((a, b) => a.order - b.order);

      }

      // Convert map to array for use in template
      this.imageGroups = Array.from(typeMap.values());

      this.nextPageUrl = data.next ? data.next.replace('http://', 'https://') : null;
      this.previousPageUrl = data.previous ? data.previous.replace('http://', 'https://') : null;

      this.updatePageDetails();

      this.mapGallery = true;
      }
    },

    async fetchPreviousData() {
    if (this.previousPageUrl) {
      this.loadedImagesCount = 0;

      let response = await fetch(this.previousPageUrl)
      if (!response.ok) {
        this.$emit('error', 'Could not fetch data');
        return;
      }

      let data = await response.json()

      if (!data.results) {
        this.$emit('error', 'No results in data');
        return;
      }

      let typeMap = this.specificOrder.map(order => ({
        ...order,
        items: [],
      }));

      for (let image of data.results) {
        let type = image.type;
        let item = {
          id: image.id,
          file: image.file,
          type: image.type,
          iiif_file: image.iiif_file,
        };

        let typeIndex = typeMap.findIndex(x => x.type === type);
        if (typeIndex !== -1) {
        typeMap[typeIndex].items.push(item);
        }

      // Filter out the groups with no items and sort the image groups by the specified order
      this.imageGroups = typeMap.filter(group => group.items.length > 0)
      //.sort((a, b) => a.order - b.order);

      }

      // Convert map to array for use in template
      this.imageGroups = Array.from(typeMap.values());

      this.nextPageUrl = data.next ? data.next.replace('http://', 'https://') : null;
      this.previousPageUrl = data.previous ? data.previous.replace('http://', 'https://') : null;

      this.updatePageDetails();

      this.mapGallery = true;
    }
    },

  },
  watch: {
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
      this.loadedImagesCount = 0;
    },
    advancedSearchResults(newItems) {
      this.imageGroups = newItems;
      this.mapGallery = false;
      this.advancedSearch = true;
      this.loadedImagesCount = 0;
    },


  },
}
</script>

<style scoped>
h1 {
  font-size: 20px;
  color: white;
  margin: 20px 20px 10px 0px;
}


.card {
  border-radius:0px;
  overflow:hidden;
  background-color:transparent;
}

.card img {
  transition: all 0.2s ease-in-out;
  transform:scale(1.02);


}
.card:hover img {
  filter:brightness(90%);
  cursor:pointer;
  transform:scale(1.05);
}

.grid-item-info {
  height: 100%;
  width: 100%;
  background: linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.7) 100%);
  color: white;
  position: absolute;
  opacity: 0;
  transition: all 0.5s ease-in-out;
  cursor:pointer;
}

.grid-item-info:hover {
  opacity: 0.9;
  cursor:pointer;
}

.grid-item-info-meta {
  bottom: 20px;
  position: absolute;
}

.grid-item-info-meta h1 {
  font-size: 20px;
  margin-left: 20px;
  bottom: 20px;
  font-weight: 800;
}

.grid-item-info-meta h2 {
  font-size: 18px;
  margin-left: 20px;
}

.loadMore {
  display: block;
  padding: 0.2em 0.5em;
  font-size: 1.2em;
  border-radius: 50%;
  cursor: pointer;
  color: white;
  text-align: center;
  width:35px;
    height:35px;
    overflow:hidden;
  
  
}

.loadMore:hover {
  background-color: rgb(80,90,100);
}

  .button-container {
    display: flex;
    justify-content: center;
 

  
  }

  /* Button groups */
  .button-group {
    position:fixed;
    bottom:31px;
    z-index:1000;
    pointer-events:none;
  }

  /* Align "Load Previous" buttons to the left */
  .left {
    margin-left:-100px;
    background:url(../../public/interface/backbuttonwhite.png);
    background-size:35px;
  
    pointer-events:auto;
  }

  /* Align "Load More" buttons to the right */
  .right {
    margin-left:170px;
    background:url(../../public/interface/nextbuttonwhite.png);
    background-size:35px;
   
    pointer-events:auto;
  }

</style>

