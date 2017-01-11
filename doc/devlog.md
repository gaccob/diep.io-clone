## 2017.1.5

最近在尝试把 [tiled](http://www.mapeditor.org/) 地图引入进来，花了一天左右的时间学习了 tiled 地图的制作流程，感觉容易上手，功能还比较丰富。

但是把 tile map 集成都 PIXI.js 中碰到了一些麻烦。找了几个现成的 lib, 都是只支持 PIXI.js v3 的。 PIXI.js 现在已经 release 到 v4 了，api 相比 v3 有一些调整, 例如 PIXI.extras.MovieClip 已经 deprecated 了，替换为了 PIXI.extras.AnimatedSprite.

测试了一下 [pixi-tiledmap](https://github.com/riebel/pixi-tiledmap) 这个库, 尝试修改它的源码来适配 v4 的 PIXI.js, build 时碰到了错误:
Error: Cannot find module '../../../../.1.1.4@is-buffer/index.js' from '/home/gaccob/pixi-tiledmap/node_modules/.1.0.2@core-util-is/lib'

同样的错误，之前在引入 seedrandom.js 时也碰到过，当时是发现有一个 crypto 的依赖库有问题, 去掉就 ok 了，还给作者提过一个 issue, 后来作者回复说没有碰到这种情况，就关掉了。个人猜测可能和环境有关系。不过这一次，pixi-tiledmap 里并没有 crypto 库的依赖，暂时也没有头绪如何来解决。


## 2017.1.7

既然 pixi-tiledmap 不行，那就换个库试试。 今天测试了 [pixi-tiled](https://github.com/beeglebug/pixi-tiled) , 发现在 PIXI.js v4 下显示正常，虽然有点小问题，但不影响正常工作。 下一步要做的事情是解析地图，支持逻辑处理。


## 2017.1.8

解析地图在加载 'tmx-parser' 模块时又碰到了 Cannot find module '../../../../.1.1.4@is-buffer/index.js' 这个错误，决定今天好好研究一下:

- [browserify issue 1483](https://github.com/substack/node-browserify/issues/1483) 里提到了，这是 [browserify](https://github.com/substack/node-browserify) 在 13.x.x 版本中的 bug。

- 将 browserify 回退到 12.0.2 版本之后，发现会报 fs.readFile() 函数没找到，实际上 fs 是个空对象。 [browserify issue 1277](https://github.com/substack/node-browserify/issues/1277) 中提到了这个问题，为 browserify 指定 --no-builtins 参数可以解决 fs 的错误，但因为没有 builtins，会报 _process() 找不到。。。 这个 issue 上给的解决方法实测并不好用，可能是我使用的姿势不对 -。-。

今天纠结这个问题好几个小时，实在有点浪费时间，明天再来看。。

PS. fs 的错误，居然在 browserify 13.x.x 中会报错到 is-buffer 中去，也是蛋疼。。


## 2017.1.9

今天仔细思考了一下，错误的根源在于在 browser 端 require fs，而 browserify 不能搞定。既然如此，那就不纠结 browserify 了，tiled 可以导出 json 文件，browser 端无非就是读文件做显示, 自己写个简单的实现，也不用额外引入 tmx-parser 或者 pixi-tilexx 模块。

简单看了下 pixi-tiled 和 pixi-tiledmap 的显示实现部分，就愉快的开撸了，因为只打算用多少功能实现多少，所以代码很简单，最终还不到200行。


## 2017.1.10

昨天 tiled 地图显示部分的代码，测试下来发现一个比较麻烦的问题：画布缩放时会产生拉扯的黑线，和 [PIXI.js issue 48](https://github.com/pixijs/pixi.js/issues/48) 描述的现象比较像，似乎是缩放时导致 sprite 的浮点精度问题。

从 debug 时打印的日志来看，tile sprite 的 x、y、width、height 确实都被 scaling 成了浮点数，设置 PIXI.SCALE_MODES.NEAREST 也没有起作用，不知道为什么。

PIXI.CanvasRenderer 有 autoResize 属性，翻了下源码中的相关逻辑部分:
```javascript
SystemRenderer.prototype.resize = function (width, height) {
    this.width = width * this.resolution;
    this.height = height * this.resolution;

    this.view.width = this.width;
    this.view.height = this.height;

    if (this.autoResize)
    {
        this.view.style.width = this.width / this.resolution + 'px';
        this.view.style.height = this.height / this.resolution + 'px';
    }
};
```
如果设置了 autoResize，renderer.resize() 不仅会设置 canvas.height 和 canvas.width，还会设置 canvas.style.height 和 canvas.style.width。然而这对我的需求来说，并没有什么用。

之前画布的大小适配，是通过修改整个 Container 的 scale 来实现的：
- 玩家画布大小是：800 * 640，可配置。
- 随着 window resize 调整，画布保持比例不变，居中等比缩放, 例如 window 是 500 * 320，画布会保持 400 * 320。

暂时解决不了黑线的问题，就换个思路，看看别人的适配是怎么做的，看了一下 [agar.io](http://agar.io) 的方案：
- 画布小于一定大小时，随 window resize 做裁剪，但保持玩家一直在中间。
- 画布超过一定大小时，随 window resize 做 scaling。
- 排行榜这些信息一直随画布做 scaling 的。
- agar.io 的地图背景是直接画的线，所以不管怎么做 scaling 也不会有拉扯。

看上去好像还可以，只需要改一下 StageWorldView 就可以实现，明天找时间试一试。


## 2017.1.11

今天实现了一版与 agar.io 类似的适配方案，有两点差别：
- 画布超过一定大小 （800 * 640）之后，周边留白，不做 scaling。
- 玩家（摄像机）移动时，到边界处会做一个自适应的调整。
- 因为涉及到摄像机、画布、还有浏览器窗口的各种转换，计算有点绕，不过体验效果还挺不错的，暂时就这样。
