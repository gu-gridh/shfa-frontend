<template>
  <div id="map">
    <div class="expand-map-widget" ref="expandWidget" @click="expandMap"></div>
    <div class="zoom-warning" id="zoom-message">{{ $t("message.zoommap")
      }}</div>
    <button id="search-bbox-button" v-if="bboxUpdated" @click="fetchImagesClicked()">{{ $t("message.searchinbbox")
      }}</button>
    <div id="popup" class="ol-popup">
      <button id="popup-closer" class="ol-popup-closer"></button>
      <div id="popup-content">
        <p id="lamning_id"></p>
        <p id="raa_id"></p>
        <p id="placename"></p>
        <p id="lokalitet_id"></p>
        <p id="askeladden_id"></p>
        <p v-if="isSwedish" id="fornsok_header">
          <span class="link-button"></span><a v-if="isSwedish" id="fornsok_link"> {{
            $t("message.checkfornsök")
            }}</a>
        </p>
        <p v-if="isNorwegian" id="kulturminnesok_header">
          <span class="link-button"></span><a v-if="isNorwegian" id="kulturminnesok_link"> {{
            $t("message.checkkulturminnesok")
            }}</a>
        </p>
        <p>
          <span class="link-button"></span><a id="extmap_link" target="_blank"> {{ $t("message.maplink") }}</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import VectorLayer from 'ol/layer/Vector.js';
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon.js";
import { fromExtent } from 'ol/geom/Polygon.js';
import WebGLPointsLayer from "ol/layer/WebGLPoints";
import Overlay from "ol/Overlay";
import Zoom from "ol/control/Zoom";
import { useStore } from "../stores/store.js";
import { transformExtent } from "ol/proj";
import LayerSwitcher from 'ol-layerswitcher';
import { Style, Fill, Stroke } from 'ol/style';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import LayerGroup from 'ol/layer/Group';
import debounce from 'lodash/debounce'
import TileWMS from 'ol/source/TileWMS.js';

export default {
  name: "MapComponent",
  props: {
    showMap: {
      type: Boolean,
    },
    coordinates: {
      type: Array,
      default: () => [],
    },
    bbox: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      map: null,
      vectorLayer: null,
      clickedRaaId: null,
      bboxUpdated: true,
      isSwedish: null,
      isNorwegian: null,
      results: [],
      cachedResults: [],
      coordinateStore: useStore(),
      locations:
        [{
          name: 'Capo di Ponte',
          extent: [10.280630228018975, 45.99293198965768, 10.429418233894614, 46.08057040222624],
          zoom: 9.5
        },
        {
          name: 'East Denmark',
          extent: [10.547338193393697, 54.88522946110015, 13.313538450013601, 56.21281819024111],
          zoom: 9.5
        },
        {
          name: 'Bornholm',
          extent: [14.570707123694492, 54.97844885477815, 15.25447460680681, 55.31001881924351],
          zoom: 9
        },
        {
          name: 'North Norway',
          extent: [12.554390039379985, 65.8136794007035, 12.588035944428565, 65.82537302514689],
          zoom: 9
        },
        {
          name: 'Vingen',
          extent: [5.260324211598671, 61.80509846218959, 5.367796343864215, 61.84815228795725],
          zoom: 9.75
        },
        {
          name: 'Vålådalen',
          extent: [11.704174523632746, 62.54648249879901, 14.513168012454589, 63.64847226657625],
          zoom: 8.123
        },
        {
          name: 'Gotland',
          extent: [17.513174670372624, 57.020592564779975, 19.753000596207425, 58.062886268526256],
          zoom: 8.44999999999999
        },
        {
          name: 'Lerberg',
          extent: [11.328369638055705, 58.90122304424608, 11.400832551072183, 58.933663487575984],
          zoom: 13.4
        },
        {
          name: 'Utby',
          extent: [11.327822802207764, 58.75384513495297, 11.380412139115528, 58.77651539902158],
          zoom: 14
        },
        {
          name: 'Trollhättan',
          extent: [12.15738173533494, 58.227118178236026, 12.642861792437941, 58.39854824830422],
          zoom: 11
        },
        {
          name: 'Växsjö',
          extent: [13.559456183370157, 56.60214828694683, 15.0936533881588, 57.16560071860496],
          zoom: 9
        },
        {
          name: 'Senoren',
          extent: [15.495836722062396, 56.04407481172257, 16.120355679608245, 56.27785953081357],
          zoom: 10
        },
        {
          name: 'Umeå',
          extent: [18.59707164248733, 63.328028653896865, 21.602319408229594, 64.22070829719868],
          zoom: 8.7
        },
        {
          name: 'Tjörn',
          extent: [11.462438176159067, 57.949980245340925, 11.783449041239933, 58.1017415182024],
          zoom: 11
        },

        {
          name: 'Timmervik',
          extent: [11.729588101917921, 57.94374607180518, 11.908663572336392, 57.981682122574455],
          zoom: 12.23
        },

        {
          name: 'Tanum1',
          extent: [11.33695136204091, 58.69434924566988, 11.341622144030854, 58.695867553336484],
          zoom: 17.48
        },

        {
          name: 'Tanum2',
          extent: [11.347513875726316, 58.71596325683694, 11.400385579827878, 58.735256825937256],
          zoom: 14
        },
        ]
    };
  },
  mounted() {
    this.debouncedFitToBbox = debounce(this._fitToBbox, 500)
    try {
      this.initMap();
      this.$nextTick(() => {
        this.updateCoordinates();
        this.fetchAdditionalData();
      });
    } catch (error) {
      console.error("Error in mounted hook:", error);
    }
  },
  beforeDestroy() {
    if (this.map) {
      this.map.un("moveend", this.updateBbox);
    }
  },
  watch: {
    results: {
      deep: true,
      handler() {
        this.updateCoordinates();
      },
      expandedMap: false,
    },
    'coordinateStore.currentBbox': {
      handler(bbox) {
        if (bbox) this.debouncedFitToBbox(bbox)
      },
      deep: false
    }
  },
  methods: {
    expandMap() {
      this.expandedMap = !this.expandedMap;
      if (this.expandedMap) {
        document.body.classList.add("map-expanded");
      } else {
        document.body.classList.remove("map-expanded");
      }
    },
    _fitToBbox(bbox) { //used to move the map to the bounding box when you scroll down in the gallery
      this.focusOnBoundingBox({
        bottomLeft: [bbox[0], bbox[1]],
        topRight: [bbox[2], bbox[3]]
      })
    },
    getCurrentBbox() {
      const extent = this.map.getView().calculateExtent(this.map.getSize());
      const bbox = transformExtent(extent, "EPSG:3857", "EPSG:4326");
      return bbox;
    },
    fetchImagesClicked() {
      const extent = this.map.getView().calculateExtent(this.map.getSize());
      const bbox = transformExtent(extent, "EPSG:3857", "EPSG:4326");
      this.$emit("bbox-search", bbox);
      this.$router.push({ name: 'Search' });
    },

    focusOnBoundingBox(boundingBox) {
      if (this.map && boundingBox) {
        //extract the bounding box coordinates in the format [minLon, minLat, maxLon, maxLat]
        const extent = [
          boundingBox.bottomLeft[0],
          boundingBox.bottomLeft[1],
          boundingBox.topRight[0],
          boundingBox.topRight[1],
        ];

        //transform the extent to the map's projection
        const transformedExtent = transformExtent(
          extent,
          "EPSG:4326",
          "EPSG:3857"
        );

        //buffer the bounding box for display
        const bufferedExtent = [transformedExtent[0]-10,transformedExtent[1]-10,transformedExtent[2]+10,transformedExtent[3]+10]

        //const bboxExtent = [[[transformedExtent[0]-5,transformedExtent[1]-5],[transformedExtent[0]-5,transformedExtent[3]+5],
        //[transformedExtent[2]+5,transformedExtent[3]+5],[transformedExtent[2]+5,transformedExtent[1]-5],
        //[transformedExtent[0]-5,transformedExtent[1]-5]]]

        //fit the map view to the extent
        this.map.getView().fit(bufferedExtent, {
          size: this.map.getSize(),
          padding: [5, 5, 5, 5], // optional padding in pixels
          maxZoom: 5,
          constrainResolution: false, // allow intermediate zoom levels
          duration: 1000, //slow zoom for better user experience
          minResolution: 5.0, //limit resolution so landmarks in basemap are still visible
        });

        
        //clear any existing rendered bboxes
        if (this.bboxLayer && this.bboxLayer.getSource().getFeatures().length > 0) {
          this.bboxLayer.getSource().clear()
        }

        //add the new bbbox to map using transformed [minLon, minLat, maxLon, maxLat]
        this.bboxLayer.getSource().addFeature(new Feature(fromExtent(bufferedExtent)))

        this.map.renderSync();
      } else {
        console.warn("Invalid bounding box or map object.");
      }
    },
    setRandomLocation() {
      const randomLocation = this.locations[Math.floor(Math.random() * this.locations.length)];
      const transformedExtent = transformExtent(
        randomLocation.extent,
        "EPSG:4326",
        "EPSG:3857"
      );
      this.map.getView().fit(transformedExtent, {
        size: this.map.getSize(),
      });
      this.map.getView().setZoom(randomLocation.zoom);
    },
    focusOnCoordinates(lon, lat) {
      if (this.map) {
        const coordinates = fromLonLat([lon, lat]);
        this.map
          .getView()
          .animate({ center: coordinates, zoom: 18, duration: 1050 });
      }
    },
    async fetchAdditionalData(url, pagesToFetch = 1) {
      if (!url) {
        url = "https://dev-shfa.dh.gu.se/api/geojson/site/?page_size=1000";
      }

      const delay = async (duration) =>
        new Promise((resolve) => setTimeout(resolve, duration));

      let pagesFetched = 0;

      const fetchData = async (url) => {
        try {
          const response = await fetch(url);
          const data = await response.json();

          if (data && data.features) {
            const additionalResults = data.features.map((feature) => ({
              coordinates: feature.geometry?.coordinates ?? [],
              id: feature.id ?? null,
              lamning_id: feature.properties.lamning_id ?? null,
              raa_id: feature.properties.raa_id ?? null,
              ksamsok_id: feature.properties.ksamsok_id ?? null,
              lokalitet_id: feature.properties.lokalitet_id ?? null,
              askeladden_id: feature.properties.askeladden_id ?? null,
              placename: feature.properties.placename ?? null,
              international: feature.properties.internationl_site ?? null,
            }));

            this.updateCoordinates(additionalResults);

            this.cachedResults.push(...additionalResults);

            pagesFetched++;

            if (data.next) {
              const fixedNextUrl = data.next.replace("http://", "https://");
              if (pagesFetched % pagesToFetch === 0) {
                await delay(1000);
              }
              await fetchData(fixedNextUrl);
            } else {
              this.updateCoordinates(this.cachedResults);
            }
          } else {
            console.error("Unexpected API response:", data);
          }
        } catch (error) {
          console.error("Error fetching additional data:", error);
        }
      };

      await fetchData(url);
    },

    initMap() {
      const container = document.getElementById("popup");
      const raaContent = document.getElementById("raa_id");
      const lamningContent = document.getElementById("lamning_id");
      const lokalitetContent = document.getElementById("lokalitet_id");
      const askeladdenContent = document.getElementById("askeladden_id");
      const placenameContent = document.getElementById("placename");
      const closebutton = document.getElementById("popup-closer");

      const zoomMessage = document.getElementById("zoom-message");

      //Overlay that anchors the popups
      const overlay = new Overlay({
        element: container,
        positioning: "center-center",
      });

      closebutton.onclick = function () {
        container.style.visibility = "collapse";
        closebutton.blur();
        return false;
      };


      // Create a list of the SGU shore displacement data for relevant years
      let sgu_layers = []
      const start_bp = 1000
      const stop_bp = 4000
      const interval = 100
      const strand_years = Array.from({ length: Math.ceil((stop_bp - start_bp) / interval) + 1 }, (_, i) => stop_bp - i * interval,);
      // Loop through the years to create a raster layer
      strand_years.forEach((year, index) => {
        var layer = new TileLayer({
          source: new TileWMS({
            url: 'https://maps3.sgu.se/geoserver/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap',
            attributions: `<a href="https://resource.sgu.se/dokument/produkter/strandforskjutningsmodell-beskrivning.pdf" target="_blank">Source: Sveriges geologiska undersökning</a>`,
            params: { 'LAYERS': `strand:SE.GOV.SGU.STRANDFORSKJUTNINGSMODELL.${year}BP`, 'TILED': true },
            serverType: 'geoserver'
          }),
          title: `${year} cal BP`,
          visible: false,
          opacity: ((strand_years.length - index) / 100) + 0.4, //make lower layers less transparent to view multiple layers at once
          zIndex: index,
          maxResolution: 7250,
          minResolution: 10,
          className: "dark",//make layers easier to see with transparency on since we're using WMS layers without SLD
        })
        sgu_layers.push(layer)
      }
      )

      this.bboxLayer = new VectorLayer({
        source: new VectorSource({ features: [] }),
        style: new Style({
          stroke: new Stroke({
            color: '#1861ac',
            lineDash: [1,5],
            width: 1.5
          }),
          fill: new Fill({
            color: 'rgba(0,0,0,0)'  //transparent
          })
        }),
        zIndex: 2000,
      });

      this.map = new Map({
        target: "map",
        layers: [
          new TileLayer({
            className: "grey",
            source: new OSM(),
          }),
          this.bboxLayer,
          new LayerGroup({
            title: 'SGU Strandförskjutningsmodell',
            combine: false,
            visible: false,
            layers: sgu_layers,
            openInLayerSwitcher: true,
            fold: 'close',
            label: '',
            collapseLabel: ''
          })
        ],
        view: new View({
          center: fromLonLat([11.35, 58.73]),
          zoom: 13,
        }),
        overlays: [overlay],
      });

      var layerSwitcher = new LayerSwitcher({
        activationMode: 'click',
        // reverse: true,
        groupSelectStyle: 'children'
      });
      this.map.addControl(layerSwitcher);

      //Display notice for users to zoom in if they are outside the resolution range of the SGU layers when at least one of them is visible
      const sgu_group = LayerSwitcher.getGroupsAndLayers(this.map)

      sgu_group[0].on('change:visible', (event) => {
        var maxRes = sgu_group[1].getMaxResolution()

        //Display message if out of range when a layer is first turned on
        if (sgu_group[0].getVisible() && this.map.getView().getResolution() > maxRes) {
          zoomMessage.style.visibility = 'visible'
        }

        //Check whether resolution is in range while after zooming
        if (sgu_group[0].getVisible()) {
          this.map.on('moveend', (event) => {
            if (this.map.getView().getResolution() > maxRes) {
              zoomMessage.style.visibility = 'visible'
            }
            else { zoomMessage.style.visibility = 'hidden' }
          })
        }

        else { zoomMessage.style.visibility = 'hidden' }
      })

      const path = window.location.pathname;
      const match = path.match(/^\/image\/(\d+)$/); //check if address contains image + extract ID

      if (match) {
        this.setRandomLocation();
      } else {
        this.setRandomLocation();
      }

      if (this.map) {
        this.map.addControl(new Zoom());
      }

      const markerColour = '#F0C02E';
      var webGLStyle = {
        symbol: {
          symbolType: "image",
          color: markerColour,
          size: [20, 30],
          offset: [0, 10],
          src: "/interface/assets/marker-white.svg"
        },
      };

      const pointSource = new VectorSource();
      this.vectorLayer = new WebGLPointsLayer({
        source: pointSource,
        style: webGLStyle,
        className: "markers",
        zIndex: 1000
      });


      this.map.addLayer(this.vectorLayer);
      this.map.on("pointermove", (event) => {
        if (event.dragging) {
          return;
        }
        this.map.forEachFeatureAtPixel(event.pixel, (feature) => {
          const lamning_id = feature.get("lamning_id");
          const raa_id = feature.get("raa_id");
          const id = feature.get("id");
          const ksamsok_id = feature.get("ksamsok_id");
          const coords = feature.get("coords");
          const extent = feature.getGeometry().getExtent();
          const lokalitet_id = feature.get("lokalitet_id");
          const askeladden_id = feature.get("askeladden_id");
          const placename = feature.get("placename");
          const international = feature.get("international");
          const fornsokLink = document.getElementById("fornsok_link");
          const fornsokHeaderElement = document.getElementById("fornsok_header");
          const kulturminnesokLink = document.getElementById("kulturminnesok_link");
          const kulturminnesokHeaderElement = document.getElementById("kulturminnesok_header");

          if (!raa_id && !lamning_id) {
            this.isSwedish = false;
            this.isNorwegian = false;
            if (askeladden_id) {
              this.isNorwegian = true
              if (kulturminnesokHeaderElement && kulturminnesokLink) {
                const kulturminnesokHeader = kulturminnesokHeaderElement.getElementsByTagName("a")[0];
                if (kulturminnesokHeader) {
                  kulturminnesokHeader.setAttribute("target", "_blank");
                  kulturminnesokHeader.setAttribute("href", `https://kulturminnesok.no/ra/lokalitet/${lokalitet_id}`);
                }
              }
            }
          } else {
            this.isSwedish = true;
            this.isNorwegian = false;
            if (fornsokHeaderElement && fornsokLink) {
              const fornsokHeader = fornsokHeaderElement.getElementsByTagName("a")[0];
              if (fornsokHeader) {
                fornsokHeader.setAttribute("target", "_blank");
                fornsokHeader.setAttribute("href", `https://kulturarvsdata.se/raa/lamning/${ksamsok_id}`);
              }
            }
          }

          raaContent.innerHTML = raa_id;
          lamningContent.innerHTML = lamning_id;
          placenameContent.innerHTML = placename;
          lokalitetContent.innerHTML = lokalitet_id;
          askeladdenContent.innerHTML = askeladden_id;
          document.getElementById(
            "extmap_link"
          ).href = `https://www.google.com/maps/place/${coords}`;
          container.style.visibility = "visible";
          overlay.setPosition(extent);
        },
          {
            layerFilter: (layer) => layer === this.vectorLayer,
            hitTolerance: 10,
          });
      });

      this.map.on("click", (event) => {
        this.map.forEachFeatureAtPixel(
          event.pixel,
          (feature) => {
            const lamning_id = feature.get("lamning_id");
            const raa_id = feature.get("raa_id");
            const id = feature.get("id");
            const ksamsok_id = feature.get("ksamsok_id");
            const coords = feature.get("coords");
            const lokalitet_id = feature.get("lokalitet_id");
            const askeladden_id = feature.get("askeladden_id");
            const placename = feature.get("placename");
            const international = feature.get("international");

            this.clickedId = id;
            this.clickedLamningId = lamning_id;
            this.clickedRaaId = raa_id;
            this.$emit("map-clicked");
            this.$emit("id-selected", id);

            //Zoom to the clicked point and make sure basemap is still visible
            const extent = feature.getGeometry().getExtent();
            const view = this.map.getView();
            view.fit(extent, {
              duration: 1000,
              padding: [1, 1, 1, 1],
              minResolution: 5.0,
            });

            const fornsokHeaderElement = document.getElementById("fornsok_header");
            const fornsokLink = document.getElementById("fornsok_link");
            const kulturminnesokLink = document.getElementById("kulturminnesok_link");
            const kulturminnesokHeaderElement = document.getElementById("kulturminnesok_header");

            if (!raa_id && !lamning_id) {
              this.isSwedish = false;
              this.isNorwegian = false;
              if (askeladden_id) {
                this.isNorwegian = true
                if (kulturminnesokHeaderElement && kulturminnesokLink) {
                  const kulturminnesokHeader = kulturminnesokHeaderElement.getElementsByTagName("a")[0];
                  if (kulturminnesokHeader) {
                    kulturminnesokHeader.setAttribute("target", "_blank");
                    kulturminnesokHeader.setAttribute("href", `https://kulturminnesok.no/ra/lokalitet/${lokalitet_id}`);
                  }
                }
              }
            } else {
              this.isSwedish = true;
              this.isNorwegian = false;
              if (fornsokHeaderElement && fornsokLink) {
                const fornsokHeader = fornsokHeaderElement.getElementsByTagName("a")[0];
                if (fornsokHeader) {
                  fornsokHeader.setAttribute("target", "_blank");
                  fornsokHeader.setAttribute("href", `https://kulturarvsdata.se/raa/lamning/${ksamsok_id}`);
                }
              }
            }

            raaContent.innerHTML = raa_id;
            lamningContent.innerHTML = lamning_id;
            placenameContent.innerHTML = placename;
            lokalitetContent.innerHTML = lokalitet_id;
            askeladdenContent.innerHTML = askeladden_id;
            document.getElementById(
              "extmap_link"
            ).href = `https://www.google.com/maps/place/${coords}`;
            container.style.visibility = "visible";
            overlay.setPosition(extent);
          },
          {
            layerFilter: (layer) => layer === this.vectorLayer,
            hitTolerance: 10,
          }
        );
      });

      // this.map.on("movestart", () => {
      //   this.bboxUpdated = false;
      // });

      //check
      // this.map.on(
      //   "moveend",
      //   debounce(() => {
      //     this.updateBbox();
      //   }, 1000)
      // );
    },

    updateCoordinates() {
      const newFeatures = this.cachedResults.map((result) => {
        const coord = result.coordinates;
        const feature = new Feature({
          geometry: new Point(fromLonLat([coord[0], coord[1]])),
        });
        feature.set("lamning_id", result.lamning_id);
        feature.set("raa_id", result.raa_id);
        feature.set("id", result.id);
        feature.set("ksamsok_id", result.ksamsok_id);
        feature.set(
          "coords",
          result.coordinates[1] + "," + result.coordinates[0]
        );
        feature.set("placename", result.placename);
        feature.set("askeladden_id", result.askeladden_id);
        feature.set("lokalitet_id", result.lokalitet_id);
        feature.set("international", result.internationl_site);
        return feature;
      });

      const pointSource = this.vectorLayer.getSource();
      pointSource.clear();
      pointSource.addFeatures(newFeatures);
    },
  },
};
</script>

<style>
/* handle long text for international sites */
#placename {
  text-wrap: stable;
  text-align: left;
}

.layer-switcher {
  top: 20px;
  /* overflow:auto!important; */
}

.layer-switcher .panel {
  text-align: justify;
  color: var(--popup-text);
  line-height: 1.2;
  background-color: rgba(40, 40, 40, 0.9);
  opacity: 100%;
  box-shadow: var(--shadow);
  padding: 8px 18px 8px 22px;
  min-width: max-content;
  block-size: fit-content;
  font-family: "Barlow Condensed", sans-serif !important;
  max-width: max-content;
  min-height: max-content;
  cursor: pointer;
  border-radius: 12px;
  border-width: 0px;
  margin-right: -5px;
  margin-top: -5px;
  backdrop-filter: blur(5px);
}

.layer-switcher button,
.layer-switcher button:focus {
  background-color: var(--viewer-button-background);
  background-image: var(--map-layers-icon);
  background-size: 24px;
  background-position: center;
  opacity: 1 !important;
}

.layer-switcher button:hover {
  background-color: var(--viewer-button-hover);
  background-image: var(--map-layers-icon);
  background-size: 24px;
  background-position: center;
}

.layer-switcher.shown {
  max-height: 250px;
  border-radius: 12px;
  border-width: 0px;
  /* Scroll to access all layer options */
  overflow: scroll !important;
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}

/* Hide scrollbar for Chrome, Safari and Opera */
.layer-switcher.shown::-webkit-scrollbar {
  display: none;
}

/* Fix rounded corners on layer menu */
.layer-switcher.shown.layer-switcher-activation-mode-click {
  padding-left: 0px;
}

.layer-switcher.shown.layer-switcher-activation-mode-click button {
  background-color: transparent !important;
  background-image: var(--collapse-layers-icon);
  background-size: 14px;
  background-position: center !important;
  margin-left: -5px !important;
}

button[title="Collapse legend"] {
  background-color: transparent !important;
  background-image: var(--close-layers-icon) !important;
  background-size: 12px !important;
  font-size: 0px;
  left: 255px !important;
  top: -2px !important;
  position: absolute !important;
}

input[type="checkbox" i] {
  accent-color: var(--highlighted-text);
}

#search-bbox-button {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background: var(--search-button-dark-bkgrnd) no-repeat 4px 50%;
  background-size: 32px 32px;
  bottom: 20px;
  padding: 5px 15px 5px 38px;
  z-index: 100;
  width: auto;
  height: auto;
  cursor: pointer;
  border-radius: 8px !important;
  background-color: var(--popup-background);
  backdrop-filter: blur(5px);
  color: var(--popup-text);
}

#search-bbox-button:hover {
  background-size: 32px 32px;
  bottom: 20px;
  padding: 5px 15px 5px 38px;
  z-index: 100;
  width: auto;
  height: auto;
  cursor: pointer;
  border-radius: 8px !important;
  background-color: var(--viewer-button-hover);
  backdrop-filter: blur(5px);
  color: var(--button-text);
}

#map {
  z-index: 40;
  /* Fixes border-radius in Safari. */
  width: calc(100% - 10px);
  height: 100%;
  min-height: 200px;
  margin-top: 10px !important;
  margin-left: 5px !important;
  margin-bottom: 0px;
  padding: 0px 0px 0px 0px;
  border-radius: 10px;
  box-shadow: var(--shadow-map);
  cursor: pointer;
  overflow: hidden !important;
  border-width: 0px;
  position: relative;
  background-color: var(--page-background) !important;
  transition: all 0.5s ease-in-out;
  /* filter:contrast(130%) grayscale(80%) brightness(0.9); */
}

/* only apply bottom margin to tablets and above */
@media (min-width: 1025px) {
  #map {
    margin-bottom: 40px;
  }
}

.map-expanded #map {
  width: 100%;
  height: 100%;
  margin-top: -105px !important;
}

@media (max-width: 1024px) {
  .map-expanded #map {
    width: 100%;
    height: 70vw !important;
    margin-top: -102px !important;
  }
}

@media (max-width: 600px) {
  #map {
    /* margin-top: 70px !important; */
    /* margin-bottom: -40px !important; */
    box-shadow: none;
  }
}

#app .ol-control {
  position: absolute;
  right: 20px;
  /* box-shadow: 0rem 0.5rem 1rem rgba(0, 0, 0, 0.0) !important; */
}

#app .ol-control button {
  font-family: "Barlow Condensed", sans-serif;
  border-radius: 50% !important;
  color: var(--page-text) !important;
}

#app .ol-control button:active,
#app .ol-control button:hover,
#app .ol-control button:focus {
  opacity: 0.5;
}

.ol-scaleline-control {
  position: relative !important;
  margin-top: 200px !important;
  margin-left: 120px !important;
  display: none !important;
}

.ol-zoom {
  /* display:none; */
  font-size: 30px !important;
  color: var(--page-text) !important;
  width: 40px;
  height: 40px;
  padding: 0px !important;
  /* box-shadow: 0rem 0.5rem 1rem rgba(0, 0, 0, 0.2) !important; */
  opacity: 0.9 !important;
  left: 20px !important;
  position: absolute !important;
}

.ol-zoom-in,
.ol-zoom-out {
  background-color: var(--viewer-button-background) !important;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
  border-width: 0px;
  width: 33px;
  height: 33px;
  position: absolute;
  font-size: 0;
}

.ol-zoom-in {
  background: url(../assets/openseadragon/plus.svg) no-repeat center center;
  background-color: var(--viewer-button-background) !important;
  background-size: contain;
  top: 60px;
}

.ol-zoom-out {
  background: url(../assets/openseadragon/minus.svg) no-repeat center center;
  background-color: var(--viewer-button-background) !important;
  background-size: contain;
  top: 100px;
}

.expand-map-widget {
  opacity: 0.9 !important;
  position: absolute !important;
  z-index: 1000;
  left: 20px !important;
  top: 20px !important;
  font-size: 100px !important;
  width: 33px !important;
  height: 33px !important;
  overflow: hidden !important;
  border-radius: 50% !important;
  background: url(../assets/openseadragon/expand.svg) no-repeat center center !important;
  background-color: var(--viewer-button-background) !important;
  background-size: contain !important;
}

.expand-map-widget:hover,
.ol-zoom-in:hover,
.ol-zoom-out:hover {
  background-color: var(--viewer-button-hover) !important;
}

@media (max-width: 1024px) {
  .expand-map-widget {
    display: none;
  }

  .ol-zoom-in {
    top: 20px;
  }

  .ol-zoom-out {
    top: 60px;
  }
}

.ol-full-screen {
  display: none;
  opacity: 0.9 !important;
  position: relative !important;
  left: 20px !important;
  top: 20px !important;
  font-size: 100px !important;
  width: 33px !important;
  height: 33px !important;
  overflow: hidden !important;
  border-radius: 50% !important;
  background: url(../assets/openseadragon/expand.svg) no-repeat center center !important;
  background-color: var(--viewer-button-background) !important;
  background-size: contain !important;
}

.ol-full-screen:hover {
  background-color: var(--viewer-button-hover) !important;
}

.ol-compass {
  display: none !important;
}

.ol-attribution {
  display: flex;
  bottom: 3%;
  font-size: 10px;
  font-weight: 525;
  color: black;
}

.ol-attribution-expand {
  display: none;
}

.ol-attribution-collapse {
  display: none;
}

#map .grey {
  filter: grayscale(100%) contrast(110%);
}

#map .dark {
  filter: brightness(55%) contrast(150%) saturate(200%);
}

@media (max-width: 350px) {
  .ol-zoom {
    bottom: 18%;
  }
}

.ol-zoom-in:hover {
  background-color: var(--viewer-button-hover);
}

.ol-zoom-out:hover {
  background-color: var(--viewer-button-hover);
}

.ol-control {
  position: fixed;
}

#app .ol-zoomslider {
  top: 1rem !important;
  border-radius: 5px !important;
  background: var(--button-hover) !important;
  border: var(--footer-background) !important;
  right: 60px !important;
  height: 200px !important;
  width: 25px !important;
  position: fixed !important;
}

.ol-zoomslider-thumb {
  width: 60px !important;
}

.overlay-content {
  box-shadow: var(--shadow);
  padding: 10px 20px;
  font-size: 16px;
}

.ol-popup {
  text-align: justify;
  position: absolute;
  color: var(--popup-text);
  line-height: 1.5;
  background-color: var(--popup-background);
  opacity: 100%;
  box-shadow: var(--shadow);
  padding: 8px 18px 12px 18px;
  border-radius: 8px;
  bottom: 38px;
  left: -48px;
  min-width: 180px;
  /* min-width: max-content; */
  block-size: fit-content;
  font-family: "Barlow Condensed", sans-serif !important;
  max-width: max-content;
  min-height: max-content;
  cursor: pointer;
}

.link-button {
  float: left;
  text-align: right;
  margin-top: 4px;
  height: 15px;
  width: 15px;
  background-image: var(--popup-link-button);
  background-size: 18px;
  background-position: center;
  background-repeat: no-repeat;
  border-width: 1.4px;
  border-color: var(--top-link-button-border);
  border-radius: 50%;
}

#fornsok_link,
#kulturminnesok_link,
#extmap_link {
  color: var(--popup-text);
  padding: 5px;
}

.ol-popup:after,
.ol-popup:before {
  top: 100%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}

.ol-popup:after {
  border-top-color: var(--popup-background) !important;
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}

.ol-popup:before {
  border-top-color: var(--popup-background) !important;
  border-width: 11px;
  left: 48px;
  margin-left: -11px;
}

.ol-popup-closer {
  text-decoration: none;
  position: absolute;
  top: 5px;
  right: 15px;
}

.ol-popup-closer:Hover {
  opacity: 0.5;
}

.ol-popup-closer:after {
  content: "✖";
}

.zoom-warning {
  position: absolute;
  left: 50%;
  text-align: center;
  font-weight: 500;
  transform: translateX(-50%);
  bottom: 70px;
  padding: 8px 15px 8px 15px;
  z-index: 100;
  width: auto;
  height: auto;
  cursor: pointer;
  border-radius: 8px !important;
  background-color: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(5px);
  color: black;
  visibility: hidden;
}
</style>