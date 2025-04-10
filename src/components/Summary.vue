<template>
    <div>
      <div v-if="isLoading">Loading summary...</div>
      <div v-else>
        <h3>Summary Data</h3>
  
        <!-- creators -->
        <div
          v-if="summary.creators && summary.creators.length"
          class="summary-section"
        >
          <h4>Creators</h4>
          <ul>
            <li
              v-for="creator in summary.creators"
              :key="creator.creator"
            >
              {{ creator.creator }} ({{ creator.count }})
            </li>
          </ul>
        </div>
  
        <!-- institutions -->
        <div
          v-if="summary.institutions && summary.institutions.length"
          class="summary-section"
        >
          <h4>Institutions</h4>
          <ul>
            <li
              v-for="inst in summary.institutions"
              :key="inst.institution"
            >
              {{ inst.institution }} ({{ inst.count }})
            </li>
          </ul>
        </div>
  
        <!-- types -->
        <div
          v-if="summary.types && summary.types.length"
          class="summary-section"
        >
          <h4>Types</h4>
          <ul>
            <li
              v-for="type in summary.types"
              :key="type.type"
            >
              {{ type.type }} ({{ type.count }})
            </li>
          </ul>
        </div>
  
        <!-- motifs -->
        <div
          v-if="summary.motifs && summary.motifs.length"
          class="summary-section"
        >
          <h4>Motifs</h4>
          <ul>
            <li
              v-for="motif in summary.motifs"
              :key="motif.motif"
            >
              {{ motif.motif }} ({{ motif.count }})
            </li>
          </ul>
        </div>
  
        <!-- geographic -->
        <div
          v-if="summary.geographic && summary.geographic.length"
          class="summary-section"
        >
          <h4>Geographic</h4>
          <ul>
            <li
              v-for="geo in summary.geographic"
              :key="geo.municipality + geo.parish + geo.province + geo.country"
            >
              Municipality: {{ geo.municipality }} / 
              Parish: {{ geo.parish }} / 
              Province: {{ geo.province }} /
              Country: {{ geo.country }}
              ({{ geo.count }})
            </li>
          </ul>
        </div>
  
        <!-- site -->
        <div
          v-if="summary.site && summary.site.length"
          class="summary-section"
        >
          <h4>Site</h4>
          <ul>
            <li
              v-for="s in summary.site"
              :key="s.site"
            >
              {{ s.site }} ({{ s.count }})
            </li>
          </ul>
        </div>
  
      </div>
    </div>
  </template>
  
  <script>
  import { defineComponent, ref, reactive, computed, watch } from "vue";
  
  export default defineComponent({
    name: "Summary",
    props: {
      searchItems: {
        type: [Array, String, Object],
        default: () => [],
      },
      advancedSearchResults: {
        type: [Array, Object],
        default: () => [],
      },
      bboxSearch: {
        type: [Array, Object],
        default: () => [],
      },
      selectedSiteId: {
        type: [Number, String],
        default: null,
      },
      activeTab: {
        type: String,
        default: "gallery",
      },
    },
    setup(props) {
      const summary = ref({
        creators: [],
        institutions: [],
        year: [],
        types: [],
        motifs: [],
        geographic: [],
        site: [],
      });
      const isLoading = ref(false);
  
      const filterTimestamps = reactive({
        search: 0,
        advanced: 0,
        bbox: 0,
        site: 0,
      });
  
      const activeFilter = computed(() => {
        let max = 0;
        let filter = null;
        for (const key in filterTimestamps) {
          if (filterTimestamps[key] > max) {
            max = filterTimestamps[key];
            filter = key;
          }
        }
        return filter;
      });
  
      function buildSummaryUrl() {
        let url = "https://diana.dh.gu.se/api/shfa/summary/";
        const params = new URLSearchParams();
  
        const filter = activeFilter.value;
        if (filter === "site" && props.selectedSiteId) {
          params.append("site", props.selectedSiteId);
        } else if (
          filter === "search" &&
          props.searchItems &&
          props.searchItems.toString().trim() !== ""
        ) {
          params.append("search_type", "general");
          params.append("q", props.searchItems);
        } else if (
          filter === "bbox" &&
          props.bboxSearch &&
          Array.isArray(props.bboxSearch) &&
          props.bboxSearch.length === 4
        ) {
          params.append("in_bbox", props.bboxSearch.join(","));
          params.append("depth", "2");
        } else if (
          filter === "advanced" &&
          props.advancedSearchResults &&
          typeof props.advancedSearchResults === "object"
        ) {
          params.append("search_type", "advanced");
          Object.keys(props.advancedSearchResults).forEach((key) => {
            const value = props.advancedSearchResults[key];
            if (value && value.toString().trim() !== "") {
              params.append(key, value);
            }
          });
        }
  
        const queryString = params.toString();
        if (queryString) {
          url += "?" + queryString;
        }
        return url;
      }
  
      async function fetchSummary() {
        isLoading.value = true;
        const url = buildSummaryUrl();
  
        console.log("[Summary] fetchSummary() ->", url);
        try {
          const response = await fetch(url);
          const data = await response.json();
          console.log("[Summary] API response:", data);
  
          summary.value = data;
        } catch (err) {
          console.error("[Summary] Error fetching summary:", err);
        } finally {
          isLoading.value = false;
        }
      }
  
      watch(
        () => props.searchItems,
        (newVal) => {
          if (newVal !== null) {
            filterTimestamps.search = Date.now();
            if (props.activeTab === "summary") {
              fetchSummary();
            }
          }
        }
      );
      watch(
        () => props.advancedSearchResults,
        (newVal) => {
          if (newVal !== null) {
            filterTimestamps.advanced = Date.now();
            if (props.activeTab === "summary") {
              fetchSummary();
            }
          }
        }
      );
      watch(
        () => props.bboxSearch,
        (newVal) => {
          if (newVal !== null) {
            filterTimestamps.bbox = Date.now();
            if (props.activeTab === "summary") {
              fetchSummary();
            }
          }
        }
      );
      watch(
        () => props.selectedSiteId,
        (newVal) => {
          if (newVal !== null) {
            filterTimestamps.site = Date.now();
            if (props.activeTab === "summary") {
              fetchSummary();
            }
          }
        }
      );
  
      watch(
        () => props.activeTab,
        (newVal, oldVal) => {
          console.log("[Summary] activeTab changed from", oldVal, "to", newVal);
          if (newVal === "summary") {
            fetchSummary();
          }
        }
      );
  
      return {
        summary,
        isLoading,
      };
    },
  });
  </script>
  
  <style scoped>
  .summary-section {
    margin-bottom: 1rem;
  }
  </style>
  