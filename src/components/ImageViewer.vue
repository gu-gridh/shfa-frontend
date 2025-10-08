<!-- ImageViewer.vue -->

<template>
  <div ref="imageViewer" class="image-viewer">

    <div class="interface-area">
      <div class="toolbar-bottom-mini">

        <a id="home" href="#home">
          <div id="Home" class="NavButton" title="Fit image to view"></div>
        </a>
        <a id="zoom-in" href="#zoom-in">
          <div id="ZoomIn" class="NavButton"></div>
        </a>
        <a id="zoom-out" href="#zoom-out">
          <div id="ZoomOut" class="NavButton"></div>
        </a>
        <a id="full-page" class="full-screen-option" href="#full-page">
          <div id="FullPage" class="NavButton"></div>
        </a>

      </div>
    </div>
    <a id="Download">
      <div id="DownloadButton" class="NavButton round-button download-button compact" title="Download image" @click="downloadImage"></div>
    </a>
  </div>
  <!-- Sidebuttons -->

  <!-- <li v-if="link_3d">
          <a id="threedViewer">
            <div id="threedViewerButton" class="NavButton" @click="open3dViewer">3D</div>
          </a>
        </li>  -->

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
        //toggles full screen and full page modes
        OpenSeadragon.supportsFullScreen = bool;
        OpenSeadragon.supportsFullPage = !bool;
      },
      async fetchImageData() {
        if (!this.iiifFile) return;

        try {
          const resp = await fetch(
            `https://shfa.dh.gu.se/api/image/?id=${encodeURIComponent(this.iiifFile)}&depth=1`
          );
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

          const first = (await resp.json()).results?.[0];
          if (!first) {
            console.warn('No image returned for', this.iiifFile);
            return;
          }
          const site = first.site ?? {};
          this.completeUrl = first.file;
          this.lamning_id = site.lamning_id ?? '';
          this.raa_id = site.raa_id ?? '';
          this.placename = site.placename ?? '';
          // this.creator = first.author?.name || 'Unknown';
          this.img_id = first.id;
          this.link_3d = !!first.group;
          this.query_3d = first.group?.text ?? null;
          const infoUrl = `${first.iiif_file}/info.json`;
          this.viewer ? this.viewer.open(infoUrl) : this.initOpenSeadragon(first.iiif_file);
          this.people = first.people?.map(people => people?.name.replace(',','').replace(', ','')).join('')
        } catch (err) {
          console.error('Fetch error:', err);
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
        const authors = this.people;
        const img_id = this.img_id;
        // const year = this.year;

        fetch(imageUrl)
          .then((response) => response.blob())
          .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            // const imgId = imageUrl.split("/").pop();
            const downloadName = `${authors}_${lamning_id || raa_id || placename
              }_SHFAid${img_id}`;
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = downloadName || "carving.jpg"; //use the extracted file name or a default
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            if (this.$matomo) { //track download with matomo if available
              this.$matomo.trackLink(imageUrl, 'download');
            }
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
          homeFillsViewer: false,
          showZoomControl: true,
          showHomeControl: true,
          //defaultZoomLevel:0.6,
          showFullPageControl: true,
          showNavigator: true,
          navigatorAutoFade: true,
          //navigatorId:   "navigator-div",
          fullPageButton: "full-page",
          zoomInButton: "zoom-in",
          zoomOutButton: "zoom-out",
          homeButton: "home",
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

  /*
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
*/

  #threedViewerButton {
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
} 

  /* .NavButton {
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
} */

.button-icon:hover {
    opacity: 1.0;
}

.round-button{
    width: 45px;
    height: 45px;
    cursor: pointer;
    position: absolute;
    left: 10px;
    background-color: rgb(0, 0, 0, 1.0) !important;
    border-radius: 50%;
    user-select: none;
    -webkit-user-select: none;
}

.round-button:hover {
    background-color: rgb(0, 0, 0, 1.0) !important;
    cursor: pointer;
    transform: scale(1.07);
}

/* 
  #FullPage:hover,
  #ZoomIn:hover,
  #ZoomOut:hover,
  #DownloadButton:hover {
    background-color: var(--viewer-button-hover);
  }
 */

  .interface-area{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: end;
    width: 100%;
    height: 100%;
    position: absolute;
    bottom: 15px;
    pointer-events: none;
    z-index: 10000;
  }

  .toolbar-bottom-mini {
    pointer-events: auto;
    display: flex;
    flex-direction: row;
    justify-content: center;
    padding-left: 6px;
    padding-right: 6px;
    width: auto;
    height: 42px;
    background-color: rgb(0, 0, 0, 0.8);
    border-radius: 8px;
    z-index: 1000;
    cursor: pointer;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    touch-action: none;
    -ms-touch-action: none;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    -webkit-tap-highlight-color: transparent;
    box-shadow: 0.0rem 0.1rem 1rem rgba(0, 0, 0, 0.3) !important;
    border-style: solid;
    border-color: grey;
    border-width: 0.5px 0px 0px 0px;
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
  }

  #DownloadButton {
  position: absolute;
  bottom: 12px;
  background: url(https://data.dh.gu.se/ui-icons/download_white.png);
  background-size: 80%;
  background-repeat: no-repeat;
  background-position: center;
  background-color: var(--viewer-button-background);
  overflow: hidden;
  cursor: pointer;
  z-index:1000;
} 


  #Home {
    background: url(https://data.dh.gu.se/ui-icons/frame_small_white.png);
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    width: 28px;
    height: 28px;
    cursor: pointer;
    overflow: hidden;
  }

  #ZoomIn {
    background: url(https://data.dh.gu.se/ui-icons/zoomin_big_white.png);
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
    width: 28px;
    height: 28px;
    cursor: pointer;
    overflow: hidden;
  }

  #ZoomOut {
    background: url(https://data.dh.gu.se/ui-icons/zoomout_big_white.png);
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
    width: 28px;
    height: 28px;
    cursor: pointer;
    overflow: hidden;
  }

  #FullPage {
    background: url(https://data.dh.gu.se/ui-icons/expand_white.svg);
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
    width: 26px;
    height: 26px;
    overflow: hidden;
    cursor: pointer;
  }

  .NavButton {
    pointer-events: auto;
    width: 35px;
    height: 35px;
    color: white;
    opacity: 0.8;
    margin-right: 6px;
    margin-left: 6px;
    margin-top: 6px;
    margin-bottom: 6px;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    opacity: 0.8;
  }

  .NavButton:hover {
    opacity: 1;
    cursor: pointer;
    background-color:transparent;
  }

  #Prev,
  #Next {
    position: relative;
    width: 25px;
    height: 15px;
    background-size: 35px !important;
    background-repeat: no-repeat;
    background-position: center;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #Prev {
    background-image: url(https://data.dh.gu.se/ui-icons/arrow_prev_white.png);
  }

  #Next {
    background-image: url(https://data.dh.gu.se/ui-icons/arrow_next_white.png);
    margin-left: 10px;
  }

  #currentpage {
    font-family: "Oswald", sans-serif !important;
    color: white;
    font-size: 0.8em !important;
    font-weight: 100;
    pointer-events: none !important;
  }

  .switch-button {
    pointer-events: auto;
    width: 35px;
    height: 35px;
    color: white;
    opacity: 0.8;
    margin-right: 8px;
    margin-left: 8px;
    margin-top: 8px;
    margin-bottom: 8px;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
  }

  .switch-button:hover {
    opacity: 1;
    cursor: pointer;
  }

  *:focus {
    outline: none !important;
  }
</style>