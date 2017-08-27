var Lazy = {
    eCatch: {},
    eHandle: 0,
    isFunction: function(obj) {
        return Object.prototype.toString.call(obj) === '[object Function]'
    },
    addEvent: function(o, e, func) {
        if (o.addEventListener) {
            o.addEventListener(e, func, false)
        } else {
            o.attachEvent('on' + e, func)
        }
        this.eCatch[++this.eHandle] = {
            'handler': func
        }
        return this.eHandle
    },
    removeEvent: function(o, e, func) {
        if (o.addEventListener) {
            o.removeEventListener(e, this.eCatch[func].handler, false)
        } else {
            o.detachEvent('on' + e, this.eCatch[func].handler)
        }
    },
    converNodeToArray: function(nodes) {
        var array = []
        try {
            array = Array.prototype.slice.call(nodes, 0)
        } catch (e) {
            /*ie6-8*/
            for (var i = 0, len = nodes.length; i < len; i++) {
                array.push(nodes[i])
            }
        }
        return array
    },
    each: function(o, fn) {
        for (var i = 0, len = o.length; i < len; i++) {
            fn.call(o[i], i, o[i])
        }
    },
    create: function(o) { //初始化需要按需加载的图片对象
        o.loading = false
        o.timmer = undefined
        o.time_act = 0
        o.imgList = []
        this.imgLoad = o.imgLoad
        var target = o.target
        var that = this
        var imgList = []
        target = (typeof target) == 'string' ? [].concat(target) : target
        that.each(target, function(i, v) {
            var lid = document.getElementById(v)
            if (!lid) return
            var imgs
            if (document.querySelectorAll) {
                imgs = document.querySelectorAll('#' + v + ' img')
            } else {
                imgs = lid.getElementsByTagName('img')
            }
            imgList = imgList.concat(imgs && that.converNodeToArray(imgs))
        })

        that.each(imgList, function(i, v) {
            if (v.getAttribute(o.imgSrc)) {
                o.imgList.push(v)
            }
        })
        o.imgCount = o.imgList.length

        if (o.jsList) {
            o.jsCount = o.jsList.length
            for (var i = 0; i < o.jsCount; i++) {
                o.jsList[i].oDom = (typeof(o.jsList[i].id) == 'object') ? o.jsList[i].id : document.getElementById(o.jsList[i].id)
            }
        } else {
            o.jsList = []
            o.jsCount = 0
        }
        return o
    },
    //checkPhone: android、iphone、ipod、ipad 已包括大部分手机
    checkPhone: function(ua) {
        //this.isPhone = 'ontouchend' in document ? true : false//该判断暂时无法确定是否OK
        if (ua.indexOf('android') > -1 || ua.indexOf('iphone') > -1 || ua.indexOf('ipod') > -1 || ua.indexOf('ipad') > -1) {
            this.isPhone = true
        } else {
            this.isPhone = false
        }
    },
    //checkLazyLoad:目前该功能不兼容 opera mini，有测试到其他浏览器不支持都可加入该列表，一次加载所有图片
    checkLazyLoad: function(ua) {
        if (ua.indexOf('opera mini') > -1) {
            return false
        } else {
            return true
        }
    },
    init: function(o) { //运行主程序
        if (o.imgCount < 1 && o.jsCount < 1) return
        var ua = navigator.userAgent.toLowerCase()
        if (this.checkLazyLoad(ua)) {
            this.checkPhone(ua) //判断是否移动端
            o.e1 = this.addEvent(window, 'scroll', this.load(o)) //加监听，不是所有浏览器都有这几个事件，但监听浏览器无的事件也无影响
            o.e2 = this.addEvent(window, 'touchmove', this.load(o))
            o.e3 = this.addEvent(window, 'touchend', this.load(o))
            this.loadTime(o) //首次不设置setTimeout触发加载图片
        } else {
            this.loadOnce(o)
        }
    },
    getImgTop: function(o) {
        var imgTop = 0
        if (!o) return
        while (o.offsetParent) {
            imgTop += o.offsetTop
            o = o.offsetParent
        }
        return imgTop
    },
    load: function(o) {
        return function() {
            if (o.loading == true) return
            o.loading = true
            if (o.time_act && ((1 * new Date() - o.time_act) > o.delay_tot)) { //触发程序时，如果离上次触发超过一定时间，则马上触发
                o.timmer && clearTimeout(o.timmer)
                Lazy.loadTime(o)
            } else { //否则设置延迟触发程序
                o.timmer && clearTimeout(o.timmer)
                o.timmer = setTimeout(function() {
                    Lazy.loadTime(o)
                }, o.delay)
            }
            o.loading = false
        }
    },
    setSrc: function(o, l) {
        // o.setAttribute('src', o.getAttribute(l))
        // o.removeAttribute(l)
        var self = this
        var src2 = o.getAttribute(l)
        var _img = new Image()
        _img.onload = function() {
            o.setAttribute('src', src2)
            o.removeAttribute(l)

            // o.style.opacity = '0.3'
            // setTimeout(function(){
            //    var style = o.style
            //    if(!style) return
            //     style.webkitTransitionDuration = 
            //     style.MozTransitionDuration = 
            //     style.msTransitionDuration = 
            //     style.OTransitionDuration = 
            //     style.transitionDuration = 200 + 'ms'
            //     style.opacity=1
            // }, 3)

            if (self.imgLoad) {
                self.imgLoad.call(o, o, _img.width, _img.height)
            }

        }
        _img.src = src2

    },
    setJs: function(js) {
        // eval(js)
        Lazy.isFunction(js) ? js.call(this, this) : eval(js)
    },
    loadTime: function(o) {
        o.time_act = 1 * new Date() //设置本次加载图片时间
        var winH, winTop, winTot
        if (this.isPhone) {
            winH = document.documentElement.clientHeight
            winTop = window.scrollY
            winTot = winTop + winH
        } else {
            winH = document.documentElement.clientHeight || document.body.clientHeight
            winTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop)
            winTot = winH + winTop
        }
        if (!o.offset) {
            o.offset = winH / 2
        }
        //如果没设置预加载图片位置，则预加载的位置为：上下一屏的图片
        var wTop_o = winTop - o.offset,
            wTot_o = winTot + o.offset
        var imgCache = [] //用于缓存暂时不加载的图片
        for (var i = 0; i < o.imgCount; i++) {
            var img = o.imgList[i],
                imgH = img.clientHeight,
                imgTop, imgB
            if (img.getBoundingClientRect) {
                imgTop = img.getBoundingClientRect().top + winTop
            } else {
                imgTop = this.getImgTop(img)
            }
            imgB = imgTop + imgH
            if ((imgTop > wTop_o && imgTop < wTot_o) || (imgB > wTop_o && imgB < wTot_o)) { //判断在当前屏和上、下一屏的图片
                if (imgTop > winTop && imgTop < winTot) { //如果在当前屏直接加载
                    this.setSrc(img, o.imgSrc)
                } else { //如果在上、下一屏的则先缓存
                    imgCache.push(img)

                }
                o.imgList.splice(i, 1)
                i--
                o.imgCount--
            }
        }

        var imgCacheL = imgCache.length
        if (imgCacheL) { //预加载缓存的图片
            for (var i = 0; i < imgCacheL; i++) {
                var img = imgCache[i]
                this.setSrc(img, o.imgSrc)
            }
        }
        if (o.jsList) {
            for (var i = 0; i < o.jsCount; i++) {
                var oJs = o.jsList[i]
                var jsTop = this.getImgTop(oJs.oDom, winTop)
                if ((jsTop > wTop_o && jsTop < wTot_o)) {
                    this.setJs.call(oJs.oDom, oJs.js)
                    o.jsList.splice(i, 1)
                    i--
                    o.jsCount--
                }
            }
        }
        if (o.imgCount == 0 && o.jsCount == 0) {
            this.removeEvent(window, 'scroll', o.e1)
            this.removeEvent(window, 'touchmove', o.e2)
            this.removeEvent(window, 'touchend', o.e3)
        }
    },
    loadOnce: function(o) { //如果浏览器不支持按需加载则一次加载所有图片
        for (var i = 0; i < o.imgCount; i++) {
            var img = o.imgList[i]
            this.setSrc(img, o.imgSrc)
        }
        if (o.jsList) {
            for (var i = 0; i < o.jsCount; i++) {
                var oJs = o.jsList[i]
                this.setJs.call(oJs.oDom, oJs.js)
            }
        }
    }
}