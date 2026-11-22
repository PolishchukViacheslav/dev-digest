/* PRFindings — FINDINGS cell of a PR list row: one coloured "icon + count" per
   severity found by the PR's latest review (e.g. ⓘ1 ⚠4), same icons as the PR
   timeline. "—" until the PR is reviewed, and when the review found nothing.
   Counts arrive with the list row (GET /repos/:id/pulls).
   Hover (or keyboard focus) opens the same findings popover as the timeline, with
   the latest review's findings (GET /pulls/:id/reviews, loaded on first open). The
   card is portalled to <body> because the table card clips overflow. Leaving
   trigger + card, Escape, scroll or resize close it. Clicking a finding opens the PR
   on its Findings tab; clicking the icons opens the PR like the rest of the row. */
"use client";

import React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon, SEV } from "@devdigest/ui";
import type { PrMeta } from "@/lib/types";
import { usePrReviews } from "@/lib/hooks";
import { FindingsPopoverCard } from "../../[number]/_components/FindingsPopoverCard";
import { FINDINGS_FIELDS } from "../../constants";
import { HOVER_CLOSE_DELAY_MS, HOVER_OPEN_DELAY_MS } from "./constants";
import { popoverPosition, type PopoverPosition } from "./helpers";
import { s } from "./styles";

export function PRFindings({ pr, repoId }: { pr: PrMeta; repoId: string }) {
  const t = useTranslations("prReview");
  const router = useRouter();
  const [pos, setPos] = React.useState<PopoverPosition | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const popoverRef = React.useRef<HTMLDivElement | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const popoverId = React.useId();
  const open = pos !== null;

  const reviews = usePrReviews(open ? pr.id : null);
  const latest = reviews.data?.find((r) => r.kind === "review");
  const findings = latest?.findings ?? [];

  const clearTimer = React.useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const close = React.useCallback(() => {
    clearTimer();
    setPos(null);
  }, [clearTimer]);
  // Short delays: the pointer sweeping down the column doesn't open (and fetch) every
  // row, and it can cross the gap between trigger and card without closing it.
  const scheduleOpen = React.useCallback(
    (delay: number) => {
      clearTimer();
      timer.current = setTimeout(() => {
        const el = triggerRef.current;
        if (!el) return;
        setPos(
          popoverPosition(el.getBoundingClientRect(), {
            width: window.innerWidth,
            height: window.innerHeight,
          }),
        );
      }, delay);
    },
    [clearTimer],
  );
  const scheduleClose = React.useCallback(() => {
    clearTimer();
    timer.current = setTimeout(() => setPos(null), HOVER_CLOSE_DELAY_MS);
  }, [clearTimer]);

  React.useEffect(() => clearTimer, [clearTimer]);

  // While open: Escape, a click outside trigger + card, page scroll or resize close it.
  React.useEffect(() => {
    if (!open) return;
    const inside = (target: EventTarget | null) =>
      target instanceof Node &&
      (triggerRef.current?.contains(target) || popoverRef.current?.contains(target));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onDown = (e: MouseEvent) => {
      if (!inside(e.target)) close();
    };
    // The card is position:fixed, so it would drift from its row on scroll. Scrolling
    // the card's own list must not close it.
    const onScroll = (e: Event) => {
      if (!inside(e.target)) close();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", close);
    };
  }, [open, close]);

  const levels = FINDINGS_FIELDS.map(({ sev, field }) => ({ sev, count: pr[field] ?? 0 })).filter(
    (l) => l.count > 0,
  );

  if (levels.length === 0) return <span style={s.muted}>—</span>;

  const total = levels.reduce((n, l) => n + l.count, 0);
  const countsLabel = levels
    .map(({ sev, count }) =>
      t("panel.severityFilter.count", { count, label: t(`panel.severityFilter.levels.${sev}`) }),
    )
    .join(", ");
  const header = t("list.findingsPopover.header", { count: latest ? findings.length : total });

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`${countsLabel} · ${t("list.findingsPopover.open")}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        onMouseEnter={() => scheduleOpen(open ? 0 : HOVER_OPEN_DELAY_MS)}
        onMouseLeave={scheduleClose}
        onFocus={() => scheduleOpen(0)}
        onBlur={scheduleClose}
        style={s.trigger}
      >
        {levels.map(({ sev, count }) => {
          const I = Icon[SEV[sev].icon];
          return (
            <span key={sev} style={s.count(SEV[sev].c)}>
              <I size={13} />
              <span className="tnum">{count}</span>
            </span>
          );
        })}
      </button>

      {pos &&
        createPortal(
          <div
            ref={popoverRef}
            id={popoverId}
            role="dialog"
            aria-label={header}
            style={s.popover(pos)}
            onMouseEnter={clearTimer}
            onMouseLeave={scheduleClose}
            onFocus={clearTimer}
            onBlur={scheduleClose}
            // React events bubble through portals: keep clicks in the card away from the row.
            onClick={(e) => e.stopPropagation()}
          >
            <FindingsPopoverCard
              header={header}
              findings={findings}
              itemTitle={t("list.findingsPopover.goToFinding")}
              onSelect={() => {
                close();
                router.push(`/repos/${repoId}/pulls/${pr.number}?tab=findings`);
              }}
              placeholder={
                reviews.isError ? t("list.findingsPopover.error") : t("list.findingsPopover.loading")
              }
            />
          </div>,
          document.body,
        )}
    </>
  );
}
