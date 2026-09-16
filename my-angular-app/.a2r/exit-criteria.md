## Validation / Exit Criteria

1. `npm run build` succeeds with zero TypeScript or compilation errors.
2. `.a2r/migration-report.html` Business Logic section shows 100% pass — every domain scenario is listed and passing.
3. `.a2r/migration-report.html` UI Comparison section shows all routes passing at maxDiffPixelRatio ≤ 0.30.
4. No Angular-specific packages remain in the React app's dependencies.
