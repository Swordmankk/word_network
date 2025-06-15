"use client"

// K-means clustering implementation
export function kmeansClustering(nodes: any[], links: any[]) {
  // より実践的なK-means実装
  // 実際のK-means実装では特徴ベクトルが必要ですが、
  // ここではノードの接続パターンと時間に基づいて簡易的なクラスタリングを行います

  const k = 5 // クラスタ数
  const maxIterations = 10

  if (nodes.length === 0) return []
  if (nodes.length <= k) return nodes.map((node, i) => ({ ...node, group: i }))

  // ノードの特徴量として時間と接続数を使用
  const features: { [key: string]: { time: number; connections: number } } = {}
  nodes.forEach((node) => {
    features[node.id] = {
      time: node.time,
      connections: 0,
    }
  })

  // 接続数をカウント
  links.forEach((link) => {
    if (features[link.source]) {
      features[link.source].connections = (features[link.source].connections || 0) + 1
    }
    if (features[link.target]) {
      features[link.target].connections = (features[link.target].connections || 0) + 1
    }
  })

  // 初期クラスタ中心をランダムに選択
  const centroids: { time: number; connections: number }[] = []
  const usedIndices = new Set<number>()

  while (centroids.length < k) {
    const idx = Math.floor(Math.random() * nodes.length)
    if (!usedIndices.has(idx)) {
      usedIndices.add(idx)
      const node = nodes[idx]
      centroids.push({
        time: features[node.id].time,
        connections: features[node.id].connections,
      })
    }
  }

  // K-meansアルゴリズム
  const assignments = Array(nodes.length).fill(0)

  for (let iter = 0; iter < maxIterations; iter++) {
    // 各ノードを最も近い中心に割り当て
    let changed = false

    nodes.forEach((node, i) => {
      const nodeFeature = features[node.id]
      let minDist = Number.POSITIVE_INFINITY
      let bestCluster = 0

      centroids.forEach((centroid, j) => {
        // 時間と接続数の正規化距離
        const timeDist = Math.abs(nodeFeature.time - centroid.time) / 12 // 最大時間で正規化
        const connDist =
          Math.abs(nodeFeature.connections - centroid.connections) /
          Math.max(1, Math.max(...Object.values(features).map((f) => f.connections)))

        const dist = Math.sqrt(timeDist * timeDist + connDist * connDist)

        if (dist < minDist) {
          minDist = dist
          bestCluster = j
        }
      })

      if (assignments[i] !== bestCluster) {
        assignments[i] = bestCluster
        changed = true
      }
    })

    // 収束したら終了
    if (!changed) break

    // クラスタ中心を更新
    const newCentroids = Array(k)
      .fill(null)
      .map(() => ({ time: 0, connections: 0, count: 0 }))

    nodes.forEach((node, i) => {
      const cluster = assignments[i]
      const nodeFeature = features[node.id]

      newCentroids[cluster].time += nodeFeature.time
      newCentroids[cluster].connections += nodeFeature.connections
      newCentroids[cluster].count++
    })

    // 平均を計算して新しい中心に
    newCentroids.forEach((centroid, i) => {
      if (centroid.count > 0) {
        centroids[i] = {
          time: centroid.time / centroid.count,
          connections: centroid.connections / centroid.count,
        }
      }
    })
  }

  // 結果を返す
  return nodes.map((node, i) => ({
    ...node,
    group: assignments[i],
  }))
}
