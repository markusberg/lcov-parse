## LCOV file parser

Simple LCOV file parser to generate JSON and JSON-summary formatted reports.

## Installation

```bash
$ npm install @markusberg/lcov-parse
```

## Usage

Basic usage for loading and parsing an `lcov.info` file:

```typescript
import { loadAndParse, type CoverageReport } from "@markusberg/lcov-parse"
const json: CoverageReport = loadAndParse("./path/to/file.info")
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
} from '@markusberg/lcov-parse

const json: CoverageReport = loadAndParse('./path/to/file.info')
const summary: CoverageSummary = generateSummary(json)
```

The `summary` const will now contain the following data:

```json
{
  "total": {
    "lines": { "total": 0, "covered": 0, "pct": 100 },
    "functions": { "total": 0, "covered": 0, "pct": 100 },
    "branches": { "total": 0, "covered": 0, "pct": 100 }
  },
  "foobar.js": {
    "lines": { "total": 0, "covered": 0, "pct": 100 },
    "functions": { "total": 0, "covered": 0, "pct": 100 },
    "branches": { "total": 0, "covered": 0, "pct": 100 }
  }
}
```

## Formatting

It will return JSON like this:

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

## Cli Usage

```bash
$ lcov-parse ./lcov.info
```

or

```bash
$ cat lcov.info | xargs -0 lcov-parse
```

## Tests

```bash
$ npm install && npm test
```

or

```bash
$ npm run test:watch
```
