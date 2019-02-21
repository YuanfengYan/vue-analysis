/* @flow */

import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen/index'
import { createCompilerCreator } from './create-compiler'

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
// render, staticRenderFns
// parse 将HTML解析为 AST 元素。
// optimize 渲染优化。
// generate 解析成基本的 render 函数。
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  //trim去除字符串两边的空白 
  const ast = parse(template.trim(), options) //返回AST元素对象
  console.log(ast.static)
  if (options.optimize !== false) {
    // 该方法只是做了些标记静态节点的行为，目的是为了在重新渲染时不重复渲染静态节点，以达到性能优化的目的。添加static属性
    optimize(ast, options)
  }
  console.log(ast)
  const code = generate(ast, options)//generate 方法用于将 AST 元素生成 render 渲染字符串。
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
