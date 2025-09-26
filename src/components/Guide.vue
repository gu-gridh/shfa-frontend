<template>
  <div class="guide-container fullopacityui" id='block-text'>
    <div class="content">
      <div class="rows">
        <div class="flex-machine">
          <div class="settings-menu">
            <div class="version-badge">Version 1.3</div>
            <div class="top-button" @click="toggleLanguage" id="language-button">
              {{ currentLang == 'sv' ? 'English' : 'Svenska' }}
            </div>
            <div class="top-button" @click="toggleColour">
              <div id="colour-mode" class="material-symbols-outlined">
                {{ currentColour == 'light' ? 'dark_mode' : 'light_mode' }}
              </div>
            </div>
          </div>
          <div class="logo-area">
            <div id="logo-guide"></div>

            <h1 class="about-title" v-html="$t('message.abouttitle')"></h1>

          </div>


          <div class="guide-article-main fullopacityui" style="margin-bottom: 0px;">
            <h2>{{ $t('message.sökguide') }}</h2>
          </div>

          <div class="guide-article-main fullopacityui" style="padding-top:0px;">{{
            $t('search.searchintro') }} {{ $t('search.searchhelp') }}
            <p class="new-info" v-if="currentLang === 'en'"> A multimodal viewer is available for a selection of meshes
              and visualisations. These are indicated by the <button class=" avail-3d">3D</button> icon in the gallery
              thumbnail and <button class="viewer-avail"><span class="viewer-icon"></span>{{
                $t('message.viewthreed') }}</button>
              button in the metadata panel. You can find these images by searching for 3d visualisation or orthophoto
              image
              types. Clicking on the button in the image viewer will open the multimodal viewer. In this new page, you
              will be able to navigate around the mesh and associated visualisations.</p>
            <p class="new-info" v-if="currentLang === 'sv'"> För ett urval av meshar och visualiseringar finns ett
              utforskarläge tillgängligt. Detta indikeras av <button class=" avail-3d">3D</button> ikonen i galleriets
              miniatyrbild och <button class="viewer-avail"><span class="viewer-icon"></span>{{
                $t('message.viewthreed') }}</button> knappen i metadata-panelen. Du kan hitta dessa objekt genom att
              söka efter "3D-visualisering" eller
              "ortofoto" bildtyper. Genom att klicka på knappen öppnas utforskaren. På denna nya sida kan du navigera
              runt i meshen och dess tillhörande visualiseringar.</p>
          </div>

          <div class="guide-article-sub fullopacityui">
            <div class="sections"> <!-- Empty div for margin -->
              <h2>{{ $t('message.nyckelord') }}</h2>
              <div class="first">
                <section v-if="currentLang === 'en'" v-for="(category, index) in groupedKeywordsEN">
                  <button @click="logMetaSearch(index)">
                    <h3>{{ index }}</h3>
                  </button>
                  <div class="grouped-items">
                    <ul>
                      <li
                        v-for="(value, key) in category.sort((a, b) => { return a.english_translation.localeCompare(b.english_translation) })"
                        :key="key">
                        <button @click="logMetaSearch(value.english_translation)">{{ value.english_translation
                        }}</button>
                      </li>
                    </ul>
                  </div>
                </section>
                <section v-else v-for="(category, index) in groupedKeywordsSV">
                  <button @click="logMetaSearch(index)">
                    <h3>{{ index }}</h3>
                  </button>
                  <div class="grouped-items">
                    <ul>
                      <li v-for="(value, key) in category.sort((a, b) => { return a.text.localeCompare(b.text) })"
                        :key="key">
                        <button @click="logMetaSearch(value.text)">{{ value.text }}</button>
                      </li>
                    </ul>
                  </div>
                </section>
              </div>
              <div class="second">
                <h2>{{ $t('message.bildtyp') }}</h2>
                <table>
                  <thead>
                    <tr>
                      <th scope="col">{{ $t('message.bildtyp') }}</th>
                      <th scope="col">{{ $t('message.beskrivning') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="currentLang === 'en'" v-for="(value, key) in sortedImageTypes" :key="key">
                      <td><button @click="logMetaSearch(value.english_translation)">{{ value.english_translation
                          }}</button></td>
                      <td>{{ value.english_description }}</td>
                    </tr>
                    <tr v-if="currentLang === 'sv'" v-for="(value, key) in sortedImageTypes" :key="key">
                      <td><button @click="logMetaSearch(value.text)">{{ value.text }}</button></td>
                      <td>{{ value.description }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="third">
                <h2>{{ $t('message.datering') }}</h2>
                <section>
                  <ul>
                    <li v-if="currentLang === 'en'" v-for="(value, key) in sortedDatings" :key="key">
                      <button @click="logMetaSearch(value.english_translation)">{{ value.english_translation }}</button>
                    </li>
                    <li v-if="currentLang === 'sv'" v-for="(value, key) in sortedDatings" :key="key">
                      <button @click="logMetaSearch(value.text)">{{ value.text }}</button>
                    </li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    currentLanguage: String,
    currentColourMode: String,
  },
  data() {
    return {
      data: {},
      groupedKeywordsSV: {},
      groupedKeywordsEN: {},
      sortedDatings: {},
      sortedImageTypes: {},
      currentLang: this.$props.currentLanguage,
      currentColour: this.$props.currentColourMode,
      targetTheme: this.$props.currentColourMode,

    }
  },
  mounted() {
    // const userLang = localStorage.getItem('userLang') || 'sv';
    this.$i18n.locale = this.currentLang;
    document.documentElement.setAttribute('style-theme', this.targetTheme);

    this.fetchKeywords()
    this.fetchImageTypes()
    this.fetchDatingTags()

  },
  methods: {
    toggleLanguage() {
      this.currentLang = (this.$i18n.locale === "en") ? "sv" : "en";
      this.$i18n.locale = this.currentLang;
      localStorage.setItem('userLang', this.currentLang);
    },
    toggleColour() {
      this.currentColour = (this.currentColour === 'dark') ? 'light' : 'dark';
      this.targetTheme = (this.targetTheme === 'dark') ? 'light' : 'dark';
      document.documentElement.setAttribute('style-theme', this.targetTheme);
      localStorage.setItem('userColour', this.currentColour);
      return this.currentColour && this.targetTheme;
    },
    logMetaSearch(item) {
      localStorage.setItem('searchKeyword', item);
    },
    closeGuide() {
      this.$router.push('/');
    },
    fetchKeywords() {
      fetch(`https://diana.dh.gu.se/api/shfa/keywordtag/?depth=2&limit=200`)
        .then((response) => response.json())
        .then((json) => {
          this.data = json.results;
          this.data_clean = this.data.map(a => a.category && a.category_translation ? a : Object.assign(a, { "category": "Okategoriserade", "category_translation": "Uncategorised" })) //handle keywords with null category
          this.sortedSV = this.data_clean.sort((a, b) => { return a.category.localeCompare(b.category) })
          this.groupedKeywordsSV = Object.groupBy(this.sortedSV, ({ category }) => category)
          this.sortedEN = this.data_clean.sort((a, b) => { return a.category_translation.localeCompare(b.category_translation) })
          this.groupedKeywordsEN = Object.groupBy(this.sortedEN, ({ category_translation }) => category_translation)
        })
        .catch((error) => {
          console.error('Error fetching keyword data:', error);
        });
    },
    fetchImageTypes() {
      fetch(`https://diana.dh.gu.se/api/shfa/imagetypetag/?depth=1&limit=30`)
        .then((response) => response.json())
        .then((json) => {
          this.data = json.results;
          if (this.currentLang === 'sv') {
            this.sortedImageTypes = this.data.sort((a, b) => { return a.text.localeCompare(b.text) })
          }
          else {
            this.sortedImageTypes = this.data.sort((a, b) => { return a.english_translation.localeCompare(b.english_translation) })
          }
        })
        .catch((error) => {
          console.error('Error fetching keyword data:', error);
        });
    },
    fetchDatingTags() {
      fetch(`https://diana.dh.gu.se/api/shfa/datingtag/?depth=2&limit=30`)
        .then((response) => response.json())
        .then((json) => {
          this.data = json.results;
          if (this.currentLang === 'sv') {
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
};


</script>

<style scoped>
.settings-menu {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 5000;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 12px 24px;
  font-size: 1.2rem;
  font-weight: 400;
  color: var(--settings-text);
  cursor: default;
}

.top-button {
  width: max-content;
  height: 32px;
  line-height: 32px;
  float: right;
  text-align: left;
  margin-left: 0;
  padding: 0 10px;
  border-radius: 8px;
  cursor: pointer;
}

.top-button:hover {
  background-color: var(--button-hover-light);
}

.material-symbols-outlined {
  font-variation-settings:
    'FILL' 100,
    'wght' 200,
    'GRAD' 0,
    'opsz' 24;
  padding: 1px;
  color: var(--settings-text);
  cursor: pointer;
}

.version-badge {
  line-height: 1.5;
  margin: 0;
  position: fixed;
  left: 12px;
  z-index: 5001;
  font-size: 15px;
  color: var(--settings-text);
  padding: 12px 24px;
  border-radius: 6px;
  background: transparent;
}

.logo-area {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin: 24px 0 40px;
  width: 100%;
  padding: 0;
}

#logo-guide {
  position: relative;
  width: 210px;
  height: 200px;
  background: var(--shfa-logo);
  background-repeat: no-repeat;
  background-size: contain;
  opacity: 0.7;
  transition: all 0.8s ease-in-out;
}

td>button:hover,
li>button:hover {
  color: var(--highlighted-text);
}

button>h3:hover {
  color: var(--highlighted-text);
}

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
  cursor: text;
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
}

.viewer-avail {
  padding: 4px 8px 4px 10px;
  color: var(--button-text);
  background-color: var(--threed-icon);
  border-radius: 8px;
  font-size: 86%;
  text-decoration: none;
  cursor: text;
  margin-top: 0px;
  width: max-content;
  height: max-content;
  font-weight: 400;
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
  cursor: text;
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
  padding: 80px 0 0;
  position: fixed;
  color: var(--page-text);
  line-height: 1;
  width: 100%;
  height: 100vh;
  font-size: 12px;
  z-index: 4000;
  backdrop-filter: blur(5px);
  pointer-events: auto;
  transition: all 0.5s ease-in-out;
  opacity: 0.0;
  overflow-y: auto;
  max-height: max-content;
  background: var(--guide-page-background);
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
  top: auto;
  width: 100%;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  background: var(--footer-background);
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
  .logo-area {
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    padding-left: 0;
  }

  #logo-guide {
    width: 120px;
    height: 100px;
    margin-right: 10px;
    margin-left: 0px;
    margin-top: 0px;
  }

  .avail-3d {
    font-size: 95%;
  }

  .viewer-avail {
    line-height: 1.75;
    font-size: 95%;
  }

  .about-title {
    margin-top: 0px;
    font-size: 35px;
    padding-left: 10px;
  }

  .grouped-items {
    columns: 2;
  }

  .close-page-button {
    pointer-events: auto;
    position: sticky;
    z-index: 5000;
    /* bottom: 30px; */
    top: calc(100vh - 80px);
    /* padding-bottom: 20px; */
    color: var(--button-text);
    background: var(--footer-background);
    width: 100%;
    height: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
  }

  .guide-container {
    position: fixed;
    color: var(--page-text);
    line-height: 1;
    width: 100%;
    height: 100%;
    font-size: 12px;
    z-index: 4000;
    backdrop-filter: blur(5px);
    pointer-events: auto;
    transition: all 0.5s ease-in-out;
    opacity: 0.0;
    overflow-y: scroll;
    max-height: max-content;
    background: var(--guide-page-background);
  }

  .content {
    width: 100%;
  }

  .guide-container .fullopacity {
    margin-top: 0px;
    margin-bottom: 0px;
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
  background: var(--guide-page-background);
  height: 100vh;
}

.fullopacityui {
  opacity: 1.0;
}
</style>