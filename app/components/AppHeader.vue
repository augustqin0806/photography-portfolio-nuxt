<template>
  <header class="flex w-full overflow-hidden pt-10 pb-1">
    <!-- Navbar -->
    <nav id="nav" role="navigation" class="w-full">
      <div class="container mx-auto flex flex-wrap items-center md:flex-no-wrap">
        <div class="mr-4 md:mr-8">
          <NuxtLink to="/" class="text-2xl font-signika font-bold">SOPHIA WILLIAMS</NuxtLink>
        </div>
        <div class="ml-auto md:hidden flex items-center justify-start">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline">
                <Icon icon="radix-icons:moon"
                  class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Icon icon="radix-icons:sun"
                  class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span class="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @click="colorMode.preference = 'light'">
                Light
              </DropdownMenuItem>
              <DropdownMenuItem @click="colorMode.preference = 'dark'">
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem @click="colorMode.preference = 'system'">
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div class="ml-auto md:hidden flex items-center justify-start cursor-pointer">

          <button @click="toggleMenu"
            class="tap-highlight-transparent text-black dark:text-white w-5 h-5 relative focus:outline-none">
            <span class="sr-only">Open main menu</span>
            <div class="block w-5 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span aria-hidden="true"
                class="block absolute h-0.5 w-5 bg-current transform transition duration-500 ease-in-out"
                :class="{ 'rotate-45': isMenuOpen, '-translate-y-1.5': !isMenuOpen }"></span>
              <span aria-hidden="true"
                class="block absolute h-0.5 w-5 bg-current transform transition duration-500 ease-in-out"
                :class="{ 'opacity-0': isMenuOpen }"></span>
              <span aria-hidden="true"
                class="block absolute h-0.5 w-5 bg-current transform transition duration-500 ease-in-out"
                :class="{ '-rotate-45': isMenuOpen, 'translate-y-1.5': !isMenuOpen }"></span>
            </div>
          </button>
        </div>
        <div id="menu"
          class="w-full transition-all ease-out duration-500 md:transition-none md:w-auto md:flex-grow md:flex md:items-center"
          :class="isMenuOpen ? 'h-auto' : 'h-0 md:h-auto'">
          <ul id="ulMenu"
            class="flex flex-col duration-300 ease-out md:space-x-5 sm:transition-none mt-5 md:flex-row md:items-center md:ml-auto md:mt-0 md:pt-0 md:border-0"
            :class="isMenuOpen ? 'opacity-100' : 'opacity-0 md:opacity-100'">
            <li class="group transition duration-300">
              <NuxtLink to="/" class="font-signika text-2xl tap-highlight-transparent">
                PORTFOLIO
                <span class="hidden md:block h-0.5 bg-black dark:bg-white" :class="[
                  route.path === '/' ? 'max-w-full' : 'max-w-0',
                  'group-hover:max-w-full'
                ]"></span>
              </NuxtLink>
            </li>
            <li class="group transition duration-300">
              <NuxtLink to="/about" class="font-signika text-2xl tap-highlight-transparent">
                ABOUT ME
                <span
                  class="hidden md:block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-black dark:bg-white"
                  :class="[
                    route.path === '/about' ? 'max-w-full' : 'max-w-0',
                    'group-hover:max-w-full'
                  ]"></span>
              </NuxtLink>
            </li>
            <li class="group transition duration-300">
              <NuxtLink to="/contact" class="font-signika text-2xl tap-highlight-transparent">
                CONTACT
                <span :class="[
                  route.path === '/contact' ? 'max-w-full' : 'max-w-0',
                  'group-hover:max-w-full'
                ]" class="hidden md:block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-black dark:bg-white"></span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// 监听路由变化，关闭菜单
const route = useRoute()
watch(() => route.path, () => {
  isMenuOpen.value = false
})



const colorMode = useColorMode()
</script>