"use client"

import { useState, useEffect } from "react"
import WordNetwork from "@/components/word-network"
import { ThresholdSlider } from "@/components/threshold-slider"
import { TimeFilter } from "@/components/time-filter"
import { PeriodSelector } from "@/components/period-selector"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    setShowSettings(false)
  }

  // モバイルでのフルスクリーン表示
  if (isFullscreen || isMobile) {
    return (
      <div className="fixed inset-0 bg-background z-50">
        {/* モバイル用コントロールボタン */}
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="bg-background/90 backdrop-blur-sm border-2"
          >
            <Settings className="h-4 w-4" />
          </Button>
          {!isMobile && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="bg-background/90 backdrop-blur-sm border-2"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* モバイル設定パネル */}
        {showSettings && (
          <div className="absolute top-14 left-2 right-2 z-10 bg-card/95 backdrop-blur-sm border rounded-lg shadow-lg max-h-[70vh] overflow-y-auto">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-semibold">設定</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">期間設定</h4>
                  <PeriodSelector />
                </div>

                <div>
                  <ThresholdSlider />
                </div>

                <div>
                  <TimeFilter />
                </div>

                <div className="pt-2 border-t">
                  <h4 className="text-sm font-medium mb-2">ノードサイズ凡例</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { size: "w-2 h-2", label: "1時間未満" },
                      { size: "w-3 h-3", label: "1〜5時間" },
                      { size: "w-4 h-4", label: "5〜10時間" },
                      { size: "w-5 h-5", label: "10時間以上" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className={`${item.size} rounded-full bg-primary/60 flex-shrink-0`}></div>
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* フルスクリーンネットワーク */}
        <div className="w-full h-full">
          <WordNetwork />
        </div>
      </div>
    )
  }

  // デスクトップ表示
  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 lg:p-6">
      <div className="h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)] grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
        {/* 設定パネル - デスクトップ */}
        <Card className="hidden xl:block xl:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              設定
              <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-sm font-medium mb-3">期間設定</h3>
              <PeriodSelector />
            </div>
            <ThresholdSlider />
            <TimeFilter />

            <div className="pt-4">
              <h3 className="text-sm font-medium mb-3">ノードサイズの凡例</h3>
              <div className="space-y-2">
                {[
                  { size: "w-2 h-2", label: "1時間未満" },
                  { size: "w-4 h-4", label: "1〜5時間" },
                  { size: "w-6 h-6", label: "5〜10時間" },
                  { size: "w-8 h-8", label: "10時間以上" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className={`${item.size} rounded-full bg-primary/60 flex-shrink-0`}></div>
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ネットワーク表示エリア - デスクトップ */}
        <div className="xl:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">単語ネットワーク</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                    <Maximize2 className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">フルスクリーン</span>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 h-full">
              <div className="w-full h-full" style={{ height: "calc(100% - 80px)" }}>
                <WordNetwork />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
