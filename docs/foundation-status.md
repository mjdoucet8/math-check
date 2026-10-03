# Stage 1 foundation - 1 October 2026

## Delivered

- Pinned Phaser 3.90.0, TypeScript 5.9.3, Vite 7.3.6 and Playwright 1.63.0, with package-lock.json and Node 22.23.2 verification.
- A working entry point, loading scene and decorative foundation scene. The beacon stays dormant. This is an engine preview, not a playable movement checkpoint.
- Responsive HTML controls, pause/resume and reduced-motion handling. No runtime CDN or remote assets.
- A small serializable shared contract for world progress, submissions and outcomes. Correct first responses, correct retries, assisted and guided completion are distinct. Help cannot be downgraded; duplicate submissions cannot create extra evidence. This is not a mastery classifier or storage implementation.
- Local run/build/test instructions and a GitHub Actions workflow.
- All 14 recovered starter text files preserved byte-for-byte under docs/recovered-starter. The original repository brief remains unchanged.
- A checksum manifest for all 10 files supplied in /home/owner/education-games/nunora. Their images and curriculum PDFs remain untouched in that folder; they were not uploaded to the source repository.

## Verified locally

- Clean npm ci succeeded.
- npm audit reported zero known vulnerabilities at this date.
- Strict TypeScript checking and production build passed.
- Six domain tests passed: independent-first/retry distinctions, help persistence, guided evidence, duplicate-submit protection, invalid input/completion protection and empty initial world state.
- Four production-browser checks passed across desktop Chromium and touch emulation: loading/rendering, actual animation pause/resume, resize, reload, reduced motion and keyboard access to browser controls. No page errors or failed requests were observed.
- Desktop and tablet screenshots were reviewed. Physical tablet testing remains for the movement checkpoint.

The full Phaser bundle is approximately 1.21 MB before compression (334 KB gzip); Vite emits a large-chunk warning. It is retained intact at this foundation stage, rather than disguising the warning or adding premature bundler customization. Loading on the actual classroom network should be checked later.

## Repository and backup

The foundation branch is numora/foundation, based on main commit 2bfb8cc2280d31a074bac5921383a5186fd3e31c. Both inspected remote branches contained only docs/prototype-brief.md at the start. The recovered local starter was a separate local checkpoint, not a remotely backed-up app.

The local foundation is committed and supplied as a portable source ZIP excluding installed packages, browser binaries and build output. After explicit user authorization, branch numora/foundation was pushed and its remote SHA verified. Draft review: https://github.com/mjdoucet8/math-check/pull/1. Final remote commit verification is recorded in Linear MAT-49. Main remains unchanged, and no hosted production deployment has been created.

## Next

MAT-50-52: layered harbour scenery, player/resident/beacon assets, walkability/routing, gentle camera and approach interactions, followed by Mathieu's movement review. Existing maths targets, post-demonstration timing, garden transitions and satchel colours remain provisional as recorded in the prototype plan.
