/*
* SPDX-License-Identifier: GPL-3.0-or-later
*/

import type { LayoutConfig } from '@/default-preset';
import { computed, reactive } from 'vue'

export const NUCLEUS_LAYOUT_STORAGE_KEY = 'nucleus-layout-config';

const getInitialConfig = (): LayoutConfig => {
    const stored = localStorage.getItem(NUCLEUS_LAYOUT_STORAGE_KEY);
    if (stored) {
        return JSON.parse(stored) as LayoutConfig;
    }
    // Default fallback values
    return {
        preset: 'Aura',
        primary: 'emerald',
        surface: null,
        darkTheme: false,
        menuMode: 'static',
    };
};

const layoutConfig: LayoutConfig = reactive(getInitialConfig())

type LayoutState = {
    staticMenuInactive: boolean
    overlayMenuActive: boolean
    profileSidebarVisible: boolean
    configSidebarVisible: boolean
    sidebarExpanded: boolean
    menuHoverActive: boolean
    activeMenuItem: object | null | undefined
    activePath: string | null | undefined
    mobileMenuActive: boolean
    anchored: boolean
}

const layoutState: LayoutState = reactive({
    staticMenuInactive: false,
    overlayMenuActive: false,
    profileSidebarVisible: false,
    configSidebarVisible: false,
    sidebarExpanded: false,
    menuHoverActive: false,
    activeMenuItem: null,
    activePath: null,
    mobileMenuActive: false,
    anchored: false,
})

export function useLayout() {
    const toggleDarkMode = () => {
        if (!document.startViewTransition) {
            executeDarkModeToggle()

            return
        }

        document.startViewTransition(() => executeDarkModeToggle())
    }

    const executeDarkModeToggle = () => {
        layoutConfig.darkTheme = !layoutConfig.darkTheme
        document.documentElement.classList.toggle('app-dark')
    }

    const toggleMenu = () => {
        if (isDesktop()) {
            if (layoutConfig.menuMode === 'static') {
                layoutState.staticMenuInactive = !layoutState.staticMenuInactive
            }

            if (layoutConfig.menuMode === 'overlay') {
                layoutState.overlayMenuActive = !layoutState.overlayMenuActive
            }
        } else {
            layoutState.mobileMenuActive = !layoutState.mobileMenuActive
        }
    }

    const toggleConfigSidebar = () => {
        layoutState.configSidebarVisible = !layoutState.configSidebarVisible
    }

    const hideMobileMenu = () => {
        layoutState.mobileMenuActive = false
    }

    const changeMenuMode = (event: { value: string }) => {
        layoutConfig.menuMode = event.value
        layoutState.staticMenuInactive = false
        layoutState.mobileMenuActive = false
        layoutState.sidebarExpanded = false
        layoutState.menuHoverActive = false
        layoutState.anchored = false
    }

    const isDarkTheme = computed(() => layoutConfig.darkTheme)
    const isDesktop = () => window.innerWidth > 991

    const hasOpenOverlay = computed(() => layoutState.overlayMenuActive)

    watch(
        layoutConfig,
        (newConfig) => {
            localStorage.setItem(NUCLEUS_LAYOUT_STORAGE_KEY, JSON.stringify(newConfig));
        },
        { deep: true }
    );

    return {
        layoutConfig,
        layoutState,
        isDarkTheme,
        toggleDarkMode,
        toggleConfigSidebar,
        toggleMenu,
        hideMobileMenu,
        changeMenuMode,
        isDesktop,
        hasOpenOverlay,
    }
}
