<!-- ImageViewer.vue -->
<template>
  <div ref="imageViewer" class="image-viewer"></div>
</template>

<script>
import OpenSeadragon from 'openseadragon';

export default {
  props: {
    iiifFile: {
      type: String,
      required: false,
      default: null,
    },
  },
  mounted() {
    if (this.iiifFile) {
      this.initOpenSeadragon(this.iiifFile);
    }
  },
  methods: {
    initOpenSeadragon(iiifFile) {
      this.viewer = OpenSeadragon({
        element: this.$refs.imageViewer,
        prefixUrl: "/path/to/openseadragon/images/",
        tileSources: `${iiifFile}/info.json`,

      });
    },
  },
// Update this in ImageViewer.vue
watch: {
    iiifFile(newIiifFile, oldIiifFile) {
        if (newIiifFile !== oldIiifFile) {
        if (this.viewer) {
            this.viewer.destroy();
            this.viewer = null;
        }
        this.initOpenSeadragon(newIiifFile);
        }
    },
    },
};
</script>

<style scoped>
.image-viewer {
  width: auto;
  margin-left:15px;
  margin-right:20px;
  margin-top:10px;
  height: 60%;
  background-color:black;
  border-radius:8px;
  overflow:hidden;
}
</style>
