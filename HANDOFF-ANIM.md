EMBERFALL 2 - fix jolty/slow walk animation on the ElizaWy base. Walk looks slow + stuttery, not
smooth. Read docs\QUALITY-BIBLE.md (Gate M). Van's eye is ground truth.

DIAGNOSE then FIX:
1. Check the walk animation: correct frame count for ElizaWy's walk cycle? correct frame rate
   (fps)? all equipment/face layers using the SAME frame timing so they don't desync? Is movement
   speed matched to the animation (feet-slide or stutter = mismatch)?
2. Fix: set a proper smooth walk fps, ensure all layers share identical frame timing + frame count,
   match move speed to the cycle so it doesn't stutter or slide. Add run (faster cycle) too.
3. Verify LIVE: walk in all 4 directions - smooth, no jolt, no slide, all layers in sync. Capture
   a short capture or frame-sequence screenshots proving smooth cycling. 0 errors, clean build.

CONSTRAINTS: write-once + data-driven; per-file commit; do not report done until walking is
visibly smooth to a human eye.