"use client"

import { Network } from "lucide-react"

export function Footer() {
  return (
    <footer id="contact" className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <Network className="h-5 w-5 text-primary" />
            <span className="font-semibold">WordNetwork</span>
          </div>

          <div className="text-sm text-muted-foreground text-center sm:text-right">
            <p>&copy; 2024 WordNetwork. All rights reserved.</p>
            <p className="mt-1">単語ネットワーク可視化ツール</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
