## LCOV file parser

[![node.js build](https://github.com/markusberg/lcov-parse/actions/workflows/master.yaml/badge.svg)](https://github.com/markusberg/lcov-parse/actions/workflows/master.yaml)
[![coverage](https://markusberg.github.io/lcov-parse/badges/coverage-2.0.4.svg)](https://github.com/markusberg/lcov-parse/actions)
![version](https://img.shields.io/npm/v/lcov-parse.svg)

Simple LCOV file parser to generate JSON and JSON-summary formatted reports.

## Installation

```bash
$ npm install @markusberg/lcov-parse
```

## Usage

Basic usage for loading and parsing an `lcov.info` file:

```typescript
import { loadAndParse, type CoverageReport } from "@markusberg/lcov-parse"
const json: CoverageReport = await loadAndParse("./path/to/file.info")
```

### Parsing already loaded data

If your lcov data is already loaded into a variable you can call the parsing function directly:

```typescript
import { parse, type CoverageReport } from "@markusberg/lcov-parse"
const lcovData: string = "TN:TestName\nSF:foobar.js\nend_of_record\n"
const json: CoverageReport = parse(lcovData)
```

The `json` const will now contain this data:

```json
[
  {
    "file": "foobar.js",
    "lines": { "found": 0, "hit": 0, "details": [] },
    "functions": { "hit": 0, "found": 0, "details": [] },
    "branches": { "hit": 0, "found": 0, "details": [] },
    "title": "TestName"
  }
]
```

### JSON-summary

The JSON-summary format is convenient for CI purposes:

```typescript
import {
  loadAndParse,
  generateSummary,
  type CoverageReport,
  type CoverageSummary,
} from "@markusberg/lcov-parse"

const json: CoverageReport = await loadAndParse("./path/to/file.info")
const summary: CoverageSummary = generateSummary(json)
```

The `summary` const will now contain the following data:

```json
{
  "foobar.js": {
    "lines": { "total": 0, "covered": 0, "pct": 100 },
    "functions": { "total": 0, "covered": 0, "pct": 100 },
    "branches": { "total": 0, "covered": 0, "pct": 100 }
  },
  "total": {
    "lines": { "total": 0, "covered": 0, "pct": 100 },
    "functions": { "total": 0, "covered": 0, "pct": 100 },
    "branches": { "total": 0, "covered": 0, "pct": 100 }
  }
}
```

## Formatting

The generated JSON will look like this:

```json
 {
    "title": "Test #1",
    "file": "anim-base/anim-base-coverage.js",
    "functions": {
      "hit": 23,
      "found": 29,
      "details": [
        {
          "name": "(anonymous 1)",
          "line": 7,
          "hit": 6
        },
        {
          "name": "(anonymous 2)",
          "line": 620,
          "hit": 225
        },
        {
          "name": "_end",
          "line": 516,
          "hit": 228
        }
      ]
    }
    "lines": {
      "found": 181,
      "hit": 143,
      "details": [
        {
          "line": 7,
          "hit": 6
        },
        {
          "line": 29,
          "hit": 6
        }
      ]
    }
}
```

## CLI Usage

In addition to the mandatory file name, the script takes two optional arguments:

- `--summary`: generate a json-summary instead of a full json report
- `--pretty`: indents and line breaks the json output

For example:

```bash
$ npx lcov-parse --summary --pretty ./coverage/lcov.info
```

```json
{
  "src/index.ts": {
    "lines": {
      "total": 218,
      "covered": 218,
      "pct": 100
    },
    "functions": {
      "total": 8,
      "covered": 8,
      "pct": 100
    },
    "branches": {
      "total": 40,
      "covered": 40,
      "pct": 100
    }
  },
  "total": {
    "lines": {
      "total": 218,
      "covered": 218,
      "pct": 100
    },
    "functions": {
      "total": 8,
      "covered": 8,
      "pct": 100
    },
    "branches": {
      "total": 40,
      "covered": 40,
      "pct": 100
    }
  }
}
```

or

```bash
$ cat lcov.info | xargs -0 lcov-parse
```

## Tests

```bash
$ npm install && npm test
```

or to run continuously, watching for changes:

```bash
$ npm run test:watch
```
