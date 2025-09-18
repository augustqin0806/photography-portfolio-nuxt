export {};
//no used
declare global {
  interface Window {
    Masonry: typeof import('masonry-layout').default;
  }
}