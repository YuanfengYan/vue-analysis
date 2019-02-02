

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
  methods: {
    fn1:function(){
      console.log('fn1')
    },
    fetchData: function () {
     console.log('this.currentBranch')
     console.log(this.currentBranch)
    }
  }
})
