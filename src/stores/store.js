import { defineStore } from 'pinia'

export const useStore = defineStore('store', {
  state: () => ({
    currentBbox: null,
    selectedKeyword: null,
  }),

  actions: {
    setBbox(bbox) {
      if (Array.isArray(bbox) && bbox.length === 4) this.currentBbox = bbox
    },
    setSelectedKeyword(keyword) {
      if (keyword && keyword.value && keyword.source) {
        this.selectedKeyword = keyword
      }
    }
  }
})
