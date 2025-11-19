/// <reference types="vite/client" />

declare global {
  interface Window {
    MathJax?: {
      typeset?: (elements?: Element[] | NodeListOf<Element>) => void;
      typesetPromise?: (elements?: Element[] | NodeListOf<Element>) => Promise<void>;
      startup?: any;
      tex?: any;
      [key: string]: any;
    };
  }
}

export {};