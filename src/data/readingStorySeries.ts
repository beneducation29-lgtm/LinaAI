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
  }
];
