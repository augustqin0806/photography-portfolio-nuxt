import 'nuxt'

declare module 'nuxt' {
  interface NuxtConfig {
    colorMode?: {
      classSuffix?: string
      fallback?: string
      storageKey?: string
    }
  }
}
