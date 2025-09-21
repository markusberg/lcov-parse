/*
Copyright (c) 2012, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

import { existsSync, readFileSync } from "node:fs"

const EOR = "end_of_record"

export function parse(str: string): any {
  let data: any[] = []
  let item: any
  const lines: string[] = [EOR].concat(str.split("\n"))

  for (const line of lines) {
    const allparts = line.split(":")
    const prefix = allparts.shift()?.toUpperCase()
    const payload = allparts.join(":").trim()
    let lines: any
    let fn: any

    switch (prefix) {
      case "TN":
        item.title = payload
        break
      case "SF":
        item.file = payload
        break
      case "FNF":
        item.functions.found = Number(payload)
        break
      case "FNH":
        item.functions.hit = Number(payload)
        break
      case "LF":
        item.lines.found = Number(payload)
        break
      case "LH":
        item.lines.hit = Number(payload)
        break
      case "DA":
        lines = payload.split(",")
        item.lines.details.push({
          line: Number(lines[0]),
          hit: Number(lines[1]),
        })
        break
      case "FN":
        fn = payload.split(",")
        item.functions.details.push({
          name: fn[1],
          line: Number(fn[0]),
        })
        break
      case "FNDA":
        fn = payload.split(",")
        item.functions.details.some(function (i: any, k: any) {
          if (i.name === fn[1] && i.hit === undefined) {
            item.functions.details[k].hit = Number(fn[0])
            return true
          }
        })
        break
      case "BRDA":
        fn = payload.split(",")
        item.branches.details.push({
          line: Number(fn[0]),
          block: Number(fn[1]),
          branch: Number(fn[2]),
          taken: fn[3] === "-" ? 0 : Number(fn[3]),
        })
        break
      case "BRF":
        item.branches.found = Number(payload)
        break
      case "BRH":
        item.branches.hit = Number(payload)
        break
    }

    if (line.includes(EOR)) {
      data.push(item)
      item = {
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

  data.shift()

  return data
}

export function loadAndParse(file: string) {
  if (!existsSync(file)) {
    throw new Error(`file doesn't exist: ${file}`)
  }
  file = readFileSync(file).toString()
  return parse(file)
}
