// types/masonry-layout.d.ts
declare module 'masonry-layout' {
  interface MasonryOptions {
    itemSelector?: string;
    columnWidth?: string | number | HTMLElement;
    percentPosition?: boolean;
    gutter?: number;
    originLeft?: boolean;
    originTop?: boolean;
  }

  class Masonry {
    constructor(element: string | HTMLElement, options?: MasonryOptions);
    layout(): void;
    reloadItems(): void;
    appended(elements: HTMLElement | HTMLElement[]): void;
    remove(elements: HTMLElement | HTMLElement[]): void;
    destroy(): void;
  }

  export default Masonry;
}

