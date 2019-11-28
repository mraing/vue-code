function cb (val) {
  /* 渲染视图 */
  console.log("视图更新啦～");
}

/*
    Object.defineProperty() 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性， 并返回这个对象。
    obj: 目标对象
    prop: 需要操作的目标对象的属性名
    descriptor: 描述符
    
    return value 传入对象
*/
function defineReactive (obj, key, val) {
  Object.defineProperty(obj, key, {
      enumerable: true,       /* 属性可枚举 */
      configurable: true,     /* 属性可被修改或删除 */
      get: function reactiveGetter () {
        return val;         /* 实际上会依赖收集 */
      },
      set: function reactiveSetter (newVal) {
        // 当值相等时，直接结束
        if (newVal === val) return;
        cb(newVal);
      }
  });
}

// 设置观察者
function observer (value) {
  console.log(typeof value);
  if (!value || (typeof value !== 'object')) {
      return;
  }
  // 给每个值绑定 defineReactive 函数
  Object.keys(value).forEach((key) => {
    console.log('forEach:'+key);
      defineReactive(value, key, value[key]);
  });
}

class Vue {
  /* Vue构造类 */
  constructor(options) {
      this._data = options.data;
      observer(this._data);
  }
}

let o = new Vue({
  data: {
      test: "I am test."
  }
});
o._data.test = "hello,world.";  /* 视图更新啦～ */