"use client"

import { useState, useEffect } from "react"
import WordNetwork from "@/components/word-network"
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
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    setShowSettings(false)
  }

  if (isFullscreen || isMobile) {
    return (
      <div
        className="fixed inset-0 z-50"
        style={{ background: "linear-gradient(135deg, #fce7f3 0%, #f3e8ff 50%, #e0e7ff 100%)" }}
      >
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="bg-white/90 backdrop-blur-sm border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            <Settings className="h-4 w-4" />
          </Button>
          {!isMobile && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="bg-white/90 backdrop-blur-sm border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {showSettings && (
          <div className="absolute top-16 left-4 right-4 z-10 bg-white/95 backdrop-blur-sm border border-purple-200 rounded-xl shadow-xl max-h-[70vh] overflow-y-auto">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-purple-200 pb-3">
                <h3 className="font-semibold text-purple-800">設定</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)} className="text-purple-600">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <PeriodSelector />
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
    <div
      className="min-h-screen relative"
      style={{ background: "linear-gradient(135deg, #fce7f3 0%, #f3e8ff 50%, #e0e7ff 100%)" }}
    >
      {/* 設定パネル - デスクトップ */}
      <Card className="absolute top-6 left-6 w-80 z-10 bg-white/90 backdrop-blur-sm border-purple-200 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg text-purple-800">
            設定
            <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-purple-600">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <PeriodSelector />
          <TimeFilter />
        </CardContent>
      </Card>

      {/* ネットワーク表示エリア - 画面全体 */}
      <div className="fixed inset-0">
        <WordNetwork />
      </div>
    </div>
  )
}
