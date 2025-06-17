"use client"

import { create } from "zustand"

interface WordNetworkState {
  minTime: number
  setMinTime: (time: number) => void
  maxTime: number
  setMaxTime: (time: number) => void
  selectedPeriod: string
  setSelectedPeriod: (period: string) => void
}

export const useWordNetworkStore = create<WordNetworkState>((set) => ({
  minTime: 0,
  setMinTime: (minTime) => set({ minTime }),
  maxTime: 12,
  setMaxTime: (maxTime) => set({ maxTime }),
  selectedPeriod: "all",
  setSelectedPeriod: (selectedPeriod) => set({ selectedPeriod }),
}))
