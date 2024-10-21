export function useScrollToBottom(containerRef: Ref<HTMLElement | null>, debounceMs = 1000) {
  const scrollToBottom = useDebounceFn(() => {
    if (!containerRef.value) return
    const { scrollHeight, clientHeight, scrollTop } = containerRef.value
    if (scrollHeight - clientHeight - scrollTop > 20) {
      containerRef.value.scrollTo(0, scrollHeight - clientHeight)
    }
  }, debounceMs)

  return {
    scrollToBottom
  }
}
