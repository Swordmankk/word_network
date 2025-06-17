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
  const [isInitialized, setIsInitialized] = useState(false)

  // 固定の閾値（普通の関連性）
  const threshold = 0.5

  // 画面サイズに基づく動的パラメータ計算
  const getDynamicParams = () => {
    const area = dimensions.width * dimensions.height
    const nodeCount = graphData.nodes.length
    const density = nodeCount / (area / 10000) // 10000px²あたりのノード数

    // 画面サイズに応じたスケール係数
    const sizeScale = Math.min(dimensions.width, dimensions.height) / 800
    const densityScale = Math.max(0.3, Math.min(2, 1 / Math.sqrt(density)))

    return {
      sizeScale,
      densityScale,
      area,
      nodeCount,
      density,
    }
  }

  // 画面全体のサイズを取得（デバウンス付き）
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const updateDimensions = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        const width = window.innerWidth
        const height = window.innerHeight

        setIsMobile(width < 768)
        setDimensions({ width, height })
      }, 150) // デバウンス: 150ms
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    window.addEventListener("orientationchange", () => setTimeout(updateDimensions, 300))

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener("resize", updateDimensions)
      window.removeEventListener("orientationchange", updateDimensions)
    }
  }, [])

  // データ処理
  useEffect(() => {
    const processData = async () => {
      setLoading(true)
      setIsInitialized(false)

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

  // 初期化とズーム調整
  useEffect(() => {
    if (graphRef.current && graphData.nodes.length > 0 && !isInitialized) {
      const timer = setTimeout(() => {
        try {
          if (graphRef.current && typeof graphRef.current.zoomToFit === "function") {
            const { nodeCount } = getDynamicParams()
            const padding = Math.max(50, Math.min(150, nodeCount * 3))
            graphRef.current.zoomToFit(400, padding)
            setIsInitialized(true)
          }
        } catch (error) {
          console.warn("zoomToFit failed:", error)
        }
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [graphData, isInitialized])

  // 画面サイズ変更時の再調整（初期化後のみ）
  useEffect(() => {
    if (graphRef.current && isInitialized && graphData.nodes.length > 0) {
      const timer = setTimeout(() => {
        try {
          if (graphRef.current && typeof graphRef.current.zoomToFit === "function") {
            const { nodeCount } = getDynamicParams()
            const padding = Math.max(30, Math.min(100, nodeCount * 2))
            graphRef.current.zoomToFit(200, padding)
          }
        } catch (error) {
          console.warn("zoomToFit on resize failed:", error)
        }
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [dimensions, isInitialized])

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-full w-full"
        style={{ background: "linear-gradient(135deg, #fce7f3 0%, #f3e8ff 100%)" }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-500"></div>
      </div>
    )
  }

  // 動的パラメータの取得
  const { sizeScale, densityScale } = getDynamicParams()

  // ノードの表示サイズ（画面サイズに応じて調整）
  const getNodeSize = (time: number) => {
    const baseMultiplier = isMobile ? 0.6 : 0.8
    const scaledMultiplier = baseMultiplier * sizeScale * densityScale

    if (time >= 10) return 16 * scaledMultiplier
    if (time >= 5) return 13 * scaledMultiplier
    if (time >= 1) return 10 * scaledMultiplier
    return 8 * scaledMultiplier
  }

  // マルチカラーパレット（各グループを明確に区別）
  const getNodeColor = (node: any) => {
    const multiColorPalette = [
      "#FF6B6B", // 鮮やかな赤
      "#4ECDC4", // ターコイズ
      "#45B7D1", // 明るい青
      "#96CEB4", // ミントグリーン
      "#FFEAA7", // 明るい黄色
      "#DDA0DD", // プラム
      "#FF9F43", // オレンジ
      "#6C5CE7", // 紫
      "#A29BFE", // ライトパープル
      "#FD79A8", // ピンク
      "#00B894", // エメラルドグリーン
      "#E17055", // コーラル
      "#74B9FF", // スカイブルー
      "#FDCB6E", // ゴールデンイエロー
      "#E84393", // マゼンタ
      "#00CEC9", // シアン
      "#A0E7E5", // ライトシアン
      "#B2F5EA", // ペールターコイズ
      "#FBB6CE", // ライトピンク
      "#C3AED6", // ライトラベンダー
    ]

    return multiColorPalette[node.group % multiColorPalette.length]
  }

  const getFontSize = (globalScale: number) => {
    const baseFontSize = isMobile ? 10 : 13
    const scaledFontSize = baseFontSize * sizeScale
    return Math.max(8, scaledFontSize / Math.max(globalScale, 0.5))
  }

  // 安全な数値チェック関数
  const isValidNumber = (value: any): boolean => {
    return typeof value === "number" && isFinite(value) && !isNaN(value)
  }

  // グラデーション背景の作成
  const createGradientBackground = () => {
    return "linear-gradient(135deg, #fce7f3 0%, #f3e8ff 50%, #e0e7ff 100%)"
  }

  // 動的な力学パラメータの計算
  const getForceConfig = () => {
    const baseDistance = isMobile ? 60 : 80
    const scaledDistance = baseDistance * sizeScale * densityScale
    const chargeStrength = isMobile ? -120 : -200
    const scaledCharge = chargeStrength * densityScale

    return {
      charge: {
        strength: scaledCharge,
        distanceMax: scaledDistance * 3,
      },
      link: {
        distance: scaledDistance,
        strength: 0.7,
      },
      center: {
        x: dimensions.width / 2,
        y: dimensions.height / 2,
        strength: 0.03,
      },
      collide: {
        radius: (node: any) => getNodeSize(node.time) + 10 * densityScale,
        strength: 0.8,
        iterations: 2,
      },
    }
  }

  return (
    <div className="w-full h-full relative" style={{ background: createGradientBackground() }}>
      {/* 期間情報表示 */}
      {selectedPeriod !== "all" && (
        <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm p-3 rounded-xl text-sm border border-purple-200 shadow-lg">
          <div className="font-semibold text-purple-800 truncate">
            {availablePeriods.find((p) => p.value === selectedPeriod)?.label}
          </div>
          <div className="text-purple-600 text-xs">ノード: {graphData.nodes.length}</div>
        </div>
      )}

      {/* モバイル用操作ヒント */}
      {isMobile && graphData.nodes.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-10 bg-white/80 backdrop-blur-sm p-3 rounded-xl text-sm text-center text-purple-700 border border-purple-200 shadow-lg">
          ピンチでズーム・ドラッグで移動
        </div>
      )}

      {/* グラフ全体描画 */}
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel={(node: any) => `${node.word}\n${node.time}h`}
        nodeColor={getNodeColor}
        nodeRelSize={isMobile ? 6 : 8}
        nodeVal={(node: any) => getNodeSize(node.time)}
        linkWidth={(link: any) => Math.max(1, link.value * (isMobile ? 1.5 : 2) * sizeScale)}
        linkColor={() => "rgba(139, 92, 246, 0.2)"}
        backgroundColor="transparent"
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={(node: any, ctx: any, globalScale: number) => {
          // 安全な値のチェック
          if (!node || !isValidNumber(node.x) || !isValidNumber(node.y)) {
            return
          }

          const nodeSize = getNodeSize(node.time)
          if (!isValidNumber(nodeSize) || nodeSize <= 0) {
            return
          }

          const nodeColor = getNodeColor(node)

          try {
            // グラデーション効果のあるノード
            const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeSize)
            gradient.addColorStop(0, nodeColor)
            gradient.addColorStop(1, nodeColor + "60")

            // ノードの描画
            ctx.beginPath()
            ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI)
            ctx.fillStyle = gradient
            ctx.fill()

            // 境界線
            ctx.strokeStyle = "rgba(255, 255, 255, 0.9)"
            ctx.lineWidth = 1.5
            ctx.stroke()
          } catch (error) {
            // フォールバック描画
            ctx.beginPath()
            ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI)
            ctx.fillStyle = nodeColor + "80"
            ctx.fill()

            ctx.strokeStyle = "rgba(255, 255, 255, 0.9)"
            ctx.lineWidth = 1.5
            ctx.stroke()
          }

          // テキストの描画
          const label = node.word
          if (!label) return

          const fontSize = getFontSize(globalScale)
          if (!isValidNumber(fontSize) || fontSize <= 0) return

          ctx.font = `600 ${fontSize}px 'Inter', 'Helvetica Neue', Arial, sans-serif`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"

          // テキストの影効果
          ctx.shadowColor = "rgba(255, 255, 255, 0.9)"
          ctx.shadowBlur = 2
          ctx.shadowOffsetX = 0.5
          ctx.shadowOffsetY = 0.5

          // テキストの色
          ctx.fillStyle = "#4C1D95"

          let displayLabel = label
          if (isMobile && label.length > 6) {
            displayLabel = label.substring(0, 5) + "..."
          }

          const textY = node.y + nodeSize + (isMobile ? 12 : 15)
          if (isValidNumber(textY)) {
            ctx.fillText(displayLabel, node.x, textY)
          }

          // シャドウをリセット
          ctx.shadowBlur = 0
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0
        }}
        onNodeHover={(node: any) => {
          document.body.style.cursor = node ? "pointer" : "default"
        }}
        onEngineStop={() => {
          if (graphRef.current && graphData.nodes.length > 0 && !isInitialized) {
            const timer = setTimeout(() => {
              try {
                if (graphRef.current && typeof graphRef.current.zoomToFit === "function") {
                  const { nodeCount } = getDynamicParams()
                  const padding = Math.max(30, Math.min(80, nodeCount * 2))
                  graphRef.current.zoomToFit(200, padding)
                }
              } catch (error) {
                console.warn("zoomToFit failed in onEngineStop:", error)
              }
            }, 100)
          }
        }}
        // 動的な力学パラメータ
        cooldownTicks={isMobile ? 60 : 100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        d3Force="charge"
        d3ForceConfig={getForceConfig()}
        warmupTicks={isMobile ? 30 : 50}
      />
    </div>
  )
}
