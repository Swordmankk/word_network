"use client"

import { useWordNetworkStore } from "@/lib/store"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

export function ThresholdSlider() {
  const { threshold, setThreshold } = useWordNetworkStore()

  // ユーザーフレンドリーな表現にマッピング
  const getThresholdLabel = (value: number) => {
    if (value <= 0.2) return "すべて表示"
    if (value <= 0.4) return "緩い関連性"
    if (value <= 0.6) return "普通の関連性"
    if (value <= 0.8) return "強い関連性"
    return "最も強い関連性"
  }

  const getThresholdDescription = (value: number) => {
    if (value <= 0.2) return "すべての単語間の関連を表示します"
    if (value <= 0.4) return "弱い関連性も含めて表示します"
    if (value <= 0.6) return "適度な関連性のある単語を表示します"
    if (value <= 0.8) return "強く関連する単語のみを表示します"
    return "最も強く関連する単語のみを表示します"
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label htmlFor="threshold" className="text-sm md:text-base">
          関連性の強さ
        </Label>
        <span className="text-xs md:text-sm font-medium text-primary">{getThresholdLabel(threshold)}</span>
      </div>
      <Slider
        id="threshold"
        min={0}
        max={1}
        step={0.1}
        value={[threshold]}
        onValueChange={([value]) => setThreshold(value)}
        className="w-full"
      />
      <p className="text-xs text-muted-foreground leading-relaxed">{getThresholdDescription(threshold)}</p>
    </div>
  )
}
