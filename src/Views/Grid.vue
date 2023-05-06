<template>
<div>
<div class="top">  
  <h1 class="title">Swedish <br><div class="emph">Rock Art </div><br>Research<br> Archive</h1>
</div>
  <!-- Start of Container -->
  <div class="split-container main-color">
  <div class="flex" style="height:calc(100vh - 200px)">
  <!-- Panel 1 -->
  <div  id="split-0" class="flex-grow flex flex-col "
       :class="{ 'w-1/3': showThreePanels, 'w-1/2': !showThreePanels }">
       
      <Search @toggle-map="toggleMap" />
      <Map
        v-show="showMap"
        :coordinates="results"
        :bbox="bbox"
        @id-selected="selectedId = $event"
        @raaId-selected="selectedRaaId = $event"
        @update-bbox="bbox = $event"
      ></Map>
      <AdvancedSearch v-show="!showMap"/>

      <div style="display:flex;  align-items: center; justify-content: center;">
      <div class="ui-map-info ui-overlay ui-text-small"  v-if="showMap">
        Filter the archive by adjusting the view or select a site
      </div>
    </div>
  </div>
  <!-- Panel 2 -->
  <div id="split-1" class="flex-grow overflow-auto main-color" 
       :class="{ 'w-1/3': showThreePanels, 'w-1/2': !showThreePanels }"
       >

  <div class="">
  <div class="">

   
    <div v-if="showGallery" @click="toggleThreePanels">
    <Gallery 
      :siteId="selectedId" 
      :siteRaaId="selectedRaaId"
      @items-updated="onItemsUpdated"
      @image-clicked="onImageClicked">
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
          Datareport
        </button>
      </div>
      <div class="ui-numbers ui-overlay">
        {{ itemsCount }} objects
      </div>
    </div>
  </div>
 
</div>
</div>

<!-- Panel 3 -->
<transition name="slide">
<div id="split-2" class="flex-grow main-color"
      :class="{ 'w-1/3': showThreePanels, 'w-0': !showThreePanels }" v-show="showThreePanels">
      <button @click="closeThreePanels" class="close-button">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
    </button>

    <ImageViewer :iiifFile="selectedIiifFile" />

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



export default defineComponent({
  components: {
    Map, Gallery, Catalogue, Datareport, Search, AdvancedSearch, ImageViewer
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
      showThreePanels: false,
      selectedId: null,
      selectedRaaId: null,
      selectedIiifFile: null,
      bbox: [],
      showMap: true,
      itemsCount: 0,
      showGallery: true,
      showCatalogue: false,
      showDatareport: false,
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
    onItemsUpdated(itemsLength) {
      this.itemsCount = itemsLength;
    },
    onImageClicked(iiifFile) {
      this.selectedIiifFile = iiifFile;
    },
  },
});

  

</script>


<style scoped>
.title{
  font-family: 'Teko', sans-serif;
  line-height:0.75;
  letter-spacing:-1.2px;
  font-size:52px;
  font-weight:400;
  padding:25px 40px;
 color:rgb(140, 140, 140);
 
}

.title .emph{
  display:inline;
  color:rgb(140, 60, 60);
}

.top{
  height:200px;
  z-index:1000;

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
  box-shadow: inset 0rem 2rem 2rem rgba(0, 0, 0, 0.4)!important;
  pointer-events:none;
}

#split-0{
padding:30px 15px 35px 40px;

}

#split-1{
padding:0px 15px 0 15px;

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
font-size: 18px;
font-weight: 500;
color: white;
background-color: rgba(0, 0, 0, 0.4);
backdrop-filter: blur(5px);
}
.ui-mode {
top: 230px;
padding: 4px 10px 4px 10px;
background-color: rgba(0, 0, 0, 0.4);
}

.ui-mode .item {
cursor: pointer;
display: inline;
font-weight: 400;
padding: 0px 15px 0px 15px;
}

.ui-mode .item:hover {
  color: rgb(150,200,255);
}

.ui-mode .selected{
font-weight: 400;
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
</style>


