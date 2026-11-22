/* RunFindingsPopover — on a settled timeline run: one coloured "icon + count" per
   severity that has findings (e.g. ⓘ1 ⚠4). Hover opens a popover with a short card
   per finding; click pins it open (Escape / outside click closes). Clicking a
   finding jumps to that run's accordion in "Review runs" below.
   Data = the run's findings already loaded by usePrReviews — no extra request. */
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Icon, SEV } from "@devdigest/ui";
import type { FindingRecord } from "@devdigest/shared";
import { SEVERITY_LEVELS } from "../../../FindingsPanel/constants";
import { countBySeverity } from "../../../FindingsPanel/helpers";
import { FindingsPopoverCard } from "../../../FindingsPopoverCard";
import { s } from "./styles";

export function RunFindingsPopover({
  findings,
  onSelect,
}: {
  findings: FindingRecord[];
  /** Called when a finding in the popover is clicked (jump to the run's findings). */
  onSelect?: () => void;
}) {
  const t = useTranslations("prReview");
  const [open, setOpen] = React.useState(false);
  const [pinned, setPinned] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const popoverId = React.useId();

  const counts = React.useMemo(() => countBySeverity(findings), [findings]);
  const levels = SEVERITY_LEVELS.filter((sev) => counts[sev] > 0);

  const close = React.useCallback(() => {
    setOpen(false);
    setPinned(false);
  }, []);

  // While open: Escape and clicks outside close it.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open, close]);

  if (findings.length === 0) return null;

  const countsLabel = levels
    .map((sev) =>
      t("panel.severityFilter.count", { count: counts[sev], label: t(`panel.severityFilter.levels.${sev}`) }),
    )
    .join(", ");

  return (
    <div
      ref={wrapRef}
      style={s.wrap}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        if (!pinned) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-label={`${countsLabel} · ${t("timeline.showFindings")}`}
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        onClick={() => {
          if (pinned) close();
          else {
            setOpen(true);
            setPinned(true);
          }
        }}
        style={s.trigger}
      >
        {levels.map((sev) => {
          const I = Icon[SEV[sev].icon];
          return (
            <span key={sev} style={s.count(SEV[sev].c)}>
              <I size={13} />
              <span className="tnum">{counts[sev]}</span>
            </span>
          );
        })}
      </button>

      {open && (
        <div id={popoverId} role="dialog" aria-label={t("timeline.findingsHeader", { count: findings.length })} style={s.popover}>
          <FindingsPopoverCard
            header={t("timeline.findingsHeader", { count: findings.length })}
            findings={findings}
            itemTitle={t("timeline.goToFinding")}
            onSelect={() => {
              close();
              onSelect?.();
            }}
          />
        </div>
      )}
    </div>
  );
}
