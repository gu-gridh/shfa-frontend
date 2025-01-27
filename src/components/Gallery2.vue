<template>
  <div class="grid-container">
    <div v-for="(row, rowIndex) in rows" :key="'row-' + rowIndex" class="row-wrapper">
      <!-- left column - show/hide button -->
      <div class="button-container">
        <button class="toggle-btn" @click="toggleRow(rowIndex)">
          {{ row.open ? "Hide" : "Show more" }}
        </button>
      </div>

      <!-- right column - gallery -->
      <div class="right-column">
        <h3>Row #{{ rowIndex + 1 }}</h3>

        <!--short preview images - if the row is closed-->
        <div class="short-preview" v-if="!row.open">
          <div v-for="item in row.shortItems" :key="item.key" class="short-item">
            <img :src="`${item.iiif_file}/full/350,/0/default.jpg`" alt="preview" />
          </div>
        </div>

        <!--infinite scroll gallery - if the row is open-->
        <div v-if="row.open" class="infinite-scroll-container">
          <masonry-infinite-grid class="masonry-grid" :gap="5" @request-append="(e) => onRequestAppend(e, rowIndex)">
            <div class="item" v-for="(item, i) in row.infiniteItems" :key="item.key"
              :data-grid-groupkey="item.groupKey">
              <div class="thumbnail">
                <img :src="`${item.iiif_file}/full/350,/0/default.jpg`" alt="shfa image" />
              </div>
              <div class="info">{{ item.info }}</div>
            </div>

            <!-- loading slot -->
            <template v-slot:loading="{ item }">
              <div class="loading" :key="item.key" :data-grid-groupkey="item.groupKey">
                <img src="/interface/6-dots-rotate.svg" alt="loading indicator" class="loading-icon" />
              </div>
            </template>

            <!-- placeholder slot -->
            <!-- <template v-slot:placeholder="{ item }">
              <div
                class="placeholder"
                :key="item.key"
                :data-grid-groupkey="item.groupKey"
              >
                <div class="loader">Loading placeholder...</div>
              </div>
            </template> -->

          </masonry-infinite-grid>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { MasonryInfiniteGrid } from "@egjs/vue3-infinitegrid";

export default {
  name: "TenSeparateMasonries",
  components: {
    MasonryInfiniteGrid,
  },
  data() {
    return {
      rows: [],
    };
  },
  async mounted() {
    for (let i = 0; i < 10; i++) {
      //for each row fetch 5 images for the short preview
      const res = await fetch("https://diana.dh.gu.se/api/shfa/image/?limit=5");
      const data = await res.json();

      //array of the 5 preview items
      const shortItems = data.results.map((img) => ({
        key: `preview-${i}-${img.id}`,
        iiif_file: img.iiif_file,
      }));

      //each row has its own infinite scroll data
      this.rows.push({
        shortItems,
        open: false,
        infiniteItems: [],
        nextUrl: "https://diana.dh.gu.se/api/shfa/image/?limit=25",
        currentGroupKey: 0,
        isFetching: false,
      });
    }
  },
  methods: {
    toggleRow(rowIndex) {
      this.rows.forEach((row, i) => { //close all rows
        if (i !== rowIndex && row.open) {
          row.open = false;
        }
      });

      const row = this.rows[rowIndex]; //toggle current row
      row.open = !row.open;
    },

    async onRequestAppend(e, rowIndex) {
      const row = this.rows[rowIndex];
      if (row.isFetching || !row.nextUrl) return;

      row.isFetching = true;
      e.wait();

      // add placeholders
      // const nextGroupKey = row.currentGroupKey + 1;
      // e.currentTarget.appendPlaceholders(5, nextGroupKey);

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
    },
  },
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
  position: sticky;
  top: 0;
  z-index: 10;
  height: fit-content;
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
  width: 120px;
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
  width: 250px;
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
</style>