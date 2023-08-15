<template>
<div>
<div class="top">  
  <div id="logo"></div>
  <h1 class="title"><div v-html="$t('message.title')"></div></h1>

  <button @click="toggleMenu" class="menu-show-button">
      Menu  
  </button> 

<!-- This controls the menu on small screens -->
  <div class="main-menu" v-show="isMenuOpen">
    <button @click="toggleMenu" class="menu-close-button">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-15 w-15" fill="none" viewBox="0 0 25 30" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
    </button> 
  <div class="languages">
    <div class="version">Version 1.0</div>
    
 <transition name="flip-fade" mode="out-in">
    <div v-if="currentLanguage === 'en'" class="top-button" key="english" @click="toggleLanguage">
        English 
        
    </div>
    <div v-else class="top-button" key="svenska" @click="toggleLanguage">
        Svenska 
    
    </div>
</transition>

    <!-- <div class="top-button">|</div> -->
</div>
  
  <About :visibleAbout="visibleAbout" @close="visibleAbout = false" />
  <div class="top-links">
    
    <button class="item" @click="visibleAbout=true">

          {{ $t('message.aboutArchive') }}<div class="top-link-button" ></div></button>

    <button class="item" @click="">
    
          <a href="https://www.gu.se/forskning/shfa-svenskt-hallristningsforskningsarkiv">{{ $t('message.aboutSHFA') }} <div class="top-link-button" ></div></a> </button>

    <button class="item" @click="">
   
          <a href="https://www.gu.se/forskning/shfa-svenskt-hallristningsforskningsarkiv">{{ $t('message.news') }}<div class="top-link-button" ></div></a></button>
</div>
</div> 
<!-- End of main-menu -->
</div>

  <!-- Start of Container -->
  <div class="split-container main-color">
  <div class="flex height">
  <!-- Panel 1 -->
  <div  id="split-0" class="flex-grow flex flex-col "
       :class="{ 'w-1/3': showThreePanels, 'w-1/2': !showThreePanels }">
       
      <Search 
      @toggle-map="toggleMap" 
      @search-completed="updateItems"
      @page-details-updated="updatePageDetails" 
      :updateNextPageUrl="updateNextPageUrl" 
      :updatePreviousPageUrl="updatePreviousPageUrl"
      ref="searchRef" />

      <Map
        ref="mapComponent"
        v-show="showMap"
        :coordinates="results"
        :bbox="bbox"
        @id-selected="selectedId = $event"
        @lamning-selected="selectedLamningId = $event"
        @update-bbox="bbox = $event"
        @map-clicked="handleMapClicked"
      ></Map>
      <AdvancedSearch v-show="!showMap" 
        @advanced-search-results="handleAdvancedSearchResults"
        @page-details-updated="updatePageDetails" 
        :updateNextPageUrlAdvanced="updateNextPageUrlAdvanced"
        :updatePreviousPageUrlAdvanced="updatePreviousPageUrlAdvanced" 
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
    ref="galleryRef"
    :siteId="selectedId" 
    :siteLamningId="selectedLamningId"
    @image-clicked="onImageClicked"
    @page-details-updated="updatePageDetails"
    :searchItems="searchItems"
    :forceRefresh="forceRefresh"

    :fetchNextPage="fetchNextPage"
    :searchNextPageUrl="nextPageUrl"

    :advancedSearchResults="advancedSearchResults"
    :fetchNextPageAdvanced="fetchNextPageAdvanced"
    :searchNextPageUrlAdvanced="nextPageUrlAdvanced"

    :searchFetchPreviousPage="fetchPreviousPage"
    :searchPreviousPageUrl="previousPageUrl"

    :advancedFetchPreviousPage="fetchPreviousPageAdvanced"
    :advancedPreviousPageUrl="previousPageUrlAdvanced"
    >
  </Gallery>
</div>

<div v-if="showCatalogue" @click="toggleThreePanels">
    <Catalogue 
      :siteId="selectedId" 
      :siteLamningId="selectedLamningId"
      @items-updated="onItemsUpdated"
      @image-clicked="onImageClicked">
    </Catalogue>
  </div>

  <div v-if="showDatareport">
    <Datareport>
    </Datareport>
  </div>


    <div style="display:flex; align-items: center; justify-content: center;">
   <!--  <div class="ui-mode ui-overlay" style="min-width:240px; display:flex; align-items: center; justify-content: center;">
        <button class="item" v-bind:class="{ selected: showGallery}" v-on:click="showGallery = true; showCatalogue = false; showDatareport = false; ">
        {{ $t('message.galleri') }}
        </button>
        <button class="item" v-bind:class="{ selected: showCatalogue}" v-on:click="showCatalogue = true; showGallery = false; showDatareport = false; ">
        {{ $t('message.katalog') }}
        </button>
        <button class="item" v-bind:class="{ selected: showDatareport}" v-on:click="showDatareport = true; showCatalogue = false; showGallery = false; ">
          Data
        </button>
      </div> -->
      <div class="ui-numbers ui-overlay" style="bottom:23px; width:220px; font-size:0.9em; padding:5px 5px;">
        <p style="font-size:1.4em; line-height:1.1; font-weight:400;"> {{ $t('message.resultat') }}: <p style="color:rgb(200,225,250); display:inline;"> {{ totalResults }}</p></p>
         ({{ $t('message.sida') }} {{ currentPage }} {{ $t('message.av') }} {{ totalPages }}) 
      </div> 

      
     
    </div>
  </div>
 
</div>
</div>

<!-- Panel 3 -->
<transition name="slide">
<div id="split-2" class="flex-grow main-color overflow-auto"
      :class="{ 'w-1/3': showThreePanels, 'w-0': !showThreePanels }" v-show="showThreePanels">
      <button @click="closeThreePanels" class="close-button">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 20 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
    </button>

    <ImageViewer :iiifFile="selectedIiifFile"/>
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
import MetaData from "../components/MetaData.vue";
import About from "../components/About.vue";

export default defineComponent({
  components: {
    Map, Gallery, Catalogue, Datareport, Search, AdvancedSearch, ImageViewer, MetaData, About
  },
  watch: {
    $route(to, from) {
      const newSiteId = to.params.siteId;
      const newIiifFile = to.params.iiifFile;
      const idForMetaData = to.params.idForMetaData;
      if (newSiteId) {
        this.selectedId = newSiteId;
      }
      if (newIiifFile) {
        this.selectedIiifFile = newIiifFile;
        this.showThreePanels = true;
      }
      if (idForMetaData) {
        this.idForMetaData = idForMetaData;
      }
      if (to.name === 'Home' && !newSiteId && !newIiifFile && !idForMetaData) {
        this.$refs.galleryRef.loadStartPage();
      }
    },
    selectedId(newId, oldId) {
    if (newId) {
      this.$router.push({ name: 'Site', params: { siteId: newId } });
      
      fetch(`https://diana.dh.gu.se/api/shfa/geojson/site/?id=${newId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          const coordinates = data.features[0].geometry.coordinates;
          if (!this.mapClicked)
          {
            this.$refs.mapComponent.focusOnCoordinates(...coordinates);
          }
        })
        .catch(e => {
          console.error('Failed to fetch new site coordinates:', e);
        });
    }
  },
    selectedIiifFile(newIiifFile, oldIiifFile) {
      if(this.selectedId === null) {  // When there's no site id
        // Only change the URL, but not the history
        this.$router.replace({ 
          name: 'IiifFileMetaDataWithoutSite', 
          params: { 
            iiifFile: newIiifFile, 
            idForMetaData: this.idForMetaData,
          } 
        });
      } else {
        this.$router.replace({ 
            name: 'SiteWithIiifFile', 
            params: { 
              siteId: this.selectedId, 
              iiifFile: newIiifFile, 
              // showThreePanels: this.showThreePanels.toString() 
            } 
          });  }
   },
    idForMetaData(newMeta, oldMeta) {
      if(this.selectedId === null) {  // When there's no site id
        // Only change the URL, but not the history
        this.$router.replace({ 
          name: 'IiifFileMetaDataWithoutSite', 
          params: { 
            iiifFile: this.selectedIiifFile,
            idForMetaData: newMeta, 
          } 
        });
      } else {
      // Only change the URL, but not the history
        this.$router.replace({ 
          name: 'SiteWithIiifFileMetaData', 
          params: { 
            siteId: this.selectedId,
            iiifFile: this.selectedIiifFile,
            idForMetaData: newMeta, 
          } 
        });  }
    },
    showThreePanels(newValue) {
      const gutter = document.querySelector('.gutter:not(.gutter-2)') as HTMLElement;
      if (gutter) {
        gutter.style.display = newValue ? 'block' : 'none';
      }
    }
  },
  data() {
    return {
      currentLanguage: 'en',
      items: [],
      results: [],
      searchItems: [],
      advancedSearchResults: [],
      isMenuOpen: true,
      showThreePanels: false,
      selectedId: null,
      selectedLamningId: null,
      selectedIiifFile: null,
      idForMetaData: null,
      currentPage: 1,
      totalPages: 1,
      totalResults: 0,
      bbox: [],
      showMap: true,
      showGallery: true,
      showCatalogue: false,
      showDatareport: false,
      nextPageUrl: null,
      nextPageUrlAdvanced: null,
      previousPageUrl: null,
      previousPageUrlAdvanced: null,
      forceRefresh: 0,
      visibleAbout: false,
      mapClicked: false,
    }
  },
beforeRouteEnter(to, from, next) {
  const siteId = to.params.siteId;
  const iiifFile = to.params.iiifFile;
  const idForMetaData = to.params.idForMetaData; 
  next(vm => {
    if (siteId) {
      vm.selectedId = siteId;
    }
    if (iiifFile) {
      // convert the URL-encoded iiifFile back to a string
      vm.selectedIiifFile = decodeURIComponent(iiifFile);
      vm.showThreePanels = true;
    }
    if (idForMetaData ) {
      vm.idForMetaData = idForMetaData;
    }
  });
},
  mounted() {
    const vm = this;
    const direction = window.innerWidth < 768 ? 'vertical' : 'horizontal';

    Split(['#split-0', '#split-1', '#split-2'], {
    minSize: [500, 300],
    direction: direction,
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
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen; // Toggle the menu state
    },
     toggleLanguage() {
        this.currentLanguage = (this.$i18n.locale === 'en') ? 'sv' : 'en';
        this.$i18n.locale = this.currentLanguage;
    },
    handleMapClicked() {
      this.forceRefresh++;
      this.mapClicked = true;
    },

    updateItems(newItems) {
    this.searchItems = newItems;
    this.selectedId = null; // Reset selectedId
   
    this.$router.push({ 
      name: 'Search', 
    });
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
      const fileSegment = iiifFile.split('iiif/')[1]; 
      if(fileSegment){
          this.selectedIiifFile = fileSegment; 
      } else {
          console.error('Invalid IIIF File URL');
      }
      this.idForMetaData = id;
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
      this.selectedId = null; // Reset selectedId
   
      this.$router.push({ 
        name: 'Search', 
      });
    },
    fetchPreviousPage() {
      this.$refs.searchRef.fetchPreviousPage();
    },
    updatePreviousPageUrl(url) {
      this.previousPageUrl = url;
    },
    fetchPreviousPageAdvanced() {
      this.$refs.advancedSearchRef.fetchPreviousPage();
    },
    updatePreviousPageUrlAdvanced(url) {
      this.previousPageUrlAdvanced = url;
    },
    updatePageDetails({ currentPage, totalPages, totalResults }) {
      this.currentPage = currentPage;
      this.totalPages = totalPages;
      this.totalResults = totalResults;
    }
  },
});
</script>


<style>
.flip-fade-enter-active, .flip-fade-leave-active {
    transition: transform 0.15s, opacity 0.15s;
}
.flip-fade-enter, .flip-fade-leave-to {
    transform: rotateY(90deg);
    opacity: 0;
}
.flip-fade-leave, .flip-fade-enter-to {
    transform: rotateY(0deg);
    opacity: 1;
}

#logo{
  width:110px;
  height:100px;
  background-color:grey;
  float:left;
  margin-top:30px;
  margin-left:25px;
  background:url("../assets/shfa_logo_downscale.png");
  background-repeat:no-repeat;
  background-size:contain;
  opacity:0.3;
  transition: all 0.8s ease-in-out;
}

.menu-show-button{
  display:none;
}

.menu-close-button{
  display:none;
}

@media (max-width:480px) {
  #logo{
    width: 30%;
    height: 30%;
  }
}

#logo:hover{
  opacity:0.5;
}

.height{
  height:calc(100vh - 160px)
}

.title{
  position:absolute;
  pointer-events:none;
  font-family: 'Teko', sans-serif;
  line-height:0.75;
  letter-spacing:-1.2px;
  font-size:35px;
  font-weight:400;
  margin-left:120px;
  padding:30px 40px;
  color:rgb(150, 150, 150);
}

@media (max-width:480px) {
  .title{
    margin-left: 20%;
    font-size: 30px;
  }
}

.title .emph{
  cursor:pointer;
  pointer-events:auto;
  display:inline;
  color:rgb(90, 90, 90);
  transition: all 0.8s ease-in-out;
}

.title .emph:hover{
  display:inline;
  color: rgb(120,135,150);

}

.top{
  height:160px;
  z-index:1000;
  background-color:rgb(210,210,210)
}

.languages{
right:0px;
font-size:1.2em;
font-weight:400;
color:black;
position:absolute;
padding-right:20px;
margin-top:0px;
}

.version{
font-size:15px; 
text-align:right; 
margin-right:9px;
margin-top:10px;
}

.top-links{
  font-size:1.2em;
  font-weight:400;
  margin-top:110px;
  height:auto;
  right:0px;
  color:black;
  position:absolute;
  padding-right:0px;
  width:auto;
}

.top-links .item{
margin-right:20px;
border-radius:8px;
padding:5px 0px 0px 10px;;
}

.top-links .item:hover{
background-color:white;
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

.top-button{
  float:right;
  text-align:left;
  margin-left:0px;
  padding:3px 10px 3px 10px;
  border-radius:8px;
}

.top-button:hover{
  background-color:rgb(250,250,250);
}

.top-link-button{
  float:right;
  text-align:left;
  margin-left:10px;
  padding:3px 35px 3px 0px;
  height:32px;
  border-radius:8px;
  background-image:url(../../public/interface/linkbutton.png);
  background-size:27px;
  background-position:0px 0px;
  background-repeat:no-repeat;
}

.main-color{
  background-color:rgb(65,65,65);

}

/* This controls the menu look on small screens */

@media (max-width: 700px) {

  .menu-show-button{
    display:block;
  color:black;
  float:right;
  margin-right:27px;
  margin-top:15px;
font-size:20px;
  }

  .menu-show-button:hover{
    background-color: rgb(80,90,100);
    opacity:1.0;
  }

.menu-close-button{
  display:block;
  color:black;
  float:right;
  border-radius:50%;
  height:45px;
  width:45px;
  background-color:none;
  margin-right:35px;
  margin-top:15px;
  opacity:1.0;
  padding:4px;
 
  
  }

  .menu-close-button:hover{
    background-color: white;
    opacity:1.0;
  }

  .main-menu{ 
    display: block;
    width:100%;
    position:absolute;
    background-color:rgba(240,240,240,0.9);
    height:390px;
    box-shadow: 0rem 2rem 2rem rgba(0, 0, 0, 0.3)!important;
    backdrop-filter:blur(8px);
  }
  
  .languages{
right:20px;
font-size:1.5em;
margin-top:60px;
padding-top:10px;
padding-right:20px;

}

.version{
font-size:18px; 
text-align:right; 
margin-right:9px;

}

  .top-links{
    width: 400px;
   top:70px;
    padding-right:0px;
    float:left;
    padding-left:50px;
    font-size:1.8em;
  }

  .item{
    text-align:right;
    float:right;
    display:block;
    padding-bottom:10px;
  }

  .top-link-button{
  float:right;
  text-align:right;
  margin-left:10px;
  height:50px;
  padding:3px 15px 3px 58px;
  border-radius:8px;
  background-image:url(../../public/interface/linkbutton.png);
  background-size:37px;
  background-position:8px 4px;
  background-repeat:no-repeat;
}

  .top{
    position: relative;
  }
}

/* End of menu style */

.split-container{
  overflow:hidden !important;
}

@media (max-width: 1024px) {
  .flex.height {
    flex-direction: column;
    height: auto;
  }

  .split-container{
    display: flex;
    flex-direction: column;
  }
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

@media (max-width: 1024px) {
  #split-1 > div > div > div:nth-child(2) > div.ui-mode.ui-overlay {
    position: absolute;
    top: 0.5%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

@media (max-width: 1024px) {
  #split-0{
    min-width: 100% !important;
  }
}

#split-0::-webkit-scrollbar {
    width: 0px !important;
    }

#split-1{
  padding:0px 15px 0px 15px;
}

@media (max-width: 1024px) {
  #split-1{
    width: 100% !important;
    position: relative;
    overflow: visible;
  }
}

#split-1::-webkit-scrollbar {
    width: 0px !important;
    }

    #split-2::-webkit-scrollbar {
    width: 0px !important;
    }

@media (max-width: 1024px) {
  #split-2{
    width: 100% !important;
  }
}

@media (max-width: 1024px) {
  #map{
    height: 50vw;
    width: 100%;
  }
}

@media (max-width: 1024px) {
#split-2 > div.image-viewer {
    height: 400px;
  }
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
  background-color: rgb(80,90,100);
  color:white;
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
  background: url(../../public/interface/input-cancel-x.svg) no-repeat 50% 50%;
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
top: 190px;
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
  color: rgb(200,225,250);
}

.ui-mode .selected{
  color: rgb(200,225,250);
}

.ui-numbers {
  padding: 2px 15px 6px 15px;
  text-align: center;
  bottom: 30px;
  margin-top: calc(100% - 100px); 
  pointer-events:none;
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
  background-color:rgba(65,65,65, 0.9);
  margin-left:27px;
  margin-top:45px;
  opacity:1.0;
  padding:5px;
 border-width:1px;
  border-style:solid;
  border-color:rgb(45,45,45);
  }

  .close-button:hover{
    background-color: rgb(80,90,100);
    opacity:1.0;
  }


#app .search-container .tag-example-search {
  background-color: rgb(80,90,100);
  padding: 0px 10px;
  font-size: 1.0em;
  font-weight:400;
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
  height: 40px !important;
  gap: 3px!important;
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




.split-container-top{
  height:calc(100% - 160px) ;
  width:100%;
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

#app .search-container .input-wrapper {
  height: 50px !important;
  gap: 5px!important;
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


