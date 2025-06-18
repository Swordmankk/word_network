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
      const timer = setTimeout(() => {
        try {
          if (graphRef.current && typeof graphRef.current.zoomToFit === "function") {
            graphRef.current.zoomToFit(600, isMobile ? 40 : 80) // より広い範囲で表示
          }
        } catch (error) {
          console.warn("zoomToFit failed:", error)
        }
      }, 800) // 少し長めの遅延でレイアウトを安定させる

      return () => clearTimeout(timer)
    }
  }, [graphData, isMobile, dimensions])

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

  // ノードの表示サイズ（見た目）- 少し小さくして重なりを軽減
  const getNodeSize = (time: number) => {
    const multiplier = isMobile ? 0.7 : 0.9 // サイズを少し小さく
    if (time >= 10) return 16 * multiplier
    if (time >= 5) return 13 * multiplier
    if (time >= 1) return 10 * multiplier
    return 8 * multiplier
  }

  // パステルピンク・紫系のカラーパレット（画像に合わせて）
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
    const baseFontSize = isMobile ? 11 : 14 // フォントサイズも調整
    return Math.max(8, baseFontSize / Math.max(globalScale, 0.5))
  }

  // 安全な数値チェック関数
  const isValidNumber = (value: any): boolean => {
    return typeof value === "number" && isFinite(value) && !isNaN(value)
  }

  // グラデーション背景の作成
  const createGradientBackground = () => {
    return "linear-gradient(135deg, #fce7f3 0%, #f3e8ff 50%, #e0e7ff 100%)"
  }

  return (
    <div className="w-full h-full relative" style={{ background: createGradientBackground() }}>
      {/* 期間情報表示 - デザインを画像に合わせて調整 */}
      {selectedPeriod !== "all" && (
        <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm p-3 rounded-xl text-sm border border-purple-200 shadow-lg">
          <div className="font-semibold text-purple-800 truncate">
            {availablePeriods.find((p) => p.value === selectedPeriod)?.label}
          </div>
          <div className="text-purple-600 text-xs">ノード: {graphData.nodes.length}</div>
        </div>
      )}

      {/* モバイル用操作ヒント - デザイン調整 */}
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
        // ノードの色（パステル紫・ピンク系）
        nodeColor={getNodeColor}
        // 当たり判定のサイズ
        nodeRelSize={isMobile ? 8 : 10}
        // 表示サイズ
        nodeVal={(node: any) => getNodeSize(node.time)}
        // リンクのデザイン（紫系で統一）
        linkWidth={(link: any) => Math.max(2, link.value * (isMobile ? 4 : 6))} // エッジをより太く
        linkColor={() => "rgba(139, 92, 246, 0.2)"} // 薄い紫
        // 透明な背景（グラデーションを活かすため）
        backgroundColor="transparent"
        nodeCanvasObjectMode={() => "after"}
        // ノードのカスタム描画（エラー修正版）
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
            // グラデーション効果のあるノード（安全な値で作成）
            const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeSize)
            gradient.addColorStop(0, nodeColor)
            gradient.addColorStop(1, nodeColor + "60") // 透明度を少し上げて軽やか

            // ノードの描画（円形、グラデーション付き）
            ctx.beginPath()
            ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI)
            ctx.fillStyle = gradient
            ctx.fill()

            // ノードの境界線（白い縁取り）- 少し細く
            ctx.strokeStyle = "rgba(255, 255, 255, 0.9)"
            ctx.lineWidth = 1.5
            ctx.stroke()
          } catch (error) {
            // グラデーションが失敗した場合は単色で描画
            ctx.beginPath()
            ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI)
            ctx.fillStyle = nodeColor + "80" // 透明度を追加
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

          // テキストの影効果 - 少し控えめに
          ctx.shadowColor = "rgba(255, 255, 255, 0.9)"
          ctx.shadowBlur = 3
          ctx.shadowOffsetX = 0.5
          ctx.shadowOffsetY = 0.5

          // テキストの色（濃い紫）
          ctx.fillStyle = "#4C1D95"

          let displayLabel = label
          if (isMobile && label.length > 6) {
            displayLabel = label.substring(0, 5) + "..."
          }

          const textY = node.y + nodeSize + (isMobile ? 15 : 18) // テキスト位置を少し近く
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
          if (graphRef.current && graphData.nodes.length > 0) {
            const timer = setTimeout(() => {
              try {
                if (graphRef.current && typeof graphRef.current.zoomToFit === "function") {
                  graphRef.current.zoomToFit(300, isMobile ? 20 : 40)
                }
              } catch (error) {
                console.warn("zoomToFit failed in onEngineStop:", error)
              }
            }, 200)
          }
        }}
        // 🔧 重なり改善のための力学パラメータ調整
        cooldownTicks={isMobile ? 80 : 150} // シミュレーション時間を長く
        d3AlphaDecay={isMobile ? 0.02 : 0.015} // より緩やかな減衰
        d3VelocityDecay={isMobile ? 0.2 : 0.3} // 速度減衰を調整
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        d3Force="charge"
        d3ForceConfig={{
          // 🔧 反発力を強化してノード間距離を広げる
          charge: {
            strength: isMobile ? -400 : -1200, // 反発力をさらに強く
            distanceMax: isMobile ? 300 : 800, // 反発力の影響範囲を拡大
          },
          // 🔧 リンクの距離を長く
          link: {
            distance: isMobile ? 150 : 250, // リンクの基本距離をさらに長く
            strength: 0.8,
          },
          // 🔧 中心への引力を追加（ノードが散らばりすぎるのを防ぐ）
          center: {
            x: dimensions.width / 2,
            y: dimensions.height / 2,
            strength: 0.05, // 弱い中心への引力
          },
          // 🔧 衝突検出を追加（ノードの重なりを物理的に防ぐ）
          collide: {
            radius: (node: any) => getNodeSize(node.time) + 25, // ノードサイズ + マージン
            strength: 0.9, // 衝突回避の強度
            iterations: 3, // 衝突計算の反復回数
          },
        }}
        // 🔧 ノード配置の初期化を改善
        onNodeClick={(node: any) => {
          // ノードクリック時の動作（必要に応じて追加）
        }}
        // 🔧 ウォームアップ期間を設定
        warmupTicks={isMobile ? 50 : 100}
      />
    </div>
  )
}
