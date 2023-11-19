<template>
  <div class="bg-stone-900 p-3 flex flex-col gap-3 rounded-lg">
    <div class="flex-grow flex justify-between gap-3">
      <div class="flex-grow flex flex-col gap-3 p-3">
        <button class="btn" :class="{ 'bg-cyan-400 text-cyan-800': act === state.activity }"
          v-for="act in ['cycling', 'running', 'swimming', 'walking']" :key="act" @click="handleClick">
          {{ act }}
        </button>
      </div>
      <div class="bg-stone-700 rounded-lg m-2">
        <Chart :activity="state.activity" />
      </div>
    </div>
    <div class="flex-initial p-3 text-center">
      <form @submit.prevent="handleSubmit">
        <p class="font-semibold text-lg">How much <span>{{ state.activity }}</span> did you done.</p>
        <input v-model="state.distance" type="number" class="border-0 border-b border-stone-200 bg-transparent w-28"
          id="cycling" placeholder="Distance in m" :disabled="isAdding">
        <p class="text-red-500 text-sm italic mt-2" v-if="state.error">{{ state.error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAddActivity } from './hook/useAddActivity';
import Chart from './Chart.vue';

const initialState = { activity: 'cycling', distance: null as number | null, error: '' }


function reducer(state: any, action: Action ) {
  switch (action.type) {
    case 'click':
      return { ...state, activity: action.payload, error: '' }
    case 'submit-done':
      return { ...initialState, activity: state.activity }
    default:
      throw new Error('Unknown type')
  }
}

const state = ref(initialState)
const { addActivity, isAdding } = useAddActivity()

function dispatch(action: Action) { state.value = reducer(state.value, action) }

function handleClick(e: Event) {
  const target = e.target as HTMLButtonElement
  if (target.textContent) dispatch({ type: 'click', payload: target.textContent })
}

function handleSubmit() {
  if (state.value.distance && state.value.distance > 0) {
    addActivity({
      activity: state.value.activity,
      distance: state.value.distance,
      date: new Date().toISOString()
    },
      {
        onSettled: () => dispatch({ type: 'submit-done' }),
      }
    )
  }
}
</script>
