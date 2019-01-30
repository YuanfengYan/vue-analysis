/* global Vue */

var apiURL = 'https://api.github.com/repos/vuejs/vue/commits?per_page=3&sha='

/**
 * Actual demo
 */

new Vue({

  el: '#demo',

  data: {
    branches: ['master', 'dev'],
    currentBranch: 'master',
    commits: null,
    obj:{},
    __name:123,
  },
// render:(h, ctx) => {
//   return h('div',{},'xxxx')
// },
  created: function () {
    this.fetchData()
  },
  
  watch: {
    currentBranch: 'fetchData'
  },

  filters: {
    truncate: function (v) {
      var newline = v.indexOf('\n')
      return newline > 0 ? v.slice(0, newline) : v
    },
    formatDate: function (v) {
      return v.replace(/T|Z/g, ' ')
    }
  },

  methods: {
    fetchData: function () {
      this.$set(this.obj,'name',this.currentBranch)
      console.log(this.$children)
      this.obj.name=123
      var self = this
      Vue.use({install:(Vue,options)=>{
        console.log('Vue---', Vue)
        console.log('options---',options)
      }},'vue install option val')
      if (navigator.userAgent.indexOf('PhantomJS') > -1) {
        // use mocks in e2e to avoid dependency on network / authentication
        setTimeout(function () {
          self.commits = window.MOCKS[self.currentBranch]
        }, 0)
      } else {
        var xhr = new XMLHttpRequest()
        xhr.open('GET', apiURL + self.currentBranch)
        xhr.onload = function () {
          self.commits = JSON.parse(xhr.responseText)
          // console.log(self.commits[0].html_url)
        }
        xhr.send()
      }
    }
  }
})
