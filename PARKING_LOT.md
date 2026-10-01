# Parking Lot — future features

Captured ideas, not yet scheduled. Order is capture order, not priority.

## 1. Referential integrity for all drill mappings

Drills reference other taxonomies by id: fundamentals (`trains`), level bands
(`levelMin`/`levelMax`), terrain types, drill ids (`easier`/`harder`/`fallback`
cross-links), terrain gates (`skills`). Today nothing validates those
references — a typo'd fundamental id, a drill pointing at a renamed terrain
type, or a level outside L1–L4 fails silently (raw id renders, or nothing).

Add:

- **Build-time / CI validation**: a seed-data check that fails the build on
  dangling references (unknown fundamental id, unknown terrain type, level
  out of range, drill id that doesn't exist).
- **Admin-page guards**: draw all mapping controls from the canonical
  taxonomies (checkboxes/dropdowns, never free text) so invalid mappings
  can't be created in the first place.
- **Rename/delete propagation**: when a taxonomy entry (fundamental, terrain
  type, level band) is renamed or deleted in the admin, surface the affected
  drills instead of leaving stale references behind.
