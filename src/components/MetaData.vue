<template>
  <div class="styled-container">
    <h1>Meta Data:</h1>
    <p v-if="data.site && data.site.raa_id">Site RAA ID: {{ data.site.raa_id }}</p>
    <p v-if="data.collection && data.collection.name">Collection: {{ data.collection.name }}</p>
    <p v-if="data.author && data.author.name">Author: {{ data.author.name }}</p>
    <p v-if="data.institution && data.institution.name">Institution: {{ data.institution.name }}</p>
    <p v-if="data.reference">Reference: {{ data.reference }}</p>
    <p v-if="data.year">Year: {{ data.year }}</p>
    <p v-if="data.date_note">Date Note: {{ data.date_note }}</p>
    <p v-if="data.rock_carving_object && data.rock_carving_object.name">Rock Carving Object: {{ data.rock_carving_object.name }}</p>
    <p v-if="data.type && data.type.text">Type: {{ data.type.text }}</p>
     <div v-if="data.keywords && data.keywords.length > 0">
      <span>Keywords:</span>
      <div class="keywords-margin"></div> <!-- Empty div for margin -->
      <ul>
        <li v-for="(keyword, index) in data.keywords" :key="index">{{ keyword.text }}</li>
      </ul>
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
.styled-container {
  background-color: rgb(45, 45, 45);
  border-radius: 10px;
  padding: 20px;
  margin: 15px;
  color: white;
  line-height: 1;
}
h1 {
  text-align: center;
}
h1, p {
  margin-bottom: 1rem; 
}
ul {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0;
  margin: 0;
}
.keywords-margin {
  margin-bottom: 10px;
}
ul li {
  list-style-type: none;
  padding: 5px;
  border-radius: 5px;
  background-color: rgb(65, 65, 65); 
}
</style>

