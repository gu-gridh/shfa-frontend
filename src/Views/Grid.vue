<template>
<div>
<div class="top">  
  <h1 class="title">Swedish <br><div class="emph">Rock Art </div><br>Research<br> Archive</h1>

  <div class="languages">
    <div class="top-link-button">Swedish</div>
    <div class="top-link-button">|</div>
    <div class="top-link-button">English</div>
  </div>

  <div class="top-links">
    <div class="top-link-button"><div class="button-image" style="background-image:url(../../public/interface/infobuttonbold.png)"></div>About the archive</div>
    <div class="top-link-button"><div class="button-image" style="background-image:url(../../public/interface/linkbuttonbold.png)"></div>About SHFA</div>
    <div class="top-link-button"><div class="button-image" style="background-image:url(../../public/interface/linkbuttonbold.png)"></div>Updates</div>
  </div>
</div>
  <!-- Start of Container -->
  <div class="split-container main-color">
  <div class="flex height">
  <!-- Panel 1 -->
  <div  id="split-0" class="flex-grow flex flex-col "
       :class="{ 'w-1/3': showThreePanels, 'w-1/2': !showThreePanels }">
       
      <Search @toggle-map="toggleMap" @search-completed="updateItems" :updateNextPageUrl="updateNextPageUrl" ref="searchRef" />
      <Map
        v-show="showMap"
        :coordinates="results"
        :bbox="bbox"
        @id-selected="selectedId = $event"
        @raaId-selected="selectedRaaId = $event"
        @update-bbox="bbox = $event"
      ></Map>
      <AdvancedSearch v-show="!showMap" 
        @advanced-search-results="handleAdvancedSearchResults" 
        :updateNextPageUrlAdvanced="updateNextPageUrlAdvanced" 
        ref="advancedSearchRef" />
     
  </div>
  <!-- Panel 2 -->
  <div id="split-1" class="flex-grow overflow-auto main-color" 
       :class="{ 'w-1/3': showThreePanels, 'w-1/2': !showThreePanels }"
       >

  <div class="">
  <div class="">
   
  <div v-show="showGallery"> 
  <Gallery 
    :siteId="selectedId" 
    :siteRaaId="selectedRaaId"
    @items-updated="onItemsUpdated"
    @image-clicked="onImageClicked"
    :searchItems="searchItems"
    :fetchNextPage="fetchNextPage"
    :searchNextPageUrl="nextPageUrl"
    :advancedSearchResults="advancedSearchResults"
    :fetchNextPageAdvanced="fetchNextPageAdvanced"
    :searchNextPageUrlAdvanced="nextPageUrlAdvanced"
    >
  </Gallery>
</div>

<div v-if="showCatalogue" @click="toggleThreePanels">
    <Catalogue 
      :siteId="selectedId" 
      :siteRaaId="selectedRaaId"
      @items-updated="onItemsUpdated"
      @image-clicked="onImageClicked">
    </Catalogue>
  </div>

  <div v-if="showDatareport">
    <Datareport>
    </Datareport>
  </div>


    <div style="display:flex;  align-items: center; justify-content: center;">
    <div class="ui-mode ui-overlay">
        <button class="item" v-bind:class="{ selected: showGallery}" v-on:click="showGallery = true; showCatalogue = false; showDatareport = false; ">
         Gallery
        </button>
        <button class="item" v-bind:class="{ selected: showCatalogue}" v-on:click="showCatalogue = true; showGallery = false; showDatareport = false; ">
          Catalogue
        </button>
        <button class="item" v-bind:class="{ selected: showDatareport}" v-on:click="showDatareport = true; showCatalogue = false; showGallery = false; ">
          Data
        </button>
      </div>
      <!-- <div class="ui-numbers ui-overlay">
      {{ itemsCount }} objects 
      </div> -->
    </div>
  </div>
 
</div>
</div>

<!-- Panel 3 -->
<transition name="slide">
<div id="split-2" class="flex-grow main-color overflow-auto"
      :class="{ 'w-1/3': showThreePanels, 'w-0': !showThreePanels }" v-show="showThreePanels">
      <button @click="closeThreePanels" class="close-button">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
    </button>

    <ImageViewer :iiifFile="selectedIiifFile" />
    <MetaData :Id="idForMetaData" />

</div>
</transition>

<div class="split-container-top"></div>
</div>
</div>
<!-- End of Container -->

</div>
</template>

<script lang="ts">

import Map from '../components/Map.vue';
import { defineComponent } from 'vue';
import Split from 'split.js';
import Gallery from '../components/Gallery.vue';
import Catalogue from '../components/Catalogue.vue';
import Datareport from '../components/Datareport.vue';
import Search from "../components/Search.vue";
import AdvancedSearch from "../components/AdvancedSearch.vue";
import ImageViewer from "../components/ImageViewer.vue";
import MetaData from "../components/MetaData.vue"

export default defineComponent({
  components: {
    Map, Gallery, Catalogue, Datareport, Search, AdvancedSearch, ImageViewer, MetaData
  },
  watch: {
  showThreePanels(newValue) {
    const gutter = document.querySelector('.gutter:not(.gutter-2)') as HTMLElement;
    if (gutter) {
      gutter.style.display = newValue ? 'block' : 'none';
    }
  },
  },
  data() {
    return {
      items: [],
      results: [],
      searchItems: [],
      advancedSearchResults: [],
      showThreePanels: false,
      selectedId: null,
      selectedRaaId: null,
      selectedIiifFile: null,
      idForMetaData: null,
      bbox: [],
      showMap: true,
      showGallery: true,
      showCatalogue: false,
      showDatareport: false,
      nextPageUrl: null,
      nextPageUrlAdvanced: null,
    }
  },

  mounted() {
    const vm = this;
  Split(['#split-0', '#split-1', '#split-2'], {
    minSize: [500, 300],
    dragInterval: 1,
    gutterSize: 10,
    gutterAlign: 'start',
    gutter: function (index, direction) {
      const gutter = document.createElement('div');
      gutter.className = 'gutter';
      if (index === 1) {
        gutter.classList.add('gutter-2');
      } else {
        gutter.style.display = vm.showThreePanels ? 'block' : 'none';
      }
      return gutter;
    },
  });

},


  methods: {
    updateItems(newItems) {
      this.searchItems = newItems;
    },
    toggleMap() {
      this.showMap = !this.showMap;
    },
    toggleThreePanels() 
    {
      this.showThreePanels = true;
    },
    closeThreePanels() 
    {
      this.showThreePanels = false;
    },
    onImageClicked(iiifFile, id) {
      this.selectedIiifFile = iiifFile;
      this.idForMetaData = id;
      console.log(this.idForMetaData)
      this.toggleThreePanels();
    },
    fetchNextPage() {
      this.$refs.searchRef.fetchNextPage();
    },
    fetchNextPageAdvanced() {
      this.$refs.advancedSearchRef.fetchNextPage();
    },
    updateNextPageUrl(newUrl) {
      this.nextPageUrl = newUrl;
    },
    updateNextPageUrlAdvanced(newUrl) {
      this.nextPageUrlAdvanced = newUrl;
    },
    handleAdvancedSearchResults(results) {
      this.advancedSearchResults = results;
    },
  },
});
</script>


<style>

.height{
  height:calc(100vh - 200px)
}

.title{
  position:absolute;
  font-family: 'Teko', sans-serif;
  line-height:0.75;
  letter-spacing:-1.2px;
  font-size:52px;
  font-weight:400;
  padding:25px 40px;
  color:rgb(150, 150, 150);
}

.title .emph{
  display:inline;
  color:rgb(90, 90, 90);
}

.top{
  height:200px;
  z-index:1000;
background-color:rgb(210,210,210)
}
.languages{
right:0px;
font-size:1.3em;
font-weight:400;
color:black;
position:absolute;
padding-top:20px;
padding-right:20px;
}


.top-links{
  font-size:1.3em;
  font-weight:400;
  margin-top:140px;
  height:auto;
  right:00px;
  color:black;
  position:absolute;
  padding-right:20px;
}

.button-image{
  float:left;
  margin-right:10px;
  margin-top:4px;
  width:25px;
  height:25px;
  border-radius:50%;
  border-width:1.5px;
  border-color:black;
  background-size:contain;
}

.top-link-button{
  float:left;
  text-align:left;
  margin-left:10px;
  padding:3px 10px;
  border-radius:8px;
}
.top-link-button:hover{
  background-color:rgb(250,250,250);
}
.main-color{
  background-color:rgb(65,65,65);

}

.split-container{
  overflow:hidden !important;
  
}

.split-container-top{
  height:calc(100% - 200px) ;
  width:100%;
  position:absolute;
  box-shadow: inset 0rem 2rem 2rem rgba(0, 0, 0, 0.3)!important;
  pointer-events:none;
}

#split-0{
padding:30px 15px 35px 40px;
min-width:550px;

}

#split-0::-webkit-scrollbar {
    width: 0px !important;
    }

#split-1{
padding:0px 15px 0px 15px;

}

#split-1::-webkit-scrollbar {
    width: 0px !important;
    }

    #split-2::-webkit-scrollbar {
    width: 0px !important;
    }

#search-interface{
  margin-bottom:10px;
 
}


.tag-example{
float:left;
 background-color: rgb(90,90,90);
 padding: 5px 10px;
 border-radius:5px;
 margin-left:10px;
 margin-bottom:5px;
font-size:1.0em;
 cursor:pointer;
}

.tag-example:hover{

  background-color: rgb(170,70,70);

 cursor:pointer;
}

#search {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 0px;
  margin-right: 0px;
  border-radius:8px;
  margin-top:10px;
  padding:10px 15px;
  background-color:rgb(45,45,45);
}

input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
  height: 0.5em;
  width: 0.5em;
  border-radius: 50em;
  background: url(../../interface/input-cancel-x.svg) no-repeat 50% 50%;
  background-size: contain;
  opacity: 1.0;
  pointer-events: none;
}

input[type="search"]:focus::-webkit-search-cancel-button {
  opacity: 1.0;
  pointer-events: all;
  filter: invert(1);
}

h2 {
  display: flex;
  color: white;
  font-size: 30px;
  font-weight: 400;
  line-height: 0.8;
  
}

input:focus{
    outline: none;
}

h2 input {
  flex: 1;
  min-width: 3em;
  color: white;
  font-weight: 400;
  z-index: 35;
}

h2 input:hover,
h2 input:focus,
h2 input:not(:placeholder-shown) {
  background-color: black;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 200ms ease-in;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
}

.ui-overlay {
pointer-events:auto;
z-index: 100;
position:absolute;
border-radius: 8px;
font-size: 1.1em;
font-weight: 500;
color: white;
background-color: rgba(0, 0, 0, 0.5);
backdrop-filter: blur(5px);
}
.ui-mode {
top: 230px;
padding: 4px 0px 4px 0px;
background-color: rgba(0, 0, 0, 0.5);
}

.ui-mode .item {
cursor: pointer;
display: inline;
font-weight: 500;
padding: 0px 15px 0px 15px;
}

.ui-mode .item:hover {
  color: rgb(150,200,255);
}

.ui-mode .selected{
color: rgb(150,200,255);
}

.ui-numbers {
  padding: 2px 15px 6px 15px;
  text-align: center;
  bottom: 30px;
  margin-top: calc(100% - 100px); 
}

.ui-map-info {
padding: 2px 15px 6px 15px;
text-align: center;
bottom: 50px;
margin-top: calc(100% - 100px);
}

.ui-text-small {
font-size:95%;
}

.gutter {
  background-color: #999;
  cursor: ew-resize;
}

.gutter-2 {
  background-color: #999;
  cursor: ew-resize;
}

#split-2{
  z-index:0;
}

.close-button{
  color:white;
  z-index:1000;
  border-radius:50%;
  height:35px;
  width:35px;
  background-color:rgb(35,35,35);
  margin-left:25px;
  margin-top:45px;
  opacity:0.7;
  padding:5px;
  }

  .close-button:hover{
    background-color:rgb(170,100,100);
    opacity:0.9;
  }


#app .search-container .tag-example-search {
  background-color: rgb(170, 70, 70);
  padding: 0px 10px;
  font-size: 1.0em;
  border-radius: 5px;
  cursor: pointer;
  display: inline-block; 
  max-width:100%; 
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis;
  color: white;
  box-shadow: 0rem 2px 15px rgba(0, 0, 0, 0.2) !important;
}
#app .search-container .input-wrapper {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  background-color: rgb(45, 45, 45);
  border-radius: 6px;
  width: 100%;
  box-sizing: border-box;
  font-weight:200;
  padding: 0px 10px;
  height: 50px !important;
  gap: 5px;
  overflow:hidden;
}
.flex-grow.overflow-auto.main-color::-webkit-scrollbar {
  display: none;
}
.flex-grow.overflow-auto.main-color {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
/*   Adaptation for plus-sized monitors */

  @media screen and (min-height: 950px) {
    .height{
  height:calc(100vh - 240px)
}

.split-container-top{
  height:calc(100% - 240px) ;
  width:100%;
  }

.top-links{
  margin-top:180px;
}

.title{
    padding:35px 40px;
  font-size:60px;
}

.top{
  height:240px;
  z-index:1000;
}

h2{
  width:100%;
  font-size:1.3em;
  text-align:left;
  color:white;
  padding-left:0px;
  margin-top:5px;
  margin-bottom:25px;
}

.filter-text{
  font-size:1.2em;
}

.ui-mode {
top: 275px;
}

.ui-overlay {
font-size: 1.3em;
}

#app .map-switch-margin{
  font-size:1.2em
}

#app #filter-interface{
  font-size:110% !important;
  height:40px;
}

#app .tag-example{
  font-size:110% !important;
}

#app #search-interface .tag-example-search{
  font-size:1.5em !important;
  max-height:42px;
}



#app .field-title {
  font-size: 1.2em;
  margin-bottom: 5px;
  color: white;
}

#app .search-container .input-wrapper {
  font-size: 1.3em;
  
  margin-bottom: 5px;
  color: white;
}

#app .search-button {

font-size: 1.5rem !important;
padding: 3px 15px;

}

/* Metadata settings */

#metadata-container{
font-size:120%;
}


#metadata-container .label {
  width:100px;
  color:white;
  font-weight:600;
}

#metadata-container .data {
max-width:200px;
}


#metadata-container .metadata-wide {
  float:left;
 padding-left:25px;;
  color: white;
  width:100%;
  margin-top:20px;
}


#metadata-container ul li {
  float:left;
  list-style-type: none;
  padding: 2px 12px;
  border-radius: 5px;
  background-color: rgb(100, 100, 100); 
}

#app .datareportcard{

  padding:110px 30px 30px 30px;;
}
}
</style>


