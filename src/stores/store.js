import { defineStore } from 'pinia';
 
export const useStore = defineStore('store', {
  state: () => ({
    boundingBox: null,
    bboxFetch: null,
    coordinates: null,
    isLoading: false,
    imagesFetchTriggered: false,
  }),
  actions: {
    setBoundingBox(newBoundingBox) {
      this.boundingBox = newBoundingBox;
    },
    setCoordinates(newCoordinates) {
      this.coordinates = newCoordinates;
    },
    setLoading(loading) {
      this.isLoading = loading;
    },
    setImagesFetchTriggered(value) {
      this.imagesFetchTriggered = value;
    },
    setBboxFetch(newBoundingBox) {
      this.bboxFetch = newBoundingBox;
    },
  },
});
