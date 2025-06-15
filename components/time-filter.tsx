"use client"

import { useWordNetworkStore } from "@/lib/store"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

export function TimeFilter() {
  const { minTime, maxTime, setMinTime, setMaxTime } = useWordNetworkStore()

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label htmlFor="min-time" className="text-sm md:text-base">
            最小時間
          </Label>
          <span className="text-xs md:text-sm font-medium">{minTime.toFixed(1)}時間</span>
        </div>
        <Slider
          id="min-time"
          min={0}
          max={12}
          step={0.5}
          value={[minTime]}
          onValueChange={([value]) => setMinTime(value)}
        />
        <p className="text-xs text-muted-foreground">
          {minTime === 0 ? "すべての時間を含める" : `${minTime}時間以上の活動のみ表示`}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label htmlFor="max-time" className="text-sm md:text-base">
            最大時間
          </Label>
          <span className="text-xs md:text-sm font-medium">{maxTime.toFixed(1)}時間</span>
        </div>
        <Slider
          id="max-time"
          min={0}
          max={12}
          step={0.5}
          value={[maxTime]}
          onValueChange={([value]) => setMaxTime(value)}
        />
        <p className="text-xs text-muted-foreground">
          {maxTime === 12 ? "すべての時間を含める" : `${maxTime}時間以下の活動のみ表示`}
        </p>
      </div>
    </div>
  )
}
