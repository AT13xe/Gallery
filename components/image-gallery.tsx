"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { Fancybox } from "@fancyapps/ui"
import "@fancyapps/ui/dist/fancybox/fancybox.css"

/* =======================
   ① 类型统一定义
======================= */
export type GalleryType = "horizontal" | "vertical" | "Genshin" | "avatar" | "mia" | "しとね"

interface ImageGalleryProps {
  type: GalleryType
}

interface ImageItem {
  id: number
  url: string
}

declare global {
  interface Window {
    __picCounts?: {
      h: number
      v: number
      ys: number
      tx: number
      mia: number
      a: number
    }
  }
}

/* =======================
   ② 类型配置中心（核心）
======================= */
const TYPE_CONFIG: Record<
  GalleryType,
  {
    baseUrl: string
    countKey: "h" | "v" | "ys" | "tx" | "mia" | "a"
    aspect?: string
  }
> = {
  horizontal: {
    baseUrl: "https://img.at13xe.top/ri/h",
    countKey: "h",
  },
  vertical: {
    baseUrl: "https://img.at13xe.top/ri/v",
    countKey: "v",
  },
  Genshin: {
    baseUrl: "https://img.at13xe.top/ri/ys",
    countKey: "ys",
  },
  avatar: {
    baseUrl: "https://img.at13xe.top/ri/tx",
    countKey: "tx",
  },
  mia: {
    baseUrl: "https://img.at13xe.top/ri/mia",
    countKey: "mia",
  },
  しとね: {
    baseUrl: "https://img.at13xe.top/ri/a",
    countKey: "a",
  },
}

export function ImageGallery({ type }: ImageGalleryProps) {
  const [images, setImages] = useState<ImageItem[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [maxCount, setMaxCount] = useState(0)
  const [countsLoaded, setCountsLoaded] = useState(false)

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const galleryContainerRef = useRef<HTMLDivElement>(null)
  const initialLoadDone = useRef(false)

  const IMAGES_PER_PAGE = 20
  const config = TYPE_CONFIG[type]

  /* =======================
     ③ 列数响应式
  ======================= */
  const getColumnCount = () => {
    if (typeof window === "undefined") return 3
    if (window.innerWidth < 768) return 2
    if (window.innerWidth < 1024) return 3
    return 4
  }

  /* =======================
     ④ 获取最大数量
  ======================= */
  useEffect(() => {
    const fallbackCounts = { h: 788, v: 995, ys: 744, tx: 893, mia:248, a:611 }

    if (window.__picCounts) {
      setMaxCount(window.__picCounts[config.countKey] ?? fallbackCounts[config.countKey])
      setCountsLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://img.at13xe.top/random.js"
    script.async = true

    script.onload = () => {
      setTimeout(() => {
        const counts = window.__picCounts || fallbackCounts
        setMaxCount(counts[config.countKey])
        setCountsLoaded(true)
      }, 100)
    }

    script.onerror = () => {
      setMaxCount(fallbackCounts[config.countKey])
      setCountsLoaded(true)
    }

    document.head.appendChild(script)
  }, [type, config.countKey])

  /* =======================
     ⑤ 加载图片
  ======================= */
  const loadImages = useCallback(() => {
    if (loading || !countsLoaded) return

    const startId = (page - 1) * IMAGES_PER_PAGE + 1
    const endId = Math.min(page * IMAGES_PER_PAGE, maxCount)
    if (startId > maxCount) return

    setLoading(true)

    const newImages: ImageItem[] = []
    for (let i = startId; i <= endId; i++) {
      newImages.push({
        id: i,
        url: `${config.baseUrl}/${i}.jpg`,
      })
    }

    setImages((prev) => [...prev, ...newImages])
    setPage((p) => p + 1)
    setLoading(false)
  }, [page, loading, countsLoaded, maxCount, config.baseUrl])

  /* =======================
     ⑥ 切换类型重置
  ======================= */
  useEffect(() => {
    setImages([])
    setPage(1)
    initialLoadDone.current = false
  }, [type])

  useEffect(() => {
    if (countsLoaded && !initialLoadDone.current) {
      initialLoadDone.current = true
      loadImages()
    }
  }, [countsLoaded, loadImages])

  /* =======================
     ⑦ 无限滚动
  ======================= */
  useEffect(() => {
    observerRef.current?.disconnect()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) loadImages()
      },
      { threshold: 0.5 },
    )

    loadMoreRef.current && observerRef.current.observe(loadMoreRef.current)

    return () => observerRef.current?.disconnect()
  }, [loadImages, loading])

  /* =======================
     ⑧ Fancybox
  ======================= */
  useEffect(() => {
    if (!galleryContainerRef.current) return

    Fancybox.bind(galleryContainerRef.current, "[data-fancybox]", {
      Thumbs: { type: "classic" },
    } as any)

    return () => Fancybox.unbind(galleryContainerRef.current)
  }, [images])

  /* =======================
     ⑨ 瀑布流渲染
  ======================= */
  const renderMasonry = () => {
    const columnCount = getColumnCount()
    const columns: ImageItem[][] = Array.from({ length: columnCount }, () => [])

    images.forEach((img, i) => columns[i % columnCount].push(img))

    return (
      <div className="flex gap-4">
        {columns.map((col, i) => (
          <div key={i} className="flex flex-col gap-4 flex-1">
            {col.map((img) => (
              <div
                key={`${type}-${img.id}`}
                className={`group overflow-hidden rounded-lg bg-muted ${
                  config.aspect ?? ""
                }`}
              >
                <a data-fancybox="gallery" href={img.url}>
                  <Image
                    src={img.url}
                    alt=""
                    width={800}
                    height={600}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </a>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div ref={galleryContainerRef}>
      {renderMasonry()}

      <div ref={loadMoreRef} className="py-10 text-center text-muted-foreground">
        {loading && "加载中..."}
        {!loading && images.length >= maxCount && `已加载全部 ${maxCount} 张`}
      </div>
    </div>
  )
}