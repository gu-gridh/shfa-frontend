<template>
  <div class="about-container" :class="{ fullopacity: visibleAbout }">
    <div class="content">

      <template v-if="$i18n.locale === 'en'">
        <div class="flex-machine">
          <div class="rows">


            <div class="logo-area">
              <div id="logo-about"></div>
              <h1 class="about-title">
                <div v-html="$t('message.abouttitle')"></div>
              </h1>
            </div>

            <div class="about-article-sub" :class="{ fullopacityui: visibleAbout }">
              <h2>Database Overview</h2>
              <p>SHFA's [Svenskt Hällristningsforskningsarkiv's] image database includes more than 26,000 digitized
                images that are the result of ongoing work describing and documenting rock carvings since 1627.
                These data are primarily from Sweden but also from Denmark, Norway, Italy, Spain and elsewhere around
                the
                world. The database includes images of the documentation
                results as well as the documentation process, from historic documentation to current digital methods.
                More
                information on the documentation process can be found at
                <a href='https://www.gu.se/en/shfa'>About SHFA</a>.
              </p><br>
              <h2>Web Portal Migration</h2>
              <p>This platform for the SHFA database has been developed by Göteborgs infrastruktur för digital humaniora
                (GRIDH) and aims to offer enhanced methods to search the database and
                display digital documentation. The migration from SHFA's previous web portal (developed by Miljödata AB)
                was completed in early 2024. 3D documentation is available for a selection of sites and will continue to
                be made available.</p><br>

              <h2>Searching the Database</h2>
              <p>Using the suggested keyword search, you can access images of common documentation methods and motifs.
                Any
                text can be entered in the search bar, but we recommend using a full or partial site name or one of the
                terms listed in the Search Guide. With the map or advanced search options, you can retrieve results for
                detailed searches.
                Each search returns a gallery of images which can be viewed in more detail by clicking on the thumbnail.
                In the detailed view, the metadata, external information, and download link are available. If an image
                has a 3D mesh associated with it, a <button class=" avail-3d">3D</button> icon on the gallery
                thumbnail and <button class="viewer-avail"><span class="viewer-icon"></span>{{
    $t('message.viewthreed') }}</button>
                button in the image viewer. Clicking the button will open the multimodal viewer for the group of
                mesh(es) and visualisation(s) in a new window.</p><br>

              <h2>Visualisations</h2>
              <p>The images tagged as 3d visualisations were generated from mesh files using the <a
                  href="https://tvt.dh.gu.se" target="_blank">Topography Visualisation Toolbox (TVT)</a> or the Digital
                Frottage workflow from <a href="https://www.sciencedirect.com/science/article/pii/S2352409X19302329"
                  target="_blank">Horn et al. (2019)</a>. Where available, a link to the tool used is provided in the
                metadata below the image viewer.</p><br>

              <h2>Development</h2>
              <p>The website and database solution were developed by GRIDH, see the <a
                  href="https://github.com/gu-gridh/shfa-frontend/blob/main/README.md#overview" target="_blank">GitHub
                  repository</a> for more details.
                The multimodal viewer uses several open-source libraries which are detailed in the <a
                  href="https://github.com/gu-gridh/multimodal-viewer?tab=readme-ov-file#multimodal-viewer"
                  target="_blank">GitHub repository</a>.</p><br>

              <h2>Citing the Images</h2>
              <p>Images in the database are freely available for printing and downloading. The suggested citation for
                each
                image is provided in the detailed view, but you may reformat this to your preferred style using the
                image
                metadata. If you have previously cited an image using the ID number from the previous website and are
                interested in knowing the current unique image identifier, please email us with the legacy id(s) for the
                image(s) you are interested in, and we will provide you with the current image ID.
                Please notify us at <a href=mailto:shfa@gu.se>shfa@gu.se</a> and provide a link to <a
                  href='https://shfa.dh.gu.se/'>shfa.dh.gu.se</a> when you publish images from the database.
                The copyright applies to established principles that include, among other things, the photographer's
                voluntary right. The images are protected by a creative commons license (CC BY 4.0). For more
                information,
                please visit creative common's own website at:
                <a href='https://creativecommons.org/licenses/by/4.0/'>Creative commons CC BY 4.0.</a>
              </p><br>
              <h2>Citing the Platform</h2>
              <p>Bridge, Tristan, Karimi, Aram, Westin, Jonathan, Green, Ashely & Humlesjö, Siska
                "gu-gridh/shfa-frontend:
                v.1.3 3rd
                public release" Github, 12 June 2024. https://github.com/gu-gridh/shfa-frontend</p><br>
              <h2>Privacy Information</h2>
              <p>The SHFA webportal uses Matomo to track site visits by recurring users and searches to improve the user
                experience. The tracked data includes IP address, device specification, time spent on the website, first
                visit to the
                website, subsequent visits to the website, and an approximate location.</p><br>
              <h2>Accessibility Statement</h2>
              <p>This accessibility statement applies to <strong>shfa.dh.gu.se</strong>. The website is displayed in a
                more accessible format for users who prefer higher contrast and/or reduced transparency by default. The
                <a href="https://www.w3.org/WAI/standards-guidelines/wcag/">Web Content Accessibility Guidelines
                  (WCAG)</a> defines requirements for designers and developers to improve accessibility for people with
                disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA. The SHFA
                webportal
                is partially conformant with WCAG 2.2 level A. Partially conformant means that some parts of the content
                do not fully conform to the accessibility standard. Accessibility of the SHFA webportal relies on the
                following technologies to work with the particular
                combination of web browser and any assistive technologies or plugins installed on your computer:
              </p>
              <ul>
                <li>HTML</li>
                <li>CSS</li>
                <li>JavaScript</li>
              </ul>
              <p>These technologies are relied upon for conformance with the accessibility standards used. GRIDH
                assessed
                the accessibility of the SHFA webportal by self-evaluation. This statement was created on 28 May 2024
                using the <a href="https://www.w3.org/WAI/planning/statements/">W3C Accessibility Statement Generator
                  Tool</a>.</p>
              <br>

              <h2>Contact Information</h2>

              <p>Email SHFA at <a href=mailto:shfa@gu.se>shfa@gu.se</a> to report any data issues or request to add your
                data to our database.</p>
              <p>Email GRIDH at <a href=mailto:gridh@gu.se>gridh@gu.se</a> to report any technical or accessibility
                issues.</p>

              <p>Physical Location: Humanisten, University of Gothenburg, Renströmsgatan 6, 412 55 Gothenburg</p>

            </div>



          </div>
        </div>
        <div class="about-logo-top-right"> </div>
      </template>

      <template v-else>
        <div class="flex-machine">
          <div class="rows">
            <div class="content">

              <div class="logo-area">
                <div id="logo-about"></div>
                <h1 class="about-title">
                  <div v-html="$t('message.abouttitle')"></div>
                </h1>
              </div>


              <div class="about-article-sub" :class="{ fullopacityui: visibleAbout }">
                <h2>Databasöversikt</h2>
                <p>Svenskt Hällristningsforskningsarkivs bilddatabas omfattar mer än 26 000 digitaliserade bilder som
                  är
                  resultatet av pågående arbete
                  med att beskriva och dokumentera hällristningar sedan 1627. Dessa data kommer i första hand från
                  Sverige
                  men även från Danmark, Norge,
                  Italien, Spanien och andra delar av världen. Databasen innehåller bilder av dokumentationsresultaten
                  samt
                  dokumentationsprocessen, från
                  historisk dokumentation till aktuella digitala metoder. Mer information om dokumentationsprocessen
                  finns
                  på
                  <a href='https://www.gu.se/shfa'>Om SHFA</a>.
                </p><br>
                <h2>Webbportalmigrering</h2>
                <p>Denna plattform för SHFA-databasen har utvecklats av Göteborgs infrastruktur för digital humaniora
                  (GRIDH) och syftar till att erbjuda
                  förbättrade metoder för att söka i databasen och visa digital dokumentation. Migreringen från SHFAs
                  tidigare webbportal (utvecklad av
                  Miljödata AB) är komplett. Hittills har bilderna av hällristningsplatser i Sverige överförts.
                  3D-dokumentation finns tillgänglig för ett urval av platser och kommer att fortsätta att göras
                  tillgänglig.</p>
                <br>

                <h2>Sökning i databasen</h2>
                <p>Genom att använda den föreslagna nyckelordssökningen kan du komma åt bilder av vanliga
                  dokumentationsmetoder och motiv. Med kartan eller
                  avancerade sökalternativ kan du hämta resultat för detaljerade sökningar. Varje sökning visar ett
                  galleri
                  med bilder som kan ses mer
                  detaljerat genom att klicka på miniatyrbilden. I den detaljerade vyn är metadata, extern information
                  och
                  nedladdningslänk tillgängliga. Om en bild har ett 3D-mesh kopplat till sig, en <button
                    class=" avail-3d">3D</button> ikon på galleriminiatyren och <button class="viewer-avail"><span
                      class="viewer-icon"></span>{{
    $t('message.viewthreed') }}</button>
                  knappen i metadatasektionen. Om du klickar på knappen öppnas den multimodal viewer för gruppen av
                  maskor och
                  visualiseringar i ett nytt fönster.</p><br>

                <h2>Visualiseringar</h2>
                <p>Bilderna taggade som 3D-visualiseringar genererades från mesh-filer med <a
                    href="https://tvt.dh.gu.se" target="_blank">Topography Visualisation Toolbox (TVT)</a> eller Digital
                  Frottage-arbetsflödet i <a href="https://www.sciencedirect.com/science/article/pii/S2352409X19302329"
                    target="_blank">Horn et al. (2019)</a>. Om det är tillgängligt, finns en länk till det använda
                  verktyget i metadata under bildvisaren.</p><br>

                <h2>Utveckling</h2>
                <p>Den webbsidan och databaslösningen har utvecklats av GRIDH, se <a
                    href="https://github.com/gu-gridh/shfa-frontend?tab=readme-ov-file#overview" target="_blank">GitHub
                    repository</a> för mer detaljer.
                  Den multimodal viewer använder flera öppen källkod bibliotek som beskrivs i den <a
                    href="https://github.com/gu-gridh/multimodal-viewer?tab=readme-ov-file#multimodal-viewer"
                    target="_blank">GitHub repository</a>.</p><br>

                <h2>Att referera bilderna</h2>
                <p>Bilder i databasen är fritt tillgängliga för utskrift och nedladdning. Den föreslagna referensen för
                  varje bild finns i den detaljerade vyn, men du kan formatera om den till din föredragna stil med hjälp
                  av
                  bildens metadata. Om du tidigare refererat till en bild med hjälp av ID-numret från vår tidigare
                  websida
                  och
                  vill ha bildens nuvarande unika bild-id, vänligen mejla oss information om tidigare ID för
                  bilden/bilderna
                  du
                  är intresserad av så återkommer vi med nuvarande ID-nummer. Meddela
                  oss på <a href=mailto:shfa@gu.se>shfa@gu.se</a> och ange en länk till <a
                    href='https://shfa.dh.gu.se/'>shfa.dh.gu.se</a> när du
                  publicerar bilder från databasen. Upphovsrätten gäller etablerade principer som bland annat innefattar
                  fotografens frivilliga rätt.
                  Bilderna är skyddade av en creative commons-licens (CC BY 4.0). För mer information, besök creative
                  commons egen webbplats på:
                  <a href='https://creativecommons.org/licenses/by/4.0/'>Creative commons CC BY 4.0.</a>
                </p><br>

                <h2>Att referera till plattformen</h2>
                <p>Bridge, Tristan, Karimi, Aram, Westin, Jonathan, Green, Ashely & Humlesjö, Siska
                  "gu-gridh/shfa-frontend:
                  v.1.3 3rd
                  public release" Github, 12 June 2024. https://github.com/gu-gridh/shfa-frontend</p><br>

                <h2>Integritetspolicy</h2>
                <p>SHFAs webbportal använder Matomo för att spåra återkommande besök och sökningar samt för att
                  användarupplevelsen. Den spårade datan inkluderar information om IP-addressen, vilken typ av enhet som
                  använts, under
                  hur lång tid besöket varat, förstagångsbesökare på webbplatsen, återkommande besök och en uppskattning
                  om
                  varifrån besöker kommer.</p><br>
                <h2>Tillgänglighetsredogörelse</h2>
                <p>Den här tillgänglighetsförklaringen gäller <strong>shfa.dh.gu.se</strong>. Webbsidan visas i ett mer
                  tillgängligt format med högre kontrast och/eller minskad transparens för användare som föredrar det.
                  <a href="https://www.w3.org/WAI/standards-guidelines/wcag/">Web Content Accessibility Guidelines
                    (WCAG)</a> definierar krav på designers och utvecklare för att förbättra tillgängligheten för
                  personer
                  med funktionsnedsättning. Den definierar tre nivåer av överensstämmelse: nivå A, nivå AA och nivå AAA.
                  SHFAs webbportal överensstämmer delvis med WCAG 2.2 nivå A. Det innebär att vissa delar av innehållet
                  inte
                  helt överensstämmer med tillgänglighetsstandarden. Tillgängligheten på SHFAs webbportal är beroende av
                  följande tekniker för att fungera med speciella
                  webbläsare och eventuella hjälpmedel eller plugins installerade på din dator:
                </p>
                <ul>
                  <li>HTML</li>
                  <li>CSS</li>
                  <li>JavaScript</li>
                </ul>
                <p>GRIDH har gjort en självskattning av SHFAs webbportal. Redogörelsen uppdaterades senast 2024-05-28.
                </p>
                <br>
                <h2>Kontaktinformation</h2>

                <p>Vänligen kontakta SHFA via <a href=mailto:shfa@gu.se>shfa@gu.se</a> för frågor om informationen samt
                  för
                  förfrågningar om tillägg av information.</p>
                <p>Vänligen kontakta GRIDH via <a href=mailto:gridh@gu.se>gridh@gu.se</a> för att rapportera tekniska
                  frågor
                  eller frågor om tillgängligheten.</p>

                <p>Fysisk plats: Humanisten, Göteborgs universitet, Renströmsgatan 6, 412 55 Göteborg</p>

              </div>
            </div>
          </div>
        </div>
      </template>



      <div class="about-logo-top-right"> </div>
      <button class="close-page-button" @click="$emit('close')">
        <div class="category-button" :class="{ fullopacityui: visibleAbout }"
          style="width:auto; padding:5px 15px; text-align: center; cursor: pointer;">{{ $t('message.close') }}</div>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Grid from '../Views/Grid.vue';

export default {
  name: "aboutview",
  emits: ['close'],
  props: {
    visibleAbout: {
      type: Boolean,
      required: true,
    },

  },

};
</script>

<style scoped>
.avail-3d {
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: center;
  font-weight: 500;
  line-height: 1;
  text-align: center;
  overflow: hidden;
  cursor: pointer;
  color: var(--popup-text);
  border-radius: 50%;
  width: 25px;
  height: 25px;
  opacity: 1;
  background-color: var(--threed-icon);
  border-width: 1px;
  border-style: solid;
  border-color: var(--threed-icon);
  font-size: 80%;
  cursor: default;

}

.viewer-avail {
  padding: 4px 6px 4px 8px;
  color: var(--button-text);
  /* background-color: var(--button-background); */
  background-color: var(--threed-icon);
  border-radius: 6px;
  font-size: 80%;
  text-decoration: none;
  cursor: pointer;
  margin-top: 0px;
  width: max-content;
  height: max-content;
  cursor: default;
  font-weight: 400;
}

.viewer-icon {
  display: absolute;
  float: right;
  /* margin-top: 3px; */
  height: 20px;
  width: 20px;
  background-image: var(--popup-link-button);
  /* filter: invert(1); */
  background-size: 20px;
  background-position: center;
  background-repeat: no-repeat;
  margin-left: 10px;
  border-width: 1.4px;
  border-color: var(--button-text);
  border-radius: 50%;
}

li {
  list-style: inside;
  margin-left: 30px;
}

a {
  color: var(--ui-hover);
  font-weight: 400;
}

h2 {
  font-size: 115%;
  font-style: bold;
  margin-top: -10px;
  margin-bottom: 5px;
  color: var(--highlighted-text);
  font-weight: 500;
  line-height: 1.5;
}

.about-container {
  position: fixed;
  color: var(--page-text);
  line-height: 1;
  width: 100%;
  font-size: 12px;
  z-index: 4000;
  backdrop-filter: blur(5px);
  pointer-events: none;
  transform: scale(1.5);
  translate: 0px 100px;
  transition: all 0.5s ease-in-out;
  opacity: 0.0;
  overflow-y: scroll;
  max-height: max-content;
  background: var(--guide-page-background);
}

.logo-area {
  margin-top: 30px;
}

#logo-about {
  position: relative;
  width: 210px;
  height: 200px;
  float: left;
  margin-left: 80px;
  margin-top: 35px;
  background: var(--shfa-logo);
  background-repeat: no-repeat;
  background-size: contain;
  opacity: 0.7;
  transition: all 0.8s ease-in-out;
}


.fullopacity {
  backdrop-filter: blur(5px);
  opacity: 1.0;
  pointer-events: auto;
  transform: scale(1.0);
  translate: 0px 0px;
  background: var(--guide-page-background);
  height: 100%;
}

.flex-machine {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.rows {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  width: auto;
}

.about-main-title {
  font-family: 'Teko', sans-serif;
  margin-top: 10px;
  flex-basis: auto;
  width: 100%;
  font-size: 4em;
  line-height: 0.85;
  font-weight: 100;
  letter-spacing: -0.2px;
  text-align: center;
  color: var(--page-text);
  margin-bottom: 15px;
  transition: all 0.4s ease-in-out;
}

.about-sub-title {
  font-family: 'Teko', sans-serif;
  margin-top: 2px;
  flex-basis: auto;
  width: 100%;
  font-size: 2.5em;
  line-height: 0.9;
  font-weight: 100;
  letter-spacing: -0.2rem;
  text-align: center;
  color: var(--page-text);
  opacity: 0.0;
  margin-bottom: 20px;
  transition: all 0.4s ease-in-out;
}

.about-article-main {
  position: relative;
  float: left;
  text-align: center;
  color: var(--page-text);
  width: 100%;
  columns: 1;
  column-gap: 30px;
  max-width: 1600px;
  font-size: 2.0em;
  opacity: 0.0;
  padding: 0px 100px;
  transition: all 0.4s ease-in-out;
}

.about-article-sub {
  position: relative;
  float: left;
  text-align: justify;
  color: var(--page-text);
  columns: 1;
  width: 100%;
  padding: 30px 100px;
  column-gap: 30px;
  max-width: 1600px;
  font-size: 1.7em;
  font-weight: 300;
  opacity: 0.0;
  transition: all 0.4s ease-in-out;
  line-height: 1.2;
  padding-bottom: 120px !important;
}

.category-button {
  float: left;
  font-size: 1.8em;
  font-weight: 400;
  transition: all 0.4s ease-in-out;
  background-color: var(--button-background);
  padding: 8px 20px !important;
  z-index: 1000;
  opacity: 1.0;
  margin-top: 0px;
  margin-bottom: 0px;
  border-radius: 5px;
  box-shadow: var(--shadow);
}

.close-page-button {
  position: sticky;
  z-index: 3000;
  bottom: 0px;
  top: calc(100vh - 80px);
  padding-bottom: 20px;
  color: var(--button-text);
  background: var(--footer-background);
  width: 100%;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: end;
}

.category-button:hover {
  background: var(--button-hover);
}

@media screen and (max-width: 900px) {

  .about-article-sub {
    font-size: 1.25em;
    -webkit-hyphens: auto;
    -ms-hyphens: auto;
    hyphens: auto;
  }
}

.about-logo-top-right {
  z-index: 1000;
  display: flex;
  pointer-events: none;
  width: 200px;
  height: 90px;
  position: absolute;
  /*background:url("../assets/shfa_logo_downscale.png");*/
  background-repeat: no-repeat;
  background-size: contain;
  top: 30px;
  right: 60px;
  opacity: 0.6;
  color: var(--page-text);
  transition: all 0.4s ease-in-out;
}

@media (max-width:480px) {
  .logo-area {
    margin-top: 20px;
  }

  #logo-about {
    width: 120px;
    height: 100px;
    margin-left: 0px;
  }

  .about-title {
    margin-top: 0px;
    font-size: 35px;
    padding-left: 10px;
  }

  .about-article-main {
    position: relative;
    float: left;
    text-align: center;
    color: var(--page-text);
    width: 100%;
    columns: 1;
    column-gap: 30px;
    max-width: 1600px;
    font-size: 2.0em;
    opacity: 0.0;
    padding: 0px 100px;
    transition: all 0.4s ease-in-out;
  }

  .about-article-sub {
    text-align: justify;
    columns: 1;
    width: 100%;
    padding: 30px;
    font-size: 1.2em;
    font-weight: 300;
    transition: all 0.4s ease-in-out;
    line-height: 1.2;
  }
}

.fullopacityui {
  opacity: 1.0;
}

a {
  font-weight: normal;
}
</style>
