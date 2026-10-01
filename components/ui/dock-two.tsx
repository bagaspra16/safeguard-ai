"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"

export interface DockItemData {
  icon: LucideIcon
  label: string
  href?: string
  onClick?: () => void
  isActive?: boolean
  badge?: string
}

export interface DockProps {
  className?: string
  items: DockItemData[]
}

export interface DockIconButtonProps {
  icon: LucideIcon
  label: string
  href?: string
  onClick?: () => void
  isActive?: boolean
  badge?: string
  className?: string
}

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-2, 2, -2],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
}

const DockIconButton = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, DockIconButtonProps>(
  ({ icon: Icon, label, href, onClick, isActive, badge, className }, ref) => {
    const content = (
      <>
        <Icon
          className={cn(
            "w-5 h-5 transition-colors",
            isActive ? "text-orange-600" : "text-slate-500 group-hover:text-slate-900"
          )}
        />
        {badge && (
          <span className="absolute top-1 right-1 size-2 rounded-full bg-orange-500 ring-2 ring-white" />
        )}
        <span
          className={cn(
            "absolute -top-8 left-1/2 -translate-x-1/2",
            "px-2 py-0.5 rounded-md text-[11px] font-bold",
            "bg-slate-900 text-white border border-slate-700 shadow-xl",
            "opacity-0 group-hover:opacity-100",
            "transition-opacity whitespace-nowrap pointer-events-none z-50",
            "backdrop-blur-md"
          )}
        >
          {label}
        </span>
      </>
    )

    const sharedClasses = cn(
      "relative group p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer outline-none select-none flex items-center justify-center",
      isActive
        ? "bg-orange-500/10 border border-orange-500/25 text-orange-600 shadow-[0_2px_8px_rgba(249,115,22,0.15)]"
        : "hover:bg-slate-100/90 text-slate-500 hover:text-slate-900 border border-transparent",
      className
    )

    if (href) {
      return (
        <motion.div
          whileHover={{ scale: 1.12, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex"
        >
          <Link
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            onClick={onClick}
            className={sharedClasses}
          >
            {content}
          </Link>
        </motion.div>
      )
    }

    return (
      <motion.button
        ref={ref as React.Ref<HTMLButtonElement>}
        whileHover={{ scale: 1.12, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        type="button"
        className={sharedClasses}
      >
        {content}
      </motion.button>
    )
  }
)
DockIconButton.displayName = "DockIconButton"

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  ({ items, className }, ref) => {
    return (
      <div ref={ref} className={cn("flex items-center justify-center pointer-events-auto", className)}>
        <motion.div
          initial="initial"
          animate="animate"
          variants={floatingAnimation}
          className={cn(
            "flex items-center gap-1.5 p-1.5 rounded-2xl",
            "backdrop-blur-2xl border shadow-[0_12px_36px_rgba(15,23,42,0.12)]",
            "bg-white/90 border-slate-200/90",
            "hover:border-slate-300 transition-all duration-300"
          )}
        >
          {items.map((item) => (
            <DockIconButton key={item.label} {...item} />
          ))}
        </motion.div>
      </div>
    )
  }
)
Dock.displayName = "Dock"

export { Dock, DockIconButton }
