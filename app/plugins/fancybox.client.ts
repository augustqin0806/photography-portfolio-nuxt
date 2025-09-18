import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { defineNuxtPlugin } from "nuxt/app";

export default defineNuxtPlugin({
  name: "fancybox-plugin",
  enforce: "post", // 在页面渲染后初始化
  setup(nuxtApp) {
    // 只在客户端运行
    if (process.client) {
      // 页面加载完成后初始化 Fancybox
      nuxtApp.hook("app:mounted", () => {
        // @ts-ignore 强制忽略类型检查----------这样写也行，我这里是使用了fancybox.d.ts
        // (Fancybox as any).bind("[data-fancybox]", {
        Fancybox.bind("[data-fancybox]", {
          // Carousel: {
          //   Toolbar: {
          //     display: {
          //       left: ["counter"],
          //       middle: [
          //         "zoomIn",
          //         "zoomOut",
          //         "toggle1to1",
          //         "rotateCCW",
          //         "rotateCW",
          //         "flipX",
          //         "flipY",
          //       ],
          //       right: [
          //         // "download",
          //         "autoplay",
          //         "thumbs",
          //         "fullscreen",
          //         "close",
          //       ],
          //     },
          //   },
          // },
          //自定义按钮
          // Carousel: {
          //   Toolbar: {
          //     items: {
          //       facebook: {
          //         tpl: '<button class="f-button"><svg><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></button>',
          //         click: () => {
          //           window.open(
          //             "https://www.facebook.com/sharer/sharer.php?u=" +
          //               encodeURIComponent(window.location.href) +
          //               "&t=" +
          //               encodeURIComponent(document.title),
          //             "",
          //             "left=0,top=0,width=600,height=300,menubar=no,toolbar=no,resizable=yes,scrollbars=yes"
          //           );
          //         },
          //       },
          //       twitter: {
          //         tpl: '<button class="f-button"><svg><path stroke="none" d="M0 0h24v24H0z"/><path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753c0-.249 1.51-2.772 1.818-4.013z"/></svg></button>',
          //         click: () => {
          //           window.open(
          //             "http://twitter.com/share?url=" +
          //               encodeURIComponent(window.location.href) +
          //               "&text=" +
          //               encodeURIComponent(document.title),
          //             "",
          //             "left=0,top=0,width=600,height=300,menubar=no,toolbar=no,resizable=yes,scrollbars=yes"
          //           );
          //         },
          //       },
          //     },
          //     display: {
          //       left: ["infobar"],
          //       middle: [],
          //       right: ["twitter", "facebook", "close"],
          //     },
          //   },
          // },
          //达到多少宽度才显示
          // Carousel: {
          //   Toolbar: {
          //     display: {
          //       left: ["counter"],
          //       middle: [],
          //       right: ["thumbs", "close"],
          //     },
          //   },
          //   breakpoints: {
          //     "(min-width: 768px)": {
          //       Toolbar: {
          //         display: {
          //           left: ["counter"],
          //           middle: [
          //             "zoomIn",
          //             "zoomOut",
          //             "toggle1to1",
          //             "rotateCCW",
          //             "rotateCW",
          //             "flipX",
          //             "flipY",
          //           ],
          //           right: ["autoplay", "thumbs", "close"],
          //         },
          //       },
          //     },
          //   },
          // },
        });
      });
    }
  },
});
