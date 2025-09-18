<template>
  <div>
    <AppHeader />
    <NuxtPage />
    <AppFooter />
    <Toaster />
  </div>
</template>



<script setup>
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'
const isLoading = ref(true)

//  1 秒后加载完成
setTimeout(() => {
  isLoading.value = false
}, 1000)
// 全局样式和脚本配置
useHead({
  htmlAttrs: {
    lang: 'en',
    class: 'scroll-smooth'
  },
  bodyAttrs: {
    class: 'dark:bg-black bg-white h-screen text-black dark:text-white px-5 md:px-20 opacity-0 animate-fade-in transition duration-500'
  },
  script: [
  ]
})


</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Signika:wght@400;700&display=swap');

.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.tap-highlight-transparent {
  -webkit-tap-highlight-color: transparent;
}
</style>
