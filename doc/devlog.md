## 2017.1.5

最近在尝试把 [tiled](http://www.mapeditor.org/) 地图引入进来，花了一天左右的时间学习了 tiled 地图的制作流程，感觉容易上手，功能还比较丰富。

但是把 tile map 集成都 PIXI.js 中却碰到了一些麻烦。找了几个现成的 lib, 都是只支持 PIXI.js v3 的。 PIXI.js 现在已经 release 到 v4 了，api 相比 v3 有一些调整, 例如 PIXI.extras.MovieClip 已经 deprecated 了，替换为了 PIXI.extras.AnimatedSprite.

测试了一下 [pixi-tiledmap](https://github.com/riebel/pixi-tiledmap) 这个库, 尝试修改一下 pixi-tiledmap 的源码来适配 v4 的 PIXI.js, 但是 build 时碰到了错误:
Error: Cannot find module '../../../../.1.1.4@is-buffer/index.js' from '/home/gaccob/pixi-tiledmap/node_modules/.1.0.2@core-util-is/lib'

同样的错误，之前在引入 seedrandom.js 时也碰到过，当时是发现有一个 crypto 的依赖库有问题, 去掉就 ok 了，还给作者提过一个 issue, 后来作者回复说没有碰到这种情况，就关掉了。个人猜测可能和环境有关系，但无法确认。不过这一次，pixi-tiledmap 里没有有 crypto 库的依赖，暂时也没有头绪如何来解决。


## 2017.1.7

既然 pixi-tiledmap 不行，那就换个库试试。 今天测试了 [pixi-tiled](https://github.com/beeglebug/pixi-tiled) 这个库, 发现在 PIXI.js v4 下显示正常，虽然有点小问题，不过已经可以正常工作了。

解决了显示问题，下一步要做的事情就是在 node 服务器端和 web 客户端解析地图，支持逻辑处理。


## 2017.1.8

在尝试加载 'tmx-parser' 模块时又碰到了 Cannot find module '../../../../.1.1.4@is-buffer/index.js' 这个错误，所以今天好好研究了一下:

- [issue 1483](https://github.com/substack/node-browserify/issues/1483) 里提到了，这是 [browserify](https://github.com/substack/node-browserify) 在 13.x.x 版本中的 bug。

- 将 browserify 回退到 12.0.2 版本之后，发现会报 fs.readFile() 函数没找到，实际上 fs 没有 require 进来，是个空对象。 [issue 1277](https://github.com/substack/node-browserify/issues/1277) 中提到了这个问题，为 browserify 指定 --no-builtins 参数，不会报 fs 的错误了，但是因为没有 builtins，会报 _process() 找不到。。。 这个 issue 上给了一个解决方法，但是测试并不好用，可能是我使用的姿势不对 -。-。

今天纠结这个问题好几个小时，实在有点浪费时间，明天再来看吧。。

PS. 最开始 builtin 中的 fs 错误，居然在 browserify 13.x.x 中会报错到 is-buffer 中去，也是很神奇……


## 2017.1.9

今天脑袋比较清楚，仔细思考了一下，这些问题纠结的根源在于在 browser 端使用 fs，而 browserify 不能解决问题（也许能解决，我的姿势不对）。既然如此，那就不纠结 browserify 了，既然 tiled 可以导出 json 文件，browser 端无非就是读文件做显示, 这样也不用引入 tmx-parser 或者 pixi-tilexx 的依赖。

分别看了下 pixi-tiled 和 pixi-tiledmap 的实现部分，就愉快的开撸了，反正也不很复杂，而且我只打算用多少功能做多少，代码很少还不到200行。


## 2017.1.10

昨天 tiled 地图显示部分的代码写完了，测试下来发现一个比较蛋疼的问题，缩放时会产生拉扯的黑线，和 [pixi.js issue 48](https://github.com/pixijs/pixi.js/issues/48) 描述的现象比较像，看上去是缩放时导致 sprite 的浮点精度问题，但是从 issue 上的对话上看，似乎这个问题早已修复掉。

之前 canvas 的 resize 部分是自己实现的，没有用 renderer 的实现，试着修改成 autoResize 属性来试了一下，不过效果怪怪的，和预期的效果有点差距，最重要的是，依然有水平方向的黑线 -.-
