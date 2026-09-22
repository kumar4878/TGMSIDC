---
name: RC Coverage cross-referencing
description: How to match equipment items to their tenders when Tender type lacks equipmentId
---

## Rule
`mockTenders` has `equipmentName` (string) but NO `equipmentId`. To link a tender to an equipment item, match on the first word of `equipment.name` against `tender.equipmentName.toLowerCase().includes(firstWord)`.

**Why:** The Tender API/mock type was designed with equipmentName only (no FK to equipment). Changing the schema would require API codegen + migration; first-word match is accurate enough for the current 13-item mock set.

**How to apply:** In any component that needs equipment↔tender cross-reference (rc-coverage.tsx, equipment.tsx, reports.tsx RCCoverageTab) use:
```ts
const firstWord = eq.name.toLowerCase().split(" ")[0];
mockTenders.find(t => t.equipmentName.toLowerCase().includes(firstWord) && t.status !== "rc_created" && t.status !== "awarded")
```
Exclude `rc_created` and `awarded` statuses — those tenders are closed and should not count as "Tender in Progress".
