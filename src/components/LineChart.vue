<template>
    <div class="chart-shell">
        <VueECharts :option="option" renderer="png" :style="{ height: '260px', width: '100%' }" ref="chartRef" />
        <div v-if="exportable" class="btn-row">
            <div class="btn-row-title">{{ $t(`message.download`) }}</div>
            <button type="button" @click="downloadImage">PNG</button>
            <div class="btn-row-title">|</div>
            <button type="button" @click="downloadCSV">CSV</button>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed, nextTick, onMounted, onUnmounted } from 'vue'
import VueECharts from 'vue-echarts'
import * as echarts from 'echarts/core'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { useI18n } from 'vue-i18n'
import { GridComponent, TooltipComponent, TitleComponent } from 'echarts/components'

const { t } = useI18n()

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, TitleComponent])

const isMobile = window.matchMedia('(max-width:900px)').matches

const props = defineProps({
    data: { type: Array, default: () => [] },
    title: { type: String, default: 'chart' },
    exportable: { type: Boolean, default: true },
    textColor: { type: String, default: 'blue' },
    currentLanguage: { type: String, default: 'sv' }
})

const seriesData = computed(() => binData(props.data))
const option = ref({})
const chartRef = ref(null)

let resizeObserver = null

onMounted(() => {
    resizeObserver = new ResizeObserver(() => {
        nextTick(() => chartRef.value?.chart?.resize())
    })
    const chartContainer = document.querySelector('.chart-shell')
    if (chartContainer) {
        resizeObserver.observe(chartContainer)
    }
})

onUnmounted(() => { resizeObserver?.disconnect() })

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
            top: 25,
            bottom: isMobile ? 24 : 40,
            outerBounds: {
                includeLabels: true
            }
        },
        color: [
            '#719fbf',
            '#7e75a0',
        ],
        title: {
            text: t(`charts.${props.title}`),
            textStyle: { color: props.textColor, fontSize: 16, fontWeight: 350, fontFamily: "Barlow Condensed" },
            left: "center",
            top: 0,
        },
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: years,
            boundaryGap: true,
            axisLabel: {
                color: props.textColor,
            }
        },
        yAxis: {
            type: 'value',
            color: props.textColor,
            axisLabel: {
                color: props.textColor,
            },
            axisLine: {
                lineStyle: { color: props.textColor }
            },
            splitLine: {
                lineStyle: { color: props.textColor, opacity: 0.3 }
            }
        },
        series: [{ type: 'line', data: counts, smooth: true, symbolSize: 6 }]
    }

    nextTick(() => chartRef.value?.chart?.resize())
}

watch(() => [props.data, props.textColor, props.currentLanguage], rebuild, { immediate: true })

async function downloadImage() {
    const name = (props.title || 'chart') + '.png'
    const exportWidth = 800
    const exportHeight = 260

    const inst = chartRef.value?.chart
    const useOffscreen = isMobile || !inst

    if (useOffscreen) { //mobile - render offscreen
        const blobUrl = await exportOffscreenPNG(option.value, exportWidth, exportHeight)
        save(blobUrl, name)
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1500)
    } else {  //desktop - use existing instance
        const dataUrl = inst.getDataURL({ type: 'image/png', pixelRatio: 4 })
        const blob = await (await fetch(dataUrl)).blob()
        const blobUrl = URL.createObjectURL(blob)
        save(blobUrl, name)
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1500)
    }
}

async function exportOffscreenPNG(opt, width, height) {
    const tmp = document.createElement('div')
    Object.assign(tmp.style, {
        position: 'fixed', left: '-10000px', top: '-10000px',
        width: width + 'px', height: height + 'px'
    })
    document.body.appendChild(tmp)

    const inst = echarts.init(tmp, null, { renderer: 'canvas', width, height })
    try {
        const blobUrl = await new Promise((resolve, reject) => {
            inst.on('finished', async () => {
                try {
                    const dataUrl = inst.getDataURL({ type: 'image/png' })
                    const blob = await (await fetch(dataUrl)).blob()
                    resolve(URL.createObjectURL(blob))
                } catch (e) { reject(e) }
            })
            inst.setOption(opt, true)
        })
        return blobUrl
    } finally {
        inst.dispose()
        document.body.removeChild(tmp)
    }
}

function downloadCSV() {
    const csv = ['Year,Count', ...seriesData.value.map(({ year, count }) => `"${year}",${count}`)].join('\n')
    const BOM = '\uFEFF'
    const url = URL.createObjectURL(new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' }))
    save(url, (props.title || 'chart') + '.csv')
}

function save(url, name) {
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}
</script>

<style scoped>
.chart-shell {
    display: flex;
    flex-direction: column;
    width: calc(100% + 40px);
    margin-left: -40px;
}

@media (max-width: 900px) {
    .chart-shell {
        width: calc(100%);
        margin-left: -15px;
    }
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
    color: var(--page-text);
}
</style>
