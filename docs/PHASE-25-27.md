> Superseded by v4.0.0 Phases 28–36. Retained as the historical v3.0.0 milestone record.

# Countdown — Phase 25–27 / Version 3.0.0

## Phase 25 — Full Testing & QA
- Added runtime status coverage for online/offline state, secure context and service worker availability.
- Added performance sanity metrics to the Status page.
- Kept Error Boundary and safe storage protections.
- Preserved existing Phase 8/core styling and platform behavior.

## Phase 26 — Performance 2.0
- Platform routes remain lazy-loaded through React.lazy/Suspense.
- Added lightweight browser performance metrics without a new runtime dependency.
- Kept countdown timing isolated to its existing hook and avoided global render loops.
- Existing image-heavy discovery/community surfaces already use lazy image loading where applicable.

## Phase 27 — Mobile App Experience
- PWA manifest upgraded with app metadata, portrait orientation, categories and app shortcuts.
- Share Target retained.
- Service-worker cache bumped to the Phase 27 shell so stale assets are invalidated.
- Online/offline state is exposed to the app shell.
- Existing install prompt and notification/reminder system remain compatible.

## Versioning
Version 3.0.0 starts with the Phase 25–27 milestone. Future changes in this milestone should increment patch/minor versions instead of silently changing the major release.
