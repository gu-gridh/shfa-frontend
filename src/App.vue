<template>
  <div>
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
  background-color:white;
  color:black;
}

</style>
