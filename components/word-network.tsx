"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import { calculateSimilarities } from "@/lib/similarity"
import { kmeansClustering } from "@/lib/clustering"
import { sampleWordData, availablePeriods } from "@/lib/sample-data"
import { useWordNetworkStore } from "@/lib/store"

// Dynamic import to avoid SSR issues
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
})

interface Node {
  id: string
  word: string
  frequency: number
  time: number
  period: string
  group: number
  x?: number
  y?: number
  vx?: number
  vy?: number
}

interface Link {
  source: string
  target: string
  value: number
}

interface GraphData {
  nodes: Node[]
  links: Link[]
}

export default function WordNetwork() {
  const graphRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isSmallMobile: false,
    isLandscape: false,
  })
  const { theme } = useTheme()
  const { threshold, minTime, maxTime, selectedPeriod } = useWordNetworkStore()

  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] })
  const [loading, setLoading] = useState(true)

  // デバイス情報とリサイズ処理
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const width = window.innerWidth
        const height = window.innerHeight

        setDeviceInfo({
          isMobile: width < 768,
          isSmallMobile: width < 480,
          isLandscape: width > height,
        })

        // モバイルでは画面全体のサイズを使用
        if (width < 768) {
          setDimensions({
            width: width,
            height: height,
          })
        } else {
          setDimensions({
            width: rect.width,
            height: rect.height,
          })
        }
      }
    }

    // 初期サイズ設定
    updateDimensions()

    // リサイズイベントリスナー
    const resizeObserver = new ResizeObserver(updateDimensions)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    window.addEventListener("resize", updateDimensions)
    window.addEventListener("orientationchange", () => {
      setTimeout(updateDimensions, 200) // 向き変更後の遅延を増加
    })

    return () => {
      window.removeEventListener("resize", updateDimensions)
      window.removeEventListener("orientationchange", updateDimensions)
      resizeObserver.disconnect()
    }
  }, [])

  // Process data and create graph
  useEffect(() => {
    const processData = async () => {
      setLoading(true)

      try {
        // Filter data by selected period and time range
        let filteredData = sampleWordData.filter((item) => item.time >= minTime && item.time <= maxTime)

        // Apply period filter if not "all"
        if (selectedPeriod !== "all") {
          filteredData = filteredData.filter((item) => item.period === selectedPeriod)
        }

        // Create nodes from filtered data
        const nodes: Node[] = filteredData.map((item) => ({
          id: item.word,
          word: item.word,
          frequency: item.frequency,
          time: item.time,
          period: item.period,
          group: 0, // Will be updated by clustering
        }))

        // Calculate similarities between words (using mock data)
        const similarities = calculateSimilarities(nodes.map((node) => node.word))

        // Create links based on similarity threshold
        const links: Link[] = []
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const similarity = similarities[i][j]
            if (similarity >= threshold) {
              links.push({
                source: nodes[i].id,
                target: nodes[j].id,
                value: similarity,
              })
            }
          }
        }

        // Apply K-means clustering
        const clusteredNodes = kmeansClustering(nodes, links)

        setGraphData({
          nodes: clusteredNodes,
          links: links,
        })
      } catch (error) {
        console.error("Error processing graph data:", error)
      } finally {
        setLoading(false)
      }
    }

    processData()
  }, [threshold, minTime, maxTime, selectedPeriod])

  // グラフの中央配置
  useEffect(() => {
    if (graphRef.current && graphData.nodes.length > 0) {
      // グラフを中央に配置
      setTimeout(() => {
        graphRef.current.centerAt(0, 0, 1000)
        graphRef.current.zoom(deviceInfo.isMobile ? 0.8 : 1, 1000)
      }, 100)
    }
  }, [graphData, deviceInfo.isMobile])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // デバイス別の設定
  const getNodeSize = (time: number) => {
    let baseMultiplier = 1
    if (deviceInfo.isSmallMobile) {
      baseMultiplier = 0.7
    } else if (deviceInfo.isMobile) {
      baseMultiplier = 0.9
    }

    if (time >= 10) {
      return 18 * baseMultiplier
    } else if (time >= 5) {
      return 14 * baseMultiplier
    } else if (time >= 1) {
      return 10 * baseMultiplier
    } else {
      return 6 * baseMultiplier
    }
  }

  const getFontSize = (globalScale: number) => {
    let baseFontSize = 16 // モバイル用により大きなフォントサイズ
    if (deviceInfo.isSmallMobile) {
      baseFontSize = 12
    } else if (deviceInfo.isMobile) {
      baseFontSize = 14
    }

    // ズームレベルに応じてフォントサイズを調整
    return Math.max(10, baseFontSize / Math.max(globalScale, 0.6))
  }

  const getLinkWidth = (value: number) => {
    let multiplier = 3
    if (deviceInfo.isSmallMobile) {
      multiplier = 2
    } else if (deviceInfo.isMobile) {
      multiplier = 2.5
    }
    return Math.max(1, value * multiplier)
  }

  return (
    <div ref={containerRef} className="w-full h-full relative touch-manipulation overflow-hidden">
      {/* 期間情報表示 - モバイルでは小さく */}
      {selectedPeriod !== "all" && (
        <div className="absolute top-1 left-1 z-10 bg-background/90 backdrop-blur-sm p-2 rounded text-xs border shadow-sm max-w-32 sm:max-w-48">
          <div className="font-medium text-xs truncate">
            {availablePeriods.find((p) => p.value === selectedPeriod)?.label}
          </div>
          <div className="text-xs mt-1 text-muted-foreground">ノード: {graphData.nodes.length}</div>
        </div>
      )}

      {/* モバイル用操作ヒント */}
      {deviceInfo.isMobile && graphData.nodes.length > 0 && (
        <div className="absolute bottom-2 left-2 right-2 z-10 bg-background/80 backdrop-blur-sm p-2 rounded text-xs text-center text-muted-foreground border">
          ピンチでズーム・ドラッグで移動
        </div>
      )}

      {/* グラフ表示 */}
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel={(node: any) => {
          if (deviceInfo.isMobile) {
            return `${node.word}\n${node.time}h`
          }
          return `${node.word}\n時間: ${node.time}時間\n期間: ${node.period}`
        }}
        nodeColor={(node: any) => {
          const colors = ["#ff6b6b", "#48dbfb", "#1dd1a1", "#feca57", "#54a0ff", "#5f27cd", "#ff9ff3", "#00d2d3"]
          return colors[node.group % colors.length]
        }}
        nodeRelSize={deviceInfo.isSmallMobile ? 5 : deviceInfo.isMobile ? 6 : 7}
        nodeVal={(node: any) => getNodeSize(node.time)}
        linkWidth={(link: any) => getLinkWidth(link.value)}
        linkColor={() => (theme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)")}
        backgroundColor={theme === "dark" ? "#1a1a1a" : "#ffffff"}
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={(node: any, ctx: any, globalScale: number) => {
          const label = node.word
          const fontSize = getFontSize(globalScale)
          ctx.font = `${fontSize}px Sans-Serif`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillStyle = theme === "dark" ? "white" : "black"

          // より強いテキストシャドウ
          ctx.shadowColor = theme === "dark" ? "black" : "white"
          ctx.shadowBlur = 3
          ctx.shadowOffsetX = 1
          ctx.shadowOffsetY = 1

          // モバイルでの表示調整
          let displayLabel = label
          if (deviceInfo.isSmallMobile && label.length > 5) {
            displayLabel = label.substring(0, 4) + "..."
          } else if (deviceInfo.isMobile && label.length > 7) {
            displayLabel = label.substring(0, 6) + "..."
          }

          const yOffset = deviceInfo.isSmallMobile ? 15 : deviceInfo.isMobile ? 18 : 20
          ctx.fillText(displayLabel, node.x, node.y + yOffset)
          ctx.shadowBlur = 0
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0
        }}
        onNodeHover={(node: any) => {
          if (containerRef.current) {
            containerRef.current.style.cursor = node ? "pointer" : "default"
          }
        }}
        // 中央配置とズーム設定
        onEngineStop={() => {
          if (graphRef.current) {
            graphRef.current.centerAt(0, 0, 500)
          }
        }}
        // パフォーマンス最適化
        cooldownTicks={deviceInfo.isSmallMobile ? 30 : deviceInfo.isMobile ? 40 : 100}
        d3AlphaDecay={deviceInfo.isMobile ? 0.05 : 0.0228}
        d3VelocityDecay={deviceInfo.isMobile ? 0.3 : 0.4}
        // タッチ操作の最適化
        enableNodeDrag={!deviceInfo.isMobile}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        // 初期ズームレベル
        zoom={deviceInfo.isMobile ? 0.8 : 1}
        // 力学シミュレーション設定
        d3Force="charge"
        d3ForceConfig={{
          charge: {
            strength: deviceInfo.isMobile ? -80 : -200,
            distanceMax: deviceInfo.isMobile ? 150 : 400,
          },
          link: {
            distance: deviceInfo.isMobile ? 40 : 80,
          },
          center: {
            x: dimensions.width / 2,
            y: dimensions.height / 2,
          },
        }}
      />
    </div>
  )
}
