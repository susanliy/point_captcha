// src/global.d.ts
export {};

declare global {
  interface Window {
    $microWidgetProps: any; //全局变量名
    callbackName: any;
  }
}
