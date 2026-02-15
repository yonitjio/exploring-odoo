/*
* SPDX-License-Identifier: GPL-3.0-or-later
*/

import '@/assets/tailwind.css'
import '@/assets/styles.scss'

import { createApp } from 'vue'

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { PiniaColada } from '@pinia/colada'

import { createRouter, createWebHistory } from 'vue-router'
import { routes as autoRoutes } from 'vue-router/auto-routes'
import App from './App.vue'

import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'

import { setupServices } from './core/services'
import { defaultPreset } from './default-preset'

import * as fa from '@fortawesome/fontawesome-svg-core'

import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

fa.dom.watch()
fa.library.add(fas, far, fab)

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const routes = [
    { path: '/', redirect: '/nucleus' }, // Add your redirect here
    ...autoRoutes,
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

app.use(pinia)
app.use(PiniaColada)
app.use(router)

app.use(PrimeVue, {
    theme: {
        preset: defaultPreset,
        options: {
            darkModeSelector: '.app-dark',
            cssLayer: {
                name: 'primevue',
                order: 'theme, base, primevue',
            },
        },
    },
})
app.use(ToastService)
app.use(ConfirmationService)

await setupServices()

app.mount('#app')
