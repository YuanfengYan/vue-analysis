

/**
 * Actual demo
 */

var componentB = {
  data:function(){
    return {
      nameb:'componentB',
      age:'age3'
    }
  },
  props:['name'],
  inheritAttrs:false,
  template:"<div>组件B{{nameb}}--$attrs:{{$attrs.age}}</div>",
  mounted:function(){
    console.log(this.$attrs)
  }
}

Vue.component("componentA",{
  data:function(){
    return {
      nameA:'componentA',
      age:'age2'
    }
  },
  props:['name'],
  components:{
    componentB:componentB
  },
  watch:{
    
  },
  created: function () {
    this.$emit('change','componentA')
  },
  mounted:function(){
    console.log('componentA-mounted')
  },
  template:"<div><component-b v-bind='$attrs'></component-b><div>组件A{{nameA}}</div></div>"
})

new Vue({
  el: '#demo',
  data: {
    currentBranch:1,
    name:'demo',
    age:'age1',
    isShow:true,
    arr:[{name:'jack'},{name:'peter'}],
  },
  beforeCreate:function(){
    console.log(this.age)
  },
  created: function () {
    this.fetchData()
  },
  watch: {
    currentBranch: ['fetchData','fn1']
  },
  filters: {
    formatDate: function (v) {
      return v.replace(/T|Z/g, ' ')
    }
  },
  directives: {
    focus: {
      // 指令的定义
      inserted: function (el) {
        el.focus()
      }
    }
  },
  methods: {
    fn1:function(){
      console.log('fn1')
    },
    fn2:function(){
      console.log('fn2')
    },
    fetchData: function () {
      Vue.nextTick( function(){
        console.log('vue.nextTick')
      })
      Vue.nextTick( function(){
        console.log('vue.nextTick')
      })
      Vue.nextTick( function(){
        console.log('vue.nextTick')
      })
     console.log('this.currentBranch')
     console.log(this.currentBranch)
    }
  }
})
