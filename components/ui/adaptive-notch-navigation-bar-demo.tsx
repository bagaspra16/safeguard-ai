"use client";

import { useState } from "react";

import {
  Activity,
  ArrowDownUp,
  BarChart2,
  Command,
  Eye,
  EyeOff,
  Layers,
  LogOut,
  Sparkles,
  User,
  Users,
} from "lucide-react";

import type {
  NotchItemData,
  NotchPosition,
} from "@/components/ui/adaptive-notch-navigation-bar";

import { NotchNav } from "@/components/ui/adaptive-notch-navigation-bar";

const NAV_ITEMS: NotchItemData[] = [
  { id: "dashboard", label: "Dashboard", icon: BarChart2 },
  { id: "profiles", label: "Profiles", icon: Users },
  { id: "funnels", label: "Funnels", icon: Layers },
  { id: "performance", label: "Performance", icon: Activity },
  { id: "realtime", label: "Realtime", icon: Sparkles, badge: "Live" },
];

export default function NotchNavDemo() {
  const [activeId, setActiveId] = useState<string>("dashboard");
  const [position, setPosition] = useState<NotchPosition>("top");
  const [showLogo, setShowLogo] = useState<boolean>(true);
  const [showRightContent, setShowRightContent] = useState<boolean>(true);

  const handleActiveChange = (id: string) => {
    setActiveId(id);
  };

  const handleTogglePosition = () => {
    setPosition((prev) => (prev === "top" ? "bottom" : "top"));
  };

  const handleToggleLogo = () => {
    setShowLogo((prev) => !prev);
  };

  const handleToggleRightContent = () => {
    setShowRightContent((prev) => !prev);
  };

  const handleSignOut = () => {
    console.log("Sign out triggered");
  };

  const LogoSlot = (
    <div className="flex items-center gap-1.5 sm:gap-2 h-7.5">
      <div className="flex size-6 items-center justify-center rounded-md bg-zinc-800">
        <Command className="size-3.5 text-zinc-50" />
      </div>

      <span className="hidden sm:inline text-xs font-bold tracking-tight text-white">
        Acme
      </span>
    </div>
  );

  const RightContentSlot = (
    <div className="flex items-center gap-1.5 sm:gap-2 h-7.5">
      <div className="hidden sm:flex size-6 items-center justify-center rounded-full bg-zinc-800 text-zinc-300">
        <User className="size-3.5" />
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        aria-label="Sign out"
        className="cursor-pointer items-center gap-1 text-xs font-medium text-zinc-400 hover:text-zinc-200 flex outline-none"
      >
        <span className="hidden sm:inline">Sign out</span>
        <LogOut className="size-3.5" />
      </button>
    </div>
  );

  return (
    <NotchNav
      items={NAV_ITEMS}
      activeId={activeId}
      position={position}
      logo={LogoSlot}
      rightContent={RightContentSlot}
      showLogo={showLogo}
      showRightContent={showRightContent}
      onActiveChange={handleActiveChange}
    >
      <div className="flex w-full max-w-xs flex-col items-center gap-3 rounded-xl border border-white/10 bg-zinc-950 p-4 text-center shadow-sm">
        <div className="flex flex-col items-center">
          <span className="text-xs font-medium text-zinc-500">
            Active Tab
          </span>

          <p className="text-base font-bold text-white capitalize">
            {activeId}
          </p>
        </div>

        <div className="flex w-full flex-col gap-1.5">
          <button
            type="button"
            onClick={handleTogglePosition}
            className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-zinc-800 outline-none"
          >
            <span className="flex items-center gap-1.5 text-zinc-400">
              <ArrowDownUp className="size-3" />
              Position
            </span>

            <span className="font-bold text-white capitalize">
              {position}
            </span>
          </button>

          <div className="mt-1 flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleLogo}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg border border-white/10 bg-zinc-900 py-1.5 text-[10px] font-semibold text-white shadow-xs transition-colors hover:bg-zinc-800 outline-none"
            >
              {showLogo ? (
                <Eye className="size-3 text-emerald-400" />
              ) : (
                <EyeOff className="size-3 text-zinc-500" />
              )}
              Logo Notch
            </button>

            <button
              type="button"
              onClick={handleToggleRightContent}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg border border-white/10 bg-zinc-900 py-1.5 text-[10px] font-semibold text-white shadow-xs transition-colors hover:bg-zinc-800 outline-none"
            >
              {showRightContent ? (
                <Eye className="size-3 text-emerald-400" />
              ) : (
                <EyeOff className="size-3 text-zinc-500" />
              )}
              Action Notch
            </button>
          </div>
        </div>
      </div>
    </NotchNav>
  );
}
