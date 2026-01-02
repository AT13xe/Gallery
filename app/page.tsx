"use client"

import { useState } from "react"
import { ImageGallery } from "@/components/image-gallery"
import { ModeToggle } from "@/components/mode-toggle"

// ① 统一定义 Gallery 类型
type GalleryType = "horizontal" | "vertical" | "Genshin" | "avatar" | "mia" | "しとね"

// ② 类型配置（以后只改这里）
const galleryTypes: { key: GalleryType; label: string }[] = [
  { key: "horizontal", label: "横屏" },
  { key: "vertical", label: "竖屏" },
  { key: "Genshin", label: "原神" },
  { key: "avatar", label: "头像" },
  { key: "mia", label: "mia" },
  { key: "しとね", label: "しとね" },
]

export default function Home() {
  const [galleryType, setGalleryType] = useState<GalleryType>("horizontal")

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-serif font-bold tracking-tight text-balance">
              AT13xe PicGallery
            </h1>

            <div className="flex items-center gap-4">
              {/* ③ 切换按钮 */}
              <div className="flex gap-2 rounded-lg bg-muted p-1">
                {galleryTypes.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setGalleryType(item.key)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      galleryType === item.key
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <ModeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* ④ key 用于强制重载 Gallery */}
        <ImageGallery key={galleryType} type={galleryType} />
      </main>
    </div>
  )
}