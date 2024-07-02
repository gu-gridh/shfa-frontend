<template>
  <div class="guide-container" :class="{ fullopacity: visibleGuide }" id='block-text'>
    <div class="content">


      <div class="rows">


        <div class="flex-machine">
          <div class="logo-area">
            <div id="logo-guide"></div>
            <h1 class="about-title">
              <div v-html="$t('message.abouttitle')"></div>
            </h1>
          </div>

          <div class="guide-article-main" :class="{ fullopacityui: visibleGuide }" style="margin-bottom: 0px;">
            <h2>{{ $t('message.sökguide') }}</h2>
          </div>

          <div class="guide-article-main" :class="{ fullopacityui: visibleGuide }" style="padding-top:0px;">{{
    $t('search.searchintro') }} {{ $t('search.searchhelp') }}
            <p class="new-info" v-if="$i18n.locale === 'en'"> A multimodal viewer is available for a selection of meshes
              and visualisations. These are indicated by the <button class=" avail-3d">3D</button> icon in the gallery
              thumbnail and <button class="viewer-avail"><span class="viewer-icon"></span>{{
    $t('message.viewthreed') }}</button>
              button in the metadata panel. You can find these images by searching for 3d visualisation or orthophoto
              image
              types. Clicking on the button in the image viewer will open the multimodal viewer. In this new page, you
              will be able to navigate around the mesh and associated visualisations.</p>
            <p class="new-info" v-if="$i18n.locale === 'sv'"> För ett urval av meshar och visualiseringar finns ett
              utforskarläge tillgängligt. Detta indikeras av <button class=" avail-3d">3D</button> ikonen i galleriets
              miniatyrbild och <button class="viewer-avail"><span class="viewer-icon"></span>{{
    $t('message.viewthreed') }}</button> knappen i metadata-panelen. Du kan hitta dessa objekt genom att
              söka efter "3D-visualisering" eller
              "ortofoto" bildtyper. Genom att klicka på knappen öppnas utforskaren. På denna nya sida kan du navigera
              runt i meshen och dess tillhörande visualiseringar.</p>
          </div>

          <div class="guide-article-sub" :class="{ fullopacityui: visibleGuide }">
            <div class="sections"> <!-- Empty div for margin -->
              <h2>{{ $t('message.nyckelord') }}</h2>
              <div class="first">
                <section v-if="$i18n.locale === 'en'" v-for="(category, index) in groupedKeywordsEN">
                  <h3>{{ index }}</h3>
                  <div class="grouped-items">
                    <ul>
                      <li
                        v-for="(value, key) in category.sort((a, b) => { return a.english_translation.localeCompare(b.english_translation) })"
                        :key="key">
                        {{ value.english_translation }}
                      </li>
                    </ul>
                  </div>
                </section>
                <section v-else v-for="(category, index) in groupedKeywordsSV">
                  <h3>{{ index }}</h3>
                  <div class="grouped-items">
                    <ul>
                      <li v-for="(value, key) in category.sort((a, b) => { return a.text.localeCompare(b.text) })"
                        :key="key">
                        {{ value.text }}
                      </li>
                    </ul>
                  </div>
                </section>
              </div>
              <div class="second">
                <h2>{{ $t('message.bildtyp') }}</h2>
                <table>
                  <tr>
                    <th scope="col">{{ $t('message.bildtyp') }}</th>
                    <th scope="col">{{ $t('message.beskrivning') }}</th>
                  </tr>
                  <tr v-if="$i18n.locale === 'en'" v-for="(value, key) in this.$i18n.messages.en.imgdescription"
                    :key="key">
                    <td>{{ value[0] }}</td>
                    <td>{{ value[1] }}</td>
                  </tr>
                  <tr v-else v-for="(value, key_sv) in this.$i18n.messages.sv.imgdescription" :key="key_sv">
                    <td>{{ value[0] }}</td>
                    <td>{{ value[1] }}</td>
                  </tr>
                </table>
              </div>
              <div class="third">
                <h2>{{ $t('message.datering') }}</h2>
                <section>
                  <ul>
                    <li v-if="$i18n.locale === 'en'" v-for="(value, key) in sortedDatings" :key="key">
                      {{ value.english_translation }}
                    </li>
                    <li v-if="$i18n.locale === 'sv'" v-for="(value, key) in sortedDatings" :key="key">
                      {{ value.text }}
                    </li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <button class="close-page-button" @click="$emit('close')">
      <div class="category-button" :class="{ fullopacityui: visibleGuide }"
        style="width:auto; padding:5px 15px; text-align: center; cursor: pointer;">{{ $t('message.close') }}</div>
    </button>
  </div>
</template>

<script lang="ts">
import Grid from '../Views/Grid.vue';
export default {
  data() {
    return {
      data: {},
      groupedKeywordsSV: {},
      groupedKeywordsEN: {},
      sortedDatings: {},
    }
  },
  mounted() {
    this.fetchKeywords()
    this.fetchDatingTags()
  },
  methods: {
    fetchKeywords() {
      fetch(`https://diana.dh.gu.se/api/shfa/keywordtag/?depth=2&limit=200`)
        .then((response) => response.json())
        .then((json) => {
          this.data = json.results;
          this.sortedSV = this.data.sort((a, b) => { return a.category.localeCompare(b.category) })
          this.groupedKeywordsSV = Object.groupBy(this.sortedSV, ({ category }) => category)

          this.sortedEN = this.data.sort((a, b) => { return a.category_translation.localeCompare(b.category_translation) })
          this.groupedKeywordsEN = Object.groupBy(this.sortedEN, ({ category_translation }) => category_translation)
        })
        .catch((error) => {
          console.error('Error fetching keyword data:', error);
        });
    },
    fetchDatingTags() {
      fetch(`https://diana.dh.gu.se/api/shfa/datingtag/?depth=2&limit=25`)
        .then((response) => response.json())
        .then((json) => {
          this.data = json.results;
          if (this.currentLang == 'sv') {
            this.sortedDatings = this.data.sort((a, b) => { return a.text.localeCompare(b.text) })
          }

          else {
            this.sortedDatings = this.data.sort((a, b) => { return a.english_translation.localeCompare(b.english_translation) })
          }
        })
        .catch((error) => {
          console.error('Error fetching keyword data:', error);
        });
    },
  },
  name: "guideview",
  emits: ['close'],
  props: {
    currentLang: {
      type: String,
      required: true,
    },
    visibleGuide: {
      type: Boolean,
      required: true,
    },
  },
};


</script>

<style scoped>
.new-info {
  margin-top: 25px;
}

.avail-3d {
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: center;
  font-weight: 500;
  line-height: 1;
  text-align: center;
  overflow: hidden;
  cursor: pointer;
  color: var(--popup-text);
  border-radius: 50%;
  width: 25px;
  height: 25px;
  opacity: 1;
  background-color: var(--threed-icon);
  border-width: 1px;
  border-style: solid;
  border-color: var(--threed-icon);
  font-size: 80%;
  cursor: default;
}

.viewer-avail {
  /* display: relative; */
  padding: 4px 8px 4px 10px;
  color: var(--button-text);
  /* background-color: var(--button-background); */
  background-color: var(--threed-icon);
  border-radius: 8px;
  font-size: 86%;
  text-decoration: none;
  cursor: pointer;
  margin-top: 0px;
  width: max-content;
  height: max-content;
  font-weight: 400;
  /* background-image: var(--link-button);
  background-size: 20px;
  background-position: 10px 8px;
  background-repeat: no-repeat; */
}

.viewer-icon {
  display: absolute;
  float: right;
  margin-top: 3px;
  height: 20px;
  width: 20px;
  background-image: var(--popup-link-button);
  /* filter: invert(1); */
  background-size: 20px;
  background-position: center;
  background-repeat: no-repeat;
  margin-left: 10px;
  border-width: 1.4px;
  border-color: var(--button-text);
  border-radius: 50%;
}

th {
  padding-top: 10px;
  font-weight: 450;
}

td {
  padding-left: 15px;
  padding-right: 5px;
}

a {
  color: var(--ui-hover);
  font-weight: 400;
}

h2 {
  font-size: 125%;
  font-style: bold;
  /* margin-top: -10px; */
  margin-bottom: 0px;
  color: var(--highlighted-text);
  font-weight: 500;
  line-height: 1.5;
}

h3 {
  font-size: 105%;
  font-style: bold;
  margin-top: 25px;
  margin-bottom: 5px;
  color: var(--page-text);
  font-weight: 500;
  line-height: 1.2;
}

ul {
  padding-left: 20px;
}

/* .guide-article-sub h2 {
  font-size: 115%;
} */

.guide-container {
  position: fixed;
  color: var(--page-text);
  line-height: 1;
  width: 100%;
  font-size: 12px;
  z-index: 4000;
  backdrop-filter: blur(5px);
  pointer-events: none;
  transform: scale(1.5);
  translate: 0px 100px;
  transition: all 0.5s ease-in-out;
  opacity: 0.0;
  overflow-y: scroll;
  max-height: max-content;
  background: var(--guide-page-background);
}

.logo-area {
  margin-top: 30px;
  margin-bottom: 20px;
}

#logo-guide {
  position: relative;
  width: 210px;
  height: 200px;
  background-color: var(--page-text);
  float: left;
  margin-left: 80px;
  margin-top: 35px;
  background: var(--shfa-logo);
  background-repeat: no-repeat;
  background-size: contain;
  opacity: 0.7;
  transition: all 0.8s ease-in-out;
}

.flex-machine {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sections {
  float: left;
}

.first {
  width: 100%;
  columns: 1;
  column-gap: 50px;
  margin-bottom: 30px;
}

.grouped-items {
  columns: 4;
  column-gap: 20px;
  margin-bottom: 20px;
  margin-top: 5px;
}

.second {
  width: 100%;
  margin-bottom: 30px;
}

.third {
  width: 100%;
  margin-bottom: 30px;
}

.rows {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: auto;
}

.guide-main-title {
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

.guide-sub-title {
  font-family: 'Teko', sans-serif;
  margin-top: 2px;
  flex-basis: auto;
  width: 100%;
  font-size: 2.5em;
  line-height: 0.9;
  font-weight: 100;
  letter-spacing: -0.2rem;
  text-align: center;
  color: var(--page-text);
  opacity: 0.0;
  margin-bottom: 20px;
  transition: all 0.4s ease-in-out;
}

.guide-article-main {
  position: relative;
  float: left;
  text-align: justify;
  color: var(--page-text);
  width: 100%;
  columns: 1;
  column-gap: 30px;
  max-width: 1800px;
  font-size: 1.8em;
  font-weight: 300;
  line-height: 1.4;
  opacity: 0.0;
  padding: 0px 100px;
  transition: all 0.4s ease-in-out;
  margin-bottom: 30px;
}

.guide-article-sub {
  position: relative;
  float: left;
  text-align: justify;
  color: var(--page-text);
  width: 100%;
  padding: 30px 100px;
  columns: 1;
  column-gap: 20px;
  font-size: 1.6em;
  font-weight: 300;
  opacity: 0.0;
  transition: all 0.4s ease-in-out;
  line-height: 1.4;
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
  pointer-events: auto;
  position: sticky;
  z-index: 5000;
  bottom: 0px;
  top: calc(100vh - 80px);
  padding-bottom: 20px;
  color: var(--button-text);
  background: var(--footer-background);
  width: 100%;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.category-button:hover {
  background: var(--button-hover);
}

@media screen and (max-width: 1025px) {
  .columns {
    width: 100%;
  }

  .guide-article-sub {
    font-size: 1.25em;
    -webkit-hyphens: auto;
    -ms-hyphens: auto;
    hyphens: auto;
  }
}

@media (max-width:480px) {
  .content {
    width: 100%;
  }

  .logo-area {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 80px;
  }

  .guide-container .fullopacity {
    margin-top: 0px;
    margin-bottom: 0px;
  }

  #logo-guide {
    margin-left: 0px;
    margin-top: 0px;
  }

  .second tr {
    display: flex;
    justify-content: space-between;
    gap: 10%;
  }

  .second td {
    flex: 1;
    line-height: 1.4;
    padding: 5px;
    box-sizing: border-box;
  }

  .second table {
    border-collapse: separate;
    border-spacing: 0 15px;
  }

  .guide-article-main,
  .guide-article-sub,
  .first,
  .second {
    width: 100%;
    columns: 1;
  }

  .sections {
    float: none;
  }

  table {
    width: 100%;
    overflow-x: auto;
    display: block;
  }

  .guide-search {
    margin-top: 10px;
    font-size: 1em;
    overflow-x: hidden;
    word-wrap: break-word;
  }

  .logo-area {
    margin-top: 20px;
  }

  #logo-guide {
    width: 120px;
    height: 100px;
    margin-left: 10px;
  }

  .title {
    margin-top: 0px;
    font-size: 35px;
    padding-left: 10px;
  }

  .guide-article-main {
    width: 100%;
    columns: 1;
    column-gap: 0px;
    opacity: 0.0;
    padding: 10px 30px;
    transition: all 0.4s ease-in-out;
    font-size: 115%;
    margin-top: -10px;
    margin-bottom: 5px;
    line-height: 1.3;

  }

  .guide-article-sub {
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

a {
  font-weight: normal;
}

.fullopacity {
  /* backdrop-filter:blur(5px); */
  opacity: 1.0;
  pointer-events: auto;
  transform: scale(1.0);
  translate: 0px 0px;
  background: var(--guide-page-background);
  height: 100vh;
}

.fullopacityui {
  opacity: 1.0;
}
</style>