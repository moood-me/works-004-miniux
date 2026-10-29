# 2026-10-29 — Belarusian (`be`)

Why: Павел: ещё язык — белорусский.

- World `worlds/miniux` and game `games/miniux` (the playground of the mini-games' language): `"be"` in `languages`, `lang/be.json`, the scenes' `lang/be.json`, `bespoke/lang/be/strings.json` (300 texts). The memos name the games as their Belarusian titles: «Пунсовыя ветразі», «Ашэры», «Хрызаліды».

How it was checked: moood's `check` (its `be` branch: `be` in `i18n/languages.json`), `node packages/check/cli.js <repo> --write`
laid the files out, the translations were written into them, then `check` on the whole repository says «all right».
Modern standard Belarusian, the official orthography; translated from the English source, the Russian read beside it as
a second view of meaning and tone. Only translations and the `languages` lists were added; no source text, code or doc
was changed.
