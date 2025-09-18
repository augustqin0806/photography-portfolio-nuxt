// plugins/masonry.client.ts
import Masonry from 'masonry-layout';
import { defineNuxtPlugin } from 'nuxt/app';
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('Masonry', Masonry);
});
