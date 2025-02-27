<template>
    <div class="infinite-scroll-container" v-if="row.open">
        <MasonryInfiniteGrid ref="masonryRef" class="masonry-grid" :gap="10" :scrollContainer="'.infinite-scroll-container'" 
            :threshold="1000" :columnSize="150" :useRoundedSize="false" :useTransform="true" @request-append="onRequestAppend">
            <div class="item" v-for="(item, i) in row.infiniteItems" :key="i">
                <div class="image-wrapper" @click="$emit('image-clicked', { file: item.iiif_file, id: item.id })">
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
</template>

<script setup>
import { onMounted, ref, nextTick } from "vue";
import { MasonryInfiniteGrid } from "@egjs/vue3-infinitegrid";

const props = defineProps({
    row: {
        type: Object,
        required: true
    },
    onRequestAppendParent: {
        type: Function,
        required: true
    },
    showThreePanels: { 
        type: Boolean, 
        default: false 
    }  
});

const emit = defineEmits(["image-clicked"]);
const masonryRef = ref(null);

onMounted(() => {
    const resizeObserver = new ResizeObserver(() => {
        if (masonryRef.value) {
            if (!props.showThreePanels) {
                nextTick(() => {
                    const gridInstance = masonryRef.value;
                    if (gridInstance && gridInstance.renderItems) {
                        gridInstance.renderItems({ useOrgResize: true });
                    }
                });
            }
        }

    });

    const container = document.querySelector("#split-1");
    if (container) {
        resizeObserver.observe(container);
    }
});

function onRequestAppend(e) {
    props.onRequestAppendParent(e, props.row.originalIndex);
}
</script>

<style scoped>
.infinite-scroll-container {
    margin-top: 1rem;
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

.image-wrapper {
    position: relative;
    width: 100%;
    height: auto;
    cursor: pointer;
}

.metadata-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
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
    color: #fff;
    text-align: center;
    padding: 10px;
    font-size: 0.9rem;
}

.loading {
    text-align: center;
    padding: 1rem 0;
}
</style>