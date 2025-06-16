"use client"

import { useState } from "react"
import WordNetwork from "@/components/word-network"
import { ThresholdSlider } from "@/components/threshold-slider"
import { TimeFilter } from "@/components/time-filter"
import { PeriodSelector } from "@/components/period-selector"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, X, Maximize2, Minimize2 } from "lucide-react"

export function NetworkSection() {
  const [showSettings, setShowSettings] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    setShowSettings(false)
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-background z-50">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
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
          <Card className="absolute top-16 right-4 left-4 sm:left-auto sm:w-80 z-10 max-h-96 overflow-y-auto">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PeriodSelector />
              <ThresholdSlider />
              <TimeFilter />
            </CardContent>
          </Card>
        )}

        <div className="w-full h-full">
          <WordNetwork />
        </div>
      </div>
    )
  }

  return (
    <section id="network" className="py-12 sm:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            インタラクティブネットワーク
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            単語間の関連性を直感的に理解できるネットワーク可視化
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* 設定パネル - デスクトップ */}
          <Card className="hidden xl:block xl:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
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

          {/* ネットワーク表示エリア */}
          <div className="xl:col-span-3">
            <Card className="h-[500px] sm:h-[600px] lg:h-[700px]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>単語ネットワーク</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="xl:hidden"
                      onClick={() => setShowSettings(!showSettings)}
                    >
                      {showSettings ? <X className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                      <span className="ml-2 hidden sm:inline">{showSettings ? "閉じる" : "設定"}</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                      <Maximize2 className="h-4 w-4" />
                      <span className="ml-2 hidden sm:inline">フルスクリーン</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* モバイル設定パネル */}
              {showSettings && (
                <div className="xl:hidden border-b bg-muted/50">
                  <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">期間設定</h3>
                        <PeriodSelector />
                      </div>
                      <div>
                        <ThresholdSlider />
                      </div>
                    </div>
                    <TimeFilter />
                  </div>
                </div>
              )}

              <CardContent className="p-0 h-full">
                <div
                  className="w-full h-full"
                  style={{
                    height: showSettings && window.innerWidth < 1280 ? "calc(100% - 200px)" : "100%",
                  }}
                >
                  <WordNetwork />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
