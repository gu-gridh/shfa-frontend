<template>
  <div class="grid-container">
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
              Row #{{ other.index + 1 }}
            </li>
          </ul>
        </div>
      </div>

      <div class="right-column">
        <h3 style="margin-bottom: 1rem;">Row #{{ row.originalIndex + 1 }}</h3>
        <div class="short-preview" v-if="!row.open">
          <div v-for="item in row.shortItems" class="short-item">
            <div class="image-wrapper" @click="$emit('image-clicked', item.iiif_file, item.id)">
              <img :src="`${item.iiif_file}/full/350,/0/default.jpg`" alt="preview" />
              <div class="metadata-overlay">
                <div class="metadata-content">
                  {{ item.info || `ID: ${item.id}` }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="row.open" class="infinite-scroll-container">
          <MasonryInfiniteGrid
            class="masonry-grid"
            :gap="1"
            :scrollContainer="'#split-1'"
            :threshold="100"
            :useResizeObserver="true"
            @request-append="(e) => onRequestAppend(e, row.originalIndex)"
          >
            <div
              class="item"
              v-for="(item, i) in row.infiniteItems"
            >
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
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from "vue";
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
  }
});

const rows = ref([]);
const scrollContainer = ref(null);
const emit = defineEmits(['image-clicked', 'row-clicked']);

onMounted(async () => {
  scrollContainer.value = document.getElementById(".flex-grow.overflow-auto.main-color");

  for (let i = 0; i < 10; i++) {
    const res = await fetch("https://diana.dh.gu.se/api/shfa/image/?limit=5");
    const data = await res.json();

    const shortItems = data.results.map((img) => ({
      id: img.id,
      iiif_file: img.iiif_file,
      info: `ID: ${img.id}${img.year ? ` | Year: ${img.year}` : ''}`
    }));

    rows.value.push({
      originalIndex: i,
      shortItems,
      open: false,
      infiniteItems: [],
      nextUrl: "https://diana.dh.gu.se/api/shfa/image/?limit=25",
      isFetching: false,
    });
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
    if (!row.open) {
      nextTick(() => {
        const rowEl = document.getElementById(`row-wrapper-${originalIndex}`);
        const container = document.getElementById("split-1");
        if (rowEl && container) {
          container.scrollTo({
            top: rowEl.offsetTop - container.offsetTop,
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
      iiif_file: img.iiif_file,
      info: `ID: ${img.id}${img.year ? ` | Year: ${img.year}` : ''}`
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
  const expandedRow = rows.value.find((row) => row.open);
  if (expandedRow) {
    expandedRow.open = false;
  }
  nextTick(() => {
    const rowEl = document.getElementById(`row-wrapper-${targetOriginalIndex}`);
    const container = document.getElementById("split-1");
    if (rowEl && container) {
      container.scrollTo({
        top: rowEl.offsetTop - container.offsetTop,
      });
      emit('row-clicked');
    }
  });
};

const getOtherRows = (currentOriginalIndex) => {
  return rows.value
    .map((row) => ({ row, index: row.originalIndex }))
    .filter((item) => item.index !== currentOriginalIndex);
};

watch(() => props.searchItems, (newValue) => {
  console.log('Regular Search Items:', newValue);
});

watch(() => props.advancedSearchResults, (newValue) => {
  console.log('Advanced Search Results:', newValue);
});

watch(() => props.bboxSearch, (newValue) => {
  console.log('Bbox Search:', newValue);
});

watch(() => props.selectedSiteId, (newValue) => {
  console.log('Selected Site ID:', newValue);
});
</script>

<style scoped>
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
  width: 100%;
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

.short-item img {
  height: auto;
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
  margin: 0.5rem 0;
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