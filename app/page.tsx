"use client"

import { useState, useEffect } from "react"
import WordNetwork from "@/components/word-network"
import { ThresholdSlider } from "@/components/threshold-slider"
import { TimeFilter } from "@/components/time-filter"
import { PeriodSelector } from "@/components/period-selector"
import { Button } from "@/components/ui/button"
import { Settings, X, Maximize2, Minimize2 } from "lucide-react"

export default function Home() {
  const [showSettings, setShowSettings] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    setShowSettings(false) // フルスクリーン時は設定を閉じる
  }

  if (isFullscreen && isMobile) {
    return (
      <div className="fixed inset-0 bg-background z-50">
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="bg-background/90 backdrop-blur-sm"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullscreen} className="bg-background/90 backdrop-blur-sm">
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>

        {showSettings && (
          <div className="absolute top-16 right-2 left-2 bg-card/95 backdrop-blur-sm border rounded-lg p-4 z-10 max-h-80 overflow-y-auto">
            <div className="space-y-4">
              <PeriodSelector />
              <ThresholdSlider />
              <TimeFilter />
            </div>
          </div>
        )}

        <div className="w-full h-full">
          <WordNetwork />
        </div>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col">
      {/* モバイル用ヘッダー */}
      <div className="bg-background border-b px-3 py-3 md:px-8 md:py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-lg sm:text-xl md:text-3xl font-bold truncate">単語ネットワーク可視化</h1>

          <div className="flex items-center gap-2">
            {isMobile && (
              <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowSettings(!showSettings)}>
              {showSettings ? <X className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
              <span className="ml-2 hidden sm:inline">{showSettings ? "閉じる" : "設定"}</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* デスクトップ用サイドバー */}
        <div className="hidden lg:block lg:w-80 lg:flex-shrink-0 bg-card border-r">
          <div className="p-6 space-y-6 h-full overflow-y-auto">
            <h2 className="text-xl font-semibold">設定</h2>

            <div className="border-b pb-4">
              <h3 className="text-lg font-medium mb-3">期間設定</h3>
              <PeriodSelector />
            </div>

            <ThresholdSlider />
            <TimeFilter />

            <div className="mt-8">
              <h3 className="text-lg font-medium mb-2">ノードサイズの凡例</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gray-500 mr-2 flex-shrink-0"></div>
                  <span className="text-sm">1時間未満</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-500 mr-2 flex-shrink-0"></div>
                  <span className="text-sm">1〜5時間</span>
                </div>
                <div className="flex items-center">
                  <div className="w-9 h-9 rounded-full bg-gray-500 mr-2 flex-shrink-0"></div>
                  <span className="text-sm">5〜10時間</span>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-500 mr-2 flex-shrink-0"></div>
                  <span className="text-sm">10時間以上</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* モバイル用設定パネル */}
        {showSettings && (
          <div className="lg:hidden bg-card border-b flex-shrink-0">
            <div className="p-3 sm:p-4 space-y-4 max-h-80 overflow-y-auto mobile-scroll">
              <div className="border-b pb-3">
                <h3 className="text-sm sm:text-base font-medium mb-2">期間設定</h3>
                <PeriodSelector />
              </div>

              <ThresholdSlider />
              <TimeFilter />

              <div>
                <h3 className="text-sm sm:text-base font-medium mb-2">ノードサイズ</h3>
                <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-500 mr-2 flex-shrink-0"></div>
                    <span>1時間未満</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-gray-500 mr-2 flex-shrink-0"></div>
                    <span>1〜5時間</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-full bg-gray-500 mr-2 flex-shrink-0"></div>
                    <span>5〜10時間</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gray-500 mr-2 flex-shrink-0"></div>
                    <span>10時間以上</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* メインコンテンツエリア */}
        <div className="flex-1 bg-card min-h-0">
          <div
            className="w-full h-full"
            style={{
              height: showSettings ? "calc(100vh - 120px - 320px)" : "calc(100vh - 120px)",
              minHeight: "300px",
            }}
          >
            <WordNetwork />
          </div>
        </div>
      </div>
    </main>
  )
}
