/**
 * Main module for parsing LCOV coverage files.
 * Provides functions to parse LCOV data from strings or files into JSON format.
 * @module lcov-parse
 */

import { createReadStream, existsSync } from "node:fs"
import { createInterface } from "node:readline"

import { LcovParser } from "./LcovParser.class.js"
import type { CoverageReport } from "./interfaces.js"

export * from "./interfaces.js"
export * from "./summary.js"

/**
 * Generate JSON report from lcov data
 * @param input
 * @returns
 */
export function parse(input: string): CoverageReport {
  const parser = new LcovParser()

  for (const line of input.split(/\r?\n/)) {
    parser.parseLine(line)
  }

  return parser.getFullReport()
}

/**
 * Load an lcov file from disk and parse it to JSON
 * @param file file path
 * @returns
 */
export async function loadAndParse(file: string): Promise<CoverageReport> {
  if (!existsSync(file)) {
    throw new Error(`file doesn't exist: ${file}`)
  }

  const parser = new LcovParser()
  const fileStream = createReadStream(file)
  const rl = createInterface({ input: fileStream, crlfDelay: Infinity })

  for await (const line of rl) {
    parser.parseLine(line)
  }
  return parser.getFullReport()
}
