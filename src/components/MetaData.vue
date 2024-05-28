<template>
  <div id="metadata-container">
    <div class="metadata-column-group">
      <h1 v-if="data.site"> {{ data.site.lamning_id || data.site.placename }} </h1>
      <div class="metadata-column">
        <table>
          <tr id="image-metadata-header">
            <th scope="col">Metadata Field</th>
            <th scope="col">Value</th>
          </tr>
          <tr>
            <td class="label" v-if="data.site && data.site.raa_id">{{ $t('message.raanumber') }}</td>
            <td class="data" v-if="data.site && data.site.raa_id" @click="logMetaSearch(data.site.raa_id)">
              {{ data.site.raa_id }}</td>
          </tr>
          <tr>
            <td class="label" v-if="data.site && data.site.lokalitet_id">{{ $t('message.lokalitetid') }}</td>
            <td class="data" v-if="data.site && data.site.lokalitet_id" @click="logMetaSearch(data.site.lokalitet_id)">
              {{ data.site.lokalitet_id }}</td>
          </tr>
          <tr>
            <td class="label" v-if="data.site && data.site.askeladden_id">{{ $t('message.askeladdenid') }}</td>
            <td class="data" v-if="data.site && data.site.askeladden_id"
              @click="logMetaSearch(data.site.askeladden_id)"> {{ data.site.askeladden_id }}</td>
          </tr>
          <tr>
            <td class="label" v-if="data.type && data.type.text">{{ $t('message.typ') }}</td>
            <td class="data" v-if="data.type && data.type.text && $i18n.locale === 'sv'"
              @click="logKeyword(data.type.text)"> {{ data.type.text }}</td>
            <td class="data" v-else-if="data.type && data.type.text && $i18n.locale === 'en'"
              @click="logKeyword(data.type.english_translation.text)">{{ data.type.english_translation }}</td>
          </tr>
          <tr>
            <td class="label" v-if="data.subtype && data.subtype.text">{{ $t('message.subtype') }}</td>
            <td class="not-clickable" v-if="data.subtype && data.subtype.text && $i18n.locale === 'sv'"> {{
        data.subtype.text }}
            </td>
            <td class="not-clickable" v-if="data.subtype && data.subtype.text && $i18n.locale === 'en'">{{
        data.subtype.english_translation }}</td>
          </tr>
          <tr>
            <td class="label">{{ $t('message.author') }}</td>
            <td class="data" v-if="data.people && data.people.length > 0">
              <p class="data" v-for="(person, index) in data.people" :key="index"
                @click="logMetaSearch(person.name)">
                {{ person.name }}</p>
              <!-- <span class="data" v-for="(person, index) in data.people" :key="index"
                @click="logMetaSearch(person.name)">
                {{ person.name }}<span class="not-clickable" v-if="data.people && index != data.people.length - 1">, </span></span> -->
            </td>
            <td class="data" v-if="data.people && data.people.length === 0 && $i18n.locale === 'sv'"
              @click="logMetaSearch(data.author.name)"> {{
        data.author.name
        || 'Unknown' }}</td>
            <td class="data" v-if="data.people && data.people.length === 0 && $i18n.locale === 'en'"
              @click="logMetaSearch(data.author.name)">
              {{ data.author.english_translation || 'Unknown' }}
            </td>
          </tr>
        </table>
      </div>
      <div class="metadata-column">
        <table>
          <tr>
            <th scope="col">Metadata Field</th>
            <th scope="col">Value</th>
          </tr>
          <tr>
            <td class="label" v-if="data.year">{{ $t('message.år') }}</td>
            <td class="not-clickable" v-if="data.year"> {{ data.year }}</td>
          </tr>
          <tr>
            <td class="label" v-if="data.rock_carving_object && data.rock_carving_object.name">{{ $t('message.ristning')
              }}</td>
            <td class="data" v-if="data.rock_carving_object && data.rock_carving_object.name"
              @click="logMetaSearch(data.rock_carving_object.name)"> {{ data.rock_carving_object.name }}</td>
          </tr>
          <tr>
            <td class="label" v-if="data.collection && data.collection.name">{{ $t('message.collection') }}</td>
            <td class="not-clickable" v-if="data.collection && data.collection.name"> {{ data.collection.name }}</td>
          </tr>
          <tr>
            <td class="label" v-if="data.institution && data.institution.name">Institution:</td>
            <td class="data" v-if="data.institution && data.institution.name"
              @click="logMetaSearch(data.institution.name)"> {{ data.institution.name }}</td>
          </tr>
        </table>
      </div>
      <div class="metadata-wide">
        <table>
          <tr>
            <td class="label" v-if="data.site">{{ $t('message.reference') }}</td>
            <td class="ref" v-if="data.site && $i18n.locale === 'en'"> {{ data.author.english_translation }}. ({{
        data.year || 'n.d.' }}). {{ data.type.english_translation }} {{ $t('message.av') }} {{
        data.site.lamning_id
        || data.raa_id || data.site.placename }}, SHFA, {{ $t('message.åtkomst') }} {{ acc_date }}
              {{ $t('message.at') }} https://shfa.dh.gu.se/image/{{ data.id }}</td>
            <td class="ref" v-if="data.site && $i18n.locale === 'sv'"> {{ data.author?.name }}. ({{ data.year || 'n.d.'
              }}).
              {{ data.type.text }} {{ $t('message.av') }} {{ data.site.lamning_id || data.raa_id ||
        data.site.placename }}, SHFA, {{ $t('message.åtkomst') }} {{ acc_date }} {{ $t('message.at') }}
              https://shfa.dh.gu.se/image/{{ data.id }}</td>
          </tr>
        </table>
      </div>
    </div>
    <div class="metadata-wide">
      <div v-if="data.keywords && data.keywords.length > 0">
        <h2>{{ $t('message.keywords') }}</h2>
        <div class="keywords"> <!-- Empty div for margin -->
          <div v-if="data.keywords && this.$i18n.locale === 'sv'" v-for="(category,index) in groupedKeywordsSV">
            <button v-if="data.keywords && this.$i18n.locale === 'sv'" class="keyword-button"
            :key="index" @click="logKeyword(index)"> {{index}}
          </button>
          <button v-if="data.keywords && this.$i18n.locale === 'sv'" class="keyword-button" v-for="(keyword,index) in category"
            :key="index" @click="logKeyword(keyword.text)"> {{keyword.text}}
          </button>
          </div>
          <div v-if="data.keywords && this.$i18n.locale === 'en'" v-for="(category,index) in groupedKeywordsEN">
            <button v-if="data.keywords && this.$i18n.locale === 'en'" class="keyword-button"
            :key="index" @click="logKeyword(index)"> {{index}}
          </button>
          <button v-if="data.keywords && this.$i18n.locale === 'en'" class="keyword-button" v-for="(keyword,index) in category"
            :key="index" @click="logKeyword(keyword.english_translation)"> {{keyword.english_translation}}
          </button>
          </div>
            <div v-if="data.dating_tags && data.dating_tags.length > 0">
        <h2>{{ $t('message.datering') }}</h2>
          <button class="keyword-button" v-if="data.dating_tags && this.$i18n.locale === 'sv'"
            v-for="(keyword, index) in data.dating_tags" :key="index"
            @click="logKeyword(keyword.text)"> {{ keyword.text }}
          </button>
          <button class="keyword-button" v-if="data.dating_tags && this.$i18n.locale === 'en'"
            v-for="(keyword, index) in data.dating_tags" :key="index"
            @click="logKeyword(keyword.text)"> {{ keyword.english_translation }}
          </button>
        </div>
        </div>
      </div>
      <h2 v-if="data.site && data.site.ksamsok_id">{{ $t('message.description') }}</h2>
      <div v-if="data.site && data.site.ksamsok_id" class="metadata">
        <div v-if="getFornsokUrl()" class="button-container">
          <a :href="getFornsokUrl()" target="_blank" rel="noopener noreferrer" class="visit-button" id="visit"><span
              class="visit-icon"></span>{{
        $t('message.checkfornsök') }}</a>
        </div>
        <div class="disclaimer" id="disclaimer">{{ $t('message.descriptiontext') }}</div>
        <div class="description" id="description">
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
  },
  data() {
    return {
      data: {},
      acc_date,
      coordinateStore: useStore(),
      groupedKeywordsSV:{},
      groupedKeywordsEN:{},
    };
  },
  mounted() {
    // Fetch ID from URL and populate data
    this.extractIdAndFetchData();
  },
  methods: {
    logKeyword(keyword) {
      // const translatedKeyword = this.$t('keywords.' + keyword.replaceAll('.', '_'));
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
      fetch(`https://diana.dh.gu.se/api/shfa/image/?id=${id}&depth=1`)
        .then((response) => response.json())
        .then((json) => {
          this.data = json.results[0];
          this.groupedKeywordsSV = Object.groupBy(this.data.keywords, ({ category }) => category)
          this.groupedKeywordsEN = Object.groupBy(this.data.keywords, ({ category_translation }) => category_translation)       
          this.fetchDescription();

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
    },
    getFornsokUrl() {
      if (this.data.site && this.data.site.ksamsok_id) {
        return `https://kulturarvsdata.se/raa/lamning/${this.data.site.ksamsok_id}`;
      } else {
        return '';
      }
    }
  },
  watch: {
    Id(newId, oldId) {
      if (newId !== oldId) {
        fetch(`https://diana.dh.gu.se/api/shfa/image/?id=${newId}&depth=1`)
          .then((response) => response.json())
          .then((json) => {
            this.data = json.results[0];
            this.groupedKeywordsSV = Object.groupBy(this.data.keywords, ({ category }) => category);
            this.groupedKeywordsEN = Object.groupBy(this.data.keywords, ({ category_translation }) => category_translation);
            this.fetchDescription();
            const coordinates = this.data?.site?.coordinates?.coordinates;
            if (coordinates) {
              this.coordinateStore.setCoordinates(coordinates);
            }
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
  padding-left: 25px;
  margin-top: 20px;
  margin-bottom: 10px;
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

#image-metadata-header {
  display: none;
}

.metadata-column-group {
  float: left;
  width: 95%;
}

.metadata-column {
  float: left;
  padding-left: 25px;
  color: var(--page-text);
  line-height: 1;
  font-size:1.1em;
}

.label {
  width: 130px!important;
  color: var(--page-text);
  font-weight: 600;
  text-align:right!important;
}

.data {
  color: var(--page-text);
  max-width: 180px;
  cursor: pointer;
}

.data p {
  margin-bottom: 5px;
}

.data:hover {
  color: var(--ui-hover);
}

.not-clickable {
  color: var(--page-text);
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
  width: 90%;
  margin-bottom: 10px;
  color: var(--disclaimer-text);
  font-weight: 500;
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
