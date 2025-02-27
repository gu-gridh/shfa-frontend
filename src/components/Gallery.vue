<template>
  <div>
    <!-- loading indicator-->
    <div v-if="isGalleryLoading" class="loading-indicator">
      Loading...
    </div>

    <div v-else class="grid-container">
      <div
        v-for="(row, visibleIndex) in visibleRows"
        :key="row.originalIndex"
        class="row-wrapper"
        :id="'row-wrapper-' + row.originalIndex"
      >
        <div v-if="row.open" class="button-container" :class="{ sticky: row.open }">
          <div class="row-titles">
            <ul>
              <li
                v-for="other in getOtherRows(row.originalIndex)"
                :key="other.index"
                @click="onTitleClick(other.index)"
              >
                {{ other.title }}
              </li>
            </ul>
          </div>
        </div>

        <div class="right-column">
          <h3 :id="'row-title-' + row.originalIndex" style="margin-bottom: 1rem;">
            {{ getRowTitle(row) }}
            <span v-if="row.count" style="padding-right: 20px;"> ({{ row.count }})</span>
            <button class="toggle-btn" @click="toggleRow(row.originalIndex)">
              {{ row.open ? "Hide" : "Show more" }}
            </button>
          </h3>

          <div class="short-preview" v-if="!row.open">
            <div
              v-for="item in row.shortItems"
              :key="item.id"
              class="short-item"
            >
              <div
                class="image-wrapper"
                @click="$emit('image-clicked', item.iiif_file, item.id)"
              >
                <img
                  :src="`${item.iiif_file}/full/350,/0/default.jpg`"
                  alt="preview"
                />
                <div class="metadata-overlay">
                  <div class="metadata-content">
                    {{ item.info }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ExpandedRow
            v-if="row.open"
            :row="row"
            :onRequestAppendParent="onRequestAppend"
            :showThreePanels="showThreePanels"
            @image-clicked="(payload) => $emit('image-clicked', payload.file, payload.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch, reactive } from "vue";
import ExpandedRow from "./ExpandedRow.vue";

const props = defineProps({
  searchItems: {
    type: [Array, String, Object],
    default: () => []
  },
  advancedSearchResults: {
    type: [Array, Object],
    default: () => []
  },
  bboxSearch: {
    type: [Array, Object],
    default: () => []
  },
  selectedSiteId: {
    type: [Number, String],
    default: null
  },
  currentLanguage: {
    type: String,
    default: "sv"
  },
  showThreePanels: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["image-clicked", "row-clicked"]);
const rows = ref([]);
const isGalleryLoading = ref(true);

//track the last update for each filter type
const filterTimestamps = reactive({
  search: 0,
  advanced: 0,
  bbox: 0,
  site: 0
});

//compute which filter is the most recent
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

//format the iiif url
const formatIiifUrl = (url) => {
  if (url.startsWith("http")) return url;
  return "https://img.dh.gu.se/diana/static/" + url;
};

//build the gallery api url based on the most recent filter
const buildGalleryUrl = () => {
  let url = "https://diana.dh.gu.se/api/shfa/gallery/";
  const params = new URLSearchParams();

  const filter = activeFilter.value;
  if (filter === "site" && props.selectedSiteId) {
    params.append("site", props.selectedSiteId);
  } else if (filter === "search" && props.searchItems && props.searchItems.toString().trim() !== "") {
    params.append("search_type", "general");
    params.append("q", props.searchItems);
  } else if (filter === "bbox" && props.bboxSearch && Array.isArray(props.bboxSearch) && props.bboxSearch.length === 4) {
    params.append("in_bbox", props.bboxSearch.join(","));
    params.append("depth", "2");
  } else if (filter === "advanced" && props.advancedSearchResults && typeof props.advancedSearchResults === "object") {
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
};

//fetch the initial short items (the collapsed "preview" rows)
const fetchGallery = async () => {
  isGalleryLoading.value = true;
  const url = buildGalleryUrl();
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (Array.isArray(data.results)) {
      rows.value = data.results.map((section, index) => ({
        originalIndex: index,
        shortItems: (section.images || []).map((img) => ({
          id: img.id,
          iiif_file: formatIiifUrl(img.iiif_file),
          info: `ID: ${img.id}${img.year ? ` | Year: ${img.year}` : ""}`
        })),
        open: false,
        infiniteItems: [],
        nextUrl: "https://diana.dh.gu.se/api/shfa/image/?limit=25",
        isFetching: false,
        type: section.type,                     // Swedish
        type_translation: section.type_translation, // English
        count: section.count
      }));
    }
  } catch (err) {
    console.error("Error fetching gallery:", err);
  } finally {
    isGalleryLoading.value = false;
  }
};

//only show open rows if any row is open, otherwise show all
const visibleRows = computed(() => {
  const anyExpanded = rows.value.some((row) => row.open);
  return anyExpanded ? rows.value.filter((row) => row.open) : rows.value;
});

//toggle a row open/closed
const toggleRow = (originalIndex) => {
  //close any other open rows first
  rows.value.forEach((row) => {
    if (row.originalIndex !== originalIndex && row.open) {
      row.open = false;
    }
  });

  const row = rows.value.find((r) => r.originalIndex === originalIndex);
  if (!row) return;

  row.open = !row.open;

  if (row.open) {
    //clear out any old items
    row.infiniteItems = [];

    const baseUrl = buildGalleryUrl();
    const urlObj = new URL(baseUrl);
    urlObj.searchParams.set("category_type", getRowTitle(row));
    row.nextUrl = urlObj.toString();
  }
};

//called from child: fetch more items for the infinite grid
const onRequestAppend = async (e, originalIndex) => {
  const row = rows.value.find((r) => r.originalIndex === originalIndex);
  if (!row || row.isFetching || !row.nextUrl) return;

  row.isFetching = true;
  e.wait();
  try {
    const response = await fetch(row.nextUrl);
    const data = await response.json();
    const newItems = data.results.map((img) => ({
      id: img.id,
      iiif_file: formatIiifUrl(img.iiif_file),
      info: `ID: ${img.id}${img.year ? ` | Year: ${img.year}` : ""}`
    }));

    row.infiniteItems.push(...newItems);
    row.nextUrl = data.next;
  } catch (err) {
    console.error("error fetching additional items:", err);
  } finally {
    row.isFetching = false;
    e.ready();
  }
};

//handle click on a title from other rows when a row is expanded
const onTitleClick = (targetOriginalIndex) => {
  //close the expanded row if open
  const expandedRow = rows.value.find((row) => row.open);
  if (expandedRow) {
    expandedRow.open = false;
  }

  const targetRow = rows.value.find((r) => r.originalIndex === targetOriginalIndex);
  if (targetRow) {
    //clear out any old infiniteItems
    targetRow.infiniteItems = [];

    const baseUrl = buildGalleryUrl();
    const urlObj = new URL(baseUrl);
    urlObj.searchParams.set("category_type", getRowTitle(targetRow));
    targetRow.nextUrl = urlObj.toString();

    targetRow.open = true;
  }

  emit("row-clicked");
};

//return the correct title based on the currentLanguage prop
const getRowTitle = (row) => {
  return props.currentLanguage === "en" ? row.type_translation : row.type;
};

//return list of other rows to display in the row-titles
const getOtherRows = (currentOriginalIndex) => {
  return rows.value
    .filter((row) => row.originalIndex !== currentOriginalIndex)
    .map((row) => ({
      index: row.originalIndex,
      title: `${getRowTitle(row)} (${row.count})`
    }));
};

//watchers update the corresponding timestamp and refetch the gallery
watch(
  () => props.searchItems,
  (newVal) => {
    if (newVal === null) return;
    filterTimestamps.search = Date.now();
    fetchGallery();
  }
);
watch(
  () => props.advancedSearchResults,
  (newVal) => {
    if (newVal === null) return;
    filterTimestamps.advanced = Date.now();
    fetchGallery();
  }
);
watch(
  () => props.bboxSearch,
  (newVal) => {
    if (newVal === null) return;
    filterTimestamps.bbox = Date.now();
    fetchGallery();
  }
);
watch(
  () => props.selectedSiteId,
  (newVal) => {
    if (newVal === null) return;
    filterTimestamps.site = Date.now();
    fetchGallery();
  }
);
</script>

<style scoped>
.loading-indicator {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.loading-icon {
  width: 50px;
  height: 50px;
}

.grid-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.row-wrapper {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: start;
}

.button-container {
  height: fit-content;
}

.sticky {
  margin-top: 60px;
  z-index: 10;
}

.toggle-btn {
  background: #333;
  color: #fff;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  width: 100px;
  font-size: 15px;
  border-radius: 5px;
}

.right-column {
  flex: 1;
  padding-left: 1rem;
  padding-top: 1rem;
}

.short-preview {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.short-item {
  flex: 0 1 200px;
  max-width: 200px;
}

.short-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.infinite-scroll-container {
  margin-top: 1rem;
}

.infinite-scroll-container.open {
  max-height: 80vh;
  overflow-y: auto;
  scrollbar-width: none;  
  -ms-overflow-style: none; 
}

.masonry-grid {
  width: 100%;
}

.item {
  display: inline-block;
  padding: 0.5rem;
}

.row-titles {
  margin-top: 1rem;
}

.row-titles ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.row-titles li {
  cursor: pointer;
  color: #007bff;
}

.row-titles li:hover {
  text-decoration: underline;
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: auto;
  cursor: pointer;
}

.metadata-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--image-hover-background, rgba(0, 0, 0, 0.7));
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-wrapper:hover .metadata-overlay {
  opacity: 0.9;
}

.metadata-content {
  color: var(--page-text, #fff);
  text-align: center;
  padding: 10px;
  font-size: 0.9rem;
}
</style>
