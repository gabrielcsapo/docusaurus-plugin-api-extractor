# Contributing

This repository uses the [rush stack](https://rushjs.io/) and [pnpm](https://pnpm.io/) to manage multiple packages.

## Getting Started

Install pnpm and rush:

```bash
volta install pnpm
```

```bash
volta install rush
```

From the root of the repo run the following to bootstrap all the dependencies:

```bash
rush update
```

## Running Tests

The interesting parts of this repo are in the `plugin/` directory and thus you can `cd` into those repos and run `pnpm run build`.

Each of the pages in the `plugin/` directory use the [heft-jest](https://rushstack.io/pages/heft_tasks/jest/) build plugin which is going to run `eslint`, `tsc` and `jest` for you. It also ensures you are in a clean state.

To run all the tests across all the projects you can run

```bash
rush build
```

## Publishing & Changelog

Please see the documentation on [`rush change`](https://rushjs.io/pages/maintainer/publishing/) and [`rush publish`](https://rushjs.io/pages/maintainer/publishing/).
