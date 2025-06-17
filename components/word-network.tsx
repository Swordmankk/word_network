"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import { calculateSimilarities } from "@/lib/similarity"
import { kmeansClustering } from "@/lib/clustering"
import { sampleWordData, availablePeriods } from "@/lib/sample-data"
import { useWordNetworkStore } from "@/lib/store"

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false })

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
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [isMobile, setIsMobile] = useState(false)
  const { theme } = useTheme()
  const { minTime, maxTime, selectedPeriod } = useWordNetworkStore()
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] })
  const [loading, setLoading] = useState(true)

  // 固定の閾値（普通の関連性）
  const threshold = 0.5

  // 画面全体のサイズを取得
  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      setIsMobile(width < 768)
      setDimensions({ width, height })
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    window.addEventListener("orientationchange", () => setTimeout(updateDimensions, 200))

    return () => {
      window.removeEventListener("resize", updateDimensions)
      window.removeEventListener("orientationchange", updateDimensions)
    }
  }, [])

  // データ処理
  useEffect(() => {
    const processData = async () => {
      setLoading(true)

      try {
        let filteredData = sampleWordData.filter((item) => item.time >= minTime && item.time <= maxTime)

        if (selectedPeriod !== "all") {
          filteredData = filteredData.filter((item) => item.period === selectedPeriod)
        }

        const nodes: Node[] = filteredData.map((item) => ({
          id: item.word,
          word: item.word,
          frequency: item.frequency,
          time: item.time,
          period: item.period,
          group: 0,
        }))

        const similarities = calculateSimilarities(nodes.map((node) => node.word))

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

        const clusteredNodes = kmeansClustering(nodes, links)
        setGraphData({ nodes: clusteredNodes, links })
      } catch (error) {
        console.error("Error processing graph data:", error)
      } finally {
        setLoading(false)
      }
    }

    processData()
  }, [minTime, maxTime, selectedPeriod])

  // 全体表示
  useEffect(() => {
    if (graphRef.current && graphData.nodes.length > 0) {
      setTimeout(() => {
        graphRef.current.zoomToFit(400, isMobile ? 30 : 50)
      }, 200)
    }
  }, [graphData, isMobile])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const getNodeSize = (time: number) => {
    const multiplier = isMobile ? 0.8 : 1
    if (time >= 10) return 18 * multiplier
    if (time >= 5) return 14 * multiplier
    if (time >= 1) return 10 * multiplier
    return 6 * multiplier
  }

  const getFontSize = (globalScale: number) => {
    const baseFontSize = isMobile ? 12 : 16
    return Math.max(8, baseFontSize / Math.max(globalScale, 0.6))
  }

  return (
    <div className="w-full h-full relative">
      {/* 期間情報表示 */}
      {selectedPeriod !== "all" && (
        <div className="absolute top-2 left-2 z-10 bg-background/90 backdrop-blur-sm p-2 rounded text-xs border shadow-sm">
          <div className="font-medium truncate">{availablePeriods.find((p) => p.value === selectedPeriod)?.label}</div>
          <div className="text-muted-foreground">ノード: {graphData.nodes.length}</div>
        </div>
      )}

      {/* モバイル用操作ヒント */}
      {isMobile && graphData.nodes.length > 0 && (
        <div className="absolute bottom-2 left-2 right-2 z-10 bg-background/80 backdrop-blur-sm p-2 rounded text-xs text-center text-muted-foreground border">
          ピンチでズーム・ドラッグで移動
        </div>
      )}

      {/* グラフ表示 - 画面全体 */}
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel={(node: any) => `${node.word}\n${node.time}h`}
        nodeColor={(node: any) => {
          const colors = ["#ff6b6b", "#48dbfb", "#1dd1a1", "#feca57", "#54a0ff", "#5f27cd", "#ff9ff3", "#00d2d3"]
          return colors[node.group % colors.length]
        }}
        nodeRelSize={isMobile ? 5 : 6}
        nodeVal={(node: any) => getNodeSize(node.time)}
        linkWidth={(link: any) => Math.max(1, link.value * (isMobile ? 2 : 3))}
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
          ctx.shadowColor = theme === "dark" ? "black" : "white"
          ctx.shadowBlur = 2
          ctx.shadowOffsetX = 1
          ctx.shadowOffsetY = 1

          let displayLabel = label
          if (isMobile && label.length > 6) {
            displayLabel = label.substring(0, 5) + "..."
          }

          ctx.fillText(displayLabel, node.x, node.y + (isMobile ? 15 : 18))
          ctx.shadowBlur = 0
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0
        }}
        onNodeHover={(node: any) => {
          // カーソルスタイルの変更（全画面なのでdocument.bodyを使用）
          document.body.style.cursor = node ? "pointer" : "default"
        }}
        onEngineStop={() => {
          if (graphRef.current && graphData.nodes.length > 0) {
            setTimeout(() => {
              graphRef.current.zoomToFit(400, isMobile ? 30 : 50)
            }, 100)
          }
        }}
        cooldownTicks={isMobile ? 40 : 100}
        d3AlphaDecay={isMobile ? 0.05 : 0.0228}
        d3VelocityDecay={isMobile ? 0.3 : 0.4}
        enableNodeDrag={true} // 全画面なのでドラッグを有効化
        enableZoomInteraction={true}
        enablePanInteraction={true}
        d3Force="charge"
        d3ForceConfig={{
          charge: {
            strength: isMobile ? -80 : -200,
            distanceMax: isMobile ? 150 : 400,
          },
          link: {
            distance: isMobile ? 40 : 80,
          },
        }}
      />
    </div>
  )
}
