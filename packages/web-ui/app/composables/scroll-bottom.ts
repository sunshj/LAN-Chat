export function useScrollBottom(scrollerRef: Ref<HTMLElement | null>) {
  const { y } = useScroll(scrollerRef)
  const isNearBottom = ref(true) // Initially assume near bottom to scroll on load

  function scrollToBottom() {
    nextTick(() => {
      if (!scrollerRef.value) return
      y.value = scrollerRef.value.scrollHeight
    })
  }

  // Update isNearBottom based on scroll position
  watch(y, newY => {
    if (!scrollerRef.value) return
    const { scrollHeight, clientHeight } = scrollerRef.value
    // Consider user near bottom if within 10px
    isNearBottom.value = scrollHeight - newY - clientHeight < 10
  })

  // Use ResizeObserver to scroll down when content size changes
  // only if the user is already near the bottom
  useResizeObserver(scrollerRef, () => {
    if (isNearBottom.value) {
      scrollToBottom()
    }
  })

  return {
    scrollToBottom,
    isNearBottom // Export isNearBottom
  }
}
