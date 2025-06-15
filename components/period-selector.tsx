"use client"

import { useWordNetworkStore } from "@/lib/store"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { availablePeriods } from "@/lib/sample-data"

export function PeriodSelector() {
  const { selectedPeriod, setSelectedPeriod } = useWordNetworkStore()

  return (
    <div className="space-y-2">
      <Label htmlFor="period-selector" className="text-sm md:text-base">
        期間選択
      </Label>
      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
        <SelectTrigger id="period-selector" className="w-full">
          <SelectValue placeholder="期間を選択" />
        </SelectTrigger>
        <SelectContent>
          {availablePeriods.map((period) => (
            <SelectItem key={period.value} value={period.value}>
              {period.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
