<template>
    <div class="home-page">
        <!-- Hero section -->
        <section class="hero">
            <h1>Welcome to our Gallery</h1>
        </section>

        <!-- Gallery section with custom props -->
        <!-- <section class="gallery-section">
            <MasonryPic :api-endpoint="'/photos.json'" :min-item-width="200" :max-item-width="350" :gap="12" />
        </section> -->
    </div>
    <!-- Using the Masonry Gallery Component -->
    <div class="gallery-page">
        <div class="container mx-auto px-4 py-8">
            <h1 class="text-4xl font-bold text-center mb-8">Photo Gallery</h1>


            <MasonryPic :api-endpoint="'/api/photos'" :min-item-width="250" :max-item-width="400" :gap="16" />
        </div>
    </div>
</template>

<script setup>
// Set page meta
definePageMeta({
    title: 'Photo Gallery',
    description: 'A beautiful masonry photo gallery'
})

// SEO head
useHead({
    title: 'Photo Gallery - My Site',
    meta: [
        {
            name: 'description',
            content: 'Browse our beautiful collection of photos in a masonry layout'
        }
    ]
})
</script>
