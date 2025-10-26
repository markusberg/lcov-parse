/**
 * LCOV parser class implementation.
 * Provides line-by-line parsing of LCOV format coverage data, maintaining state
 * and accumulating results into a complete coverage report.
 *
 * @module LcovParser
 * @see {@link https://github.com/linux-test-project/lcov/|LCOV Format Documentation}
 */

import type { FileReport, FunctionDetail } from "./interfaces.js"

/**
 * Parser for LCOV format coverage data
 * @class
 */
export class LcovParser {
  /** Array of completed file reports */
  #fullReport: FileReport[] = []
  /** Current file report being built */
  #currentFile: FileReport = this.getBlankFileReport()

  /**
   * Get the complete array of parsed file reports
   * @returns Array of file coverage reports
   */
  getFullReport(): FileReport[] {
    return this.#fullReport
  }

  /**
   * Create a new blank file report structure
   * @returns Empty file report with initialized coverage metrics
   */
  getBlankFileReport(): FileReport {
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
   * Parse a single line of LCOV data and update internal state
   * @param line - Raw line from LCOV file
   *
   * Supported LCOV commands:
   * - TN: Test name
   * - SF: Source file
   * - FN: Function name
   * - FNDA: Function data
   * - FNF: Functions found
   * - FNH: Functions hit
   * - BRDA: Branch data
   * - BRF: Branches found
   * - BRH: Branches hit
   * - DA: Line data
   * - LF: Lines found
   * - LH: Lines hit
   */
  parseLine(line: string): void {
    const trimmedLine = line.trim()

    if (!trimmedLine) {
      return
    }

    if (trimmedLine.startsWith("end_of_record")) {
      this.#fullReport.push(this.#currentFile)
      this.#currentFile = this.getBlankFileReport()
    }

    const allparts = line.split(":")
    const prefix = allparts.shift()?.toUpperCase().trim()
    const payload = allparts.join(":").trim()

    switch (prefix) {
      case "TN":
        this.#currentFile.title = payload
        break
      case "SF":
        this.#currentFile.file = payload
        break
      case "FNF":
        this.#currentFile.functions.found = Number(payload)
        break
      case "FNH":
        this.#currentFile.functions.hit = Number(payload)
        break
      case "LF":
        this.#currentFile.lines.found = Number(payload)
        break
      case "LH":
        this.#currentFile.lines.hit = Number(payload)
        break
      case "DA":
        const lines = payload.split(",")
        this.#currentFile.lines.details.push({
          line: Number(lines[0]),
          hit: Number(lines[1]),
        })
        break
      case "FN":
        const fn = payload.split(",")
        this.#currentFile.functions.details.push({
          name: fn[1],
          line: Number(fn[0]),
        })
        break
      case "FNDA":
        const fnda = payload.split(",")
        this.#currentFile.functions.details.some(
          (i: FunctionDetail, k: number) => {
            if (i.name === fnda[1] && i.hit === undefined) {
              this.#currentFile.functions.details[k].hit = Number(fnda[0])
              return true
            }
          },
        )
        break
      case "BRDA":
        const brda = payload.split(",")
        this.#currentFile.branches.details.push({
          line: Number(brda[0]),
          block: Number(brda[1]),
          branch: Number(brda[2]),
          taken: brda[3] === "-" ? 0 : Number(brda[3]),
        })
        break
      case "BRF":
        this.#currentFile.branches.found = Number(payload)
        break
      case "BRH":
        this.#currentFile.branches.hit = Number(payload)
        break
    }
  }
}
