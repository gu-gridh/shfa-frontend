<template>
 <div id="map">
</div>


</template>

<script>
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import {toLonLat} from 'ol/proj';
import { debounce } from 'lodash';
import WebGLPointsLayer from 'ol/layer/WebGLPoints';

export default {
  name: 'MapComponent',
  props: {
    coordinates: {
      type: Array,
      default: () => [],
    },
    bbox: {
      type: Array,
      default: () => [],
    },
  },
  data()
  {
    return {
    map: null,
    vectorLayer: null,
    clickedRaaId: null,
    results: [], 
    cachedResults: [],
    }
  },
mounted() {
  try {
    this.initMap(); // Initialize the map on component mount
    this.$nextTick(() => {
    this.updateCoordinates(); // Update the map markers on component mount
      this.fetchAdditionalData(); // Fetch additional data from the provided API endpoint
    });
  } catch (error) {
    console.error('Error in mounted hook:', error);
  }
},
beforeDestroy() {
  if (this.map) {
    this.map.un('moveend', this.updateBbox);
  }
},
created() {
  this.debouncedFetchDataByBbox = debounce(this.fetchDataByBbox, 1000);
},
watch: {
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
        this.results = this.cachedResults.filter(result => {
          const [x, y] = result.coordinates;
          return x >= newBbox[0] && x <= newBbox[2] && y >= newBbox[1] && y <= newBbox[3];
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
focusOnCoordinates(lon, lat) {
  if (this.map) {
    const coordinates = fromLonLat([lon, lat]);
    this.map.getView().setCenter(coordinates);
    this.map.getView().setZoom(12); 
  }
},
async fetchAdditionalData(url, pagesToFetch = 10) {
  if (!url) {
    url = 'https://diana.dh.gu.se/api/shfa/geojson/site/';
  }
  
  const delay = async (duration) => new Promise((resolve) => setTimeout(resolve, duration));

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
        }));

        // Filter the additionalResults to only include points outside the current bounding box
        const filteredAdditionalResults = additionalResults.filter(result => {
          const [x, y] = result.coordinates;
          return x < this.bbox[0] || x > this.bbox[2] || y < this.bbox[1] || y > this.bbox[3];
        });

        // Merge the filteredAdditionalResults with the cachedResults
        this.cachedResults.push(...filteredAdditionalResults);

        // Increment the pagesFetched counter
        pagesFetched++;

        // If there's a next page, fetch it
        if (data.next) {
          const fixedNextUrl = data.next.replace('http://', 'https://');
          if (pagesFetched % pagesToFetch === 0) { // If pages fetched is a multiple of pagesToFetch, add a delay
            await delay(3000); // Pause for 3 seconds
          }
          await fetchData(fixedNextUrl);
        }
      } else {
        console.error('Unexpected API response:', data);
      }
    } catch (error) {
      console.error('Error fetching additional data:', error);
    }
  };

  await fetchData(url);
},

  updateBbox() { // Get the bounding box coordinates of the current view and emit them to the parent component
      const extent = this.map.getView().calculateExtent(this.map.getSize());
      const bottomLeft = toLonLat([extent[0], extent[1]]);
      const topRight = toLonLat([extent[2], extent[3]]);
      const newBbox = [bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]];
      this.$emit('update-bbox', newBbox);
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

          if (data.next) { //if there is a "next" URL, recursively fetch the next set of data
            let fixedNextUrl = data.next.replace('http://', 'https://');
            fixedNextUrl = decodeURIComponent(fixedNextUrl);
            await fetchResults(fixedNextUrl);
          }

        } else {
          console.error('Unexpected API response:', data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    await fetchResults(url);

    // Save the fetched data in the cachedResults array
    this.cachedResults.push(...allFeatures.map((feature) => ({
      coordinates: feature.geometry.coordinates,
      id: feature.id ?? null,
      lamning_id: feature.properties.lamning_id ?? null,
      raa_id: feature.properties.raa_id ?? null,
    })));


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
    this.results = this.cachedResults.filter(result => {
      const [x, y] = result.coordinates;
        return x >= this.bbox[0] && x <= this.bbox[2] && y >= this.bbox[1] && y <= this.bbox[3];
    });
  }
},

initMap() {
  this.map = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        className: 'grey',
        source: new OSM()
      })
    ],
    view: new View({
      center: fromLonLat([11.35, 58.73]), // Default center of the map
      zoom: 13 // Default zoom level of the map
    })
  });

  // Initialize the WebGL map marker style
  const webGLStyle = {
    symbol: {
      symbolType: 'image',
      color: [252, 246, 116,0.8],
      size: [16.56, 24.17],
      offset: [0, 0], 
      src: '/interface/assets/marker-white.svg'
    },
  };


  const pointSource = new VectorSource();
  this.vectorLayer = new WebGLPointsLayer({
    source: pointSource,
    style: webGLStyle,
  });

  this.map.addLayer(this.vectorLayer);


  // Add 'click' event listener
this.map.on('click', (event) => {
    // Use the hit detection mechanism
    this.map.forEachFeatureAtPixel(event.pixel, (feature) => {
        // Get the properties of the feature (in this case, we're extracting 'lamning_id', 'raa_id', and 'id')
        const lamning_id = feature.get('lamning_id');
        const raa_id = feature.get('raa_id');
        const id = feature.get('id');

        this.clickedId = id;
        this.clickedLamningId = lamning_id;
        this.clickedRaaId = raa_id;


        this.$emit('map-clicked');
        this.$emit('id-selected', id);
        this.$emit('lamning-selected', lamning_id);
        this.$emit('raa-selected', raa_id);
    }, {
        layerFilter: (layer) => layer === this.vectorLayer, // Ensure we're only checking features in our WebGLPointsLayer
        hitTolerance: 10 // Increase or decrease this value for a larger or smaller hit detection area
    });
});

  // Add 'moveend' event listener to the map to update the bounding box
  this.map.on('moveend', debounce(() => {
    this.updateBbox();
  }, 1000)); // Adjust the delay in milliseconds as needed
},


updateCoordinates() {
    const newFeatures = this.cachedResults.map(result => {
        const coord = result.coordinates;
        const feature = new Feature({
            geometry: new Point(fromLonLat([coord[0], coord[1]]))
        });
        feature.set('lamning_id', result.lamning_id);
        feature.set('raa_id', result.raa_id);
        feature.set('id', result.id);
        return feature;
    });

    const pointSource = this.vectorLayer.getSource();
    pointSource.clear();
    pointSource.addFeatures(newFeatures);
},

/* createClusterStyle(feature) {
  const size = feature.get('features').length;

  if (size === 1) {
    return this.iconStyle; // Return the individual pin style when cluster size is 1
  } else {
    const baseRadius = 20; // Increase the base radius for larger visual representation
    const scalingFactor = 0.2; // Adjust this value to control how much the radius grows with the cluster size
    const style = new Style({
      image: new CircleStyle({
        radius: baseRadius + Math.min(size, 100) * scalingFactor,
        fill: new Fill({ color: 'rgba(120,135,150, 0.8)' }),
        stroke: new Stroke({
          color: '#fff',
          width: 2,
        }),
      }),
      text: new Text({
        text: size.toString(),
        fill: new Fill({ color: '#fff' }),
        scale: 1.5, // Adjust the scale to make the text larger and more readable on mobile
      }),
    });

    return style;
  }
} */


  },
}
</script>

<style>
#map {
  z-index: 40; /* Fixes border-radius in Safari. */
  width: 100%;
  height: 100%;
  margin-top:45px!important;
  padding:0px 0px 0px 0px;
  border-radius:10px;
  overflow:hidden!important;
  box-shadow: 0px 5px 45px rgba(0, 0, 0, 0.5)!important;
  cursor: pointer;
 /* filter:contrast(130%) grayscale(80%) brightness(0.9); */
}

#app .ol-control{
position:absolute;
right:20px;
box-shadow: 0rem 0.5rem 1rem rgba(0, 0, 0, 0.0) !important;
}


#app .ol-control button {
  font-family: "Barlow Condensed", sans-serif;
  border-radius: 50% !important;
  background-color: rgb(40, 40, 40) !important;
  color: white !important;
}

#app .ol-control button:active,
#app .ol-control button:hover,
#app .ol-control button:focus {
  background: rgb(255, 230, 0) !important;
  border-width: 0px !important;
}

.ol-scaleline-control {
  right: 20px !important;
  display:none!important;
}

.ol-full-screen {
  display:none!important;
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
  display:none!important;
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
  filter: grayscale(100%) contrast(110%)
}


.ol-zoom {
  display:none;
  font-size: 30px !important;
  color: white !important;
  width: 40px;
  height: 40px;
  padding: 0px !important;
  box-shadow: 0rem 0.5rem 1rem rgba(0, 0, 0, 0.2) !important;
  opacity: 0.9 !important;
  right: 20px !important;
  position: absolute !important;
}

.ol-zoom-in {
  right: 20px !important;
  top: 20px !important;
  position: fixed;
}
.ol-zoom-in:hover {
  background-color: rgba(0, 0, 0, 0.7);
}
.ol-zoom-out {
  right: 20px;
  top: 68px;
  position: fixed;
  margin-top: 3px;
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
  background: #ff0000;
  box-shadow: 0 5px 10px rgb(2 2 2 / 20%);
  padding: 10px 20px;
  font-size: 16px;
}

.ol-popup {
  text-align: center;
  position: absolute;
  color: white;
  background-color: rgb(40, 40, 40) !important;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 10px;
  bottom: 12px;
  left: -50px;
  min-width: 150px;
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
  border-top-color: rgb(40, 40, 40) !important;
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}

.ol-popup:before {
  border-top-color: rgb(40, 40, 40) !important;
  border-width: 11px;
  left: 48px;
  margin-left: -11px;
}

.ol-popup-closer {
  text-decoration: none;
  position: absolute;
  top: 2px;
  right: 8px;
}

.ol-popup-closer:after {
  content: "✖";
}

</style>
