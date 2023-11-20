<template>
  <div id="map">
    <button id="new-button" @click="fetchImagesClicked()"></button>
 
    <div id="popup" class="ol-popup">
      <a href="#" id="popup-closer" class="ol-popup-closer"></a>
      <div id="popup-content">
        <p id="lamning_id"></p>
        <p id="raa_id"></p>
        <p>
          <a id="fornsok_link" target="_blank">{{
            $t("message.checkfornsök")
          }}</a>
        </p>
        <p>
          <a id="extmap_link" target="_blank">{{ $t("message.maplink") }}</a>
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
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { toLonLat } from "ol/proj";
import { debounce } from "lodash";
import WebGLPointsLayer from "ol/layer/WebGLPoints";
import Overlay from "ol/Overlay";
import Zoom from "ol/control/Zoom";
import { watch } from "vue";
import { useStore } from "../stores/store.js";
import { transformExtent } from "ol/proj";
 
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
      results: [],
      cachedResults: [],
      coordinateStore: useStore(), // Initialize the store here
    };
  },
  mounted() {
    try {
      this.initMap(); // Initialize the map on component mount
      this.$nextTick(() => {
        this.updateCoordinates(); // Update the map markers on component mount
        this.fetchAdditionalData(); // Fetch additional data from the provided API endpoint
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
  created() {
    this.debouncedFetchDataByBbox = debounce(this.fetchDataByBbox, 1000);
 
    // Watch the 'boundingBox' field in the store for changes
    watch(
      () => this.coordinateStore.boundingBox,
      (newBoundingBox, oldBoundingBox) => {
        if (newBoundingBox) {
          this.focusOnBoundingBox(newBoundingBox);
        }
      }
    );
    watch(
      () => this.coordinateStore.coordinates,
      (newCoordinates, oldCoordinates) => {
        if (newCoordinates && newCoordinates.length === 2) {
          const [lon, lat] = newCoordinates;
          this.focusOnCoordinates(lon, lat);
        }
      }
    );
  },
  watch: {
    showMap: {
      immediate: true,
      handler(newVisibility) {
        if (newVisibility && this.coordinateStore.boundingBox) {
          this.$nextTick(() => {
            if (this.map) {
              // Update the map size
              this.map.updateSize();
            }
            this.focusOnBoundingBox(this.coordinateStore.boundingBox);
          });
        }
      },
    },
    bbox: {
      deep: true,
      handler(newBbox, oldBbox) {
        if (
          oldBbox.length !== 4 ||
          newBbox[0] < oldBbox[0] ||
          newBbox[1] < oldBbox[1] ||
          newBbox[2] > oldBbox[2] ||
          newBbox[3] > oldBbox[3]
        ) {
          this.debouncedFetchDataByBbox(); // Fetch data by bounding box
        } else {
          // Update the results array with the data within the current bounding box
          this.results = this.cachedResults.filter((result) => {
            const [x, y] = result.coordinates;
            return (
              x >= newBbox[0] &&
              x <= newBbox[2] &&
              y >= newBbox[1] &&
              y <= newBbox[3]
            );
          });
        }
      },
    },
    results: {
      deep: true,
      handler() {
        this.updateCoordinates(); // Update the map markers when results change
      },
    },
  },
  methods: {
    fetchImagesClicked() {
      this.coordinateStore.setImagesFetchTriggered(true); // Set the trigger flag in the store
    },
 
    focusOnBoundingBox(boundingBox) {
      if (this.map && boundingBox) {
        // Extract the bounding box coordinates in the format [minLon, minLat, maxLon, maxLat]
        const extent = [
          boundingBox.bottomLeft[0],
          boundingBox.bottomLeft[1],
          boundingBox.topRight[0],
          boundingBox.topRight[1],
        ];
 
        // Transform the extent to the map's projection
        const transformedExtent = transformExtent(
          extent,
          "EPSG:4326",
          "EPSG:3857"
        );
 
        // Fit the map view to the extent
        this.map.getView().fit(transformedExtent, {
          size: this.map.getSize(),
          padding: [5, 5, 5, 5], // optional padding in pixels
          constrainResolution: false, // allow intermediate zoom levels
          duration: 1000, //slow zoom for better user experience
          minResolution: 5.0, //limit resolution so landmarks in basemap are still visible
        });
 
        // Trigger a manual map render
        this.map.renderSync();
      } else {
        console.warn("Invalid bounding box or map object.");
      }
    },
    focusOnCoordinates(lon, lat) {
      if (this.map) {
        const coordinates = fromLonLat([lon, lat]);
        this.map
          .getView()
          .animate({ center: coordinates, zoom: 18, duration: 1050 });
        // this.map.getView().setCenter(coordinates);
        // this.map.getView().setZoom(17)
      }
    },
    async fetchAdditionalData(url, pagesToFetch = 10) {
      if (!url) {
        url = "https://diana.dh.gu.se/api/shfa/geojson/site/?page_size=1000";
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
              coordinates: feature.geometry.coordinates,
              id: feature.id ?? null,
              lamning_id: feature.properties.lamning_id ?? null,
              raa_id: feature.properties.raa_id ?? null,
              ksamsok_id: feature.properties.ksamsok_id ?? null,
            }));
 
            // Filter the additionalResults to only include points outside the current bounding box
            const filteredAdditionalResults = additionalResults.filter(
              (result) => {
                const [x, y] = result.coordinates;
                return (
                  x < this.bbox[0] ||
                  x > this.bbox[2] ||
                  y < this.bbox[1] ||
                  y > this.bbox[3]
                );
              }
            );
 
            // Merge the filteredAdditionalResults with the cachedResults
            this.cachedResults.push(...filteredAdditionalResults);
 
            // Increment the pagesFetched counter
            pagesFetched++;
 
            // If there's a next page, fetch it
            if (data.next) {
              const fixedNextUrl = data.next.replace("http://", "https://");
              if (pagesFetched % pagesToFetch === 0) {
                // If pages fetched is a multiple of pagesToFetch, add a delay
                await delay(3000); // Pause for 3 seconds
              }
              await fetchData(fixedNextUrl);
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
 
    updateBbox() {
      // Get the bounding box coordinates of the current view and emit them to the parent component
      const extent = this.map.getView().calculateExtent(this.map.getSize());
      const bottomLeft = toLonLat([extent[0], extent[1]]);
      const topRight = toLonLat([extent[2], extent[3]]);
      const newBbox = [bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]];
      this.$emit("update-bbox", newBbox);
      this.coordinateStore.setBboxFetch(newBbox);
    },
 
    async fetchDataByBbox() {
      if (this.bbox.length === 4) {
        // Calculate the larger bounding box
        const padding = 0.2; // Adjust this value to control the amount of padding around the current bounding box
        const [minX, minY, maxX, maxY] = this.bbox;
        const paddedBbox = [
          minX - (maxX - minX) * padding,
          minY - (maxY - minY) * padding,
          maxX + (maxX - minX) * padding,
          maxY + (maxY - minY) * padding,
        ];
 
        // Construct the API URL with the padded bounding box coordinates
        const url = `https://diana.dh.gu.se/api/shfa/geojson/site/?in_bbox=${paddedBbox[0]},${paddedBbox[1]},${paddedBbox[2]},${paddedBbox[3]}&limit=100`;
 
        let allFeatures = [];
 
        const fetchResults = async (url) => {
          try {
            const response = await fetch(url);
            const data = await response.json();
 
            if (data && data.features) {
              allFeatures.push(...data.features);
 
              if (data.next) {
                //if there is a "next" URL, recursively fetch the next set of data
                let fixedNextUrl = data.next.replace("http://", "https://");
                fixedNextUrl = decodeURIComponent(fixedNextUrl);
                await fetchResults(fixedNextUrl);
              }
            } else {
              console.error("Unexpected API response:", data);
            }
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        };
 
        await fetchResults(url);
 
        // Save the fetched data in the cachedResults array
        this.cachedResults.push(
          ...allFeatures.map((feature) => ({
            coordinates: feature.geometry.coordinates,
            id: feature.id ?? null,
            lamning_id: feature.properties.lamning_id ?? null,
            raa_id: feature.properties.raa_id ?? null,
            ksamsok_id: feature.properties.ksamsok_id ?? null,
          }))
        );
 
        // Deduplicate the cachedResults array
        const uniqueResults = [];
        const seenIds = new Set();
        for (const result of this.cachedResults) {
          const combinedId = `${result.lamning_id}-${result.raa_id}`; // Combine both IDs
          if (!seenIds.has(combinedId)) {
            uniqueResults.push(result);
            seenIds.add(combinedId);
          }
        }
        this.cachedResults = uniqueResults;
 
        // Update the results array with the data within the current bounding box
        this.results = this.cachedResults.filter((result) => {
          const [x, y] = result.coordinates;
          return (
            x >= this.bbox[0] &&
            x <= this.bbox[2] &&
            y >= this.bbox[1] &&
            y <= this.bbox[3]
          );
        });
      }
    },
 
    initMap() {
      //Based on the OpenLayers example
      const container = document.getElementById("popup");
      // const content = document.getElementById('popup-content');
      const raaContent = document.getElementById("raa_id");
      const lamningContent = document.getElementById("lamning_id");
      const closebutton = document.getElementById("popup-closer");
 
      //Overlay that anchors the popups
      const overlay = new Overlay({
        element: container,
        positioning: "center-center",
        autoPan: {
          animation: {
            duration: 200,
          },
        },
      });
 
      //Button to make popup invisible
      closebutton.onclick = function () {
        container.style.visibility = "collapse";
        closebutton.blur();
        return false;
      };
 
      this.map = new Map({
        target: "map",
        layers: [
          new TileLayer({
            className: "grey",
            source: new OSM(),
          }),
        ],
        view: new View({
          center: fromLonLat([11.35, 58.73]), // Default center of the map
          zoom: 13, // Default zoom level of the map
        }),
        overlays: [overlay],
      });
      this.map.addControl(new Zoom());
 
      // Initialize the WebGL map marker style
      const webGLStyle = {
        symbol: {
          symbolType: "image",
          color: "#f0c02e",
          size: [20, 30],
          offset: [0, 10],
          src: "/interface/assets/marker-white.svg",
        },
      };
 
      const pointSource = new VectorSource();
      this.vectorLayer = new WebGLPointsLayer({
        source: pointSource,
        style: webGLStyle,
        className: "markers",
      });
 
      this.map.addLayer(this.vectorLayer);
 
      this.map.on("pointermove", (event) => {
        if (event.dragging) {
          return;
        }
        this.map.forEachFeatureAtPixel(event.pixel, (feature) => {
          // Get the properties of the feature (in this case, we're extracting 'lamning_id', 'raa_id', and 'id')
          const lamning_id = feature.get("lamning_id");
          const raa_id = feature.get("raa_id");
          const id = feature.get("id");
          const ksamsok_id = feature.get("ksamsok_id");
          const coords = feature.get("coords");
 
          const extent = feature.getGeometry().getExtent();
 
          raaContent.innerHTML = raa_id;
          lamningContent.innerHTML = lamning_id;
          document.getElementById(
            "fornsok_link"
          ).href = `https://kulturarvsdata.se/raa/lamning/${ksamsok_id}`;
          document.getElementById(
            "extmap_link"
          ).href = `https://www.google.com/maps/place/${coords}`;
          // content.innerHTML = `<p>${lamning_id}</p><p v-if="${raa_id}">${raa_id}</p><p><a id='links' href="https://kulturarvsdata.se/raa/lamning/${ksamsok_id}" target="_blank">${fornsok_text}</a></p><p><a id='links' href="https://www.google.com/maps/place/${coords}" target="_blank">${maplink_text}</a></p>`;          
          container.style.visibility = "visible";
          overlay.setPosition(extent);
        });
      });
 
      // Add 'click' event listener
      this.map.on("click", (event) => {
        // Use the hit detection mechanism
        this.map.forEachFeatureAtPixel(
          event.pixel,
          (feature) => {
            // Get the properties of the feature (in this case, we're extracting 'lamning_id', 'raa_id', and 'id')
            const lamning_id = feature.get("lamning_id");
            const raa_id = feature.get("raa_id");
            const id = feature.get("id");
            const ksamsok_id = feature.get("ksamsok_id");
            const coords = feature.get("coords");
 
            this.clickedId = id;
            this.clickedLamningId = lamning_id;
            this.clickedRaaId = raa_id;
 
            this.$emit("map-clicked");
            this.$emit("id-selected", id);
            this.$emit("lamning-selected", lamning_id);
            this.$emit("raa-selected", raa_id);
 
            //Zoom to the clicked point and make sure basemap is still visible
            const extent = feature.getGeometry().getExtent();
            const view = this.map.getView();
            view.fit(extent, {
              duration: 1000,
              padding: [1, 1, 1, 1],
              minResolution: 5.0,
            });
 
            raaContent.innerHTML = raa_id;
            lamningContent.innerHTML = lamning_id;
            document.getElementById(
              "fornsok_link"
            ).href = `https://kulturarvsdata.se/raa/lamning/${ksamsok_id}`;
            document.getElementById(
              "extmap_link"
            ).href = `https://www.google.com/maps/place/${coords}`;
            container.style.visibility = "visible";
            // content.innerHTML = `<p>${lamning_id}</p><p v-if="${raa_id}">${raa_id}</p><p><a id='links' href="https://kulturarvsdata.se/raa/lamning/${ksamsok_id}" target="_blank">${fornsok_text}</a></p><p><a id='links' href="https://www.google.com/maps/place/${coords}" target="_blank">${maplink_text}</a></p>`;            
            overlay.setPosition(extent);
          },
          {
            layerFilter: (layer) => layer === this.vectorLayer, // Ensure we're only checking features in our WebGLPointsLayer
            hitTolerance: 10, // Increase or decrease this value for a larger or smaller hit detection area
          }
        );
      });
 
      // Add 'moveend' event listener to the map to update the bounding box
      this.map.on(
        "moveend",
        debounce(() => {
          this.updateBbox();
        }, 1000)
      ); // Adjust the delay in milliseconds as needed
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
#new-button {
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 100;
  background: url(/public/interface/searchbuttonwhite.png) no-repeat 50% 50%;
  background-size: contain;
  width: 40px;
  height: 40px;
  border: none;
  cursor: pointer;
  border-radius: 50% !important;
  background-color: rgba(65, 65, 65, 0.9);
  background-size: 30px 30px;
}
 
#map {
  z-index: 40; /* Fixes border-radius in Safari. */
  width: 100%;
  height: 100%;
  min-height: 200px;
  margin-top: 45px !important;
  padding: 0px 0px 0px 0px;
  border-radius: 10px;
  overflow: hidden !important;
  box-shadow: 0px 5px 45px rgba(0, 0, 0, 0.5) !important;
  cursor: pointer;
  position: relative;
  /* filter:contrast(130%) grayscale(80%) brightness(0.9); */
}
 
@media (max-width: 480px) {
  #map {
    margin-top: 35px !important;
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
  background-color: rgba(65, 65, 65, 0.9);
  color: white !important;
}
 
#app .ol-control button:active,
#app .ol-control button:hover,
#app .ol-control button:focus {
  opacity: 0.5;
}
 
.ol-scaleline-control {
  right: 20px !important;
  display: none !important;
}
 
.ol-full-screen {
  display: none !important;
  right: 25px !important;
  top: 20px !important;
  position: fixed !important;
  font-size: 30px !important;
  color: black;
  border-radius: 50% !important;
  width: 40px !important;
  height: 40px !important;
  padding: 0px !important;
  box-shadow: 0rem 0.5rem 1rem rgba(0, 0, 0, 0.2) !important;
  opacity: 0.9 !important;
}
 
.ol-compass {
  display: none !important;
}
 
.ol-attribution {
  display: flex;
  bottom: 2%;
  font-size: x-small;
  font-weight: bold;
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
 
#map .markers {
  filter: contrast(100%);
}
 
.ol-zoom {
  /* display:none; */
  font-size: 30px !important;
  color: white !important;
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
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.95;
  border-width: 1px;
  border: 1px solid black;
  width: 33px;
  height: 33px;
  position: absolute;
  font-size: 0;
}
 
.ol-zoom-in {
  background: url(../assets/openseadragon/plus.svg) no-repeat center center;
  background-size: contain;
  top: 20px;
}
 
.ol-zoom-out {
  background: url(../assets/openseadragon/minus.svg) no-repeat center center;
  background-size: contain;
  top: 60px;
}
 
@media (max-width: 350px) {
  .ol-zoom {
    bottom: 18%;
  }
}
 
.ol-zoom-in:hover {
  background-color: rgba(0, 0, 0, 0.7);
}
 
.ol-zoom-out:hover {
  background-color: rgba(0, 0, 0, 0.7);
}
 
.ol-control {
  position: fixed;
}
#app .ol-zoomslider {
  top: 1rem !important;
  border-radius: 5px !important;
  background: rgba(255, 255, 255, 0.4) !important;
  border: 0px solid rgba(0, 60, 136, 0) !important;
  right: 60px !important;
  height: 200px !important;
  width: 25px !important;
  position: fixed !important;
}
 
.ol-zoomslider-thumb {
  width: 60px !important;
}
 
.overlay-content {
  box-shadow: 0 5px 10px rgb(2 2 2 / 20%);
  padding: 10px 20px;
  font-size: 16px;
}
 
.ol-popup {
  text-align: justify;
  position: absolute;
  color: white;
  line-height: 1.2;
  background-color: rgba(80, 80, 80, 1);
  opacity: 100%;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  padding: 8px 18px 8px 38px;
  border-radius: 8px;
  bottom: 38px;
  left: -48px;
  min-width: max-content;
  block-size: fit-content;
  font-family: "Barlow Condensed", sans-serif !important;
  max-width: max-content;
  min-height: max-content;
  cursor: pointer;
}
 
#fornsok_link,
#extmap_link {
  color: rgb(250, 250, 250);
  background-position: left;
  background-size: 14px;
  background-image: url(../../public/interface/linkbuttonwhite.png);
  background-repeat: no-repeat;
  padding: 8px 0px 8px 18px;
  min-width: max-content;
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
  border-top-color: rgb(80, 80, 80) !important;
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}
 
.ol-popup:before {
  border-top-color: rgb(80, 80, 80) !important;
  border-width: 11px;
  left: 48px;
  margin-left: -11px;
}
 
.light .ol-popup:after {
  border-top-color: rgb(255, 255, 255) !important;
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}
 
.light .ol-popup:before {
  border-top-color: rgb(200, 200, 200) !important;
  border-width: 11px;
  left: 48px;
  margin-left: -11px;
}
 
.ol-popup-closer {
  text-decoration: none;
  position: absolute;
  top: 10%;
  left: 12px;
}
 
.ol-popup-closer:after {
  content: "✖";
  /* color:white */
}
</style>
