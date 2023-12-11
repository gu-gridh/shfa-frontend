<template>
  <div id="metadata-container">
  <div class="metadata-column-group">
    <h1> <span v-if="data.site"> {{ data.site.lamning_id || data.site.placename}} </span> </h1>
  <div class="metadata-column" :class="{light:isLight}">
    <table>
   <tr><td class="label" v-if="data.site && data.site.raa_id">{{ $t('message.raanumber') }}</td><td class="data" v-if="data.site && data.site.raa_id">  {{ data.site.raa_id }}</td></tr>
   <tr><td class="label" v-if="data.site && data.site.lokalitet_id">{{ $t('message.lokalitetid') }}</td><td class="data" v-if="data.site && data.site.lokalitet_id">  {{ data.site.lokalitet_id }}</td></tr>
   <tr><td class="label" v-if="data.site && data.site.askeladden_id">{{ $t('message.askeladdenid') }}</td><td class="data" v-if="data.site && data.site.askeladden_id">  {{ data.site.askeladden_id }}</td></tr>
   <tr><td class="label" v-if="data.type && data.type.text">{{ $t('message.typ') }}</td><td class="data" v-if="data.type && data.type.text && $i18n.locale==='sv'">  {{ $t('keywords.'+data.type.text) }}</td><td class="data" v-else-if="data.type && data.type.text && $i18n.locale==='en'">{{ data.type.english_translation }}</td></tr>
   <tr><td class="label" v-if="data.author && data.author.name">{{ $t('message.author') }}</td><td class="data" v-if="data.author && data.author.name && $i18n.locale==='sv'">  {{ data.author.name }}</td><td class="data" v-else-if="data.author && data.author.name && $i18n.locale==='en'">{{ data.author.english_translation }}</td></tr>
  </table>
  </div>
   <div class="metadata-column">
    <table>
      <tr><td class="label" v-if="data.year">{{ $t('message.år') }}</td><td class="data" v-if="data.year">  {{ data.year }}</td></tr>
   <tr><td class="label" v-if="data.rock_carving_object && data.rock_carving_object.name">{{ $t('message.ristning') }}</td><td class="data" v-if="data.rock_carving_object && data.rock_carving_object.name">  {{ data.rock_carving_object.name }}</td></tr>
   <tr><td class="label" v-if="data.collection && data.collection.name">{{ $t('message.collection') }}</td><td class="data" v-if="data.collection && data.collection.name">  {{ data.collection.name }}</td></tr>
  <tr><td class="label" v-if="data.institution && data.institution.name">Institution:</td><td class="ref" v-if="data.institution && data.institution.name">  {{ data.institution.name }}</td></tr>
  </table></div>
   <div class="metadata-wide" :class="{light:isLight}">
   <table>
    <tr><td class="label" v-if="data.site">{{ $t('message.reference') }}</td><td class="ref" v-if="data.site && $i18n.locale==='en'">  {{ data.author.english_translation }}. ({{ data.year || 'n.d.'}}). {{ $t('keywords.'+data.type.text) }} {{$t('message.av')}} {{ data.site.lamning_id || data.site.placename }}, SHFA, {{$t('message.åtkomst')}} {{ acc_date }} {{$t('message.at')}} https://shfa.dh.gu.se/image/{{ data.id }}</td>
      <td class="ref" v-if="data.site && $i18n.locale==='sv'">  {{ data.author.name}}. ({{ data.year || 'n.d.'}}). {{ $t('keywords.'+data.type.text) }} {{$t('message.av')}} {{ data.site.lamning_id || data.site.placename}}, SHFA, {{$t('message.åtkomst')}} {{ acc_date }} {{$t('message.at')}} https://shfa.dh.gu.se/image/{{ data.id }}</td></tr>
    </table>
  </div>
</div>
  <div class="metadata-wide" >
     <div v-if="data.keywords && data.keywords.length > 0">
      <h2>{{ $t('message.keywords') }}</h2>
      <div class="keywords"> <!-- Empty div for margin -->
      <ul>
        <li id="search-suggestion" v-for="(keyword, index) in data.keywords.concat(data.dating_tags)" :key="index">{{ $t('keywords.'+keyword.text.replaceAll('.','_')) }}</li>
      </ul>
    </div>
  </div>
  <h2 v-if="data.site && data.site.ksamsok_id">{{ $t('message.description') }}</h2>
  <div v-if="data.site && data.site.ksamsok_id" class="metadata" >
  <div v-if="getFornsokUrl()" class="button-container">
    <a :href="getFornsokUrl()" target="_blank" rel="noopener noreferrer" class="visit-button" id="visit">{{ $t('message.checkfornsök') }}</a>
  </div>
  <div class="disclaimer" :class="{light:isLight}" id="disclaimer">{{ $t('message.descriptiontext') }}</div>
  <div class="description" :class="{light:isLight}" id="description">
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
      isLight: false,
      coordinateStore: useStore(),
    };
  },
   mounted() {
    // Fetch ID from URL and populate data
    this.extractIdAndFetchData();
  },
   methods: {
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
          this.fetchDescription(); 
        })
        .catch((error) => {
          console.error('Error fetching image data:', error);
        });
    },
    fetchDescription() {
      fetch(`https://kulturarvsdata.se/raa/lamning/xml/${this.data.site.ksamsok_id}`)
        .then(response => response.text())
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .then(data => {
          let descriptionNode = data.getElementsByTagName('pres:description')[0];
          this.data.description = descriptionNode ? descriptionNode.textContent : null;
        });
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
let acc_date = date.toLocaleString("en-GB",options);

//let ref_url = location.href;

  
</script>
<style scoped>

#metadata-container{
  max-width:100%;
  padding:0px!important;
  overflow:hidden;
}

h1{
  min-height:00px;
  width:100%;
  font-size:1.8em;
  text-align:left;
  color:white;
  padding-left:25px;
  margin-top:20px;
  margin-bottom:10px;
}

h2{
  width:100%;
  font-size:1.3em;
  text-align:left;
  color:white;
  padding-left:0px;
  margin-top:20px;
  margin-bottom:15px;
}

.metadata-column-group {
  float:left;
 width:95%;
}

.metadata-column {
  float:left;
  padding-left: 25px;
  color: white;
  line-height: 1;
}


.label {
  width:120px;
  color:white;
  font-weight:600;
}

.data {
  color: rgb(200,225,250);
max-width:180px;

}

.ref {
  color: rgb(200,225,250);
max-width:100%;
margin-top: 0px;
}

table, th, td {
  max-width:100%;
}

.metadata-wide {
  float:left;
 padding-left:25px;
  color: white;
  max-width:100%;
  margin-top:10px;
}


ul {
  float:left;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0;
  margin: 0;
}

.keywords {
  float:left;
  margin-bottom: 30px;
  width:100%;
}

.description {
  width:90%;
  margin-bottom: 30px;
}

.disclaimer{
  width:90%;
  margin-bottom: 10px;
  color:rgb(200,225,250);
  font-weight: 500;
}

.visit-button {
  display: inline-block;
  padding: 4px 10px 4px 43px;
  color: white;
  background-color: rgb(100, 100, 100);
  border-radius: 8px;
  font-size:1.15em;
  text-decoration: none;
  cursor: pointer;
  margin-bottom: 20px;
  background-image:url(../../public/interface/linkbuttonwhite.png);
  background-size:20px;
  background-position:10px 8px;
  background-repeat:no-repeat;
  box-shadow:5px 5px 10px rgba(0,0,0,0.1);
}

.visit-button:hover {
  background-color: rgb(80,90,100);
  color:white;
}

.button-container {
  display: flex;
  justify-content: left;
}

ul li {
  float:left;
  list-style-type: none;
  padding: 2px 8px;
  border-radius: 5px;
  background-color: rgb(100, 100, 100); 
}

@media screen and (min-height: 950px) {
  .visit-button {
    padding: 4px 15px 6px 50px;
  background-size:30px;
}
}
</style>
