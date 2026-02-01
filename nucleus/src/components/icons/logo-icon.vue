<script setup lang="ts">
interface Props {
    width?: number
    height?: number
}

const props = withDefaults(defineProps<Props>(), {
    width: 36,
    height: 36
})
</script>
<style lang="scss" scoped>
.logo-icon {
    stroke: var(--primary-color);
    stroke-width: 7;
    stroke-opacity: 1;
    fill: none;
    stroke-linecap: round;
}
</style>
<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        :width="props.width"
        :height="props.height"
        viewBox="0 0 135.467 135.467"
    >
        <g class="logo-icon" transform="matrix(1.11996 .29457 -.29473 1.11934 11.69 -24.194)">
            <path
                d="M23.52 85.377A47.604 47.604 0 0 1 47.19 24.79m56.666 73.949a47.604 47.604 0 0 1-61.489 9.278"
            />
            <path
                d="M93.35 62.224a26.143 26.137 0 0 1-3.688 19.819 26.143 26.137 0 0 1-16.697 11.3"
                transform="skewX(-.007)"
            />
            <path d="M75.527 20.771a47.604 47.604 0 0 1 39.504 52.355" />
            <circle cx="54.52" cy="21.99" r="6.636" />
            <circle cx="113.663" cy="80.259" r="6.636" />
            <circle cx="35.246" cy="102.454" r="6.636" />
            <path d="M50.02 48.554a26.143 26.137 0 0 1 36.343.773" transform="skewX(-.007)" />
            <circle cx="68" cy="68" r="10"></circle>
            <path d="M59.376 92.469A26.143 26.137 0 0 1 42.77 60.153" transform="skewX(-.007)" />
        </g>
    </svg>
</template>
