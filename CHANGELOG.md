# Changelog

## 1.0.0 (2026-08-31)


### Features

* AI copyright detection & on-chain licensing marketplace ([a9d4585](https://github.com/BDutta18/DeMediaa/commit/a9d4585c06e9b50b01597b20b66ba0b29669fcaf))
* **backend:** add input validation middleware; enforce required fields on marketplace POST routes ([3fec8df](https://github.com/BDutta18/DeMediaa/commit/3fec8dffabf3ea3071c00f7fa17091ac93786712))
* **backend:** add marketplace engagement api ([dd578e1](https://github.com/BDutta18/DeMediaa/commit/dd578e1dbcc188f3f79d369fb842744c7a9647f1))
* **backend:** add marketplace engagement models ([4abbf20](https://github.com/BDutta18/DeMediaa/commit/4abbf20e8a034100c42746df1d4ccd384e3d88e0))
* **backend:** add pagination utility with parsePagination and paginatedResponse helpers ([3989016](https://github.com/BDutta18/DeMediaa/commit/3989016de45311aa19b0a11ffa4fc6a4f60b06f4))
* **frontend:** add advanced marketplace search ([a1d3c75](https://github.com/BDutta18/DeMediaa/commit/a1d3c7598cf1ef2e20dfd4c4e963cfaf6aae378f))
* **frontend:** add CardSkeleton and CardSkeletonGrid components for loading states ([f1937b6](https://github.com/BDutta18/DeMediaa/commit/f1937b6a9c697c7f38c865dd34a30ab692933080))
* **frontend:** add content engagement actions ([10f4968](https://github.com/BDutta18/DeMediaa/commit/10f49684b384740463cac8433f89b6cf9f696eff))
* **frontend:** add creator analytics dashboard ([accb4e2](https://github.com/BDutta18/DeMediaa/commit/accb4e26f1f71dcac2d4be116f975b8a59eca45c))
* **frontend:** add custom 404 not-found page with home and marketplace links ([4700e5f](https://github.com/BDutta18/DeMediaa/commit/4700e5f93ddff31de0fc774dbe738ccd5c9cdb75))
* **frontend:** add global-error.tsx error boundary with reset and home fallback ([a6d9dad](https://github.com/BDutta18/DeMediaa/commit/a6d9dad995962517b042ac3d01ec975d01f08088))
* **frontend:** add marketplace api client ([dbeca81](https://github.com/BDutta18/DeMediaa/commit/dbeca816f7c5e8e7079aaec8d3ce9de603944937))
* **frontend:** add marketplace state store ([ff1ebe8](https://github.com/BDutta18/DeMediaa/commit/ff1ebe8811ce2b0c886bf3cdd5b3e9bba09cdfda))
* **frontend:** add notification center ([6e100be](https://github.com/BDutta18/DeMediaa/commit/6e100be0219e9f0fc0729185f9be6a273b747976))
* **frontend:** add reusable CopyButton component with feedback state ([f8252c3](https://github.com/BDutta18/DeMediaa/commit/f8252c391f7ff80e1fac2d182f3bd98de29cd05c))
* **frontend:** add reusable EmptyState component with customizable icon and action ([12ba88e](https://github.com/BDutta18/DeMediaa/commit/12ba88ec375e9802b3e42aa729b8255cf3471580))
* **frontend:** add reusable useDebounce hook for input throttling ([d1fbf74](https://github.com/BDutta18/DeMediaa/commit/d1fbf74c50c783e4288554e2db7395f641a5d9cb))
* **frontend:** add route loading skeletons ([18a7d7d](https://github.com/BDutta18/DeMediaa/commit/18a7d7d03d1b1c58af77d6b8b10bd18700f85044))
* **frontend:** add SEO helper constructMetadata for uniform OpenGraph tags ([998a857](https://github.com/BDutta18/DeMediaa/commit/998a857e0f6dc04b5dc54ae96e945e5bb6071bbb))
* **frontend:** add useCopyToClipboard hook with auto-reset state ([8ddd7ec](https://github.com/BDutta18/DeMediaa/commit/8ddd7ec01ceca8eb0c0a73c5c6a7f8ecf7a1f5ea))
* **frontend:** add useLocalStorage hook with SSR safety and type safety ([0cc17dc](https://github.com/BDutta18/DeMediaa/commit/0cc17dc07ca8c0539d319bcc4c94c749d351484a))
* **frontend:** refresh marketplace browsing ([8243cf1](https://github.com/BDutta18/DeMediaa/commit/8243cf1a0e9b64a75f3889504d59f71bad4ffb98))


### Bug Fixes

* add ethnum-patch to git and fix E0512 transmute compile error ([5d02c42](https://github.com/BDutta18/DeMediaa/commit/5d02c42cfe86aeba5a66548ddfb8b5675985a001))
* backend render production config ([3759040](https://github.com/BDutta18/DeMediaa/commit/3759040817c689689d16f02e90e4bde76e5a08c8))
* **backend:** add in-memory rate limiter middleware; apply to auth routes (20 req/min) ([28a7bec](https://github.com/BDutta18/DeMediaa/commit/28a7bec0791dda7de6c91fd3f7f21f4bdfa37281))
* **backend:** add typed error handler middleware with code, status, and stack trace in dev ([25a0498](https://github.com/BDutta18/DeMediaa/commit/25a049827ca274c511eb80f0282618c1d8d5f52e))
* **backend:** fix template literals in errorHandler, rateLimiter, and validateBody middlewares ([b701ff3](https://github.com/BDutta18/DeMediaa/commit/b701ff39780147019a9ddc201b8d9eb83218f9cf))
* **ci:** bump Rust to stable -- Cargo.lock v4 incompatible with 1.79; remove unused imports in license_marketplace ([4d4fe63](https://github.com/BDutta18/DeMediaa/commit/4d4fe63396b930c91aba3befbb8f8db73c7a7c09))
* **frontend:** use useCallback for login/logout in auth-context to fix useMemo dep warning ([dc9ae87](https://github.com/BDutta18/DeMediaa/commit/dc9ae87a99f5cfdcd75ddcc1854c40e5df53240b))
* mongodb connection string ([0874ee6](https://github.com/BDutta18/DeMediaa/commit/0874ee64da780b17030bd3a01bbf46f6a2c3663f))
* rebuilt frontend with clean deps (Next 14 + React 18) ([954f778](https://github.com/BDutta18/DeMediaa/commit/954f7781e4ee3c2cb28e270fc494d5f12852b74b))
* resolve all CI/CD failures ([61d25c0](https://github.com/BDutta18/DeMediaa/commit/61d25c0f78c5ab1bac054ac357a4c16680d8fad6))
