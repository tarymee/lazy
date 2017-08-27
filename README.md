# lazy.js
用于移动端滚动按需，包括图片按需加载和js按需执行

+ jsList {Array} js按需执行列表项
    + id {String} 滚动到当前id执行对应js项
    + js {Function | String} 按需执行的js
+ target {String | Array} 按需加载图片的容器id
+ imgSrc {String} 图片真实地址属性
+ offset {Number} 灵敏度 如设置为100 表示滚动在距离目标位置100px执行，默认为半屏高度
+ delay {Number} 滚动触发加载的延时，用于滚动节流，默认值是 100，单位毫秒
+ delay_ot {Number} 滚动过程中多长时间后强行触发一次，默认值是 1000，单位毫秒
+ imgLoad {Function} 真实图片加载完后执行。传回三个参数：1、element{DOM} 目标图片 2、width {Number} 真实图片实际宽度 3、height {Number}真实图片实际高度


```
var jsList_ = [{
    id: 'test1',
    js: function() {}
}, {
    id: 'test2',
    js: 'alert("test2")'
}];

var xx = Lazy.create({
    jsList: jsList_,
    target: 'JimgLoad',
    imgSrc: 'lazy-src',
    offset: 100,
    delay: 100,
    delay_ot: 1000,
    imgLoad: function(element, width, height) {}
})
Lazy.init(xx)
```
