
// 去掉首位空格
function trimStr(str){
  return str.replace(/(^\s*)|(\s*$)/g,'');
}


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
  let dep = new Dep();
  // 给对象增加 get,set 
  for(let key in data) {
    let val = data[key];
    observer_down(val); // 递归继续向下找，实现深度的数据劫持
    // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
    Object.defineProperty (data, key, {
      configurable: true,
      get () {
        Dep.target && dep.addSub(Dep.target);   // 将watcher添加到订阅事件中 [watcher]
        return val;
      },
      set (newVal) { // 更改值的时候
         if (val === newVal) { return } // 设置和以前一样的值时，就直接退出
         val = newVal; // 如果以后再获取值的时候，将刚才设置的值再返回出去
         observer_down(newVal);  // 当设置为新值后，也需要把新值再去定义成属性
         dep.notify();   // 让所有watcher的update方法执行即可
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
  // 将 el 挂载到是实例上，方便调用
  vm.$el = document.querySelector(el);
  // console.log(vm);
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
        // 监听变化
        // 给Watcher再添加两个参数，用来取新的值(newVal)给回调函数传参
        new Watcher(vm, RegExp.$1, newVal => {
          node.textContent = txt.replace(reg, newVal).trim();    
        });
      }

      if (node.nodeType === 1) {  // 元素节点
        let nodeAttr = node.attributes; // 获取dom上的所有属性,是个类数组
        Array.from(nodeAttr).forEach(attr => {
          let name = attr.name;   // v-model  type
          let exp = attr.value;   // c        text
          if (name.includes('v-')){
              node.value = vm[exp];   // this.c 为 2
          }
          // 监听变化
          new Watcher(vm, exp, function(newVal) {
              node.value = newVal;   // 当watcher触发时会自动将内容放进输入框中
          });

          node.addEventListener('input', e => {
              let newVal = e.target.value;
              // 相当于给this.c赋了一个新值
              // 而值的改变会调用set，set中又会调用notify，notify中调用watcher的update方法实现了更新
              vm[exp] = newVal;   
          });
        });
      }

      // 如果还有子节点，继续递归 replace
      if (node.childNodes && node.childNodes.length) {
        replace(node);
      }
    })
  }

  replace(fragment); // 替换内容
  vm.$el.appendChild(fragment); // 再将文档碎片放入 el 中
}



// 发布订阅模式  订阅和发布 如[fn1, fn2, fn3]
function Dep() {
  // 一个数组(存放函数的事件池)
  this.subs = [];
}
Dep.prototype = {
  addSub(sub) {   
      this.subs.push(sub);    
  },
  notify() {
      // 绑定的方法，都有一个update方法
      this.subs.forEach(sub => sub.update());
  }
};
// 监听函数
// 通过Watcher这个类创建的实例，都拥有update方法
function Watcher(vm, exp, fn) {
  this.fn = fn;
  this.vm = vm;
  this.exp = exp;
  // 添加一个事件
  // 这里我们先定义一个属性
  Dep.target = this;
  // console.log(trimStr(exp).split('.'));
  let arr = trimStr(exp).split('.');
  let val = vm;
  arr.forEach(key => {    // 取值
    val = val[key];     // 获取到this.a.b，默认就会调用get方法
  });
  Dep.target = null;
}

Watcher.prototype.update = function() {
  // notify的时候值已经更改了
  // 再通过vm, exp来获取新的值
  // console.log(this.exp);
  let arr = trimStr(this.exp).split('.');
  let val = this.vm;
  arr.forEach(key => {    
      val = val[key];   // 通过get获取到新的值
  });
  this.fn(val);  
};

//浏览器中输入 mvvm._data.song = '青花瓷'，也能即时改变数据
