"use client"

import { create } from "zustand"

interface WordNetworkState {
  threshold: number
  setThreshold: (threshold: number) => void
  minTime: number
  setMinTime: (time: number) => void
  maxTime: number
  setMaxTime: (time: number) => void
  selectedPeriod: string
  setSelectedPeriod: (period: string) => void
}

export const useWordNetworkStore = create<WordNetworkState>((set) => ({
  threshold: 0.5,
  setThreshold: (threshold) => set({ threshold }),
  minTime: 0,
  setMinTime: (minTime) => set({ minTime }),
  maxTime: 12,
  setMaxTime: (maxTime) => set({ maxTime }),
  selectedPeriod: "all",
  setSelectedPeriod: (selectedPeriod) => set({ selectedPeriod }),
}))
