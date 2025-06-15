"use client"

import { useState } from "react"
import WordNetwork from "@/components/word-network"
import { ThresholdSlider } from "@/components/threshold-slider"
import { TimeFilter } from "@/components/time-filter"
import { PeriodSelector } from "@/components/period-selector"
import { Button } from "@/components/ui/button"
import { Settings, X } from "lucide-react"

export default function Home() {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <main className="flex min-h-screen flex-col">
      {/* ヘッダー */}
      <div className="bg-background border-b px-4 py-4 md:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-3xl font-bold">単語ネットワーク可視化</h1>

          {/* モバイル用設定ボタン */}
          <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowSettings(!showSettings)}>
            {showSettings ? <X className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
            <span className="ml-2">{showSettings ? "閉じる" : "設定"}</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* サイドバー - デスクトップ */}
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
          <div className="lg:hidden bg-card border-b">
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              <div className="border-b pb-4">
                <h3 className="text-base font-medium mb-3">期間設定</h3>
                <PeriodSelector />
              </div>

              <ThresholdSlider />
              <TimeFilter />

              <div>
                <h3 className="text-base font-medium mb-2">ノードサイズの凡例</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-500 mr-2 flex-shrink-0"></div>
                    <span>1時間未満</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-500 mr-2 flex-shrink-0"></div>
                    <span>1〜5時間</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-9 h-9 rounded-full bg-gray-500 mr-2 flex-shrink-0"></div>
                    <span>5〜10時間</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-500 mr-2 flex-shrink-0"></div>
                    <span>10時間以上</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* メインコンテンツエリア */}
        <div className="flex-1 bg-card">
          <div
            className="w-full h-full"
            style={{
              height: showSettings ? "calc(100vh - 200px - 400px)" : "calc(100vh - 200px)",
              minHeight: "400px",
            }}
          >
            <WordNetwork />
          </div>
        </div>
      </div>
    </main>
  )
}
