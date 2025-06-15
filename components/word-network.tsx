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
  const [isMobile, setIsMobile] = useState(false)
  const { theme } = useTheme()
  const { threshold, minTime, maxTime, selectedPeriod } = useWordNetworkStore()

  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] })
  const [loading, setLoading] = useState(true)

  // モバイル判定とリサイズ処理
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const mobile = window.innerWidth < 768
        setIsMobile(mobile)
        setDimensions({
          width: rect.width,
          height: rect.height,
        })
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

    return () => {
      window.removeEventListener("resize", updateDimensions)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {/* 期間情報表示 */}
      {selectedPeriod !== "all" && (
        <div className="absolute top-2 left-2 z-10 bg-background/90 backdrop-blur-sm p-2 md:p-3 rounded-md text-xs md:text-sm border shadow-sm">
          <div className="font-medium text-xs md:text-sm">
            {availablePeriods.find((p) => p.value === selectedPeriod)?.label}
          </div>
          <div className="text-xs mt-1 text-muted-foreground">ノード数: {graphData.nodes.length}</div>
        </div>
      )}

      {/* グラフ表示 */}
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel={(node: any) => `${node.word}\n時間: ${node.time}時間\n期間: ${node.period}`}
        nodeColor={(node: any) => {
          // K-meansクラスタリングに基づいた色分け
          const colors = ["#ff6b6b", "#48dbfb", "#1dd1a1", "#feca57", "#54a0ff", "#5f27cd", "#ff9ff3", "#00d2d3"]
          return colors[node.group % colors.length]
        }}
        nodeRelSize={isMobile ? 4 : 6} // モバイルでは小さく
        nodeVal={(node: any) => {
          // Size based on time thresholds (モバイルでは小さく)
          const sizeMultiplier = isMobile ? 0.7 : 1
          if (node.time >= 10) {
            return 12 * sizeMultiplier // Extra large for 10+ hours
          } else if (node.time >= 5) {
            return 9 * sizeMultiplier // Large for 5-10 hours
          } else if (node.time >= 1) {
            return 6 * sizeMultiplier // Medium for 1-5 hours
          } else {
            return 3 * sizeMultiplier // Small for less than 1 hour
          }
        }}
        linkWidth={(link: any) => Math.max(0.5, link.value * (isMobile ? 2 : 4))}
        linkColor={() => (theme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)")}
        backgroundColor={theme === "dark" ? "#1a1a1a" : "#ffffff"}
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={(node: any, ctx: any, globalScale: number) => {
          // Draw node label
          const label = node.word
          const baseFontSize = isMobile ? 10 : 12
          const fontSize = Math.max(6, baseFontSize / globalScale)
          ctx.font = `${fontSize}px Sans-Serif`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillStyle = theme === "dark" ? "white" : "black"

          // Add text shadow for better readability
          ctx.shadowColor = theme === "dark" ? "black" : "white"
          ctx.shadowBlur = 1

          // モバイルでは短縮表示
          const displayLabel = isMobile && label.length > 8 ? label.substring(0, 6) + "..." : label
          ctx.fillText(displayLabel, node.x, node.y + (isMobile ? 12 : 15))
          ctx.shadowBlur = 0
        }}
        onNodeHover={(node: any) => {
          if (containerRef.current) {
            containerRef.current.style.cursor = node ? "pointer" : "default"
          }
        }}
        // モバイルでのパフォーマンス最適化
        cooldownTicks={isMobile ? 50 : 100}
        d3AlphaDecay={isMobile ? 0.05 : 0.0228}
        d3VelocityDecay={isMobile ? 0.3 : 0.4}
      />
    </div>
  )
}
