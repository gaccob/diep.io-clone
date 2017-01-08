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

- 将 browserify 回退到 12.0.2 版本之后，发现会报 fs.readFile() 函数没找到，实际上 fs 没有 require 进来，是个空对象。 [issue 1277](https://github.com/substack/node-browserify/issues/1277) 中提到了这个问题，需要为 browserify 指定 --no-builtins 参数。

- 加上 --no-builtins 参数，并把 browserify 再更新到最新的 13.3.0 版本，都正常了。 12.x.x 版本的 browserify 也没问题。

结论：这个 bug 需要为 browserify 指定 --no-builtins 参数（猜测是 fs 在某个模块中有重复定义），而这个报错在 12.x.x 和 13.x.x 下不一致，13.x.x 没有报出真正的问题，导致纠结了许久。
