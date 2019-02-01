

/**
 * Actual demo
 */

var componentB = {
  data:function(){
    return {
      nameb:'componentB'
    }
  },
  props:['name'],
  inheritAttrs:false,
  template:"<div>{{name}}--{{$attrs.age}}</div>",
  mounted:function(){
    console.log(this.$attrs)
  }
}

Vue.component("componentA",{
  data:function(){
    return {
      nameA:'componentA',
      age:123
    }
  },
  props:['name'],
  components:{
    componentB:componentB
  },
  mounted:function(){
    console.log('componentA',this.$attrs)
  },
  template:"<div><component-b  v-bind='$attrs'></component-b><div>{{nameA}}</div></div>"
})

new Vue({
  el: '#demo',
  data: {
    currentBranch:1,
    name:123,
    age:23,
  },
  created: function () {
    this.fetchData()
  },
  watch: {
    currentBranch: 'fetchData'
  },
  filters: {
    formatDate: function (v) {
      return v.replace(/T|Z/g, ' ')
    }
  },
  methods: {
    fetchData: function () {
     console.log('this.currentBranch')
     console.log(this.currentBranch)
    }
  }
})
