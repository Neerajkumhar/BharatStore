'use client';

import React, { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, forwardRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface BuilderWorkspaceHandle {
  toggleLeft: () => void;
  toggleRight: () => void;
}

interface BuilderWorkspaceProps {
  left: React.ReactNode;
  right: React.ReactNode;
  center: React.ReactNode;
  leftLabel?: string;
  rightLabel?: string;
  fullscreen?: boolean;
  onPanelStateChange?: (s: { leftOpen: boolean; rightOpen: boolean }) => void;
}

const STORAGE_KEY = 'bharatstore.builder.workspace.v1';

interface WorkspacePrefs {
  leftOpen: boolean;
  rightOpen: boolean;
  leftWidth: number;
  rightWidth: number;
}

const DEFAULT_PREFS: WorkspacePrefs = {
  leftOpen: true,
  rightOpen: true,
  leftWidth: 280,
  rightWidth: 340,
};

const LEFT_MIN = 220;
const LEFT_MAX = 420;
const RIGHT_MIN = 280;
const RIGHT_MAX = 480;
const CENTER_MIN = 500;
const HANDLE_W = 6;

function clamp(v: number, min: number, max: number) {
  if (Number.isNaN(v)) return min;
  return Math.min(max, Math.max(min, Math.round(v)));
}

function loadPrefs(): WorkspacePrefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const p = JSON.parse(raw) as Partial<WorkspacePrefs>;
    return {
      leftOpen: p.leftOpen ?? DEFAULT_PREFS.leftOpen,
      rightOpen: p.rightOpen ?? DEFAULT_PREFS.rightOpen,
      leftWidth: clamp(p.leftWidth ?? DEFAULT_PREFS.leftWidth, LEFT_MIN, LEFT_MAX),
      rightWidth: clamp(p.rightWidth ?? DEFAULT_PREFS.rightWidth, RIGHT_MIN, RIGHT_MAX),
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isDesktop;
}

export const BuilderWorkspace = forwardRef<BuilderWorkspaceHandle, BuilderWorkspaceProps>(function BuilderWorkspace(
  {
    left,
    right,
    center,
    leftLabel = 'Sections',
    rightLabel = 'Design',
    fullscreen = false,
    onPanelStateChange,
  },
  ref
) {
  const [prefs, setPrefs] = useState<WorkspacePrefs>(loadPrefs);
  const [dragging, setDragging] = useState<'left' | 'right' | null>(null);
  const [openPanel, setOpenPanel] = useState<'left' | 'right' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settledPrefRef = useRef(false);
  const isDesktop = useIsDesktop();

  const effectiveLeftOpen = isDesktop ? prefs.leftOpen : openPanel === 'left';
  const effectiveRightOpen = isDesktop ? prefs.rightOpen : openPanel === 'right';

  // Report open state up so the toolbar reflects it
  useEffect(() => {
    onPanelStateChange?.({ leftOpen: effectiveLeftOpen, rightOpen: effectiveRightOpen });
  }, [effectiveLeftOpen, effectiveRightOpen, onPanelStateChange]);

  const togglePanel = useCallback(
    (side: 'left' | 'right') => {
      if (!isDesktop) {
        setOpenPanel((cur) => (cur === side ? null : side));
        return;
      }
      setPrefs((p) => ({ ...p, [side === 'left' ? 'leftOpen' : 'rightOpen']: !p[side === 'left' ? 'leftOpen' : 'rightOpen'] }));
    },
    [isDesktop]
  );

  const toggleLeft = useCallback(() => togglePanel('left'), [togglePanel]);
  const toggleRight = useCallback(() => togglePanel('right'), [togglePanel]);

  useImperativeHandle(ref, () => ({ toggleLeft, toggleRight }), [toggleLeft, toggleRight]);

  // Persist prefs (debounced) whenever they change
  useEffect(() => {
    persistTimer.current = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      } catch {
        /* ignore storage errors */
      }
    }, 400);
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [prefs]);

  // On first desktop render without a stored preference, default a panel to
  // collapsed on narrower screens so the center canvas stays comfortably wide.
  useEffect(() => {
    if (!isDesktop) return;
    if (settledPrefRef.current) return;
    settledPrefRef.current = true;
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        const w = window.innerWidth;
        if (w < 1200) {
          setPrefs((p) => ({ ...p, rightOpen: false }));
        }
      }
    } catch {
      /* ignore storage errors */
    }
  }, [isDesktop]);

  // Mouse drag resize (desktop only)
  useEffect(() => {
    if (!dragging) return;
    const container = containerRef.current;
    if (!container) return;

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      setPrefs((p) => {
        const maxRight = rect.width - x;
        if (dragging === 'left') {
          const maxLeft = rect.width - (p.rightOpen ? p.rightWidth : 0) - CENTER_MIN - HANDLE_W;
          return { ...p, leftWidth: clamp(x, LEFT_MIN, Math.min(LEFT_MAX, maxLeft)) };
        }
        const maxRightAllowed = rect.width - (p.leftOpen ? p.leftWidth : 0) - CENTER_MIN - HANDLE_W;
        return { ...p, rightWidth: clamp(maxRight, RIGHT_MIN, Math.min(RIGHT_MAX, maxRightAllowed)) };
      });
    };

    const onUp = () => setDragging(null);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [dragging]);

  // Auto-collapse a panel when the viewport narrows so the center keeps >= CENTER_MIN
  useLayoutEffect(() => {
    if (!isDesktop) return;
    const el = containerRef.current;
    if (!el) return;
    const guard = () => {
      const w = el.getBoundingClientRect().width;
      const center =
        w -
        (prefs.leftOpen ? prefs.leftWidth + HANDLE_W : 0) -
        (prefs.rightOpen ? prefs.rightWidth + HANDLE_W : 0);
      if (center < CENTER_MIN && prefs.leftOpen && prefs.rightOpen) {
        setPrefs((p) => (p.rightOpen ? { ...p, rightOpen: false } : p));
      } else if (center < CENTER_MIN && prefs.leftOpen) {
        setPrefs((p) => (p.leftOpen ? { ...p, leftOpen: false } : p));
      }
    };
    const ro = new ResizeObserver(guard);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isDesktop, prefs.leftOpen, prefs.rightOpen, prefs.leftWidth, prefs.rightWidth]);

  // Fullscreen: hide all panels, just show the center canvas
  if (fullscreen) {
    return (
      <div className="flex flex-1 overflow-hidden relative bg-slate-200/50" ref={containerRef}>
        <div className="flex-1 overflow-hidden">{center}</div>
      </div>
    );
  }

  // Tablet/mobile: inline sidebars are hidden; render as overlay drawers
  if (!isDesktop) {
    return (
      <div className="flex flex-1 overflow-hidden relative" ref={containerRef}>
        <div className="flex-1 min-w-0 overflow-hidden">{center}</div>

        {openPanel === 'left' && (
          <div className="absolute inset-y-0 left-0 z-30 flex w-[340px] max-w-[85vw] shadow-2xl">
            <div className="relative flex-1 bg-white border-r border-slate-200 overflow-hidden">
              <div className="h-full overflow-hidden">{left}</div>
              <button
                onClick={toggleLeft}
                aria-label="Close Sections panel"
                className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {openPanel === 'right' && (
          <div className="absolute inset-y-0 right-0 z-30 flex w-[360px] max-w-[85vw] shadow-2xl">
            <div className="relative flex-1 bg-white border-l border-slate-200 overflow-hidden">
              <div className="h-full overflow-hidden">{right}</div>
              <button
                onClick={toggleRight}
                aria-label="Close Design panel"
                className="absolute left-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop: inline resizable 3-panel layout
  return (
    <div className="flex flex-1 overflow-hidden relative" ref={containerRef}>
      {prefs.leftOpen && (
        <div className="h-full flex flex-col relative shrink-0" style={{ width: prefs.leftWidth, minWidth: LEFT_MIN }}>
          <div className="relative flex-1 min-h-0 overflow-hidden">
            <div className="h-full overflow-hidden">{left}</div>
          </div>
          <button
            onClick={toggleLeft}
            title={`Collapse ${leftLabel} panel`}
            className="absolute top-1/2 -right-6 z-20 flex h-9 w-6 -translate-y-1/2 items-center justify-center rounded-r-md border border-l-0 border-slate-200 bg-white text-slate-500 shadow-sm hover:text-slate-900 hover:bg-white transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      )}

      {prefs.leftOpen && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize Sections panel"
          onMouseDown={() => setDragging('left')}
          className="group relative z-10 w-1.5 -ml-0.5 shrink-0 cursor-col-resize bg-transparent hover:bg-amber-500/30 active:bg-amber-500/50 transition-colors"
        />
      )}

      {!prefs.leftOpen && (
        <button
          onClick={toggleLeft}
          title={`Open ${leftLabel} panel`}
          className="absolute left-0 top-1/2 z-20 flex h-20 w-6 -translate-y-1/2 items-center justify-center rounded-r-md border border-l-0 border-slate-200 bg-white text-slate-500 shadow-md hover:text-slate-900 hover:bg-white transition"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      <div className="min-w-0 flex-1 overflow-hidden">{center}</div>

      {!prefs.rightOpen && (
        <button
          onClick={toggleRight}
          title={`Open ${rightLabel} panel`}
          className="absolute right-0 top-1/2 z-20 flex h-20 w-6 -translate-y-1/2 items-center justify-center rounded-l-md border border-r-0 border-slate-200 bg-white text-slate-500 shadow-md hover:text-slate-900 hover:bg-white transition"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {prefs.rightOpen && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize Design panel"
          onMouseDown={() => setDragging('right')}
          className="group relative z-10 w-1.5 -mr-0.5 shrink-0 cursor-col-resize bg-transparent hover:bg-amber-500/30 active:bg-amber-500/50 transition-colors"
        />
      )}

      {prefs.rightOpen && (
        <div className="h-full flex flex-col relative shrink-0" style={{ width: prefs.rightWidth, minWidth: RIGHT_MIN }}>
          <div className="relative flex-1 min-h-0 overflow-hidden">
            <div className="h-full overflow-hidden">{right}</div>
          </div>
          <button
            onClick={toggleRight}
            title={`Collapse ${rightLabel} panel`}
            className="absolute top-1/2 -left-6 z-20 flex h-9 w-6 -translate-y-1/2 items-center justify-center rounded-l-md border border-r-0 border-slate-200 bg-white text-slate-500 shadow-sm hover:text-slate-900 hover:bg-white transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
});
