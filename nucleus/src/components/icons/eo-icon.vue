<script setup lang="ts">
interface Props {
    width?: number
    height?: number
}

const props = withDefaults(defineProps<Props>(), {
    width: 64,
    height: 64,
    color: '#fff',
})
</script>
<style lang="scss" scoped>
.eo-icon {
    stroke: var(--primary-color);
    fill: var(--primary-color);
    stroke-opacity: 1;
    stroke-linecap: round;
}
</style>
<template>
    <svg :width="props.width" :height="props.height" viewBox="0 0 135.467 135.467" xmlns="http://www.w3.org/2000/svg">
        <g class="eo-icon">
            <path
                d="M83.02 35.754c-16.24 0-28.624 10.332-30.736 26.362H31.607V73.35h20.886c2.611 15.366 14.745 26.361 30.526 26.361H98.59c18.211 0 31.32-14.075 31.32-32.638s-12.845-31.32-31.32-31.32zm0 11.173h15.57c11.789 0 20.147 8.623 20.147 20.675 0 12.053-8.358 20.938-20.147 20.938H83.02c-11.525 0-19.885-8.885-19.885-20.938 0-12.14 8.448-20.675 19.884-20.675z" />
            <path
                d="M42.623 29.566c-21.315 0-37.066 14.91-37.066 37.38 0 22.155 15.75 38.955 37.066 38.955h18.584c3.743 0 7.301-.509 10.635-1.447-7.208-2.056-13.369-6.223-17.943-11.889H42.623c-13.755 0-23.73-10.604-23.73-24.99 0-14.49 10.08-24.673 23.73-24.673h10.425c4.65-5.897 11.135-10.066 18.803-12.038-3.326-.844-6.884-1.298-10.644-1.298z" />
        </g>
    </svg>
</template>
