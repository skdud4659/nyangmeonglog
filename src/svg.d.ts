/// <reference types="vite-plugin-svgr/client" />

// Kakao Maps ambient types (minimal)
declare global {
    interface Window {
        kakao: any;
    }
}
