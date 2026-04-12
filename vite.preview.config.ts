import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    define: {
        'process.env.NODE_ENV': JSON.stringify('development'),
        'process.env': JSON.stringify({ NODE_ENV: 'development' }),
    },
    server: {
        port: 4174,
    },
    build: {
        outDir: 'dist-preview',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                preview: 'preview.html',
            },
        },
    },
});
