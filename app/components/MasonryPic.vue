<template>
    <div class="masonry-gallery">
        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p class="loading-text">Loading photos...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-container">
            <div class="error-content">
                <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="error-title">Failed to load photos</h3>
                <p class="error-message">{{ error }}</p>
                <button @click="loadPhotos" class="retry-button">
                    Try Again
                </button>
            </div>
        </div>

        <!-- Masonry Grid -->
        <div v-else ref="masonryContainer" class="masonry-container">
            <div v-for="(photo, index) in photos" :key="`photo-${index}`" class="masonry-item"
                :style="{ width: `${itemWidth}px` }">
                <div class="photo-card cursor-pointer" @click="openGallery(index)">
                    <!-- Blur Hash Placeholder -->
                    <canvas v-if="!imageLoaded[index] && photo.blurhash" :ref="el => setCanvasRef(el, index)"
                        class="blur-placeholder" :style="{ aspectRatio: `${photo.width}/${photo.height}` }" />

                    <!-- Main Image -->
                    <img :src="photo.src" :alt="photo.alt" :style="{ aspectRatio: `${photo.width}/${photo.height}` }"
                        class="photo-image" :class="{ 'loaded': imageLoaded[index] }" @load="onImageLoad(index)"
                        @error="onImageError(index)" loading="lazy" />

                    <!-- Hover Overlay -->
                    <div class="photo-overlay">
                        <div class="overlay-content">
                            <svg class="zoom-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <!-- Copyright Info -->
                    <div v-if="photo.copyright" class="photo-copyright">
                        <p>{{ photo.copyright }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div id="lightgallery-container"></div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import lightGallery from 'lightgallery'
import lgZoom from 'lightgallery/plugins/zoom'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
// Props
const props = defineProps({
    apiEndpoint: {
        type: String,
        default: '/photos.json'
    },
    minItemWidth: {
        type: Number,
        default: 250
    },
    maxItemWidth: {
        type: Number,
        default: 400
    },
    gap: {
        type: Number,
        default: 16
    }
})

// Reactive data
const photos = ref([])
const loading = ref(true)
const error = ref('')
const imageLoaded = reactive({})
const canvasRefs = reactive({})
const masonryContainer = ref(null)
const itemWidth = ref(300)

// Masonry instance
let masonryInstance = null
let resizeTimeout = null

// Dynamic imports for client-side only
let Masonry = null
let imagesLoaded = null
let blurhash = null

// Load Masonry (always use pkgd build)
const loadMasonry = async () => {
    if (process.server) return null

    try {
        await loadMasonryFromLocal()
        return window.Masonry
    } catch (error) {
        console.error('Failed to load local Masonry:', error)
    }

}

// 从本地 public 目录加载 pkgd 版
const loadMasonryFromLocal = () => {
    return new Promise((resolve, reject) => {
        if (typeof window.Masonry !== 'undefined') {
            resolve(window.Masonry)
            return
        }

        const script = document.createElement('script')
        script.src = '/lib/masonry.pkgd.min.js'   // 本地路径
        script.onload = () => resolve(window.Masonry)
        script.onerror = reject
        document.head.appendChild(script)
    })
}


// Load imagesLoaded with proper error handling
const loadImagesLoaded = async () => {
    if (process.server) return null

    try {
        const imagesLoadedModule = await import('imagesloaded')
        return imagesLoadedModule.default || imagesLoadedModule
    } catch (error) {
        console.warn('imagesLoaded library not available:', error)
        return null
    }
}

// Load blurhash with proper error handling
const loadBlurhash = async () => {
    if (process.server) return null

    try {
        const blurhashModule = await import('blurhash')
        return blurhashModule
    } catch (error) {
        console.warn('Blurhash library not available:', error)
        return null
    }
}
const calculateItemWidth = () => {
    if (process.server) {
        itemWidth.value = props.minItemWidth
        return
    }

    const screenWidth = window.innerWidth
    const containerPadding = screenWidth < 640 ? 0 : 32  // mobile: no extra padding
    const containerWidth = screenWidth - containerPadding

    let columns
    let gutter

    if (screenWidth < 640) {
        // Mobile: single column, full width
        columns = 1
        gutter = 0
    } else if (screenWidth < 768) {
        columns = 2
        gutter = 12
    } else if (screenWidth < 1024) {
        columns = containerWidth > 600 ? 3 : 2
        gutter = props.gap
    } else if (screenWidth < 1536) {
        columns = containerWidth > 1000 ? 4 : 3
        gutter = props.gap
    } else {
        columns = Math.min(5, Math.floor(containerWidth / props.minItemWidth))
        gutter = props.gap
    }

    const totalGutter = (columns - 1) * gutter
    const availableWidth = containerWidth - totalGutter
    const calculatedWidth = Math.floor(availableWidth / columns)

    itemWidth.value = Math.min(
        props.maxItemWidth,
        Math.max(props.minItemWidth, calculatedWidth)
    )
}

// // Calculate responsive item width
// const calculateItemWidth = () => {
//     if (process.server) {
//         itemWidth.value = props.minItemWidth
//         return
//     }

//     const screenWidth = window.innerWidth
//     const containerPadding = screenWidth < 640 ? 16 : 32
//     const containerWidth = screenWidth - containerPadding

//     let columns
//     let gutter

//     // Responsive breakpoints
//     if (screenWidth < 640) {
//         // Mobile: single column
//         columns = 1
//         gutter = 8
//     } else if (screenWidth < 768) {
//         // Small tablet: 2 columns
//         columns = 2
//         gutter = 12
//     } else if (screenWidth < 1024) {
//         // Tablet: 2-3 columns
//         columns = containerWidth > 600 ? 3 : 2
//         gutter = props.gap
//     } else if (screenWidth < 1536) {
//         // Desktop: 3-4 columns
//         columns = containerWidth > 1000 ? 4 : 3
//         gutter = props.gap
//     } else {
//         // Large desktop: 4-5 columns
//         columns = Math.min(5, Math.floor(containerWidth / props.minItemWidth))
//         gutter = props.gap
//     }

//     // Calculate item width
//     const totalGutter = (columns - 1) * gutter
//     const availableWidth = containerWidth - totalGutter
//     const calculatedWidth = Math.floor(availableWidth / columns)

//     // Apply min/max constraints
//     itemWidth.value = Math.min(
//         props.maxItemWidth,
//         Math.max(props.minItemWidth, calculatedWidth)
//     )

//     // Special case for mobile - use almost full width
//     if (screenWidth < 640) {
//         itemWidth.value = Math.min(containerWidth - 16, calculatedWidth)
//     }
// }

// Set canvas reference and render blurhash
const setCanvasRef = (el, index) => {
    if (el && photos.value[index]) {
        canvasRefs[index] = el
        renderBlurHash(el, photos.value[index])
    }
}

// Render blurhash placeholder
const renderBlurHash = async (canvas, photo) => {
    if (!photo.blurhash || process.server) return

    try {
        if (!blurhash) {
            blurhash = await loadBlurhash()
        }

        if (!blurhash) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const aspectRatio = photo.width / photo.height
        const canvasWidth = 64
        const canvasHeight = Math.round(canvasWidth / aspectRatio)

        canvas.width = canvasWidth
        canvas.height = canvasHeight

        const pixels = blurhash.decode(photo.blurhash, canvasWidth, canvasHeight)
        const imageData = ctx.createImageData(canvasWidth, canvasHeight)
        imageData.data.set(pixels)
        ctx.putImageData(imageData, 0, 0)
    } catch (err) {
        console.warn('BlurHash rendering failed:', err)
    }
}

// // Initialize Masonry layout
// const initMasonry = async () => {
//     if (process.server || !masonryContainer.value) return

//     try {
//         if (!Masonry) {
//             Masonry = await loadMasonry()
//         }

//         if (!Masonry) {
//             throw new Error('Masonry library could not be loaded')
//         }

//         const isMobile = window.innerWidth < 640
//         const gutter = isMobile ? 8 : props.gap

//         // Destroy existing instance
//         if (masonryInstance) {
//             masonryInstance.destroy()
//         }

//         masonryInstance = new Masonry(masonryContainer.value, {
//             itemSelector: '.masonry-item',
//             columnWidth: itemWidth.value,
//             gutter: gutter,
//             fitWidth: true,
//             horizontalOrder: true,
//             transitionDuration: '0.3s'
//         })

//         // Wait for images to load, then relayout
//         await nextTick()
//         setTimeout(() => {
//             if (masonryInstance) {
//                 masonryInstance.layout()
//             }
//         }, 100)

//         // Setup imagesLoaded if available
//         if (!imagesLoaded) {
//             imagesLoaded = await loadImagesLoaded()
//         }

//         if (imagesLoaded && masonryContainer.value) {
//             imagesLoaded(masonryContainer.value, () => {
//                 relayoutMasonry()
//             })
//         }

//     } catch (err) {
//         console.error('Failed to initialize Masonry:', err)
//         // Continue without Masonry - fallback to simple grid
//     }
// }
const initMasonry = async () => {
    if (process.server || !masonryContainer.value) return

    try {
        if (!Masonry) {
            Masonry = await loadMasonry()
        }
        if (!Masonry) throw new Error('Masonry library could not be loaded')

        const screenWidth = window.innerWidth
        const isMobile = screenWidth < 640
        const gutter = isMobile ? 0 : props.gap

        if (masonryInstance) masonryInstance.destroy()

        masonryInstance = new Masonry(masonryContainer.value, {
            itemSelector: '.masonry-item',
            columnWidth: itemWidth.value,
            gutter,
            fitWidth: !isMobile,  // center grid only on desktop
            horizontalOrder: true,
            transitionDuration: '0.3s'
        })

        await nextTick()
        setTimeout(() => {
            masonryInstance?.layout()
        }, 50)

        if (!imagesLoaded) imagesLoaded = await loadImagesLoaded()
        if (imagesLoaded && masonryContainer.value) {
            imagesLoaded(masonryContainer.value, () => relayoutMasonry())
        }

    } catch (err) {
        console.error('Failed to initialize Masonry:', err)
    }
}

// Relayout masonry
const relayoutMasonry = () => {
    if (masonryInstance) {
        masonryInstance.reloadItems()
        masonryInstance.layout()
    }
}

// Handle image load
const onImageLoad = (index) => {
    imageLoaded[index] = true
    nextTick(() => {
        relayoutMasonry()
    })
}

// Handle image error
const onImageError = (index) => {
    console.warn(`Failed to load image: ${photos.value[index]?.src}`)
    imageLoaded[index] = true
    nextTick(() => {
        relayoutMasonry()
    })
}

// Handle window resize with debounce
const handleResize = () => {
    if (process.server) return

    if (resizeTimeout) {
        clearTimeout(resizeTimeout)
    }

    resizeTimeout = setTimeout(async () => {
        const oldWidth = itemWidth.value
        calculateItemWidth()

        // Only reinitialize if width changed significantly
        if (Math.abs(oldWidth - itemWidth.value) > 10) {
            await initMasonry()
        }
    }, 200)
}

// Load photos from API
const loadPhotos = async () => {
    loading.value = true
    error.value = ''

    try {
        const response = await $fetch(props.apiEndpoint)
        const data = response.data || response

        photos.value = (Array.isArray(data) ? data : []).map((item, index) => ({
            src: item.url || item.src,
            blurhash: item.blurHash || item.blurhash,
            width: item.width || 800,
            height: item.height || 600,
            alt: item.alt || `Photo ${index + 1}`,
            copyright: item.copyright || '',
        }))

        // Initialize image loaded state
        photos.value.forEach((_, index) => {
            imageLoaded[index] = false
        })

        await nextTick()

        // Initialize masonry on client side
        if (process.client) {
            setTimeout(async () => {
                await initMasonry()
            }, 50)
        }

    } catch (err) {
        console.error('Failed to load photos:', err)
        error.value = err.message || 'An unexpected error occurred'
    } finally {
        loading.value = false
    }
}
const galleryElement = ref(null)
const galleryInstance = ref(null)
function openGallery(index) {
    if (!galleryInstance.value) {
        console.warn('LightGallery 实例未准备好')
        return
    }
    galleryInstance.value.openGallery(index)
}
// Lifecycle hooks
onMounted(async () => {

    calculateItemWidth()

    if (process.client) {
        window.addEventListener('resize', handleResize, { passive: true })
    }

    await loadPhotos()

    galleryElement.value = document.getElementById('lightgallery-container')
    const lightboxItems = photos.value.map(photo => ({
        src: photo.url || photo.src,
        thumb: photo.url || photo.src,
        subHtml: `<h4>${photo.alt || photo.title}</h4>`
    }))
    galleryInstance.value = lightGallery(galleryElement.value, {
        dynamic: true,
        plugins: [lgZoom, lgThumbnail],
        dynamicEl: lightboxItems,
    })
})

onUnmounted(() => {
    if (resizeTimeout) {
        clearTimeout(resizeTimeout)
    }

    if (process.client) {
        window.removeEventListener('resize', handleResize)
        if (masonryInstance) {
            masonryInstance.destroy()
        }
    }
})
</script>

<style scoped>
.masonry-gallery {
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
}

/* Loading State */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 0;
    text-align: center;
}

.loading-spinner {
    width: 3rem;
    height: 3rem;
    border: 3px solid #e5e7eb;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
}

.loading-text {
    color: #6b7280;
    font-size: 1.125rem;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* Error State */
.error-container {
    display: flex;
    justify-content: center;
    padding: 4rem 0;
}

.error-content {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 0.75rem;
    padding: 2rem;
    max-width: 28rem;
    text-align: center;
}

.error-icon {
    width: 2rem;
    height: 2rem;
    color: #ef4444;
    margin: 0 auto 1rem;
}

.error-title {
    color: #991b1b;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.error-message {
    color: #dc2626;
    margin-bottom: 1.5rem;
}

.retry-button {
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 0.5rem;
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
}

.retry-button:hover {
    background: #dc2626;
}

/* Masonry Container */
.masonry-container {
    margin: 0 auto;
    width: 100%;
    max-width: 100%;
}

/* Masonry Items */
.masonry-item {
    margin-bottom: 1rem;
    box-sizing: border-box;
}

.photo-card {
    position: relative;
    overflow: hidden;
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.photo-card:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    transform: translateY(-4px);
}

/* Images and Placeholders */
.blur-placeholder,
.photo-image {
    width: 100%;
    height: auto;
    display: block;
    max-width: 100%;
}

.blur-placeholder {
    filter: blur(4px);
}

.photo-image {
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.5s ease;
}

.photo-image.loaded {
    opacity: 1;
}

/* Hover Overlay */
.photo-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s ease;
}

.photo-card:hover .photo-overlay {
    background: rgba(0, 0, 0, 0.2);
}

.overlay-content {
    color: white;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.photo-card:hover .overlay-content {
    opacity: 1;
}

.zoom-icon {
    width: 2rem;
    height: 2rem;
}

/* Copyright */
.photo-copyright {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    padding: 1rem;
}

.photo-copyright p {
    color: white;
    font-size: 0.75rem;
    font-weight: 500;
    margin: 0;
}

/* Responsive Styles */
@media (max-width: 640px) {
    /* .masonry-item {
        margin-bottom: 0.75rem;
    }

    .photo-card:hover {
        transform: none;
    }

    .photo-overlay {
        display: none;
    } */
    @media (max-width: 640px) {
        .masonry-container {
            width: 100%;
            max-width: 100%;
            padding: 0;
        }

        .masonry-item {
            width: 100%;
            max-width: 100%;
            margin-bottom: 0.75rem;
        }

        .photo-image,
        .blur-placeholder {
            width: 100%;
            display: block;
        }

        .photo-overlay {
            display: none;
        }

        .photo-card:hover {
            transform: none;
        }
    }

}

@media (min-width: 641px) and (max-width: 768px) {
    .masonry-item {
        margin-bottom: 0.875rem;
    }
}

/* Prevent horizontal scroll */
* {
    box-sizing: border-box;
}

html,
body {
    overflow-x: hidden;
}

/* Fallback grid layout if Masonry fails to load */
.masonry-container:not(.masonry-enabled) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
}

@media (max-width: 640px) {
    .masonry-container:not(.masonry-enabled) {
        grid-template-columns: 1fr;
    }
}
</style>