"use client"

import { useWordNetworkStore } from "@/lib/store"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function PeriodComparisonToggle() {
  const { showPeriodComparison, setShowPeriodComparison } = useWordNetworkStore()

  return (
    <div className="flex items-center space-x-2">
      <Switch id="period-comparison" checked={showPeriodComparison} onCheckedChange={setShowPeriodComparison} />
      <Label htmlFor="period-comparison">期間比較モード</Label>
    </div>
  )
}
