<!--
* SPDX-License-Identifier: GPL-3.0-or-later
-->

<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PiniaColadaDevtools } from '@pinia/colada-devtools'

import { $t, updateSurfacePalette } from '@primeuix/themes'

import { getPresetExt, surfaces, themePresets } from '@/default-preset'

const { layoutConfig } = useLayout();

function applySavedTheme() {
    layoutConfig.preset = layoutConfig.preset
    const presetStr: string = layoutConfig.preset
    const presetValue = themePresets[presetStr]
    const surfacePalette = surfaces.value.find((s) => s.name === layoutConfig.surface)?.palette

    $t()
        .preset(presetValue)
        .preset(getPresetExt(layoutConfig))
        .surfacePalette(surfacePalette)
        .use({ useDefaultOptions: true })

    updateSurfacePalette(surfacePalette)
}

onMounted(() => {
    if (layoutConfig.darkTheme) {
        document.documentElement.classList.add('app-dark');
    }
    applySavedTheme()
});
</script>

<template>
    <router-view />
</template>
