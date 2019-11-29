// Object.defineProperty() 修改内部特性，定义对象上的属性和值
let obj = {}
obj.singer = '周杰伦'
let song = '发如雪'
// obj: 目标对象
// prop: 需要操作的目标对象的属性名
// descriptor: 描述符

Object.defineProperty(obj, 'music', {
  // value: '刘德华',
  // writable : false,
  configurable: true,  // 可以配置对象，删除属性
  enumerable: true,     // 是否可以枚举
  
  // get,set设置时不能设置writable和value，它们代替了二者且是互斥的
  get () {
    return '青花瓷'
  },
  set (val) {
    // song = val
  }
})

// 打印 obj 对象
console.log(obj);

// 删除 obj 对象中的 music 属性，前提是 configurable 为 true
// delete obj.music;

console.log(obj);

// 前提是 enumerable 为 true
// for (const key in obj) {
//   console.log(key);
// }


