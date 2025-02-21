<template>
  <div>
    <div v-if="isGalleryLoading" class="loading-indicator">
      <!-- put indicator here -->
    </div>
    <div v-else class="grid-container">
      <div
        v-for="(row, visibleIndex) in visibleRows"
        class="row-wrapper"
        :id="'row-wrapper-' + row.originalIndex"
      >
        <div class="button-container" :class="{ sticky: row.open }">
          <button class="toggle-btn" @click="toggleRow(row.originalIndex)">
            {{ row.open ? "Hide" : "Show more" }}
          </button>
          <div v-if="row.open" class="row-titles">
            <ul>
              <li
                v-for="other in getOtherRows(row.originalIndex)"
                @click="onTitleClick(other.index)"
              >
                {{ other.title }}
              </li>
            </ul>
          </div>
        </div>

        <div class="right-column">
          <h3 style="margin-bottom: 1rem;">
            {{ getRowTitle(row) }}
            <span v-if="row.count"> ({{ row.count }})</span>
          </h3>
          <div class="short-preview" v-if="!row.open">
            <div v-for="item in row.shortItems" class="short-item">
              <div class="image-wrapper" @click="$emit('image-clicked', item.iiif_file, item.id)">
                <img :src="`${item.iiif_file}/full/350,/0/default.jpg`" alt="preview" />
                <div class="metadata-overlay">
                  <div class="metadata-content">
                    {{ item.info }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="row.open" class="infinite-scroll-container">
            <MasonryInfiniteGrid
              ref="masonryRef"
              class="masonry-grid"
              :gap="10"
              :scrollContainer="'#split-1'"
              :threshold="100"
              :columnSize="150"
              :useRoundedSize="false"
              :useTransform="true"
              @request-append="(e) => onRequestAppend(e, row.originalIndex)"
            >
              <div class="item" v-for="(item, i) in row.infiniteItems">
                <div class="image-wrapper" @click="$emit('image-clicked', item.iiif_file, item.id)">
                  <img :src="`${item.iiif_file}/full/150,/0/default.jpg`" />
                  <div class="metadata-overlay">
                    <div class="metadata-content">
                      {{ item.info }}
                    </div>
                  </div>
                </div>
              </div>

              <template #loading="{ item }">
                <div class="loading">
                  <img src="/interface/6-dots-rotate.svg" alt="loading indicator" class="loading-icon" />
                </div>
              </template>
            </MasonryInfiniteGrid>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch, reactive } from "vue";
import { MasonryInfiniteGrid } from "@egjs/vue3-infinitegrid";

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

const rows = ref([]);
const isGalleryLoading = ref(true);
const masonryRef = ref(null);

// track the last update for each filter type
const filterTimestamps = reactive({
  search: 0,
  advanced: 0,
  bbox: 0,
  site: 0
});

// compute which filter is the most recent
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

// TEMP helper function to format the iiif url
const formatIiifUrl = (url) => {
  if (url.startsWith("http")) return url;
  return "https://img.dh.gu.se/diana/static/" + url;
};

// build the gallery api url based on the most recent filter update
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
    Object.keys(props.advancedSearchResults).forEach(key => {
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

// fetch the gallery short items from the api
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

onMounted(() => {
  // update the masonry layout when the panel changes width
  const resizeObserver = new ResizeObserver(() => {
    if (masonryRef.value && masonryRef.value.length) {
      if (!props.showThreePanels) {
        nextTick(() => {
          const gridInstance = masonryRef.value[0];
          gridInstance.renderItems({ useOrgResize: true });
        });
      }
    }
  });

  const container = document.querySelector("#split-1");
  if (container) {
    resizeObserver.observe(container);
  }
});

const visibleRows = computed(() => {
  const anyExpanded = rows.value.some((row) => row.open);
  return anyExpanded ? rows.value.filter((row) => row.open) : rows.value;
});

const toggleRow = (originalIndex) => {
  rows.value.forEach((row) => {
    if (row.originalIndex !== originalIndex && row.open) {
      row.open = false;
    }
  });
  const row = rows.value.find((r) => r.originalIndex === originalIndex);
  if (row) {
    row.open = !row.open;
    if (row.open) {
      row.infiniteItems = [];
      const baseUrl = buildGalleryUrl();
      const urlObj = new URL(baseUrl);
      urlObj.searchParams.set("category_type", getRowTitle(row));
      row.nextUrl = urlObj.toString();
    } else {
      nextTick(() => {
        const rowEl = document.getElementById(`row-wrapper-${originalIndex}`);
        const container = document.getElementById("split-1");
        if (rowEl && container) {
          container.scrollTo({
            top: rowEl.offsetTop - container.offsetTop
          });
        }
      });
    }
  }
};

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
    console.error(err);
  } finally {
    row.isFetching = false;
    e.ready();
  }
};

const onTitleClick = (targetOriginalIndex) => {
  // close the expanded row if open
  const expandedRow = rows.value.find((row) => row.open);
  if (expandedRow) {
    expandedRow.open = false;
  }
  nextTick(() => {
    const rowEl = document.getElementById(`row-wrapper-${targetOriginalIndex}`);
    const container = document.getElementById("split-1");
    if (rowEl && container) {
      const containerRect = container.getBoundingClientRect();
      const rowRect = rowEl.getBoundingClientRect();
      const scrollOffset = container.scrollTop + (rowRect.top - containerRect.top);
      container.scrollTo({
        top: scrollOffset
      });
      emit("row-clicked");
    }
  });
};

//return the correct title based on the currentLanguage prop
const getRowTitle = (row) => {
  return props.currentLanguage === "en" ? row.type_translation : row.type;
};

const getOtherRows = (currentOriginalIndex) => {
  return rows.value
    .filter((row) => row.originalIndex !== currentOriginalIndex)
    .map((row) => ({
      index: row.originalIndex,
      title: `${getRowTitle(row)} (${row.count})`
    }));
};

const emit = defineEmits(["image-clicked", "row-clicked"]);

//watchers update the corresponding timestamp and refetch the gallery
watch(
  () => props.searchItems,
  (newVal) => {
    console.log("Regular Search Items:", newVal);
    filterTimestamps.search = Date.now();
    fetchGallery();
  }
);
watch(
  () => props.advancedSearchResults,
  (newVal) => {
    console.log("Advanced Search Results:", newVal);
    filterTimestamps.advanced = Date.now();
    fetchGallery();
  }
);
watch(
  () => props.bboxSearch,
  (newVal) => {
    console.log("Bbox Search:", newVal);
    filterTimestamps.bbox = Date.now();
    fetchGallery();
  }
);
watch(
  () => props.selectedSiteId,
  (newVal) => {
    console.log("Selected Site ID:", newVal);
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

.placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 250px;
  height: calc(100% - 30px);
  background-color: #fafafa;
  border: 1px solid #ddd;
  box-sizing: border-box;
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
  position: sticky;
  top: 0;
  z-index: 10;
}

.toggle-btn {
  background: #333;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  width: 100px;
  margin-top: 1rem;
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
  aspect-ratio: 1;
  min-width: 0;
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

.masonry-grid {
  width: 100%;
}

.item {
  display: inline-block;
  padding: 0.5rem;
}

.info {
  display: flex;
  align-items: center;
  font-weight: bold;
  color: #777;
  height: 30px;
}

.row-titles ul {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0 0;
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