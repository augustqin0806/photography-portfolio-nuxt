<template>
  <div class="container mx-auto">
    <h1 class="text-4xl pt-10 pb-8 font-bold"><b>ABOUT ME</b></h1>
    <div class="grid grid-cols-2 gap-14 md:gap-20">
      <div class="col-span-2 md:col-span-1">
        <div
          class="bg-white dark:bg-neutral-900 p-5 pb-28 m-6 md:m-12 shadow-lg border border-gray-100 dark:border-neutral-800 hover:rotate-0 transition duration-500 -rotate-6 relative">
          <img src="/Avatar.png" alt="Avatar"
            class="smooth-edges flex flex-col w-full aspect-square object-cover h-auto" />
          <div class="absolute bottom-0 left-0 right-0 text-center">
            <p class="text-gray-800 dark:text-slate-200 pb-7 h-full text-6xl font-nothingyoucoulddo">me</p>
          </div>
        </div>

      </div>
      <section class="font-normal text-center text-base md:text-start mx-3 col-span-2 md:col-span-1 my-auto">
        <div class="block md:hidden">
          <p class="text-3xl font-serif font-bold mb-1">Hello there,</p>
          <p class="text-3xl font-serif font-bold mb-6">I'm Grace Lyra<span class="animate-wave">👋</span></p>
        </div>
        <p class="hidden md:block text-3xl font-serif font-bold mb-6">Hello there, I'm Grace Lyra
          <span class="animate-wave">👋</span>
        </p>
        <p class="mb-4">
          I'm a software developer with a strong passion for building elegant and
          efficient solutions through code. Over the years, I have honed my skills
          in crafting applications that are both practical and enjoyable to use.
          My work is guided by curiosity, creativity, and a love for solving
          complex problems with clean and scalable designs.
        </p>
        <p class="mb-4">
          Beyond programming, I have a deep appreciation for photography. Capturing
          unique perspectives and moments allows me to balance the logical world of
          coding with artistic expression. Whether it's writing code or taking
          photos, I enjoy finding beauty in both precision and creativity.
        </p>
        <p>
          Thank you for stopping by and taking the time to get to know me. If you're
          interested in collaborating, sharing ideas, or simply connecting, feel
          free to reach out. I’d love to work together and turn ideas into reality!
        </p>
      </section>

    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'About Me - Grace Lyra',
  meta: [
    {
      name: 'description',
      content: 'Learn more about Grace Lyra, a passionate photographer exploring the world through her lens.'
    }
  ]
})
</script>