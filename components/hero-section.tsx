"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

export function HeroSection() {
  const scrollToNetwork = () => {
    document.getElementById("network")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between py-12 sm:py-16 lg:py-20">
          {/* テキストコンテンツ */}
          <div className="flex-1 text-center lg:text-left lg:pr-12">
            <div className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground mb-6">
              <span className="mr-2">🚀</span>
              レスポンシブ対応
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-foreground mb-6">
              単語ネットワーク
              <br />
              <span className="text-primary">可視化ツール</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
              単語間の関連性を美しいネットワークグラフで可視化。
              モバイル、タブレット、デスクトップすべてのデバイスで最適な表示を実現します。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={scrollToNetwork}
              >
                今すぐ始める
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                <Play className="mr-2 h-4 w-4" />
                デモを見る
              </Button>
            </div>
          </div>

          {/* 画像/イラストエリア */}
          <div className="flex-1 mt-12 lg:mt-0">
            <div className="relative">
              <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center">
                <div className="w-full h-full bg-muted/30 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div className="text-sm text-muted-foreground">レスポンシブ対応</div>
                  </div>
                </div>
              </div>

              {/* 装飾要素 */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary/20 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-primary/30 rounded-full animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
