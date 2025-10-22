/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

import { existsSync, readFileSync } from "node:fs"
import type {
  CoverageReport,
  FileReport,
  FunctionDetail,
} from "./interfaces.js"
export * from "./interfaces.js"
export * from "./summary.js"

/**
 * Generate JSON report from lcov data
 * @param input
 * @returns
 */
export function parse(input: string): CoverageReport {
  let fullReport: FileReport[] = []
  let currentFile: FileReport = getBlankFileReport()
  const sanitized = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => !!line)

  for (const line of sanitized) {
    const allparts = line.split(":")
    const prefix = allparts.shift()?.toUpperCase().trim()
    const payload = allparts.join(":").trim()

    switch (prefix) {
      case "TN":
        currentFile.title = payload
        break
      case "SF":
        currentFile.file = payload
        break
      case "FNF":
        currentFile.functions.found = Number(payload)
        break
      case "FNH":
        currentFile.functions.hit = Number(payload)
        break
      case "LF":
        currentFile.lines.found = Number(payload)
        break
      case "LH":
        currentFile.lines.hit = Number(payload)
        break
      case "DA":
        const lines = payload.split(",")
        currentFile.lines.details.push({
          line: Number(lines[0]),
          hit: Number(lines[1]),
        })
        break
      case "FN":
        const fn = payload.split(",")
        currentFile.functions.details.push({
          name: fn[1],
          line: Number(fn[0]),
        })
        break
      case "FNDA":
        const fnda = payload.split(",")
        currentFile.functions.details.some(function (
          i: FunctionDetail,
          k: number,
        ) {
          if (i.name === fnda[1] && i.hit === undefined) {
            currentFile.functions.details[k].hit = Number(fnda[0])
            return true
          }
        })
        break
      case "BRDA":
        const brda = payload.split(",")
        currentFile.branches.details.push({
          line: Number(brda[0]),
          block: Number(brda[1]),
          branch: Number(brda[2]),
          taken: brda[3] === "-" ? 0 : Number(brda[3]),
        })
        break
      case "BRF":
        currentFile.branches.found = Number(payload)
        break
      case "BRH":
        currentFile.branches.hit = Number(payload)
        break
    }

    if (line.startsWith("end_of_record")) {
      fullReport.push(currentFile)
      currentFile = getBlankFileReport()
    }
  }

  return fullReport
}

function getBlankFileReport(): FileReport {
  return {
    file: "",
    lines: {
      found: 0,
      hit: 0,
      details: [],
    },
    functions: {
      hit: 0,
      found: 0,
      details: [],
    },
    branches: {
      hit: 0,
      found: 0,
      details: [],
    },
  }
}

/**
 * Load an lcov file from disk and parse it to JSON
 * @param file file path
 * @returns
 */
export function loadAndParse(file: string): CoverageReport {
  if (!existsSync(file)) {
    throw new Error(`file doesn't exist: ${file}`)
  }
  const fileContent = readFileSync(file).toString()
  return parse(fileContent)
}
