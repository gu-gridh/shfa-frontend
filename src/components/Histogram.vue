<template>
    <div class="histogram-wrapper">
        <div class="hover-label" :class="{ visible: !!focus }">
            <template v-if="focus">
                {{ focus.year }}–{{ focus.year + binSize - 1 }} ({{ focus.n }})
            </template>
        </div>

        <div class="histogram-container">
            <div v-for="bar in bars" :key="bar.year" class="bar-wrapper" :style="{ flexBasis: barWidth }"
                @mouseenter="focus = bar" @mouseleave="focus = null">
                <div class="bar-inner" :style="{ height: bar.n ? barHeight(bar.n) + '%' : '0%' }" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import floor from 'lodash/floor'

const props = defineProps({
    data: { type: Array, default: () => [] },
    zeroes: { type: Number, default: 1 }
})

const emit = defineEmits(['selectRange'])
const focus = ref(null)

const binSize = computed(() => 10 ** props.zeroes)

const bars = computed(() => {
    const map = new Map()
    props.data.forEach(({ year, count }) => {
        const base = floor(year, -props.zeroes)
        map.set(base, (map.get(base) || 0) + count)
    })
    return [...map.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([year, n]) => ({ year, n }))
})

const maxCount = computed(() => Math.max(...bars.value.map(b => b.n)) || 1)
const barWidth = computed(() => `${100 / bars.value.length}%`)
const barHeight = n => Math.round((n / maxCount.value) * 100)
</script>

<style scoped>
.histogram-wrapper {
    position: relative;
    width: 100%;
    padding-top: 1.6rem;
}

.hover-label {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 1.6rem;
    line-height: 1.6rem;
    text-align: center;
    font-size: 0.9rem;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s;
}

.hover-label.visible {
    opacity: 1;
}

.histogram-container {
    display: flex;
    align-items: flex-end;
    height: 180px;
    width: 100%;
    gap: 3px;
}

.bar-wrapper {
    height: 100%;
    display: flex;
    align-items: flex-end;
    cursor: pointer;
}

.bar-inner {
    width: 100%;
    background: #007bff;
    transition: opacity 0.25s;
}

.bar-wrapper:hover .bar-inner {
    opacity: 0.8;
}
</style>
