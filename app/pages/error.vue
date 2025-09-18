<script setup lang="ts">
import type { NuxtError } from 'nuxt/app'

const props = withDefaults(
  defineProps<{
    error?: NuxtError
  }>(),
  { error: () => ({ statusCode: 500, message: 'Internal Error' }) as NuxtError }
)
</script>

<template>
    <div class="text-center mt-20">
        <h1 class="text-6xl font-bold">{{ props.error.statusCode }}</h1>
        <p class="text-xl mt-4">{{ props.error.message }}</p>
        <NuxtLink to="/" class="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Go back home
        </NuxtLink>
    </div>
</template>
