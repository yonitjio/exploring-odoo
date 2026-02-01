import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import VueRouter from 'unplugin-vue-router/vite'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')

    return {
        build: {
            chunkSizeWarningLimit: 3072,
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes('node_modules/primevue')) {
                            return 'primevue';
                        }
                        if (id.includes('node_modules/@fortawesome')) {
                            return 'fontawesome';
                        }
                        if (id.includes('node_modules')) {
                            return 'vendor';
                        }
                    }
                }
            }
        },
        plugins: [
            VueRouter({
                routesFolder: 'src/views',
                dts: 'src/typed-router.d.ts',
            }),
            vue(),
            vueDevTools(),
            tailwindcss(),
            Components({
                dirs: ['src/components', 'src/views'],
                resolvers: [
                    PrimeVueResolver(),
                    IconsResolver({
                        prefix: 'icon',
                    }),
                ],
                dts: 'src/components.d.ts',
            }),
            AutoImport({
                imports: ['vue', 'vue-router', '@vueuse/core', 'pinia'],
                dts: 'src/auto-imports.d.ts',
                dirs: ['src/composables', 'src/stores'],
                vueTemplate: true,
            }),
            Icons({
                compiler: 'vue3',
                autoInstall: true,
            }),
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        server: {
            port: 3000,
            proxy: {
                '/api': {
                    target: env.VITE_TRYTON_URL || 'http://localhost:8000',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api/, ''),
                },
            },
        },
        css: {
            preprocessorOptions: {
                scss: {},
            },
        },
    }
})
