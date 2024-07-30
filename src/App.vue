<template>
  <!-- Skip Link -->
  <a href="#maincontent" class="skip-link">Skip to Main Content</a>

  <div role="main">
    <!-- Main content -->
    <div id="maincontent" tabindex="-1">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
html,
body {
  font-family: "Barlow Condensed", sans-serif !important;
  background-color: black !important;
  color: white !important;
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--page-background);
  color: var(--page-text);
  padding: 8px;
  z-index: 100;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 10px;
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
