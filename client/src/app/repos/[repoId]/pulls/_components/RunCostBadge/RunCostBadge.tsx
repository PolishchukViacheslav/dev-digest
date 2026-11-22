/* RunCostBadge — run/PR spend. `compact` = cost only ($0.012); `detailed` = cost + tokens in→out ($0.014 · 8.2K→1.3K). */
"use client";

import React from "react";
import { formatCost, formatTokens, NO_VALUE } from "@/lib/format";
import { s } from "./styles";

export type RunCostBadgeProps = {
  costUsd: number | null | undefined;
  tokensIn?: number | null;
  tokensOut?: number | null;
  variant?: "compact" | "detailed";
};

export function RunCostBadge({ costUsd, tokensIn, tokensOut, variant = "compact" }: RunCostBadgeProps) {
  const cost = formatCost(costUsd);
  const hasCost = cost !== NO_VALUE;
  if (variant === "compact") {
    return <span style={hasCost ? s.cost : s.empty}>{cost}</span>;
  }
  return (
    <span style={s.detailed}>
      <span style={hasCost ? s.cost : s.empty}>{cost}</span>
      <span style={s.sep}> · </span>
      <span style={s.tokens}>{formatTokens(tokensIn, tokensOut)}</span>
    </span>
  );
}
