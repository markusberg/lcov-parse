import { strict as assert } from "node:assert"
import { readFileSync } from "node:fs"
import { before, describe, it } from "node:test"

import { loadAndParse, parse } from "./index.js"

describe("lcov-parse", () => {
  const testDataFile = "test-data/parts.info"

  it("should be a function", () => {
    assert.equal(typeof parse, "function")
    assert.equal(typeof loadAndParse, "function")
  })

  describe("the loadAndParse function", () => {
    it("should fail to parse a non-existent file", () => {
      assert.throws(() => loadAndParse("non-existent-file"))
    })

    it("should successfully parse a valid file that exists", () => {
      assert.doesNotThrow(() => loadAndParse(testDataFile))
    })
  })

  describe("parsing test data", () => {
    let lcov: string
    before(() => {
      lcov = readFileSync(testDataFile, "utf8").toString()
    })

    it("should parse a string", () => {
      const data = "TN:TestName\nSF:foobar.js\nend_of_record\n"
      const result = parse(data)
      assert.ok(Array.isArray(result))
      assert.equal("TestName", result[0].title)
      assert.equal("foobar.js", result[0].file)
    })

    it("should successfully parse the test data", () => {
      assert.doesNotThrow(() => parse(lcov))
    })

    describe("the contents of the parsed test data", () => {
      let data: any

      before(() => {
        data = parse(lcov)
      })

      it("should return an array", () => {
        assert.ok(Array.isArray(data))
      })

      it("should contain 3 keys", () => {
        assert.equal(data.length, 3)
      })

      it("should have five properties in its first key", () => {
        const keys = Object.keys(data[0]).sort()
        assert.deepEqual(keys, [
          "branches",
          "file",
          "functions",
          "lines",
          "title",
        ])
      })

      it("should have correct titles", () => {
        assert.equal(data[0].title, "Test #1")
        assert.equal(data[1].title, "Test #2")
        assert.equal(data[2].title, "Test #3")
      })

      it("should have correct file names", () => {
        assert.equal(data[0].file, "anim-base/anim-base-coverage.js")
        assert.equal(data[1].file, "anim-easing/anim-easing-coverage.js")
        assert.equal(data[2].file, "javascript/common.js")
      })

      it("should have the correct number of functions", () => {
        assert.equal(data[0].functions.found, 29)
        assert.equal(data[0].functions.hit, 23)
        assert.equal(data[1].functions.found, 17)
        assert.equal(data[1].functions.hit, 17)
        assert.equal(data[2].functions.found, 2)
        assert.equal(data[2].functions.hit, 2)
      })

      it("should have the correct number of branches", () => {
        assert.equal(data[1].branches.found, 23)
        assert.equal(data[1].branches.hit, 22)
        assert.equal(data[1].branches.found, data[1].branches.details.length)
        assert.equal(
          data[1].branches.details[data[1].branches.details.length - 1].taken,
          0,
        )
        assert.equal(data[2].branches.found, 0)
        assert.equal(data[2].branches.hit, 0)
        assert.deepEqual(data[2].branches.details, [])
      })

      it("should have the correct function details", () => {
        assert.equal(data[0].functions.details.length, 29)
        assert.equal(data[1].functions.details.length, 17)
        assert.equal(data[2].functions.details.length, 2)
        assert.deepEqual(data[0].functions.details[0], {
          name: "(anonymous 1)",
          line: 7,
          hit: 6,
        })
        assert.deepEqual(data[0].functions.details[11], {
          name: "_start",
          line: 475,
          hit: 231,
        })

        assert.deepEqual(data[0].functions.details[27], {
          name: "stop",
          line: 466,
          hit: 9,
        })
        assert.deepEqual(data[0].functions.details[28], {
          name: "stop",
          line: 389,
          hit: 0,
        })

        assert.deepEqual(data[1].functions.details[4], {
          name: "bounceBoth",
          line: 345,
          hit: 36,
        })

        assert.deepEqual(data[2].functions.details[1], {
          name: "javascript",
          line: 3,
          hit: 2,
        })
      })

      it("should have the correct number of lines", () => {
        assert.equal(data[0].lines.found, 181)
        assert.equal(data[0].lines.hit, 143)
        assert.equal(data[1].lines.found, 76)
        assert.equal(data[1].lines.hit, 70)
      })

      it("should have the correct line details", () => {
        assert.equal(data[0].lines.details.length, 181)
        assert.equal(data[1].lines.details.length, 76)
        assert.equal(data[2].lines.details.length, 6)
        assert.deepEqual(data[0].lines.details[0], { line: 7, hit: 6 })
        assert.deepEqual(data[0].lines.details[10], { line: 91, hit: 6 })

        assert.deepEqual(data[1].lines.details[20], { line: 157, hit: 32 })
        assert.deepEqual(data[1].lines.details[64], { line: 313, hit: 51 })

        assert.deepEqual(data[2].lines.details[2], { line: 3, hit: 19 })
      })
    })
  })
})
