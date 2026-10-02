import { StructuredVocabulary } from '../types/learning';

const v = (id:string, hanzi:string, pinyin:string, pinyinNumbered:string, vietnamese:string, partOfSpeech:string, exampleChinese:string, examplePinyin:string, exampleVietnamese:string, category:string, difficulty:1|2|3=1):StructuredVocabulary => ({
  id, hanzi, pinyin, pinyinNumbered, vietnamese, partOfSpeech, exampleChinese, examplePinyin, exampleVietnamese,
  hskLevel:'HSK 1', category, difficulty
});

export const HSK1_VOCABULARY: StructuredVocabulary[] = [
v('h1-v01','你好','nǐ hǎo','ni3 hao3','xin chào','cụm từ','你好！','Nǐ hǎo!','Xin chào!','chào hỏi'),
v('h1-v02','叫','jiào','jiao4','gọi là / tên là','động từ','我叫小明。','Wǒ jiào Xiǎomíng.','Tôi tên là Tiểu Minh.','giới thiệu'),
v('h1-v03','什么','shénme','shen2 me','gì / cái gì','đại từ nghi vấn','你叫什么名字？','Nǐ jiào shénme míngzi?','Bạn tên là gì?','giới thiệu'),
v('h1-v04','名字','míngzi','ming2 zi','tên','danh từ','我的名字是安娜。','Wǒ de míngzi shì Ānnà.','Tên tôi là Anna.','giới thiệu'),
v('h1-v05','学生','xuéshēng','xue2 sheng1','học sinh / sinh viên','danh từ','我是学生。','Wǒ shì xuéshēng.','Tôi là học sinh.','giới thiệu'),
v('h1-v06','一','yī','yi1','một','số từ','一个人。','Yí ge rén.','Một người.','số đếm'),
v('h1-v07','两','liǎng','liang3','hai (trước lượng từ)','số từ','两个人。','Liǎng ge rén.','Hai người.','số đếm'),
v('h1-v08','三','sān','san1','ba','số từ','三个人。','Sān ge rén.','Ba người.','số đếm'),
v('h1-v09','十','shí','shi2','mười','số từ','十个人。','Shí ge rén.','Mười người.','số đếm'),
v('h1-v10','几','jǐ','ji3','mấy / bao nhiêu','đại từ nghi vấn','你有几个？','Nǐ yǒu jǐ ge?','Bạn có mấy cái?','số đếm'),
v('h1-v11','家','jiā','jia1','nhà / gia đình','danh từ','我家有四个人。','Wǒ jiā yǒu sì ge rén.','Nhà tôi có bốn người.','gia đình'),
v('h1-v12','妈妈','māma','ma1 ma','mẹ','danh từ','我妈妈很好。','Wǒ māma hěn hǎo.','Mẹ tôi rất tốt.','gia đình'),
v('h1-v13','爸爸','bàba','ba4 ba','bố / ba','danh từ','我爸爸是老师。','Wǒ bàba shì lǎoshī.','Bố tôi là giáo viên.','gia đình'),
v('h1-v14','哥哥','gēge','ge1 ge','anh trai','danh từ','我有一个哥哥。','Wǒ yǒu yí ge gēge.','Tôi có một anh trai.','gia đình'),
v('h1-v15','妹妹','mèimei','mei4 mei','em gái','danh từ','我妹妹很可爱。','Wǒ mèimei hěn kě’ài.','Em gái tôi rất đáng yêu.','gia đình'),
v('h1-v16','吃','chī','chi1','ăn','động từ','我喜欢吃米饭。','Wǒ xǐhuan chī mǐfàn.','Tôi thích ăn cơm.','đồ ăn'),
v('h1-v17','饭','fàn','fan4','cơm / bữa ăn','danh từ','我吃饭。','Wǒ chīfàn.','Tôi ăn cơm.','đồ ăn'),
v('h1-v18','面包','miànbāo','mian4 bao1','bánh mì','danh từ','我喜欢面包。','Wǒ xǐhuan miànbāo.','Tôi thích bánh mì.','đồ ăn'),
v('h1-v19','水饺','shuǐjiǎo','shui3 jiao3','bánh chẻo / sủi cảo','danh từ','我想吃水饺。','Wǒ xiǎng chī shuǐjiǎo.','Tôi muốn ăn sủi cảo.','đồ ăn'),
v('h1-v20','苹果','píngguǒ','ping2 guo3','táo','danh từ','我喜欢吃苹果。','Wǒ xǐhuan chī píngguǒ.','Tôi thích ăn táo.','đồ ăn'),
v('h1-v21','喝','hē','he1','uống','động từ','我喝水。','Wǒ hē shuǐ.','Tôi uống nước.','đồ uống'),
v('h1-v22','水','shuǐ','shui3','nước','danh từ','请给我水。','Qǐng gěi wǒ shuǐ.','Làm ơn cho tôi nước.','đồ uống'),
v('h1-v23','茶','chá','cha2','trà','danh từ','我喝茶。','Wǒ hē chá.','Tôi uống trà.','đồ uống'),
v('h1-v24','咖啡','kāfēi','ka1 fei1','cà phê','danh từ','我喜欢喝咖啡。','Wǒ xǐhuan hē kāfēi.','Tôi thích uống cà phê.','đồ uống'),
v('h1-v25','牛奶','niúnǎi','niu2 nai3','sữa','danh từ','早上我喝牛奶。','Zǎoshang wǒ hē niúnǎi.','Buổi sáng tôi uống sữa.','đồ uống'),
v('h1-v26','买','mǎi','mai3','mua','động từ','我想买苹果。','Wǒ xiǎng mǎi píngguǒ.','Tôi muốn mua táo.','mua sắm'),
v('h1-v27','多少','duōshao','duo1 shao3','bao nhiêu','đại từ nghi vấn','多少钱？','Duōshao qián?','Bao nhiêu tiền?','mua sắm'),
v('h1-v28','钱','qián','qian2','tiền','danh từ','多少钱？','Duōshao qián?','Bao nhiêu tiền?','mua sắm'),
v('h1-v29','给','gěi','gei3','cho / đưa','động từ','请给我一个。','Qǐng gěi wǒ yí ge.','Làm ơn đưa tôi một cái.','mua sắm'),
v('h1-v30','店','diàn','dian4','cửa hàng','danh từ','这家店很大。','Zhè jiā diàn hěn dà.','Cửa hàng này rất lớn.','mua sắm'),
v('h1-v31','做','zuò','zuo4','làm','động từ','我做作业。','Wǒ zuò zuòyè.','Tôi làm bài tập.','hàng ngày'),
v('h1-v32','作业','zuòyè','zuo4 ye4','bài tập','danh từ','我晚上做作业。','Wǒ wǎnshang zuò zuòyè.','Buổi tối tôi làm bài tập.','hàng ngày'),
v('h1-v33','睡觉','shuìjiào','shui4 jiao4','ngủ','động từ','我晚上十点睡觉。','Wǒ wǎnshang shí diǎn shuìjiào.','Tôi ngủ lúc 10 giờ tối.','hàng ngày'),
v('h1-v34','学习','xuéxí','xue2 xi2','học tập','động từ','我学习中文。','Wǒ xuéxí Zhōngwén.','Tôi học tiếng Trung.','hàng ngày'),
v('h1-v35','工作','gōngzuò','gong1 zuo4','làm việc / công việc','động từ / danh từ','我在这里工作。','Wǒ zài zhèlǐ gōngzuò.','Tôi làm việc ở đây.','hàng ngày'),
v('h1-v36','今天','jīntiān','jin1 tian1','hôm nay','danh từ thời gian','今天是星期一。','Jīntiān shì xīngqī yī.','Hôm nay là thứ Hai.','thời gian'),
v('h1-v37','明天','míngtiān','ming2 tian1','ngày mai','danh từ thời gian','明天见。','Míngtiān jiàn.','Hẹn gặp ngày mai.','thời gian'),
v('h1-v38','点','diǎn','dian3','giờ (đồng hồ)','lượng từ thời gian','现在三点。','Xiànzài sān diǎn.','Bây giờ là 3 giờ.','thời gian'),
v('h1-v39','现在','xiànzài','xian4 zai4','bây giờ','danh từ thời gian','你现在忙吗？','Nǐ xiànzài máng ma?','Bây giờ bạn có bận không?','thời gian'),
v('h1-v40','年','nián','nian2','năm','danh từ thời gian','今年是二〇二六年。','Jīnnián shì èr líng èr liù nián.','Năm nay là 2026.','thời gian'),
v('h1-v41','吗','ma','ma5','trợ từ nghi vấn','trợ từ','你好吗？','Nǐ hǎo ma?','Bạn khỏe không?','câu hỏi'),
v('h1-v42','呢','ne','ne5','thì sao / còn...','trợ từ','你呢？','Nǐ ne?','Còn bạn thì sao?','câu hỏi'),
v('h1-v43','谁','shéi','shei2','ai','đại từ nghi vấn','他是谁？','Tā shì shéi?','Anh ấy là ai?','câu hỏi'),
v('h1-v44','哪里','nǎlǐ','na3 li3','ở đâu','đại từ nghi vấn','你住在哪里？','Nǐ zhù zài nǎlǐ?','Bạn sống ở đâu?','câu hỏi'),
v('h1-v45','怎么','zěnme','zen3 me','thế nào / bằng cách nào','đại từ nghi vấn','你怎么去学校？','Nǐ zěnme qù xuéxiào?','Bạn đi đến trường bằng cách nào?','câu hỏi')
];

export const getHSK1Vocabulary = (ids: string[]) => HSK1_VOCABULARY.filter(item => ids.includes(item.id));
