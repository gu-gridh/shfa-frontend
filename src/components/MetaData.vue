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
  watch: {
    Id(newId, oldId) {
      if(newId){
        fetch(`https://diana.dh.gu.se/api/shfa/image/?id=${newId}&depth=1`)
        .then((response) => response.json())
        .then((json) => {
          this.data = json.results[0];
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
 color:rgb(170,218,250);
max-width:180px;
}

table, th, td {
}

.metadata-wide {
  float:left;
 padding-left:25px;;
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

ul li {
  float:left;
  list-style-type: none;
  padding: 2px 8px;
  border-radius: 5px;
  background-color: rgb(100, 100, 100); 
}
</style>
