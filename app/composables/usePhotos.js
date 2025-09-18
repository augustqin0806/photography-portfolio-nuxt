
// composables/usePhotos.js - Optional composable for photo management
export const usePhotos = () => {
  const photos = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchPhotos = async (endpoint = '/api/photos') => {
    loading.value = true
    error.value = null

    try {
      const { data } = await $fetch(endpoint)
      photos.value = data || []
    } catch (err) {
      error.value = err.message || 'Failed to fetch photos'
      console.error('Error fetching photos:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    photos: readonly(photos),
    loading: readonly(loading),
    error: readonly(error),
    fetchPhotos
  }
}