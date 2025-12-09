import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [],
    server: {
        host: true, // Listen on all addresses
    },
    build: {
        assetsInlineLimit: 0, // Ensure assets are kept specific if needed
    }
});
