2016.1.5
=============

最近在尝试把tiled地图引入进来，花了一天左右的时间学习了tiled地图的制作流程，感觉比较容易上手，而且功能比较丰富。

但是把 tile map 集成都 PIXI.js 中却碰到了一些麻烦, 找了几个现成的库都不太好用，例如下面两个:
https://github.com/riebel/pixi-tiledmap.git
https://github.com/beeglebug/pixi-tiled.git

PIXI.js 现在已经 release 到 v4 了，api 相比 v3 有一些调整, 例如 PIXI.extras.MovieClip 已经 deprecated 了，替换为了 PIXI.extras.AnimatedSprite.

今天尝试修改一下 pixi-tiledmap 的源码来适配 v4 的 PIXI.js, 但是 build 时碰到了错误:
Error: Cannot find module '../../../../.1.1.4@is-buffer/index.js' from '/home/gaccob/pixi-tiledmap/node_modules/.1.0.2@core-util-is/lib'

同样的错误，之前在引入 seedrandom.js 时也碰到过，当时是发现有一个 crypto 的依赖库有问题, 去掉就 ok 了，还给作者提过一个 issue, 后来作者回复说没有碰到这种情况，就关掉了。个人猜测可能和环境有关系，但无法确认。

不过这一次，pixi-tiledmap 里没有有 crypto 库的依赖，暂时也没有头绪如何来解决。等这个周末再研究一下, 希望可以顺利解决。
