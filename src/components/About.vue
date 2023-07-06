<template>
  <div class="about-container" v-bind:class="{abouthidden: !visibleAbout}">
    <div class="flex-machine"  v-bind:class="{abouthiddenui: !visibleAbout}">
      <div class="red-content" >
    <div class="about-main-title" >Swedish Rock Art <br>Research Archive</div>

    <div class="about-article-main">
        Extended Rephotography is a transdisciplinary project focused on the glacial environment in northwest Svalbard. The core of the project is using Extended Reality (XR) technologies for field based visualizations and research analysis, documentation and communication of research results.
        The works aimed for the public is focused on storytelling and visualization using a wide range of historical data and on going research as a collaboration between several disciplines and institutions.
    </div>




      <div class="about-article-sub">
      The project is led by Tyrone Martinsson and is a collaboration between University of Gothenburg, Norwegian Polar Institute, Visual Arena Lindholmen, Universeum, and University of Plymouth. Infravis, the national infrastructure for resaearch visualisation, has developed this tool to explore the data. The site is hosted and maintained by Gothenburg Research Infrastructure in Digital Humanities (GRIDH).
      </div>
  
    
    
      
        <button @click="$emit('close')">
            <div
              class="p-1 px-2 clickable category-button"
              style="width:auto; padding:5px 15px; text-align: center; cursor: pointer;"  v-bind:class="{abouthiddenui: !visibleAbout}">Explore</div>
          </button>
        </div>
        <div class="about-lower-border" v-bind:class="{abouthiddenui: !visibleAbout}"> </div>
        <div class="about-logo-top-right"> </div>
      </div>
       
       

  </div>
  

</template>

<script lang="ts">
export default {
  name: "aboutview",
  props: {
    visibleAbout: {
      type: Boolean,
      required: true,
    },
  },
};
</script>

<style scoped>
.about-container {
  position:fixed;
  color: white;
  line-height: 1;
  height: 100%;
  width: 100%;
  font-size: 12px;
  z-index: 1000;
  backdrop-filter:blur(0px);
  pointer-events:auto;
    transform: scale(1.0) translate(0px, -100vh);
  transition: all 0.0s ease-in-out;
  opacity:1.0;
  overflow-y:auto;
  background: linear-gradient(90deg, rgba(250, 250, 250,1) 0%, rgba(250, 250, 250,0.9) 100%);
}

.flex-machine{
  opacity:1.0; 
  height:100%;
  display:flex;
  flex-direction:column;
}

.abouthidden{
  transition: all 1.5s ease-in-out;
  backdrop-filter:blur(5px);
  opacity:0.0;
  pointer-events:none;
  transform:scale(1.5);
  translate: 0px 100px;
  background: linear-gradient(90deg, rgba(250, 250, 250,1) 0%, rgba(250, 250, 250,0.5) 30%);
}

.abouthiddenui{
  transition: all 1.5s ease-in-out;
  opacity:0.0; 
}

.red-content{
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content: start;
  width:auto;
}

.about-main-title {
  margin-top:100px;
  flex-basis:auto;
  width:100%;
  font-size: 7rem;
  line-height: 0.9;
  font-weight: 100;
  letter-spacing: -0.2rem;
  text-align: center;
  color:black;
  margin-bottom:40px;
  font-family: 'Teko', sans-serif;
}

.about-article-main{
  position:relative;
text-align:center;
 color:black;
 font-weight: 100;
columns:1;
column-gap:30px;
width:70%;
font-size:1.8em;
padding:00px 30px;
transition: all 0.4s ease-in-out;
}

.about-article-sub{
  position:relative;
text-align:justify;
 color:black;
columns:2;
column-gap:30px;
width:70%;
font-size:1.4em;
font-weight: 200;
padding:30px;
transition: all 0.4s ease-in-out;
}

@media screen and (max-width: 900px) {
  .about-main-title {
    font-size: 3.5rem;
  }

  .about-article-main {
    width: 90%;
    font-size: 1.3rem;
  }

  .about-article-sub {
    width: 90%;
    font-size: 1.2rem;
  }
}

.category-button {
  position:relative;
  font-size:2em;
  font-weight:400;
  transition: all 0.4s ease-in-out;
  background-color:rgb(230,230,230);
  padding:8px 20px !important;
  z-index:1000;
  margin-bottom:50px;
}

a {
  font-weight: bold;
}

.about-lower-border{
  flex-grow: 1;
  margin-top:0px;
  pointer-events:none;
  width:100%;
  height:300px;
  position:relative;
  /* background:url(./images/about-mountains.png); */
  background-repeat: no-repeat;
  background-size: cover;
  opacity:0.7;
  transition: all 0.4s ease-in-out;
}

.about-logo-top-right{
  z-index:1000;
  display:block;
  pointer-events:none;
  width:200px;
  height:90px;
  position:absolute;
  /* background:url(./images/logo-Infravis-516.png); */
  background-repeat: no-repeat;
  background-size: contain;
  top:30px;
  right:60px;
  opacity:1.0;
  transition: all 0.4s ease-in-out;
}

</style>