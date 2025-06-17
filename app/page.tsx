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
      <div className="fixed inset-0 bg-background z-50">
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

        {showSettings && (
          <div className="absolute top-14 left-2 right-2 z-10 bg-card/95 backdrop-blur-sm border rounded-lg shadow-lg max-h-[70vh] overflow-y-auto">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-semibold">設定</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
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
    <div className="min-h-screen bg-background p-4 lg:p-6">
      <div className="h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)] grid grid-cols-1 xl:grid-cols-4 gap-6">
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
            <PeriodSelector />
            <TimeFilter />
          </CardContent>
        </Card>

        <div className="xl:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">単語ネットワーク</CardTitle>
                <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                  <Maximize2 className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">フルスクリーン</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-full">
              <div className="w-full" style={{ height: "calc(100% - 80px)" }}>
                <WordNetwork />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
