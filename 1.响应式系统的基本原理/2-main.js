function observe(value, cb) {
  Object.keys(value).forEach((key) => defineReactive(value, key, value[key] , cb))
}

function defineReactive (obj, key, val, cb) {
  Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get: ()=>{
          /*....依赖收集等....*/
          return val
      },
      set:newVal=> {
          val = newVal;
          cb();/*订阅者收到消息的回调*/
      }
  })
}

class Vue {
  constructor(options) {
      this._data = options.data;
      observe(this._data, options.render)
  }
}

let app = new Vue({
  el: '#app',
  data: {
      text: 'text',
      text2: 'text2',
      text3: 'text3'
  },
  render(){
      console.log("render");
  }
})