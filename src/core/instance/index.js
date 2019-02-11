import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue(options) {
    if (process.env.NODE_ENV !== 'production' &&
        !(this instanceof Vue)
    ) {
        warn('Vue is a constructor and should be called with the `new` keyword')
    }
    this._init(options)
}

initMixin(Vue)
stateMixin(Vue) //注册实例属性方法 $set $delete $watch $data $props等
eventsMixin(Vue)//实例事件的注册$once $on $off $emit
lifecycleMixin(Vue)//Vue 实例在这里第一次为实例设置了 $el 属性，在之后调用 mounted 钩子所绑定的函数。原型属性_update $forceUpdate $destroy
renderMixin(Vue)// 注册实例原型属性方法 $nextTick _render

export default Vue