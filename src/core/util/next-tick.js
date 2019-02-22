/* @flow */
/* globals MessageChannel */

import { noop } from 'shared/util'
import { handleError } from './error'
import { isIOS, isNative } from './env'

 /*
    延迟一个任务使其异步执行，在下一个tick时执行，一个立即执行函数，返回一个function
    这个函数的作用是在task或者microtask中推入一个timerFunc，
    在当前调用栈执行完以后以此执行直到执行到timerFunc
    目的是延迟到当前调用栈执行完以后执行
*/
/*存放异步执行的回调*/
const callbacks = []

/*一个标记位，如果已经有timerFunc被推送到任务队列中去则不需要重复推送*/

let pending = false

/*下一个tick时的回调*/
function flushCallbacks () {
  // 一个标记位，标记等待状态（即函数已经被推入任务队列或者主线程，已经在等待当前栈执行完毕去执行），这样就不需要在push多个回调到callbacks时将timerFunc多次推入任务队列或者主线程
  pending = false
  //复制callback
  const copies = callbacks.slice(0)
   //清除callback
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

// Here we have async deferring wrappers using both microtasks and (macro) tasks.
// In < 2.4 we used microtasks everywhere, but there are some scenarios where
// microtasks have too high a priority and fire in between supposedly
// sequential events (e.g. #4521, #6690) or even between bubbling of the same
// event (#6566). However, using (macro) tasks everywhere also has subtle problems
// when state is changed right before repaint (e.g. #6813, out-in transitions).
// Here we use microtask by default, but expose a way to force (macro) task when
// needed (e.g. in event handlers attached by v-on).

/**
其大概的意思就是：在Vue2.4之前的版本中，nextTick几乎都是基于microTask实现的，
但是由于microTask的执行优先级非常高，在某些场景之下它甚至要比事件冒泡还要快，
就会导致一些诡异的问题；但是如果全部都改成macroTask，对一些有重绘和动画的场
景也会有性能的影响。所以最终nextTick采取的策略是默认走microTask，对于一些DOM
的交互事件，如v-on绑定的事件回调处理函数的处理，会强制走macroTask。
**/

let microTimerFunc 
let macroTimerFunc
let useMacroTask = false

// Determine (macro) task defer implementation.
// Technically setImmediate should be the ideal choice, but it's only available
// in IE. The only polyfill that consistently queues the callback after all DOM
// events triggered in the same loop is by using MessageChannel.
/* istanbul ignore if */

/**
 * 而对于macroTask的执行，Vue优先检测是否支持原生setImmediate（高版本IE和Edge支持），
不支持的话再去检测是否支持原生MessageChannel，如果还不支持的话为setTimeout(fn, 0)。
 */
if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  macroTimerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else if (typeof MessageChannel !== 'undefined' && (
  isNative(MessageChannel) ||
  // PhantomJS
  MessageChannel.toString() === '[object MessageChannelConstructor]'
)) {
  // MessageChannel与原先的MutationObserver异曲同工
/**
在Vue 2.4版本以前使用的MutationObserver来模拟异步任务。
而Vue 2.5版本以后，由于兼容性弃用了MutationObserver。
Vue 2.5+版本使用了MessageChannel来模拟macroTask。
除了IE以外，messageChannel的兼容性还是比较可观的。
**/
 /**
  可见，新建一个MessageChannel对象，该对象通过port1来检测信息，port2发送信息。
  通过port2的主动postMessage来触发port1的onmessage事件，
  进而把回调函数flushCallbacks作为macroTask参与事件循环。
  **/
  const channel = new MessageChannel()
  const port = channel.port2
  channel.port1.onmessage = flushCallbacks
  macroTimerFunc = () => {
    port.postMessage(1)
  }
} else {
  /* istanbul ignore next */
  //上面两种都不支持，用setTimeout
  macroTimerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

// Determine microtask defer implementation.
/* istanbul ignore next, $flow-disable-line */
// 微观任务 microTask 延迟执行
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  microTimerFunc = () => {
    p.then(flushCallbacks)
    // in problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) setTimeout(noop)
  }
} else {
  // fallback to macro
  microTimerFunc = macroTimerFunc
}

/**
 * Wrap a function so that if any code inside triggers state change,
 * the changes are queued using a (macro) task instead of a microtask.
 *  在Vue执行绑定的DOM事件时，默认会给回调的handler函数调用withMacroTask方法做一层包装，
 *它保证整个回调函数的执行过程中，遇到数据状态的改变，这些改变而导致的视图更新（DOM更新）
 *的任务都会被推到macroTask而不是microtask。
 */
export function withMacroTask (fn: Function): Function {
  return fn._withTask || (fn._withTask = function () {
    useMacroTask = true
    try {
      return fn.apply(null, arguments)
    } finally {
      useMacroTask = false    
    }
  })
}
/**
 * 
 *  推送到队列中下一个tick时执行
    cb 回调函数
    ctx 上下文
 */
export function nextTick (cb?: Function, ctx?: Object) {
  let _resolve
  /*cb存到callbacks中*/
  debugger
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  if (!pending) {
    pending = true
    if (useMacroTask) {
      macroTimerFunc()
    } else {
      microTimerFunc()
    }
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
