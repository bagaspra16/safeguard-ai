"use client"

import { Dock } from "@/components/ui/dock-two"
import {
  Home,
  Search,
  Music,
  Heart,
  Settings,
  Plus,
  User,
} from "lucide-react"

function DockDemo() {
  const items = [
    { icon: Home, label: "Home" },
    { icon: Search, label: "Search" },
    { icon: Music, label: "Music" },
    { icon: Heart, label: "Favorites" },
    { icon: Plus, label: "Add New" },
    { icon: User, label: "Profile" },
    { icon: Settings, label: "Settings" },
  ]

  return (
    <div className="flex h-[30rem] w-full items-center justify-center p-4">
      <Dock items={items} />
    </div>
  )
}

export { DockDemo }
