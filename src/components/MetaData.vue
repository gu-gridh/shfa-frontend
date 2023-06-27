<template>
  <div id="metadata-container">
  <div class="metadata-column-group">
    <h1> <span v-if="data.site && data.site.raa_id"> {{ data.site.raa_id }} </span> </h1>
  <div class="metadata-column">
    <table>
   
   <tr><td class="label" v-if="data.type && data.type.text">Type:</td><td class="data" v-if="data.type && data.type.text"> {{ data.type.text }}</td></tr>
   <tr><td class="label" v-if="data.collection && data.collection.name">Collection:</td><td class="data" v-if="data.collection && data.collection.name">  {{ data.collection.name }}</td></tr>
   <tr><td class="label" v-if="data.author && data.author.name">Author:</td><td class="data" v-if="data.author && data.author.name">  {{ data.author.name }}</td></tr>
   <tr><td class="label" v-if="data.institution && data.institution.name">Institution:</td><td class="data" v-if="data.institution && data.institution.name">  {{ data.institution.name }}</td></tr>
   <tr><td class="label" v-if="data.reference">Reference:</td><td class="data" v-if="data.reference">  {{ data.reference }}</td></tr>
  
  </table>
  </div>
   <div class="metadata-column">
    <table>
      <tr><td class="label" v-if="data.year">Year:</td><td class="data" v-if="data.year"> {{ data.year }}</td></tr>
   <tr><td class="label" v-if="data.date_note">Date Note:</td><td class="data" v-if="data.date_note">  {{ data.date_note }}</td></tr>
   <tr><td class="label" v-if="data.rock_carving_object && data.rock_carving_object.name">Carving:</td><td class="data" v-if="data.rock_carving_object && data.rock_carving_object.name">  {{ data.rock_carving_object.name }}</td></tr>
   
    </table>
  </div>
</div>
  <div class="metadata-wide">
     <div v-if="data.keywords && data.keywords.length > 0">
      <h2>Keywords:</h2>
      <div class="keywords"> <!-- Empty div for margin -->
      <ul>
        <li v-for="(keyword, index) in data.keywords" :key="index">{{ keyword.text }}</li>
      </ul>
    </div>
  </div>
  <h2>Description:</h2>
  <div class="description">
    {{ data.description }}
  </div>
<div class="metadata">
  <div v-if="getFornsokUrl()" class="button-container">
    <a :href="getFornsokUrl()" target="_blank" rel="noopener noreferrer" class="visit-button">Visit Fornsök</a>
  </div>
</div>
</div>
</div>
</template>

<script>
export default {
  props: {
    Id: {
      type: Number,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      data: {},
    };
  },
   methods: {
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
        return `https://app.raa.se/open/fornsok/lamning/${this.data.site.ksamsok_id}`;
      } else {
        return '';
      }
    }
  },
  watch: {
    Id(newId, oldId) {
      if(newId){
        fetch(`https://diana.dh.gu.se/api/shfa/image/?id=${newId}&depth=1`)
        .then((response) => response.json())
        .then((json) => {
          this.data = json.results[0];
          this.fetchDescription(); 
        });
      }
    }
  }
};


</script>
<style scoped>

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
  width:80px;
  color:white;
  font-weight:600;
}

.data {
  color: rgb(200,225,250);
max-width:180px;
}

table, th, td {
}

.metadata-wide {
  float:left;
 padding-left:25px;
  color: white;
  width:100%;
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

.visit-button {
  display: inline-block;
  padding: 4px 10px 6px 43px;
  color: white;
  background-color: rgb(100, 100, 100);
  border-radius: 8px;
  font-size:1.3em;
  text-decoration: none;
  cursor: pointer;
  margin-bottom: 30px;
  background-image:url(../../public/interface/linkbuttonwhite.png);
  background-size:25px;
  background-position:10px 8px;
  background-repeat:no-repeat;
  box-shadow:0px 0px 20px rgba(0,0,0,0.2);
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
