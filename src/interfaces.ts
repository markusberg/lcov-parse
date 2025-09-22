// TypeScript types for LCOV parse output
export interface LineDetail {
  line: number
  hit: number
}

export interface FunctionDetail {
  name: string
  line: number
  hit?: number
}

export interface BranchDetail {
  line: number
  block: number
  branch: number
  taken: number
}

export interface CoverageMetrics {
  found: number
  hit: number
  details: LineDetail[] | FunctionDetail[] | BranchDetail[]
}

export interface LineCoverage {
  found: number
  hit: number
  details: LineDetail[]
}

export interface FunctionCoverage {
  found: number
  hit: number
  details: FunctionDetail[]
}

export interface BranchCoverage {
  found: number
  hit: number
  details: BranchDetail[]
}

export interface FileReport {
  title?: string
  file: string
  lines: LineCoverage
  functions: FunctionCoverage
  branches: BranchCoverage
}

export type CoverageReport = FileReport[]

// Type for the JSON summary format
export interface SummaryMetrics {
  total: number
  covered: number
  pct: number
}

export interface FileSummary {
  lines: SummaryMetrics
  functions: SummaryMetrics
  branches: SummaryMetrics
}

export type CoverageSummary = Record<string, FileSummary>
