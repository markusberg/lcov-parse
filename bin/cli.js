#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { parse } from '../dist/index.js'

const file = process.argv[2];
const data = readFileSync(file).toString()
const json = parse(data)
console.log(JSON.stringify(json));
