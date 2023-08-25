<template>
      <div class="guide-container" v-bind:class="{fullopacity: visibleGuide}">
        <div class="flex-machine">
    
          <div class="rows">
    
            <div class="content">
    
            <div class="logo-area">
            <div id="logo"></div>
            <h1 class="title">
        <div v-html="$t('message.abouttitle')"></div>
      </h1>
    </div>

    <div class="guide-article-main" style="margin-bottom: 0px; margin-top:30px;"  v-bind:class="{fullopacityui: visibleGuide}"> 
      <h2>{{ $t('message.sökguide') }}</h2>
    </div>

    <div class="guide-article-main" style="padding-top:0px;"  v-bind:class="{fullopacityui: visibleGuide}"  >{{ $t('search.searchintro') }} {{ $t('search.searchhelp') }}</div>
   
    <div class="guide-article-sub"  v-bind:class="{fullopacityui: visibleGuide}"  >
      <div class="sections"> <!-- Empty div for margin -->
        <h2>{{ $t('message.nyckelord') }}</h2>
        <div class="first">
        
      <table><th scope="rowgroup">{{ $t('search.documentation') }}</th>
        <tr v-for="(value,key) in Object.fromEntries(Object.entries(this.$i18n.messages.en.keywords).slice(0,6))" :key="key"><td>{{ $t('keywords.'+key) }}</td></tr>
      </table>
      <table><th scope="rowgroup">{{ $t('search.environment') }}</th>
        <tr v-for="(value,key) in Object.fromEntries(Object.entries(this.$i18n.messages.en.keywords).slice(6,10))" :key="key"><td>{{ $t('keywords.'+key) }}</td></tr>
        </table>

        <table><th scope="rowgroup">{{ $t('search.description') }}</th>
        <tr v-for="(value,key) in Object.fromEntries(Object.entries(this.$i18n.messages.en.keywords).slice(10,19))" :key="key"><td>{{ $t('keywords.'+key) }}</td></tr>
      </table>
      <table><th scope="rowgroup">{{ $t('search.type') }}</th>
        <tr v-for="(value,key) in Object.fromEntries(Object.entries(this.$i18n.messages.en.keywords).slice(19,25))" :key="key"><td>{{ $t('keywords.'+key) }}</td></tr>
        </table>
        <table><th scope="rowgroup">{{ $t('search.natural') }}</th>
        <tr v-for="(value,key) in Object.fromEntries(Object.entries(this.$i18n.messages.en.keywords).slice(25,29))" :key="key"><td>{{ $t('keywords.'+key) }}</td></tr>
      </table>
      <table><th scope="rowgroup">{{ $t('search.humans') }}</th>
        <tr v-for="(value,key) in Object.fromEntries(Object.entries(this.$i18n.messages.en.keywords).slice(29,49))" :key="key"><td>{{ $t('keywords.'+key) }}</td></tr>
        </table>

        <table><th scope="rowgroup">{{ $t('search.animals') }}</th>
        <tr v-for="(value,key) in Object.fromEntries(Object.entries(this.$i18n.messages.en.keywords).slice(49,63))" :key="key"><td>{{ $t('keywords.'+key) }}</td></tr>
      </table>
      <table><th scope="rowgroup">{{ $t('search.ships') }}</th>
        <tr v-for="(value,key) in Object.fromEntries(Object.entries(this.$i18n.messages.en.keywords).slice(63,73))" :key="key"><td>{{ $t('keywords.'+key.replace('.','_')) }}</td></tr>
        </table>
        <table><th scope="rowgroup">{{ $t('search.weapons') }}</th>
        <tr v-for="(value,key) in Object.fromEntries(Object.entries(this.$i18n.messages.en.keywords).slice(73,82))" :key="key"><td>{{ $t('keywords.'+key) }}</td></tr>
      </table>
      <table><th scope="rowgroup">{{ $t('search.other') }}</th>
        <tr v-for="(value,key) in Object.fromEntries(Object.entries(this.$i18n.messages.en.keywords).slice(82,117))" :key="key"><td>{{ $t('keywords.'+key) }}</td></tr>
        </table>
    </div>
    <div class="second">
        <h2>{{ $t('message.bildtyp') }}</h2>
      <table>
        <tr v-if="$i18n.locale === 'en'" v-for="(value,key) in this.$i18n.messages.en.imgdescription" :key="key"><td>{{ value[0]}}</td><td>{{ value[1] }}</td></tr>
        <tr v-else v-for="(value,key_sv) in this.$i18n.messages.sv.imgdescription" :key="key_sv"><td>{{ value[0]}}</td><td>{{ value[1] }}</td></tr>
        </table></div>

        <div class="third">
        <h2>{{ $t('message.datering') }}</h2>
      <table>
        <tr v-for="(value,key) in Object.fromEntries(Object.entries(this.$i18n.messages.en.keywords).slice(137))" :key="key"><td>{{ $t('keywords.'+key) }}</td></tr>
        </table></div>

  </div>
    </div>
</div>
      <button @click="$emit('close')" style="padding:30px;">
              <div class="p-1 px-2 clickable category-button" style="width:auto; padding:5px 15px; text-align: center; cursor: pointer;"  v-bind:class="{fullopacityui: visibleGuide}">{{$t('message.close')}}</div>
            </button>    
       
  </div>
  </div>
  </div>

</template>

<script lang="ts">
  export default {
    name: "guideview",
    emits: ['close'],
    props: {
      visibleGuide: {
        type: Boolean,
        required: true,
      },
    },

  };


  </script>
  
  <style scoped>
  body{
    /* border:opx; */
  }
  table{

  }
  th{
    padding-top:20px;
  }

  td{
    padding-left:15px;
    padding-right:5px;
    
  }
  a{
    color:rgb(156, 201, 247);
    font-weight: 400;
  }
  h2{
    font-size:125%;
    font-style:bold;
    margin-top: -10px;
    margin-bottom:5px;
    color: rgb(200,225,250)!important;
    font-weight: 500;
    line-height: 1.5;
  }

  .guide-article-sub h2{
    font-size:115%;
  }



  .guide-container {
    position:fixed;
    height: 100vh !important; /* Safari Fix */
    color: white;
    line-height: 1;
    width: 100%;
    font-size: 12px;
    z-index: 4000;
    backdrop-filter:blur(5px);
    pointer-events:none;
    transform:scale(1.5);
    translate: 0px 100px;
    transition: all 0.5s ease-in-out;
    opacity:0.0;
    height: calc(100% - 80px);
    overflow-y:auto;
    max-height:max-content;
    /*background: linear-gradient(120deg, rgb(205, 210, 214) 0%, rgba(177, 189, 202, 0.856) 30%)*/;
    background: linear-gradient(120deg, rgb(50, 50, 50) 10%, rgba(65, 65, 65, 0.95) 30%);
  
  }
  
  .logo-area{
    margin-top:80px;
  }
  
  #logo{
    position:relative;
    width:210px;
    height:200px;
    background-color:white;
    float:left;
    margin-left:80px;
    background:url("../assets/shfa_logo_downscale_light.png");
    background-repeat:no-repeat;
    background-size:contain;
    opacity:0.7;
    transition: all 0.8s ease-in-out;
  }
  
  .title{
    float:left;
    position:relative;
    pointer-events:none;
    font-family: 'Teko', sans-serif;
    line-height:0.75;
    letter-spacing:-1.2px;
    margin-top:10px;
    font-size:65px;
    font-weight:400;
    margin-left:0px;
    padding-left:30px;
    color:rgb(190, 190, 190);
  }
  
  .title .emph:hover{
    display:inline;
    color: rgb(120,135,150);
  }
  

  .flex-machine{
    height:100%;
    display:flex;
    flex-direction:column;
  }
  
  
  .sections{
    float:left;
  }
  .first{
    width: 100%;
    columns: 5;
    column-gap: 50px;
    margin-bottom: 30px;
  }
  .second{
    width:100%;
    margin-bottom: 30px;
  }
  .third{
    width:100%;
    margin-bottom: 30px;
  }
  
  .rows{
    display:flex;
      flex-direction:column;
      align-items:center;
      justify-content: start;
      width:auto;  
    }
  
  
  
  .guide-main-title {
      font-family: 'Teko', sans-serif;
      margin-top:10px;
      flex-basis:auto;
      width:100%;
      font-size: 4em;
      line-height: 0.85;
      font-weight: 100;
      letter-spacing:-0.2px;
      text-align: center;
      color:rgba(245,245,245,0.8);
      margin-bottom:15px;
      transition: all 0.4s ease-in-out;
    }
  
  .guide-sub-title {
    font-family: 'Teko', sans-serif;
      margin-top: 2px;
      flex-basis:auto;
      width:100%;
      font-size: 2.5em;
      line-height: 0.9;
      font-weight: 100;
      letter-spacing: -0.2rem;
      text-align: center;
      color:whitesmoke;
      opacity:0.0;
      margin-bottom:20px;
      transition: all 0.4s ease-in-out;
    }
  
  .guide-article-main{

    position:relative;
   float:left;
   text-align:justify;
   color:white;
   width:100%;
   columns:1;
   column-gap:30px;
   max-width:1800px;
   font-size:1.8em;
   font-weight: 300;
   line-height: 1.4;
   opacity:0.0;
   padding:0px 100px;
   transition: all 0.4s ease-in-out;
   margin-bottom: 30px;
  }
  
  .guide-article-sub{
    position:relative;
    float:left;
    text-align:justify;
    color:white;
    width:100%;
    padding:30px 100px;
    columns:1;
    column-gap:20px;
    font-size:1.6em;
    font-weight: 300;
    opacity:0.0;
    transition: all 0.4s ease-in-out;
    line-height: 1.4;
  }
  
  .category-button{
    position:relative;
    float:left;
    font-size:2em;
    font-weight:400;
    transition: all 0.4s ease-in-out;
    background-color:rgb(80,90,100);
    padding:8px 20px !important;
    z-index:1000;
    opacity:1.0;
    margin-bottom:50px;
    border-radius: 5px;
    box-shadow: 0rem 2px 15px rgba(0, 0, 0, 0.2) !important;
  }


  
  
  @media screen and (max-width: 1025px) {
  .columns{
    width:100%;
  }
  .guide-article-sub{
    font-size:1.25em;
    -webkit-hyphens: auto;
    -ms-hyphens: auto;
    hyphens: auto;
  }
  }

  @media (max-width:480px) {
  .content
  {
    width: 100%;
  }
  
  .logo-area{
    display: flex; 
    justify-content: center; 
    align-items: center; 
    margin-top: 80px;
  }

  .guide-container.fullopacity
  {
    margin-top: 0px;
    margin-bottom: 0px;
  }

  #logo {
    margin-left: 0px;
    margin-top: 0px;
  }

   .second tr {
    display: flex; 
    justify-content: space-between; 
  }

  .second td {
    flex: 1; 
    line-height: 1.4; 
    padding: 5px; 
    box-sizing: border-box; 
  }

  .second table {
    border-collapse: separate; 
    border-spacing: 0 15px; 
  }

.guide-article-main,
  .guide-article-sub,
  .first,
  .second {
    width: 100%; 
    columns: 1; 
  }

  .sections {
    float: none; 
  }

  table {
    width: 100%; 
    overflow-x: auto; 
    display: block; 
  }

.guide-search {
    margin-top: 10px; 
    font-size: 1em; 
    overflow-x: hidden; 
    word-wrap: break-word; 
}

.logo-area{
margin-top:20px;
}

#logo{
width:120px;
height:100px;
margin-left:30px; 
}

.title{
margin-top:0px;
font-size:35px;
padding-left:10px;
}

.guide-article-main{
width:100%;
columns:1;
column-gap:0px;
opacity:0.0;
padding:10px 30px;
transition: all 0.4s ease-in-out;
font-size: 115%;
margin-top: -10px;
margin-bottom: 5px;
line-height: 1.3;

}

.guide-article-sub{
text-align:justify;
columns:1;
width:100%;
padding:30px;
font-size:1.2em;
font-weight: 300;
transition: all 0.4s ease-in-out;
line-height: 1.2;
}

}

.fullopacity{
    /* backdrop-filter:blur(5px); */
    opacity:1.0;
    pointer-events:auto;
    transform:scale(1.0);
    translate: 0px 0px;
    background: linear-gradient(120deg, rgb(50, 50, 50) 10%, rgba(65, 65, 65, 0.95) 80%);
    height: 100%;
  }
  
   
.fullopacityui{
    opacity:1.0;
  }
  
  a {
    font-weight: normal;
  }
  
  
  </style>