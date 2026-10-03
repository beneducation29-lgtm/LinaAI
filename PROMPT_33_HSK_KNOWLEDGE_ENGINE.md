# Prompt 33 — Deep HSK Knowledge Engine

Implemented as an upgrade-in-place on the existing LinaAI Chinese architecture.

## Architecture
HSK → Level → Course/Unit/Lesson → Knowledge → Practice → Assessment → Review → Mastery.

## Content integrity
The repository has concrete HSK 1 lesson/vocabulary material, but the curriculum source/version is not verified in the repository. Prompt 33 therefore does not relabel that material as an officially verified HSK curriculum and does not invent HSK 2–6 content.

The canonical registry is src/data/hskCurriculum.ts. Until an authoritative source/version is configured, HSK 1–6 coverage remains CONTENT_GAP.

## Added
- deep vocabulary/grammar/sentence-pattern types
- curriculum version/source/status model
- prerequisite knowledge graph
- mastery bands and adaptive difficulty
- HSK readiness profile explicitly marked non-certification
- flexible daily HSK session generator
- learner scaffolding based on level + mastery
- HSK content validator for required fields, levels, pinyin, duplicates, references, prerequisites, audio and source verification
- HSK 1–6 skill coverage model
- Prompt 33 automated tests

## Not claimed
- HSK 1–6 production content is not complete
- no official HSK certification/readiness claim
- no fake pronunciation score or fake audio
- AI-generated drafts are not automatically treated as published verified curriculum

## Next content gate
Configure HSK_CURRICULUM_SOURCE with a verified curriculum source/version before importing or publishing curriculum-labelled content.
