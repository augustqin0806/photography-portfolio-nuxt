<template>
  <section class="text-neutral-700">
    <div class="container w-full px-4">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-700"></div>
      </div>
      
      <!-- 瀑布流网格 -->
      <div 
        v-else
        class="masonry-grid"
        :style="{ '--columns': columns }"
      >
        <div
          v-for="(image, index) in images"
          :key="index"
          class="masonry-item break-inside-avoid mb-4"
        >
          <div class="relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <a 
              :href="image.src" 
              data-fancybox="gallery"
              class="block relative"
            >
              <!-- BlurHash 占位符 -->
              <canvas
                v-if="!imageLoaded[index]"
                :ref="el => setCanvasRef(el, index)"
                class="w-full h-auto block"
                :style="{ aspectRatio: `${image.width}/${image.height}` }"
              ></canvas>
              
              <!-- 实际图片 -->
              <img
                :src="image.src"
                :alt="image.alt"
                :style="{ aspectRatio: `${image.width}/${image.height}` }"
                class="w-full h-auto object-cover transition-all duration-500 transform hover:scale-105"
                :class="imageLoaded[index] ? 'opacity-100' : 'opacity-0 absolute inset-0'"
                @load="onImageLoad(index)"
                @error="onImageError(index)"
              />
              
              <!-- 版权信息 -->
              <div 
                v-if="image.copyright" 
                class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3"
              >
                <p class="text-white text-xs">{{ image.copyright }}</p>
              </div>
            </a>
          </div>
        </div>
      </div>
      
      <!-- 错误状态 -->
      <div v-if="error" class="text-center py-20">
        <p class="text-red-500 mb-4">{{ error }}</p>
        <button 
          @click="loadImages" 
          class="px-4 py-2 bg-neutral-700 text-white rounded hover:bg-neutral-800 transition-colors"
        >
          重新加载
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive, nextTick, onUnmounted } from 'vue';
import { decode } from 'blurhash';

interface ImageItem {
  src: string;
  blurhash: string;
  width: number;
  height: number;
  alt: string;
  copyright?: string;
}

const images = ref<ImageItem[]>([]);
const loading = ref(true);
const error = ref('');
const imageLoaded = reactive<Record<number, boolean>>({});
const canvasRefs = reactive<Record<number, HTMLCanvasElement | null>>({});
const columns = ref(3);

// 设置canvas引用
const setCanvasRef = (el: HTMLCanvasElement | null, index: number) => {
  if (el) {
    canvasRefs[index] = el;
    // 如果图片数据已经加载，立即渲染BlurHash
    const image = images.value[index];
    if (image && image.blurhash) {
      console.log(`设置canvas引用并渲染BlurHash for 图片 ${index}:`, image.blurhash);
      renderBlurHash(el, image.blurhash, image.width, image.height);
    }
  }
};

// 响应式列数计算
const updateColumns = () => {
  const width = window.innerWidth;
  if (width < 640) {
    columns.value = 1;
  } else if (width < 1024) {
    columns.value = 2;
  } else if (width < 1536) {
    columns.value = 3;
  } else {
    columns.value = 4;
  }
};

// 渲染BlurHash占位符
const renderBlurHash = (canvas: HTMLCanvasElement, hash: string, width: number, height: number) => {
  try {
    console.log('渲染BlurHash:', hash, width, height); // 调试日志
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('无法获取canvas context');
      return;
    }

    // 设置canvas尺寸 - 使用更大的尺寸以获得更好的效果
    const aspectRatio = width / height;
    const canvasWidth = 64; // 增加尺寸
    const canvasHeight = Math.round(canvasWidth / aspectRatio);
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 解码BlurHash
    const pixels = decode(hash, canvasWidth, canvasHeight);
    const imageData = ctx.createImageData(canvasWidth, canvasHeight);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
    
    console.log('BlurHash渲染成功'); // 调试日志
  } catch (err) {
    console.error('BlurHash渲染失败:', err, 'Hash:', hash);
  }
};

// 图片加载完成处理
const onImageLoad = (index: number) => {
  imageLoaded[index] = true;
};

// 图片加载错误处理
const onImageError = (index: number) => {
  console.warn(`图片加载失败: ${images.value[index]?.src}`);
  imageLoaded[index] = true; // 即使失败也隐藏占位符
};

// 加载图片数据
const loadImages = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const res = await fetch('/photos.json');
    if (!res.ok) {
      throw new Error(`获取照片数据失败: ${res.status}`);
    }
    
    const list = await res.json();
    console.log('原始数据:', list.slice(0, 2)); // 调试：查看前两个项目的原始数据
    
    images.value = list.map((item: any, index: number) => ({
      src: item.url,
      blurhash: item.blurHash,
      width: item.width || 800,
      height: item.height || 600,
      alt: item.alt || `相册图片 ${index + 1}`,
      copyright: item.copyright || ''
    }));

    console.log('处理后的图片数据:', images.value.slice(0, 2)); // 调试：查看处理后的数据

    // 初始化加载状态
    images.value.forEach((_, index) => {
      imageLoaded[index] = false;
    });

    // 等待DOM更新后渲染BlurHash
    await nextTick();
    
    // 给一点额外时间让canvas元素完全渲染
    setTimeout(() => {
      images.value.forEach((image, index) => {
        const canvas = canvasRefs[index];
        if (canvas && image.blurhash) {
          // console.log(`为图片 ${index} 渲染BlurHash:`, image.blurhash);
          renderBlurHash(canvas, image.blurhash, image.width, image.height);
        } else {
          console.warn(`图片 ${index} 缺少canvas或blurhash:`, { canvas: !!canvas, blurhash: image.blurhash });
        }
      });
    }, 100);

  } catch (err) {
    console.error('加载图片失败:', err);
    error.value = err instanceof Error ? err.message : '加载图片时发生未知错误';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  updateColumns();
  window.addEventListener('resize', updateColumns);
  loadImages();
});

onUnmounted(() => {
  window.removeEventListener('resize', updateColumns);
});
</script>

<style scoped>
.masonry-grid {
  columns: var(--columns);
  column-gap: 1rem;
  column-fill: balance;
  max-width: 100%;
  overflow-x: hidden; /* 防止水平滚动 */
}

.masonry-item {
  display: inline-block;
  width: 100%;
  margin-bottom: 1rem;
  box-sizing: border-box;
  max-width: 100%; /* 防止超出容器 */
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
  filter: blur(1px);
  max-width: 100%;
}

/* 确保内部容器不超出 */
.masonry-item > div {
  max-width: 100%;
  box-sizing: border-box;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .masonry-grid {
    columns: 1;
    column-gap: 0.5rem;
    padding: 0 0.5rem;
    max-width: 100vw; /* 确保不超过视口宽度 */
  }
  
  .masonry-item {
    margin-bottom: 0.75rem;
    max-width: calc(100vw - 1rem); /* 减去左右padding */
  }
  
  /* 手机端禁用悬停效果 */
  .masonry-item:hover {
    transform: none;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .masonry-grid {
    columns: 2;
    column-gap: 0.75rem;
    padding: 0 0.75rem;
  }
}

@media (min-width: 1025px) and (max-width: 1536px) {
  .masonry-grid {
    columns: 3;
  }
}

@media (min-width: 1537px) {
  .masonry-grid {
    columns: 4;
  }
}

/* 悬停效果优化 */
.masonry-item:hover {
  transform: translateY(-2px);
  transition: transform 0.3s ease;
}

/* 加载动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.masonry-item {
  animation: fadeIn 0.6s ease-out;
}

/* 为不同索引的项目添加延迟动画 */
.masonry-item:nth-child(1) { animation-delay: 0.1s; }
.masonry-item:nth-child(2) { animation-delay: 0.2s; }
.masonry-item:nth-child(3) { animation-delay: 0.3s; }
.masonry-item:nth-child(4) { animation-delay: 0.4s; }
.masonry-item:nth-child(5) { animation-delay: 0.5s; }
.masonry-item:nth-child(6) { animation-delay: 0.6s; }
</style>
