/* @flow */

import { baseOptions } from './options'
import { createCompiler } from 'compiler/index'
// render, staticRenderFns <-- compileToFunctions
const { compile, compileToFunctions } = createCompiler(baseOptions)

export { compile, compileToFunctions }
