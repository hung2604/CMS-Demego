<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke="currentColor"
    aria-hidden="true"
    :class="sizeClass"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** sm: 18px, md: 22px, lg: 28px */
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' },
)

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-[18px] w-[18px]'
    case 'lg':
      return 'h-8 w-8 sm:h-9 sm:w-9'
    default:
      return 'h-5 w-5 sm:h-[22px] sm:w-[22px]'
  }
})
</script>
