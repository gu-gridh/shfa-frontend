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
  --placeholder-text: #dcdcdc;
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
  --menu-background: rgba(27, 27, 27, 0.80);
  --menu-shadow: inset 0rem 2rem 2rem rgba(0, 0, 0, 0.25) !important;
  --overlay: rgba(0, 0, 0, 0.5);
  --ui-hover: #03a3e2;
  --font: "Barlow Semi Condensed", sans-serif;
  --top-button-border: white;
  --viewer-button-background: #121212;
  --viewer-button-hover: #16739bcc;
  --viewer-button-text: white;
  --viewer-button-border: black;
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
  --search-button-light-bkgrnd: url(../../interface/searchbutton.png);
  --search-button-dark-bkgrnd: url(../../interface/searchbuttonwhite.png);
  --selected-option: #16739b;
  --autocomplete-background: #121212;
  --disclaimer-text: #82cae9;
  --default-gradient: linear-gradient(to right, #03a3e2e6, #7344e1cc);
  --total-results: #82cae9;
  --clickable-metadata: #abe0f9;
}

html[style-theme='dark'] {
  --page-background: #222222;
  --footer-background: #1b1b1b;
  --button-background: #686767;
  --button-hover: #277994;
  --page-text: white;
  --button-text: white;
  --highlighted-text: #56b8d9;
  --popup-background: #292929;
  --popup-text: white;
  --map-markers: #1a094c;
  --image-hover-background: linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.7) 100%);
  --image-hover-text: white;
  --metadata-text: white;
  --notice-text: #56b8d9;
  --emphasised-text: #56b8d9;
  --placeholder-text: #909090;
  --input-background: #1d192c;
  --input-wrapper-background: linear-gradient(rgb(35, 35, 35) 0%, rgb(50, 50, 50) 100%);
  --input-hover: #1a094c;
  --logo-background: #1b1b1b;
  --gu-logo-en: url("../src/assets/gu_logo.png");
  --gu-logo-sv: url("../src/assets/gu_logo_sv.png");
  --shfa-logo: url("../src/assets/shfa_logo_downscale_light.png");
  --guide-page-background: #1b1b1b;
  --gallery-nav-text: #5dadc8;
  --gallery-nav-background: #1b1b1b99;
  --link-color: #c2a6d5;
  --base: black !important;
  --shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
  --menu-background: rgba(27, 27, 27, 0.80);
  --menu-shadow: inset 0rem 2rem 2rem rgba(0, 0, 0, 0.25) !important;
  --overlay: rgba(0, 0, 0, 0.5);
  --ui-hover: rgb(226, 206, 243);
  --font: "Barlow Semi Condensed", sans-serif;
  --top-button-border: white;
  --viewer-button-background: #121212;
  --viewer-button-hover: #1a094ccc;
  --viewer-button-text: white;
  --viewer-button-border: black;
  --link-button: url(../../interface/linkbuttonboldwhite.png);
  --info-button: url(../../interface/infobuttonboldwhite.png);
  --menu-button: url(../../interface/menuwhite.png);
  --close-button: url(../../interface/input-cancel-x.svg);
  --fullscreen-button: url(../assets/openseadragon/expand.svg);
  --zoom-in-button: url(../assets/openseadragon/plus.svg);
  --zoom-out-button: url(../assets/openseadragon/minus.svg);
  --previous-button: url(../assets/openseadragon/prev.png);
  --next-button: url(../../interface/nextbuttonwhite.png);
  --download-button: url(public/interface/downloadwhite.png);
  --search-button: url(../../interface/searchbuttonwhite.png);
  --selected-option: #1193c6;
  --autocomplete-background: #1b1b1b;
  --disclaimer-text: #56b8d9;
  --default-gradient: linear-gradient(to right, rgba(3, 163, 226, 0.90), rgba(115, 68, 225, 0.8));
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
