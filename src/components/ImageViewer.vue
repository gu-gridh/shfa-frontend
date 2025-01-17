<!-- ImageViewer.vue -->

<template>
  <div ref="imageViewer" class="image-viewer">
    <div id="ToolbarVertical">
      <ul>
        <li>
          <a id="full-page" href="#full-page">
            <div id="FullPage" class="NavButton"></div>
          </a>
        </li>
        <li>
          <a id="zoom-in" href="#zoom-in">
            <div id="ZoomIn" class="NavButton"></div>
          </a>
        </li>
        <li>
          <a id="zoom-out" href="#zoom-out">
            <div id="ZoomOut" class="NavButton"></div>
          </a>
        </li>
        <li>
          <a id="Download">
            <div id="DownloadButton" class="NavButton" @click="downloadImage"></div>
          </a>
        </li>
        <!-- <li v-if="link_3d">
          <a id="threedViewer">
            <div id="threedViewerButton" class="NavButton" @click="open3dViewer">3D</div>
          </a>
        </li> -->
      </ul>
    </div>
  </div>
  <!-- <div id="navigator-div"></div> -->
</template>

<script>
import OpenSeadragon from "../external/bookmark-url.js";

export default {
  props: {
    iiifFile: {
      type: String,
      required: true,
      default: '',
    },
  },
  data() {
    return {
      completeUrl: null,
      viewer: null,
      link_3d: false,
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
        const raa_id = data.results[0].site.raa_id;
        const placename = data.results[0].site.placename;
        const creator = data.results[0].author?.name || 'Unknown';
        const img_id = data.results[0].id;
        const threed_available = data.results[0].group;
        // const year = data.results[0].year;
        this.link_3d = threed_available ? true : false;
        this.query_3d = threed_available ? data.results[0].group.text : null;
        this.completeUrl = download;
        this.lamning_id = lamning_id;
        this.raa_id = raa_id;
        this.placename = placename;
        this.creator = creator;
        this.img_id = img_id;
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

    open3dViewer() {
      const threedUrl = `https://shfa.dh.gu.se/viewer/?q=${this.query_3d}/mesh`;
      window.open(threedUrl, "_blank");
    },
    downloadImage() {
      const imageUrl = this.completeUrl;
      const lamning_id = this.lamning_id;
      const raa_id = this.raa_id;
      const placename = this.placename;
      const creator = this.creator.replace(", ", "_");
      const img_id = this.img_id;
      // const year = this.year;

      fetch(imageUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const imgId = imageUrl.split("/").pop();
          const downloadName = `${creator}_${lamning_id || raa_id || placename
            }_SHFAid${img_id}`;
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          a.download = downloadName || "carving.jpg"; // Use the extracted file name or a default
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        })
        .catch(() => console.error("Could not download the image"));
    },

    initOpenSeadragon(iiifFile) {
      this.viewer = OpenSeadragon({
        element: this.$refs.imageViewer,
        prefixUrl: "/path/to/openseadragon/images/",
        tileSources: `${iiifFile}/info.json`,
        immediateRender: false,
        visibilityRatio: 0.6,
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
a:visited {
  outline: none;
}

a:focus {
  outline: none;
}

a:active {
  outline: none;
}

.image-viewer {
  width: auto;
  margin-left: 25px;
  margin-right: 30px;
  margin-top: -45px;
  height: 65%;
  background-color: var(--page-background-accent);
  border-radius: 2px;
  overflow: hidden;
  z-index: 1;
}

@media (max-width: 600px) {
  .image-viewer {
    margin-left: 0px;
    margin-right: 0px;
    padding: 0px;
    width: 100%;
  }
}

.image-viewer.fullpage {
  height: 100vh !important;
  width: 100vw !important;
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
  background-color: var(--viewer-button-background);
  color: var(--page-text);
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
  height: 100%;
  outline: none;
}

#FullPage {
  margin-top: 70px;
  background: url(../assets/openseadragon/expand.svg);
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: center;
  background-color: var(--viewer-button-background);
  overflow: hidden;
  outline: none;
}

#FullPage:focus {
  outline: none;
}

#Prev {
  background: url(../assets/openseadragon/prev.png);
  background-size: 35px 35px;
  background-color: var(--viewer-button-background);
  background-repeat: no-repeat;
  background-position: center;
  display: inline-block;
  position: relative;
}

#Next {
  background: url(../assets/openseadragon/next.png);
  background-size: 35px 35px;
  background-color: var(--viewer-button-background);
  background-repeat: no-repeat;
  background-position: center;
  display: inline-block;
  position: relative;
}

#ZoomIn {
  background-image: url(../assets/openseadragon/plus.svg);
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: center;
  background-color: var(--viewer-button-background);
  margin-top: 0px;
  overflow: hidden;
}

#ZoomOut {
  background: url(../assets/openseadragon/minus.svg);
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: center;
  background-color: var(--viewer-button-background);
  overflow: hidden;
}

#DownloadButton {
  position: relative;
  top: 10px;
  background: url(/interface/downloadwhite.png);
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: center;
  background-color: var(--viewer-button-background);
  overflow: hidden;
  cursor: pointer;
}

/* #threedViewerButton {
  position: relative;
  top: 30px;
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: center;
  background-color: var(--viewer-button-background);
  border-color: var(--button-background-accent);
  border-width: 2px;
  font-weight: 600;
  line-height: 2;
  text-align: center;
  overflow: hidden;
  cursor: pointer;
  color: var(--popup-text);
} */

.NavButton {
  border-radius: 50%;
  width: 35px;
  height: 35px;
  color: var(--page-text);
  opacity: 1;
  background-color: var(--viewer-button-background);
  border-width: 1px;
  border-style: solid;
  border-color: var(--viewer-button-border);
}

.NavButton:hover {
  opacity: 0.85;
}

#FullPage:hover,
#ZoomIn:hover,
#ZoomOut:hover,
#DownloadButton:hover {
  background-color: var(--viewer-button-hover);
}
</style>
