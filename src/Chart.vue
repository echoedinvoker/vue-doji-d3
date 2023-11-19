<template>
  <svg :width="svgWidth" :height="svgHeight">
    <g
      class="graph"
      :width="graphWidth"
      :height="graphHeight"
      :transform="`translate(${margin.left}, ${margin.top})`"
    >
      <path class="line"></path>
      <!-- <g class="dotted-line"></g> -->
      <g class="dotted-line" style="opacity: 0;">
        <line class="x-line" style="stroke: rgb(168, 162, 158); stroke-width: 1; stroke-dasharray: 4;"></line>
        <line class="y-line" style="stroke: rgb(168, 162, 158); stroke-width: 1; stroke-dasharray: 4;"></line>

      </g>
      <g class="x-axis" :transform="`translate(0, ${graphHeight})`"></g>
      <g class="y-axis"></g>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { collection, onSnapshot } from 'firebase/firestore';
import { ref, onMounted, watch, computed, reactive } from 'vue';
import { db } from './firebase';
import { scaleTime, scaleLinear, extent, max, axisBottom, axisLeft, select, timeFormat, line } from 'd3'

const props = defineProps<{
  activity: string
}>()

const svgWidth = 560
const svgHeight = 400
const margin = { top: 40, right: 20, bottom: 50, left: 100 }
const graphWidth = svgWidth - margin.left - margin.right
const graphHeight = svgHeight - margin.top - margin.bottom

const x = scaleTime().range([0, graphWidth])
const y = scaleLinear().range([graphHeight, 0])


const state = ref<ActivityWithId[]>([])
const filteredState = computed(() => state.value
  .filter(d => d.activity === props.activity)
  .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
)
const completedX = computed(() => x.domain(extent(filteredState.value, d => new Date(d.date)) as [Date, Date]))
const completedY = computed(() => y.domain([0, max(filteredState.value, d => d.distance) as number]))
const axesScale = reactive({x: completedX, y: completedY})
    
const lineGenerator = computed(() => line()
  .x(function(d: any) { return completedX.value(new Date(d.date)) } as any)
  .y(function(d: any) { return completedY.value(d.distance) } as any)
)

function reducer(state: any, action: Action ) {
  switch (action.type) {
    case 'added':
      return [ ...state, action.payload ]
    case "modified":
      return state.map((d: ActivityWithId) => d.id === action.payload.id ? action.payload : d)
    case "removed":
      return state.filter((d: ActivityWithId) => d.id !== action.payload)
    default:
      throw new Error('Unknown type')
  }
}

function dispatch(action: Action) { state.value = reducer(state.value, action) }

watch([state, () => props.activity], () => {
  select('.line').data([filteredState.value])
    .attr('d', lineGenerator.value as any)
})

watch([state, () => props.activity], () => {
  const circles = select('.graph').selectAll('circle').data(filteredState.value)

  circles.exit().remove()

  circles
    .attr('cx', d => completedX.value(new Date(d.date)))
    .attr('cy', d => completedY.value(d.distance))
    .attr('data-xy', d => `${d.date}, ${d.distance}`)

  circles.enter().append('circle')
    .attr('r', 4)
    .attr('cx', d => completedX.value(new Date(d.date)))
    .attr('cy', d => completedY.value(d.distance))
    .on('mouseover', function(_, d) {
      select(this).transition().duration(100)
        .attr('r', 8)
      // select('.dotted-line').append('line')
      select('.x-line')
        .attr('x1', 0)
        .attr('y1', () => completedY.value(d.distance))
        .attr('x2', () => completedX.value(new Date(d.date)))
        .attr('y2', () => completedY.value(d.distance))
      // select('.dotted-line').append('line')
      select('.y-line')
        .attr('x1', () => completedX.value(new Date(d.date)))
        .attr('y1', graphHeight)
        .attr('x2', () => completedX.value(new Date(d.date)))
        .attr('y2', () => completedY.value(d.distance))

      select('.dotted-line').style('opacity', 1)
    })
    .on('mouseleave', function() {
      select(this).transition().duration(100)
        .attr('r', 4)
      // select('.dotted-line').selectAll('line').remove()
      select('.dotted-line').style('opacity', 0)
    })
})

watch(axesScale, () => {
  const xAxis = axisBottom(completedX.value as any).ticks(4).tickFormat(timeFormat('%y %b %d') as any)
  const yAxis = axisLeft(completedY.value as any).ticks(4).tickFormat(d => `${d}m`)

  select('.x-axis').call(xAxis as any)
  select('.y-axis').call(yAxis as any)
})

onMounted(() => {
    onSnapshot(collection(db, "activities"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        switch (change.type) {
          case "added":
            const newitem = { ...change.doc.data(), id: change.doc.id };
            dispatch({ type: "added", payload: newitem });
            break;
          case "modified":
            const modifieditem = { ...change.doc.data(), id: change.doc.id };
            dispatch({ type: "modified", payload: modifieditem });
            break;
          case "removed":
            dispatch({ type: "removed", payload: change.doc.id });
            break;
          default:
            break;
        }
      });
    });

})
</script>
