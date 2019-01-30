/* not type checking this file because flow doesn't play well with Proxy */

import config from 'core/config'
import { warn, makeMap, isNative } from '../util/index'
// makeMap(map)(key) 返回一个function检查 是否key值在map中

let initProxy

if (process.env.NODE_ENV !== 'production') {
  const allowedGlobals = makeMap(
    'Infinity,undefined,NaN,isFinite,isNaN,' +
    'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
    'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
    'require' // for Webpack/Browserify
  )

  const warnNonPresent = (target, key) => {
    warn(
      `Property or method "${key}" is not defined on the instance but ` +
      'referenced during render. Make sure that this property is reactive, ' +
      'either in the data option, or for class-based components, by ' +
      'initializing the property. ' +
      'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
      target
    )
  }

  const warnReservedPrefix = (target, key) => {
    warn(
      `Property "${key}" must be accessed with "$data.${key}" because ` +
      'properties starting with "$" or "_" are not proxied in the Vue instance to ' +
      'prevent conflicts with Vue internals' +
      'See: https://vuejs.org/v2/api/#data',
      target
    )
  }

  const hasProxy =
    typeof Proxy !== 'undefined' && isNative(Proxy)

  if (hasProxy) {
    const isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta,exact')
    config.keyCodes = new Proxy(config.keyCodes, {
      set (target, key, value) {
        if (isBuiltInModifier(key)) {
          warn(`Avoid overwriting built-in modifier in config.keyCodes: .${key}`)
          return false
        } else {
          target[key] = value
          return true
        }
      }
    })
  }
// 支持Proxy 执行代理回调的函数
  const hasHandler = {
    // has()方法用来拦截HasProperty操作，即判断对象具有某个属性时对象会生效。典型的操作就是in运算符。
    has (target, key) {
      // if(key=='__name')
      // debugger
      const has = key in target //是否有key对应的属性
      const isAllowed = allowedGlobals(key) || //allowedGlobals=>关键字，或者以"_"开头、熟悉不在$data中的属性名不进行
        (typeof key === 'string' && key.charAt(0) === '_' && !(key in target.$data))
      if (!has && !isAllowed) {
        if (key in target.$data) warnReservedPrefix(target, key)//不能以_或者$个data下的属性命名
        else warnNonPresent(target, key)//未定义
      }
      return has || !isAllowed
    }
  }

  const getHandler = {
    get (target, key) {
      if (typeof key === 'string' && !(key in target)) {
        if (key in target.$data) warnReservedPrefix(target, key)
        else warnNonPresent(target, key)
      }
      return target[key]
    }
  }

  initProxy = function initProxy (vm) {
    if (hasProxy) { //浏览器支持Proxy
      // determine which proxy handler to use
      const options = vm.$options
      // debugger
      // 默认都会走hasHander 因为_withStripped一般是undefined，
      // 
      const handlers = options.render && options.render._withStripped
        ? getHandler
        : hasHandler
      vm._renderProxy = new Proxy(vm, handlers)
    } else {
      vm._renderProxy = vm //不进行代理
    }
  }
}

export { initProxy }
