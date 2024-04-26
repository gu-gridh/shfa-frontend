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

  --theme-background: #222222;
  --theme-footer-color: #1b1b1b;
  --theme-accent-color1-alpha: #3BC5FCa1;
  --theme-accent-color2-alpha: #7143ad54;
  --theme-accent-color1: #3BC5FC;
  --theme-accent-color2: #7344e1;
  --theme-text-color: white;
  --theme-button: linear-gradient(#232323, #232323) padding-box, linear-gradient(to right, rgba(3, 163, 226, 0.90), rgba(115, 68, 225, 0.8)) border-box;
  --theme-popup-background: rgba(20, 20, 20, 0.95);
  --theme-gu-logo: url("src/assets/gu_logo.png");
  --theme-shfa-logo: url("../src/assets/shfa_logo_downscale.png");
  --theme-rj-logo: url("../graphics/interface/RJ_logo_white.png");
  --theme-font: "Barlow Semi Condensed", sans-serif;
}

html[style-theme='dark'] {
  --theme-background: #222222;
  --theme-footer-color: #1b1b1b;
  --theme-accent-color1-alpha: #3BC5FCa1;
  --theme-accent-color2-alpha: #7143ad54;
  --theme-accent-color1: #3BC5FC;
  --theme-accent-color2: #7344e1;
  --theme-text-color: white;
  --theme-button: linear-gradient(#232323, #232323) padding-box, linear-gradient(to right, rgba(3, 163, 226, 0.90), rgba(115, 68, 225, 0.8)) border-box;
  --theme-popup-background: rgba(20, 20, 20, 0.95);
  --theme-gu-logo: url("../src/assets/gu_logo.png");
  --theme-shfa-logo: url("../src/assets/shfa_logo_downscale.png");
  --theme-rj-logo: url("../graphics/interface/RJ_logo_white.png");
  --theme-font: "Barlow Semi Condensed", sans-serif;
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
