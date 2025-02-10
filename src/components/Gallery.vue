<template>
  <div class="grid-container">
    <div v-for="(row, rowIndex) in rows" :key="'row-' + rowIndex" class="row-wrapper" :id="'row-wrapper-' + rowIndex">
      <div class="button-container" :class="{ sticky: row.open }">
        <button class="toggle-btn" @click="toggleRow(rowIndex)">
          {{ row.open ? "Hide" : "Show more" }}
        </button>
        <div v-if="row.open" class="row-titles">
          <ul>
            <li v-for="other in getOtherRows(rowIndex)" :key="'title-' + other.index"
              @click="onTitleClick(other.index)">
              Row #{{ other.index + 1 }}
            </li>
          </ul>
        </div>
      </div>

      <div class="right-column">
        <h3>Row #{{ rowIndex + 1 }}</h3>
        <div class="short-preview" v-if="!row.open">
          <div v-for="item in row.shortItems" :key="item.key" class="short-item">
            <img :src="`${item.iiif_file}/full/350,/0/default.jpg`" alt="preview" />
          </div>
        </div>
        <div v-if="row.open" class="infinite-scroll-container">
          <MasonryInfiniteGrid 
            class="masonry-grid" 
            :gap="1" 
            :useWindow="false"
            :scrollContainer="'#split-1'"
            :threshold="100"
            @request-append="(e) => onRequestAppend(e, rowIndex)"
          >
            <div class="item" v-for="(item, i) in row.infiniteItems" :key="item.key"
              :data-grid-groupkey="item.groupKey">
              <div class="thumbnail">
                <img :src="`${item.iiif_file}/full/350,/0/default.jpg`" alt="shfa image" />
              </div>
              <div class="info">{{ item.info }}</div>
            </div>

            <template #loading="{ item }">
              <div class="loading" :key="item.key" :data-grid-groupkey="item.groupKey">
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
import { ref, onMounted, nextTick } from "vue";
import { MasonryInfiniteGrid } from "@egjs/vue3-infinitegrid";

const rows = ref([]);
const scrollContainer = ref(null);

onMounted(async () => {
  scrollContainer.value = document.getElementById(".flex-grow.overflow-auto.main-color");

  for (let i = 0; i < 10; i++) {
    const res = await fetch("https://diana.dh.gu.se/api/shfa/image/?limit=5");
    const data = await res.json();

    const shortItems = data.results.map((img) => ({
      key: `preview-${i}-${img.id}`,
      iiif_file: img.iiif_file,
    }));

    rows.value.push({
      shortItems,
      open: false,
      infiniteItems: [],
      nextUrl: "https://diana.dh.gu.se/api/shfa/image/?limit=25",
      currentGroupKey: 0,
      isFetching: false,
    });
  }
});

const toggleRow = (rowIndex) => {
  rows.value.forEach((row, i) => {
    if (i !== rowIndex && row.open) {
      row.open = false;
    }
  });

  const row = rows.value[rowIndex];
  row.open = !row.open;

  if (!row.open) {
    nextTick(() => {
      const rowEl = document.getElementById(`row-wrapper-${rowIndex}`);
      const container = document.getElementById('split-1');
      if (rowEl && container) {
        container.scrollTo({
          top: rowEl.offsetTop - container.offsetTop,
          behavior: 'smooth'
        });
      }
    });
  }
};

const onRequestAppend = async (e, rowIndex) => {
  console.log("onRequestAppend triggered", rowIndex);
  const row = rows.value[rowIndex];
  if (row.isFetching || !row.nextUrl) return;

  row.isFetching = true;
  e.wait();

  try {
    const response = await fetch(row.nextUrl);
    const data = await response.json();

    const newItems = data.results.map((img) => ({
      groupKey: row.currentGroupKey,
      key: `row${rowIndex}-g${row.currentGroupKey}-${img.id}`,
      iiif_file: img.iiif_file,
      info: `id: ${img.id} | year: ${img.year}`,
    }));

    row.currentGroupKey++;
    row.infiniteItems.push(...newItems);
    row.nextUrl = data.next;
  } catch (err) {
    console.error(err);
  } finally {
    row.isFetching = false;
    e.ready();
  }
};

const onTitleClick = (targetRowIndex) => {
  const expandedRowIndex = rows.value.findIndex((row) => row.open);
  if (expandedRowIndex !== -1) {
    rows.value[expandedRowIndex].open = false;
  }
  nextTick(() => {
    const rowEl = document.getElementById(`row-wrapper-${targetRowIndex}`);
    const container = document.getElementById('split-1');
    if (rowEl && container) {
      container.scrollTo({
        top: rowEl.offsetTop - container.offsetTop,
        behavior: 'smooth'
      });
    }
  });
};

const getOtherRows = (currentRowIndex) => {
  return rows.value
    .map((row, index) => ({ row, index }))
    .filter((item) => item.index !== currentRowIndex);
};
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
  gap: 5rem;
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
}

.right-column {
  flex: 1;
}

.short-preview {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.short-item img {
  width: 200px;
  height: auto;
  border-radius: 4px;
  background: #eee;
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
  width: 150px;
}

.thumbnail {
  overflow: hidden;
  border-radius: 8px;
  font-size: 0;
  height: calc(100% - 30px);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
  background: #eee;
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
</style>