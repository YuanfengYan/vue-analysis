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
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue