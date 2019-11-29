// 创建一个 MVVM 的构造函数

function Mvvm (options = {}) {
  
  this.$options = options
  let data = this._data = this.$options.data
  // 数据劫持
  Observer(data);
  // this 代理了this._data
  for (let key in data) {
    Object.defineProperty(this, key, {
        configurable: true,
        get() {
            return this._data[key];     // 如this.a = {b: 1}
        },
        set(newVal) {
            this._data[key] = newVal;
        }
    });
  }
  // 编译
  new Compile(options.el, this);
}

// 观察者模式
function Observer (data) {
  // 给对象增加 get,set 
  for(let key in data) {
    let val = data[key];
    observer_down(val); // 递归继续向下找，实现深度的数据劫持
    // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
    Object.defineProperty (data, key, {
      configurable: true,
      get () {
        return val
      },
      set (newVal) { // 更改值的时候
         if (val === newVal) { return } // 设置和以前一样的值时，就直接退出
         val = newVal; // 如果以后再获取值的时候，将刚才设置的值再返回出去
         observer(newVal);  // 当设置为新值后，也需要把新值再去定义成属性
      }
    })
  }
}

// 外面再写一个函数，就不用每次调用都要写个 new， 同时方便递归调用
function observer_down (data) {
  // 如果不是对象的话，就直接 return 掉，防止递归溢出
  if(!data || typeof data !== 'object') return;
  return new Observer (data);
}

// 编译
function Compile(el, vm) {
  console.log(vm);
  // 将 el 挂载到是实例上，方便调用
  vm.$el = document.querySelector(el);
  console.log(vm);
  //  创建一个虚拟 DOM https://developer.mozilla.org/zh-CN/docs/Web/API/Document/createDocumentFragment
  var fragment = document.createDocumentFragment();

  while (child = vm.$el.firstChild) {
    fragment.appendChild(child);  // 此时将 el 中的内容放入到内存中
  }
  // 对 el 里面的内容进行替换
  function replace (frag) {
    Array.from(frag.childNodes).forEach(node => {
      let txt = node.textContent;
      let reg = /\{\{(.*?)\}\}/g;   // 正则匹配{{}}
      // 即是文本节点又有大括号的情况{{}}
      if (node.nodeType === 3 && reg.test(txt)) {
        // console.log(trimStr(RegExp.$1).split('.'));
        // 去掉 DOM结构中的首位空格
        let arr = trimStr(RegExp.$1).split('.');
        let val = vm;
        arr.forEach(key => {   
          val = val[key];
        })
        // 用 trim 方法去除一些首位空格
        node.textContent = txt.replace(reg,val).trim();
      }
      // 如果还有子节点，继续递归 replace
      if (node.childNodes && node.childNodes.length) {
        replace(node);
      }
    })
  }

  // 去掉首位空格
  function trimStr(str){
    return str.replace(/(^\s*)|(\s*$)/g,'');
  }

  replace(fragment); // 替换内容
  vm.$el.appendChild(fragment); // 再将文档碎片放入 el 中
}

