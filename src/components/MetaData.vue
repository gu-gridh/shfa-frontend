<template>
  <div class="metadata-text">
    <div class="metadata-panel">

      <div class="metadata-panel-title">

        <h1 v-if="!data.site?.internationl_site">
          <span v-if="data.site?.lamning_id" @click="logMetaSearch(data.site.lamning_id)">{{
            data.site.lamning_id}}</span>
          <span v-if="data.site?.lamning_id && data.site?.raa_id"> | </span>
          <span v-if="data.site?.raa_id" @click="logMetaSearch(data.site.raa_id)">{{ data.site.raa_id }}</span>
        </h1>
        <h1 v-if="data.site?.internationl_site" @click="logMetaSearch(data.site.placename)"> {{ data.site.placename }}
        </h1>
        <div v-if="data.site && data.group" class="button-container">
          <button class="viewer-button" @click="open3dViewer(data.group.text)"><span class="viewer-icon"></span>{{
            $t('message.viewthreed') }}</button>

        </div>
      </div>

      <div class="metadata-container">
        <div class="metadata-item-container" v-if="data.site && data.site.lokalitet_id">
          <div class="tag-label">{{ $t('message.lokalitetid') }}</div>
          <div class="theme-color-text info-label" @click="logMetaSearch(data.site.lokalitet_id)">{{
            data.site.lokalitet_id }}</div>
        </div>

        <div class="metadata-item-container" v-if="data.site && data.site.askeladden_id">
          <div class="tag-label">{{ $t('message.askeladdenid') }}</div>
          <div class="theme-color-text info-label" @click="logMetaSearch(data.site.askeladden_id)">{{
            data.site.askeladden_id }}</div>
        </div>

        <div class="metadata-item-container" v-if="data.type && data.type.text">
          <div class="tag-label">{{ $t('message.typ') }}</div>
          <div class="theme-color-text info-label" v-if="$i18n.locale === 'sv'" @click="logKeyword(data.type.text)">
            {{ data.type.text }}</div>
          <div class="theme-color-text info-label" v-if="$i18n.locale === 'en'"
            @click="logKeyword(data.type.english_translation)">
            {{ data.type.english_translation }}</div>
        </div>

        <div class="metadata-item-container" v-if="data.subtype && data.subtype.text">
          <div class="tag-label">{{ $t('message.subtype') }}</div>
          <div class="theme-color-text info-label not-clickable" v-if="$i18n.locale === 'sv'">
            {{ data.subtype.text }}</div>
          <div class="theme-color-text info-label not-clickable" v-if="$i18n.locale === 'en'">
            {{ data.subtype.english_translation }}</div>
        </div>

        <div class="metadata-item-container">
          <div class="tag-label">{{ $t('message.author') }}
          </div>
          <div class="theme-color-text info-label" v-if="data.people && data.people.length > 0"
            v-for="(person, index) in data.people" :key="index" @click="logMetaSearch(person.name)">
            {{ person.name }}
          </div>
          <div class="theme-color-text info-label"
            v-if="data.people && data.people.length === 0 && $i18n.locale === 'sv'"
            @click="logMetaSearch(data.author.name)">
            {{ data.author.name || 'Unknown' }}
          </div>
          <div class="theme-color-text info-label"
            v-if="data.people && data.people.length === 0 && $i18n.locale === 'en'"
            @click="logMetaSearch(data.author.english_translation)">
            {{ data.author.english_translation || 'Unknown' }}
          </div>
        </div>

        <div class="metadata-item-container" v-if="data.institution && data.institution.name">
          <div id="metadata-item">
            <div class="tag-label">Institution
            </div>
            <div class="theme-color-text info-label" @click="logMetaSearch(data.institution.name)"> {{
              data.institution.name }}
            </div>
          </div>
        </div>

        <div class="metadata-item-container" v-if="data.year">
          <div class="tag-label">{{ $t('message.år') }}</div>
          <div class="theme-color-text info-label not-clickable"> {{ data.year }}
          </div>
        </div>

        <div class="metadata-item-container" v-if="data.rock_carving_object && data.rock_carving_object.name">
          <div class="tag-label">{{
            $t('message.ristning') }}
          </div>
          <div class="theme-color-text info-label" @click="logMetaSearch(data.rock_carving_object.name)"> {{
            data.rock_carving_object.name }}
          </div>
        </div>

        <div class="metadata-item-container" v-if="data.collection && data.collection.name">
          <div id="metadata-item">
            <div class="tag-label">{{
              $t('message.collection') }}
            </div>
            <div class="theme-color-text info-label" @click="logMetaSearch(data.collection.name)"> {{
              data.collection.name }}
            </div>
          </div>
        </div>
      </div>

      <div class="metadata-container" v-if="data.site && data?.type.id == 943">
        <div class="tag-label">{{ $t('message.visualisation') }}</div>
        <div class="metadata-item-container-1col">
          <div class="general-text"
            v-if="data?.subtype?.id !== 17 && data?.subtype?.id !== 18 && $i18n.locale === 'en'">
            The visualisation was generated using the<a href="https://tvt.dh.gu.se" target="_blank"> Topography
              Visualisation Toolbox (TVT)</a>.</div>
          <div class="general-text"
            v-if="data?.subtype?.id !== 17 && data?.subtype?.id !== 18 && $i18n.locale === 'sv'">
            Visualiseringen genererades med <a href="https://tvt.dh.gu.se" target="_blank"> Topography
              Visualisation Toolbox (TVT)</a>.</div>
          <div class="general-text" v-if="data?.subtype?.id == 17 && $i18n.locale === 'en'">
            The visualisation was generated using the Digital Frottage workflow in <a
              href="https://www.sciencedirect.com/science/article/pii/S2352409X19302329" target="_blank">Horn et al.
              (2019)</a></div>
          <div class="general-text" v-if="data?.subtype?.id == 17 && $i18n.locale === 'sv'">
            Visualiseringen genererades med Digital Frottage-arbetsflödet i <a
              href="https://www.sciencedirect.com/science/article/pii/S2352409X19302329" target="_blank"> Horn et al.
              (2019)</a></div>
        </div>
      </div>

      <div class="metadata-container" v-if="data.site">
        <div class="tag-label">{{ $t('message.reference') }}</div>
        <div class="metadata-item-container-1col">
          <div class="general-text" v-if="data.site && $i18n.locale === 'en'">{{ formattedPeopleEN ||
            data.author.english_translation }}. ({{
              data.year || 'n.d.' }}). {{ data.type.english_translation }} {{ $t('message.av') }} {{
              data.site.lamning_id
              || data.raa_id || data.site.placename }}, SHFA, {{ $t('message.åtkomst') }} {{ acc_date }}
            {{ $t('message.at') }} https://shfa.dh.gu.se/image/{{ data.id }}</div>
          <div class="general-text" v-if="data.site && $i18n.locale === 'sv'">{{ formattedPeopleSV ||
            data.author?.name
            }}.
            ({{
              data.year || 'n.d.'
            }}).
            {{ data.type.text }} {{ $t('message.av') }} {{ data.site.lamning_id || data.raa_id ||
              data.site.placename }}, SHFA, {{ $t('message.åtkomst') }} {{ acc_date }} {{ $t('message.at')
            }}
            https://shfa.dh.gu.se/image/{{ data.id }}</div>
        </div>
      </div>
      <div class="metadata-container" v-if="data.site">
        <div class="tag-label">{{ $t('message.keywords') }}</div>
        <div class="metadata-item-container-1col">
          <div class="keywords"> <!-- Empty div for margin -->
            <div v-if="data.keywords && this.$i18n.locale === 'sv'" v-for="(category, index) in groupedKeywordsSV">
              <button v-if="data.keywords && this.$i18n.locale === 'sv'" class="keyword-button" :key="index"
                @click="logKeyword(index)"> {{ index }}
              </button>
              <button v-if="data.keywords && this.$i18n.locale === 'sv'" class="keyword-button"
                v-for="(keyword, index) in category.sort((a, b) => { return a.text.localeCompare(b.text) })"
                :key="index" @click="logKeyword(keyword.text)"> {{ keyword.text }}
              </button>
            </div>
            <div v-if="data.keywords && this.$i18n.locale === 'en'" v-for="(category, index) in groupedKeywordsEN">
              <button v-if="data.keywords && this.$i18n.locale === 'en'" class="keyword-button" :key="index"
                @click="logKeyword(index)"> {{ index }}
              </button>
              <button v-if="data.keywords && this.$i18n.locale === 'en'" class="keyword-button"
                v-for="(keyword, index) in category.sort((a, b) => { return a.english_translation.localeCompare(b.english_translation) })"
                :key="index" @click="logKeyword(keyword.english_translation)">
                {{ keyword.english_translation }}
              </button>
            </div>
            <div v-if="data.dating_tags && data.dating_tags.length > 0">
              <h2>{{ $t('message.datering') }}</h2>
              <button class="keyword-button" v-if="data.dating_tags && this.$i18n.locale === 'sv'"
                v-for="(keyword, index) in data.dating_tags" :key="index" @click="logKeyword(keyword.text)">
                {{
                  keyword.text }}
              </button>
              <button class="keyword-button" v-if="data.dating_tags && this.$i18n.locale === 'en'"
                v-for="(keyword, index) in data.dating_tags" :key="index" @click="logKeyword(keyword.text)">
                {{
                  keyword.english_translation }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="metadata-container" v-if="data.site && data.site.ksamsok_id">
        <div class="tag-label">{{ $t('message.description') }}</div>
        <div class="metadata-item-container-1col">
          <div v-if="data.site && data.site.ksamsok_id" class="metadata">
            <div v-if="getFornsokUrl()" class="button-container">
              <a :href="getFornsokUrl()" target="_blank" rel="noopener noreferrer" class="visit-button" id="visit"><span
                  class="visit-icon"></span>{{
                    $t('message.checkfornsök') }}</a>
            </div>
            <div class="disclaimer" id="disclaimer">{{ $t('message.descriptiontext') }}</div>
            <div class="general-text" id="description">
              {{ data.description }}
            </div>
          </div>
        </div>
      </div>

      <!-- show description and link for Norwegian data -->
      <div class="metadata-container" v-if="data.site && data.kulturminnesokLink">
        <div class="tag-label">{{ $t('message.description') }}</div>
        <div class="metadata-item-container-1col"></div>
        <div v-if="data.kulturminnesokLink" class="metadata">
          <div class="button-container">
            <a :href="data.kulturminnesokLink" target="_blank" rel="noopener noreferrer" class="visit-button"
              id="visit"><span class="visit-icon"></span>{{ $t('message.checkkulturminnesok') }}</a>
          </div>
        </div>
        <div class="disclaimer" id="disclaimer">{{ $t('message.norwaydescriptiontext') }}</div>
        <div class="general-text" id="description">
          {{ data.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from '../stores/store.js';

export default {
  props: {
    Id: {
      type: [Number, String],
      required: false,
      default: null,
    },
    currentLang: {
      type: String,
      required: true,
    }
  },
  data() {
    return {
      data: {},
      acc_date,
      coordinateStore: useStore(),
      groupedKeywordsSV: {},
      groupedKeywordsEN: {},
      formattedPeopleSV: '',
      formattedPeopleEN: '',
      pg_title: '',
      author_meta: ''
    };
  },
  head() {
    return {
      link: { rel: "schema.DC", href: "http://purl.org/dc/elements/1.1/" },
      meta: [
        { name: 'citation_title', content: () => this.pg_title },
        { name: 'citation_author', content: () => this.author_meta },
        { name: 'dcterms.type', content: 'Illustration' },
        { name: 'citation_year', content: () => this.data.year },
        { name: 'citation_publisher', content: 'SHFA' },
        { name: 'dcterms.medium', content: 'Image' },
        { name: 'dcterms.publisher', content: 'SHFA' },
        { name: 'dcterms.rights', content: 'CC-BY' },
        { name: 'dcterms.identifier', content: () => this.data.id }
      ]
    }
  },
  mounted() {
    //fetch ID from URL and populate data
    this.extractIdAndFetchData();
  },
  methods: {
    open3dViewer(query) {
      const threedUrl = `https://shfa.dh.gu.se/viewer/?q=${query}/mesh`;
      window.open(threedUrl, "_blank");
    },
    logKeyword(keyword) {
      this.$emit('keyword-clicked', keyword);
    },
    logMetaSearch(item) {
      this.$emit('keyword-clicked', item);
    },
    extractIdAndFetchData() {
      const pathSegments = window.location.pathname.split('/');
      const iiifIndex = pathSegments.indexOf('image');
      if (iiifIndex !== -1 && pathSegments.length > iiifIndex) {
        const id = pathSegments[iiifIndex + 1];
        this.fetchData(id);
      }
    },
    fetchData(id) {
      fetch(`https://shfa.dh.gu.se/api/image/?id=${id}&depth=1`)
        .then((response) => response.json())
        .then((json) => {
          this.data = json.results[0];
          this.groupedKeywordsSV = Object.groupBy(this.data.keywords.sort((a, b) => { return a.category.localeCompare(b.category) }), ({ category }) => category);
          this.groupedKeywordsEN = Object.groupBy(this.data.keywords.sort((a, b) => { return a.category_translation.localeCompare(b.category_translation) }), ({ category_translation }) => category_translation)
          this.formattedPeopleSV = new Intl.ListFormat("sv", { style: "long", type: "conjunction" }).format(this.data.people?.map(people => people?.name))
          this.formattedPeopleEN = new Intl.ListFormat("en-GB", { style: "long", type: "conjunction" }).format(this.data.people?.map(people => people?.name))
          this.fetchDescription();
          this.pg_title = `${this.data.type.english_translation} of ${this.data.site.lamning_id || this.data.raa_id ||
            this.data.site.placename} - SHFA`;
          this.author_meta = this.data.people?.map(people => people?.name).join(';');
        }).catch((error) => {
          console.error('Error fetching image data:', error);
        });

    },
    fetchDescription() {
      if (this.data.site && this.data.site.ksamsok_id) {
        fetch(`https://kulturarvsdata.se/raa/lamning/xml/${this.data.site.ksamsok_id}`)
          .then(response => response.text())
          .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
          .then(data => {
            let descriptionNode = data.getElementsByTagName('pres:description')[0];
            this.data.description = descriptionNode ? descriptionNode.textContent : null;
          });
      }
      //Fetch Norwegian data
      if (this.data.site?.askeladden_id) {
        fetch(
          `https://api.ra.no/LokaliteterEnkeltminnerOgSikringssoner/collections/enkeltminner/items?kulturminneId=${this.data.site.askeladden_id}&f=json`
        )
          .then(r => r.json())
          .then(json => {
            const feature = json.features?.[0];
            const props = feature?.properties;

            if (props) {
              this.data.description = props.informasjon ?? '';
              this.data.kulturminnesokLink = props.linkKulturminnesøk ?? '';
            }
          })
          .catch(err => console.error('error fetching Riksantikvaren data:', err));
      }
    },
    getFornsokUrl() {
      if (this.data.site && this.data.site.ksamsok_id) {
        return `https://kulturarvsdata.se/raa/lamning/${this.data.site.ksamsok_id}`;
      } else {
        return '';
      }
    },
  },
  watch: {
    Id(newId, oldId) {
      if (newId !== oldId) {
        fetch(`https://shfa.dh.gu.se/api/image/?id=${newId}&depth=1`)
          .then((response) => response.json())
          .then((json) => {
            this.data = json.results[0];
            this.groupedKeywordsSV = Object.groupBy(this.data.keywords.sort((a, b) => { return a.category.localeCompare(b.category) }), ({ category }) => category);
            this.groupedKeywordsEN = Object.groupBy(this.data.keywords.sort((a, b) => { return a.category_translation.localeCompare(b.category_translation) }), ({ category_translation }) => category_translation);
            this.formattedPeopleSV = new Intl.ListFormat("sv", { style: "long", type: "conjunction" }).format(this.data.people?.map(people => people?.name))
            this.formattedPeopleEN = new Intl.ListFormat("en-GB", { style: "long", type: "conjunction" }).format(this.data.people?.map(people => people?.name))
            this.fetchDescription();
            const coordinates = this.data?.site?.coordinates?.coordinates;
            this.pg_title = `${this.data.type.english_translation} of ${this.data.site.lamning_id || this.data.raa_id ||
              this.data.site.placename} - SHFA`;
            this.author_meta = this.data.people?.map(people => people?.name).join(';');
          })
          .catch((error) => {
            console.error('Error fetching image data:', error);
          });
      }
    }
  }
};

const date = new Date();
const options = {
  year: "numeric",
  month: "long",
  day: "numeric",
};
let acc_date = date.toLocaleString("en-GB", options);
</script>

<style scoped>
.metadata-text {
  margin-left: 30px;
  margin-right: 30px;
}

.metadata-panel-title {
  font-size: 100%;
  text-align: left;
  color: var(--page-text);
  font-weight: 300;
  font-family: "Barlow Condensed", sans-serif !important;
}

.general-text {
  font-size: 110%;
  line-height: 1.2;
  text-align: left;
  color: var(--page-text);
  font-weight: 300;
  font-family: "Barlow Condensed", sans-serif !important;
  margin-top: -10px;
}

.general-text a {
  color: var(--ui-hover)
}

.metadata-container {
  font-family: "Barlow Condensed", sans-serif !important;
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 30px;
  align-items: stretch;
  row-gap: 15px;
  column-gap: 10px;
}

.metadata-item-container-font {
  font-family: "Barlow Condensed", sans-serif !important;
}

.metadata-container>.metadata-item-container {
  flex: 1 1 48%;
}

.metadata-container-3col>.metadata-item-container {
  flex: 1 1 1 25%
}

.metadata-container-1col>.metadata-item-container {
  flex: 1 1 auto
}

.metadata-item-container-1col {
  display: block;
  align-items: center;
  width: 100%;
  /* margin-bottom: 10px;
  margin-right: 1%;
  margin-top: 5px; */
}

.metadata-item-container-3col {
  display: block;
  align-items: center;
  width: 30%;
  margin-bottom: 10px;
  margin-right: 1%;
}

.metadata-item-container {
  display: block;
  align-items: center;
  /* width: 50%;
  margin-bottom: 20px;
  margin-right: 3%; */
}

.tag-label {
  /* width: 120px; */
  color: var(--page-text);
  font-weight: 500;
  font-size: 110%;
  flex: 1;
  white-space: wrap;
  padding-right: 5px;
  line-height: 1.2;
}

.tag-label-header {
  font-family: "Barlow Condensed", sans-serif !important;
  /* width: 120px; */
  color: var(--page-text);
  font-weight: 600;
  font-size: 160%;
  flex: 1;
  white-space: wrap;
  padding-right: 5px;
}

.info-label {
  /* width: 120px; */
  font-weight: 400;
  font-size: 1.1em;
  /* flex: 2; */
  text-align: left;
  white-space: wrap;
  color: var(--info-label);
  cursor: pointer;
}

.info-label:hover {
  color: var(--button-background-accent);
}

.info-label>p {
  /* width: 120px; */
  font-weight: 400;
  font-size: 1.2em !important;
  flex: 2;
  text-align: left;
  white-space: wrap;
  color: var(--info-label) !important;
}

#metadata-container {
  max-width: 100%;
  padding: 0px !important;
  overflow: hidden;
}

h1 {
  min-height: 00px;
  width: 100%;
  font-size: 1.8em;
  text-align: left;
  color: var(--page-text);
  /* padding-left: 25px; */
  margin-top: 20px;
  margin-bottom: 10px;
  cursor: pointer;
}

h2 {
  width: 100%;
  font-size: 1.3em;
  text-align: left;
  color: var(--page-text);
  padding-left: 0px;
  margin-top: 20px;
  margin-bottom: 15px;
}

.data:hover {
  color: var(--ui-hover);
}

.not-clickable {
  color: var(--info-label) !important;
  max-width: 180px;
  cursor: default;
}

.ref {
  color: var(--page-text);
  max-width: 100%;
  margin-top: 0px;
}

table,
th,
td {
  max-width: 100%;
}

th {
  display: none;
}

.metadata-wide {
  float: left;
  padding-left: 25px;
  color: var(--page-text);
  max-width: 100%;
  margin-top: 10px;
}

ul {
  float: left;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0;
  margin: 0;
}

/* .keywords {
  float: left;
  margin-bottom: 30px;
  width: 100%;
  cursor: pointer;
} */

.keyword-button {
  display: inline-flex;
  padding: 2px 10px 2px 10px;
  margin-right: 10px;
  color: var(--button-text);
  background-color: var(--button-background);
  border-radius: 6px;
  font-size: 1.05em;
  text-decoration: none;
  cursor: pointer;
  margin-bottom: 10px;
  background-size: 18px;
  background-position: 10px 8px;
  background-repeat: no-repeat;
  /* box-shadow: var(--shadow); */
}

.keyword-button:hover {
  background-color: var(--button-hover);
}

.description {
  width: 90%;
  margin-bottom: 30px;
}

.disclaimer {
  margin-bottom: 10px;
  color: var(--disclaimer-text);
  font-weight: 400;
  font-size: 120%;
}

.viewer-button {
  /* display: relative; */
  padding: 4px 8px 4px 10px;
  color: var(--button-text);
  /* background-color: var(--button-background); */
  background-color: var(--threed-icon);
  border-radius: 6px;
  font-size: 1.1em;
  text-decoration: none;
  cursor: pointer;
  margin-top: 0px;
  margin-bottom: 20px;
  width: max-content;
  height: max-content;
  font-weight: 400;
  /* background-image: var(--link-button);
  background-size: 20px;
  background-position: 10px 8px;
  background-repeat: no-repeat; */
}

.viewer-button:hover {
  background-color: var(--button-hover-accent);
}

.viewer-icon {
  display: absolute;
  float: right;
  margin-top: 3px;
  height: 22px;
  width: 22px;
  background-image: var(--popup-link-button);
  /* filter: invert(1); */
  background-size: 25px;
  background-position: center;
  background-repeat: no-repeat;
  margin-left: 10px;
  border-width: 1.4px;
  border-color: var(--button-text);
  border-radius: 50%;
}

.visit-button {
  /* display: relative; */
  padding: 4px 10px 4px 13px;
  color: var(--button-text);
  background-color: var(--button-background);
  border-radius: 8px;
  font-size: 1.15em;
  text-decoration: none;
  cursor: pointer;
  margin-bottom: 20px;
  width: max-content;
  height: max-content;
  /* background-image: var(--link-button);
  background-size: 20px;
  background-position: 10px 8px;
  background-repeat: no-repeat; */
}

.visit-icon {
  display: absolute;
  float: right;
  margin-top: 3px;
  height: 20px;
  width: 20px;
  background-image: var(--popup-link-button);
  /* filter: invert(1); */
  background-size: 22px;
  background-position: center;
  background-repeat: no-repeat;
  margin-left: 10px;
  border-width: 1.4px;
  border-color: var(--button-text);
  border-radius: 50%;
}

.visit-button:hover {
  background-color: var(--button-hover);
}

.button-container {
  display: flex;
  justify-content: left;
}

ul li {
  float: left;
  list-style-type: none;
  padding: 2px 8px;
  border-radius: 5px;
  background-color: var(--button-background);
}

@media screen and (min-height: 950px) {
  .visit-button {
    padding: 4px 15px 6px 15px;
    background-size: 30px;
  }
}
</style>
