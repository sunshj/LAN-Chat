<template>
  <BoringAvatar
    :id="props.id"
    class="cursor-pointer"
    :size="props.size"
    :variant="props.variant"
    :colors="colors"
  />
</template>

<script setup lang="ts">
import BoringAvatar from 'vue-boring-avatars'
import seedrandom from 'seedrandom'

const props = withDefaults(
  defineProps<{
    id: string
    size?: number
    variant?: InstanceType<typeof BoringAvatar>['variant']
  }>(),
  {
    size: 60,
    variant: 'marble'
  }
)

function getAvatarColors(id: string) {
  if (!id) return []
  const rand = seedrandom(id)
  const size = Math.floor(rand() * 3)
  return Array.from({ length: 3 + size })
    .fill(0)
    .map(
      () =>
        `#${Math.floor(rand() * 0xffffff)
          .toString(16)
          .padStart(6, '0')}`
    )
}

const colors = computed(() => getAvatarColors(props.id))
</script>
