<template>
  <MasonryWall :items="items" :ssr-columns="1" :column-width="600" :gap="2" :key="siteId">
    <template #default="{ item, index }">
      <div class="grid-image card flex items-center justify-center bg-slate-50 text-black">
        <img :src="item" :alt="`Image ${index}`" />
        <div class="grid-item-info">
          <div class="grid-item-info-meta">
            <h1>{{siteRaaId}}</h1>
          </div>
        </div>
      </div>
    </template>
  </MasonryWall>
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
  },
  data() {
    return {
      items: [],
    }
  },
  computed: {
    itemsLength() {
      return this.items.length;
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      if (this.siteId) {
        fetch(`https://diana.dh.gu.se/api/shfa/image/?site=${this.siteId}`)
          .then(response => response.json())
          .then(data => {
            // Update the items array with the image URLs
            this.items = data.results.map(image => image.file);
            this.$emit('items-updated', this.itemsLength);
          })
          .catch(error => {
            console.error('Error fetching images:', error);
          });
      }
    },
  },
  watch: {
    siteId() {
      this.fetchData();
    },
  },
}
</script>

<style scoped>
.card{
  border-radius:0px;
  overflow:hidden;
}

.card img{
  transition: all 0.2s ease-in-out;
  transform:scale(1.02);

}
.card:hover img{
  
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

