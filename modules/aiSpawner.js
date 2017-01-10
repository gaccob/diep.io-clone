(function(){ "use strict";

var aiName = [
     "尐尐孩",
     "笑.破红尘",
     "时光泛黄了照片",
     "不入他眼",
     "智商回家碎觉",
     "我恋爱了~",
     "╰ bigヽeye﹀",
     "丿灬顷国丶倾城",
     "不要宣萱闹闹。",
     "江南吃醋王",
     "我是二千",
     "看谁笑到最后",
     "听你说爱的谎",
     "动感超人的小光波",
     "没有范儿",
     "太阳每天都生气",
     "只会爱你i",
     "你的笑刺痛我眼睛",
     "纯种、小孩",
     "繁华落尽〃倾城泪",
     "失控-Tender",
     "渣渣妹i",
     "____袂吏.",
     "平胸平天下",
     "典当爱情",
     "女儿国",
     "纸星星i",
     "Unlock now",
     "萌猛",
     "ヤ沙漠寂寞ヤ",
     "﹏茉莉`坊",
     "大大的幸福",
     "戒不掉的瘾",
     "▼ 宅男女神",
     "依旧高傲ゝ",
     "PK时发型不乱",
     "我弃疗",
     "太阳是我啃圆的",
     "泪゜",
     "清风，挽忆",
     "风信子",
     "孙丶悟丶空",
     "夜貓子°",
     "作业是个老油条!",
     "·°不帅哥哥",
     "颜小艺丶",
     "冷筱贱。",
     "斑马线@",
     "旧时光°",
     "久伴我.",
     "丑八怪",
     "替身吗!",
     "°依小熙",
     "空心人丶",
     "小呆呱er",
     "如夢令",
     "許小嵩°",
     "前女友",
     "洛小颜",
     "继承者~",
     "失心疯@",
     "离开我@!",
     "笨小蛋〞",
     "じòぴé小纨绔",
     "碎碎念﹏",
     "沫小兮°",
     "小鸡蛋@",
     "安小曦丶",
     "莫小熙丶smile",
     "尛尛糖",
     "夏小顔ζ",
];

var Package = require("../package.json");

function getRandomAIName()
{
    var len = aiName.length;
    do {
        var idx = Math.floor(Math.random() * len);
        var name = aiName[idx];
        if (name) {
            aiName[idx] = null;
            return name;
        }
    } while (true);
}

function AISpawner(world)
{
    this.world = world;

    for (var i = 0; i < Package.app.world.aiMaxCount; ++ i) {
        var commander = new this.world.proto.SyncCommander();
        commander.cmd = this.world.proto.CommanderType.CT_JOIN;
        commander.connid = "ai-" + i;
        commander.join = new this.world.proto.SyncCommander.Join();
        commander.join.name = getRandomAIName();
        commander.join.ai = true;
        this.world.commander.push(this.world.frame + 1, commander);
    }
}

AISpawner.prototype = {
    constructor: AISpawner
};

AISpawner.prototype.update = function()
{
    // TODO:
};

module.exports = AISpawner;

})();
