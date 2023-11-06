import { defineStore } from 'pinia';

export const useStore = defineStore('store', {
  state: () => ({
    boundingBox: null,
    coordinates: null,
  }),
  actions: {
    setBoundingBox(newBoundingBox) {
      this.boundingBox = newBoundingBox;
    },
    setCoordinates(newCoordinates) {
      this.coordinates = newCoordinates;
    },
  },
});
