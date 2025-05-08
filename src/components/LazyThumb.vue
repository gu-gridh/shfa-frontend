<template>
    <div class="thumb" :class="{ loaded }">
        <img :src="src" :alt="alt" @load="loaded = true" />
    </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({ src: String, alt: String })
const loaded = ref(false)
</script>

<style scoped>
.thumb {
    width: 100%;
    height: 100%;
    background: #fff;
}

.thumb.loaded {
    background: transparent;
}

.thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>