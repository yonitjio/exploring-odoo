<!--
* SPDX-License-Identifier: GPL-3.0-or-later
-->

<template>
    <div class="flex flex-col items-center justify-center py-12 gap-4">
        <ProgressSpinner />
        <div class="text-sm text-slate-500">
            <slot />
        </div>
    </div>
</template>
