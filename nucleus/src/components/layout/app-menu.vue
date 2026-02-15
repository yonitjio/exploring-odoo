<!--
* SPDX-License-Identifier: MIT OR GPL-3.0-or-later
-->
<script setup lang="ts">
import { ref } from 'vue'

type MenuItem = {
    label: string
    icon?: string
    to?: string
    path?: string
    class?: string
    url?: string
    target?: string
    separator?: boolean
    visible?: boolean
    items?: MenuItem[]
}

const model = ref<MenuItem[]>([
    {
        label: 'Nucleus',
        items: [
            {
                label: 'Home',
                icon: 'pi pi-fw pi-home',
                to: '/nucleus',
            },
        ],
    },
    {
        label: 'Playground',
        items: [
            {
                label: 'Base',
                icon: 'fa-solid fa-bug',
                to: '/basic-plays',
            },
        ],
    },
])
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
