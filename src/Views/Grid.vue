<template>
  <div>
    <div class="top">
      <a href="https://shfa.dh.gu.se/">
        <div id="logo-main"></div>
        <h1 class="title">
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
          <svg xmlns="http://www.w3.org/2000/svg" class="h-15 w-15" fill="none" viewBox="0 0 25 30"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div class="languages">
          <div class="version">Version 1.3</div>

          <transition name="flip-fade" mode="out-in">
            <div v-if="currentLanguage === 'en'" class="top-button" key="english" @click="toggleLanguage"
              id="language-button">
              Svenska

            </div>
            <div v-else class="top-button" key="svenska" @click="toggleLanguage" id="language-button">
              English

            </div>
          </transition>

          <transition name="flip-fade" mode="out-in">
            <div class="top-button">
              <div v-if="currentColour === 'light'" id="colour-mode" class="material-symbols-outlined"
                @click="toggleColour">
                dark_mode
              </div>
              <div v-else id="colour-mode" class="material-symbols-outlined" @click="toggleColour">
                light_mode
              </div>
            </div>
          </transition>

          <!-- <div class="top-button">|</div> -->
        </div>
        <Privacy :visiblePrivacy="visiblePrivacy" :currentLanguage="currentLanguage" @close="visiblePrivacy = false" />
        <div class="top-links">
          <button class="item" id="privacy-button" @click="visiblePrivacy = true">
            {{ $t('message.privacy') }}<div class="top-link-infobutton"></div></button>
          <button class="item">
            <router-link :to="{ name: 'Guide' }" target="_blank">
              {{ $t('message.sökguide') }}<div class="top-link-infobutton"></div>
            </router-link>
          </button>

          <button class="item">
            <router-link :to="{ name: 'About' }" target="_blank">
              {{ $t('message.aboutArchive') }}<div class="top-link-infobutton"></div>
            </router-link>
          </button>

          <button class="item" v-if="currentLanguage === 'en'">

            <a href="https://www.gu.se/en/shfa" target="_blank">{{ $t('message.aboutSHFA') }} <div
                class="top-link-button"></div></a> </button>

          <button class="item" v-else>

            <a href="https://www.gu.se/shfa" target="_blank">{{ $t('message.aboutSHFA') }} <div class="top-link-button">
              </div></a> </button>

          <button class="item" v-if="currentLanguage === 'en'">

            <a href="https://www.gu.se/en/shfa/research" target="_blank">{{ $t('message.news') }}<div
                class="top-link-button"></div></a></button>

          <button class="item" v-else>

            <a href="https://www.gu.se/shfa/forskning" target="_blank">{{ $t('message.news') }}<div
                class="top-link-button"></div></a></button>
        </div>
      </div>
      <!-- End of main-menu -->
    </div>

    <!-- Start of Container -->
    <div class="split-container main-color">
      <div class="flex height">
        <!-- Panel 1 -->
        <div id="split-0" class="flex-grow flex flex-col "
          :class="{ 'w-1/3': showThreePanels, 'w-1/2': !showThreePanels }">

          <Search @toggle-map="toggleMap" ref="searchRef" @search-term="handleSearchTerm"
            :defaultSearchResults="defaultSearchResults" :currentLang="currentLanguage" />

          <Map ref="mapComponent" v-show="showMap" @bbox-search="handleBboxSearch" @map-clicked="handleMapClicked"
            @id-selected="handleSiteSelection" :coordinates="results" :bbox="bbox" :showMap="showMap" />

          <AdvancedSearch v-show="!showMap" @advanced-search-params="handleAdvancedSearchResults"
            ref="advancedSearchRef" :currentLang="currentLanguage" />

          <button v-show="showMap" id="reset-layout-mapview" @click="resetSplitsAndPanels">{{
            $t('message.resetlayout') }}</button>

          <button v-show="!showMap" id="reset-layout-searchview" @click="resetSplitsAndPanels">{{
            $t('message.resetlayout') }}</button>

        </div>
        <!-- Panel 2 -->
        <div id="split-1" class="flex-grow overflow-auto main-color" v-show="shouldShowPanel1"
          :class="{ 'w-1/3': showThreePanels, 'w-1/2': !showThreePanels }">

          <div class="toggle-button-group">
            <button :class="{ active: activeTab === 'gallery' }" @click="activeTab = 'gallery'">
              Gallery
            </button>
            <button :class="{ active: activeTab === 'summary' }" @click="activeTab = 'summary'">
              Summary
            </button>
          </div>

          <Gallery v-show="activeTab === 'gallery'" @image-clicked="onImageClicked" @row-clicked="closeThreePanels"
            :searchItems="searchItems" :advancedSearchResults="advancedSearchResults" :bboxSearch="bboxResults"
            :selectedSiteId="selectedId" :currentLanguage="currentLanguage" :showThreePanels="showThreePanels" />

          <Summary v-show="activeTab === 'summary'" :searchItems="searchItems"
            :advancedSearchResults="advancedSearchResults" :bboxSearch="bboxResults" :selectedSiteId="selectedId"
            :activeTab="activeTab" @summaryClick="handleKeywordClick" />
        </div>

        <!-- Panel 3 -->
        <transition name="slide">
          <div id="split-2" class="flex-grow main-color overflow-auto"
            :class="{ 'w-1/3': showThreePanels, 'w-0': !showThreePanels }" v-show="showThreePanels">
            <div id="image" v-if="shouldShowPanel1"
              style="width:0%;height:0px; position:relative; top:0px; margin-left:0px;"></div>
            <button @click="closeThreePanels" class="close-button">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 20 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <ImageViewer v-if="IiifFileforImageViewer" :iiifFile="IiifFileforImageViewer" />
            <MetaData :Id="idForMetaData" :currentLang="currentLanguage" @keyword-clicked="handleKeywordClick" />
          </div>
        </transition>

        <div class="split-container-top"></div>
      </div>
    </div>
    <!-- End of Container -->
  </div>
</template>

<script>
  import { ref } from "vue";
  import Map from "../components/Map.vue";
  import { defineComponent } from "vue";
  import Split from "split.js";
  import Gallery from "../components/Gallery.vue";
  import Summary from "../components/Summary.vue";
  import Search from "../components/Search.vue";
  import AdvancedSearch from "../components/AdvancedSearch.vue";
  import ImageViewer from "../components/ImageViewer.vue";
  import MetaData from "../components/MetaData.vue";
  import Privacy from "../components/Privacy.vue";

  export default defineComponent({
    components: {
      Map,
      Gallery,
      Summary,
      Search,
      AdvancedSearch,
      ImageViewer,
      MetaData,
      Privacy,
    },
    setup() {
      const activeTab = ref('gallery')

      return {
        activeTab,
      };
    },
    watch: {
      $route(to, from) {
        const newSiteId = to.params.siteId;
        this.newIiifFile = to.params.iiifFile;
        const newQuery = to.params.query;
        if (newQuery && this.isInitialLoad) {
          this.isInitialLoad = false;
        }
        if (this.newIiifFile) {
          this.showThreePanels = true;
          this.IiifFileforImageViewer = this.newIiifFile;
        }
      },
      selectedId(newId, oldId) {
        if (newId) {
          this.$router.push({ name: "Site", params: { siteId: newId } });
          fetch(`https://diana.dh.gu.se/api/shfa/geojson/site/?id=${newId}`)
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .then((data) => {
              const coordinates = data.features[0].geometry.coordinates;
              if (!this.mapClicked) {
                this.$refs.mapComponent.focusOnCoordinates(...coordinates);
              }
            })
            .catch((e) => {
              console.error("Failed to fetch new site coordinates:", e);
            });
        }
      },
      selectedIiifFile(newIiifFile) {
        if (!this.$route.fullPath.includes("image")) {
          this.previousRoute = this.$route.fullPath;
        }
        this.$router.replace({
          name: "IiifFile",
          params: {
            iiifFile: newIiifFile,
          },
        });
      },
      showThreePanels(newValue) {
        if (this.windowSize && window.location.pathname.includes("search")) {
          this.windowSize = false;
          return;
        }

        if (newValue && !this.shouldShowPanel1) {
          // Check if on mobile
          const panel = document.getElementById("split-1");
          if (panel) {
            window.scrollTo(0, 400);
          }
        }
      },
    },
    data() {
      return {
        currentLanguage: this.detectUserLanguage(),
        windowWidth: window.innerWidth,
        items: [],
        results: [],
        searchItems: [],
        advancedSearchResults: [],
        isMenuOpen: false,
        showThreePanels: false,
        selectedId: null,
        selectedIiifFile: null,
        IiifFileforImageViewer: null,
        idForMetaData: null,
        currentPage: 1,
        totalPages: 1,
        totalResults: 0,
        bbox: [],
        showResults: false,
        showMap: true,
        showGallery: true,
        visiblePrivacy: false,
        mapClicked: false,
        currentColour: "dark",
        targetTheme: "dark",
        windowSize: true,
        isInitialLoad: true,
        previousRoute: null,
        shouldFireInitialFetch: true,
        newIiifFile: null,
        splitInstance: null,
        bboxResults: [],
        defaultSearchResults: [],
      };
    },
    mounted() {
      this.initializeOnHome();
      window.addEventListener('storage', this.handleStorageChange);

      this.fetchSearchTerms()

      var en_settings = {
        "showIntro": true, "divId": "matomo-opt-out", "useSecureCookies": true, "cookiePath": null, "cookieDomain": null, "cookieSameSite": "Lax", "OptOutComplete": "Opt-out complete; your visits to this website will not be recorded by the Web Analytics tool.", "OptOutCompleteBis": "Note that if you clear your cookies, delete the opt-out cookie, or if you change computers or Web browsers, you will need to perform the opt-out procedure again.", "YouMayOptOut2": "You may choose to prevent this website from aggregating and analyzing the actions you take here.", "YouMayOptOut3": "Doing so will protect your privacy, but will also prevent the owner from learning from your actions and creating a better experience for you and other users.", "OptOutErrorNoCookies": "The tracking opt-out feature requires cookies to be enabled.", "OptOutErrorNotHttps": "The tracking opt-out feature may not work because this site was not loaded over HTTPS. Please reload the page to check if your opt out status changed.", "YouAreNotOptedOut": "You are not opted out.", "UncheckToOptOut": "Uncheck this box to opt-out.", "YouAreOptedOut": "You are currently opted out.", "CheckToOptIn": "Check this box to opt-in."
      };
      var sv_settings = {
        "showIntro": true, "divId": "matomo-opt-out", "useSecureCookies": true, "cookiePath": null, "cookieDomain": null, "cookieSameSite": "Lax", "OptOutComplete": "Exkludering utf\u00f6rd; dina bes\u00f6k p\u00e5 denna webbplatsen kommer inte att sp\u00e5ras av webbanalys-verktyget.", "OptOutCompleteBis": "Observera att om du rensar cookies, tar bort cookien f\u00f6r exkludering eller om du byter dator eller webbl\u00e4sare m\u00e5ste du utf\u00f6ra exkluderingen igen.", "YouMayOptOut2": "Du kan v\u00e4lja att neka den h\u00e4r webbplatsen tillst\u00e5nd att samla in och analysera information om dina handlingar h\u00e4r.", "YouMayOptOut3": "Genom att g\u00f6ra s\u00e5 kommer du skydda din integritet, men kommer \u00e4ven hindra \u00e4garen att l\u00e4ra fr\u00e5n dina handlingar och d\u00e4rigenom skapa en b\u00e4ttre upplevelse f\u00f6r dig och andra anv\u00e4ndare.", "OptOutErrorNoCookies": "Funktionen f\u00f6r opt-out fr\u00e5n sp\u00e5rning kr\u00e4ver att cookies \u00e4r aktiverade.", "OptOutErrorNotHttps": "Funktionen f\u00f6r opt-out fr\u00e5n sp\u00e5rning kanske inte fungerar eftersom denna webbplats inte laddades \u00f6ver HTTPS. Ladda om sidan f\u00f6r att kolla om din opt-out status \u00e4ndrats.", "YouAreNotOptedOut": "Du har inte valt bort det.", "UncheckToOptOut": "Avmarkera rutan f\u00f6r att inte vara med.", "YouAreOptedOut": "Du \u00e4r just nu exkluderad.", "CheckToOptIn": "Markera rutan f\u00f6r att vara med."
      };
      var settings = en_settings;
      const privacyButton = document.getElementById("privacy-button");
      privacyButton.addEventListener('click', function () {
        window.MatomoConsent.init(settings.useSecureCookies, settings.cookiePath, settings.cookieDomain, settings.cookieSameSite);
        showContent(window.MatomoConsent.hasConsent());
      });
      function showContent(consent, errorMessage = null, useTracker = false) {

        var errorBlock = '<p style="color: red; font-weight: bold;">';

        var div = document.getElementById(settings.divId);
        if (!div) {
          const warningDiv = document.createElement("div");
          var msg = 'Unable to find opt-out content div: "' + settings.divId + '"';
          warningDiv.id = settings.divId + '-warning';
          warningDiv.innerHTML = errorBlock + msg + '</p>';
          document.body.insertBefore(warningDiv, document.body.firstChild);
          console.log(msg);
          return;
        }

        if (!navigator || !navigator.cookieEnabled) {
          div.innerHTML = errorBlock + settings.OptOutErrorNoCookies + '</p>';
          return;
        }
        if (location.protocol !== 'https:') {
          div.innerHTML = errorBlock + settings.OptOutErrorNotHttps + '</p>';
          return;
        }
        if (errorMessage !== null) {
          div.innerHTML = errorBlock + errorMessage + '</p>';
          return;
        }
        var content = '';
        if (consent) {
          if (settings.showIntro) {
            content += '<p>' + settings.YouMayOptOut2 + ' ' + settings.YouMayOptOut3 + '</p>';
          }
          if (useTracker) {
            content += '<input onclick="_paq.push([\'optUserOut\']);showContent(false, null, true);" id="trackVisits" type="checkbox" checked="checked" />';
          } else {
            content += '<input onclick="window.MatomoConsent.consentRevoked();showContent(false);" id="trackVisits" type="checkbox" checked="checked" />';
          }
          content += '<label for="trackVisits"><strong><span>' + settings.YouAreNotOptedOut + ' ' + settings.UncheckToOptOut + '</span></strong></label>';
        } else {
          if (settings.showIntro) {
            content += '<p>' + settings.OptOutComplete + ' ' + settings.OptOutCompleteBis + '</p>';
          }
          if (useTracker) {
            content += '<input onclick="_paq.push([\'forgetUserOptOut\']);showContent(true, null, true);" id="trackVisits" type="checkbox" />';
          } else {
            content += '<input onclick="window.MatomoConsent.consentGiven();showContent(true);" id="trackVisits" type="checkbox" />';
          }
          content += '<label for="trackVisits"><strong><span>' + settings.YouAreOptedOut + ' ' + settings.CheckToOptIn + '</span></strong></label>';
        }
        div.innerHTML = content;
      };

      window.MatomoConsent = {
        cookiesDisabled: (!navigator || !navigator.cookieEnabled),
        CONSENT_COOKIE_NAME: 'mtm_consent', CONSENT_REMOVED_COOKIE_NAME: 'mtm_consent_removed',
        cookieIsSecure: false, useSecureCookies: true, cookiePath: '', cookieDomain: '', cookieSameSite: 'Lax',
        init: function (useSecureCookies, cookiePath, cookieDomain, cookieSameSite) {
          this.useSecureCookies = useSecureCookies; this.cookiePath = cookiePath;
          this.cookieDomain = cookieDomain; this.cookieSameSite = cookieSameSite;
          if (useSecureCookies && location.protocol !== 'https:') {
            console.log('Error with setting useSecureCookies: You cannot use this option on http.');
          } else {
            this.cookieIsSecure = useSecureCookies;
          }
        },
        hasConsent: function () {
          var consentCookie = this.getCookie(this.CONSENT_COOKIE_NAME);
          var removedCookie = this.getCookie(this.CONSENT_REMOVED_COOKIE_NAME);
          if (!consentCookie && !removedCookie) {
            return true; // No cookies set, so opted in
          }
          if (removedCookie && consentCookie) {
            this.setCookie(this.CONSENT_COOKIE_NAME, '', -129600000);
            return false;
          }
          return (consentCookie || consentCookie !== 0);
        },
        consentGiven: function () {
          this.setCookie(this.CONSENT_REMOVED_COOKIE_NAME, '', -129600000);
          this.setCookie(this.CONSENT_COOKIE_NAME, new Date().getTime(), 946080000000);
        },
        consentRevoked: function () {
          this.setCookie(this.CONSENT_COOKIE_NAME, '', -129600000);
          this.setCookie(this.CONSENT_REMOVED_COOKIE_NAME, new Date().getTime(), 946080000000);
        },
        getCookie: function (cookieName) {
          var cookiePattern = new RegExp('(^|;)[ ]*' + cookieName + '=([^;]*)'), cookieMatch = cookiePattern.exec(document.cookie);
          return cookieMatch ? window.decodeURIComponent(cookieMatch[2]) : 0;
        },
        setCookie: function (cookieName, value, msToExpire) {
          var expiryDate = new Date();
          expiryDate.setTime((new Date().getTime()) + msToExpire);
          document.cookie = cookieName + '=' + window.encodeURIComponent(value) +
            (msToExpire ? ';expires=' + expiryDate.toGMTString() : '') +
            ';path=' + (this.cookiePath || '/') +
            (this.cookieDomain ? ';domain=' + this.cookieDomain : '') +
            (this.cookieIsSecure ? ';secure' : '') +
            ';SameSite=' + this.cookieSameSite;
          if ((!msToExpire || msToExpire >= 0) && this.getCookie(cookieName) !== String(value)) {
            console.log('There was an error setting cookie `' + cookieName + '`. Please check domain and path.');
          }
        }
      };
      window.addEventListener("resize", this.updateWindowWidth);

      this.currentColour = this.currentColour;

      this.targetTheme = this.targetTheme;

      const vm = this;
      const direction = window.innerWidth <= 1024 ? "vertical" : "horizontal";

      this.splitInstance = Split(["#split-0", "#split-1", "#split-2"], {
        sizes: [40, 60, 40],
        minSize: [500, 300],
        maxSize: [Infinity, Infinity, 700],
        direction: direction,
        dragInterval: 1,
        gutterSize: 10,
        gutterAlign: "start",
        gutter: function (index, direction) {
          const gutter = document.createElement("div");
          gutter.className = "gutter";
          gutter.id = "gutter-" + index;
          if (index === 1) {
            gutter.classList.add("gutter-2");
          } else {
            gutter.style.display = vm.showThreePanels ? "block" : "none";
          }
          return gutter;
        },
      });

      if (window.location.pathname.includes("image")) {
        this.adjustSplitDisplay();
      }
    },
    computed: {
      shouldShowPanel1() {
        if (this.windowWidth <= 1250) {
          return !this.showThreePanels;
        }
        return true; //always show on larger screens
      },
    },
    beforeDestroy() {
      window.removeEventListener("resize", this.updateWindowWidth);
    },

    methods: {
      fetchSearchTerms() {
        fetch("https://diana.dh.gu.se/api/shfa/keywordtag/?limit=150")
          .then((response) => response.json())
          .then((json) => {
            this.data = json.results;
            this.defaultSearchResults = this.data.sort(() => 0.5 - Math.random()).slice(1, 15)
          }).catch((error) => {
            console.error('Error fetching keyword data:', error);
          });
      },
      updateSiteCoordinates(newId) {
        if (newId) {
          fetch(`https://diana.dh.gu.se/api/shfa/image/?id=${newId}&depth=1`)
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .then(data => {
              if (data.results && data.results[0] && data.results[0].site && data.results[0].site.coordinates) {
                const coordinates = data.results[0].site.coordinates.coordinates;
                if (!this.mapClicked && this.$refs.mapComponent) {
                  this.$refs.mapComponent.focusOnCoordinates(...coordinates);
                }
              }
            })
            .catch(e => {
              console.error("failed to fetch new site coordinates:", e);
            });
        }
      },
      handleStorageChange(event) {
        if (event.key === 'searchKeyword' && event.newValue) {
          const keyword = event.newValue;
          this.handleKeywordClick(keyword);
        }
      },
      initializeOnHome() { //logic for initial load and fetching
        const newSiteId = this.$route.params.siteId;
        const newIiifFile = this.$route.params.iiifFile;
        const newQuery = this.$route.params.query;

        if (this.$route.name === "Home" && !newSiteId && !newIiifFile && this.shouldFireInitialFetch) {
          if (this.$refs.mapComponent) {
            const bbox = this.$refs.mapComponent.getCurrentBbox();
            this.bboxResults = bbox;
            this.shouldFireInitialFetch = false;
          } else {
            console.error("Map component is not available");
          }
        }
        if (newSiteId) {
          this.selectedId = newSiteId;
          this.showResults = true;
        }
        if (newQuery && this.isInitialLoad) {
          if (this.$refs.searchRef) {
            this.searchItems = newQuery;
          } else {
            console.error("searchRef is not available.");
          }
          this.isInitialLoad = false;
        }
        if (newIiifFile) {
          this.updateSiteCoordinates(newIiifFile);
          this.showThreePanels = true;
          this.IiifFileforImageViewer = newIiifFile;
        }
      },
      resetSplitsAndPanels() {
        if (this.splitInstance) {
          this.splitInstance.setSizes([40, 60, 40]);
          this.showThreePanels = false;
          this.showImageGallery();
        }
      },
      updatePreviousRoute(route) {
        this.previousRoute = route;
      },
      handleShowResults(newValue) {
        this.showResults = newValue;
      },
      handleKeywordClick(keyword) { //when a metadata item is clicked in the image viewer
        this.$nextTick(() => {
          if (this.$refs.searchRef) {
            this.searchItems = null;
            this.$nextTick(() => {
              this.searchItems = keyword;
              this.$refs.searchRef.updateSearchFromMetadata(keyword); //sets the text in the search bar, updates router
            });
            this.selectedId = null;
            this.showResults = true;
            this.$refs.advancedSearchRef.clearAdvancedSearchFields();
            this.showImageGallery();
          } else {
            console.error('searchRef is not available.');
          }
        });
      },
      adjustSplitDisplay() {
        const splitElement = document.getElementById("split-1");
        if (!splitElement) return;

        splitElement.style.display = "none";

        const gutterElement = document.getElementById("gutter-1");
        if (gutterElement) {
          gutterElement.style.display = "none";
        }

        const gutterElement2 = document.getElementById("gutter-2");
        if (gutterElement2) {
          gutterElement2.style.display = "none";
        }
      },
      updateWindowWidth() {
        this.windowWidth = window.innerWidth;
      },
      toggleMenu() {
        if (window.innerWidth <= 1024) {
          //only toggle if on smaller screens
          this.isMenuOpen = !this.isMenuOpen;
        }
      },
      detectUserLanguage() {
        if (this.$i18n && this.$i18n.locale) {
          return this.$i18n.locale;
        }
        const storedLang = localStorage.getItem('userLang');
        //return the stored language or default to 'sv'
        return storedLang || 'sv';
      },
      toggleLanguage() {
        this.currentLanguage = this.$i18n.locale === "en" ? "sv" : "en";
        this.$i18n.locale = this.currentLanguage;
        localStorage.setItem('userLang', this.currentLanguage);
      },
      toggleColour() {
        this.currentColour = (this.currentColour === 'dark') ? 'light' : 'dark';
        this.targetTheme = (this.targetTheme === 'dark') ? 'light' : 'dark';
        document.documentElement.setAttribute('style-theme', this.targetTheme);
        localStorage.setItem('userColour', this.currentColour);
        return this.currentColour && this.targetTheme;
      },
      handleMapClicked() {
        this.forceRefresh++;
        this.mapClicked = true;
        this.showResults = true;
        this.$refs.searchRef.clearSearchField();
        this.$refs.advancedSearchRef.clearAdvancedSearchFields();
        this.showImageGallery();
      },
      toggleMap() {
        this.showMap = !this.showMap;
      },
      toggleThreePanels() {
        this.showThreePanels = true;
        this.showImageGallery();
      },
      closeThreePanels() {
        this.showThreePanels = false;
        this.showImageGallery();
        if (this.previousRoute) {
          this.handleRouteChange(this.$route);
        }
      },
      showImageGallery() {
        const splitElement = document.getElementById("split-1");

        if (splitElement && splitElement.style.display === "none") {
          splitElement.style.display = "block";
        }

        const gutterElement = document.getElementById("gutter-1");
        if (gutterElement && this.showThreePanels) {
          gutterElement.style.display = "block";
        }

        const gutterElement2 = document.getElementById("gutter-2");
        if (gutterElement && this.showThreePanels) {
          gutterElement2.style.display = "block";
        }
      },
      handleRouteChange() {
        this.IiifFileforImageViewer = this.newIiifFile;
        if (this.previousRoute) {
          this.$router.push(this.previousRoute);
        }
      },
      onImageClicked(iiifFile, id) {
        this.selectedIiifFile = id;
        this.idForMetaData = id;
        this.toggleThreePanels();
        if (!this.$route.fullPath.includes("image")) {
          this.previousRoute = this.$route.fullPath;
        }
        if (this.IiifFileforImageViewer) {
          this.$router.replace({
            name: "IiifFile",
            params: {
              iiifFile: this.IiifFileforImageViewer,
            },
          });
        }
        document.getElementById("image").scrollIntoView();
      },
      handleAdvancedSearchResults(results) {
        this.advancedSearchResults = null;
        this.$nextTick(() => {
          this.advancedSearchResults = results;
        });
        this.selectedId = null;
        this.showResults = true;
        this.$refs.searchRef.clearSearchField();
        this.$router.push({
          name: "Search",
        });
        this.showImageGallery();
      },
      handleSearchTerm(searchTerm) {
        this.searchItems = null;
        this.$nextTick(() => {
          this.searchItems = searchTerm;
        });
        this.selectedId = null;
        this.showResults = true;
        this.$refs.advancedSearchRef.clearAdvancedSearchFields();
        this.showImageGallery();
      },
      handleBboxSearch(bbox) {
        this.bboxResults = null;
        this.$nextTick(() => {
          this.bboxResults = bbox;
        });
        this.selectedId = null;
        this.showResults = true;
        this.$refs.searchRef.clearSearchField();
        this.$refs.advancedSearchRef.clearAdvancedSearchFields();
        this.showImageGallery();
      },
      handleSiteSelection(siteId) {
        this.selectedId = null;
        this.$nextTick(() => {
          this.selectedId = siteId;
        });
        this.showResults = true;
        this.showImageGallery();
      }
    },
  });
</script>

<style>
  #reset-layout-mapview {
    position: absolute;
    left: 60px;

    /* transform: translateX(50%); */
    bottom: 60px;
    padding: 5px 15px 5px 15px;
    z-index: 100;
    width: max-content;
    height: 32px;
    cursor: pointer;
    border-radius: 8px !important;
    background-color: var(--popup-background);
    backdrop-filter: blur(5px);
    color: var(--popup-text);
  }

  #reset-layout-mapview:hover {
    opacity: 0.9;
    background-color: var(--viewer-button-hover);
    color: var(--button-text);
  }

  @media (max-width: 1023px) {
    #reset-layout-mapview {
      display: none;
    }
  }

  #reset-layout-searchview {
    float: left;
    display: block;
    /* margin-top: 10px;
  margin-bottom: 10px; */
    /* font-size: 1.2rem; */
    padding: 5px 20px;
    background-color: var(--button-background);
    color: var(--button-text);
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 500;
    margin-left: 8px;
    width: max-content;
  }

  #reset-layout-searchview:hover {
    opacity: 0.9;
    background-color: var(--button-hover);
  }

  @media (max-width: 1023px) {
    #reset-layout-searchview {
      display: none;
    }
  }

  .flip-fade-enter-active,
  .flip-fade-leave-active {
    transition: transform 0.15s, opacity 0.15s;
  }

  .flip-fade-enter,
  .flip-fade-leave-to {
    transform: rotateY(90deg);
    opacity: 0;
  }

  .flip-fade-leave,
  .flip-fade-enter-to {
    transform: rotateY(0deg);
    opacity: 1;
  }

  #logo-main {
    width: 110px;
    height: 100px;
    /* background-color: var(--page-text); */
    float: left;
    margin-top: 30px;
    margin-left: 40px;
    background: var(--shfa-logo-main);
    background-repeat: no-repeat;
    background-size: contain;
    opacity: 0.4;
    transition: all 0.8s ease-in-out;
  }

  #gu-logo-bg {
    position: absolute;
    right: 30px;
    height: 145px;
    width: 165px;
    background: var(--logo-background);
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
    background: var(--gu-logo-sv);
    background-size: 125px 95px;
    background-repeat: no-repeat;
    background-position: center;
  }

  #gu-logo-en {
    width: 165px;
    height: 145px;
    background: var(--gu-logo-en);
    background-size: 125px 95px;
    background-repeat: no-repeat;
    background-position: center;
  }

  .menu-show-button {
    display: none;
  }

  .menu-close-button {
    display: none;
  }


  .height {
    height: calc(100vh - 160px);
  }

  .title {
    position: absolute;
    pointer-events: none;
    font-family: "Teko", sans-serif;
    line-height: 0.75;
    letter-spacing: -1.2px;
    font-size: 35px;
    font-weight: 400;
    margin-left: 120px;
    padding: 30px 40px;
    color: var(--title-text);
  }

  @media (max-width: 350px) {
    #logo-main {
      margin-left: 10px;
    }

    .title {
      margin-left: 90px;
    }
  }

  .title .emph {
    cursor: pointer;
    pointer-events: auto;
    display: inline;
    color: var(--emphasised-text);
    transition: all 0.8s ease-in-out;
  }

  .title .aboutemph {
    display: inline;
    color: var(--emphasised-text);
  }

  .about-title {
    float: left;
    position: relative;
    pointer-events: none;
    font-family: 'Teko', sans-serif;
    line-height: 0.75;
    letter-spacing: -1.2px;
    margin-top: 10px;
    font-size: 65px;
    font-weight: 400;
    margin-left: 0px;
    margin-top: 40px;
    padding-left: 30px;
    color: var(--about-title-text);
  }

  .about-title .aboutemph {
    display: inline !important;
    color: var(--about-emphasised-text);
  }

  .top {
    height: 160px;
    z-index: 1000;
    background-color: var(--header-background);
    border-image: var(--default-gradient) 1 / 0px 0px 10px 0px/ 0.1em round space;
  }

  .languages {
    right: 185px;
    font-size: 1.2em;
    font-weight: 400;
    color: var(--header-text);
    position: absolute;
    padding-right: 20px;
    margin-top: 0px;
    cursor: default;
  }

  .version {
    font-size: 15px;
    text-align: right;
    margin-right: 9px;
    margin-top: 10px;
    color: var(--header-text);
  }

  .top-links {
    font-size: 1.2em;
    font-weight: 400;
    margin-top: 110px;
    height: auto;
    right: 201px;
    color: var(--header-text);
    position: absolute;
    padding-right: 0px;
    width: auto;
  }

  .top-links .item {
    margin-right: 5px;
    border-radius: 8px;
    padding: 5px 8px 5px 8px;
  }

  .top-links .item:hover {
    background-color: var(--button-hover-light)
  }

  .button-image {
    float: left;
    margin-right: 10px;
    margin-top: 4px;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    border-width: 1.5px;
    border-color: var(--button-border);
    background-size: contain;
  }

  .top-button {
    float: right;
    text-align: left;
    margin-left: 0px;
    padding: 3px 10px 3px 10px;
    border-radius: 8px;
    cursor: pointer;
  }

  .top-button:hover {
    background-color: var(--button-hover-light)
  }

  .top-link-button {
    float: right;
    text-align: left;
    margin-left: 5px;
    margin-top: 4px;
    height: 20px;
    width: 20px;
    border-radius: 8px;
    background-image: var(--link-button);
    background-size: 18px;
    background-position: center;
    background-repeat: no-repeat;
    border-width: 1.4px;
    border-color: var(--top-link-button-border);
    border-radius: 50%;
  }

  .top-link-infobutton {
    float: right;
    text-align: left;
    margin-left: 5px;
    margin-top: 4px;
    height: 20px;
    width: 20px;
    border-radius: 8px;
    background-image: var(--info-button);
    background-size: 18px;
    background-position: center;
    background-repeat: no-repeat;
    border-width: 1.4px;
    border-color: var(--top-link-button-border);
    border-radius: 50%;
  }

  .main-color {
    background-color: var(--page-background)
  }

  .ui-overlay {
    pointer-events: auto;
    z-index: 100;
    position: absolute;
    border-radius: 8px;
    font-size: 1.1em;
    font-weight: 500;
    color: var(--page-text);
    background-color: var(--overlay);
    backdrop-filter: blur(5px);
  }

  .ui-mode {
    top: 190px;
    padding: 4px 0px 4px 0px;
    background-color: var(--overlay);
  }

  .ui-mode .item {
    cursor: pointer;
    display: inline;
    font-weight: 500;
    padding: 0px 15px 0px 15px;
  }

  .ui-mode .item:hover {
    color: var(--ui-hover);
  }

  .ui-mode .selected {
    color: var(--ui-hover);
  }

  .ui-numbers {
    padding: 2px 15px 6px 15px;
    text-align: center;
    bottom: 30px;
    margin-top: calc(100% - 100px);
    pointer-events: none;
  }

  .ui-map-info {
    padding: 2px 15px 6px 15px;
    text-align: center;
    bottom: 50px;
    margin-top: calc(100% - 100px);
  }

  .ui-text-small {
    font-size: 95%;
  }

  .ui-results {
    position: absolute;
    pointer-events: none;
    bottom: 23px;
    z-index: 100;
    border-radius: 8px;
    font-size: 1.1em;
    font-weight: 500;
    color: var(--results-text);
    padding: 2px 15px 6px 15px;
    text-align: center;
    background-color: var(--overlay);
    backdrop-filter: blur(5px);
  }

  @media (min-width: 1025px) {

    .menu-show-button,
    .menu-close-button {
      display: none;
    }

    .main-menu {
      display: block !important;
    }
  }

  /* This controls the menu look on small screens */
  @media (max-width: 1024px) {
    .top-links {
      top: 50px !important;
      right: 20px;
      width: 250px !important;
    }

    .top-links .item {
      float: right;
    }

    .menu-show-button {
      display: block;
      color: var(--top-link-button-border);
      float: right;
      margin-right: 35px;
      margin-top: 16px;
      padding: 23px;
      border-radius: 50%;
      height: 30px;
      width: 30px;
      background-image: var(--menu-button);
      background-size: 25px 25px;
      background-position: center;
      background-repeat: no-repeat;
    }

    .menu-show-button:hover {
      background-color: var(--button-hover);
      opacity: 1;
    }

    .menu-close-button {
      display: block;
      color: var(--menu-text);
      float: right;
      border-radius: 50%;
      height: 45px;
      width: 45px;
      background-color: none;
      margin-right: 35px;
      margin-top: 15px;
      opacity: 1;
      padding: 4px;
    }

    .menu-close-button:hover {
      background-color: var(--button-hover-light);
      opacity: 1;
    }

    .main-menu {
      display: block;
      width: 100%;
      position: absolute;
      background-color: var(--menu-background);
      height: 440px;
      box-shadow: var(--menu-shadow);
      backdrop-filter: blur(8px);
    }

    @media (max-width: 600px) {

      .main-menu {
        display: block;
        width: 100%;
        position: absolute;
        background-color: var(--menu-background);
        height: 440px;
        box-shadow: none;
        backdrop-filter: blur(8px);
      }
    }


    .languages {
      right: 20px;
      font-size: 1.3em;
      margin-top: 60px;
      padding-top: 10px;
      padding-right: 20px;
    }

    .version {
      font-size: 18px;
      text-align: right;
      margin-right: 9px;
    }

    .top-links {
      width: 350px;
      top: 70px;
      padding-right: 18px;

      float: left;
      padding-left: 50px;
      font-size: 1.5em;
    }

    .item {
      text-align: right;
      display: block;
      padding-bottom: 10px;
    }

    .top-links .item {
      margin-right: 5px;
      border-radius: 8px;
      padding: 5px 8px 5px 18px;
      margin-bottom: 5px;
    }

    .top-link-button {
      float: right;
      text-align: left;
      margin-left: 15px;
      margin-top: 3px;
      height: 30px;
      width: 30px;
      border-radius: 8px;
      background-image: var(--link-button);
      background-size: 25px;
      background-position: center;
      background-repeat: no-repeat;
      border-width: 1.5px;
      border-color: var(--top-link-button-border);
      border-radius: 50%;
    }

    .top-link-infobutton {
      float: right;
      text-align: left;
      margin-left: 15px;
      margin-top: 3px;
      height: 30px;
      width: 30px;
      border-radius: 8px;
      background-image: var(--link-button);
      background-size: 25px;
      background-position: center;
      background-repeat: no-repeat;
      border-width: 1.5px;
      border-color: var(--top-link-button-border);
      border-radius: 50%;
    }

    .top {
      position: relative;
    }
  }

  /* End of menu style */
  @media (max-width: 350px) {
    .menu-show-button {
      margin-right: 15px;
    }

    .menu-close-button {
      margin-right: 15px;
    }

    .languages {
      right: 10px;
      font-size: 1.3em;
      margin-top: 60px;
      padding-top: 10px;
      padding-right: 10px;
    }

    .top-links {
      width: 350px;
      top: 70px;
      padding-right: 0px;

      float: left;
      padding-left: 50px;
      font-size: 1.3em;
    }
  }

  .split-container {
    overflow: hidden !important;
  }

  @media (max-width: 1024px) {
    .flex.height {
      flex-direction: column;
      height: auto;
    }

    .split-container {
      display: flex;
      flex-direction: column;
    }

    .ui-results {
      position: fixed;
      bottom: 23px;
    }
  }

  .split-container-top {
    height: calc(100% - 160px);
    width: 100%;
    position: absolute;
    box-shadow: var(--menu-shadow);
    pointer-events: none;
  }

  #split-0 {
    padding: 45px 15px 0px 40px;
    min-width: 550px;
    overflow-y: auto;
    background: var(--page-background);
  }

  @media (max-width: 1024px) {
    #split-1>div>div>div:nth-child(2)>div.ui-mode.ui-overlay {
      position: absolute;
      top: 0.5%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  @media (max-width: 1024px) {
    #split-0 {
      min-width: 100% !important;
      padding: 25px 35px 0px 35px !important;
      height: auto !important;
    }
  }


  #split-0::-webkit-scrollbar {
    width: 0px !important;
  }

  #split-1 {
    background-color: var(--page-background);
    padding: 0px 20px 0px 40px;
    min-width: 200px;
    border-width: 0px 0px 0px 1px;
    border-style: dotted;
    border-color: var(--divider);
    /* box-shadow: var(--split-shadow); */
  }

  @media (min-width: 1024px) and (max-width: 1250px) {
    #gutter-2 {
      display: none !important;
    }
  }

  @media (max-width: 1024px) {
    #split-1 {
      width: 100% !important;
      position: relative;
      overflow: visible;
      padding: 0px 35px 0px 35px !important;
    }
  }

  #split-1::-webkit-scrollbar {
    width: 0px !important;
  }

  /* comment this for instant scroll */
  /* { 
  scroll-behavior: smooth;
} */

  #split-2::-webkit-scrollbar {
    width: 0px !important;
  }

  @media (max-width: 1024px) {
    #split-2 {
      width: 100% !important;
      padding-right: 10px !important;
      padding-left: 20px !important;
    }
  }

  @media (max-width: 1024px) {
    #map {
      top: -60px;
      height: 75vw;
      width: 100%;
    }
  }

  @media (max-width: 1024px) {
    #split-2>div.image-viewer {
      height: 400px;
    }
  }

  @media (max-width: 600px) {
    .split-container-top {
      height: 0px;
      box-shadow: none;
    }

    #split-0 {
      padding: 20px 20px 0px 20px !important;
    }

    #split-1 {
      padding: 0px 15px 0px 15px !important;
      border-width: 0px;
    }

    #split-2 {
      width: 100% !important;
      padding: 0px 15px 15px 0px !important;
    }
  }

  #search-interface {
    margin-bottom: 10px;
  }

  .tag-example {
    float: left;
    background-color: var(--button-background);
    padding: 5px 10px;
    border-radius: 5px;
    margin-left: 10px;
    margin-bottom: 5px;
    font-size: 1em;
    cursor: pointer;
  }

  .tag-example:hover {
    background-color: var(--button-hover);
    color: var(--page-text);
    cursor: pointer;
  }

  #search {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-left: 0px;
    margin-right: 0px;
    border-radius: 8px;
    margin-top: 10px;
    padding: 10px 15px;
    background: transparent;
  }

  #search-wrapper {
    background: var(--main-input-wrapper-background);
    color: var(--base);
  }

  input[type="search"]::-webkit-search-cancel-button {
    -webkit-appearance: none;
    height: 0.5em;
    width: 0.5em;
    border-radius: 50em;
    background: var(--close-button);
    background-size: contain;
    opacity: 1;
    pointer-events: none;
  }

  input[type="search"]:focus::-webkit-search-cancel-button {
    opacity: 1;
    pointer-events: all;
    filter: invert(1);
  }

  h2 {
    display: flex;
    color: var(--page-text);
    font-size: 30px;
    font-weight: 400;
    line-height: 0.8;
  }

  input:focus {
    outline: none;
  }

  h2 input {
    flex: 1;
    min-width: 3em;
    color: var(--page-text);
    font-weight: 400;
    z-index: 35;
  }

  h2 input:hover,
  h2 input:focus,
  h2 input:not(:placeholder-shown) {
    background-color: var(--base);
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
    background-color: var(--ui-hover);
    cursor: ew-resize;
  }

  .gutter-2 {
    background-color: var(--ui-hover);
    cursor: ew-resize;
  }

  @media (max-width: 600px) {
    .gutter {
      display: none;
    }

    .gutter-2 {
      display: none;
    }
  }

  #split-2 {
    z-index: 0;
    min-width: 420px !important;
    background-color: var(--page-background);
    padding: 0px 0px 0px 0px;
  }

  .close-button {
    color: var(--viewer-button-text);
    z-index: 1000;
    position: relative;
    border-radius: 50%;
    height: 35px;
    width: 35px;
    background-color: var(--viewer-button-background);
    margin-left: 37px;
    margin-top: 58px;
    opacity: 1;
    padding: 5px;
    border-width: 1px;
    border-style: solid;
    border-color: var(--viewer-button-border);
  }

  .close-button:hover {
    background-color: var(--viewer-button-hover);
    opacity: 1;
  }

  @media (max-width: 600px) {
    .close-button {
      margin-left: 12px;
    }
  }

  #app .search-container .tag-example-search {
    background-color: var(--button-background);
    padding: 0px 10px;
    font-size: 1em;
    font-weight: 400;
    border-radius: 5px;
    cursor: pointer;
    display: inline-block;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--page-text);
    box-shadow: var(--menu-shadow);
  }



  .flex-grow.overflow-auto.main-color::-webkit-scrollbar {
    display: none;
  }

  .flex-grow.overflow-auto.main-color {
    -ms-overflow-style: none;
    /* IE and Edge */
    scrollbar-width: none;
    /* Firefox */
  }

  /*   Adaptation for plus-sized monitors */
  @media screen and (min-height: 950px) {
    .split-container-top {
      height: calc(100% - 160px);
      width: 100%;
    }

    h2 {
      width: 100%;
      font-size: 1.3em;
      text-align: left;
      color: var(--page-text);
      padding-left: 0px;
      margin-top: 5px;
      margin-bottom: 25px;
    }

    .filter-text {
      font-size: 1.1em;
    }

    .ui-overlay {
      font-size: 1.1em;
    }

    #app .map-switch-margin {
      font-size: 1.2em;
    }

    #app #filter-interface {
      font-size: 100% !important;
      height: 40px;
    }

    #app .tag-example {
      font-size: 110% !important;
    }

    #app #search-interface .tag-example-search {
      font-size: 1.3em !important;
      max-height: 42px;
    }

    #app .field-title {
      font-size: 1.1em;
      margin-bottom: 5px;
      color: var(--page-text);
    }

    #app .search-container .input-wrapper {
      font-size: 1.1em;
      margin-bottom: 5px;
      color: var(--page-text);
    }

    #app .search-button {
      font-size: 1.1rem !important;
      padding: 3px 15px;
    }

    #app .search-container .input-wrapper {
      gap: 5px !important;
    }

    /* Metadata settings */

    #metadata-container {
      font-size: 100%;
    }

    #metadata-container .label {
      width: 120px;
      color: var(--page-text);
      font-weight: 600;
    }

    #metadata-container .data {
      max-width: 200px;
    }

    #metadata-container .metadata-wide {
      float: left;
      padding-left: 25px;
      color: var(--page-text);
      width: 100%;
      margin-top: 20px;
    }

    #metadata-container ul li {
      float: left;
      list-style-type: none;
      padding: 2px 12px;
      border-radius: 5px;
      background-color: var(--button-background);
    }

    #app .datareportcard {
      padding: 110px 30px 30px 30px;
    }
  }

  .material-symbols-outlined {
    font-variation-settings:
      'FILL' 100,
      'wght' 200,
      'GRAD' 0,
      'opsz' 24;
    vertical-align: middle;
    padding: 1px;
    color: var(--header-text);
    cursor: pointer;
  }

  .toggle-button-group {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #333;
    border-radius: 10px;
    padding: 4px 4px;
    margin: 30px auto 10px auto;
    width: fit-content;
  }

  .toggle-button-group button {
    background: none;
    border: none;
    border-radius: 8px !important;
    color: #fff;
    padding: 4px 16px;
    cursor: pointer;
    font-size: 1.1rem;
  }

  .toggle-button-group button.active {
    background-color: var(--popup-background);
    border-radius: 25px;
  }
</style>