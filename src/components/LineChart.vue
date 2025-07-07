<template>
    <div class="chart-shell">
        <VueECharts :option="option" renderer="svg" :style="{ height: '260px', width: '100%' }" ref="chartRef" />
        <div v-if="exportable" class="btn-row">
            <div class="btn-row-title">Download</div>
            <button @click="downloadImage">SVG</button>
            <button @click="downloadCSV">CSV</button>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import VueECharts from 'vue-echarts'
import { use } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'

use([SVGRenderer, LineChart, GridComponent, TooltipComponent])

const isMobile = window.matchMedia('(max-width:900px)').matches

const props = defineProps({
    data: { type: Array, default: () => [] },
    title: { type: String, default: 'chart' },
    exportable: { type: Boolean, default: true }
})

const emit = defineEmits(['selectRange'])
const seriesData = computed(() => binData(props.data))
const option = ref({})
const chartRef = ref(null)

function binData(arr) {
    return [...arr].sort((a, b) => a.year - b.year)
}

function rebuild() {
    const years = seriesData.value.map(d => String(d.year))
    const counts = seriesData.value.map(d => d.count)

    option.value = {
        grid: {
            left: isMobile ? 18 : 40,
            right: isMobile ? 8 : 20,
            top: 12,
            bottom: isMobile ? 24 : 40,
            containLabel: true
        },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: years, boundaryGap: false },
        yAxis: { type: 'value' },
        series: [{ type: 'line', data: counts, smooth: true, symbolSize: 6 }]
    }

    nextTick(() => chartRef.value?.chart?.resize())
}

function save(url, name) {
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
}

async function downloadImage() {
    await nextTick()
    const inst = chartRef.value?.chart
    if (!inst) return
    const url = inst.getDataURL({ type: 'svg', pixelRatio: 2, background: '#fff' })
    save(url, props.title + '.svg')
}

function downloadCSV() {
    const csv = ['Year,Count', ...seriesData.value
        .map(({ year, count }) => `"${year}",${count}`)]
        .join('\n')
    const BOM = '\uFEFF'
    const url = URL.createObjectURL(
        new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' }))
    save(url, props.title + '.csv')
}

watch(() => [props.data, props.zeroes], rebuild, { immediate: true })
</script>

<style scoped>
.chart-shell {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.btn-row {
    margin-top: 0.5rem;
    display: flex;
    gap: 0.5rem;
    padding-right: 20px;
    padding-bottom: 20px;
    justify-content: flex-end;
    user-select: none;
    -webkit-user-select: none;
}

.btn-row button {
    color: var(--highlighted-text);
    pointer-events: auto;
}

.btn-row-title {
    margin-right: 0.25rem;
    font-weight: 500;
}
</style>
