<template>
  <div class="chart-shell">
    <div class="echart-wrapper">
      <VueECharts :option="option" renderer="svg" :style="{ height: chartHeight + 'px', width: '100%' }"
        ref="chartRef" />
    </div>

    <div v-if="exportable" class="btn-row">
      <div class="btn-row-title">Download</div>
      <button @click="downloadImage">SVG</button>
      <div class="btn-row-title">|</div>
      <button @click="downloadCSV">CSV</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue'
import { use } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import { BarChart as Bar } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
use([SVGRenderer, Bar, GridComponent, TooltipComponent])

import VueECharts from 'vue-echarts'

const isMobile = window.matchMedia('(max-width:900px)').matches

const props = defineProps({
  data: { type: Array, default: () => [] },
  title: { type: String, default: '' },
  exportable: { type: Boolean, default: true }
})
const emit = defineEmits(['select'])

const TOP_N = isMobile ? 25 : 50
const BAR_H = isMobile ? 20 : 28 //px per bar
const MIN_CHART_HEIGHT = 300

const chartHeight = computed(() =>
  Math.max(MIN_CHART_HEIGHT, BAR_H * Math.min(TOP_N, props.data.length))
)

const chartRef = ref(null)
const option = ref({})

function rebuild() {
  const topData = [...props.data]
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_N)
    .reverse()

  const labels = topData.map(d => d.label)
  const values = topData.map(d => d.count)

  option.value = {
    grid: {
      left: 2,
      right: 24,
      top: 8,
      bottom: 20,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis', axisPointer: { type: 'shadow' },
      formatter: p => `<strong>${p[0].name}</strong><br/>${p[0].value}`
    },
    xAxis: { type: 'value', splitNumber: isMobile ? 2 : 8 },
    yAxis: {
      type: 'category',
      data: labels,
      axisLabel: {
        interval: 0,
        align: 'right',
        margin: 8,
        overflow: isMobile ? 'truncate' : 'none',
        color: "var(--page-text)",
        width: isMobile ? 60 : null,
        ellipsis: '…',
        formatter: v => v
      }
    },
    series: [{ type: 'bar', data: values, barWidth: '60%' }]
  }

  nextTick(() => {
    const inst = chartRef.value?.chart
    if (!inst) return
    inst.resize()
    inst.off('click')
    inst.on('click', p => emit('select', p.name))
  })
}

watch(() => props.data, rebuild, { immediate: true })

async function downloadImage() {
  await nextTick()
  const inst = chartRef.value?.chart
  if (!inst) return
  const url = inst.getDataURL({ type: 'svg', pixelRatio: 2, background: '#fff' })
  save(url, (props.title || 'chart') + '.svg')
}

function downloadCSV() {
  const csv = ['Label,Count', ...props.data.map(d => `"${d.label}",${d.count}`)].join('\n')
  const BOM = '\uFEFF';
  const url = URL.createObjectURL(new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' }))
  save(url, (props.title || 'chart') + '.csv')
}

function save(url, name) {
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
}

let resizeObserver = null

onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    nextTick(() => {
      const inst = chartRef.value?.chart
      if (inst) {
        inst.resize()
      }
    })
  })

  const chartContainer = document.querySelector('.chart-shell')
  if (chartContainer) {
    resizeObserver.observe(chartContainer)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})
</script>

<style scoped>
.chart-shell {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.echart-wrapper {
  min-height: 300px;
  overflow: visible;
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
  pointer-events: none;
}

.btn-row button {
  color: var(--highlighted-text);
  pointer-events: auto;
}
</style>