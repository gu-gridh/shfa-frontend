<template>
  <div class="chart-shell">
    <div class="echart-wrapper" v-if="!isMobile">
      <VueECharts :option="option" renderer="svg" :style="{ height: chartHeight + 'px', width: '100%' }"
        ref="chartRef" />
    </div>

    <div v-if="exportable" class="btn-row">
      <div class="btn-row-title">Download</div>
      <button type="button" @click="downloadImage">SVG</button>
      <div class="btn-row-title">|</div>
      <button type="button" @click="downloadCSV">CSV</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import { BarChart as Bar } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VueECharts from 'vue-echarts'

echarts.use([SVGRenderer, Bar, GridComponent, TooltipComponent, LegendComponent])

const isMobile = ref(window.innerWidth < 1025)
const props = defineProps({
  data: { type: Array, default: () => [] },
  title: { type: String, default: '' },
  exportable: { type: Boolean, default: true }
})

const TOP_N = 50;
const BAR_H = 28; //px per bar
const MIN_CHART_HEIGHT = 300

const chartHeight = computed(() =>
  Math.max(MIN_CHART_HEIGHT, BAR_H * Math.min(TOP_N, props.data.length))
)

const chartRef = ref(null)
const option = ref({})
const emit = defineEmits(['select'])

function rebuild() {
  const topData = [...props.data]
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_N)
    .reverse()

  const labels = topData.map(d => d.label)
  const hasFig = topData.some(d => typeof d.figurative === 'boolean')

  option.value = {
    grid: {
      left: 2,
      right: 24,
      top: hasFig ? 36 : 8,  //extra space when the legend shows
      bottom: 20,
      containLabel: true
    },
    legend: hasFig ? {
      top: 6,
      right: 5,
      textStyle: { color: 'var(--page-text)' },
      itemWidth: 14,
      itemHeight: 10,
      data: ['Figurative', 'Non-figurative']
    } : undefined,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: params => {
        const list = Array.isArray(params) ? params : [params]
        const nz = list.find(i => i.value > 0) || list[0]
        return `<strong>${nz.name}</strong><br/>${nz.value}`
      }
    },
    xAxis: { type: 'value', splitNumber: 8 },
    yAxis: {
      type: 'category',
      data: labels,
      triggerEvent: true,
      axisLabel: {
        interval: 0,
        align: 'right',
        margin: 8,
        overflow: 'none',
        color: 'var(--page-text)',
        ellipsis: '…',
        formatter: v => v
      }
    },
    series: hasFig
      ? [
        {
          name: 'Figurative',
          type: 'bar',
          stack: 'one',
          barWidth: '60%',
          itemStyle: { color: 'var(--figurative-color, #3b82f6)' },
          data: topData.map(d => (d.figurative ? d.count : 0))
        },
        {
          name: 'Non-figurative',
          type: 'bar',
          stack: 'one',
          barWidth: '60%',
          itemStyle: { color: 'var(--nonfigurative-color, #a855f7)' },
          data: topData.map(d => (!d.figurative ? d.count : 0))
        }
      ]
      : [
        {
          type: 'bar',
          barWidth: '60%',
          data: topData.map(d => d.count)
        }
      ]
  }

  nextTick(() => {
    const inst = chartRef.value?.chart
    if (!inst) return
    inst.resize()
    inst.off('click')
    inst.on('click', p => {
      if (p.componentType === 'yAxis') {
        const label = p.value
        if (label) emit('select', label)
      }
    })
  })
}

watch(() => props.data, rebuild, { immediate: true })

async function downloadImage() {
  const name = (props.title || 'chart') + '.svg'
  const exportWidth = 800
  const exportHeight = Math.max(MIN_CHART_HEIGHT, BAR_H * Math.min(TOP_N, props.data.length))

  const inst = chartRef.value?.chart
  const useOffscreen = isMobile.value || !inst

  if (useOffscreen) { //mobile - render offscreen
    const blobUrl = await exportOffscreenSVG(option.value, exportWidth, exportHeight)
    save(blobUrl, name)
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1500)
  } else { //desktop - use existing instance
    const dataUrl = inst.getDataURL({ type: 'svg', background: '#fff' })
    const blob = await (await fetch(dataUrl)).blob()
    const blobUrl = URL.createObjectURL(blob)
    save(blobUrl, name)
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1500)
  }
}

async function exportOffscreenSVG(opt, width, height) {
  const tmp = document.createElement('div')
  Object.assign(tmp.style, {
    position: 'fixed', left: '-10000px', top: '-10000px',
    width: width + 'px', height: height + 'px'
  })
  document.body.appendChild(tmp)

  const inst = echarts.init(tmp, null, { renderer: 'svg', width, height })

  try {
    const blobUrl = await new Promise((resolve, reject) => {
      inst.on('finished', async () => {
        try {
          const dataUrl = inst.getDataURL({ type: 'svg', background: '#fff' })
          const blob = await (await fetch(dataUrl)).blob()
          resolve(URL.createObjectURL(blob))
        } catch (e) {
          reject(e)
        }
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
  const hasFig = props.data.some(d => typeof d.figurative === 'boolean')

  const header = hasFig ? 'Label,Count,Figurative' : 'Label,Count'
  const rows = props.data.map(d => {
    const base = `"${d.label}",${d.count}`
    if (!hasFig) return base
    const figText = d.figurative ? 'Figurative' : 'Non-figurative'
    return `${base},${figText}`
  })

  const csv = [header, ...rows].join('\n')
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
  setTimeout(() => URL.revokeObjectURL(url), 1500)
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

@media (max-width: 1025px) {
  .chart-shell {
    font-size: 1.5rem;
  }

  .btn-row {
    justify-content: center;
    padding-right: 0;
  }
}
</style>