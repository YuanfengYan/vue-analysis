/* @flow */

import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

const idToTemplate = cached(id => {
    const el = query(id)
    return el && el.innerHTML
})

/**
1、缓存来自 web-runtime.js 文件的 $mount 方法

2、判断有没有传递 render 选项，如果有直接调用来自 web-runtime.js 文件的 $mount 方法

3、如果没有传递 render 选项，那么查看有没有 template 选项，如果有就使用 compileToFunctions 函数根据其内容编译成 render 函数

4、如果没有 template 选项，那么查看有没有 el 选项，如果有就使用 compileToFunctions 函数将其内容(template = getOuterHTML(el))编译成 render 函数

5、将编译成的 render 函数挂载到 this.$options 属性下，并调用缓存下来的 web-runtime.js 文件中的 $mount 方法
*/

// 此处mount即为运行时版的 $mount
// 缓存了来自 web-runtime.js 的 $mount 方法
const mount = Vue.prototype.$mount
// 重写 $mount 方法
Vue.prototype.$mount = function(
    el ? : string | Element,
    hydrating ? : boolean
): Component {
     // 根据 el 获取相应的DOM元素
    el = el && query(el)

    /* istanbul ignore if */
    // 不允许你将 el 挂载到 html 标签或者 body 标签
    if (el === document.body || el === document.documentElement) {
        process.env.NODE_ENV !== 'production' && warn(
            `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
        )
        return this
    }
    // debugger
    const options = this.$options
    // 如果我们没有写 render 选项，那么就尝试将 template 或者 el 转化为 render 函数
    // resolve template/el and convert to render function
    if (!options.render) {
        let template = options.template
        if (template) {
            if (typeof template === 'string') {
                if (template.charAt(0) === '#') {
                    template = idToTemplate(template)
                        /* istanbul ignore if */
                    if (process.env.NODE_ENV !== 'production' && !template) {
                        warn(
                            `Template element not found or is empty: ${options.template}`,
                            this
                        )
                    }
                }
            } else if (template.nodeType) {
                template = template.innerHTML
            } else {
                if (process.env.NODE_ENV !== 'production') {
                    warn('invalid template option:' + template, this)
                }
                return this
            }
        } else if (el) {
            template = getOuterHTML(el)
        }
        if (template) {
            /* istanbul ignore if */
            if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
                mark('compile')
            }
            
           // 如果不存在 render 函数，则会将模板转换成render函数 ---- 关键
            const { render, staticRenderFns } = compileToFunctions(template, {
                shouldDecodeNewlines,
                shouldDecodeNewlinesForHref,
                delimiters: options.delimiters,
                comments: options.comments
            }, this)
            options.render = render
            options.staticRenderFns = staticRenderFns

            /* istanbul ignore if */
            if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
                mark('compile end')
                measure(`vue ${this._name} compile`, 'compile', 'compile end')
            }
        }
    }
    // debugger
     // 调用已经缓存下来的 web-runtime.js 文件中的 $mount 方法
    return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML(el: Element): string {
    if (el.outerHTML) {
        return el.outerHTML
    } else {
        const container = document.createElement('div')
        container.appendChild(el.cloneNode(true))
        return container.innerHTML
    }
}

Vue.compile = compileToFunctions

export default Vue