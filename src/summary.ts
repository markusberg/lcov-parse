/**
 * Functions for generating coverage summaries from detailed LCOV reports.
 * @module summary
 */

import type {
  CoverageReport,
  CoverageSummary,
  FileSummary,
} from "./interfaces.js"

/**
 * Generate a coverage summary from a detailed coverage report
 *
 * The summary includes coverage metrics for each file and a total across all files.
 * For each category (lines, functions, branches), it calculates:
 * - total: number of items that could be covered
 * - covered: number of items that were actually covered
 * - pct: percentage of covered items (100% if total is 0)
 *
 * @param report - Detailed coverage report containing data for each file
 * @returns Coverage summary with per-file metrics and totals
 *
 * @example
 * ```typescript
 * const report = loadAndParse("lcov.info");
 * const summary = generateSummary(report);
 * console.log(summary.total.lines.pct); // Overall line coverage percentage
 * ```
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
