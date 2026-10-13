import assert from 'node:assert/strict';
import fs from 'node:fs';

const glossarySource = fs.readFileSync('src/data/hskVietnameseMeanings.ts', 'utf8');
const appContext = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
const flashcard = fs.readFileSync('src/components/flashcard/Flashcard.tsx', 'utf8');
const entries = [...glossarySource.matchAll(/'([^']+)'\s*:\s*'([^']*)'/g)];
const meanings = new Map(entries.map(([, hanzi, meaning]) => [hanzi, meaning]));
const classicVocabularySource = fs.readFileSync('src/data/hskClassicVocabulary.ts', 'utf8');
const classicEntries = [...classicVocabularySource.matchAll(/^\s*\{[^}\n]*hanzi:\s*"([^"]+)"[^}\n]*hskLevel:\s*'(HSK [123])'/gm)];
for (const [level, expectedCount] of [['HSK 1', 150], ['HSK 2', 150], ['HSK 3', 298]]) {
  const levelEntries = classicEntries.filter(([, , entryLevel]) => entryLevel === level);
  assert.equal(levelEntries.length, expectedCount, `classic ${level} corpus should contain ${expectedCount} entries`);
  for (const [, hanzi] of levelEntries) {
    const meaning = meanings.get(hanzi);
    assert.ok(meaning && meaning.trim().length > 0, `${level} word ${hanzi} should have a Vietnamese meaning`);
  }
}
assert.ok(entries.length >= 945, 'Vietnamese glossary should retain and expand its HSK coverage');
const hsk4Entries = [...classicVocabularySource.matchAll(/^\s*\{[^}\n]*hanzi:\s*"([^"]+)"[^}\n]*hskLevel:\s*'HSK 4'/gm)];
assert.equal(hsk4Entries.length, 601, 'classic HSK 4 corpus should contain 601 entries');
for (const hanzi of ["爱情","暗","按时","按照","包括","保证","抱","抱歉","报名","倍","本来","笨","毕业","遍","标准","表达","表格","表扬","饼干","并且","博士","不得不","不管","不仅","部分","擦","猜","材料","参观","尝","长城","长江","场","超过","吵","成熟","成为","诚实","乘坐","吃惊","重新","抽烟","出差","出发","出生","传真","窗户","从来","粗心","答案","打扮","打扰","打印","打折","打针","大使馆","大约","戴","代表","代替","大夫","当","当地","当时","刀","导游","到处","到底","道歉","得意","等（动）","等（助）","底","地球","掉","丢","动作","堵车","肚子","断","对（形）","对（介）","对话","对面","顿","朵","而","儿童","发","发生","法律","翻译","烦恼","反对","反映","范围","方面","访问","放弃","放暑假","份","丰富","符合","富","父亲","复印","复杂","改变","干杯","干燥","感动","感觉","感情","感谢","干","刚刚","高级","各","公里","工具","共同","够","购物","孤单","估计","鼓励","鼓掌","顾客","故意","挂","关键","观众","管理","光","广播","广告","逛","规定","国际","果然","过（动）","过（助）","过程","海洋","害羞","寒假","汗","航班","好处","好像","号码","合格","合适","盒子","猴子","厚","后悔","后来","忽然","护士","互相","怀疑","回忆","活动","活泼","火","获得","基础","激动","积极","积累","极其","集合","及时","即使","寄","记者","既然","家具","加班","加油站","假","坚持","减肥","将来","奖金","降低","交","交流","骄傲","饺子","教授","解释","尽管","紧张","进行","禁止","精彩","精神","经历","京剧"]) {
  const meaning = meanings.get(hanzi);
  assert.ok(meaning && meaning.trim().length > 0, `HSK 4 word ${hanzi} should have a Vietnamese meaning`);
}

assert.equal(meanings.size, entries.length, 'glossary keys must be unique to avoid silent overrides');
for (const hanzi of ['爱', '高兴', '工作', '叫', '零', '没', '日', '时间', '早上', '他们', '她们', '也', '一点儿', '哪（哪儿）', '那（那儿）', '吧', '白', '百', '帮助', '报纸', '比', '别', '长', '唱歌', '出', '穿', '船', '次', '从', '错', '打篮球', '大家', '到', '得', '等', '弟弟', '第一', '懂', '非常', '服务员', '高', '告诉', '哥哥', '给', '公斤', '公司', '过', '孩子', '好吃', '号', '黑', '红', '欢迎', '回答', '鸡蛋', '件', '教室', '姐姐', '介绍', '进', '近', '就', '觉得', '咖啡', '考试', '可以', '课', '快', '快乐', '累', '两', '路', '旅游', '卖', '慢', '忙', '妹妹', '门', '男人', '您', '啊', '半', '表示', '表演', '宾馆', '才', '出现', '厨房', '词语', '地', '低', '东', '放', '分', '敢', '关', '果汁', '花（动）', '花园', '黄', '极', '记得', '季节', '检查', '简单', '健康', '见面', '讲', '教', '角', '脚', '接', '街道', '结婚', '节目', '节日', '借', '经常', '经过', '久', '旧', '举行', '句子', '渴', '可爱', '刻', '客人', '空调', '口', '哭', '裤子', '筷子', '蓝', '老', '离开', '礼物', '脸', '辆', '了解', '邻居', '楼', '绿', '马', '马上', '满意', '帽子', '米', '面包', '面条', '明白', '拿', '奶奶', '南', '难', '难过', '年级', '年轻', '鸟', '爬山', '盘子', '胖', '啤酒', '葡萄', '普通话', '其他', '骑', '奇怪', '铅笔', '秋', '裙子', '然后', '热情', '认为', '伞', '上网', '生气', '声音', '使', '世界', '瘦', '树', '数学', '刷牙', '双', '水平', '司机', '太阳', '疼', '体育', '甜', '条', '头发', '图书馆', '腿', '碗', '万', '为', '为了', '位', '西', '洗手间', '相信', '香蕉', '向', '像', '小心', '校长', '新鲜', '信用卡', '行李箱', '熊猫', '爷爷', '一般', '一边', '一直', '音乐', '银行', '饮料', '用', '游戏', '有名', '又', '遇到', '愿意', '月亮', '越', '站', '张', '着急', '照顾', '照片', '照相机', '只', '中间', '主要', '注意', '自己', '自行车', '总是', '最近', '作业', '作用', '阿姨', '矮', '爱好', '安静', '办法', '办公室', '帮忙', '饱', '北方', '被', '鼻子', '比较', '比赛', '必须', '变化', '别人', '冰箱', '菜单', '参加', '超市', '成绩', '城市', '迟到', '除了', '词典', '聪明', '打扫', '打算', '担心', '蛋糕', '当然', '地方', '地铁', '地图', '电子邮件', '动物', '锻炼', '饿', '发烧', '发现', '方便', '附近', '复习', '干净', '感冒', '感兴趣', '刚才', '根据', '附近', '公园', '故事', '害怕', '黑板', '护照', '环境', '换', '会议', '几乎']) {
  const meaning = meanings.get(hanzi);
  assert.ok(meaning && meaning.trim().length > 0, hanzi + ' should have a Vietnamese meaning');
  assert.ok(!meaning.includes('đang được bổ sung'), hanzi + ' must not use the missing-meaning placeholder');
}
assert.match(appContext, /HSK_VI_MEANINGS\[vocab\.hanzi\]/, 'app vocabulary enrichment should use the Vietnamese glossary');
assert.match(flashcard, /vocabulary\.vietnamese/, 'flashcard answer side should display the Vietnamese meaning');
assert.match(flashcard, /exampleSentence\.vietnamese/, 'flashcard should display Vietnamese example translations when available');

console.log('HSK Vietnamese glossary and flashcard tests passed');
