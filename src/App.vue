<template>
  <div role="main">
    <Grid />
    <!-- <Footer /> -->
  </div>
</template>

<script>
import Grid from './Views/Grid.vue';
import Footer from './components/Footer.vue';

export default {
  components: { Grid, /* Footer */ },
  mounted() {
  },
};
</script>

<style>
html,
body {
  font-family: "Barlow Condensed", sans-serif !important;
  background-color: var(--theme-page-background) !important;
  color: black !important;
}

:root {
  --theme-page-background: #222222;
  --theme-footer-background: #1b1b1b;
  --theme-button-background: #686767;
  --theme-button-hover: #277994;
  --theme-page-text: white;
  --theme-button-text: white;
  --theme-highlighted-text: #56b8d9;
  --theme-popup-background: #292929;
  --theme-popup-text: white;
  --theme-map-markers: #1a094c;
  --theme-image-hover-background: linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.7) 100%);
  --theme-image-hover-text: white;
  --theme-metadata-text: white;
  --theme-notice-text: #56b8d9;
  --theme-emphasised-text: #56b8d9;
  --theme-placeholder-text: #909090;
  --theme-input-background: #1d192c;
  --theme-input-wrapper-background: linear-gradient(rgb(35, 35, 35) 0%, rgb(50, 50, 50) 100%);
  --theme-input-hover: #1a094c;
  --theme-logo-background: #1b1b1b;
  --theme-gu-logo-en: url("../src/assets/gu_logo.png");
  --theme-gu-logo-sv: url("../src/assets/gu_logo_sv.png");
  --theme-shfa-logo: url("../src/assets/shfa_logo_downscale_light.png");
  --theme-guide-page-background: #1b1b1b;
  --theme-gallery-nav-text: #5dadc8;
  --theme-gallery-nav-background: #1b1b1b99;
  --theme-link-color: #c2a6d5;
  --theme-base: black !important;
  --theme-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
  --theme-menu-background: rgba(27, 27, 27, 0.80);
  --theme-menu-shadow: inset 0rem 2rem 2rem rgba(0, 0, 0, 0.25) !important;
  --theme-overlay: rgba(0, 0, 0, 0.5);
  --theme-ui-hover: rgb(226, 206, 243);
  --theme-font: "Barlow Semi Condensed", sans-serif;
  --theme-top-button-border: white;
  --theme-viewer-button-background: #121212;
  --theme-viewer-button-hover: #1a094ccc;
  --theme-viewer-button-text: white;
  --theme-viewer-button-border: black;
  --theme-link-button: url(../../interface/linkbuttonboldwhite.png);
  --theme-info-button: url(../../interface/infobuttonboldwhite.png);
  --theme-menu-button: url(../../interface/menuwhite.png);
  --theme-close-button: url(../../interface/input-cancel-x.svg) no-repeat 50% 50%;
  --theme-fullscreen-button: url(../assets/openseadragon/expand.svg);
  --theme-zoom-in-button: url(../assets/openseadragon/plus.svg);
  --theme-zoom-out-button: url(../assets/openseadragon/minus.svg);
  --theme-previous-button: url(../assets/openseadragon/prev.png);
  --theme-next-button: url(../assets/openseadragon/next.png);
  --theme-download-button: url(public/interface/downloadwhite.png);
  --theme-search-button: url(../../interface/searchbuttonwhite.png);
  --theme-selected-option: #1193c6;
}

html[style-theme='dark'] {
  --theme-page-background: #222222;
  --theme-footer-background: #1b1b1b;
  --theme-button-background: #686767;
  --theme-button-hover: #277994;
  --theme-page-text: white;
  --theme-button-text: white;
  --theme-highlighted-text: #56b8d9;
  --theme-popup-background: #292929;
  --theme-popup-text: white;
  --theme-map-markers: #1a094c;
  --theme-image-hover-background: linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.7) 100%);
  --theme-image-hover-text: white;
  --theme-metadata-text: white;
  --theme-notice-text: #56b8d9;
  --theme-emphasised-text: #56b8d9;
  --theme-placeholder-text: #909090;
  --theme-input-background: #1d192c;
  --theme-input-wrapper-background: linear-gradient(rgb(35, 35, 35) 0%, rgb(50, 50, 50) 100%);
  --theme-input-hover: #1a094c;
  --theme-logo-background: #1b1b1b;
  --theme-gu-logo-en: url("../src/assets/gu_logo.png");
  --theme-gu-logo-sv: url("../src/assets/gu_logo_sv.png");
  --theme-shfa-logo: url("../src/assets/shfa_logo_downscale_light.png");
  --theme-guide-page-background: #1b1b1b;
  --theme-gallery-nav-text: #5dadc8;
  --theme-gallery-nav-background: #1b1b1b99;
  --theme-link-color: #c2a6d5;
  --theme-base: black !important;
  --theme-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
  --theme-menu-background: rgba(27, 27, 27, 0.80);
  --theme-menu-shadow: inset 0rem 2rem 2rem rgba(0, 0, 0, 0.25) !important;
  --theme-overlay: rgba(0, 0, 0, 0.5);
  --theme-ui-hover: rgb(226, 206, 243);
  --theme-font: "Barlow Semi Condensed", sans-serif;
  --theme-top-button-border: white;
  --theme-viewer-button-background: #121212;
  --theme-viewer-button-hover: #1a094ccc;
  --theme-viewer-button-text: white;
  --theme-viewer-button-border: black;
  --theme-link-button: url(../../interface/linkbuttonboldwhite.png);
  --theme-info-button: url(../../interface/infobuttonboldwhite.png);
  --theme-menu-button: url(../../interface/menuwhite.png);
  --theme-close-button: url(../../interface/input-cancel-x.svg) no-repeat 50% 50%;
  --theme-fullscreen-button: url(../assets/openseadragon/expand.svg);
  --theme-zoom-in-button: url(../assets/openseadragon/plus.svg);
  --theme-zoom-out-button: url(../assets/openseadragon/minus.svg);
  --theme-previous-button: url(../assets/openseadragon/prev.png);
  --theme-next-button: url(../assets/openseadragon/next.png);
  --theme-download-button: url(public/interface/downloadwhite.png);
  --theme-search-button: url(../../interface/searchbuttonwhite.png);
  --theme-selected-option: #1193c6;
}

*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  position: relative;
  font-weight: normal;
}

body {
  min-height: 100vh;
  transition: color 0.5s, background-color 0.5s;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  --theme-font: "Barlow Semi Condensed", sans-serif;
}
</style>
