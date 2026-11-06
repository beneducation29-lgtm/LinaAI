import type { HSKLevel } from '../types';

export interface StorySentence {
  chinese: string;
  pinyin: string;
  vietnamese: string;
}
export interface StoryWord {
  hanzi: string;
  pinyin: string;
  vietnamese: string;
}
export interface StoryQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}
export interface ReadingChapter {
  id: string;
  title: string;
  titleZh: string;
  sentences: StorySentence[];
  vocabulary: StoryWord[];
  questions: StoryQuestion[];
}
export interface ReadingStorySeries {
  id: string;
  title: string;
  titleZh: string;
  level: HSKLevel;
  topic: string;
  description: string;
  chapters: ReadingChapter[];
}

/** Original LinaAI graded stories. Pinyin and translations are aligned sentence by sentence. */
export const READING_STORY_SERIES: ReadingStorySeries[] = [
  {
    id: 'hsk1-family-dinner',
    title: 'Bữa tối lúc bảy giờ',
    titleZh: '七点的晚饭',
    level: 'HSK 1',
    topic: 'Gia đình · Ăn uống',
    description: 'Một buổi tối ở nhà: chuẩn bị bữa ăn, chờ người thân và cùng ăn tối.',
    chapters: [
      {
        id: 'hsk1-family-dinner-01',
        title: 'Hôm nay mẹ nấu ăn',
        titleZh: '今天妈妈做饭',
        sentences: [
          { chinese: '今天是星期五。', pinyin: 'Jīntiān shì xīngqīwǔ.', vietnamese: 'Hôm nay là thứ Sáu.' },
          { chinese: '晚上，妈妈在家做饭。', pinyin: 'Wǎnshang, māma zài jiā zuò fàn.', vietnamese: 'Buổi tối, mẹ nấu ăn ở nhà.' },
          { chinese: '我在厨房里看妈妈。', pinyin: 'Wǒ zài chúfáng lǐ kàn māma.', vietnamese: 'Tôi đứng trong bếp nhìn mẹ.' },
          { chinese: '妈妈说：“今天我们吃米饭和菜。”', pinyin: 'Māma shuō: “Jīntiān wǒmen chī mǐfàn hé cài.”', vietnamese: 'Mẹ nói: “Hôm nay chúng ta ăn cơm và rau.”' }
        ],
        vocabulary: [
          { hanzi: '今天', pinyin: 'jīntiān', vietnamese: 'hôm nay' },
          { hanzi: '星期五', pinyin: 'xīngqīwǔ', vietnamese: 'thứ Sáu' },
          { hanzi: '晚上', pinyin: 'wǎnshang', vietnamese: 'buổi tối' },
          { hanzi: '做饭', pinyin: 'zuò fàn', vietnamese: 'nấu ăn' },
          { hanzi: '厨房', pinyin: 'chúfáng', vietnamese: 'nhà bếp' },
          { hanzi: '米饭', pinyin: 'mǐfàn', vietnamese: 'cơm' },
          { hanzi: '菜', pinyin: 'cài', vietnamese: 'món ăn; rau' }
        ],
        questions: [
          { question: '今天是星期几？', options: ['星期三', '星期五', '星期日'], answer: 1, explanation: '第一句说：今天是星期五。' },
          { question: '谁在家做饭？', options: ['妈妈', '爸爸', '老师'], answer: 0, explanation: '第二句说：妈妈在家做饭。' }
        ]
      },
      {
        id: 'hsk1-family-dinner-02',
        title: 'Chờ bố về nhà',
        titleZh: '等爸爸回家',
        sentences: [
          { chinese: '现在是六点半。', pinyin: 'Xiànzài shì liù diǎn bàn.', vietnamese: 'Bây giờ là sáu giờ rưỡi.' },
          { chinese: '爸爸还没有回家。', pinyin: 'Bàba hái méiyǒu huí jiā.', vietnamese: 'Bố vẫn chưa về nhà.' },
          { chinese: '我给爸爸打电话。', pinyin: 'Wǒ gěi bàba dǎ diànhuà.', vietnamese: 'Tôi gọi điện cho bố.' },
          { chinese: '爸爸说：“我七点回家。”', pinyin: 'Bàba shuō: “Wǒ qī diǎn huí jiā.”', vietnamese: 'Bố nói: “Bố sẽ về nhà lúc bảy giờ.”' },
          { chinese: '妈妈和我一起等爸爸。', pinyin: 'Māma hé wǒ yìqǐ děng bàba.', vietnamese: 'Mẹ và tôi cùng chờ bố.' }
        ],
        vocabulary: [
          { hanzi: '现在', pinyin: 'xiànzài', vietnamese: 'bây giờ' },
          { hanzi: '六点半', pinyin: 'liù diǎn bàn', vietnamese: 'sáu giờ rưỡi' },
          { hanzi: '还', pinyin: 'hái', vietnamese: 'vẫn; còn' },
          { hanzi: '回家', pinyin: 'huí jiā', vietnamese: 'về nhà' },
          { hanzi: '打电话', pinyin: 'dǎ diànhuà', vietnamese: 'gọi điện thoại' },
          { hanzi: '一起', pinyin: 'yìqǐ', vietnamese: 'cùng nhau' },
          { hanzi: '等', pinyin: 'děng', vietnamese: 'đợi; chờ' }
        ],
        questions: [
          { question: '爸爸几点回家？', options: ['六点', '六点半', '七点'], answer: 2, explanation: '爸爸在电话里说七点回家。' },
          { question: '谁和“我”一起等爸爸？', options: ['妈妈', '姐姐', '老师'], answer: 0, explanation: '最后一句说：妈妈和我一起等爸爸。' }
        ]
      },
      {
        id: 'hsk1-family-dinner-03',
        title: 'Cả nhà cùng ăn tối',
        titleZh: '我们一起吃晚饭',
        sentences: [
          { chinese: '七点，爸爸回家了。', pinyin: 'Qī diǎn, bàba huí jiā le.', vietnamese: 'Bảy giờ, bố đã về nhà.' },
          { chinese: '我们坐在桌子旁边。', pinyin: 'Wǒmen zuò zài zhuōzi pángbiān.', vietnamese: 'Chúng tôi ngồi bên cạnh bàn.' },
          { chinese: '今天的饭很好吃。', pinyin: 'Jīntiān de fàn hěn hǎochī.', vietnamese: 'Bữa cơm hôm nay rất ngon.' },
          { chinese: '爸爸说：“谢谢你，妈妈！”', pinyin: 'Bàba shuō: “Xièxie nǐ, māma!”', vietnamese: 'Bố nói: “Cảm ơn mẹ!”' },
          { chinese: '我们都很高兴。', pinyin: 'Wǒmen dōu hěn gāoxìng.', vietnamese: 'Tất cả chúng tôi đều rất vui.' }
        ],
        vocabulary: [
          { hanzi: '七点', pinyin: 'qī diǎn', vietnamese: 'bảy giờ' },
          { hanzi: '坐', pinyin: 'zuò', vietnamese: 'ngồi' },
          { hanzi: '桌子', pinyin: 'zhuōzi', vietnamese: 'cái bàn' },
          { hanzi: '旁边', pinyin: 'pángbiān', vietnamese: 'bên cạnh' },
          { hanzi: '好吃', pinyin: 'hǎochī', vietnamese: 'ngon (đồ ăn)' },
          { hanzi: '谢谢', pinyin: 'xièxie', vietnamese: 'cảm ơn' },
          { hanzi: '高兴', pinyin: 'gāoxìng', vietnamese: 'vui vẻ' }
        ],
        questions: [
          { question: '爸爸什么时候回家？', options: ['六点', '七点', '八点'], answer: 1, explanation: '第一句说：七点，爸爸回家了。' },
          { question: '爸爸对谁说谢谢？', options: ['妈妈', '孩子', '老师'], answer: 0, explanation: '爸爸说：谢谢你，妈妈！' }
        ]
      }
    ]
  },
  {
    id: 'hsk1-weekend-park',
    title: 'Ngày cuối tuần ở công viên',
    titleZh: '周末去公园',
    level: 'HSK 1',
    topic: 'Cuối tuần · Địa điểm',
    description: 'Hai mẹ con lên kế hoạch, đi công viên và kể lại một ngày vui.',
    chapters: [
      {
        id: 'hsk1-weekend-park-01',
        title: 'Kế hoạch ngày nghỉ',
        titleZh: '周末的计划',
        sentences: [
          { chinese: '明天是星期六。', pinyin: 'Míngtiān shì xīngqīliù.', vietnamese: 'Ngày mai là thứ Bảy.' },
          { chinese: '妈妈问我：“你想去哪儿？”', pinyin: 'Māma wèn wǒ: “Nǐ xiǎng qù nǎr?”', vietnamese: 'Mẹ hỏi tôi: “Con muốn đi đâu?”' },
          { chinese: '我说：“我想去公园。”', pinyin: 'Wǒ shuō: “Wǒ xiǎng qù gōngyuán.”', vietnamese: 'Tôi nói: “Con muốn đi công viên.”' },
          { chinese: '妈妈说：“好，我们一起去。”', pinyin: 'Māma shuō: “Hǎo, wǒmen yìqǐ qù.”', vietnamese: 'Mẹ nói: “Được, chúng ta cùng đi.”' }
        ],
        vocabulary: [
          { hanzi: '明天', pinyin: 'míngtiān', vietnamese: 'ngày mai' },
          { hanzi: '星期六', pinyin: 'xīngqīliù', vietnamese: 'thứ Bảy' },
          { hanzi: '想', pinyin: 'xiǎng', vietnamese: 'muốn' },
          { hanzi: '去哪儿', pinyin: 'qù nǎr', vietnamese: 'đi đâu' },
          { hanzi: '公园', pinyin: 'gōngyuán', vietnamese: 'công viên' },
          { hanzi: '一起', pinyin: 'yìqǐ', vietnamese: 'cùng nhau' }
        ],
        questions: [
          { question: '明天是星期几？', options: ['星期五', '星期六', '星期日'], answer: 1, explanation: '第一句说：明天是星期六。' },
          { question: '“我”想去哪儿？', options: ['学校', '商店', '公园'], answer: 2, explanation: '“我”说想去公园。' }
        ]
      },
      {
        id: 'hsk1-weekend-park-02',
        title: 'Đi công viên',
        titleZh: '去公园',
        sentences: [
          { chinese: '早上八点，我们出门了。', pinyin: 'Zǎoshang bā diǎn, wǒmen chūmén le.', vietnamese: 'Tám giờ sáng, chúng tôi ra khỏi nhà.' },
          { chinese: '公园里有很多人。', pinyin: 'Gōngyuán lǐ yǒu hěn duō rén.', vietnamese: 'Trong công viên có rất nhiều người.' },
          { chinese: '有的人在看书，有的人在说话。', pinyin: 'Yǒu de rén zài kàn shū, yǒu de rén zài shuō huà.', vietnamese: 'Có người đang đọc sách, có người đang nói chuyện.' },
          { chinese: '我和妈妈在树下坐一会儿。', pinyin: 'Wǒ hé māma zài shù xià zuò yíhuìr.', vietnamese: 'Tôi và mẹ ngồi một lát dưới gốc cây.' }
        ],
        vocabulary: [
          { hanzi: '早上', pinyin: 'zǎoshang', vietnamese: 'buổi sáng' },
          { hanzi: '出门', pinyin: 'chūmén', vietnamese: 'ra khỏi nhà' },
          { hanzi: '很多', pinyin: 'hěn duō', vietnamese: 'rất nhiều' },
          { hanzi: '看书', pinyin: 'kàn shū', vietnamese: 'đọc sách' },
          { hanzi: '说话', pinyin: 'shuō huà', vietnamese: 'nói chuyện' },
          { hanzi: '树下', pinyin: 'shù xià', vietnamese: 'dưới gốc cây' },
          { hanzi: '一会儿', pinyin: 'yíhuìr', vietnamese: 'một lát' }
        ],
        questions: [
          { question: '他们几点出门？', options: ['七点', '八点', '九点'], answer: 1, explanation: '第一句说早上八点出门。' },
          { question: '他们在哪里坐一会儿？', options: ['树下', '学校里', '家里'], answer: 0, explanation: '最后一句说在树下坐一会儿。' }
        ]
      },
      {
        id: 'hsk1-weekend-park-03',
        title: 'Một ngày thật vui',
        titleZh: '快乐的一天',
        sentences: [
          { chinese: '中午，我们在公园吃东西。', pinyin: 'Zhōngwǔ, wǒmen zài gōngyuán chī dōngxi.', vietnamese: 'Buổi trưa, chúng tôi ăn đồ ăn trong công viên.' },
          { chinese: '下午，我和妈妈一起回家。', pinyin: 'Xiàwǔ, wǒ hé māma yìqǐ huí jiā.', vietnamese: 'Buổi chiều, tôi cùng mẹ về nhà.' },
          { chinese: '我给爸爸看照片。', pinyin: 'Wǒ gěi bàba kàn zhàopiàn.', vietnamese: 'Tôi cho bố xem ảnh.' },
          { chinese: '我说：“今天真好玩！”', pinyin: 'Wǒ shuō: “Jīntiān zhēn hǎowán!”', vietnamese: 'Tôi nói: “Hôm nay thật vui!”' }
        ],
        vocabulary: [
          { hanzi: '中午', pinyin: 'zhōngwǔ', vietnamese: 'buổi trưa' },
          { hanzi: '东西', pinyin: 'dōngxi', vietnamese: 'đồ vật; đồ ăn' },
          { hanzi: '下午', pinyin: 'xiàwǔ', vietnamese: 'buổi chiều' },
          { hanzi: '照片', pinyin: 'zhàopiàn', vietnamese: 'ảnh' },
          { hanzi: '真', pinyin: 'zhēn', vietnamese: 'thật; thực sự' },
          { hanzi: '好玩', pinyin: 'hǎowán', vietnamese: 'vui; thú vị' }
        ],
        questions: [
          { question: '他们什么时候回家？', options: ['上午', '中午', '下午'], answer: 2, explanation: '第二句说下午一起回家。' },
          { question: '“我”给谁看照片？', options: ['妈妈', '爸爸', '老师'], answer: 1, explanation: '第三句说我给爸爸看照片。' }
        ]
      }
    ]
  },
{
    id: 'hsk1-school-day',
    title: 'Một ngày ở trường', titleZh: '在学校的一天', level: 'HSK 1',
    topic: 'Trường học · Bạn bè',
    description: 'Một buổi sáng đến lớp, học tiếng Trung và gặp bạn mới.',
    chapters: [
      { id: 'hsk1-school-day-01', title: 'Buổi sáng đến lớp', titleZh: '早上去学校',
        sentences: [
          { chinese: '今天早上我去学校。', pinyin: 'Jīntiān zǎoshang wǒ qù xuéxiào.', vietnamese: 'Sáng nay tôi đi đến trường.' },
          { chinese: '我和朋友一起走。', pinyin: 'Wǒ hé péngyou yìqǐ zǒu.', vietnamese: 'Tôi đi cùng bạn.' },
          { chinese: '老师在教室里。', pinyin: 'Lǎoshī zài jiàoshì lǐ.', vietnamese: 'Thầy cô đang ở trong lớp học.' }
        ],
        vocabulary: [
          { hanzi: '早上', pinyin: 'zǎoshang', vietnamese: 'buổi sáng' },
          { hanzi: '学校', pinyin: 'xuéxiào', vietnamese: 'trường học' },
          { hanzi: '朋友', pinyin: 'péngyou', vietnamese: 'bạn bè' },
          { hanzi: '一起', pinyin: 'yìqǐ', vietnamese: 'cùng nhau' },
          { hanzi: '老师', pinyin: 'lǎoshī', vietnamese: 'giáo viên' },
          { hanzi: '教室', pinyin: 'jiàoshì', vietnamese: 'phòng học' }
        ],
        questions: [
          { question: '“我”早上去哪儿？', options: ['学校', '商店', '医院'], answer: 0, explanation: '第一句说：我去学校。' },
          { question: '谁在教室里？', options: ['朋友', '老师', '妈妈'], answer: 1, explanation: '第三句说：老师在教室里。' }
        ]
      },
      { id: 'hsk1-school-day-02', title: 'Học tiếng Trung', titleZh: '学习中文',
        sentences: [
          { chinese: '今天我们学习中文。', pinyin: 'Jīntiān wǒmen xuéxí Zhōngwén.', vietnamese: 'Hôm nay chúng tôi học tiếng Trung.' },
          { chinese: '老师说，我听。', pinyin: 'Lǎoshī shuō, wǒ tīng.', vietnamese: 'Thầy cô nói, tôi nghe.' },
          { chinese: '下课以后，我很高兴。', pinyin: 'Xiàkè yǐhòu, wǒ hěn gāoxìng.', vietnamese: 'Sau giờ học, tôi rất vui.' }
        ],
        vocabulary: [
          { hanzi: '学习', pinyin: 'xuéxí', vietnamese: 'học tập' },
          { hanzi: '中文', pinyin: 'Zhōngwén', vietnamese: 'tiếng Trung' },
          { hanzi: '说', pinyin: 'shuō', vietnamese: 'nói' },
          { hanzi: '听', pinyin: 'tīng', vietnamese: 'nghe' },
          { hanzi: '下课', pinyin: 'xiàkè', vietnamese: 'tan học' },
          { hanzi: '以后', pinyin: 'yǐhòu', vietnamese: 'sau đó' }
        ],
        questions: [
          { question: '他们今天学习什么？', options: ['英语', '中文', '数学'], answer: 1, explanation: '第一句说今天学习中文。' },
          { question: '下课以后，“我”怎么样？', options: ['很高兴', '很累', '很忙'], answer: 0, explanation: '最后一句说我很高兴。' }
        ]
      },
      { id: 'hsk1-school-day-03', title: 'Buổi sáng của tôi', titleZh: '我的早上',
        sentences: [
          { chinese: '今天早上，我六点起床。', pinyin: 'Jīntiān zǎoshang, wǒ liù diǎn qǐchuáng.', vietnamese: 'Sáng nay, tôi thức dậy lúc sáu giờ.' },
          { chinese: '妈妈已经在厨房做早饭了。', pinyin: 'Māma yǐjīng zài chúfáng zuò zǎofàn le.', vietnamese: 'Mẹ đã ở trong bếp chuẩn bị bữa sáng.' },
          { chinese: '我吃了一个鸡蛋，又喝了一杯牛奶。', pinyin: 'Wǒ chī le yí ge jīdàn, yòu hē le yì bēi niúnǎi.', vietnamese: 'Tôi ăn một quả trứng rồi uống thêm một cốc sữa.' },
          { chinese: '出门以前，妈妈帮我把书放进书包。', pinyin: 'Chūmén yǐqián, māma bāng wǒ bǎ shū fàng jìn shūbāo.', vietnamese: 'Trước khi ra khỏi nhà, mẹ giúp tôi bỏ sách vào cặp.' },
          { chinese: '七点半，我和朋友一起去学校。', pinyin: 'Qī diǎn bàn, wǒ hé péngyou yìqǐ qù xuéxiào.', vietnamese: 'Bảy giờ rưỡi, tôi cùng bạn đến trường.' },
          { chinese: '路上，朋友发现自己忘了带笔。', pinyin: 'Lùshang, péngyou fāxiàn zìjǐ wàng le dài bǐ.', vietnamese: 'Trên đường, bạn tôi phát hiện mình quên mang bút.' },
          { chinese: '我把自己的笔给他用。', pinyin: 'Wǒ bǎ zìjǐ de bǐ gěi tā yòng.', vietnamese: 'Tôi đưa chiếc bút của mình cho bạn dùng.' },
          { chinese: '他笑着说谢谢，我也觉得很高兴。', pinyin: 'Tā xiàozhe shuō xièxie, wǒ yě juéde hěn gāoxìng.', vietnamese: 'Bạn mỉm cười cảm ơn, tôi cũng cảm thấy rất vui.' },
          { chinese: '到了教室，老师让我们读中文。', pinyin: 'Dào le jiàoshì, lǎoshī ràng wǒmen dú Zhōngwén.', vietnamese: 'Đến lớp, thầy cô bảo chúng tôi đọc tiếng Trung.' },
          { chinese: '我认真地听，也大声地读。', pinyin: 'Wǒ rènzhēn de tīng, yě dàshēng de dú.', vietnamese: 'Tôi chăm chú lắng nghe và đọc thành tiếng.' },
          { chinese: '下课以后，我们约好明天一起复习。', pinyin: 'Xiàkè yǐhòu, wǒmen yuē hǎo míngtiān yìqǐ fùxí.', vietnamese: 'Sau giờ học, chúng tôi hẹn ngày mai cùng ôn bài.' },
          { chinese: '回家的路上，我想：学习新词很重要，关心朋友也很重要。', pinyin: 'Huí jiā de lùshang, wǒ xiǎng: xuéxí xīn cí hěn zhòngyào, guānxīn péngyou yě hěn zhòngyào.', vietnamese: 'Trên đường về nhà, tôi nghĩ: học từ mới rất quan trọng, quan tâm đến bạn bè cũng quan trọng không kém.' }
        ],
        vocabulary: [
          { hanzi: '今天', pinyin: 'jīntiān', vietnamese: 'hôm nay' },
          { hanzi: '早上', pinyin: 'zǎoshang', vietnamese: 'buổi sáng' },
          { hanzi: '我', pinyin: 'wǒ', vietnamese: 'tôi' },
          { hanzi: '六点', pinyin: 'liù diǎn', vietnamese: 'sáu giờ' },
          { hanzi: '起床', pinyin: 'qǐchuáng', vietnamese: 'thức dậy' },
          { hanzi: '和', pinyin: 'hé', vietnamese: 'và; cùng với' },
          { hanzi: '妈妈', pinyin: 'māma', vietnamese: 'mẹ' },
          { hanzi: '一起', pinyin: 'yìqǐ', vietnamese: 'cùng nhau' },
          { hanzi: '吃早饭', pinyin: 'chī zǎofàn', vietnamese: 'ăn sáng' },
          { hanzi: '喝', pinyin: 'hē', vietnamese: 'uống' },
          { hanzi: '一杯', pinyin: 'yì bēi', vietnamese: 'một cốc' },
          { hanzi: '牛奶', pinyin: 'niúnǎi', vietnamese: 'sữa' },
          { hanzi: '七点半', pinyin: 'qī diǎn bàn', vietnamese: 'bảy giờ rưỡi' },
          { hanzi: '去', pinyin: 'qù', vietnamese: 'đi' },
          { hanzi: '学校', pinyin: 'xuéxiào', vietnamese: 'trường học' },
          { hanzi: '学习', pinyin: 'xuéxí', vietnamese: 'học tập' },
          { hanzi: '汉语', pinyin: 'Hànyǔ', vietnamese: 'tiếng Trung' },
          { hanzi: '厨房', pinyin: 'chúfáng', vietnamese: 'nhà bếp' },
          { hanzi: '鸡蛋', pinyin: 'jīdàn', vietnamese: 'trứng gà' },
          { hanzi: '书包', pinyin: 'shūbāo', vietnamese: 'cặp sách' },
          { hanzi: '朋友', pinyin: 'péngyou', vietnamese: 'bạn bè' },
          { hanzi: '发现', pinyin: 'fāxiàn', vietnamese: 'phát hiện' },
          { hanzi: '忘记', pinyin: 'wàngjì', vietnamese: 'quên' },
          { hanzi: '铅笔', pinyin: 'qiānbǐ', vietnamese: 'bút chì' },
          { hanzi: '教室', pinyin: 'jiàoshì', vietnamese: 'phòng học' },
          { hanzi: '认真', pinyin: 'rènzhēn', vietnamese: 'chăm chú; nghiêm túc' },
          { hanzi: '复习', pinyin: 'fùxí', vietnamese: 'ôn tập' },
          { hanzi: '关心', pinyin: 'guānxīn', vietnamese: 'quan tâm' }
        ],
        questions: [
          { question: '“我”几点起床？', options: ['五点', '六点', '七点半'], answer: 1, explanation: '第一句说：“我六点起床。”' },
          { question: '朋友在路上遇到了什么问题？', options: ['忘了带笔', '忘了带书包', '忘了吃早饭'], answer: 0, explanation: '第六句说：朋友发现自己忘了带笔。' },
          { question: '“我”为什么觉得高兴？', options: ['因为帮助了朋友', '因为不用上课', '因为买了新书'], answer: 0, explanation: '“我”把自己的笔借给朋友使用，朋友向“我”道谢。' }
        ]
      }
    ]
  },
  {
    id: 'hsk2-rainy-day',
    title: 'Một ngày mưa bất ngờ', titleZh: '突然下雨了', level: 'HSK 2',
    topic: 'Thời tiết · Sinh hoạt',
    description: 'Một cơn mưa bất ngờ khiến hai người bạn thay đổi kế hoạch.',
    chapters: [
      { id: 'hsk2-rainy-day-01', title: 'Trời bắt đầu mưa', titleZh: '开始下雨了',
        sentences: [
          { chinese: '今天下午天气不太好。', pinyin: 'Jīntiān xiàwǔ tiānqì bú tài hǎo.', vietnamese: 'Chiều nay thời tiết không được đẹp lắm.' },
          { chinese: '我和朋友准备去打球。', pinyin: 'Wǒ hé péngyou zhǔnbèi qù dǎ qiú.', vietnamese: 'Tôi và bạn định đi chơi bóng.' },
          { chinese: '可是我们刚出门，就下雨了。', pinyin: 'Kěshì wǒmen gāng chūmén, jiù xià yǔ le.', vietnamese: 'Nhưng chúng tôi vừa ra khỏi nhà thì trời đổ mưa.' }
        ],
        vocabulary: [
          { hanzi: '下午', pinyin: 'xiàwǔ', vietnamese: 'buổi chiều' },
          { hanzi: '天气', pinyin: 'tiānqì', vietnamese: 'thời tiết' },
          { hanzi: '准备', pinyin: 'zhǔnbèi', vietnamese: 'chuẩn bị; dự định' },
          { hanzi: '打球', pinyin: 'dǎ qiú', vietnamese: 'chơi bóng' },
          { hanzi: '可是', pinyin: 'kěshì', vietnamese: 'nhưng' },
          { hanzi: '下雨', pinyin: 'xià yǔ', vietnamese: 'trời mưa' }
        ],
        questions: [
          { question: '他们原来准备做什么？', options: ['看电影', '打球', '买东西'], answer: 1, explanation: '第二句说他们准备去打球。' },
          { question: '他们出门以后发生了什么？', options: ['下雨了', '下雪了', '天晴了'], answer: 0, explanation: '第三句说刚出门就下雨了。' }
        ]
      },
      { id: 'hsk2-rainy-day-02', title: 'Đổi kế hoạch', titleZh: '改变计划',
        sentences: [
          { chinese: '我们只好回家拿雨伞。', pinyin: 'Wǒmen zhǐhǎo huí jiā ná yǔsǎn.', vietnamese: 'Chúng tôi đành về nhà lấy ô.' },
          { chinese: '朋友说，在家看一部电影也不错。', pinyin: 'Péngyou shuō, zài jiā kàn yí bù diànyǐng yě búcuò.', vietnamese: 'Bạn tôi nói xem một bộ phim ở nhà cũng khá hay.' },
          { chinese: '虽然没有出去，但是我们过得很开心。', pinyin: 'Suīrán méiyǒu chūqù, dànshì wǒmen guò de hěn kāixīn.', vietnamese: 'Dù không ra ngoài nhưng chúng tôi vẫn rất vui.' }
        ],
        vocabulary: [
          { hanzi: '只好', pinyin: 'zhǐhǎo', vietnamese: 'đành phải' },
          { hanzi: '雨伞', pinyin: 'yǔsǎn', vietnamese: 'ô; dù' },
          { hanzi: '电影', pinyin: 'diànyǐng', vietnamese: 'phim điện ảnh' },
          { hanzi: '不错', pinyin: 'búcuò', vietnamese: 'khá tốt' },
          { hanzi: '虽然', pinyin: 'suīrán', vietnamese: 'mặc dù' },
          { hanzi: '开心', pinyin: 'kāixīn', vietnamese: 'vui vẻ' }
        ],
        questions: [
          { question: '他们回家拿什么？', options: ['手机', '雨伞', '书'], answer: 1, explanation: '第一句说回家拿雨伞。' },
          { question: '他们最后开心吗？', options: ['很开心', '不开心', '不知道'], answer: 0, explanation: '最后一句说他们过得很开心。' }
        ]
      }
    ]
  },
  {
    id: 'hsk3-travel-plan',
    title: 'Chuyến đi được mong đợi', titleZh: '期待已久的旅行', level: 'HSK 3',
    topic: 'Du lịch · Lập kế hoạch',
    description: 'Hai người bạn lên kế hoạch cho chuyến đi đầu tiên đến một thành phố mới.',
    chapters: [
      { id: 'hsk3-travel-plan-01', title: 'Chọn điểm đến', titleZh: '选择目的地',
        sentences: [
          { chinese: '我和同学打算利用假期去旅行。', pinyin: 'Wǒ hé tóngxué dǎsuàn lìyòng jiàqī qù lǚxíng.', vietnamese: 'Tôi và bạn học dự định tranh thủ kỳ nghỉ để đi du lịch.' },
          { chinese: '我们比较了几个城市，最后决定去成都。', pinyin: 'Wǒmen bǐjiào le jǐ ge chéngshì, zuìhòu juédìng qù Chéngdū.', vietnamese: 'Chúng tôi so sánh vài thành phố rồi cuối cùng quyết định đến Thành Đô.' },
          { chinese: '听说那里的风景很美，东西也很好吃。', pinyin: 'Tīngshuō nàli de fēngjǐng hěn měi, dōngxi yě hěn hǎochī.', vietnamese: 'Nghe nói phong cảnh ở đó rất đẹp, đồ ăn cũng rất ngon.' }
        ],
        vocabulary: [
          { hanzi: '同学', pinyin: 'tóngxué', vietnamese: 'bạn học' },
          { hanzi: '打算', pinyin: 'dǎsuàn', vietnamese: 'dự định' },
          { hanzi: '利用', pinyin: 'lìyòng', vietnamese: 'tận dụng' },
          { hanzi: '假期', pinyin: 'jiàqī', vietnamese: 'kỳ nghỉ' },
          { hanzi: '比较', pinyin: 'bǐjiào', vietnamese: 'so sánh' },
          { hanzi: '决定', pinyin: 'juédìng', vietnamese: 'quyết định' }
        ],
        questions: [
          { question: '他们打算什么时候旅行？', options: ['假期', '考试时', '每天早上'], answer: 0, explanation: '第一句说，他们打算利用假期去旅行。' },
          { question: '他们决定去哪座城市？', options: ['北京', '成都', '上海'], answer: 1, explanation: '第二句说最后决定去成都。' }
        ]
      },
      { id: 'hsk3-travel-plan-02', title: 'Chuẩn bị hành lý', titleZh: '准备行李',
        sentences: [
          { chinese: '出发以前，我们先查了天气预报。', pinyin: 'Chūfā yǐqián, wǒmen xiān chá le tiānqì yùbào.', vietnamese: 'Trước khi khởi hành, chúng tôi kiểm tra dự báo thời tiết trước.' },
          { chinese: '我负责订车票，同学负责找酒店。', pinyin: 'Wǒ fùzé dìng chēpiào, tóngxué fùzé zhǎo jiǔdiàn.', vietnamese: 'Tôi phụ trách đặt vé tàu xe, bạn học phụ trách tìm khách sạn.' },
          { chinese: '我们希望这次旅行既轻松又有意思。', pinyin: 'Wǒmen xīwàng zhè cì lǚxíng jì qīngsōng yòu yǒu yìsi.', vietnamese: 'Chúng tôi hy vọng chuyến đi lần này vừa thoải mái vừa thú vị.' }
        ],
        vocabulary: [
          { hanzi: '出发', pinyin: 'chūfā', vietnamese: 'khởi hành' },
          { hanzi: '以前', pinyin: 'yǐqián', vietnamese: 'trước đây; trước khi' },
          { hanzi: '预报', pinyin: 'yùbào', vietnamese: 'dự báo' },
          { hanzi: '负责', pinyin: 'fùzé', vietnamese: 'phụ trách' },
          { hanzi: '车票', pinyin: 'chēpiào', vietnamese: 'vé tàu xe' },
          { hanzi: '轻松', pinyin: 'qīngsōng', vietnamese: 'thoải mái' }
        ],
        questions: [
          { question: '谁负责订车票？', options: ['“我”', '同学', '老师'], answer: 0, explanation: '第二句说我负责订车票。' },
          { question: '他们希望旅行怎么样？', options: ['很紧张', '既轻松又有意思', '很无聊'], answer: 1, explanation: '最后一句表达了他们的希望。' }
        ]
      }
    ]
  },
  {
    id: 'hsk4-first-interview',
    title: 'Buổi phỏng vấn đầu tiên', titleZh: '第一次面试', level: 'HSK 4',
    topic: 'Công việc · Giao tiếp',
    description: 'Một ứng viên trẻ chuẩn bị và rút kinh nghiệm sau buổi phỏng vấn.',
    chapters: [
      { id: 'hsk4-first-interview-01', title: 'Trước buổi phỏng vấn', titleZh: '面试以前',
        sentences: [
          { chinese: '为了得到这份工作，我提前做了充分的准备。', pinyin: 'Wèile dédào zhè fèn gōngzuò, wǒ tíqián zuò le chōngfèn de zhǔnbèi.', vietnamese: 'Để có được công việc này, tôi đã chuẩn bị kỹ lưỡng từ trước.' },
          { chinese: '除了了解公司的情况，我还练习了怎样介绍自己的经验。', pinyin: 'Chúle liǎojiě gōngsī de qíngkuàng, wǒ hái liànxí le zěnyàng jièshào zìjǐ de jīngyàn.', vietnamese: 'Ngoài việc tìm hiểu tình hình công ty, tôi còn luyện cách giới thiệu kinh nghiệm của bản thân.' },
          { chinese: '我提醒自己，回答问题时要清楚，也要诚实。', pinyin: 'Wǒ tíxǐng zìjǐ, huídá wèntí shí yào qīngchu, yě yào chéngshí.', vietnamese: 'Tôi tự nhắc mình khi trả lời câu hỏi phải rõ ràng và trung thực.' }
        ],
        vocabulary: [
          { hanzi: '为了', pinyin: 'wèile', vietnamese: 'để; nhằm' },
          { hanzi: '提前', pinyin: 'tíqián', vietnamese: 'trước thời hạn' },
          { hanzi: '充分', pinyin: 'chōngfèn', vietnamese: 'đầy đủ; thỏa đáng' },
          { hanzi: '除了', pinyin: 'chúle', vietnamese: 'ngoài… ra' },
          { hanzi: '经验', pinyin: 'jīngyàn', vietnamese: 'kinh nghiệm' },
          { hanzi: '诚实', pinyin: 'chéngshí', vietnamese: 'trung thực' }
        ],
        questions: [
          { question: '“我”为什么提前准备？', options: ['为了得到工作', '为了旅行', '为了考试'], answer: 0, explanation: '第一句说明准备的目的是得到这份工作。' },
          { question: '回答问题时应该怎样？', options: ['只说好听的话', '清楚而诚实', '尽量说得很快'], answer: 1, explanation: '最后一句说要清楚，也要诚实。' }
        ]
      },
      { id: 'hsk4-first-interview-02', title: 'Nhìn lại trải nghiệm', titleZh: '回顾这次经历',
        sentences: [
          { chinese: '面试结束以后，我发现交流比我想象的自然。', pinyin: 'Miànshì jiéshù yǐhòu, wǒ fāxiàn jiāoliú bǐ wǒ xiǎngxiàng de zìrán.', vietnamese: 'Sau buổi phỏng vấn, tôi nhận ra cuộc trao đổi tự nhiên hơn mình tưởng.' },
          { chinese: '面试官不仅关心我的专业能力，也重视团队合作。', pinyin: 'Miànshìguān bùjǐn guānxīn wǒ de zhuānyè nénglì, yě zhòngshì tuánduì hézuò.', vietnamese: 'Người phỏng vấn không chỉ quan tâm năng lực chuyên môn mà còn coi trọng khả năng hợp tác nhóm.' },
          { chinese: '无论结果如何，这次经历都让我更有信心。', pinyin: 'Wúlùn jiéguǒ rúhé, zhè cì jīnglì dōu ràng wǒ gèng yǒu xìnxīn.', vietnamese: 'Dù kết quả thế nào, trải nghiệm này cũng khiến tôi tự tin hơn.' }
        ],
        vocabulary: [
          { hanzi: '发现', pinyin: 'fāxiàn', vietnamese: 'phát hiện; nhận ra' },
          { hanzi: '交流', pinyin: 'jiāoliú', vietnamese: 'trao đổi' },
          { hanzi: '面试官', pinyin: 'miànshìguān', vietnamese: 'người phỏng vấn' },
          { hanzi: '专业', pinyin: 'zhuānyè', vietnamese: 'chuyên môn' },
          { hanzi: '团队', pinyin: 'tuánduì', vietnamese: 'đội nhóm' },
          { hanzi: '信心', pinyin: 'xìnxīn', vietnamese: 'sự tự tin' }
        ],
        questions: [
          { question: '面试官重视什么？', options: ['只重视年龄', '专业能力和团队合作', '只重视外表'], answer: 1, explanation: '第二句说，面试官不仅关心专业能力，也重视团队合作。' },
          { question: '这次经历让“我”怎么样？', options: ['更有信心', '更害怕', '更生气'], answer: 0, explanation: '最后一句说更有信心。' }
        ]
      }
    ]
  },
  {
    id: 'hsk5-green-project',
    title: 'Dự án xanh của khu phố', titleZh: '社区绿色行动', level: 'HSK 5',
    topic: 'Môi trường · Cộng đồng',
    description: 'Cư dân cùng xây dựng một dự án giảm rác và thay đổi thói quen sinh hoạt.',
    chapters: [
      { id: 'hsk5-green-project-01', title: 'Một ý tưởng chung', titleZh: '共同的想法',
        sentences: [
          { chinese: '随着城市不断发展，社区里的生活方式也在发生变化。', pinyin: 'Suízhe chéngshì búduàn fāzhǎn, shèqū lǐ de shēnghuó fāngshì yě zài fāshēng biànhuà.', vietnamese: 'Cùng với sự phát triển không ngừng của thành phố, cách sinh hoạt trong khu dân cư cũng đang thay đổi.' },
          { chinese: '几位居民提出建议，希望减少一次性用品的使用。', pinyin: 'Jǐ wèi jūmín tíchū jiànyì, xīwàng jiǎnshǎo yí cì xìng yòngpǐn de shǐyòng.', vietnamese: 'Một vài cư dân đưa ra đề xuất, mong muốn giảm việc sử dụng đồ dùng một lần.' },
          { chinese: '经过讨论，大家决定先从垃圾分类和旧物交换做起。', pinyin: 'Jīngguò tǎolùn, dàjiā juédìng xiān cóng lājī fēnlèi hé jiùwù jiāohuàn zuòqǐ.', vietnamese: 'Sau khi thảo luận, mọi người quyết định bắt đầu từ phân loại rác và trao đổi đồ cũ.' }
        ],
        vocabulary: [
          { hanzi: '随着', pinyin: 'suízhe', vietnamese: 'cùng với; theo đà' },
          { hanzi: '社区', pinyin: 'shèqū', vietnamese: 'cộng đồng dân cư' },
          { hanzi: '居民', pinyin: 'jūmín', vietnamese: 'cư dân' },
          { hanzi: '提出', pinyin: 'tíchū', vietnamese: 'đưa ra; đề xuất' },
          { hanzi: '一次性', pinyin: 'yí cì xìng', vietnamese: 'dùng một lần' },
          { hanzi: '垃圾分类', pinyin: 'lājī fēnlèi', vietnamese: 'phân loại rác' }
        ],
        questions: [
          { question: '居民希望减少什么？', options: ['公共交通', '一次性用品的使用', '社区活动'], answer: 1, explanation: '第二句说，居民希望减少一次性用品的使用。' },
          { question: '大家决定先做哪两件事？', options: ['垃圾分类和旧物交换', '修路和建房', '旅行和运动'], answer: 0, explanation: '第三句列出垃圾分类和旧物交换。' }
        ]
      },
      { id: 'hsk5-green-project-02', title: 'Thay đổi thói quen', titleZh: '让行动持续下去',
        sentences: [
          { chinese: '项目开始时，参与的人并不多，但组织者没有放弃。', pinyin: 'Xiàngmù kāishǐ shí, cānyù de rén bìng bù duō, dàn zǔzhīzhě méiyǒu fàngqì.', vietnamese: 'Khi dự án bắt đầu, số người tham gia không nhiều, nhưng ban tổ chức không bỏ cuộc.' },
          { chinese: '他们定期公布回收数据，让居民看到行动带来的实际效果。', pinyin: 'Tāmen dìngqī gōngbù huíshōu shùjù, ràng jūmín kàndào xíngdòng dàilái de shíjì xiàoguǒ.', vietnamese: 'Họ định kỳ công bố số liệu tái chế để cư dân thấy hiệu quả thực tế mà hành động mang lại.' },
          { chinese: '慢慢地，环保不再是一句口号，而成了大家共同坚持的习惯。', pinyin: 'Mànmàn de, huánbǎo bú zài shì yí jù kǒuhào, ér chéng le dàjiā gòngtóng jiānchí de xíguàn.', vietnamese: 'Dần dần, bảo vệ môi trường không còn là khẩu hiệu mà trở thành thói quen mọi người cùng duy trì.' }
        ],
        vocabulary: [
          { hanzi: '项目', pinyin: 'xiàngmù', vietnamese: 'dự án' },
          { hanzi: '参与', pinyin: 'cānyù', vietnamese: 'tham gia' },
          { hanzi: '组织者', pinyin: 'zǔzhīzhě', vietnamese: 'người tổ chức' },
          { hanzi: '定期', pinyin: 'dìngqī', vietnamese: 'định kỳ' },
          { hanzi: '实际', pinyin: 'shíjì', vietnamese: 'thực tế' },
          { hanzi: '口号', pinyin: 'kǒuhào', vietnamese: 'khẩu hiệu' }
        ],
        questions: [
          { question: '组织者怎样让居民了解效果？', options: ['定期公布数据', '只发广告', '停止活动'], answer: 0, explanation: '第二句说他们定期公布回收数据。' },
          { question: '最后，环保变成了什么？', options: ['一句口号', '共同坚持的习惯', '一次比赛'], answer: 1, explanation: '最后一句说环保成了共同坚持的习惯。' }
        ]
      }
    ]
  },
  {
    id: 'hsk6-city-future',
    title: 'Thành phố trong tương lai', titleZh: '未来城市的选择', level: 'HSK 6',
    topic: 'Đô thị · Công nghệ · Xã hội',
    description: 'Một nhóm nghiên cứu cân nhắc cách phát triển thành phố thông minh mà vẫn đáng sống.',
    chapters: [
      { id: 'hsk6-city-future-01', title: 'Không chỉ là công nghệ', titleZh: '不只是技术问题',
        sentences: [
          { chinese: '谈到未来城市，人们往往首先想到自动化交通和智能设备。', pinyin: 'Tándào wèilái chéngshì, rénmen wǎngwǎng shǒuxiān xiǎngdào zìdònghuà jiāotōng hé zhìnéng shèbèi.', vietnamese: 'Khi nhắc đến thành phố tương lai, người ta thường nghĩ ngay đến giao thông tự động hóa và thiết bị thông minh.' },
          { chinese: '然而，技术进步并不必然意味着生活质量会同步提高。', pinyin: 'Rán’ér, jìshù jìnbù bìng bù bìrán yìwèizhe shēnghuó zhìliàng huì tóngbù tígāo.', vietnamese: 'Tuy nhiên, tiến bộ công nghệ không nhất thiết đồng nghĩa chất lượng cuộc sống sẽ tăng lên tương ứng.' },
          { chinese: '如果忽视公共空间、隐私保护和不同群体的需求，城市就可能变得高效却不宜居。', pinyin: 'Rúguǒ hūshì gōnggòng kōngjiān, yǐnsī bǎohù hé bùtóng qúntǐ de xūqiú, chéngshì jiù kěnéng biànde gāoxiào què bù yíjū.', vietnamese: 'Nếu xem nhẹ không gian công cộng, bảo vệ quyền riêng tư và nhu cầu của các nhóm khác nhau, thành phố có thể trở nên hiệu quả nhưng không đáng sống.' }
        ],
        vocabulary: [
          { hanzi: '自动化', pinyin: 'zìdònghuà', vietnamese: 'tự động hóa' },
          { hanzi: '智能', pinyin: 'zhìnéng', vietnamese: 'thông minh' },
          { hanzi: '必然', pinyin: 'bìrán', vietnamese: 'tất yếu' },
          { hanzi: '同步', pinyin: 'tóngbù', vietnamese: 'đồng bộ; cùng nhịp' },
          { hanzi: '隐私', pinyin: 'yǐnsī', vietnamese: 'quyền riêng tư' },
          { hanzi: '宜居', pinyin: 'yíjū', vietnamese: 'đáng sống' }
        ],
        questions: [
          { question: '技术进步是否必然提高生活质量？', options: ['是，必然提高', '不一定', '完全没有关系'], answer: 1, explanation: '第二句明确说并不必然意味着生活质量同步提高。' },
          { question: '作者提醒城市规划者关注什么？', options: ['只关注设备数量', '公共空间、隐私和群体需求', '只关注交通速度'], answer: 1, explanation: '第三句列出了这些需要考虑的因素。' }
        ]
      },
      { id: 'hsk6-city-future-02', title: 'Cân bằng phát triển', titleZh: '在效率与公平之间',
        sentences: [
          { chinese: '研究小组认为，衡量城市发展的标准不应局限于经济增长速度。', pinyin: 'Yánjiū xiǎozǔ rènwéi, héngliáng chéngshì fāzhǎn de biāozhǔn bù yīng júxiàn yú jīngjì zēngzhǎng sùdù.', vietnamese: 'Nhóm nghiên cứu cho rằng tiêu chí đánh giá sự phát triển đô thị không nên chỉ giới hạn ở tốc độ tăng trưởng kinh tế.' },
          { chinese: '政策制定者需要在效率、公平与可持续性之间寻找平衡。', pinyin: 'Zhèngcè zhìdìngzhě xūyào zài xiàolǜ, gōngpíng yǔ kě chíxù xìng zhījiān xúnzhǎo pínghéng.', vietnamese: 'Những người hoạch định chính sách cần tìm sự cân bằng giữa hiệu quả, công bằng và tính bền vững.' },
          { chinese: '只有让技术服务于人的真实需求，创新才有长久的价值。', pinyin: 'Zhǐyǒu ràng jìshù fúwù yú rén de zhēnshí xūqiú, chuàngxīn cái yǒu chángjiǔ de jiàzhí.', vietnamese: 'Chỉ khi công nghệ phục vụ nhu cầu thực sự của con người, đổi mới mới có giá trị lâu dài.' }
        ],
        vocabulary: [
          { hanzi: '衡量', pinyin: 'héngliáng', vietnamese: 'đo lường; đánh giá' },
          { hanzi: '局限', pinyin: 'júxiàn', vietnamese: 'giới hạn' },
          { hanzi: '政策', pinyin: 'zhèngcè', vietnamese: 'chính sách' },
          { hanzi: '公平', pinyin: 'gōngpíng', vietnamese: 'công bằng' },
          { hanzi: '可持续性', pinyin: 'kě chíxù xìng', vietnamese: 'tính bền vững' },
          { hanzi: '长久', pinyin: 'chángjiǔ', vietnamese: 'lâu dài' }
        ],
        questions: [
          { question: '城市发展的标准不应局限于什么？', options: ['经济增长速度', '居民需求', '公共服务'], answer: 0, explanation: '第一句说不应局限于经济增长速度。' },
          { question: '创新怎样才有长久的价值？', options: ['只追求速度', '服务人的真实需求', '增加设备数量'], answer: 1, explanation: '最后一句强调技术要服务于人的真实需求。' }
        ]
      }
    ]
  }

];
