<!-- ImageViewer.vue -->

<template>
  <div ref="imageViewer" class="image-viewer">
    <div id="ToolbarVertical">
      <a id="full-page" href="#full-page">
        <div id="FullPage" class="NavButton"></div>
      </a>
      <a id="zoom-in" href="#zoom-in">
        <div id="ZoomIn" class="NavButton"></div>
      </a>
      <a id="zoom-out" href="#zoom-out">
        <div id="ZoomOut" class="NavButton"></div>
      </a>

    <div id="Download" class="NavButton" @click="downloadImage"></div>
 
    </div>
  </div>

  <div id="navigator-div"></div>
</template>

<script>
import OpenSeadragon from "../external/bookmark-url.js";

export default {
  props: {
    iiifFile: {
      type: Number,
      required: true,
      default: null,
    },
  },
  data() {
    return {
      completeUrl: null,
      viewer: null,
    };
  },
  mounted() {
    this.fetchImageData();
    this.toggleFullScreenPageMode(false);
  },
  methods: {
    toggleFullScreenPageMode(bool) {
      // Toggles full screen and full page modes
      OpenSeadragon.supportsFullScreen = bool;
      OpenSeadragon.supportsFullPage = !bool;
    },
    async fetchImageData() {
      if (!this.iiifFile) {
        return; 
      }
      try {
        const response = await fetch(
          `https://diana.dh.gu.se/api/shfa/image/?id=${this.iiifFile}&depth=1`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const iiifFile = data.results[0].iiif_file;
        const download = data.results[0].file;
        const lamning_id = data.results[0].site.lamning_id;
        const placename = data.results[0].site.placename;
        const creator = data.results[0].author.name;
        // const year = data.results[0].year;
        this.completeUrl = download;
        this.lamning_id = lamning_id;
        this.placename = placename;
        this.creator = creator;
        // this.year = year;

        if (this.viewer) {
          this.viewer.open(`${iiifFile}/info.json`);
        } else {
          // If viewer doesn't exist, initialize a new one
          this.initOpenSeadragon(iiifFile);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    },

     downloadImage() {
      const imageUrl = this.completeUrl; 
      const lamning_id = this.lamning_id;
      const placename = this.placename;
      const creator = this.creator.replace(', ', '_');
      // const year = this.year;


      fetch(imageUrl)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const imgId = imageUrl.split('/').pop();
          const downloadName = `${creator}_${lamning_id || placename}_SHFAid${imgId}`;
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = downloadName || 'carving.jpg'; // Use the extracted file name or a default
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        })
        .catch(() => console.error('Could not download the image'));
    },

    initOpenSeadragon(iiifFile) {
      this.viewer = OpenSeadragon({
        element: this.$refs.imageViewer,
        prefixUrl: "/path/to/openseadragon/images/",
        tileSources: `${iiifFile}/info.json`,
        immediateRender: false,
        visibilityRatio: 0.9,
        minZoomImageRatio: 0.5,
        homeFillsViewer: true,
        showZoomControl: true,
        showHomeControl: false,
        showFullPageControl: true,
        showNavigator: true,
        navigatorAutoFade: true,
        //navigatorId:   "navigator-div",
        fullPageButton: "full-page",
        zoomInButton: "zoom-in",
        zoomOutButton: "zoom-out",
      });

      this.viewer.addHandler("full-page");

      /* this.viewer.bookmarkUrl({
        trackPage: true,
      }); */
    },
  },
  watch: {
    iiifFile(newIiif, oldIiif) {
      if (newIiif !== oldIiif) {
        this.fetchImageData();
      }
    },
  },
};
</script>

<style scoped>
.image-viewer {
  width: auto;
  margin-left: 15px;
  margin-right: 30px;
  margin-top: -45px;
  height: 65%;
  background-color: black;
  border-radius: 2px;
  overflow: hidden;
  z-index: 1;
}

.image-viewer.fullpage {
    height: 100vh !important; /* Adjust as needed */
    width: 100vw !important; /* Adjust as needed */
}

#navigatorDiv {
  position: absolute;
  width: 80px;
  height: 80px;
  margin-top: 10px;
  margin-right: 10px;
}

#ToolbarHorizontal {
  position: absolute;
  display: flex;
  bottom: 10px;
  width: 100%;
  z-index: 1000;
}
#CenterNav {
  margin: auto;
}
#ToolbarHorizontal span {
  background-color: rgba(35, 35, 35, 0.6);
  color: white;
  text-align: center;
  padding: 5px 10px 5px 10px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  vertical-align: 13px;
  margin-left: 10px;
  margin-right: 10px;
}

#ToolbarVertical {
  position: absolute;
  margin-top: 0px;
  width: 40px;
  margin-left: 12px;
  z-index: 1000;
  height:100%;
}

#FullPage {
  margin-top: 70px;
  background: url(../assets/openseadragon/expand.svg);
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: center;
  background-color: rgba(0, 0, 0, 1.0);
  overflow: hidden;
  
}

button:focus {
  outline:0;
}

#Prev {
  background: url(../assets/openseadragon/prev.png);
  background-size: 35px 35px;
  background-color: rgba(0, 0, 0, 1.0);
  background-repeat: no-repeat;
  background-position: center;
  display: inline-block;
  position: relative;
}

#Next {
  background: url(../assets/openseadragon/next.png);
  background-size: 35px 35px;
  background-color: rgba(0, 0, 0, 1.0);
  background-repeat: no-repeat;
  background-position: center;
  display: inline-block;
  position: relative;
}

#ZoomIn {
  background: url(../assets/openseadragon/plus.svg);
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: center;
  background-color: rgba(0, 0, 0, 1.0);

  margin-top: 0px;

  overflow: hidden;
}

#ZoomOut {
  background: url(../assets/openseadragon/minus.svg);
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: center;
  background-color: rgba(0, 0, 0, 1.0);
  overflow: hidden;
}

#Download {
  position:absolute;
  bottom:10px;
  background: url(../../public/interface/downloadwhite.png);
  background-size: 95%;
  background-repeat: no-repeat;
  background-position: center;
  background-color: rgba(0, 0, 0, 1.0);
  cursor: pointer;
  overflow: hidden;
}
.NavButton {
  border-radius: 50%;
  width: 35px;
  height: 35px;
  color: white;
  opacity: 1.0;
  border-width: 1px;
  border-style: solid;
  border-color:rgb(50,50,50);
}
.NavButton:hover {
  opacity: 0.8;
}
</style>
