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
  CoverageSummary,
  FileSummary,
} from "./interfaces.js"
export * from "./interfaces.js"

/**
 * Generate JSON report from lcov data
 * @param input
 * @returns
 */
export function parse(input: string): CoverageReport {
  let fullReport: FileReport[] = []
  let currentFile: FileReport = {
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
  const sanitized = input
    .split("\n")
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
      currentFile = {
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
  }

  return fullReport
}

/**
 * Generate a JSON summary from a JSON report
 * @param report
 * @returns
 */
export function generateSummary(report: CoverageReport): CoverageSummary {
  const summary = report.reduce((acc, fileReport) => {
    const fs: FileSummary = {
      lines: {
        total: fileReport.lines.found,
        covered: fileReport.lines.hit,
        pct: fileReport.lines.found
          ? (fileReport.lines.hit / fileReport.lines.found) * 100
          : 100,
      },
      functions: {
        total: fileReport.functions.found,
        covered: fileReport.functions.hit,
        pct: fileReport.functions.found
          ? (fileReport.functions.hit / fileReport.functions.found) * 100
          : 100,
      },
      branches: {
        total: fileReport.branches.found,
        covered: fileReport.branches.hit,
        pct: fileReport.branches.found
          ? (fileReport.branches.hit / fileReport.branches.found) * 100
          : 100,
      },
    }
    return { ...acc, [fileReport.file]: fs }
  }, {} as CoverageSummary)

  // Calculate overall totals across all files
  const total: FileSummary = report.reduce(
    (acc, file) => {
      acc.lines.total += file.lines.found
      acc.lines.covered += file.lines.hit
      acc.functions.total += file.functions.found
      acc.functions.covered += file.functions.hit
      acc.branches.total += file.branches.found
      acc.branches.covered += file.branches.hit
      return acc
    },
    {
      lines: { total: 0, covered: 0, pct: 0 },
      functions: { total: 0, covered: 0, pct: 0 },
      branches: { total: 0, covered: 0, pct: 0 },
    },
  )

  // Calculate percentages for totals
  total.lines.pct = total.lines.total
    ? (total.lines.covered / total.lines.total) * 100
    : 100

  total.functions.pct = total.functions.total
    ? (total.functions.covered / total.functions.total) * 100
    : 100

  total.branches.pct = total.branches.total
    ? (total.branches.covered / total.branches.total) * 100
    : 100

  return { ...summary, total }
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
