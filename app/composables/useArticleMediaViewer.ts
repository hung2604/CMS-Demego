import type { Ref } from 'vue'
import type PhotoSwipe from 'photoswipe'

type ViewerItem = {
  src: string
  msrc: string
  alt: string
  element: HTMLImageElement
  width: number
  height: number
  /** Ảnh chưa tải xong lúc mở → kích thước tạm, cập nhật khi đã biết kích thước thật */
  sizeUnknown: boolean
}

type LockableOrientation = ScreenOrientation & { lock?: (o: 'landscape') => Promise<void> }

const SVG_RE = /^data:image\/svg|\.svg(?:[?#]|$)/i

/**
 * Phóng to ảnh / video trong nội dung bài (trang khách).
 * - Ảnh: PhotoSwipe — zoom tới kích thước gốc, vuốt/pinch trên mobile, ← → chuyển ảnh.
 *   Thư viện chỉ tải khi người dùng bấm lần đầu nên không ảnh hưởng tốc độ tải trang.
 * - Video (iframe YouTube/Drive): không bắt được click bên trong iframe → nút "Phóng to" trên khung.
 *   Thiết bị cảm ứng / màn hình thấp: toàn màn hình (Fullscreen API). Còn lại: xem lớn trong trang —
 *   chỉ đổi CSS của khung (không di chuyển iframe trong DOM) nên video không bị tải lại / dừng.
 */
export function useArticleMediaViewer (
  contentRef: Ref<HTMLElement | null>,
  closeButtonRef: Ref<HTMLElement | null>
) {
  const { t, locale } = useI18n()
  const expandedVideo = ref<HTMLElement | null>(null)

  let pswp: PhotoSwipe | null = null
  let opening = false
  let disposed = false
  let placeholder: HTMLElement | null = null
  let videoOpener: HTMLElement | null = null
  let fullscreenTimer: ReturnType<typeof setTimeout> | undefined

  // ---------- Ảnh ----------

  function zoomableImages (): HTMLImageElement[] {
    const root = contentRef.value
    if (!root) return []
    return [...root.querySelectorAll('img')].filter(img => !img.closest('a') && (img.currentSrc || img.src))
  }

  function itemSize (el: HTMLImageElement, src: string) {
    const known = el.naturalWidth > 0 && el.naturalHeight > 0
    if (!known) {
      return {
        width: el.clientWidth ? el.clientWidth * 2 : 1600,
        height: el.clientHeight ? el.clientHeight * 2 : 1000,
        sizeUnknown: true
      }
    }
    let width = el.naturalWidth
    let height = el.naturalHeight
    // SVG chỉ có viewBox báo kích thước mặc định rất nhỏ; ảnh bị kéo to trong editor lớn hơn kích thước gốc
    const isSvg = SVG_RE.test(src)
    if (isSvg || el.clientWidth > width) {
      const target = isSvg ? Math.max(el.clientWidth, window.innerWidth) * 2 : el.clientWidth
      height = Math.round(target * height / width)
      width = target
    }
    return { width, height, sizeUnknown: false }
  }

  function destroyViewer () {
    const instance = pswp
    if (!instance || instance.isDestroying) return
    // destroy() không có tác dụng khi đang chạy hiệu ứng mở → đợi mở xong
    if (instance.opener.isOpen) instance.destroy()
    else instance.on('openingAnimationEnd', () => instance.destroy())
  }

  async function openImage (img: HTMLImageElement) {
    if (opening || pswp) return
    opening = true
    try {
      const images = zoomableImages()
      const index = Math.max(0, images.indexOf(img))
      const dataSource: ViewerItem[] = images.map((el) => {
        const src = el.currentSrc || el.src
        return { src, msrc: src, alt: el.alt, element: el, ...itemSize(el, src) }
      })

      const [{ default: PhotoSwipeCtor }] = await Promise.all([
        import('photoswipe'),
        import('photoswipe/style.css')
      ])
      // Người dùng đã rời trang / nội dung đã đổi trong lúc tải thư viện
      if (disposed || !img.isConnected) return

      const instance = new PhotoSwipeCtor({
        dataSource,
        index,
        bgOpacity: 0.92,
        showHideAnimationType: 'zoom',
        wheelToZoom: true,
        paddingFn: viewport => viewport.x >= 768
          ? { top: 56, bottom: 32, left: 72, right: 72 }
          : { top: 0, bottom: 0, left: 0, right: 0 },
        closeTitle: t('post.viewerClose'),
        zoomTitle: t('post.viewerZoom'),
        arrowPrevTitle: t('post.viewerPrev'),
        arrowNextTitle: t('post.viewerNext'),
        errorMsg: t('post.viewerError'),
        indexIndicatorSep: ' / '
      })
      pswp = instance

      // Slide tạo sau khi ảnh (preload) đã tải xong: sửa kích thước trước khi dàn layout
      instance.on('slideInit', ({ slide }) => {
        const item = dataSource[slide.index]
        const content = slide.content
        const el = content.element as HTMLImageElement | undefined
        if (!item?.sizeUnknown || content.state !== 'loaded' || !el?.naturalWidth) return
        item.width = slide.width = content.width = el.naturalWidth
        item.height = slide.height = content.height = el.naturalHeight
        item.sizeUnknown = false
      })

      // Ảnh tải xong khi slide đã hiển thị: cập nhật kích thước rồi vẽ lại slide
      instance.on('loadComplete', ({ content }) => {
        if (instance.isDestroying) return
        const i = content.index
        const item = dataSource[i]
        const el = content.element as HTMLImageElement | undefined
        if (!item?.sizeUnknown || !el?.naturalWidth) return
        item.width = el.naturalWidth
        item.height = el.naturalHeight
        item.sizeUnknown = false
        const refresh = () => {
          if (!instance.isDestroying && instance.opener.isOpen) instance.refreshSlideContent(i)
        }
        if (instance.opener.isOpen) requestAnimationFrame(refresh)
        else instance.on('openingAnimationEnd', refresh)
      })

      instance.on('destroy', () => {
        if (pswp === instance) pswp = null
      })
      instance.init()
    } finally {
      opening = false
    }
  }

  // ---------- Video ----------

  function canUseFullscreen (wrapper: HTMLElement): boolean {
    return document.fullscreenEnabled && typeof wrapper.requestFullscreen === 'function'
  }

  /** Chế độ xem lớn trong trang có làm video to hơn đáng kể không (điện thoại dọc/ngang thường là không) */
  function inPageGain (wrapper: HTMLElement): boolean {
    const short = window.innerHeight < 500
    const target = Math.min(
      window.innerWidth - (short ? 112 : 24),
      (window.innerHeight - (short ? 16 : 128)) * 16 / 9
    )
    return target > wrapper.getBoundingClientRect().width * 1.15
  }

  function prefersFullscreen (wrapper: HTMLElement): boolean {
    return window.matchMedia('(pointer: coarse)').matches
      || window.innerHeight < 500
      || !inPageGain(wrapper)
  }

  /** Ẩn nút khi không có cách nào phóng to (vd. iPhone: không có Fullscreen API, video đã full ngang) */
  function updateExpandButtons () {
    const root = contentRef.value
    if (!root) return
    for (const btn of root.querySelectorAll<HTMLElement>('[data-embed-expand]')) {
      const wrapper = btn.closest<HTMLElement>('.post-embed-video')
      if (!wrapper || wrapper.classList.contains('is-expanded')) continue
      btn.hidden = !canUseFullscreen(wrapper) && !inPageGain(wrapper)
      btn.setAttribute('aria-label', t('post.expandVideo'))
      btn.title = t('post.expandVideo')
    }
  }

  function clearFullscreenTimer () {
    if (fullscreenTimer) clearTimeout(fullscreenTimer)
    fullscreenTimer = undefined
  }

  function enterFullscreen (wrapper: HTMLElement) {
    let settled = false
    const fallback = () => {
      if (settled) return
      settled = true
      clearFullscreenTimer()
      if (!disposed && wrapper.isConnected && !document.fullscreenElement && inPageGain(wrapper)) {
        expandInPage(wrapper)
      }
    }
    // Một số webview không trả lời yêu cầu toàn màn hình → không để người dùng bấm mà không thấy gì
    fullscreenTimer = setTimeout(fallback, 800)
    const onChange = () => {
      if (document.fullscreenElement) return
      document.removeEventListener('fullscreenchange', onChange)
      videoOpener?.focus({ preventScroll: true })
    }
    wrapper.requestFullscreen()
      .then(() => {
        settled = true
        clearFullscreenTimer()
        // Dự phòng đã mở chế độ xem trong trang trước khi trình duyệt vào toàn màn hình
        if (expandedVideo.value === wrapper) collapseVideo({ restoreFocus: false })
        document.addEventListener('fullscreenchange', onChange)
        return (screen.orientation as LockableOrientation | undefined)?.lock?.('landscape')
      })
      .catch(fallback)
  }

  function onFocusIn (e: FocusEvent) {
    const wrapper = expandedVideo.value
    const target = e.target as Node | null
    if (!wrapper || !target) return
    if (wrapper.contains(target) || closeButtonRef.value?.contains(target)) return
    // Focus lọt ra phía sau nền tối → đưa về nút đóng
    closeButtonRef.value?.focus()
  }

  function onGlobalKeydown (e: KeyboardEvent) {
    const wrapper = expandedVideo.value
    if (!wrapper) return
    if (e.key === 'Escape') {
      collapseVideo()
      return
    }
    // Tab từ nút đóng → vào trình phát (focus trong iframe không phát sự kiện ra ngoài; quay lại nhờ focusin)
    if (e.key === 'Tab' && document.activeElement === closeButtonRef.value) {
      e.preventDefault()
      wrapper.querySelector<HTMLIFrameElement>('iframe')?.focus()
    }
  }

  function expandInPage (wrapper: HTMLElement) {
    if (expandedVideo.value) collapseVideo({ restoreFocus: false })
    // Giữ chỗ trong bài để nội dung phía sau không bị nhảy khi khung video tách ra
    placeholder = document.createElement('div')
    placeholder.className = 'post-embed-placeholder'
    wrapper.after(placeholder)
    wrapper.classList.add('is-expanded')
    expandedVideo.value = wrapper
    document.documentElement.style.overflow = 'hidden'
    window.addEventListener('keydown', onGlobalKeydown)
    document.addEventListener('focusin', onFocusIn)
    nextTick(() => closeButtonRef.value?.focus())
  }

  function expandVideo (wrapper: HTMLElement, opener: HTMLElement) {
    videoOpener = opener
    if (canUseFullscreen(wrapper) && prefersFullscreen(wrapper)) enterFullscreen(wrapper)
    else expandInPage(wrapper)
  }

  function collapseVideo (opts: { restoreFocus?: boolean } = {}) {
    clearFullscreenTimer()
    const wrapper = expandedVideo.value
    if (!wrapper) return
    wrapper.classList.remove('is-expanded')
    placeholder?.remove()
    placeholder = null
    expandedVideo.value = null
    document.documentElement.style.overflow = ''
    window.removeEventListener('keydown', onGlobalKeydown)
    document.removeEventListener('focusin', onFocusIn)
    if (opts.restoreFocus !== false && videoOpener?.isConnected) {
      nextTick(() => videoOpener?.focus({ preventScroll: true }))
    }
  }

  // ---------- Chung ----------

  /** Gọi sau mỗi lần v-html render lại: bàn phím cho ảnh, nhãn + hiển thị nút video */
  function enhanceMedia () {
    for (const img of zoomableImages()) {
      img.tabIndex = 0
      img.setAttribute('role', 'button')
      img.setAttribute('aria-label', img.alt ? `${t('post.zoomImage')}: ${img.alt}` : t('post.zoomImage'))
    }
    updateExpandButtons()
  }

  /** Nội dung bài đổi (v-html thay DOM) → đóng mọi thứ đang mở */
  function resetMedia () {
    destroyViewer()
    collapseVideo({ restoreFocus: false })
  }

  /** Gắn vào @click của khối nội dung (v-html) — event delegation */
  function onContentClick (e: MouseEvent) {
    const target = e.target as HTMLElement | null
    const expandBtn = target?.closest<HTMLElement>('[data-embed-expand]')
    if (expandBtn) {
      const wrapper = expandBtn.closest<HTMLElement>('.post-embed-video')
      if (wrapper) expandVideo(wrapper, expandBtn)
      return
    }
    if (target instanceof HTMLImageElement && zoomableImages().includes(target)) {
      e.preventDefault()
      openImage(target)
    }
  }

  function onContentKeydown (e: KeyboardEvent) {
    if ((e.key !== 'Enter' && e.key !== ' ') || e.repeat) return
    const target = e.target
    if (target instanceof HTMLImageElement && zoomableImages().includes(target)) {
      e.preventDefault()
      openImage(target)
    }
  }

  let resizeFrame = 0
  function onResize () {
    cancelAnimationFrame(resizeFrame)
    resizeFrame = requestAnimationFrame(updateExpandButtons)
  }

  watch(locale, () => nextTick(enhanceMedia))

  onMounted(() => window.addEventListener('resize', onResize))

  onBeforeUnmount(() => {
    disposed = true
    window.removeEventListener('resize', onResize)
    cancelAnimationFrame(resizeFrame)
    resetMedia()
  })

  return {
    expandedVideo,
    enhanceMedia,
    resetMedia,
    collapseVideo,
    onContentClick,
    onContentKeydown
  }
}
