<template>
<div>
<div class="top">  
  <h1 class="title">Swedish <br><div class="emph">Rock Art </div><br>Research<br> Archive</h1>
</div>
  <!-- Start of Container -->
  <div class="split-container main-color">
  <div class="flex" style="height:calc(100vh - 230px)">
  <!-- Panel 1 -->
  <div  id="split-0" class="flex-grow flex flex-col justify-between"
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
      <div class="ui-map-info ui-overlay"  v-if="showMap">
        Filter the archive by adjusting the view or select a site
      </div>
    </div>
  </div>
  <!-- Panel 2 -->
  <div id="split-1" class="flex-grow overflow-auto main-color" 
       :class="{ 'w-1/3': showThreePanels, 'w-1/2': !showThreePanels }"
       @click="toggleThreePanels">

  <div class="">
  <div class="">
  
    <MasonryGrid 
      :siteId="selectedId" 
      :siteRaaId="selectedRaaId"
      @items-updated="onItemsUpdated">
    </MasonryGrid>

    <div style="display:flex;  align-items: center; justify-content: center;">
    <div class="ui-mode ui-overlay">
        <div class="item selected">Gallery</div>
        <div class="item">Data</div>
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
    <button @click="toggleThreePanels" class="btn btn-circle m-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
    </button>
</div>
</transition>

<div class="split-container-top"></div>
</div>
</div>
<!-- End of Container -->

</div>
</template>

<script lang="ts">
import Map from '../components/Map.vue'
import { defineComponent } from 'vue'
import Split from 'split.js';
import MasonryGrid from '../components/MasonryGrid.vue'
import Search from "../components/Search.vue"
import AdvancedSearch from "../components/AdvancedSearch.vue";

export default defineComponent({
  components: {
    Map, MasonryGrid, Search, AdvancedSearch
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
      bbox: [],
      showMap: true,
      itemsCount: 0,
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
      this.showThreePanels = !this.showThreePanels;
    },
    onItemsUpdated(itemsLength) {
      this.itemsCount = itemsLength;
    }
  },
})
</script>


<style scoped>
.title{
  line-height:0.80;
  font-size:52px;
  font-weight:600;
  padding:25px 40px;
}

.title .emph{
  display:inline;
  color:rgb(180, 0, 0);
}

.top{
  height:230px;
  z-index:1000;

}

.main-color{
  background-color:rgb(65,65,65);

}

.split-container{
  overflow:hidden !important;
  
}

.split-container-top{
  height:calc(100% - 230px) ;
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
#filter-interface{
  min-height:100px;
  padding:10px 0px 0px 0px;
  color:white;
  z-index:1000;
  margin-left:-5px;
}

.filter-text{
float:left;
 padding: 5px 10px;
 border-radius:5px;
 margin-left:3px;
 margin-bottom:5px;
}

.tag-example{
float:left;
 background-color: rgb(90,90,90);
 padding: 5px 10px;
 border-radius:5px;
 margin-left:10px;
 margin-bottom:5px;

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
z-index: 100;
position:absolute;
border-radius: 10px;
font-size: 18px;
font-weight: 500;
color: white;
background-color: rgba(0, 0, 0, 0.4);
backdrop-filter: blur(5px);
}
.ui-mode {
top: 260px;
padding: 4px 10px 4px 10px;
background-color: rgba(0, 0, 0, 0.4);
}

.ui-mode .item {
cursor: pointer;
display: inline;
padding: 0px 15px 0px 15px;
}

.ui-mode .selected{
font-weight: 500;
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

.gutter {
  background-color: #999;
  cursor: ew-resize;
}

.gutter-2 {
  background-color: #999;
  cursor: ew-resize;
}
</style>


