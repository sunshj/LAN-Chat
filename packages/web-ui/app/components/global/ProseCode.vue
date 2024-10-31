<template>
  <code><slot /></code>
</template>

<style scoped>
code:not(pre code) {
  font-size: 14px;
  box-sizing: border-box;
  padding: 2px;
  color: #585865;
  word-wrap: break-word;
  background: #0066cc26;
  border: 1px solid #2994ff;
  border-radius: 4px;
}
</style>
