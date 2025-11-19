#!/usr/bin/env node

import { loadAndParse, generateSummary } from "../dist/index.js"

const args = process.argv.slice(2)
const file = args.find((arg) => !arg.startsWith("--"))
const showSummary = args.includes("--summary")
const pretty = args.includes("--pretty")

if (!file) {
  console.error("Usage: cli.js [--summary] [--pretty] <file>")
  process.exit(1)
}

try {
  const report = await loadAndParse(file)
  const output = showSummary ? generateSummary(report) : report
  if (pretty) {
    console.log(JSON.stringify(output, null, 2))
  } else {
    console.log(JSON.stringify(output))
  }
} catch (err) {
  console.error(`Error: ${err.message}`)
  process.exit(1)
}
