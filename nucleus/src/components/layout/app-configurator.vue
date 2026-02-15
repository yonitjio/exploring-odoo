<!--
* SPDX-License-Identifier: MIT OR GPL-3.0-or-later
-->

<script setup lang="ts">
import { useLayout } from '@/composables/useLayout'
import { $t, updatePreset, updateSurfacePalette } from '@primeuix/themes'
import type { PaletteDesignToken } from '@primeuix/themes/types'
import { ref } from 'vue'

import { defaultPreset, getPresetExt, primaryColors, surfaces, themePresets } from '@/default-preset'

const { layoutConfig, isDarkTheme, changeMenuMode } = useLayout()


const preset = ref(layoutConfig.preset)
const presetOptions = ref(Object.keys(themePresets))

const menuMode = ref(layoutConfig.menuMode)
const menuModeOptions = ref([
    { label: 'Static', value: 'static' },
    { label: 'Overlay', value: 'overlay' },
])

function updateColors(type: string, color: { name: string }) {
    if (type === 'primary') {
        layoutConfig.primary = color.name
    } else if (type === 'surface') {
        layoutConfig.surface = color.name
    }

    applyTheme(type, color)
}

function applyTheme(type: string, color: { name?: string; palette?: PaletteDesignToken }) {
    if (type === 'primary') {
        updatePreset(getPresetExt(layoutConfig))
    } else if (type === 'surface') {
        updateSurfacePalette(color.palette)
    }
}

function onPresetChange() {
    layoutConfig.preset = preset.value
    const presetStr: string = preset.value
    const presetValue = themePresets[presetStr]
    const surfacePalette = surfaces.value.find((s) => s.name === layoutConfig.surface)?.palette

    $t()
        .preset(presetValue)
        .preset(getPresetExt(layoutConfig))
        .surfacePalette(surfacePalette)
        .use({ useDefaultOptions: true })

    if (layoutConfig.preset === 'aura'){
        updatePreset(defaultPreset)
    }
}
</script>

<template>
    <div
        class="config-panel hidden absolute top-[3.25rem] right-0 w-73 p-4 bg-surface-0 dark:bg-surface-900 border border-surface rounded-border origin-top shadow-[0px_3px_5px_rgba(0,0,0,0.02),0px_0px_2px_rgba(0,0,0,0.05),0px_1px_4px_rgba(0,0,0,0.08)]">
        <div class="flex flex-col gap-4">
            <div>
                <span class="text-sm text-muted-color font-semibold">Primary</span>
                <div class="pt-2 flex gap-2 flex-wrap justify-start">
                    <button v-for="primaryColor of primaryColors" :key="primaryColor.name" type="button"
                        :title="primaryColor.name" @click="updateColors('primary', primaryColor)" :class="[
                            'border-none w-5 h-5 rounded-full p-0 cursor-pointer outline-none outline-offset-1',
                            { 'outline-primary': layoutConfig.primary === primaryColor.name },
                        ]" :style="{
                            backgroundColor: `${primaryColor.name === 'noir' ? 'var(--text-color)' : primaryColor.palette['500']}`,
                        }"></button>
                </div>
            </div>
            <div>
                <span class="text-sm text-muted-color font-semibold">Surface</span>
                <div class="pt-2 flex gap-2 flex-wrap justify-start">
                    <button v-for="surface of surfaces" :key="surface.name" type="button" :title="surface.name"
                        @click="updateColors('surface', surface)" :class="[
                            'border-none w-5 h-5 rounded-full p-0 cursor-pointer outline-none outline-offset-1',
                            {
                                'outline-primary': layoutConfig.surface
                                    ? layoutConfig.surface === surface.name
                                    : isDarkTheme
                                        ? surface.name === 'zinc'
                                        : surface.name === 'slate',
                            },
                        ]" :style="{ backgroundColor: `${surface.palette['500']}` }"></button>
                </div>
            </div>
            <div class="flex flex-col gap-2">
                <span class="text-sm text-muted-color font-semibold">Presets</span>
                <SelectButton v-model="preset" @change="onPresetChange" :options="presetOptions" :allowEmpty="false" />
            </div>
            <div class="flex flex-col gap-2">
                <span class="text-sm text-muted-color font-semibold">Menu Mode</span>
                <SelectButton v-model="menuMode" @change="changeMenuMode" :options="menuModeOptions" :allowEmpty="false"
                    optionLabel="label" optionValue="value" />
            </div>
        </div>
    </div>
</template>
