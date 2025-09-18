<template>
  <div class="container mx-auto">
    <div class="grid grid-cols-2 gap-16">
      <section class="col-span-2 md:col-span-1">
        <div class="max-w-screen-md">
          <h1 class="text-4xl pt-10 pb-8 font-bold"><b>CONTACT</b></h1>
          <!-- <form class="space-y-8" action="mailto:info@example.com"></form> -->
          <!-- <form action="https://formspree.io/f/mayvlxyz" method="POST" class="space-y-8"> -->
          <form @submit.prevent="submitForm" class="space-y-8">
            <div>
              <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                Your email
              </label>
              <input type="email" id="email" name="email" v-model="form.email"
                class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-neutral-900 dark:border-neutral-800 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light"
                placeholder="example@gmail.com" required />
            </div>

            <div>
              <label for="subject" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                Subject
              </label>
              <input type="text" id="subject" name="subject" v-model="form.subject"
                class="block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-900 dark:border-neutral-800 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light"
                placeholder="Let me know how I can help you" required />
            </div>

            <div class="sm:col-span-2">
              <label for="message" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">
                Your message
              </label>
              <textarea id="message" name="message" rows="6" v-model="form.message"
                class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-900 dark:border-neutral-800 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Leave a comment..." required></textarea>
            </div>

            <button type="submit"
              class="py-3 px-5 text-sm font-medium text-center bg-black dark:bg-white text-white dark:text-black rounded-lg bg-primary-700 sm:w-fit hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
              Send message
            </button>
          </form>
        </div>
      </section>
      <div class="col-span-2 md:col-span-1 flex relative">
        <div
          class="bg-white dark:bg-neutral-900 p-5 pb-20 m-6 md:m-12 shadow-lg border border-gray-100 dark:border-neutral-800  hover:rotate-0 transition duration-500 rotate-6 relative">
          <img
            src="https://images.unsplash.com/reserve/yZfr4jmxQyuaE132MWZm_stagnes.jpg?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2052&q=80"
            alt="" class="flex flex-col aspect-square w-full object-cover h-auto max-h-full" />
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref } from 'vue'
import emailjs from '@emailjs/browser'
import { toast } from 'vue-sonner'

// 页面头部信息
useHead({
  title: 'Contact - Grace Lyra',
  meta: [
    {
      name: 'description',
      content: 'Get in touch with Grace Lyra for software development projects, collaborations, or photography inquiries.'
    }
  ]
})

// 表单数据
const form = ref({
  email: '',
  subject: '',
  message: ''
})

// 状态管理
const isSubmitting = ref(false)
const { public: { emailjsServiceId, emailjsTemplateId, emailjsPublicKey } } = useRuntimeConfig()

// 提交表单
const submitForm = async () => {
  if (!form.value.email || !form.value.subject || !form.value.message) {
    toast.error('Please fill in all fields.', {
      position: 'top-right'
    })
    return
  }

  isSubmitting.value = true

  try {
    // await emailjs.send(
    //   import.meta.env.VITE_EMAILJS_SERVICE_ID,
    //   import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    //   {
    //     from_email: form.value.email,
    //     subject: form.value.subject,
    //     message: form.value.message
    //   },
    //   import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    // )
    const templateParams = {
      from_email: form.value.email,
      subject: form.value.subject,
      message: form.value.message
    };
    await emailjs.send(
      emailjsServiceId,
      emailjsTemplateId,
      templateParams,
      emailjsPublicKey
    )
    toast.success('Thank you! Your message has been sent.', {
      position: 'top-right'
    })
    // 清空表单
    form.value = { email: '', subject: '', message: '' }

  } catch (error) {
    console.error(error)
    toast.error('Error sending message. Please try again.', {
      position: 'top-right'
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>
