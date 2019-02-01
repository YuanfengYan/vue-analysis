/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0

export function initMixin(Vue: Class < Component > ) {

    Vue.prototype._init = function(options ? : Object) {
        const vm: Component = this
            // a uid
        vm._uid = uid++
        console.log(vm._uid)
            let startTag, endTag
                /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
            startTag = `vue-perf-start:${vm._uid}`
            endTag = `vue-perf-end:${vm._uid}`
            mark(startTag)
        }

        // a flag to avoid this being observed
        vm._isVue = true
        // debugger
            // merge options第一步： options参数的处理
        if (options && options._isComponent) {
            // optimize internal component instantiation
            // since dynamic options merging is pretty slow, and none of the
            // internal component options needs special treatment.
            initInternalComponent(vm, options)
        } else {
            // 父组件构造器上的options
            // 父组件实例上的options
            // 当前组件构造器上的options
            // 当前组件实例化传入的options
            debugger
            vm.$options = mergeOptions(
                resolveConstructorOptions(vm.constructor), //构造函数的options 详见global-api->index.js 配置了基础的3个options :filters,componemts,directives
                options || {},
                vm
            )
        }
        /* istanbul ignore else 第二步：renderProxy */
        //如果是在开发环境，代理data下的变量，避免一些错误的命名
        if (process.env.NODE_ENV !== 'production') {
            initProxy(vm)
        } else {
            vm._renderProxy = vm
        }
        // expose real self
        // debugger
        vm._self = vm
        initLifecycle(vm) //第三步：vm的生命周期相关变量初始化 --相关的属性
        initEvents(vm) //第四步：vm的事件监听初始化
        initRender(vm) //第五步： render
        callHook(vm, 'beforeCreate')
        initInjections(vm) // resolve injections before data/props
        initState(vm) //第六步：vm的状态初始化，prop/data/computed/method/watch都在这里完成初始化
        initProvide(vm) // resolve provide after data/props
        callHook(vm, 'created')
        // debugger
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
            vm._name = formatComponentName(vm, false)
            mark(endTag)
            measure(`vue ${vm._name} init`, startTag, endTag)
        }

        if (vm.$options.el) {
            vm.$mount(vm.$options.el)
        }
    }
}

export function initInternalComponent(vm: Component, options: InternalComponentOptions) {
    const opts = vm.$options = Object.create(vm.constructor.options)
        // doing this because it's faster than dynamic enumeration.做这些是因为它比动态计数要快
    const parentVnode = options._parentVnode
    opts.parent = options.parent
    opts._parentVnode = parentVnode

    const vnodeComponentOptions = parentVnode.componentOptions
    opts.propsData = vnodeComponentOptions.propsData
    opts._parentListeners = vnodeComponentOptions.listeners
    opts._renderChildren = vnodeComponentOptions.children
    opts._componentTag = vnodeComponentOptions.tag

    if (options.render) {
        opts.render = options.render
        opts.staticRenderFns = options.staticRenderFns
    }
}

export function resolveConstructorOptions(Ctor: Class < Component > ) {
    let options = Ctor.options
    // console.log(options)
    if (Ctor.super) {
        // debugger
        const superOptions = resolveConstructorOptions(Ctor.super) // 获取父级的options
        const cachedSuperOptions = Ctor.superOptions // 获取父级缓存的options
        if (superOptions !== cachedSuperOptions) {// 如果父级options有变化
            // super option changed,
            // need to resolve new options.
            Ctor.superOptions = superOptions
                // check if there are any late-modified/attached options (#4976)
            const modifiedOptions = resolveModifiedOptions(Ctor)
                // update base extend options
            if (modifiedOptions) {
                extend(Ctor.extendOptions, modifiedOptions)
            }
            options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
            if (options.name) {
                options.components[options.name] = Ctor
            }
        }
    }
    return options
}

function resolveModifiedOptions(Ctor: Class < Component > ): ? Object {
    let modified
    const latest = Ctor.options
    const extended = Ctor.extendOptions
    const sealed = Ctor.sealedOptions
    for (const key in latest) {
        if (latest[key] !== sealed[key]) {
            if (!modified) modified = {}
            modified[key] = dedupe(latest[key], extended[key], sealed[key])
        }
    }
    return modified
}

function dedupe(latest, extended, sealed) {
    // compare latest and sealed to ensure lifecycle hooks won't be duplicated
    // between merges
    if (Array.isArray(latest)) {
        const res = []
        sealed = Array.isArray(sealed) ? sealed : [sealed]
        extended = Array.isArray(extended) ? extended : [extended]
        for (let i = 0; i < latest.length; i++) {
            // push original options and not sealed options to exclude duplicated options
            if (extended.indexOf(latest[i]) >= 0 || sealed.indexOf(latest[i]) < 0) {
                res.push(latest[i])
            }
        }
        return res
    } else {
        return latest
    }
}