<template>
<div>
<div class="top" :class="{light: isLight}">  
  <a href="https://shfa.dh.gu.se/" target="_blank">
    <div id="logo"></div>
    <h1 class="title" :class="{light: isLight}">
      <div v-html="$t('message.title')"></div>
    </h1>
  </a>
  <div id="gu-logo-bg">
      <div v-if="currentLanguage === 'sv'" id="gu-logo-sv"></div>
      <div v-else id="gu-logo-en"></div>
      
    </div>
  <button @click="toggleMenu" class="menu-show-button">
   <!--  {{ $t('message.menuButton') }} -->
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
        Svenska 
        
    </div>
    <div v-else class="top-button" key="svenska" @click="toggleLanguage">
        English 
    
    </div>
</transition>

<transition name="flip-fade" mode="out-in">
    <div v-if="currentColour === 'dark'" class="top-button" id='dark-mode' key="dark" @click="toggleColour">
        
    </div>
    <div v-else class="top-button" id='light-mode' key="light" @click="toggleColour">

    </div>
</transition>

    <!-- <div class="top-button">|</div> -->
</div>
  
<About :visibleAbout="visibleAbout" :isLight="isLight" @close="visibleAbout = false" />
  <Guide :visibleGuide="visibleGuide" :isLight="isLight" @close="visibleGuide = false" />
  <div class="top-links">
    <button class="item" @click="visibleGuide=true, isLight=isLight">

          {{ $t('message.sökguide') }}<div class="top-link-infobutton"></div></button>

    <button class="item" @click="visibleAbout=true, isLight=isLight">

          {{ $t('message.aboutArchive') }}<div class="top-link-infobutton" ></div></button>

    <button class="item" @click="" v-if="currentLanguage === 'en'"> 
    
          <a href="https://www.gu.se/en/shfa" target="_blank">{{ $t('message.aboutSHFA') }} <div class="top-link-button" ></div></a> </button>

          <button class="item" @click="" v-else> 
    
    <a href="https://www.gu.se/shfa" target="_blank">{{ $t('message.aboutSHFA') }} <div class="top-link-button" ></div></a> </button>

    <button class="item" @click="" v-if="currentLanguage === 'en'">
   
          <a href="https://www.gu.se/en/shfa/research" target="_blank">{{ $t('message.news') }}<div class="top-link-button" ></div></a></button>

          <button class="item" @click="" v-else>
   
   <a href="https://www.gu.se/shfa/forskning" target="_blank">{{ $t('message.news') }}<div class="top-link-button" ></div></a></button>
</div>
</div> 
<!-- End of main-menu -->
</div>

  <!-- Start of Container -->
  <div class="split-container main-color" :class="{light: isLight}">
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
      :class="{light: isLight}"
      ref="searchRef" />

      <Map
        ref="mapComponent"
        v-show="showMap"
        :coordinates="results"
        :bbox="bbox"
        :class="{light: isLight}"
        @id-selected="selectedId = $event"
        @lamning-selected="selectedLamningId = $event"
        @raa-selected="selectedRaaId = $event"
        @update-bbox="bbox = $event"
        @map-clicked="handleMapClicked"
      ></Map>
      <AdvancedSearch v-show="!showMap" 
        @advanced-search-results="handleAdvancedSearchResults"
        @page-details-updated="updatePageDetails" 
        :currentLang="currentLanguage"
        :updateNextPageUrlAdvanced="updateNextPageUrlAdvanced"
        :updatePreviousPageUrlAdvanced="updatePreviousPageUrlAdvanced" 
        :class="{light: isLight}"
        ref="advancedSearchRef" />
     
  </div>
  <!-- Panel 2 -->
  <div id="split-1" class="flex-grow overflow-auto main-color " 
       v-show="shouldShowPanel1"
       :class="{ 'w-1/3': showThreePanels, 'w-1/2': !showThreePanels, 'light':isLight}"
       >

  <div class="">
  <div class="">
   
  <div v-show="showGallery" :class="{light: isLight}"> 
  <Gallery 
    ref="galleryRef"
    :class="{light: isLight}"
    :siteId="selectedId" 
    :siteLamningId="selectedLamningId"
    :siteRaaId="selectedRaaId"
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
      <div class="ui-results" v-show="showResults" style="width:220px; font-size:0.9em; padding:5px 5px;">
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
      :class="{ 'w-1/3': showThreePanels, 'w-0': !showThreePanels, 'light':isLight}" v-show="showThreePanels">
      <button @click="closeThreePanels" class="close-button" :class="{light: isLight}">
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
import Guide from "../components/Guide.vue";

export default defineComponent({
  components: {
    Map, Gallery, Catalogue, Datareport, Search, AdvancedSearch, ImageViewer, MetaData, About, Guide
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
      if (newValue && !this.shouldShowPanel1) { // Check if on mobile
        const panel = document.getElementById('split-1');
            if (panel) {
              window.scrollTo(0, 400);
            }        
      }
    }
  },
  data() {
    return {
      currentLanguage: 'sv', //currentLanguage: this.detectUserLanguage(),
      windowWidth: window.innerWidth,
      items: [],
      results: [],
      searchItems: [],
      advancedSearchResults: [],
      isMenuOpen: false,
      showThreePanels: false,
      selectedId: null,
      selectedLamningId: null,
      selectedRaaId: null,
      selectedIiifFile: null,
      idForMetaData: null,
      currentPage: 1,
      totalPages: 1,
      totalResults: 0,
      bbox: [],
      showResults: false,
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
      visibleGuide: false,
      mapClicked: false,
      currentColour: 'dark',
      isLight: false,
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
    window.addEventListener('resize', this.updateWindowWidth);

    this.$i18n.locale = this.currentLanguage;
    
    this.currentColour = this.currentColour;

    this.isLight = this.isLight;

    const vm = this;
    const direction = window.innerWidth <= 1024 ? 'vertical' : 'horizontal';

    Split(['#split-0', '#split-1', '#split-2'], {
    sizes: [40, 60, 40],
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
computed: {
  shouldShowPanel1() {
    if (this.windowWidth <= 1024) {
      return !this.showThreePanels;
    }
    return true; // always show on larger screens
  }
},
beforeDestroy() {
  window.removeEventListener('resize', this.updateWindowWidth);
},

  methods: {
   /*  detectUserLanguage() {
      // Extract the first two characters of the browser language setting
      const langCode = navigator.language.substr(0, 2);
      
      // Return 'sv' if the language code is 'sv', otherwise return 'en'
      return langCode === 'sv' ? 'sv' : 'en';
    }, */
    updateWindowWidth() {
      this.windowWidth = window.innerWidth;
    },
    toggleMenu() {
        if (window.innerWidth <= 1024) { // Only toggle if on smaller screens
            this.isMenuOpen = !this.isMenuOpen;
        }
    },
    toggleLanguage() {
        this.currentLanguage = (this.$i18n.locale === 'en') ? 'sv' : 'en';
        this.$i18n.locale = this.currentLanguage;
    },

    toggleColour(){
      this.currentColour = (this.currentColour === 'dark') ? 'light' : 'dark';
      this.isLight=false;
      if (this.currentColour === 'light') {return this.isLight=true};
      
      
    },

    handleMapClicked() {
      this.forceRefresh++;
      this.mapClicked = true;
      this.showResults = true;
      this.$refs.searchRef.clearSearchField();
      this.$refs.advancedSearchRef.clearAdvancedSearchFields();
    },

    updateItems(newItems) {
    this.searchItems = newItems;
    this.selectedId = null; // Reset selectedId
    this.showResults = true;
    this.$refs.advancedSearchRef.clearAdvancedSearchFields();
   
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
      this.showResults = true;
      this.$refs.searchRef.clearSearchField();
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
  margin-left:40px;
  background:url("../assets/shfa_logo_downscale.png");
  background-repeat:no-repeat;
  background-size:contain;
  opacity:0.3;
  transition: all 0.8s ease-in-out;
}

#gu-logo-bg {
  position:absolute;
  right:20px;
  height: 145px;
  width: 165px;
  background: linear-gradient(
    to bottom,
    rgba(40, 40, 40, 1) 0%,
    rgba(40, 40, 40, 0.8) 100%
  );
  border-radius: 0px 0px 5px 5px;
}
@media (max-width: 1024px) {
  #gu-logo-bg {
    display: none;
  }
}

#gu-logo-sv {
  width: 165px;
  height: 145px;
  background: url(../assets/gu_logo_sv.png);
  background-size: 125px 95px;
  background-repeat: no-repeat;
  background-position: center;
}

#gu-logo-en {
  width: 165px;
  height: 145px;
  background: url(../assets/gu_logo.png);
  background-size: 125px 95px;
  background-repeat: no-repeat;
  background-position: center;
}


#dark-mode{
  float:right;
  text-align:left;
  margin-right:10px;
  margin-top:2px;
  height:29px;
  width:29px;
  border-radius:8px;
  background-image:url(../../public/interface/lightmode.png);
  background-size:18px;
  background-position:center;
  background-repeat:no-repeat;
  border-width:1.5px;
  border-color:transparent;
  border-radius:50%;
}

#light-mode{
  float:right;
  text-align:left;
  margin-right:10px;
  margin-top:2px;
  height:29px;
  width:29px;
  border-radius:8px;
  background-image:url(../../public/interface/darkmode.png);
  background-size:16px;
  background-position:center;
  background-repeat:no-repeat;
  border-width:1.5px;
  border-color:transparent;
  border-radius:50%;
}

.menu-show-button{
  display:none;
}

.menu-close-button{
  display:none;
}



/* #logo:hover{
  opacity:0.5;
} */

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

@media (max-width:350px) {
  #logo{
    margin-left:10px;
  }

  .title{
    margin-left:90px;
  }
}

.title .emph{
  cursor:pointer;
  pointer-events:auto;
  display:inline;
  color:rgb(90, 90, 90);
  transition: all 0.8s ease-in-out;
}

.title .aboutemph{
  /* cursor:pointer;
  pointer-events:auto; */
  display:inline;
  color:rgb(120, 135, 150)!important;
}

/* .title .emph:hover{
  display:inline;
 color: rgb(120,135,150);

} */

.top {
  height:160px;
  z-index:1000;
  background-color:rgb(210,210,210)
}

.languages{
right:185px;
font-size:1.2em;
font-weight:400;
color:black;
position:absolute;
padding-right:20px;
margin-top:0px;
cursor: default;
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
  right:201px;
  color:black;
  position:absolute;
  padding-right:0px;
  width:auto;
}

.top-links .item{
margin-right:5px;
border-radius:8px;
padding:5px 8px 5px 8px;
}

.top-links .item:hover{
  background-color:rgb(245,245,245);
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
  cursor: pointer;
}

.top-button:hover{
  background-color:rgb(245,245,245);
}

.top-link-button{
  float:right;
  text-align:left;
  margin-left:7px;
  margin-top:3px;
  height:23px;
  width:23px;
  border-radius:8px;
  background-image:url(../../public/interface/linkbuttonbold.png);
  background-size:22px;
  background-position:center;
  background-repeat:no-repeat;
  border-width:1.5px;
  border-color:black;
  border-radius:50%;
}

.top-link-infobutton{
  float:right;
  text-align:left;
  margin-left:7px;
  margin-top:3px;
  height:23px;
  width:23px;
  border-radius:8px;
  background-image:url(../../public/interface/infobuttonbold.png);
  background-size:22px;
  background-position:center;
  background-repeat:no-repeat;
  border-width:1.5px;
  border-color:black;
  border-radius:50%;
}

.main-color{
  background-color:rgb(65,65,65);

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

.ui-results{
  position:absolute;
  pointer-events:none;
  bottom:23px;
  z-index: 100;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: 500;
  color: white;
  padding: 2px 15px 6px 15px;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
}

@media (min-width: 1025px) {
    .menu-show-button, .menu-close-button {
        display: none;
    }

    .main-menu {
        display: block !important; 
    }
}


/* This controls the menu look on small screens */
@media (max-width: 1024px) {

  .top-links{

  right:15px;

}

  .menu-show-button{
  display:block;
  color:black;
  float:right;
  margin-right:35px;
  margin-top:16px;
  padding:23px;
  border-radius:50%;
  height:30px;
  width:30px;
  background-image:url(../../public/interface/menu.png);
  background-size: 25px 25px;
  background-position:center;
  background-repeat:no-repeat;
  }

  .menu-show-button:hover{
    background-color: white;
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
    height:440px;
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
    width: 350px;
   top:70px;
    padding-right:18px;
  
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

  .top-links .item{
margin-right:5px;
border-radius:8px;
padding:5px 8px 5px 18px;
margin-bottom:5px;
}






.top-link-button{
  float:right;
  text-align:left;
  margin-left:15px;
  margin-top:3px;
  height:40px;
  width:40px;
  border-radius:8px;
  background-image:url(../../public/interface/linkbuttonbold.png);
  background-size:32px;
  background-position:center;
  background-repeat:no-repeat;
  border-width:1.5px;
  border-color:black;
  border-radius:50%;
}

.top-link-infobutton{
  float:right;
  text-align:left;
  margin-left:15px;
  margin-top:3px;
  height:40px;
  width:40px;
  border-radius:8px;
  background-image:url(../../public/interface/infobuttonbold.png);
  background-size:32px;
  background-position:center;
  background-repeat:no-repeat;
  border-width:1.5px;
  border-color:black;
  border-radius:50%;
}

  .top{
    position: relative;
  }

}

/* End of menu style */

@media (max-width:350px) {


  .menu-show-button{
    margin-right:15px;
}
.menu-close-button{

  margin-right:15px;
 
 
  
  }
.languages{
right:10px;
font-size:1.5em;
margin-top:60px;
padding-top:10px;
padding-right:10px;

}


  .top-links{
    width: 350px;
   top:70px;
    padding-right:0px;
  
    float:left;
    padding-left:50px;
    font-size:1.8em;
  }
}

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

  .ui-results{
    position:fixed;
    bottom:23px;
  }
}

.split-container-top{
  height:calc(100% - 160px) ;
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
    padding-right:40px;
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
    padding:0px 35px 0px 35px;
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
    
    padding-right:15px;
    padding-left:25px;
  }
}

@media (max-width: 1024px) {
  #map{
    height: 50vw;
    width: 100%;
    min-height: 450px;
  }
}

@media (max-width: 1024px) {
#split-2 > div.image-viewer {
    height: 400px;
  }
}

@media (max-width:480px) {
  #split-0{
    padding:20px;
}

  #split-1{
    padding:20px;
}
#split-2{
    padding:0px;
    padding-left:5px;
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



.gutter {
  background-color: #999;
  cursor: ew-resize;
}

.gutter-2 {
  background-color: #999;
  cursor: ew-resize;
}

@media (max-width:480px) {
  .gutter {
    display:none;

}

.gutter-2 {
  display:none;

}
}

#split-2{
  z-index:0;
  min-width:420px!important;
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
  width:120px;
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

/* light mode styles */

.light{
background: white;
color:black !important;
}


.light h1{
  color:black !important;
}

.light h2{
  color:rgb(0, 32, 73) !important;
}

.light a{
  color: black;
}

.light td{
  color:black !important;
}


.light #popup{
  background-color: white;
  color: black;
}

.light #popup-content{
  background-color: white;
  color: black;
}

.light #popup-closer{
  color: black;
}

 .light #map {
  /* filter: hue-rotate(160deg) grayscale(30%); */

  box-shadow: 0px 3px 35px rgba(0, 0, 0, 0.3)!important;

}





.light #metadata-container{
  color: black;
}

.light #search-interface{
  color:black;
  border-color:black;
}

.light #search-button{
  background-color: black;
  border-color: black;
}

.light #search-suggestion{
  background-color: rgb(237, 234, 234);
  border-color: black !important;
  color:black;
}


.light #search-suggestion:hover{
  background-color: rgb(80,90,100);
  border-color: black;
  color:white !important;
}


.light #search-selected{
  /* background-color: rgb(110, 148, 185);  */
  border-color: black !important;
  color:white;
}
.light #visit{
  background-color: rgb(37, 35, 35);
filter:invert(1)
}

.light #visit:hover{
  background-color: rgb(110, 148, 185);
  filter: invert(0);
  border-color: black;
  color:black !important;
}

.light #search{
  background:transparent;
  color: black !important;
}


.light input{
  color: black !important;
  font-weight:400;
  background-color:transparent;
}

.light #search-wrapper{
  background:linear-gradient(rgb(227, 224, 224) 0%, rgb(247, 244, 244) 100%);
  color: black !important;
}


.light #filter-interface{
  color: black !important;
}

.light input[type="search"]::placeholder {
  color: black;
  background-color: transparent;
}
.light input[type="search"]{
  color: black;
  background-color: transparent;
}

.light #app{
  background-color: rgb(247, 244, 244);
}


.light #gallery{
  background:linear-gradient(rgba(255, 255, 255, 0.25) 30%, rgba(255, 254, 254, 0.7) 100%)
}

.light #text-wrapper{
  background:linear-gradient(rgb(237, 234, 234) 0%, rgb(247, 244, 244) 100%);

}


.light #disclaimer{
  color:rgb(110, 148, 185);
}

.light #description{
  color:black;
}

.light #block-text{
  color:black;
  background-color: linear-gradient(120deg, #ffffff 10%, rgba(255, 255, 255, 0.95) 30%);
}

.light #search-text{
  color:black;
  background-color: linear-gradient(120deg, #ffffff 10%, rgba(255, 255, 255, 0.95) 30%);
}


.light .split-container-top{
  box-shadow: inset 0rem 2rem 2rem rgba(0, 0, 0, 0.2)!important;
  height:calc(100% - 160px);
}

.light .search-container .tag-example-search {
  background-color: rgb(80,90,100)!important;
 
  border-radius: 2px!important;
  cursor: pointer;
  display: inline-block; 
  max-width:100%; 
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis;
  color: black!important;
  box-shadow: 0rem 2px 15px rgba(0, 0, 0, 0.2) !important;
}

.light .title{
  color:rgb(150, 150, 150)!important;
  background-color:transparent;
}

.light .top{
background-color: rgb(210,210,210)!important;
}

.light #label-wrapper{
  color:black;
}

.light .search-button-round{
  background-color:rgb(150, 150, 150)!important;
}

.light .search-button-round:hover{
  background-color:rgb(120, 120, 120)!important;
}

.light .close-button{
  background-color:rgb(65,65,65)!important;
  color:white!important;
}

.light .suggestions{
  background-color:rgb(235,235,235)!important;
  color:white!important;
}

.light .ui-overlay {
font-weight: 600;
color: black;
background-color: rgba(255, 255, 255, 0.5);

}

.light .ui-mode .item:hover {
  color: rgb(100,125,150);
}

.light .ui-overlay .selected{
  color: rgb(100,125,150);
}

.light .item.active {
  color: rgb(100,155,220);
  font-weight: 600;
}

.light #logo{
  background-color:grey;
  float:left;
  margin-top:30px;
  margin-left:40px;
  background:url("../assets/shfa_logo_downscale.png");
  background-repeat:no-repeat;
  background-size:contain;
  opacity:0.3;
  transition: all 0.8s ease-in-out;
}








</style>


