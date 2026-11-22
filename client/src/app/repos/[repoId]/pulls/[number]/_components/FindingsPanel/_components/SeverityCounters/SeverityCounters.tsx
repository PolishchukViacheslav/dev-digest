/* SeverityCounters — one pill per severity level ("3 CRITICAL", "5 WARNING", …)
   above a run's findings list. Clicking a pill filters the list to that level;
   clicking the active pill again clears the filter. Purely presentational: the
   counts and the active level are owned by FindingsPanel. */
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type { Severity } from "@devdigest/shared";
import { SEVERITY_LEVELS } from "../../constants";
import type { SeverityCounts } from "../../helpers";
import { s } from "./styles";

export function SeverityCounters({
  counts,
  active,
  onToggle,
}: {
  counts: SeverityCounts;
  active: Severity | null;
  onToggle: (severity: Severity) => void;
}) {
  const t = useTranslations("prReview");

  return (
    <div role="group" aria-label={t("panel.severityFilter.groupLabel")} style={s.row}>
      {SEVERITY_LEVELS.map((sev) => {
        const count = counts[sev];
        const isActive = active === sev;
        // An empty level can't be selected — but an active one stays clickable so
        // the filter can always be cleared (e.g. after "Hide low confidence" empties it).
        const empty = count === 0 && !isActive;
        const label = t(`panel.severityFilter.levels.${sev}`);
        return (
          <button
            key={sev}
            type="button"
            aria-pressed={isActive}
            disabled={empty}
            title={isActive ? t("panel.severityFilter.clear") : t("panel.severityFilter.showOnly", { label })}
            onClick={() => onToggle(sev)}
            style={s.chip(sev, isActive, active !== null, empty)}
          >
            {t("panel.severityFilter.count", { count, label })}
          </button>
        );
      })}
    </div>
  );
}
