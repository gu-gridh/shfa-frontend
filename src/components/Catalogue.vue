<template>
  <div class="background">
  <MasonryWall :items="items" :ssr-columns="1" :column-width="160" :gap="0" :key="siteId">
    <template #default="{ item, index }">
      <div class="grid-image card flex text-black" @click="$emit('image-clicked', item.iiif_file)">
        <img :src="`${item.iiif_file}/full/200,/0/default.jpg`" :alt="`Image ${index}`" @load="imageLoaded" />
        <div class="grid-item-info">
          <div class="grid-item-info-meta">
            <h1>{{siteRaaId}}</h1>
          </div>
        </div>
      </div>
    </template>
  </MasonryWall>
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
          this.items = data.results.map(image => ({
            file: image.file,
            iiif_file: image.iiif_file,
          }));
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
.background{
  width:100%;
  min-height:calc(100vh - 200px);
  padding:90px 0px 0px 0px;
}
.card{
  border-radius:0px;
  overflow:hidden;
  height:auto;
  color:white;
  padding:0px 0px 30px 0px;

}

.card img{

  padding:15px 15px 5px 15px;
  object-fit: cover;
width: 100%;
height: 180px;
  transition: all 0.2s ease-in-out;
  transform:scale(1.02);


}
.card:hover img{
  
  filter:brightness(90%);
  cursor:pointer;
  transform:scale(1.05);
}

.grid-item-info {
  width: 100%;
  font-size:1em;
  float:left;
  position: relative;
  cursor:pointer;
}



.grid-item-info-meta {
  margin-top: 0px;
  float:left;
}

.grid-item-info-meta h1 {
  margin-left: 15px;
  width:100%;
  float:left;
  top: 10px;
}

.grid-item-info-meta h2 {
  margin-left: 15px;
}
</style>

