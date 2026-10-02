import { StructuredLesson, GrammarRecord, StructuredSentence, ReviewItem, SpeakingExercise, RoleplayScenario } from '../types/learning';
import { HSK1_VOCABULARY } from './hsk1Structured';

const V = Object.fromEntries(HSK1_VOCABULARY.map(v => [v.id, v]));
const S = (id:string,chinese:string,pinyin:string,vietnamese:string):StructuredSentence => ({id,chinese,pinyin,vietnamese});
const G = (id:string,pattern:string,meaning:string,explanationVi:string,examples:StructuredSentence[],commonMistakes:string[],practiceQuestions:string[]):GrammarRecord => ({
  id,pattern,meaning,explanationVi,examples,commonMistakes,practiceQuestions
});
const R = (prefix:string, ids:string[]):ReviewItem[] => {
  const a=ids.map(id=>V[id]);
  return [
    {id:prefix+'-zhvi',type:'zh-to-vi',prompt:a[0].hanzi,answer:a[0].vietnamese,vocabularyId:a[0].id},
    {id:prefix+'-vizh',type:'vi-to-zh',prompt:a[1].vietnamese,answer:a[1].hanzi,vocabularyId:a[1].id},
    {id:prefix+'-pyzh',type:'pinyin-to-zh',prompt:a[2].pinyin,answer:a[2].hanzi,vocabularyId:a[2].id},
    {id:prefix+'-audio',type:'audio-to-meaning',prompt:'Nghe câu mẫu và chọn nghĩa',answer:a[3].vietnamese,sentence:S(prefix+'-s',a[3].exampleChinese,a[3].examplePinyin,a[3].exampleVietnamese),vocabularyId:a[3].id},
    {id:prefix+'-fill',type:'fill-blank',prompt:a[4].exampleChinese.replace(a[4].hanzi,'____'),answer:a[4].hanzi,vocabularyId:a[4].id}
  ];
};
const P = (id:string,prompt:StructuredSentence,expectedMeaning:string,followUp:StructuredSentence):SpeakingExercise => ({id,prompt,expectedMeaning,followUp});
const RP = (id:string,title:string,situation:string,opening:StructuredSentence,ids:string[]):RoleplayScenario => ({
  id,title,situation,aiOpening:opening,targetVocabIds:ids,evaluationDimensions:['meaning','grammar','vocabulary','naturalness','pronunciation']
});

const gMa=G('h1-g-ma','主语 + 谓语 + 吗？','Câu hỏi có/không','吗 đặt cuối câu trần thuật để tạo câu hỏi có/không.',
  [S('gm1','你是学生吗？','Nǐ shì xuéshēng ma?','Bạn là học sinh phải không?')],
  ['Không đặt 吗 ở giữa câu.'],['你是学生吗？','你喝茶吗？']);
const gShi=G('h1-g-shi','A 是 B','A là B','是 nối chủ ngữ với danh từ hoặc cụm danh từ làm vị ngữ.',
  [S('gs1','我是越南人。','Wǒ shì Yuènán rén.','Tôi là người Việt Nam.')],
  ['Không dùng 是 trước tính từ đơn giản như 很好.'],['我是学生。','他是学生吗？']);
const gYou=G('h1-g-you','有 + số lượng','Có / sở hữu','有 diễn tả có hoặc sở hữu; số lượng thường đứng sau 有.',
  [S('gy1','我家有四个人。','Wǒ jiā yǒu sì ge rén.','Nhà tôi có bốn người.')],
  ['Không dùng 是 để diễn đạt “có”.'],['你家有几个人？']);
const gXiang=G('h1-g-xiang','想 + Verb','Muốn làm gì','想 đứng trước động từ để diễn đạt mong muốn hoặc ý định.',
  [S('gx1','我想喝水。','Wǒ xiǎng hē shuǐ.','Tôi muốn uống nước.')],
  ['Không chèn 的 giữa 想 và động từ.'],['你想吃什么？']);
const gTime=G('h1-g-time','Thời gian + chủ ngữ + động từ','Nói về thời điểm','Cụm thời gian thường đứng trước động từ; có thể đặt sau chủ ngữ.',
  [S('gt1','我晚上十点睡觉。','Wǒ wǎnshang shí diǎn shuìjiào.','Tôi ngủ lúc 10 giờ tối.')],
  ['Giữ cụm thời gian trước động từ trong câu cơ bản.'],['你几点睡觉？']);

const make=(n:number,titleVi:string,titleZh:string,py:string,objective:string,ids:string[],grammar:GrammarRecord[],dialogue:StructuredSentence[],listening:StructuredSentence[],prompt:StructuredSentence,expected:string,follow:StructuredSentence,roleTitle:string,roleSituation:string,opening:StructuredSentence):StructuredLesson => ({
  id:'hsk1-lesson-'+n,hskLevel:'HSK 1',lessonNumber:n,titleVi,titleZh,pinyin:py,objective,estimatedMinutes:10,
  vocabulary:ids.map(id=>V[id]),grammar,dialogue,listening,
  speaking:[P('l'+n+'-sp',prompt,expected,follow)],
  roleplay:RP('l'+n+'-rp',roleTitle,roleSituation,opening,ids),
  review:R('l'+n,ids)
});

export const HSK1_LESSONS: StructuredLesson[] = [
make(1,'Chào hỏi','问候','Wènhòu','Biết chào hỏi và bắt đầu một cuộc gặp.',
['h1-v01','h1-v02','h1-v03','h1-v04','h1-v05'],[gShi,gMa],
[S('l1d1','你好！','Nǐ hǎo!','Xin chào!'),S('l1d2','你叫什么名字？','Nǐ jiào shénme míngzi?','Bạn tên là gì?'),S('l1d3','我叫小明。','Wǒ jiào Xiǎomíng.','Tôi tên là Tiểu Minh.')],
[S('l1l1','你好！','Nǐ hǎo!','Xin chào!'),S('l1l2','你好吗？','Nǐ hǎo ma?','Bạn khỏe không?')],
S('l1p','你叫什么名字？','Nǐ jiào shénme míngzi?','Bạn tên là gì?'),'Nói tên của bạn.',S('l1f','我叫……。','Wǒ jiào…','Tôi tên là…'),
'Gặp người bạn mới','Bạn gặp một người bạn mới.',S('l1r','你好！你叫什么名字？','Nǐ hǎo! Nǐ jiào shénme míngzi?','Xin chào! Bạn tên là gì?')),
make(2,'Tự giới thiệu','自我介绍','Zìwǒ jièshào','Giới thiệu tên và thân phận cơ bản.',
['h1-v02','h1-v04','h1-v05','h1-v11','h1-v01'],[gShi,gMa],
[S('l2d1','我叫安娜。','Wǒ jiào Ānnà.','Tôi tên là Anna.'),S('l2d2','我是学生。','Wǒ shì xuéshēng.','Tôi là học sinh.'),S('l2d3','你呢？','Nǐ ne?','Còn bạn thì sao?')],
[S('l2l1','我是学生。','Wǒ shì xuéshēng.','Tôi là học sinh.'),S('l2l2','你呢？','Nǐ ne?','Còn bạn thì sao?')],
S('l2p','你是学生吗？','Nǐ shì xuéshēng ma?','Bạn là học sinh phải không?'),'Trả lời có hoặc không và giới thiệu ngắn.',S('l2f','我是学生。','Wǒ shì xuéshēng.','Tôi là học sinh.'),
'Làm quen','Hai người tự giới thiệu trong lớp học.',S('l2r','你好！你叫什么名字？','Nǐ hǎo! Nǐ jiào shénme míngzi?','Xin chào! Bạn tên là gì?')),
make(3,'Số đếm','数字','Shùzì','Đếm số cơ bản và hỏi số lượng.',
['h1-v06','h1-v07','h1-v08','h1-v09','h1-v10'],[gYou],
[S('l3d1','一个人。','Yí ge rén.','Một người.'),S('l3d2','两个人。','Liǎng ge rén.','Hai người.'),S('l3d3','你有几个？','Nǐ yǒu jǐ ge?','Bạn có mấy cái?')],
[S('l3l1','三个人。','Sān ge rén.','Ba người.'),S('l3l2','十个人。','Shí ge rén.','Mười người.')],
S('l3p','你有几个？','Nǐ yǒu jǐ ge?','Bạn có mấy cái?'),'Trả lời bằng số lượng đơn giản.',S('l3f','我有三个。','Wǒ yǒu sān ge.','Tôi có ba cái.'),
'Đếm đồ vật','Bạn và Lina kiểm tra số lượng đồ vật.',S('l3r','这里有几个？','Zhèlǐ yǒu jǐ ge?','Ở đây có mấy cái?')),
make(4,'Gia đình','家庭','Jiātíng','Nói về các thành viên gia đình.',
['h1-v11','h1-v12','h1-v13','h1-v14','h1-v15'],[gYou],
[S('l4d1','我家有四个人。','Wǒ jiā yǒu sì ge rén.','Nhà tôi có bốn người.'),S('l4d2','我妈妈很好。','Wǒ māma hěn hǎo.','Mẹ tôi rất tốt.'),S('l4d3','我有一个哥哥。','Wǒ yǒu yí ge gēge.','Tôi có một anh trai.')],
[S('l4l1','我爸爸是老师。','Wǒ bàba shì lǎoshī.','Bố tôi là giáo viên.'),S('l4l2','我有一个妹妹。','Wǒ yǒu yí ge mèimei.','Tôi có một em gái.')],
S('l4p','你家有几个人？','Nǐ jiā yǒu jǐ ge rén?','Nhà bạn có mấy người?'),'Nói số thành viên gia đình.',S('l4f','我家有四个人。','Wǒ jiā yǒu sì ge rén.','Nhà tôi có bốn người.'),
'Nói về gia đình','Lina hỏi về gia đình bạn.',S('l4r','你家有几个人？','Nǐ jiā yǒu jǐ ge rén?','Nhà bạn có mấy người?')),
make(5,'Đồ ăn','食物','Shíwù','Nói món ăn yêu thích và điều muốn ăn.',
['h1-v16','h1-v17','h1-v18','h1-v19','h1-v20'],[gXiang],
[S('l5d1','我喜欢吃米饭。','Wǒ xǐhuan chī mǐfàn.','Tôi thích ăn cơm.'),S('l5d2','我想吃水饺。','Wǒ xiǎng chī shuǐjiǎo.','Tôi muốn ăn sủi cảo.'),S('l5d3','你喜欢吃什么？','Nǐ xǐhuan chī shénme?','Bạn thích ăn gì?')],
[S('l5l1','我喜欢苹果。','Wǒ xǐhuan píngguǒ.','Tôi thích táo.'),S('l5l2','我想吃面包。','Wǒ xiǎng chī miànbāo.','Tôi muốn ăn bánh mì.')],
S('l5p','你喜欢吃什么？','Nǐ xǐhuan chī shénme?','Bạn thích ăn gì?'),'Nói một món bạn thích.',S('l5f','我喜欢吃苹果。','Wǒ xǐhuan chī píngguǒ.','Tôi thích ăn táo.'),
'Chọn món ăn','Bạn đang chọn món với bạn.',S('l5r','你想吃什么？','Nǐ xiǎng chī shénme?','Bạn muốn ăn gì?')),
make(6,'Đồ uống','饮料','Yǐnliào','Gọi và nói về đồ uống quen thuộc.',
['h1-v21','h1-v22','h1-v23','h1-v24','h1-v25'],[gXiang,gMa],
[S('l6d1','我喝水。','Wǒ hē shuǐ.','Tôi uống nước.'),S('l6d2','我喜欢喝咖啡。','Wǒ xǐhuan hē kāfēi.','Tôi thích uống cà phê.'),S('l6d3','你喝茶吗？','Nǐ hē chá ma?','Bạn uống trà không?')],
[S('l6l1','我早上喝牛奶。','Wǒ zǎoshang hē niúnǎi.','Buổi sáng tôi uống sữa.'),S('l6l2','请给我水。','Qǐng gěi wǒ shuǐ.','Làm ơn cho tôi nước.')],
S('l6p','你喝什么？','Nǐ hē shénme?','Bạn uống gì?'),'Gọi một đồ uống.',S('l6f','我喝茶。','Wǒ hē chá.','Tôi uống trà.'),
'Gọi đồ uống','Bạn gọi đồ uống tại quán.',S('l6r','您好，您喝什么？','Nín hǎo, nín hē shénme?','Xin chào, bạn muốn uống gì?')),
make(7,'Mua sắm','买东西','Mǎi dōngxi','Hỏi giá và mua một món đơn giản.',
['h1-v26','h1-v27','h1-v28','h1-v29','h1-v30'],[gXiang],
[S('l7d1','我想买苹果。','Wǒ xiǎng mǎi píngguǒ.','Tôi muốn mua táo.'),S('l7d2','多少钱？','Duōshao qián?','Bao nhiêu tiền?'),S('l7d3','请给我一个。','Qǐng gěi wǒ yí ge.','Làm ơn đưa tôi một cái.')],
[S('l7l1','这家店很大。','Zhè jiā diàn hěn dà.','Cửa hàng này rất lớn.'),S('l7l2','多少钱？','Duōshao qián?','Bao nhiêu tiền?')],
S('l7p','多少钱？','Duōshao qián?','Bao nhiêu tiền?'),'Hỏi giá một món đồ.',S('l7f','十块钱。','Shí kuài qián.','Mười đồng/nhân dân tệ.'),
'Mua đồ tại cửa hàng','Bạn muốn mua một món đồ.',S('l7r','您好，您想买什么？','Nín hǎo, nín xiǎng mǎi shénme?','Xin chào, bạn muốn mua gì?')),
make(8,'Thói quen hằng ngày','日常生活','Rìcháng shēnghuó','Mô tả một phần lịch sinh hoạt hằng ngày.',
['h1-v31','h1-v32','h1-v33','h1-v34','h1-v35'],[gTime],
[S('l8d1','我学习中文。','Wǒ xuéxí Zhōngwén.','Tôi học tiếng Trung.'),S('l8d2','我晚上做作业。','Wǒ wǎnshang zuò zuòyè.','Buổi tối tôi làm bài tập.'),S('l8d3','我晚上十点睡觉。','Wǒ wǎnshang shí diǎn shuìjiào.','Tôi ngủ lúc 10 giờ tối.')],
[S('l8l1','我在这里工作。','Wǒ zài zhèlǐ gōngzuò.','Tôi làm việc ở đây.'),S('l8l2','我做作业。','Wǒ zuò zuòyè.','Tôi làm bài tập.')],
S('l8p','你晚上几点睡觉？','Nǐ wǎnshang jǐ diǎn shuìjiào?','Buổi tối bạn ngủ lúc mấy giờ?'),'Nói giờ bạn đi ngủ.',S('l8f','我晚上十点睡觉。','Wǒ wǎnshang shí diǎn shuìjiào.','Tôi ngủ lúc 10 giờ tối.'),
'Một ngày của bạn','Lina hỏi về lịch sinh hoạt.',S('l8r','你晚上几点睡觉？','Nǐ wǎnshang jǐ diǎn shuìjiào?','Buổi tối bạn ngủ lúc mấy giờ?')),
make(9,'Thời gian và ngày tháng','时间和日期','Shíjiān hé rìqī','Hỏi và nói thời điểm cơ bản.',
['h1-v36','h1-v37','h1-v38','h1-v39','h1-v40'],[gTime],
[S('l9d1','今天是星期一。','Jīntiān shì xīngqī yī.','Hôm nay là thứ Hai.'),S('l9d2','现在三点。','Xiànzài sān diǎn.','Bây giờ là 3 giờ.'),S('l9d3','明天见。','Míngtiān jiàn.','Hẹn gặp ngày mai.')],
[S('l9l1','你现在忙吗？','Nǐ xiànzài máng ma?','Bây giờ bạn có bận không?'),S('l9l2','今年是二〇二六年。','Jīnnián shì èr líng èr liù nián.','Năm nay là 2026.')],
S('l9p','现在几点？','Xiànzài jǐ diǎn?','Bây giờ là mấy giờ?'),'Trả lời bằng giờ của bài tập.',S('l9f','现在三点。','Xiànzài sān diǎn.','Bây giờ là 3 giờ.'),
'Hẹn gặp','Bạn và Lina thống nhất thời gian gặp.',S('l9r','明天几点见？','Míngtiān jǐ diǎn jiàn?','Ngày mai mấy giờ gặp?')),
make(10,'Câu hỏi đơn giản','简单问题','Jiǎndān wèntí','Dùng ai, ở đâu, thế nào và 吗/呢 để hỏi.',
['h1-v41','h1-v42','h1-v43','h1-v44','h1-v45'],[gMa],
[S('l10d1','你好吗？','Nǐ hǎo ma?','Bạn khỏe không?'),S('l10d2','你呢？','Nǐ ne?','Còn bạn thì sao?'),S('l10d3','你住在哪里？','Nǐ zhù zài nǎlǐ?','Bạn sống ở đâu?'),S('l10d4','你怎么去学校？','Nǐ zěnme qù xuéxiào?','Bạn đi đến trường bằng cách nào?')],
[S('l10l1','他是谁？','Tā shì shéi?','Anh ấy là ai?'),S('l10l2','你住在哪里？','Nǐ zhù zài nǎlǐ?','Bạn sống ở đâu?')],
S('l10p','你住在哪里？','Nǐ zhù zài nǎlǐ?','Bạn sống ở đâu?'),'Nói nơi bạn sống.',S('l10f','我住在越南。','Wǒ zhù zài Yuènán.','Tôi sống ở Việt Nam.'),
'Hỏi đáp nhanh','Lina hỏi bạn vài câu cơ bản.',S('l10r','你好吗？你住在哪里？','Nǐ hǎo ma? Nǐ zhù zài nǎlǐ?','Bạn khỏe không? Bạn sống ở đâu?'))
];
