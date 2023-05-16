<template>
  <div>
    <MasonryWall :items="items" :ssr-columns="1" :column-width="200" :gap="2">
      <template #default="{ item, index }">
        <div :key="itemKey(item, index)" class="grid-image card flex items-center justify-center bg-slate-50 text-black"  @click="$emit('image-clicked', item.iiif_file);">
          <img :src="item.file" :alt="`Image ${index}`" />
          <div class="grid-item-info">
            <div class="grid-item-info-meta">
              <h1>{{siteRaaId}}</h1>
            </div>
          </div>
        </div>
      </template>
    </MasonryWall>
    <button v-if="nextPageUrl" @click="fetchData">Load More</button>
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
      type: Number,
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
  },
  data() {
    return {
      items: [],
      nextPageUrl: null,
      loading: false, 
    }
  },
  computed: {
    itemsLength() {
      return this.items.length;
    },
    key() {
      return `${this.siteId}-${this.itemsLength}`;
    }
  },
  mounted() {
    this.loadInitialData();
  },
  methods: {

     itemKey(item, index) {
      return `${item.file}-${index}`;
    },

    async loadInitialData() {
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

        let response = await fetch(this.nextPageUrl)
        if (!response.ok) {
          // handle error, maybe emit an event
          this.$emit('error', 'Could not fetch data');
          return;
        }

        let data = await response.json()

        if (!data.results) {
          // handle error, maybe emit an event
          this.$emit('error', 'No results in data');
          return;
        }

        let newItems = data.results.map(image => ({
          file: image.file,
          iiif_file: image.iiif_file,
        }));

        // Create a new array by spreading the existing items and the new items
        this.items = [...this.items, ...newItems];

        this.nextPageUrl = data.next ? data.next.replace('http://', 'https://') : null;
        this.$emit('items-updated', this.items.length);
      }
    },
  },
  watch: {
    siteId() {
      this.loadInitialData();
    },
    searchItems(newItems) {
      this.items = newItems;
    },
  },
}
</script>

<style scoped>
.card {
  border-radius:0px;
  overflow:hidden;
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
  margin-left: 30px;
}
</style>

