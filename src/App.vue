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
  background-color: black !important;
  color: white !important;
}

:root {
  --page-background: #0e0e0e;
  --footer-background: #1b1b1b;
  --button-background: #d6d6d6;
  --button-hover: #16739b;
  --page-text: white;
  --button-text: black;
  --highlighted-text: #82cae9;
  --popup-background: #1f1f1f;
  --popup-text: white;
  --map-markers: #0c5270eb;
  --image-hover-background: linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.7) 100%);
  --image-hover-text: white;
  --metadata-text: white;
  --notice-text: #82cae9;
  --emphasised-text: #63cefc;
  --placeholder-text: #ffffff;
  --input-background: #1d192c;
  --input-wrapper-background: #404040;
  --input-border: #a9a9a9;
  --input-hover: #1a094c;
  --logo-background: #1b1b1b;
  --gu-logo-en: url("../src/assets/gu_logo.png");
  --gu-logo-sv: url("../src/assets/gu_logo_sv.png");
  --shfa-logo: url("../src/assets/shfa_logo_downscale_light.png");
  --guide-page-background: #1b1b1b;
  --gallery-nav-text: #5dadc8;
  --gallery-nav-background: #1b1b1b99;
  --link-color: #50169b;
  --base: black !important;
  --shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
  --menu-background: rgba(6, 6, 6, 0.95);
  --menu-shadow: inset 0rem 2rem 2rem rgba(0, 0, 0, 0.25) !important;
  --overlay: rgba(0, 0, 0, 0.7);
  --ui-hover: #03a3e2;
  --font: "Barlow Semi Condensed", sans-serif;
  --top-button-border: white;
  --viewer-button-background: #121212;
  --viewer-button-hover: #16739bcc;
  --viewer-button-text: white;
  --viewer-button-border: black;
  --popup-link-button: url(../../interface/linkbuttonboldwhite.png);
  --link-button: url(../../interface/linkbuttonboldwhite.png);
  --info-button: url(../../interface/infobuttonboldwhite.png);
  --menu-button: url(../../interface/menuwhite.png);
  --close-button: url(../../interface/input-cancel-x.svg);
  --fullscreen-button: url(../assets/openseadragon/expand.svg);
  --zoom-in-button: url(../assets/openseadragon/plus.svg);
  --zoom-out-button: url(../assets/openseadragon/minus.svg);
  --previous-button: url(../assets/openseadragon/prev.png);
  --next-button: url(../assets/openseadragon/next.png);
  --download-button: url(public/interface/downloadwhite.png);
  --search-button: url(../../interface/searchbutton.png);
  --search-button-light-bkgrnd: url(../../interface/searchbutton.png);
  --search-button-dark-bkgrnd: url(../../interface/searchbuttonwhite.png);
  --selected-option: #acdaee;
  --autocomplete-background: #121212;
  --disclaimer-text: #82cae9;
  --default-gradient: linear-gradient(to right, #03a3e2e6, #7344e1cc);
  --total-results: #82cae9;
  --clickable-metadata: #abe0f9;
}

html[style-theme='dark'] {
  --page-background: #0e0e0e;
  --footer-background: #1b1b1b;
  --button-background: #d6d6d6;
  --button-hover: #16739b;
  --page-text: white;
  --button-text: black;
  --highlighted-text: #82cae9;
  --popup-background: #1f1f1f;
  --popup-text: white;
  --map-markers: #0c5270eb;
  --image-hover-background: linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.7) 100%);
  --image-hover-text: white;
  --metadata-text: white;
  --notice-text: #82cae9;
  --emphasised-text: #63cefc;
  --placeholder-text: #ffffff;
  --input-background: #1d192c;
  --input-wrapper-background: #404040;
  --input-border: #a9a9a9;
  --input-hover: #1a094c;
  --logo-background: #1b1b1b;
  --gu-logo-en: url("../src/assets/gu_logo.png");
  --gu-logo-sv: url("../src/assets/gu_logo_sv.png");
  --shfa-logo: url("../src/assets/shfa_logo_downscale_light.png");
  --guide-page-background: #1b1b1b;
  --gallery-nav-text: #5dadc8;
  --gallery-nav-background: #1b1b1b99;
  --link-color: #50169b;
  --base: black !important;
  --shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
  --menu-background: rgba(6, 6, 6, 0.95);
  --menu-shadow: inset 0rem 2rem 2rem rgba(0, 0, 0, 0.25) !important;
  --overlay: rgba(0, 0, 0, 0.7);
  --ui-hover: #03a3e2;
  --font: "Barlow Semi Condensed", sans-serif;
  --top-button-border: white;
  --viewer-button-background: #121212;
  --viewer-button-hover: #16739bcc;
  --viewer-button-text: white;
  --viewer-button-border: black;
  --popup-link-button: url(../../interface/linkbuttonboldwhite.png);
  --link-button: url(../../interface/linkbuttonboldwhite.png);
  --info-button: url(../../interface/infobuttonboldwhite.png);
  --menu-button: url(../../interface/menuwhite.png);
  --close-button: url(../../interface/input-cancel-x.svg);
  --fullscreen-button: url(../assets/openseadragon/expand.svg);
  --zoom-in-button: url(../assets/openseadragon/plus.svg);
  --zoom-out-button: url(../assets/openseadragon/minus.svg);
  --previous-button: url(../assets/openseadragon/prev.png);
  --next-button: url(../assets/openseadragon/next.png);
  --download-button: url(public/interface/downloadwhite.png);
  --search-button: url(../../interface/searchbutton.png);
  --search-button-light-bkgrnd: url(../../interface/searchbutton.png);
  --search-button-dark-bkgrnd: url(../../interface/searchbuttonwhite.png);
  --selected-option: #a6e1fa;
  --autocomplete-background: #121212;
  --disclaimer-text: #82cae9;
  --default-gradient: linear-gradient(to right, #03a3e2e6, #7344e1cc);
  --total-results: #82cae9;
  --clickable-metadata: #abe0f9;
  --overlaid-button-background: #1b1b1b;
  --underlay: black;
}

html[style-theme='light'] {
  --page-background: #ffffff;
  --footer-background: #ffffff;
  --button-background: #1e1e1e;
  --button-hover: #48a9d2;
  --page-text: black;
  --button-text: white;
  --highlighted-text: #5e527f;
  --popup-background: #1f1f1f;
  --popup-text: white;
  --map-markers: #0c5270eb;
  --image-hover-background: linear-gradient(rgba(255, 255, 255, 0.3) 30%, rgba(255, 255, 255, 0.8) 100%);
  --image-hover-text: black;
  --metadata-text: black;
  --notice-text: #82cae9;
  --emphasised-text: #244e60;
  --placeholder-text: #000000;
  --input-background: #1d192c;
  --input-wrapper-background: #e2e2e2;
  --input-border: #4f4f4f;
  --input-hover: #1a094c;
  --logo-background: #1e1e1e;
  --gu-logo-en: url("../src/assets/gu_logo.png");
  --gu-logo-sv: url("../src/assets/gu_logo_sv.png");
  --shfa-logo: url("../src/assets/shfa_logo_downscale.png");
  --guide-page-background: #ffffff;
  --gallery-nav-text: #5dadc8;
  --gallery-nav-background: #1b1b1b99;
  --link-color: #50169b;
  --base: black !important;
  --shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
  --menu-background: rgba(220, 220, 220, 0.9);
  --menu-shadow: inset 0rem 2rem 2rem rgba(0, 0, 0, 0.25) !important;
  --overlay: rgba(0, 0, 0, 0.7);
  --ui-hover: #01374c;
  --font: "Barlow Semi Condensed", sans-serif;
  --top-button-border: white;
  --viewer-button-background: #121212;
  --viewer-button-hover: #16739bcc;
  --viewer-button-text: white;
  --viewer-button-border: black;
  --popup-link-button: url(../../interface/linkbuttonwhite.png);
  --link-button: url(../../interface/linkbuttonbold.png);
  --info-button: url(../../interface/infobuttonbold.png);
  --menu-button: url(../../interface/menu.png);
  --close-button: url(../../interface/input-cancel-x.svg);
  --fullscreen-button: url(../assets/openseadragon/expand.svg);
  --zoom-in-button: url(../assets/openseadragon/plus.svg);
  --zoom-out-button: url(../assets/openseadragon/minus.svg);
  --previous-button: url(../assets/openseadragon/prev.png);
  --next-button: url(../assets/openseadragon/next.png);
  --download-button: url(public/interface/downloadwhite.png);
  --search-button: url(../../interface/searchbuttonwhite.png);
  --search-button-light-bkgrnd: url(../../interface/searchbutton.png);
  --search-button-dark-bkgrnd: url(../../interface/searchbuttonwhite.png);
  --selected-option: #062e3f;
  --autocomplete-background: #bebebe;
  --disclaimer-text: #243f4a;
  --default-gradient: linear-gradient(to right, #03a3e2e6, #7344e1cc);
  --results-text: white;
  --total-results: #82cae9;
  --clickable-metadata: #1e333c;
  --overlaid-button-background: #1b1b1b;
  --underlay: white;
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
  --font: "Barlow Semi Condensed", sans-serif;
}
</style>
