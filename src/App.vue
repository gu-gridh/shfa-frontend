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
  background-color: white !important;
  color: black !important;
}

:root {
    --theme-page-background:#222222;
    --theme-footer-background: #1b1b1b;
    --theme-button-background: #686767;
    --theme-button-hover: #236f88;
    --theme-page-text: white;
    --theme-button-text: white;
    --theme-highlighted-text: #4da5c2;
    --theme-popup-background: #292929;
    --theme-popup-text: white;
    --theme-map-markers: #271063;
    --theme-image-hover-background: linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.7) 100%);
    --theme-image-hover-text: white;
    --theme-metadata-text: white;
    --theme-notice-text: #4da5c2;
    --theme-emphasised-text: #4da5c2;
    --theme-placeholder-text: #909090;
    --theme-input-background: #1d192c;
    --theme-input-wrapper-background: linear-gradient(rgb(35, 35, 35) 0%, rgb(50, 50, 50) 100%);
    --theme-logo-background: #1b1b1b;
    --theme-gu-logo-en: url("../src/assets/gu_logo.png");
    --theme-gu-logo-sv: url("../src/assets/gu_logo_sv.png");
    --theme-shfa-logo: url("../src/assets/shfa_logo_downscale.png");
    --theme-guide-page-background: #222222b4;
    --theme-gallery-nav-text: #5dadc8;
    --theme-gallery-nav-background: #1b1b1b99;
    --theme-font: "Barlow Semi Condensed", sans-serif;
    --theme-link-button: url(../../interface/linkbuttonboldwhite.png);
    --theme-info-button: url(../../interface/infobuttonboldwhite.png);
    --theme-menu-button: url(../../interface/menu.png);
    --theme-close-button: url(../../interface/input-cancel-x.svg) no-repeat 50% 50%;
}

html[style-theme='dark'] {
    --theme-page-background:#222222;
    --theme-footer-background: #1b1b1b;
    --theme-button-background: #686767;
    --theme-button-hover: #236f88;
    --theme-page-text: white;
    --theme-button-text: white;
    --theme-highlighted-text: #4da5c2;
    --theme-popup-background: #292929;
    --theme-popup-text: white;
    --theme-map-markers: #271063;
    --theme-image-hover-background: linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.7) 100%);
    --theme-image-hover-text: white;
    --theme-metadata-text: white;
    --theme-notice-text: #4da5c2;
    --theme-emphasised-text: #4da5c2;
    --theme-placeholder-text: #909090;
    --theme-input-background: #1d192c;
    --theme-input-wrapper-background: linear-gradient(rgb(35, 35, 35) 0%, rgb(50, 50, 50) 100%);
    --theme-logo-background: #1b1b1b;
    --theme-gu-logo-en: url("../src/assets/gu_logo.png");
    --theme-gu-logo-sv: url("../src/assets/gu_logo_sv.png");
    --theme-shfa-logo: url("../src/assets/shfa_logo_downscale.png");
    --theme-guide-page-background: #222222b4;
    --theme-gallery-nav-text: #5dadc8;
    --theme-gallery-nav-background: #1b1b1b99;
    --theme-font: "Barlow Semi Condensed", sans-serif;
    --theme-link-button: url(../../interface/linkbuttonboldwhite.png);
    --theme-info-button: url(../../interface/infobuttonboldwhite.png);
    --theme-menu-button: url(../../interface/menu.png);
    --theme-close-button: url(../../interface/input-cancel-x.svg) no-repeat 50% 50%;
}

html[style-theme='light'] {
  --theme-background: #f1f1f1;
  --theme-footer-color: #c2c2c2;
  --theme-accent-color1-alpha: #11455aa1;
  --theme-accent-color2-alpha: #45256f54;
  --theme-accent-color1: #11455a;
  --theme-accent-color2: #45256f;
  --theme-text-color: black;
  --theme-button: linear-gradient(#ececec, #ececec) padding-box, linear-gradient(to right, #026288f2, #41208dae) border-box;
  --theme-popup-background: rgba(236, 236, 237, 0.75);
  --theme-gu-logo: url("../src/assets/gu_logo.png");
  --theme-shfa-logo: url("../src/assets/shfa_logo_downscale.png");
  --theme-rj-logo: url("../graphics/interface/RJ_logo_black.png");
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
