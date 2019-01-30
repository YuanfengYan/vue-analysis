/* @flow */

import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'

export function initGlobalAPI (Vue: GlobalAPI) {
  // config
  const configDef = {}
  configDef.get = () => config
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  // 这些工具方法不视作全局API的一部分，除非你已经意识到某些风险，否则不要去依赖他们
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }
  // 这里定义全局属性
  // Vue.extend----------------使用基础 Vue 构造器，创建一个“子类”。参数是一个包含组件选项的对象。
  // Vue.nextTick-------------在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM
  // Vue.set----------------向响应式对象中添加一个属性，并确保这个新属性同样是响应式的，且触发视图更新。它必须用于向响应式对象上添加新属性，因为 Vue 无法探测普通的新增属性 
  // Vue.delete---------------- 删除对象的属性。如果对象是响应式的，确保删除能触发更新视图。这个方法主要用于避开 Vue 不能检测到属性被删除的限制，但是你应该很少会使用它。
  // Vue.directive----------注册或获取全局指令。
  // Vue.filter---------------- 注册或获取全局过滤器。
  // Vue.component-----------注册或获取全局组件。注册还会自动使用给定的id设置组件的名称
  // Vue.use----------------    安装 Vue.js 插件。如果插件是一个对象，必须提供 install 方法。如果插件是一个函数，它会被作为 install 方法。install 方法调用时，会将 Vue 作为参数传入。
  // Vue.mixin----------------  全局注册一个混入，影响注册之后所有创建的每个 Vue 实例。插件作者可以使用混入，向组件注入自定义的行为。不推荐在应用代码中使用。
  // Vue.compile----------------在 render 函数中编译模板字符串。只在独立构建时有效
  // Vue.version----------------细节：提供字符串形式的 Vue 安装版本号。这对社区的插件和组件来说非常有用，你可以根据不同的版本号采取不同的策略。
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  Vue.options = Object.create(null)
  console.log(ASSET_TYPES)
  // 'component',
  // 'directive',
  // 'filter'
  console.log(Vue.options)
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })
  // console.log(JSON.stringify(Vue.options.components))

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue

// 将属性混合到目标对象中。//builtInComponents=>KeepAlive  内置全局组件

  extend(Vue.options.components, builtInComponents)

  // Vue.use 的注册，用于扩展vue插件 
  initUse(Vue)
  // Vue.mixin的注册 ，用于混入mixin
  initMixin(Vue)
  // Vue.extend的注册 
  initExtend(Vue)
  // 注册
  // 'component',
  // 'directive',
  // 'filter'
  initAssetRegisters(Vue)
}
