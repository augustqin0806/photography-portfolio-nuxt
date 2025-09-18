<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面标题 -->
    <div class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-4 py-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">相册组件对比</h1>
        <p class="text-gray-600">比较两种不同的瀑布流实现方式</p>
      </div>
    </div>

    <!-- 切换按钮 -->
    <div class="container mx-auto px-4 py-6">
      <div class="flex flex-wrap gap-4 mb-8">
        <button
          @click="currentGallery = 'css'"
          :class="[
            'px-6 py-3 rounded-lg font-medium transition-all duration-200',
            currentGallery === 'css' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          ]"
        >
          CSS Columns 瀑布流
          <span class="ml-2 text-sm opacity-75">(自定义实现)</span>
        </button>
        
        <button
          @click="currentGallery = 'masonry'"
          :class="[
            'px-6 py-3 rounded-lg font-medium transition-all duration-200',
            currentGallery === 'masonry' 
              ? 'bg-green-600 text-white shadow-lg' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          ]"
        >
          Masonry.js 瀑布流
          <span class="ml-2 text-sm opacity-75">(第三方库)</span>
        </button>
      </div>

      <!-- 特性对比说明 -->
      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <h3 class="text-lg font-semibold text-blue-600 mb-3 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            CSS Columns 实现
          </h3>
          <ul class="space-y-2 text-sm text-gray-600">
            <li>纯CSS实现，无需额外依赖</li>
            <li>性能优异，浏览器原生支持</li>
            <li>响应式布局自动适配</li>
            <li>垂直排列顺序（从上到下填充列）</li>
            <li>列高度可能不完全平衡</li>
          </ul>
        </div>
        
        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <h3 class="text-lg font-semibold text-green-600 mb-3 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Masonry.js 实现
          </h3>
          <ul class="space-y-2 text-sm text-gray-600">
            <li>精确的砖块布局算法</li>
            <li>完美的列高度平衡</li>
            <li>水平排列顺序（从左到右填充）</li>
            <li>丰富的配置选项和动画</li>
            <li>需要额外的JavaScript库</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 相册组件展示 -->
    <div class="transition-all duration-500">
      <Gallery v-if="currentGallery === 'css'" />
      <MasonryGallery v-if="currentGallery === 'masonry'" />
    </div>

    <!-- 底部说明 -->
    <div class="container mx-auto px-4 py-12">
      <div class="bg-white rounded-lg p-6 shadow-sm border">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">使用建议</h3>
        <div class="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
          <div>
            <h4 class="font-medium text-blue-600 mb-2">选择 CSS Columns 当：</h4>
            <ul class="space-y-1">
              <li>• 追求最佳性能和最小依赖</li>
              <li>• 内容主要是文本或简单布局</li>
              <li>• 不需要精确控制项目位置</li>
              <li>• 移动端优先的响应式设计</li>
            </ul>
          </div>
          <div>
            <h4 class="font-medium text-green-600 mb-2">选择 Masonry.js 当：</h4>
            <ul class="space-y-1">
              <li>• 需要精确的砖块布局效果</li>
              <li>• 图片尺寸差异较大</li>
              <li>• 需要复杂的动画和交互</li>
              <li>• 对视觉效果要求较高</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Gallery from './Gallery.vue';
import MasonryGallery from './MasonryGallery.vue';

const currentGallery = ref<'css' | 'masonry'>('css');
</script>

<style scoped>
/* 平滑过渡效果 */
.transition-all {
  transition: all 0.3s ease-in-out;
}

/* 按钮悬停效果 */
button:hover {
  transform: translateY(-1px);
}

/* 卡片悬停效果 */
.bg-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>