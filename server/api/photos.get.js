
// server/api/photos.get.js - API endpoint to serve photos
export default defineEventHandler(async (event) => {
  try {
    // In a real application, you might fetch from a database
    // For this example, we'll read from a static JSON file
    
    // Example photos data structure
    const photos = [
      {
        url: 'https://picsum.photos/800/1200?random=1',
        blurHash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH',
        width: 800,
        height: 1200,
        alt: 'Beautiful landscape photo',
        copyright: '© 2024 Example Photographer'
      },
      {
        url: 'https://picsum.photos/600/900?random=2',
        blurHash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
        width: 600,
        height: 900,
        alt: 'Portrait photography',
        copyright: '© 2024 Another Photographer'
      },
      {
        url: 'https://picsum.photos/1000/800?random=3',
        blurHash: 'L7Q9CW00?b%2_3t7t7t700%M%LIU',
        width: 1000,
        height: 800,
        alt: 'City architecture',
      },
      // Add more photos as needed...
    ]

    // Simulate some loading time (remove in production)
    await new Promise(resolve => setTimeout(resolve, 500))

    return {
      data: photos,
      total: photos.length,
      page: 1
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load photos'
    })
  }
})