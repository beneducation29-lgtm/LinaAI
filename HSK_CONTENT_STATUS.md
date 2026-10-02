# HSK Content Status

The production gate must calculate HSK 1–6 coverage from published CMS records.

Required dimensions:
- Vocabulary
- Grammar
- Listening
- Speaking
- Reading
- Writing
- Review

A level with a missing required dimension is **CONTENT GAP** or **PARTIAL**. It must not be presented as complete.

Machine-readable coverage is provided by `buildHSKCoverage()` in `src/services/contentHealth.ts`.
