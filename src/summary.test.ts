import { strict as assert } from "node:assert"
import { readFileSync } from "node:fs"
import { before, describe, it } from "node:test"

import { parse } from "./index.js"
import { generateSummary } from "./summary.js"

import type { CoverageReport } from "./interfaces.js"

describe("the JSON summary format", () => {
  let lcov: string
  let data: CoverageReport

  before(() => {
    lcov = readFileSync("test-data/parts.info", "utf8").toString()
    data = parse(lcov)
  })

  it("should be a function", () => {
    assert.equal(typeof generateSummary, "function")
  })

  describe("with test data", () => {
    let summary: any

    before(() => {
      summary = generateSummary(data)
    })

    it("should return an object", () => {
      assert.equal(typeof summary, "object")
      assert.ok(!Array.isArray(summary))
    })

    it("should have correct number of file entries", () => {
      const fileNames = Object.keys(summary).filter((key) => key !== "total")
      assert.equal(fileNames.length, 3)
    })

    it("should have correct file names as keys", () => {
      const fileNames = Object.keys(summary)
        .filter((key) => key !== "total")
        .sort()
      assert.deepEqual(fileNames, [
        "anim-base/anim-base-coverage.js",
        "anim-easing/anim-easing-coverage.js",
        "javascript/common.js",
      ])
    })

    it("should have correct structure for each file", () => {
      const fileEntry = summary["anim-base/anim-base-coverage.js"]
      const keys = Object.keys(fileEntry).sort()
      assert.deepEqual(keys, ["branches", "functions", "lines"])

      // Check that each section has the required properties
      const sectionKeys = Object.keys(fileEntry.lines).sort()
      assert.deepEqual(sectionKeys, ["covered", "pct", "total"])
    })

    it("should calculate correct line coverage for first file", () => {
      const fileEntry = summary["anim-base/anim-base-coverage.js"]
      assert.equal(fileEntry.lines.total, 181)
      assert.equal(fileEntry.lines.covered, 143)
      assert.equal(
        Math.round(fileEntry.lines.pct * 100) / 100,
        Math.round((143 / 181) * 100 * 100) / 100,
      )
    })

    it("should calculate correct function coverage for first file", () => {
      const fileEntry = summary["anim-base/anim-base-coverage.js"]
      assert.equal(fileEntry.functions.total, 29)
      assert.equal(fileEntry.functions.covered, 23)
      assert.equal(
        Math.round(fileEntry.functions.pct * 100) / 100,
        Math.round((23 / 29) * 100 * 100) / 100,
      )
    })

    it("should calculate correct branch coverage for second file", () => {
      const fileEntry = summary["anim-easing/anim-easing-coverage.js"]
      assert.equal(fileEntry.branches.total, 23)
      assert.equal(fileEntry.branches.covered, 22)
      assert.equal(
        Math.round(fileEntry.branches.pct * 100) / 100,
        Math.round((22 / 23) * 100 * 100) / 100,
      )
    })

    it("should handle zero totals correctly (100% coverage)", () => {
      const fileEntry = summary["javascript/common.js"]
      // This file has 0 branches found, so should be 100%
      assert.equal(fileEntry.branches.total, 0)
      assert.equal(fileEntry.branches.covered, 0)
      assert.equal(fileEntry.branches.pct, 100)
    })

    it("should calculate correct line coverage for all files", () => {
      // First file
      const file1 = summary["anim-base/anim-base-coverage.js"]
      assert.equal(file1.lines.total, 181)
      assert.equal(file1.lines.covered, 143)

      // Second file
      const file2 = summary["anim-easing/anim-easing-coverage.js"]
      assert.equal(file2.lines.total, 76)
      assert.equal(file2.lines.covered, 70)

      // Third file
      const file3 = summary["javascript/common.js"]
      assert.equal(file3.lines.total, 6)
      assert.equal(file3.lines.covered, 5)
      assert.equal(
        Math.round(file3.lines.pct * 100) / 100,
        Math.round((5 / 6) * 100 * 100) / 100,
      ) // 5/6 = 83.33%
    })

    it("should calculate overall totals correctly", () => {
      assert.ok(summary.total, "Should have total property")

      // Calculate expected totals from test data
      // File 1: lines(181/143), functions(29/23), branches(?/?)
      // File 2: lines(76/70), functions(17/17), branches(23/22)
      // File 3: lines(6/5), functions(2/2), branches(0/0)
      const expectedLines = { total: 181 + 76 + 6, covered: 143 + 70 + 5 }
      const expectedFunctions = { total: 29 + 17 + 2, covered: 23 + 17 + 2 }
      const expectedBranches = { total: 0 + 23 + 0, covered: 0 + 22 + 0 } // First file branches need to be determined

      assert.equal(summary.total.lines.total, expectedLines.total)
      assert.equal(summary.total.lines.covered, expectedLines.covered)
      assert.equal(summary.total.functions.total, expectedFunctions.total)
      assert.equal(summary.total.functions.covered, expectedFunctions.covered)

      // Check percentages are calculated correctly
      const expectedLinePct =
        (expectedLines.covered / expectedLines.total) * 100
      const expectedFunctionPct =
        (expectedFunctions.covered / expectedFunctions.total) * 100

      assert.equal(
        Math.round(summary.total.lines.pct * 100) / 100,
        Math.round(expectedLinePct * 100) / 100,
      )
      assert.equal(
        Math.round(summary.total.functions.pct * 100) / 100,
        Math.round(expectedFunctionPct * 100) / 100,
      )
    })
  })

  describe("with edge cases", () => {
    it("should handle empty report", () => {
      const result = generateSummary([])
      assert.deepEqual(result, {
        total: {
          lines: { total: 0, covered: 0, pct: 100 },
          functions: { total: 0, covered: 0, pct: 100 },
          branches: { total: 0, covered: 0, pct: 100 },
        },
      })
    })

    it("should handle single file with zero coverage", () => {
      const testData = [
        {
          file: "empty.js",
          lines: { found: 10, hit: 0, details: [] },
          functions: { found: 5, hit: 0, details: [] },
          branches: { found: 3, hit: 0, details: [] },
        },
      ]

      const result = generateSummary(testData)

      assert.equal(result["empty.js"].lines.total, 10)
      assert.equal(result["empty.js"].lines.covered, 0)
      assert.equal(result["empty.js"].lines.pct, 0)

      assert.equal(result["empty.js"].functions.total, 5)
      assert.equal(result["empty.js"].functions.covered, 0)
      assert.equal(result["empty.js"].functions.pct, 0)

      assert.equal(result["empty.js"].branches.total, 3)
      assert.equal(result["empty.js"].branches.covered, 0)
      assert.equal(result["empty.js"].branches.pct, 0)
    })

    it("should handle single file with full coverage", () => {
      const testData = [
        {
          file: "perfect.js",
          lines: { found: 10, hit: 10, details: [] },
          functions: { found: 5, hit: 5, details: [] },
          branches: { found: 3, hit: 3, details: [] },
        },
      ]

      const result = generateSummary(testData)

      assert.equal(result["perfect.js"].lines.pct, 100)
      assert.equal(result["perfect.js"].functions.pct, 100)
      assert.equal(result["perfect.js"].branches.pct, 100)
    })

    it("should handle file with no functions or branches", () => {
      const testData = [
        {
          file: "simple.js",
          lines: { found: 5, hit: 3, details: [] },
          functions: { found: 0, hit: 0, details: [] },
          branches: { found: 0, hit: 0, details: [] },
        },
      ]

      const result = generateSummary(testData)

      assert.equal(result["simple.js"].lines.pct, 60) // 3/5 = 60%
      assert.equal(result["simple.js"].functions.pct, 100) // 0/0 = 100% (no functions)
      assert.equal(result["simple.js"].branches.pct, 100) // 0/0 = 100% (no branches)
    })

    it("should handle file with no lines", () => {
      const testData = [
        {
          file: "empty-lines.js",
          lines: { found: 0, hit: 0, details: [] },
          functions: { found: 2, hit: 1, details: [] },
          branches: { found: 1, hit: 0, details: [] },
        },
      ]

      const result = generateSummary(testData)

      assert.equal(result["empty-lines.js"].lines.pct, 100) // 0/0 = 100% (no lines)
      assert.equal(result["empty-lines.js"].functions.pct, 50) // 1/2 = 50%
      assert.equal(result["empty-lines.js"].branches.pct, 0) // 0/1 = 0%
    })

    it("should calculate totals with multiple files", () => {
      const testData = [
        {
          file: "file1.js",
          lines: { found: 10, hit: 8, details: [] },
          functions: { found: 5, hit: 4, details: [] },
          branches: { found: 3, hit: 2, details: [] },
        },
        {
          file: "file2.js",
          lines: { found: 20, hit: 15, details: [] },
          functions: { found: 8, hit: 6, details: [] },
          branches: { found: 2, hit: 1, details: [] },
        },
      ]

      const result = generateSummary(testData)

      // Check individual files
      assert.equal(result["file1.js"].lines.total, 10)
      assert.equal(result["file1.js"].lines.covered, 8)
      assert.equal(result["file2.js"].lines.total, 20)
      assert.equal(result["file2.js"].lines.covered, 15)

      // Check totals
      assert.ok(result.total, "Should have total property")
      assert.equal(result.total.lines.total, 30) // 10 + 20
      assert.equal(result.total.lines.covered, 23) // 8 + 15
      assert.equal(result.total.functions.total, 13) // 5 + 8
      assert.equal(result.total.functions.covered, 10) // 4 + 6
      assert.equal(result.total.branches.total, 5) // 3 + 2
      assert.equal(result.total.branches.covered, 3) // 2 + 1

      // Check total percentages
      assert.equal(
        Math.round(result.total.lines.pct * 100) / 100,
        Math.round((23 / 30) * 100 * 100) / 100,
      ) // 76.67%
      assert.equal(
        Math.round(result.total.functions.pct * 100) / 100,
        Math.round((10 / 13) * 100 * 100) / 100,
      ) // 76.92%
      assert.equal(result.total.branches.pct, 60) // 3/5 = 60%
    })
  })
})
