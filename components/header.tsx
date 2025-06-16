"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Network } from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { name: "ホーム", href: "#home" },
    { name: "機能", href: "#features" },
    { name: "ネットワーク", href: "#network" },
    { name: "お問い合わせ", href: "#contact" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* ロゴ */}
          <div className="flex items-center space-x-2">
            <Network className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold sm:text-xl">WordNetwork</span>
          </div>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* デスクトップボタン */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              ログイン
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              サインアップ
            </Button>
          </div>

          {/* モバイルメニューボタン */}
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="flex flex-col space-y-2 px-3 pt-4">
                <Button variant="ghost" size="sm" className="justify-start">
                  ログイン
                </Button>
                <Button size="sm" className="justify-start bg-primary text-primary-foreground hover:bg-primary/90">
                  サインアップ
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
