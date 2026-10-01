"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

import {
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Glasses,
  Shield,
  Cpu,
  Sparkles,
  ExternalLink,
} from "lucide-react";

import type {
  ButtonHTMLAttributes,
  ComponentType,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type NotchPosition = "top" | "bottom";

export interface NotchSubItemData {
  id: string;
  label: string;
  href?: string;
  icon?: LucideIcon | ComponentType<{ className?: string }>;
  badge?: string;
}

export interface NotchItemData {
  id: string;
  label: string;
  icon?: LucideIcon | ComponentType<{ className?: string }>;
  badge?: string;
  disabled?: boolean;
  subItems?: NotchSubItemData[];
}

export interface NotchWingProps {
  position?: NotchPosition;
  className?: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
   MINIMALIST NOTCH CURVATURE WINGS
───────────────────────────────────────────────────────────────────────────── */

export function NotchLeftWing({
  position = "top",
  className,
}: NotchWingProps) {
  const isBottom = position === "bottom";

  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      shapeRendering="geometricPrecision"
      className={cn(
        "pointer-events-none absolute right-full size-2.5 md:size-4 overflow-visible select-none text-black transition-colors duration-200",
        isBottom ? "bottom-0" : "top-0",
        className
      )}
    >
      <path
        d={
          isBottom
            ? "M 0 20 C 11.046 20 20 11.046 20 0 H 21 V 21 H 0 Z"
            : "M 0 0 C 11.046 0 20 8.954 20 20 H 21 V -1 H 0 Z"
        }
        fill="currentColor"
      />
    </svg>
  );
}

export function NotchRightWing({
  position = "top",
  className,
}: NotchWingProps) {
  const isBottom = position === "bottom";

  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      shapeRendering="geometricPrecision"
      className={cn(
        "pointer-events-none absolute left-full size-2.5 md:size-4 overflow-visible select-none text-black transition-colors duration-200",
        isBottom ? "bottom-0" : "top-0",
        className
      )}
    >
      <path
        d={
          isBottom
            ? "M 20 20 C 8.954 20 0 11.046 0 0 H -1 V 21 H 20 Z"
            : "M 20 0 C 8.954 0 0 8.954 0 20 H -1 V -1 H 20 Z"
        }
        fill="currentColor"
      />
    </svg>
  );
}

export function NotchCornerLeftWing({
  position = "top",
  className,
}: NotchWingProps) {
  const isBottom = position === "bottom";

  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      shapeRendering="geometricPrecision"
      className={cn(
        "pointer-events-none absolute left-0 size-2.5 md:size-4 overflow-visible select-none text-black transition-colors duration-200",
        isBottom ? "bottom-full" : "top-full",
        className
      )}
    >
      <path
        d={
          isBottom
            ? "M 0 20 H 20 C 8.954 20 0 11.046 0 0 V 20 Z"
            : "M 0 0 H 20 C 8.954 0 0 8.954 0 20 V 0 Z"
        }
        fill="currentColor"
      />
    </svg>
  );
}

export function NotchCornerRightWing({
  position = "top",
  className,
}: NotchWingProps) {
  const isBottom = position === "bottom";

  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      shapeRendering="geometricPrecision"
      className={cn(
        "pointer-events-none absolute right-0 size-2.5 md:size-4 overflow-visible select-none text-black transition-colors duration-200",
        isBottom ? "bottom-full" : "top-full",
        className
      )}
    >
      <path
        d={
          isBottom
            ? "M 20 20 H 0 C 11.046 20 20 11.046 20 0 V 20 Z"
            : "M 20 0 H 0 C 11.046 0 20 8.954 20 20 V 0 Z"
        }
        fill="currentColor"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MINIMALIST NOTCH ITEM WITH OPTIONAL COMPACT DROPDOWN
───────────────────────────────────────────────────────────────────────────── */

export interface NotchItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onSelect"> {
  item: NotchItemData;
  isActive: boolean;
  isMenuOpen: boolean;
  position: NotchPosition;
  onSelect: (id: string, href?: string) => void;
  onToggleDropdown: (id: string) => void;
  onCloseDropdown: () => void;
}

export const NotchItem = forwardRef<HTMLDivElement, NotchItemProps>(
  (
    {
      item,
      isActive,
      isMenuOpen,
      position,
      onSelect,
      onToggleDropdown,
      onCloseDropdown,
      className,
    },
    ref
  ) => {
    const Icon = item.icon;
    const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
    const isBottom = position === "bottom";

    const handleClick = (e: MouseEvent) => {
      e.stopPropagation();
      if (item.disabled) return;
      if (hasSubItems) {
        onToggleDropdown(item.id);
      } else {
        onSelect(item.id);
      }
    };

    return (
      <div ref={ref} className="relative">
        <button
          type="button"
          role="tab"
          aria-selected={isActive}
          disabled={item.disabled}
          onClick={handleClick}
          className={cn(
            "relative flex h-7.5 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-xs font-medium transition-all outline-none select-none",
            isActive
              ? "font-semibold text-amber-400"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]",
            isMenuOpen && "text-white bg-white/[0.08]",
            item.disabled && "cursor-not-allowed pointer-events-none opacity-40",
            className
          )}
        >
          {isActive && (
            <motion.span
              layoutId="notch-active-pill"
              className="absolute inset-0 rounded-full bg-white/[0.08] border border-amber-400/30"
              transition={{
                type: "spring",
                stiffness: 450,
                damping: 35,
              }}
            />
          )}

          <span className="relative z-10 flex items-center gap-1.5">
            {Icon && (
              <Icon
                className={cn(
                  "size-3.5 shrink-0 transition-colors",
                  isActive ? "text-amber-400" : "text-zinc-400"
                )}
              />
            )}

            <span className="leading-none">{item.label}</span>

            {item.badge && (
              <span className="rounded-full bg-amber-500/15 border border-amber-500/25 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">
                {item.badge}
              </span>
            )}

            {hasSubItems && (
              <ChevronDown
                className={cn(
                  "size-3 text-zinc-500 transition-transform duration-150",
                  isMenuOpen && "rotate-180 text-amber-400"
                )}
              />
            )}
          </span>
        </button>

        {/* Minimalist Dropdown Menu */}
        <AnimatePresence>
          {hasSubItems && isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: isBottom ? 6 : -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: isBottom ? 4 : -4, scale: 0.98 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className={cn(
                "absolute z-50 min-w-[200px] w-max rounded-xl bg-black/95 p-1.5 shadow-2xl backdrop-blur-xl border border-white/10",
                "left-1/2 -translate-x-1/2",
                isBottom ? "bottom-full mb-2" : "top-full mt-2"
              )}
            >
              <div className="flex flex-col gap-0.5">
                {item.subItems?.map((sub) => {
                  const SubIcon = sub.icon;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        onSelect(item.id, sub.href || sub.id);
                        onCloseDropdown();
                      }}
                      className="group flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {SubIcon ? (
                          <SubIcon className="size-3.5 text-zinc-400 group-hover:text-amber-400" />
                        ) : (
                          <span className="size-1 rounded-full bg-amber-400/60" />
                        )}
                        <span className="font-medium truncate">{sub.label}</span>
                      </div>

                      {sub.badge && (
                        <span className="text-[9px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/25 px-1 rounded">
                          {sub.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

NotchItem.displayName = "NotchItem";

/* ─────────────────────────────────────────────────────────────────────────────
   MOBILE/TABLET DROPDOWN DRAWER
───────────────────────────────────────────────────────────────────────────── */

interface NotchDropdownItemProps {
  item: NotchItemData;
  isSelected: boolean;
  onSelect: (id: string, href?: string) => void;
}

function NotchDropdownItem({
  item,
  isSelected,
  onSelect,
}: NotchDropdownItemProps) {
  const Icon = item.icon;
  const [expanded, setExpanded] = useState(false);
  const hasSub = Boolean(item.subItems && item.subItems.length > 0);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-1">
        <button
          type="button"
          onClick={() => onSelect(item.id)}
          className={cn(
            "flex flex-1 cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors select-none",
            isSelected
              ? "bg-white/[0.08] font-semibold text-amber-400"
              : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
          )}
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="size-3.5 shrink-0" />}
            <span>{item.label}</span>
          </div>

          {isSelected && <Check className="size-3 text-amber-400" />}
        </button>

        {hasSub && (
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            className="p-1.5 text-zinc-500 hover:text-zinc-300"
          >
            <ChevronDown
              className={cn(
                "size-3 transition-transform",
                expanded && "rotate-180 text-amber-400"
              )}
            />
          </button>
        )}
      </div>

      {hasSub && expanded && (
        <div className="pl-6 py-1 flex flex-col gap-0.5">
          {item.subItems?.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => onSelect(item.id, sub.href || sub.id)}
              className="text-left text-[11px] text-zinc-400 hover:text-white py-1 px-2 rounded hover:bg-white/[0.05]"
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN ADAPTIVE NOTCH NAVIGATION COMPONENT
───────────────────────────────────────────────────────────────────────────── */

export interface NotchNavProps extends HTMLAttributes<HTMLDivElement> {
  items: NotchItemData[];
  activeId?: string;
  defaultActiveId?: string;
  position?: NotchPosition;
  logo?: ReactNode;
  rightContent?: ReactNode;
  showLogo?: boolean;
  showRightContent?: boolean;
  children?: ReactNode;
  onActiveChange?: (id: string, href?: string) => void;
}

export function NotchNav({
  items,
  activeId: controlledActiveId,
  defaultActiveId,
  position = "top",
  logo,
  rightContent,
  showLogo = true,
  showRightContent = true,
  children,
  onActiveChange,
  className,
  ...props
}: NotchNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const layoutGroupId = useId();

  const [internalActiveId, setInternalActiveId] = useState<string>(
    defaultActiveId || items[0]?.id || ""
  );

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const isBottom = position === "bottom";

  const activeId =
    controlledActiveId !== undefined
      ? controlledActiveId
      : internalActiveId;

  const activeIndex = useMemo(() => {
    const index = items.findIndex((item) => item.id === activeId);
    return index >= 0 ? index : 0;
  }, [items, activeId]);

  const activeItem = items[activeIndex] || items[0];

  const handleSelect = useCallback(
    (id: string, href?: string) => {
      if (controlledActiveId === undefined) {
        setInternalActiveId(id);
      }
      setOpenDropdownId(null);
      setIsMobileMenuOpen(false);
      onActiveChange?.(id, href);
    },
    [controlledActiveId, onActiveChange]
  );

  const handleToggleDropdown = useCallback((id: string) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  }, []);

  const handleCloseDropdown = useCallback(() => {
    setOpenDropdownId(null);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownId(null);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed inset-0 h-screen w-screen overflow-hidden bg-black p-0 md:p-1.5 transition-colors duration-200",
        className
      )}
      {...props}
    >
      <div className="relative flex h-full w-full flex-col rounded-none md:rounded-2xl bg-[#080a0d] text-[#e8eaf0] antialiased">
        {/* Backdrop for open menus */}
        <div
          aria-hidden="true"
          onClick={() => {
            setOpenDropdownId(null);
            setIsMobileMenuOpen(false);
          }}
          className={cn(
            "fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-150",
            openDropdownId || isMobileMenuOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          )}
        />

        {/* ───────────────────────────────────────────────────────────────────
            1. DESKTOP LEFT LOGO NOTCH
        ─────────────────────────────────────────────────────────────────── */}
        {showLogo && logo && (
          <aside
            aria-label="Brand logo notch"
            className={cn(
              "hidden xl:flex absolute left-0 z-50 h-9.5 px-4 select-none bg-black border-white/[0.08] shadow-md",
              isBottom
                ? "bottom-0 rounded-tr-[20px] border-t border-r items-center"
                : "top-0 rounded-br-[20px] border-b border-r items-center"
            )}
          >
            <div className="flex items-center text-zinc-50">{logo}</div>
            <NotchRightWing position={position} />
            <NotchCornerLeftWing position={position} />
          </aside>
        )}

        {/* ───────────────────────────────────────────────────────────────────
            2. DESKTOP CENTER NAVIGATION NOTCH (WITH LITTLE NOTCHES AROUND)
        ─────────────────────────────────────────────────────────────────── */}
        <header
          role="tablist"
          aria-orientation="horizontal"
          className={cn(
            "hidden xl:flex absolute left-1/2 -translate-x-1/2 z-50 h-9.5 px-3 bg-black text-zinc-50 select-none border-white/[0.08] shadow-lg",
            isBottom
              ? "bottom-0 rounded-t-[20px] border-t border-x items-center"
              : "top-0 rounded-b-[20px] border-b border-x items-center"
          )}
        >
          <NotchLeftWing position={position} />
          <NotchRightWing position={position} />

          <LayoutGroup id={layoutGroupId}>
            <div className="flex items-center gap-0.5">
              {items.map((item) => (
                <NotchItem
                  key={item.id}
                  item={item}
                  isActive={item.id === activeId}
                  isMenuOpen={openDropdownId === item.id}
                  position={position}
                  onSelect={handleSelect}
                  onToggleDropdown={handleToggleDropdown}
                  onCloseDropdown={handleCloseDropdown}
                />
              ))}
            </div>
          </LayoutGroup>
        </header>

        {/* ───────────────────────────────────────────────────────────────────
            3. DESKTOP RIGHT ACTION NOTCH
        ─────────────────────────────────────────────────────────────────── */}
        {showRightContent && rightContent && (
          <aside
            aria-label="User actions notch"
            className={cn(
              "hidden xl:flex absolute right-0 z-50 h-9.5 px-4 select-none bg-black border-white/[0.08] shadow-md",
              isBottom
                ? "bottom-0 rounded-tl-[20px] border-t border-l items-center"
                : "top-0 rounded-bl-[20px] border-b border-l items-center"
            )}
          >
            <NotchLeftWing position={position} />
            <NotchCornerRightWing position={position} />
            <div className="flex items-center text-zinc-50">{rightContent}</div>
          </aside>
        )}

        {/* ───────────────────────────────────────────────────────────────────
            4. MOBILE & TABLET COMPACT ISLAND
        ─────────────────────────────────────────────────────────────────── */}
        <div
          className={cn(
            "xl:hidden absolute z-50 flex flex-col bg-black text-zinc-50 select-none border-white/[0.08] shadow-xl",
            "w-auto left-1/2 -translate-x-1/2 px-3",
            isBottom
              ? "bottom-0 rounded-t-[20px] border-t border-x"
              : "top-0 rounded-b-[20px] border-b border-x"
          )}
        >
          <NotchLeftWing position={position} />
          <NotchRightWing position={position} />

          <div className="flex h-9 items-center justify-between gap-3">
            {showLogo && logo && (
              <div className="flex shrink-0 items-center">{logo}</div>
            )}

            <button
              type="button"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((p) => !p)}
              className="flex h-7 cursor-pointer items-center justify-center gap-1 rounded-full bg-white/[0.06] px-2.5 text-xs font-semibold text-zinc-200"
            >
              {activeItem?.icon && (
                <activeItem.icon className="size-3 text-amber-400" />
              )}
              <span>{activeItem?.label}</span>
              {isBottom ? (
                <ChevronUp
                  className={cn(
                    "size-3 text-zinc-400 transition-transform",
                    isMobileMenuOpen && "rotate-180"
                  )}
                />
              ) : (
                <ChevronDown
                  className={cn(
                    "size-3 text-zinc-400 transition-transform",
                    isMobileMenuOpen && "rotate-180"
                  )}
                />
              )}
            </button>

            {showRightContent && rightContent && (
              <div className="flex shrink-0 items-center">{rightContent}</div>
            )}
          </div>

          {/* Expandable Mobile List */}
          <div
            className={cn(
              "grid transition-[grid-template-rows,opacity] duration-150 ease-out w-full",
              isMobileMenuOpen
                ? "grid-rows-[1fr] opacity-100 border-t border-white/[0.06]"
                : "grid-rows-[0fr] opacity-0 pointer-events-none"
            )}
          >
            <div className="overflow-hidden">
              <div className="flex w-full flex-col gap-0.5 py-1.5 max-h-[50vh] overflow-y-auto">
                {items.map((item) => (
                  <NotchDropdownItem
                    key={item.id}
                    item={item}
                    isSelected={item.id === activeId}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────────────
            5. MINIMALIST SCROLLABLE VIEWPORT
        ─────────────────────────────────────────────────────────────────── */}
        <div
          className={cn(
            "relative flex w-full items-start h-full overflow-y-auto overflow-x-hidden transition-all",
            isBottom ? "pt-4 pb-14 px-4 sm:px-6" : "pt-13 pb-6 px-4 sm:px-6"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
