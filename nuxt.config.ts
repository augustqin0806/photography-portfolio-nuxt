import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  devtools: { enabled: true },
  // 模块配置
  modules: [
    ["@nuxtjs/color-mode", { classSuffix: "" }],
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
  ],
  css: ["~/assets/css/main.css"],

  ssr: true,
  runtimeConfig: {
    // Private keys (only available on server-side)
    apiSecret: "123",

    // Public keys (exposed to client-side)
    public: {
      apiBase: "/api",
      strapiBaseUrl: process.env.STRAPI_BASE_URL || "http://localhost:1337",
      emailjsServiceId: process.env.VITE_EMAILJS_SERVICE_ID,
      emailjsTemplateId: process.env.VITE_EMAILJS_TEMPLATE_ID,
      emailjsPublicKey: process.env.VITE_EMAILJS_PUBLIC_KEY,
    },
  },
  // 关闭 CSS sourcemap，警告即消失
  vite: {
    css: { devSourcemap: false },
  },

  // 头部配置
  app: {
    head: {
      title: "Sophia Williams - Portfolio",
      htmlAttrs: {
        lang: "en",
        class: "scroll-smooth",
      },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Hello there, I'm Sophia Williams – an intrepid explorer through the lens, on a relentless quest to capture the world's boundless wonders. Join me in unraveling the extraordinary through my lens as I embark on a visual journey like no other.",
        },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/66.png" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          href: "https://fonts.googleapis.com/css2?family=Signika:wght@400;700&display=swap",
          rel: "stylesheet",
        },
      ],
      script: [],
    },
  },

  // 构建配置
  nitro: {
    preset: "static",
    compressPublicAssets: true,
    routeRules: {
      // 把 /api/strapi/* 透传到真实 Strapi
      "/api/strapi/**": {
        proxy: `${process.env.STRAPI_BASE_URL}/api/**`,
      },
    },
  },
  devServer: {
    // port: 4000,      // 开发服务器
    host: "0.0.0.0", // 如需局域网
  },
  // nitro: {
  //   port: 5000,      // preview / 生产
  //   host: '0.0.0.0'
  // }

  // 兼容性配置
  compatibilityDate: "2024-09-05",
});
