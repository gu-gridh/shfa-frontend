import { defineStore } from 'pinia';

export const useStore = defineStore('store', {
  state: () => ({
    boundingBox: null,
  }),
  actions: {
    setBoundingBox(newBoundingBox) {
      this.boundingBox = newBoundingBox;
    },
  },
});
