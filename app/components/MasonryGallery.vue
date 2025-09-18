<template>
  <section class="text-neutral-700">
    <div class="container w-full px-4 mx-auto max-w-full overflow-x-hidden">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-700"></div>
      </div>

      <!-- Masonry 瀑布流网格 -->
      <div v-else ref="masonryContainer" class="masonry-container w-full">
        <div v-for="(image, index) in images" :key="index" class="masonry-item" :style="{ width: `${itemWidth}px` }">
          <div class="relative overflow-hidden rounded-lg shadow-lg">
            <a :href="image.src" data-fancybox="masonry-gallery" class="block relative overflow-hidden caption"
              :data-caption="formatExif(image.exif)">
              <!-- BlurHash 占位符 -->
              <canvas v-if="!imageLoaded[index]" :ref="el => setCanvasRef(el, index)"
                class="w-full h-auto block blur-sm" :style="{ aspectRatio: `${image.width}/${image.height}` }"></canvas>

              <!-- 实际图片 -->
              <img :src="image.src" :alt="image.alt" :style="{ aspectRatio: `${image.width}/${image.height}` }"
                class="w-full h-auto object-cover max-w-full transition-transform duration-500 ease-in-out transform hover:scale-105"
                :class="imageLoaded[index] ? 'opacity-100 animate-fade-in' : 'opacity-0 absolute inset-0'"
                @load="onImageLoad(index)" @error="onImageError(index)" />

              <!-- 版权信息 -->
              <div v-if="image.copyright"
                class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <p class="text-white text-xs font-medium">{{ image.copyright }}</p>
              </div>
            </a>
          </div>

        </div>
      </div>

      <!-- 错误状态 -->
      <div v-if="error" class="text-center py-20">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div class="flex items-center mb-4">
            <svg class="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 class="text-red-800 font-medium">加载失败</h3>
          </div>
          <p class="text-red-600 mb-4">{{ error }}</p>
          <button @click="loadImages"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium">
            重新加载
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive, nextTick, onUnmounted } from 'vue';
import { decode } from 'blurhash';
import { useRuntimeConfig } from 'nuxt/app';

// 动态导入以避免SSR问题
let Masonry: any = null;
let imagesLoaded: any = null;

interface ImageItem {
  src: string;
  blurhash: string;
  width: number;
  height: number;
  alt: string;
  copyright?: string;
}

const images = ref<any[]>([])
const loading = ref(true);
const error = ref('');
const imageLoaded = reactive<Record<number, boolean>>({});
const canvasRefs = reactive<Record<number, HTMLCanvasElement | null>>({});
const masonryContainer = ref<HTMLElement | null>(null);
const itemWidth = ref(300);

let masonryInstance: Masonry | null = null;
let resizeTimeout: NodeJS.Timeout | null = null;

// 计算项目宽度
const calculateItemWidth = () => {
  // 在服务端渲染时使用默认值
  if (!process.client) {
    itemWidth.value = 300;
    return;
  }

  const screenWidth = window.innerWidth;
  console.log(screenWidth)
  // 减少容器padding，为移动端留出更少的边距
  const containerPadding = screenWidth < 640 ? 16 : 32; // 手机端减少padding
  const containerWidth = screenWidth - containerPadding;

  let columns: number;
  let gap: number;

  // 根据屏幕尺寸设置不同的参数
  if (screenWidth < 640) {
    // 手机端：单列布局
    columns = 1;
    gap = 0; // 手机端不需要间隙
  } else if (screenWidth < 768) {
    // 小平板：双列布局
    columns = 2;
    gap = 12;
  } else if (screenWidth < 1024) {
    // 平板端：双列或三列布局
    columns = 2;
    gap = 16;
  } else if (screenWidth < 1536) {
    // 桌面端：三列布局
    columns = 3;
    gap = 16;
  } else {
    // 大屏幕：四列布局
    columns = 4;
    gap = 20;
  }

  // 计算实际项目宽度
  const totalGapWidth = (columns - 1) * gap;
  const availableWidth = containerWidth - totalGapWidth;
  const calculatedWidth = Math.floor(availableWidth / columns);

  // 设置最小和最大宽度限制
  let minWidth = 200;
  let maxWidth = 450;

  if (screenWidth < 640) {
    minWidth = Math.max(200, containerWidth * 0.95); // 手机端使用95%的容器宽度
    maxWidth = containerWidth;
  }

  // 确保宽度在合理范围内
  itemWidth.value = Math.min(maxWidth, Math.max(minWidth, calculatedWidth));

  console.log('屏幕宽度:', screenWidth, '容器宽度:', containerWidth, '列数:', columns, '项目宽度:', itemWidth.value);
};

// 设置canvas引用
const setCanvasRef = (el: HTMLCanvasElement | null, index: number) => {
  if (el) {
    canvasRefs[index] = el;
    const image = images.value[index];
    if (image && image.blurhash) {
      renderBlurHash(el, image.blurhash, image.width, image.height);
    }
  }
};

// 渲染BlurHash占位符
const renderBlurHash = (
  canvas: HTMLCanvasElement,
  hash: string,
  width: number,
  height: number
) => {
  try {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.warn(" Canvas context 获取失败");
      return;
    }

    const aspectRatio = width / height;
    const canvasWidth = 64;
    const canvasHeight = Math.max(32, Math.round(canvasWidth / aspectRatio));

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // console.log(" 开始解码 BlurHash:", hash, "尺寸:", canvasWidth, canvasHeight);

    const pixels = decode(hash, canvasWidth, canvasHeight);
    // console.log("pixels:", pixels.slice(0, 20));

    const imageData = ctx.createImageData(canvasWidth, canvasHeight);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);

    // console.log("BlurHash 渲染完成:", canvas);
  } catch (err) {
    console.warn(" BlurHash 渲染失败:", err);
  }
};


// 初始化Masonry
const initMasonry = async () => {
  if (!masonryContainer.value || !process.client) return;

  try {
    // 动态导入Masonry，避免SSR问题
    if (!Masonry) {
      console.log("使用")
      const { default: MasonryClass } = await import('masonry-layout');
      Masonry = MasonryClass;
    }

    const screenWidth = window.innerWidth;
    const isMobile = screenWidth < 640;
    const gap = isMobile ? 0 : (screenWidth < 768 ? 12 : 16);

    masonryInstance = new Masonry(masonryContainer.value, {
      itemSelector: '.masonry-item',
      columnWidth: itemWidth.value,
      gutter: gap,
      fitWidth: true, // 始终使用fitWidth来居中内容
      horizontalOrder: true,
      transitionDuration: '0.3s'
    });

    console.log('Masonry初始化完成，手机端模式:', isMobile, '项目宽度:', itemWidth.value, '间隙:', gap);
  } catch (error) {
    console.error('初始化Masonry失败:', error);
  }
};

// 重新布局Masonry
const relayoutMasonry = () => {
  if (masonryInstance) {
    masonryInstance.reloadItems();
    masonryInstance.layout();
  }
};

// 图片加载完成处理
const onImageLoad = (index: number) => {
  imageLoaded[index] = true;

  // 图片加载完成后重新布局
  nextTick(() => {
    if (masonryInstance) {
      masonryInstance.layout();
    }
  });
};

// 图片加载错误处理
const onImageError = (index: number) => {
  console.warn(`图片加载失败: ${images.value[index]?.src}`);
  imageLoaded[index] = true;

  nextTick(() => {
    if (masonryInstance) {
      masonryInstance.layout();
    }
  });
};

// 防抖的窗口大小变化处理
const handleResize = () => {
  if (!process.client) return;

  // 清除之前的定时器
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }

  // 使用防抖来避免频繁重新计算
  resizeTimeout = setTimeout(() => {
    const oldWidth = itemWidth.value;
    calculateItemWidth();

    // 只有当宽度真正改变时才重新初始化
    if (Math.abs(oldWidth - itemWidth.value) > 10) {
      if (masonryInstance) {
        masonryInstance.destroy();
        masonryInstance = null;
      }

      nextTick(async () => {
        await initMasonry();
      });
    }
  }, 150);
};
interface StrapiImage {
  id: number
  url: string
  width: number
  height: number
  provider_metadata?: {
    blurHash?: string
  }
  alternativeText?: string
}

interface GalleryItem {
  id: number
  title: string
  copyright?: string
  image: StrapiImage
}

interface StrapiResponse {
  data: GalleryItem[]
}

interface LocalImage {
  exif: string;
  url: string
  blurHash?: string
  width?: number
  height?: number
  alt?: string
  copyright?: string
}


// const STRAPI_BASE_URL = 'http://localhost:1337'
const { public: { strapiBaseUrl } } = useRuntimeConfig()
const STRAPI_BASE_URL = strapiBaseUrl;
/** 加载本地 JSON */
const loadLocalImages = async () => {
  const res = await fetch('/photos.json')
  if (!res.ok) throw new Error(`获取本地照片数据失败: ${res.status}`)

  const list: LocalImage[] = await res.json()
  return list.map((item, index) => ({
    src: item.url,
    blurhash: item.blurHash,
    width: item.width || 800,
    height: item.height || 600,
    alt: item.alt || `相册图片 ${index + 1}`,
    copyright: item.copyright || '',
    exif: item.exif || ''
  }))
}
/** 加载 Strapi API 数据 */
const loadPhotosFromApi = async () => {
  const response = await $fetch<StrapiResponse>(
    // `${STRAPI_BASE_URL}/api/Article?populate=*`
    `${STRAPI_BASE_URL}/api/galleries?populate=image`
  )

  // 获取到数据后返回
  return response.data.map(item => ({
    src: `${STRAPI_BASE_URL}${item.image?.url}`,
    width: item.image?.width,
    height: item.image?.height,
    blurhash: item.image?.provider_metadata?.blurHash,
    alt: item.image?.alternativeText || item.title,
    copyright: item.copyright,
  }))
}

/** 统一加载逻辑 */
const loadImages = async () => {
  loading.value = true
  error.value = ''

  try {
    const [local, api] = await Promise.all([
      loadLocalImages(),
      loadPhotosFromApi(),
    ])



    // 合并本地和 API 图片
    images.value = [...api, ...local]
    // 初始化加载状态
    images.value.forEach((_, index) => {
      imageLoaded[index] = false
    })

    await nextTick()
    if (process.client) {
      await initMasonryWithImagesLoaded()
    }
  } catch (err: any) {
    console.error('加载图片失败:', err)
    error.value = err.message || '加载图片时发生未知错误'
  } finally {
    loading.value = false
  }
}


const initMasonryWithImagesLoaded = async () => {
  await initMasonry()

  if (masonryContainer.value) {
    try {
      if (!imagesLoaded) {
        const { default: imagesLoadedLib } = await import('imagesloaded')
        imagesLoaded = imagesLoadedLib
      }

      imagesLoaded(masonryContainer.value, () => {
        relayoutMasonry()
      })
    } catch (error) {
      console.error('imagesLoaded加载失败:', error)
      setTimeout(() => relayoutMasonry(), 1000)
    }
  }
}
interface ExifData {
  cameraModel?: string;
  iso?: number;
  focalLength?: number;
  dateTime?: string;
  gps?: {
    latitude?: number;
    longitude?: number;
  };
}

function formatExif(exif?: ExifData): string {
  if (!exif) return '';

  const parts: string[] = [];

  if (exif.cameraModel) parts.push(exif.cameraModel);
  if (exif.iso) parts.push(`ISO ${exif.iso}`);
  if (exif.focalLength) parts.push(`f/${exif.focalLength}`);
  if (exif.dateTime) parts.push(exif.dateTime);

  if (exif.gps?.latitude != null && exif.gps?.longitude != null) {
    parts.push(`GPS: ${exif.gps.latitude.toFixed(5)},${exif.gps.longitude.toFixed(5)}`);
  }

  return parts.join(', ');
}


onMounted(() => {
  calculateItemWidth();

  // 只在客户端添加事件监听器
  if (process.client) {
    window.addEventListener('resize', handleResize);
  }

  loadImages();
});

onUnmounted(() => {
  // 清理定时器
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }

  // 只在客户端移除事件监听器
  if (process.client) {
    window.removeEventListener('resize', handleResize);
    if (masonryInstance) {
      masonryInstance.destroy();
    }
  }
});
</script>

<style scoped>
.masonry-container {
  margin: 0 auto;
  width: 100%;
  max-width: 100%;
}

.masonry-item {
  margin-bottom: 16px;
  box-sizing: border-box;
}

/* 确保图片在容器中正确显示 */
.masonry-item img {
  width: 100%;
  height: auto;
  display: block;
  max-width: 100%;
}

.masonry-item canvas {
  width: 100%;
  height: auto;
  display: block;
  max-width: 100%;
}

/* 加载动画 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.masonry-item {
  animation: slideInUp 0.6s ease-out;
}

/* 为不同索引的项目添加延迟动画 */
.masonry-item:nth-child(odd) {
  animation-delay: 0.1s;
}

.masonry-item:nth-child(even) {
  animation-delay: 0.2s;
}

/* 悬停效果 */
.masonry-item:hover img {
  transform: scale(1.02);
}

/* 响应式调整 */
@media (max-width: 640px) {
  .container {
    padding-left: 8px;
    padding-right: 8px;
  }

  .masonry-container {
    padding: 0;
    width: 100%;
  }

  .masonry-item {
    margin-bottom: 8px;
    width: 100% !important;
  }

  /* 手机端禁用悬停效果 */
  .masonry-item:hover img {
    transform: none;
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  .masonry-container {
    padding: 0 6px;
  }

  .masonry-item {
    margin-bottom: 12px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .masonry-container {
    padding: 0 8px;
  }
}

/* 防止水平滚动条 */
* {
  box-sizing: border-box;
}

body,
html {
  overflow-x: hidden;
}
</style>