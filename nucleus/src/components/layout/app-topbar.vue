<script setup lang="ts">
import { useLayout } from '@/composables/useLayout'
import AppConfigurator from './app-configurator.vue'

const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout()
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <LogoIcon/>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <span>Nucleus</span>
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
                <div class="relative">
                    <button
                        v-styleclass="{
                            selector: '@next',
                            enterFromClass: 'hidden',
                            enterActiveClass: 'p-anchored-overlay-enter-active',
                            leaveToClass: 'hidden',
                            leaveActiveClass: 'p-anchored-overlay-leave-active',
                            hideOnOutsideClick: true,
                        }"
                        type="button"
                        class="layout-topbar-action layout-topbar-action-highlight"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <AppConfigurator />
                </div>
            </div>

            <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{
                    selector: '@next',
                    enterFromClass: 'hidden',
                    enterActiveClass: 'p-anchored-overlay-enter-active',
                    leaveToClass: 'hidden',
                    leaveActiveClass: 'p-anchored-overlay-leave-active',
                    hideOnOutsideClick: true,
                }"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <LogoutButton />
                </div>
            </div>
        </div>
    </div>
</template>
