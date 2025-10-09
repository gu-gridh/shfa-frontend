<template>
  <div class="chart-shell">
    <div class="echart-wrapper" v-if="!isMobile">
      <VueECharts :option="option" renderer="canvas" :style="{ height: chartHeight + 'px', width: '100%' }"
        ref="chartRef" />
    </div>

    <div v-if="exportable" class="btn-row">
      <div class="btn-row-title">{{ $t(`message.download`) }}</div>
      <button type="button" @click="downloadImage">PNG</button>
      <div class="btn-row-title">|</div>
      <button type="button" @click="downloadCSV">CSV</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart as Bar } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VueECharts from 'vue-echarts'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

echarts.use([CanvasRenderer, Bar, GridComponent, TooltipComponent, LegendComponent])

const isMobile = ref(window.innerWidth < 1025)
const props = defineProps({
  data: { type: Array, default: () => [] },
  title: { type: String, default: '' },
  exportable: { type: Boolean, default: true },
  textColor: { type: String, default: 'white' }
})

const TOP_N = 50;
const BAR_H = 48; //px per bar
const MIN_CHART_HEIGHT = 325

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
      left: 10,
      right: hasFig ? '15%' : 24, //extra space when the legend shows
      top: 8,
      bottom: 20,
      outerBounds: {
        includeLabels: true
      }
    },
    color: [
      '#719fbf',
      '#7e75a0',
    ],
    legend: {
      show: hasFig,
      top: 0,
      right: 2,
      orient: 'vertical',
      textStyle: { color: props.textColor },
      backgroundColor: 'rgba(0, 0, 0, 0.15)',
      borderRadius: 6,
      itemWidth: 12,
      itemHeight: 10,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: params => {
        const list = Array.isArray(params) ? params : [params]
        const nz = list.find(i => i.value > 0) || list[0]
        return `<strong>${nz.name}</strong><br/>${nz.value}`
      }
    },
    xAxis: {
      type: 'value',
      splitNumber: 8,
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
    yAxis: {
      type: 'category',
      data: labels,
      triggerEvent: true,
      axisLabel: {
        width: 150,
        lineHeight: 14,
        interval: 0,
        align: 'right',
        margin: 12,
        overflow: 'break',
        color: props.textColor,
        ellipsis: '…',
        formatter: v => v
      },
      axisLine: {
        lineStyle: { color: props.textColor }
      }
    },
    series: hasFig
      ? [
        {
          name: t('message.figurative'),
          type: 'bar',
          stack: 'one',
          barWidth: '60%',
          data: topData.map(d => (d.figurative ? d.count : 0))
        },
        {
          name: t('message.nonfigurative'),
          type: 'bar',
          stack: 'one',
          barWidth: '60%',
          data: topData.map(d => (!d.figurative ? d.count : 0))
        }
      ]
      : [
        {
          type: 'bar',
          barWidth: '60%',
          data: topData.map(d => d.count)
        }
      ],
    emphasis: { disabled: true },

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

watch(() => [props.data, props.textColor], rebuild, { immediate: true })

async function downloadImage() {
  const name = (props.title || 'chart') + '.png'
  const exportWidth = 800
  const exportHeight = Math.max(MIN_CHART_HEIGHT, BAR_H * Math.min(TOP_N, props.data.length))

  const inst = chartRef.value?.chart
  const useOffscreen = isMobile.value || !inst

  if (useOffscreen) { //mobile - render offscreen
    const blobUrl = await exportOffscreenPNG(option.value, exportWidth, exportHeight)
    save(blobUrl, name)
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1500)
  } else { //desktop - use existing instance
    const dataUrl = inst.getDataURL({ type: 'image/png', background: '#fff', pixelRatio: 12 })
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
          const dataUrl = inst.getDataURL({ type: 'image/png', background: '#fff', pixelRatio: 12 })
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

.btn-row-title {
  margin-right: 0.25rem;
  font-weight: 500;
  color: var(--page-text);
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