# A game of moood

This repository is a game of moood (https://moood.me) as files: game.json — its type, title,
description, genres, the world it is played on (that world's repository) and the scenes it takes in
({world, folder}); <type>/ — what only its game type reads. How moood works:
https://github.com/moood-me/docs.

- Each deployment of moood has a branch of its own here: env/dev — moood's own, env/<computer>/<stack> — a
  stack on someone's computer. There is no main. Work in a branch of your own, begun from the
  branch of the deployment you work for (the MCP's game_repo says which).
- Its texts are English; every other language is a translation beside them (bespoke/lang/): moood's check (npm
  @moood/check) lays them out and checks them — a branch goes into a deployment's translated into every language.
- Merge your branch into the deployment's with git and push — never rewrite a deployment's branch — or
  merge_game_branch (an MCP tool), which checks only that it is yours to change.
