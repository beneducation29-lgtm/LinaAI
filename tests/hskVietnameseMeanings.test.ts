import assert from 'node:assert/strict';
import fs from 'node:fs';

const glossarySource = fs.readFileSync('src/data/hskVietnameseMeanings.ts', 'utf8');
const appContext = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
const flashcard = fs.readFileSync('src/components/flashcard/Flashcard.tsx', 'utf8');
const entries = [...glossarySource.matchAll(/'([^']+)'\s*:\s*'([^']*)'/g)];
const meanings = new Map(entries.map(([, hanzi, meaning]) => [hanzi, meaning]));

assert.ok(entries.length >= 490, 'Vietnamese glossary should retain and expand its HSK coverage');
assert.equal(meanings.size, entries.length, 'glossary keys must be unique to avoid silent overrides');
for (const hanzi of ['爱', '高兴', '工作', '叫', '零', '没', '日', '时间', '早上', '他们', '她们', '也', '一点儿', '哪（哪儿）', '那（那儿）', '吧', '白', '百', '帮助', '报纸', '比', '别', '长', '唱歌', '出', '穿', '船', '次', '从', '错', '打篮球', '大家', '到', '得', '等', '弟弟', '第一', '懂', '非常', '服务员', '高', '告诉', '哥哥', '给', '公斤', '公司', '过', '孩子', '好吃', '号', '黑', '红', '欢迎', '回答', '鸡蛋', '件', '教室', '姐姐', '介绍', '进', '近', '就', '觉得', '咖啡', '考试', '可以', '课', '快', '快乐', '累', '两', '路', '旅游', '卖', '慢', '忙', '妹妹', '门', '男人', '您', '阿姨', '矮', '爱好', '安静', '办法', '办公室', '帮忙', '饱', '北方', '被', '鼻子', '比较', '比赛', '必须', '变化', '别人', '冰箱', '菜单', '参加', '超市', '成绩', '城市', '迟到', '除了', '词典', '聪明', '打扫', '打算', '担心', '蛋糕', '当然', '地方', '地铁', '地图', '电子邮件', '动物', '锻炼', '饿', '发烧', '发现', '方便', '附近', '复习', '干净', '感冒', '感兴趣', '刚才', '根据', '附近', '公园', '故事', '害怕', '黑板', '护照', '环境', '换', '会议', '几乎']) {
  const meaning = meanings.get(hanzi);
  assert.ok(meaning && meaning.trim().length > 0, hanzi + ' should have a Vietnamese meaning');
  assert.ok(!meaning.includes('đang được bổ sung'), hanzi + ' must not use the missing-meaning placeholder');
}
assert.match(appContext, /HSK_VI_MEANINGS\[vocab\.hanzi\]/, 'app vocabulary enrichment should use the Vietnamese glossary');
assert.match(flashcard, /vocabulary\.vietnamese/, 'flashcard answer side should display the Vietnamese meaning');
assert.match(flashcard, /exampleSentence\.vietnamese/, 'flashcard should display Vietnamese example translations when available');

console.log('HSK Vietnamese glossary and flashcard tests passed');
