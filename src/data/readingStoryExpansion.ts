import type { ReadingChapter } from './readingStorySeries';

/** Original, classroom-friendly HSK 1 readings written for LinaAI. */
export const HSK1_EXPANSION_CHAPTERS: ReadingChapter[] = [
  {
    id: 'hsk1-kindness-01', title: 'Giúp đỡ bạn mới', titleZh: '帮助新朋友',
    sentences: [
      { chinese: '今天班里来了一个新同学。', pinyin: 'Jīntiān bān lǐ lái le yí ge xīn tóngxué.', vietnamese: 'Hôm nay lớp có một bạn học mới.' },
      { chinese: '他不知道教室在哪里。', pinyin: 'Tā bù zhīdào jiàoshì zài nǎlǐ.', vietnamese: 'Bạn ấy không biết phòng học ở đâu.' },
      { chinese: '我带他去教室，还和他一起吃午饭。', pinyin: 'Wǒ dài tā qù jiàoshì, hái hé tā yìqǐ chī wǔfàn.', vietnamese: 'Tôi dẫn bạn đến lớp và còn ăn trưa cùng bạn.' },
      { chinese: '下午我们成了好朋友。', pinyin: 'Xiàwǔ wǒmen chéng le hǎo péngyou.', vietnamese: 'Buổi chiều, chúng tôi đã trở thành bạn tốt.' }
    ],
    vocabulary: [
      { hanzi: '新同学', pinyin: 'xīn tóngxué', vietnamese: 'bạn học mới' },
      { hanzi: '教室', pinyin: 'jiàoshì', vietnamese: 'phòng học' },
      { hanzi: '带', pinyin: 'dài', vietnamese: 'dẫn; đưa' },
      { hanzi: '午饭', pinyin: 'wǔfàn', vietnamese: 'bữa trưa' },
      { hanzi: '朋友', pinyin: 'péngyou', vietnamese: 'bạn bè' }
    ],
    questions: [
      { question: '新同学不知道什么？', options: ['教室在哪里', '家在哪里', '饭在哪里'], answer: 0, explanation: '第二句说明新同学不知道教室在哪里。' },
      { question: '“我”和新同学后来怎么样？', options: ['不认识了', '成了好朋友', '一起回家了'], answer: 1, explanation: '最后一句说他们成了好朋友。' }
    ]
  },
  {
    id: 'hsk1-honesty-01', title: 'Chiếc ví trên đường', titleZh: '路上的钱包',
    sentences: [
      { chinese: '我和姐姐走路去商店。', pinyin: 'Wǒ hé jiějie zǒulù qù shāngdiàn.', vietnamese: 'Tôi và chị gái đi bộ đến cửa hàng.' },
      { chinese: '路上有一个小钱包。', pinyin: 'Lù shang yǒu yí ge xiǎo qiánbāo.', vietnamese: 'Trên đường có một chiếc ví nhỏ.' },
      { chinese: '姐姐把钱包交给商店的工作人员。', pinyin: 'Jiějie bǎ qiánbāo jiāo gěi shāngdiàn de gōngzuò rényuán.', vietnamese: 'Chị gái giao chiếc ví cho nhân viên cửa hàng.' },
      { chinese: '我们没有拿别人的东西，心里很高兴。', pinyin: 'Wǒmen méiyǒu ná biérén de dōngxi, xīn lǐ hěn gāoxìng.', vietnamese: 'Chúng tôi không lấy đồ của người khác nên trong lòng rất vui.' }
    ],
    vocabulary: [
      { hanzi: '走路', pinyin: 'zǒulù', vietnamese: 'đi bộ' },
      { hanzi: '商店', pinyin: 'shāngdiàn', vietnamese: 'cửa hàng' },
      { hanzi: '钱包', pinyin: 'qiánbāo', vietnamese: 'ví tiền' },
      { hanzi: '交给', pinyin: 'jiāo gěi', vietnamese: 'giao cho' },
      { hanzi: '东西', pinyin: 'dōngxi', vietnamese: 'đồ vật' }
    ],
    questions: [
      { question: '他们在路上看见了什么？', options: ['一本书', '一个钱包', '一把伞'], answer: 1, explanation: '第二句说路上有一个小钱包。' },
      { question: '姐姐怎么做？', options: ['把钱包交给工作人员', '把钱包带回家', '把钱包送给朋友'], answer: 0, explanation: '第三句说明姐姐把钱包交给工作人员。' }
    ]
  },
  {
    id: 'hsk1-reading-01', title: 'Mười phút đọc sách', titleZh: '每天读十分钟',
    sentences: [
      { chinese: '每天晚上，我睡觉以前读书。', pinyin: 'Měitiān wǎnshang, wǒ shuìjiào yǐqián dú shū.', vietnamese: 'Mỗi tối trước khi đi ngủ, tôi đọc sách.' },
      { chinese: '开始的时候，我只读十分钟。', pinyin: 'Kāishǐ de shíhou, wǒ zhǐ dú shí fēnzhōng.', vietnamese: 'Lúc mới bắt đầu, tôi chỉ đọc mười phút.' },
      { chinese: '现在我认识了很多新字，也知道了很多新事情。', pinyin: 'Xiànzài wǒ rènshi le hěn duō xīn zì, yě zhīdào le hěn duō xīn shìqing.', vietnamese: 'Bây giờ tôi biết thêm nhiều chữ mới và cũng hiểu thêm nhiều điều mới.' },
      { chinese: '我觉得每天进步一点儿很好。', pinyin: 'Wǒ juéde měitiān jìnbù yìdiǎnr hěn hǎo.', vietnamese: 'Tôi thấy mỗi ngày tiến bộ một chút là điều rất tốt.' }
    ],
    vocabulary: [
      { hanzi: '每天', pinyin: 'měitiān', vietnamese: 'mỗi ngày' },
      { hanzi: '以前', pinyin: 'yǐqián', vietnamese: 'trước đây; trước khi' },
      { hanzi: '开始', pinyin: 'kāishǐ', vietnamese: 'bắt đầu' },
      { hanzi: '认识', pinyin: 'rènshi', vietnamese: 'nhận biết; quen biết' },
      { hanzi: '进步', pinyin: 'jìnbù', vietnamese: 'tiến bộ' }
    ],
    questions: [
      { question: '“我”什么时候读书？', options: ['每天早上', '每天晚上睡觉以前', '每个星期日'], answer: 1, explanation: '第一句说明 thời gian đọc sách là buổi tối trước khi ngủ.' },
      { question: '“我”觉得怎么样？', options: ['每天进步一点儿很好', '读书没有用', '每天要读很多书'], answer: 0, explanation: '最后一句 nhấn mạnh tiến bộ từng chút mỗi ngày.' }
    ]
  },
  {
    id: 'hsk1-exercise-01', title: 'Cùng nhau vận động', titleZh: '一起运动',
    sentences: [
      { chinese: '星期六早上，天气很好。', pinyin: 'Xīngqīliù zǎoshang, tiānqì hěn hǎo.', vietnamese: 'Sáng thứ Bảy, thời tiết rất đẹp.' },
      { chinese: '我和朋友去公园跑步。', pinyin: 'Wǒ hé péngyou qù gōngyuán pǎobù.', vietnamese: 'Tôi và bạn đi công viên chạy bộ.' },
      { chinese: '我们跑得不快，但是一直在运动。', pinyin: 'Wǒmen pǎo de bú kuài, dànshì yìzhí zài yùndòng.', vietnamese: 'Chúng tôi chạy không nhanh nhưng vẫn vận động đều đặn.' },
      { chinese: '回家以后，我觉得身体很舒服。', pinyin: 'Huí jiā yǐhòu, wǒ juéde shēntǐ hěn shūfu.', vietnamese: 'Sau khi về nhà, tôi cảm thấy cơ thể rất dễ chịu.' }
    ],
    vocabulary: [
      { hanzi: '星期六', pinyin: 'xīngqīliù', vietnamese: 'thứ Bảy' },
      { hanzi: '天气', pinyin: 'tiānqì', vietnamese: 'thời tiết' },
      { hanzi: '公园', pinyin: 'gōngyuán', vietnamese: 'công viên' },
      { hanzi: '跑步', pinyin: 'pǎobù', vietnamese: 'chạy bộ' },
      { hanzi: '身体', pinyin: 'shēntǐ', vietnamese: 'cơ thể; sức khỏe' }
    ],
    questions: [
      { question: '他们星期六去哪里？', options: ['学校', '公园', '商店'], answer: 1, explanation: '第二句说他们去公园跑步。' },
      { question: '运动以后，“我”觉得怎么样？', options: ['身体很舒服', '很不高兴', '不想回家'], answer: 0, explanation: '最后一句说身体很舒服。' }
    ]
  },
  {
    id: 'hsk1-environment-01', title: 'Chăm sóc công viên', titleZh: '爱护公园',
    sentences: [
      { chinese: '我们家旁边有一个公园。', pinyin: 'Wǒmen jiā pángbiān yǒu yí ge gōngyuán.', vietnamese: 'Bên cạnh nhà chúng tôi có một công viên.' },
      { chinese: '每天有很多人在公园里走路。', pinyin: 'Měitiān yǒu hěn duō rén zài gōngyuán lǐ zǒulù.', vietnamese: 'Mỗi ngày có nhiều người đi bộ trong công viên.' },
      { chinese: '我看见地上有纸，就把它放进垃圾桶。', pinyin: 'Wǒ kànjiàn dì shang yǒu zhǐ, jiù bǎ tā fàng jìn lājītǒng.', vietnamese: 'Tôi thấy có giấy trên mặt đất nên nhặt bỏ vào thùng rác.' },
      { chinese: '大家一起爱护公园，公园会更漂亮。', pinyin: 'Dàjiā yìqǐ àihù gōngyuán, gōngyuán huì gèng piàoliang.', vietnamese: 'Mọi người cùng giữ gìn công viên thì công viên sẽ đẹp hơn.' }
    ],
    vocabulary: [
      { hanzi: '旁边', pinyin: 'pángbiān', vietnamese: 'bên cạnh' },
      { hanzi: '地上', pinyin: 'dì shang', vietnamese: 'trên mặt đất' },
      { hanzi: '纸', pinyin: 'zhǐ', vietnamese: 'giấy' },
      { hanzi: '垃圾桶', pinyin: 'lājītǒng', vietnamese: 'thùng rác' },
      { hanzi: '漂亮', pinyin: 'piàoliang', vietnamese: 'đẹp' }
    ],
    questions: [
      { question: '“我”把纸放在哪里？', options: ['桌子上', '垃圾桶里', '书包里'], answer: 1, explanation: '第三句说把纸放进垃圾桶。' },
      { question: '大家为什么一起爱护公园？', options: ['让公园更漂亮', '不想走路', '想买东西'], answer: 0, explanation: '最后一句说明公园会因此更漂亮。' }
    ]
  },
  {
    id: 'hsk1-sharing-01', title: 'Chia sẻ chiếc bánh', titleZh: '一起分享蛋糕',
    sentences: [
      { chinese: '今天是朋友的生日。', pinyin: 'Jīntiān shì péngyou de shēngrì.', vietnamese: 'Hôm nay là sinh nhật của bạn tôi.' },
      { chinese: '他带了一个大蛋糕来学校。', pinyin: 'Tā dài le yí ge dà dàngāo lái xuéxiào.', vietnamese: 'Bạn ấy mang một chiếc bánh lớn đến trường.' },
      { chinese: '我们把蛋糕分给班里的同学。', pinyin: 'Wǒmen bǎ dàngāo fēn gěi bān lǐ de tóngxué.', vietnamese: 'Chúng tôi chia bánh cho các bạn trong lớp.' },
      { chinese: '大家一起吃，一起唱歌，玩得很开心。', pinyin: 'Dàjiā yìqǐ chī, yìqǐ chànggē, wán de hěn kāixīn.', vietnamese: 'Mọi người cùng ăn, cùng hát và vui chơi rất vui vẻ.' }
    ],
    vocabulary: [
      { hanzi: '生日', pinyin: 'shēngrì', vietnamese: 'sinh nhật' },
      { hanzi: '蛋糕', pinyin: 'dàngāo', vietnamese: 'bánh kem' },
      { hanzi: '学校', pinyin: 'xuéxiào', vietnamese: 'trường học' },
      { hanzi: '分给', pinyin: 'fēn gěi', vietnamese: 'chia cho' },
      { hanzi: '唱歌', pinyin: 'chànggē', vietnamese: 'hát' }
    ],
    questions: [
      { question: '今天是谁的生日？', options: ['老师', '朋友', '妈妈'], answer: 1, explanation: '第一句说今天是朋友的生日。' },
      { question: '他们怎么做？', options: ['自己吃完蛋糕', '把蛋糕分给同学', '把蛋糕带回家'], answer: 1, explanation: '第三句说他们把蛋糕分给同学。' }
    ]
  },
  {
    id: 'hsk1-patience-01', title: 'Học đi xe đạp', titleZh: '学骑自行车',
    sentences: [
      { chinese: '我想学骑自行车。', pinyin: 'Wǒ xiǎng xué qí zìxíngchē.', vietnamese: 'Tôi muốn học đi xe đạp.' },
      { chinese: '第一天，我总是骑不好。', pinyin: 'Dì yī tiān, wǒ zǒngshì qí bù hǎo.', vietnamese: 'Ngày đầu tiên, tôi luôn đi chưa tốt.' },
      { chinese: '爸爸告诉我不要着急，多练习就会进步。', pinyin: 'Bàba gàosu wǒ bú yào zháojí, duō liànxí jiù huì jìnbù.', vietnamese: 'Bố bảo tôi đừng nóng vội, luyện tập nhiều sẽ tiến bộ.' },
      { chinese: '几天以后，我可以自己骑车了。', pinyin: 'Jǐ tiān yǐhòu, wǒ kěyǐ zìjǐ qí chē le.', vietnamese: 'Vài ngày sau, tôi đã có thể tự đi xe.' }
    ],
    vocabulary: [
      { hanzi: '自行车', pinyin: 'zìxíngchē', vietnamese: 'xe đạp' },
      { hanzi: '第一天', pinyin: 'dì yī tiān', vietnamese: 'ngày đầu tiên' },
      { hanzi: '着急', pinyin: 'zháojí', vietnamese: 'nóng vội; sốt ruột' },
      { hanzi: '练习', pinyin: 'liànxí', vietnamese: 'luyện tập' },
      { hanzi: '自己', pinyin: 'zìjǐ', vietnamese: 'bản thân; tự mình' }
    ],
    questions: [
      { question: '爸爸给“我”什么建议？', options: ['不要练习', '不要着急，多练习', '马上买新车'], answer: 1, explanation: '第三句中爸爸建议不要着急，多练习。' },
      { question: '几天以后，“我”怎么样了？', options: ['可以自己骑车了', '不想学了', '忘了自行车'], answer: 0, explanation: '最后一句说明“我”已经可以自己骑车。' }
    ]
  },
  {
    id: 'hsk1-gratitude-01', title: 'Một lời cảm ơn', titleZh: '一句谢谢',
    sentences: [
      { chinese: '今天下雨，我没有带伞。', pinyin: 'Jīntiān xiàyǔ, wǒ méiyǒu dài sǎn.', vietnamese: 'Hôm nay trời mưa, tôi không mang ô.' },
      { chinese: '同学看见了，就和我一起走。', pinyin: 'Tóngxué kànjiàn le, jiù hé wǒ yìqǐ zǒu.', vietnamese: 'Bạn học nhìn thấy vậy nên đi cùng tôi.' },
      { chinese: '他把伞放在我们两个人中间。', pinyin: 'Tā bǎ sǎn fàng zài wǒmen liǎng ge rén zhōngjiān.', vietnamese: 'Bạn ấy để chiếc ô ở giữa hai chúng tôi.' },
      { chinese: '我说谢谢，他笑着说不用谢。', pinyin: 'Wǒ shuō xièxie, tā xiàozhe shuō bú yòng xiè.', vietnamese: 'Tôi nói cảm ơn, bạn ấy mỉm cười và nói không cần khách sáo.' }
    ],
    vocabulary: [
      { hanzi: '下雨', pinyin: 'xiàyǔ', vietnamese: 'mưa' },
      { hanzi: '带伞', pinyin: 'dài sǎn', vietnamese: 'mang ô' },
      { hanzi: '同学', pinyin: 'tóngxué', vietnamese: 'bạn học' },
      { hanzi: '中间', pinyin: 'zhōngjiān', vietnamese: 'ở giữa' },
      { hanzi: '不用谢', pinyin: 'bú yòng xiè', vietnamese: 'không có gì; đừng khách sáo' }
    ],
    questions: [
      { question: '为什么“我”需要和同学一起走？', options: ['因为下雨而且没有带伞', '因为天很热', '因为要去商店'], answer: 0, explanation: '第一句说下雨了，“我”没有带伞。' },
      { question: '同学怎么回答？', options: ['对不起', '不用谢', '再见'], answer: 1, explanation: '最后一句说同学回答“不用谢”。' }
    ]
  },
  {
    id: 'hsk1-family-time-01', title: 'Một buổi chiều bên gia đình', titleZh: '和家人在一起',
    sentences: [
      { chinese: '星期天下午，我没有去学校。', pinyin: 'Xīngqītiān xiàwǔ, wǒ méiyǒu qù xuéxiào.', vietnamese: 'Chiều Chủ nhật, tôi không đến trường.' },
      { chinese: '我和爸爸妈妈在家里看照片。', pinyin: 'Wǒ hé bàba māma zài jiālǐ kàn zhàopiàn.', vietnamese: 'Tôi cùng bố mẹ xem ảnh ở nhà.' },
      { chinese: '照片里有爷爷奶奶，还有小时候的我。', pinyin: 'Zhàopiàn lǐ yǒu yéye nǎinai, hái yǒu xiǎoshíhou de wǒ.', vietnamese: 'Trong ảnh có ông bà và cả tôi lúc nhỏ.' },
      { chinese: '我们一边看一边说以前的事情。', pinyin: 'Wǒmen yìbiān kàn yìbiān shuō yǐqián de shìqing.', vietnamese: 'Chúng tôi vừa xem vừa kể chuyện ngày trước.' }
    ],
    vocabulary: [
      { hanzi: '星期天', pinyin: 'xīngqītiān', vietnamese: 'Chủ nhật' },
      { hanzi: '照片', pinyin: 'zhàopiàn', vietnamese: 'ảnh; bức ảnh' },
      { hanzi: '爷爷', pinyin: 'yéye', vietnamese: 'ông nội' },
      { hanzi: '奶奶', pinyin: 'nǎinai', vietnamese: 'bà nội' },
      { hanzi: '小时候', pinyin: 'xiǎoshíhou', vietnamese: 'lúc nhỏ' }
    ],
    questions: [
      { question: '星期天下午，“我”在哪里？', options: ['在学校', '在家里', '在公园'], answer: 1, explanation: '第二句说明他们在家里看照片。' },
      { question: '照片里有什么人？', options: ['爷爷奶奶和小时候的“我”', '老师和同学', '医生和护士'], answer: 0, explanation: '第三句列出了照片里的人。' }
    ]
  },
  {
    id: 'hsk1-help-at-home-01', title: 'Việc nhỏ trong nhà', titleZh: '我帮忙做家务',
    sentences: [
      { chinese: '星期六早上，妈妈要打扫房间。', pinyin: 'Xīngqīliù zǎoshang, māma yào dǎsǎo fángjiān.', vietnamese: 'Sáng thứ Bảy, mẹ muốn dọn dẹp phòng.' },
      { chinese: '我先把书放好，再擦桌子。', pinyin: 'Wǒ xiān bǎ shū fàng hǎo, zài cā zhuōzi.', vietnamese: 'Tôi cất sách gọn gàng trước rồi lau bàn.' },
      { chinese: '弟弟把玩具放进盒子里。', pinyin: 'Dìdi bǎ wánjù fàng jìn hézi lǐ.', vietnamese: 'Em trai bỏ đồ chơi vào trong hộp.' },
      { chinese: '房间干净了，我们都很高兴。', pinyin: 'Fángjiān gānjìng le, wǒmen dōu hěn gāoxìng.', vietnamese: 'Căn phòng đã sạch sẽ, mọi người đều rất vui.' }
    ],
    vocabulary: [
      { hanzi: '打扫', pinyin: 'dǎsǎo', vietnamese: 'dọn dẹp' },
      { hanzi: '房间', pinyin: 'fángjiān', vietnamese: 'căn phòng' },
      { hanzi: '先', pinyin: 'xiān', vietnamese: 'trước tiên' },
      { hanzi: '擦', pinyin: 'cā', vietnamese: 'lau; chùi' },
      { hanzi: '玩具', pinyin: 'wánjù', vietnamese: 'đồ chơi' },
      { hanzi: '干净', pinyin: 'gānjìng', vietnamese: 'sạch sẽ' }
    ],
    questions: [
      { question: '“我”先做什么？', options: ['擦桌子', '把书放好', '出去玩'], answer: 1, explanation: '第二句说先把书放好，再擦桌子。' },
      { question: '房间打扫以后怎么样？', options: ['很乱', '很干净', '没人回来'], answer: 1, explanation: '最后一句说房间干净了。' }
    ]
  },
  {
    id: 'hsk1-new-words-01', title: 'Mỗi ngày một từ mới', titleZh: '每天学一个新词',
    sentences: [
      { chinese: '老师让我们每天学一个新词。', pinyin: 'Lǎoshī ràng wǒmen měitiān xué yí ge xīn cí.', vietnamese: 'Giáo viên yêu cầu chúng tôi mỗi ngày học một từ mới.' },
      { chinese: '我把新词写在小本子上。', pinyin: 'Wǒ bǎ xīn cí xiě zài xiǎo běnzi shang.', vietnamese: 'Tôi viết từ mới vào cuốn sổ nhỏ.' },
      { chinese: '吃饭的时候，我也用新词说一句话。', pinyin: 'Chīfàn de shíhou, wǒ yě yòng xīn cí shuō yí jù huà.', vietnamese: 'Khi ăn cơm, tôi cũng dùng từ mới để nói một câu.' },
      { chinese: '这样学习很有意思，我想每天继续。', pinyin: 'Zhèyàng xuéxí hěn yǒu yìsi, wǒ xiǎng měitiān jìxù.', vietnamese: 'Học như vậy rất thú vị, tôi muốn tiếp tục mỗi ngày.' }
    ],
    vocabulary: [
      { hanzi: '老师', pinyin: 'lǎoshī', vietnamese: 'giáo viên' },
      { hanzi: '新词', pinyin: 'xīn cí', vietnamese: 'từ mới' },
      { hanzi: '写', pinyin: 'xiě', vietnamese: 'viết' },
      { hanzi: '本子', pinyin: 'běnzi', vietnamese: 'quyển vở; cuốn sổ' },
      { hanzi: '有意思', pinyin: 'yǒu yìsi', vietnamese: 'thú vị' },
      { hanzi: '继续', pinyin: 'jìxù', vietnamese: 'tiếp tục' }
    ],
    questions: [
      { question: '老师让学生每天学几个新词？', options: ['一个', '三个', '十个'], answer: 0, explanation: '第一句说每天学一个新词。' },
      { question: '“我”把新词写在哪里？', options: ['桌子上', '小本子上', '门上'], answer: 1, explanation: '第二句说写在小本子上。' }
    ]
  }
];
