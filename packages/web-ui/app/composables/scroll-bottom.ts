export function useScrollBottom(scrollerRef: Ref<HTMLElement | null>) {
  const { y } = useScroll(scrollerRef)

  function scrollToBottom() {
    nextTick(() => {
      if (!scrollerRef.value) return
      y.value = scrollerRef.value.scrollHeight
    })
  }

  const stop = watchDebounced(
    [() => scrollerRef.value?.scrollHeight, y],
    ([, scrollY]) => {
      scrollToBottom()
      const { scrollHeight, clientHeight } = scrollerRef.value!
      if (scrollHeight - scrollY - clientHeight < 10) {
        stop()
      }
    },
    {
      debounce: 600,
      flush: 'post'
    }
  )

  return {
    scrollToBottom
  }
}
