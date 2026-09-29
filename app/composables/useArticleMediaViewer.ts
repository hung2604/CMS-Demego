import type { Ref } from 'vue'

type ViewerItem = {
  src: string
  msrc: string
  alt: string
  element: HTMLImageElement
  width: number
  height: number
  /** Ảnh chưa tải xong lúc mở → kích thước tạm, cập nhật khi PhotoSwipe tải xong */
  sizeUnknown: boolean
}

/**
 * Phóng to ảnh / video trong nội dung bài (trang khách).
 * - Ảnh: PhotoSwipe — zoom tới kích thước gốc, vuốt/pinch trên mobile, ← → chuyển ảnh.
 *   Thư viện chỉ tải khi người dùng bấm lần đầu nên không ảnh hưởng tốc độ tải trang.
 * - Video (iframe YouTube/Drive): không bắt được click bên trong iframe → nút "Phóng to" trên khung.
 *   Chỉ đổi CSS của khung (không di chuyển iframe trong DOM) nên video không bị tải lại / dừng.
 */
export function useArticleMediaViewer (contentRef: Ref<HTMLElement | null>) {
  const { t } = useI18n()
  const expandedVideo = ref<HTMLElement | null>(null)
  let placeholder: HTMLElement | null = null

  function zoomableImages (): HTMLImageElement[] {
    const root = contentRef.value
    if (!root) return []
    return [...root.querySelectorAll('img')].filter(img => !img.closest('a') && (img.currentSrc || img.src))
  }

  /** Cho phép mở ảnh bằng bàn phím (Tab → Enter/Space) */
  function enhanceMedia () {
    for (const img of zoomableImages()) {
      img.tabIndex = 0
      img.setAttribute('role', 'button')
      img.setAttribute('aria-label', img.alt ? `${t('post.zoomImage')}: ${img.alt}` : t('post.zoomImage'))
    }
  }

  async function openImage (img: HTMLImageElement) {
    const images = zoomableImages()
    const index = Math.max(0, images.indexOf(img))
    const dataSource: ViewerItem[] = images.map((el) => {
      const src = el.currentSrc || el.src
      const known = el.naturalWidth > 0 && el.naturalHeight > 0
      return {
        src,
        msrc: src,
        alt: el.alt,
        element: el,
        width: known ? el.naturalWidth : (el.clientWidth ? el.clientWidth * 2 : 1600),
        height: known ? el.naturalHeight : (el.clientHeight ? el.clientHeight * 2 : 1000),
        sizeUnknown: !known
      }
    })

    const [{ default: PhotoSwipe }] = await Promise.all([
      import('photoswipe'),
      import('photoswipe/style.css')
    ])

    const pswp = new PhotoSwipe({
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

    pswp.on('loadComplete', ({ content }) => {
      const item = dataSource[content.index]
      const el = content.element as HTMLImageElement | undefined
      if (!item?.sizeUnknown || !el?.naturalWidth) return
      item.width = el.naturalWidth
      item.height = el.naturalHeight
      item.sizeUnknown = false
      requestAnimationFrame(() => pswp.refreshSlideContent(content.index))
    })

    pswp.init()
  }

  function onGlobalKeydown (e: KeyboardEvent) {
    if (e.key === 'Escape') collapseVideo()
  }

  type LockableOrientation = ScreenOrientation & { lock?: (o: 'landscape') => Promise<void> }

  function expandVideo (wrapper: HTMLElement) {
    // Điện thoại: khung video vốn đã full ngang → dùng toàn màn hình + xoay ngang nếu trình duyệt hỗ trợ
    // (Android/Chrome). iPhone không có Fullscreen API cho phần tử thường → dùng chế độ xem lớn bên dưới.
    const narrow = window.matchMedia('(max-width: 767px)').matches
    if (narrow && document.fullscreenEnabled && wrapper.requestFullscreen) {
      let settled = false
      const fallback = () => {
        if (settled) return
        settled = true
        if (!document.fullscreenElement) expandInPage(wrapper)
      }
      // Một số webview không trả lời yêu cầu toàn màn hình → không để người dùng bấm mà không thấy gì
      const timer = setTimeout(fallback, 800)
      wrapper.requestFullscreen()
        .then(() => {
          settled = true
          clearTimeout(timer)
          return (screen.orientation as LockableOrientation | undefined)?.lock?.('landscape')
        })
        .catch(() => {
          clearTimeout(timer)
          fallback()
        })
      return
    }
    expandInPage(wrapper)
  }

  function expandInPage (wrapper: HTMLElement) {
    if (expandedVideo.value) collapseVideo()
    // Giữ chỗ trong bài để nội dung phía sau không bị nhảy khi khung video tách ra
    placeholder = document.createElement('div')
    placeholder.className = 'post-embed-placeholder'
    wrapper.after(placeholder)
    wrapper.classList.add('is-expanded')
    expandedVideo.value = wrapper
    document.documentElement.style.overflow = 'hidden'
    window.addEventListener('keydown', onGlobalKeydown)
  }

  function collapseVideo () {
    const wrapper = expandedVideo.value
    if (!wrapper) return
    wrapper.classList.remove('is-expanded')
    placeholder?.remove()
    placeholder = null
    expandedVideo.value = null
    document.documentElement.style.overflow = ''
    window.removeEventListener('keydown', onGlobalKeydown)
  }

  /** Gắn vào @click của khối nội dung (v-html) — event delegation */
  function onContentClick (e: MouseEvent) {
    const target = e.target as HTMLElement | null
    const expandBtn = target?.closest<HTMLElement>('[data-embed-expand]')
    if (expandBtn) {
      const wrapper = expandBtn.closest<HTMLElement>('.post-embed-video')
      if (wrapper) expandVideo(wrapper)
      return
    }
    if (target instanceof HTMLImageElement && zoomableImages().includes(target)) {
      e.preventDefault()
      openImage(target)
    }
  }

  function onContentKeydown (e: KeyboardEvent) {
    if (e.key !== 'Enter' && e.key !== ' ') return
    const target = e.target
    if (target instanceof HTMLImageElement && zoomableImages().includes(target)) {
      e.preventDefault()
      openImage(target)
    }
  }

  onUnmounted(() => collapseVideo())

  return {
    expandedVideo,
    enhanceMedia,
    collapseVideo,
    onContentClick,
    onContentKeydown
  }
}
