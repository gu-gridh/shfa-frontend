<template>
  <div class="privacy-container" :class="{ fullopacity: visiblePrivacy }">
    <div class="content">
      <div class="flex-machine">
        <div class="rows">
          <div class="about-article-sub" :class="{ fullopacityui: visiblePrivacy }">
            <h2>{{ $t('message.privacy') }}</h2>
            <div id="matomo-opt-out"></div>
             </div>
        </div>
     
      <button class="close-page-button" @click="$emit('close')">
        <div class="category-button" :class="{ fullopacityui: visiblePrivacy }"
          style="width:auto; padding:5px 15px; text-align: center; cursor: pointer;">{{ $t('message.close') }}</div>
      </button>
    </div> 
  </div></div>
</template>

<script lang="ts">
import Grid from '../Views/Grid.vue';

export default {
  name: "aboutprivacy",
  emits: ['close'],
  props: {
    visiblePrivacy: {
      type: Boolean,
      required: true,
    },
    currentLanguage: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.content {
  /* border:opx; */
  height: 50%;
}

li {
  list-style: inside;
  margin-left: 30px;
}

a {
  color: var(--ui-hover);
  font-weight: 400;
}

h2 {
  font-size: 115%;
  font-style: bold;
  margin-top: -10px;
  margin-bottom: 5px;
  color: var(--page-text);
  font-weight: 500;
  line-height: 1.5;
}

.privacy-container {
  position: fixed;
  color: var(--page-text);
  line-height: 1;
  width: 500px;
  height: 50%;
  overflow-y: scroll;
  min-height: 300px;
  font-size: 12px;
  z-index: 4000;
  backdrop-filter: blur(5px);
  pointer-events: none;
  transform: scale(1.5);
  translate: 0px 100px;
  transition: all 0.5s ease-in-out;
  opacity: 0.0;
  bottom: 5%;
  left: 40%;
  top: 10%;
  transform: translateY(-50%);
  background: var(--guide-page-background);
}


.fullopacity {
  /* backdrop-filter:blur(5px); */
  opacity: 1.0;
  pointer-events: auto;
  transform: scale(1.0);
  translate: -25% 25%;
  background: var(--guide-page-background);
  height: 30%;
  width: 40%;
}

.flex-machine {
  height: 30%;
  display: flex;
  flex-direction: column;
}

.rows {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  width: auto;
}

.about-main-title {
  font-family: 'Teko', sans-serif;
  margin-top: 10px;
  flex-basis: auto;
  width: 100%;
  font-size: 4em;
  line-height: 0.85;
  font-weight: 100;
  letter-spacing: -0.2px;
  text-align: center;
  color: var(--page-text);
  margin-bottom: 15px;
  transition: all 0.4s ease-in-out;
}

.about-article-sub {
  position: relative;
  float: left;
  text-align: justify;
  color: var(--page-text);
  columns: 1;
  width: 100%;
  padding: 30px 100px;
  column-gap: 30px;
  max-width: 1600px;
  font-size: 1.7em;
  font-weight: 300;
  opacity: 0.0;
  transition: all 0.4s ease-in-out;
  line-height: 1.2;
  padding-bottom: 120px !important;
}

.category-button {
  float: left;
  font-size: 1.8em;
  font-weight: 400;
  transition: all 0.4s ease-in-out;
  background-color: var(--button-background);
  padding: 8px 20px !important;
  z-index: 1000;
  opacity: 1.0;
  margin-top: 0px;
  margin-bottom: 0px;
  border-radius: 5px;
  box-shadow: var(--shadow);
}

.close-page-button {
  position: relative;
  z-index: 3000;
  /* bottom: 20px; */
  color: var(--button-text);
  width: 100%;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: end;
}

@media screen and (max-width: 900px) {

  .about-article-sub {
    font-size: 1.25em;
    -webkit-hyphens: auto;
    -ms-hyphens: auto;
    hyphens: auto;
  }
}

.about-logo-top-right {
  z-index: 1000;
  display: flex;
  pointer-events: none;
  width: 200px;
  height: 90px;
  position: absolute;
  /*background:url("../assets/shfa_logo_downscale.png");*/
  background-repeat: no-repeat;
  background-size: contain;
  top: 30px;
  right: 60px;
  opacity: 0.6;
  color: var(--page-text);
  transition: all 0.4s ease-in-out;
}

@media (max-width:480px) {
  .logo-area {
    margin-top: 20px;
  }

  #logo-about {
    width: 120px;
    height: 100px;
    margin-left: 0px;
  }

  .title {
    margin-top: 0px;
    font-size: 35px;
    padding-left: 10px;
  }

  .about-article-main {
    position: relative;
    float: left;
    text-align: center;
    color: var(--page-text);
    width: 100%;
    columns: 1;
    column-gap: 30px;
    max-width: 1600px;
    font-size: 2.0em;
    opacity: 0.0;
    padding: 0px 100px;
    transition: all 0.4s ease-in-out;
  }

  .about-article-sub {
    text-align: justify;
    columns: 1;
    width: 100%;
    padding: 30px;
    font-size: 1.2em;
    font-weight: 300;
    transition: all 0.4s ease-in-out;
    line-height: 1.2;
  }
}

.fullopacityui {
  opacity: 1.0;
}

a {
  font-weight: normal;
}
</style>