<template>
  <div class="md-output" v-html="output" />
</template>

<script setup lang="ts">
import { safeMarkdownParse } from '../utils'

const props = defineProps<{
  value: string
}>()

const output = await safeMarkdownParse(props.value)
</script>

<style>
pre.shiki {
  background-color: #f2f3f4 !important;
  padding: 6px;
  position: relative;
  border-radius: 4px;
}

pre.shiki:hover::before {
  content: attr(data-lang);
  position: absolute;
  top: 0;
  right: 0;
  text-align: center;
  font-size: 14px;
  text-transform: uppercase;
  color: white;
  padding: 4px;
  border-bottom-left-radius: 4px;
  background-color: #0006;
  font-weight: bolder;
}
</style>
