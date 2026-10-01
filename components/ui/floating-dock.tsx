"use client";
import { cn } from "@/lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef, useState } from "react";
import Link from "next/link";

export interface DockItem {
  title: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  badge?: string;
}

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: DockItem[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: DockItem[];
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute inset-x-0 bottom-full mb-3 flex flex-col items-center gap-2"
          >
            {items.map((item, idx) => {
              const content = (
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full bg-black/90 border border-white/15 text-zinc-300 shadow-xl backdrop-blur-xl transition-all",
                    item.isActive &&
                      "bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/30"
                  )}
                >
                  <div className="h-5 w-5 flex items-center justify-center">
                    {item.icon}
                  </div>
                </div>
              );

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: 10,
                    transition: {
                      delay: idx * 0.04,
                    },
                  }}
                  transition={{ delay: (items.length - 1 - idx) * 0.04 }}
                >
                  {item.onClick ? (
                    <button
                      type="button"
                      onClick={() => {
                        item.onClick?.();
                        setOpen(false);
                      }}
                      className="cursor-pointer outline-none"
                    >
                      {content}
                    </button>
                  ) : (
                    <Link
                      href={item.href || "#"}
                      onClick={() => setOpen(false)}
                      className="cursor-pointer outline-none"
                    >
                      {content}
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-black/90 border border-white/20 text-white shadow-2xl backdrop-blur-xl transition-transform active:scale-95 cursor-pointer outline-none"
      >
        <IconLayoutNavbarCollapse className="h-6 w-6 text-amber-400" />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: DockItem[];
  className?: string;
}) => {
  let mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden h-16 items-end gap-3.5 rounded-2xl bg-black/85 border border-white/15 px-4 pb-3 shadow-[0_15px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl md:flex",
        className
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  onClick,
  isActive,
  badge,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  badge?: string;
}) {
  let ref = useRef<HTMLDivElement>(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], [42, 76, 42]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [42, 76, 42]);

  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 36, 20]);
  let heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 36, 20]
  );

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 160,
    damping: 14,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 160,
    damping: 14,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 160,
    damping: 14,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 160,
    damping: 14,
  });

  const [hovered, setHovered] = useState(false);

  const innerNode = (
    <motion.div
      ref={ref}
      style={{ width, height }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex aspect-square items-center justify-center rounded-full bg-zinc-900/90 border border-white/10 text-zinc-300 shadow-md transition-colors cursor-pointer",
        "hover:bg-zinc-800 hover:text-white hover:border-amber-400/50",
        isActive &&
          "bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/20 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
      )}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 2, x: "-50%" }}
            className="absolute -top-9 left-1/2 w-fit rounded-lg border border-white/15 bg-black/95 px-2.5 py-1 text-[11px] font-bold whitespace-pre text-white shadow-xl backdrop-blur-md flex items-center gap-1.5"
          >
            <span>{title}</span>
            {badge && (
              <span className="rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 py-0.1 text-[9px] font-bold">
                {badge}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        style={{ width: widthIcon, height: heightIcon }}
        className="flex items-center justify-center"
      >
        {icon}
      </motion.div>
    </motion.div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="cursor-pointer outline-none bg-transparent border-none p-0 flex items-center justify-center"
      >
        {innerNode}
      </button>
    );
  }

  return (
    <Link href={href || "#"} className="cursor-pointer outline-none">
      {innerNode}
    </Link>
  );
}

export default FloatingDock;
