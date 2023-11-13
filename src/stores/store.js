import { defineStore } from 'pinia';

export const useStore = defineStore('store', {
  state: () => ({
    boundingBox: null,
    coordinates: null,
    isLoading: false,
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
  },
});
