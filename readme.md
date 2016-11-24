Description
===========
diep.io like game written with PIXI.js & Socket.IO

Installation
============
1. npm install
2. set app.domain & app.port in package.json
3. npm run release

Record & Replay
===============
each game dumps a record file in www/record, and it can be replayed as following:
- RECORD="www/record/20161117/224323.dat" npm run replay

