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
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import {toLonLat} from 'ol/proj';
import { Cluster } from 'ol/source';
import { Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style';
import { debounce } from 'lodash';

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
    iconStyle: null,
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
created() {
  this.debouncedFetchDataByBbox = debounce(this.fetchDataByBbox, 100);
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
          console.log('Using cached data');
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
          id: feature.id,
          raa_id: feature.properties.raa_id,
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
      id: feature.id,
      raa_id: feature.properties.raa_id,
    })));

    // Deduplicate the cachedResults array
    const uniqueResults = [];
    const seenRaaIds = new Set();
    for (const result of this.cachedResults) {
      if (!seenRaaIds.has(result.raa_id)) {
        uniqueResults.push(result);
        seenRaaIds.add(result.raa_id);
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
        source: new OSM()
      })
    ],
    view: new View({
      center: fromLonLat([11.35, 58.73]), //Default center of the map
      zoom: 13 // Default zoom level of the map
    })
  });
      // Initialize the map marker style
      this.iconStyle = new Style({
        image: new Icon({
          src: '/interface/assets/marker-gold.svg',
          scale: 1,
          anchor: [0.5, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction'
        })
      });

  // Check if coordinates are defined before creating the features
  const features = this.results.length ? this.results.map(result => {
    const coord = result.coordinates;
    return new Feature({
      geometry: new Point(fromLonLat([coord[0], coord[1]]))
    });
  }) : [];

  // Creates the new layer for the pins
  const vectorSource = new VectorSource({
    features: features
  });

  this.vectorLayer = new VectorLayer({
    source: vectorSource
  });

  this.map.addLayer(this.vectorLayer);

    // Add 'click' event listener
      this.map.on('click', (event) => {
      this.map.forEachFeatureAtPixel(event.pixel, (feature) => {
      const featuresInCluster = feature.get('features');
      if (featuresInCluster.length === 1) {
        const raa_id = featuresInCluster[0].get('raa_id');
        const id = featuresInCluster[0].get('id');
        console.log('Clicked id:', id, 'Clicked raa_id:', raa_id);
        this.clickedId = id;
        this.clickedRaaId = raa_id;
        this.$emit('id-selected', id);
        this.$emit('raaId-selected', raa_id);
      } else {
        const coordinates = feature.getGeometry().getCoordinates();
        this.map.getView().setCenter(coordinates);
        this.map.getView().setZoom(this.map.getView().getZoom() + 1);
      }
    });
  });

  // Add 'moveend' event listener to the map to update the bounding box
  this.map.on('moveend', debounce(() => {
    this.updateBbox();
  }, 2000)); // Adjust the delay in milliseconds as needed
},

updateCoordinates() {
  const pointSource = new VectorSource({
    features: this.cachedResults.map(result => { 
      const coord = result.coordinates;
      const feature = new Feature({
        geometry: new Point(fromLonLat([coord[0], coord[1]]))
      });
      feature.set('raa_id', result.raa_id); 
      feature.set('id', result.id)
      feature.setStyle(this.iconStyle);
      return feature;
    })
  });

  const clusterSource = new Cluster({
    distance: 100, // Adjust this value to control the clustering distance
    source: pointSource,
  });

  const clusterLayer = new VectorLayer({
    source: clusterSource,
    style: this.createClusterStyle,
  });

  // Remove the previous vectorLayer
  if (this.vectorLayer) {
    this.map.removeLayer(this.vectorLayer);
  }

  // Set the new vectorLayer to the clusterLayer and add it to the map
  this.vectorLayer = clusterLayer;
  this.map.addLayer(this.vectorLayer);
},

createClusterStyle(feature) {
  const size = feature.get('features').length;
  if (size === 1) {
    return this.iconStyle; // Return the individual pin style when cluster size is 1
  } else {
    const style = new Style({
      image: new CircleStyle({
        radius: 10 + Math.min(size, 50) * 0.1,
        fill: new Fill({ color: '#3399CC' }),
        stroke: new Stroke({
          color: '#fff',
          width: 2,
        }),
      }),
      text: new Text({
        text: size.toString(),
        fill: new Fill({ color: '#fff' }),
      }),
    });

    return style;
  }
},

  },
}
</script>

<style scoped>
#map {
  z-index: 40; /* Fixes border-radius in Safari. */
  width: 100%;
  height: 100%;
  padding:0px 0px 0px 0px;
  border-radius:10px;
  overflow:hidden!important;
  box-shadow: 0px 5px 45px rgba(0, 0, 0, 0.5)!important;
  filter:contrast(130%) grayscale(80%) brightness(0.9);
}


</style>
