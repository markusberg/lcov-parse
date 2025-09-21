## LCOV file parser

Simple LCOV file parser

## Installation

    npm install @markusberg/lcov-parse

## Usage

    import { loadAndParse } from '@markusberg/lcov-parse'
    const json = loadAndParse('./path/to/file.info')

or if your lcov data is already loaded into a variable:

    import { parse } from '@markusberg/lcov-parse
    const json = parse(lcovString)

## Formatting

Using this as a guide: http://ltp.sourceforge.net/coverage/lcov/geninfo.1.php

It will return JSON like this:

```
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

    lcov-parse ./lcov.info

or

    cat lcov.info | xargs -0 lcov-parse

## Tests

    npm install && npm test

or

    npm run test:watch
