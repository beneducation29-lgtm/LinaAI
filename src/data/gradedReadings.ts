import type { HSKLevel } from '../types';

export interface GradedReadingSentence {
  chinese: string;
  pinyin: string;
  vietnamese: string;
}
export interface GradedReadingQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}
export interface GradedReading {
  id: string;
  title: string;
  titleZh: string;
  level: HSKLevel;
  topic: string;
  summary: string;
  estimatedMinutes: number;
  sentences: GradedReadingSentence[];
  focusWords: string[];
  questions: GradedReadingQuestion[];
  sourceNote: string;
}

/**
 * Original, sentence-aligned graded texts for LinaAI.
 * Level labels use the app's existing classic HSK 1–6 vocabulary framework.
 * Texts are newly authored; external reading sites are references, not copied sources.
 */
export const GRADED_READINGS: GradedReading[] = [
  {
    id: 'hsk1-morning',
    title: 'Một buổi sáng vui vẻ',
    titleZh: '快乐的早上',
    level: 'HSK 1',
    topic: 'Sinh hoạt hằng ngày',
    summary: 'Luyện chào hỏi, thời gian, ăn sáng và đi học.',
    estimatedMinutes: 3,
    sentences: [
      { chinese: '今天早上，我六点起床。', pinyin: 'Jīntiān zǎoshang, wǒ liù diǎn qǐchuáng.', vietnamese: 'Sáng nay, tôi thức dậy lúc sáu giờ.' },
      { chinese: '我和妈妈一起吃早饭，喝一杯牛奶。', pinyin: 'Wǒ hé māma yìqǐ chī zǎofàn, hē yì bēi niúnǎi.', vietnamese: 'Tôi ăn sáng cùng mẹ và uống một cốc sữa.' },
      { chinese: '七点半，我去学校学习汉语。', pinyin: 'Qī diǎn bàn, wǒ qù xuéxiào xuéxí Hànyǔ.', vietnamese: 'Bảy giờ rưỡi, tôi đến trường học tiếng Trung.' }
    ],
    focusWords: ['今天', '早上', '起床', '妈妈', '一起', '吃', '牛奶', '学校', '学习', '汉语'],
    questions: [
      { question: '主人公几点起床？', options: ['五点', '六点', '七点半'], answer: 1, explanation: '第一句 nói 今天早上，我六点起床。' },
      { question: '主人公和谁一起吃早饭？', options: ['爸爸', '老师', '妈妈'], answer: 2, explanation: '第二句 nói 我和妈妈一起吃早饭。' }
    ],
    sourceNote: 'Bài đọc do LinaAI biên soạn mới theo chủ đề và vốn từ HSK 1.'
  },
  {
    id: 'hsk1-my-family',
    title: 'Gia đình của tôi',
    titleZh: '我的家',
    level: 'HSK 1',
    topic: 'Gia đình',
    summary: 'Ôn từ chỉ thành viên gia đình và hoạt động cuối tuần.',
    estimatedMinutes: 3,
    sentences: [
      { chinese: '我家有四个人：爸爸、妈妈、姐姐和我。', pinyin: 'Wǒ jiā yǒu sì ge rén: bàba, māma, jiějie hé wǒ.', vietnamese: 'Nhà tôi có bốn người: bố, mẹ, chị gái và tôi.' },
      { chinese: '爸爸喜欢看书，妈妈喜欢做饭。', pinyin: 'Bàba xǐhuan kàn shū, māma xǐhuan zuò fàn.', vietnamese: 'Bố thích đọc sách, mẹ thích nấu ăn.' },
      { chinese: '星期天，我们在家一起看电影。', pinyin: 'Xīngqītiān, wǒmen zài jiā yìqǐ kàn diànyǐng.', vietnamese: 'Chủ nhật, chúng tôi cùng xem phim ở nhà.' }
    ],
    focusWords: ['家', '有', '爸爸', '妈妈', '姐姐', '喜欢', '看书', '星期天', '一起', '电影'],
    questions: [
      { question: 'Nhà người kể có bao nhiêu người?', options: ['Ba người', 'Bốn người', 'Năm người'], answer: 1, explanation: 'Câu đầu có 四个人 – bốn người.' },
      { question: 'Mẹ thích làm gì?', options: ['Nấu ăn', 'Đọc sách', 'Xem phim'], answer: 0, explanation: '妈妈喜欢做饭 – mẹ thích nấu ăn.' }
    ],
    sourceNote: 'Bài đọc do LinaAI biên soạn mới theo chủ đề và vốn từ HSK 1.'
  },
  {
    id: 'hsk2-weekend',
    title: 'Cuối tuần ở công viên',
    titleZh: '公园里的周末',
    level: 'HSK 2',
    topic: 'Giải trí',
    summary: 'Luyện kể kế hoạch, thời tiết và hoạt động ngoài trời.',
    estimatedMinutes: 4,
    sentences: [
      { chinese: '上个星期六天气很好，我和朋友决定去公园。', pinyin: 'Shàng ge xīngqīliù tiānqì hěn hǎo, wǒ hé péngyou juédìng qù gōngyuán.', vietnamese: 'Thứ Bảy tuần trước thời tiết rất đẹp, tôi và bạn quyết định đi công viên.' },
      { chinese: '我们先在湖边散步，然后坐下来聊天。', pinyin: 'Wǒmen xiān zài húbiān sànbù, ránhòu zuò xiàlai liáotiān.', vietnamese: 'Chúng tôi đi dạo bên hồ trước, sau đó ngồi xuống trò chuyện.' },
      { chinese: '虽然有一点儿累，但是大家都觉得很开心。', pinyin: 'Suīrán yǒu yìdiǎnr lèi, dànshì dàjiā dōu juéde hěn kāixīn.', vietnamese: 'Tuy hơi mệt một chút nhưng mọi người đều cảm thấy rất vui.' }
    ],
    focusWords: ['星期六', '天气', '朋友', '决定', '公园', '先', '然后', '散步', '聊天', '虽然', '但是', '觉得'],
    questions: [
      { question: 'Họ đi đâu?', options: ['Thư viện', 'Công viên', 'Nhà hàng'], answer: 1, explanation: 'Câu đầu nói 决定去公园 – quyết định đi công viên.' },
      { question: 'Họ làm gì bên hồ?', options: ['Đi dạo', 'Mua sách', 'Ăn tối'], answer: 0, explanation: 'Câu hai có 在湖边散步 – đi dạo bên hồ.' }
    ],
    sourceNote: 'Bài đọc do LinaAI biên soạn mới theo chủ đề và vốn từ HSK 2.'
  },
  {
    id: 'hsk2-learning',
    title: 'Học tiếng Trung mỗi ngày',
    titleZh: '每天学习汉语',
    level: 'HSK 2',
    topic: 'Học tập',
    summary: 'Nói về thói quen học và cách ghi nhớ từ mới.',
    estimatedMinutes: 4,
    sentences: [
      { chinese: '为了说好汉语，我每天早上练习半个小时。', pinyin: 'Wèile shuō hǎo Hànyǔ, wǒ měitiān zǎoshang liànxí bàn ge xiǎoshí.', vietnamese: 'Để nói tiếng Trung tốt, sáng nào tôi cũng luyện tập nửa tiếng.' },
      { chinese: '遇到不认识的生词，我先查词典，再写在本子上。', pinyin: 'Yùdào bù rènshi de shēngcí, wǒ xiān chá cídiǎn, zài xiě zài běnzi shàng.', vietnamese: 'Khi gặp từ mới chưa biết, tôi tra từ điển trước rồi viết vào vở.' },
      { chinese: '我觉得每天复习一点儿，比周末学习很多更有用。', pinyin: 'Wǒ juéde měitiān fùxí yìdiǎnr, bǐ zhōumò xuéxí hěn duō gèng yǒuyòng.', vietnamese: 'Tôi thấy mỗi ngày ôn một chút hữu ích hơn học thật nhiều vào cuối tuần.' }
    ],
    focusWords: ['为了', '每天', '练习', '小时', '遇到', '认识', '生词', '词典', '本子', '复习', '有用'],
    questions: [
      { question: 'Người kể luyện tập bao lâu mỗi sáng?', options: ['Mười phút', 'Nửa tiếng', 'Một tiếng'], answer: 1, explanation: '半个小时 nghĩa là nửa tiếng.' },
      { question: 'Người kể làm gì sau khi tra từ điển?', options: ['Viết vào vở', 'Đi ngủ', 'Gọi điện'], answer: 0, explanation: '再写在本子上 – sau đó viết vào vở.' }
    ],
    sourceNote: 'Bài đọc do LinaAI biên soạn mới theo chủ đề và vốn từ HSK 2.'
  },
  {
    id: 'hsk3-new-city',
    title: 'Làm quen với thành phố mới',
    titleZh: '认识一座新城市',
    level: 'HSK 3',
    topic: 'Đời sống',
    summary: 'Đọc đoạn văn về chuyển nhà, giao thông và thích nghi.',
    estimatedMinutes: 5,
    sentences: [
      { chinese: '去年我因为工作搬到了一个新的城市，刚开始有些不习惯。', pinyin: 'Qùnián wǒ yīnwèi gōngzuò bān dào le yí ge xīn de chéngshì, gāng kāishǐ yǒuxiē bù xíguàn.', vietnamese: 'Năm ngoái vì công việc, tôi chuyển đến một thành phố mới; lúc đầu tôi chưa quen lắm.' },
      { chinese: '这里的公共交通很方便，坐地铁就能到很多地方。', pinyin: 'Zhèlǐ de gōnggòng jiāotōng hěn fāngbiàn, zuò dìtiě jiù néng dào hěn duō dìfang.', vietnamese: 'Giao thông công cộng ở đây rất thuận tiện, đi tàu điện ngầm là có thể đến nhiều nơi.' },
      { chinese: '慢慢地，我认识了邻居，也发现了几家不错的小餐馆。', pinyin: 'Mànmàn de, wǒ rènshi le línjū, yě fāxiàn le jǐ jiā búcuò de xiǎo cānguǎn.', vietnamese: 'Dần dần, tôi quen được hàng xóm và cũng tìm thấy vài quán ăn nhỏ khá ngon.' },
      { chinese: '现在我已经喜欢上这里的生活了。', pinyin: 'Xiànzài wǒ yǐjīng xǐhuan shàng zhèlǐ de shēnghuó le.', vietnamese: 'Bây giờ tôi đã bắt đầu yêu thích cuộc sống ở đây.' }
    ],
    focusWords: ['因为', '搬', '城市', '习惯', '公共交通', '方便', '地铁', '邻居', '发现', '餐馆', '生活'],
    questions: [
      { question: 'Vì sao người kể chuyển đến thành phố mới?', options: ['Vì công việc', 'Vì đi du lịch', 'Vì học nấu ăn'], answer: 0, explanation: '因为工作 – vì công việc.' },
      { question: 'Điều gì giúp người kể đi đến nhiều nơi?', options: ['Xe đạp', 'Giao thông công cộng', 'Đi bộ'], answer: 1, explanation: 'Đoạn hai nói về 公共交通 và 地铁.' }
    ],
    sourceNote: 'Bài đọc do LinaAI biên soạn mới theo chủ đề và vốn từ HSK 3.'
  },
  {
    id: 'hsk3-reading-habit',
    title: 'Thói quen đọc sách',
    titleZh: '养成阅读的习惯',
    level: 'HSK 3',
    topic: 'Phát triển bản thân',
    summary: 'Luyện diễn đạt nguyên nhân, thay đổi thói quen và lợi ích.',
    estimatedMinutes: 5,
    sentences: [
      { chinese: '以前我觉得读书很浪费时间，所以很少主动看书。', pinyin: 'Yǐqián wǒ juéde dúshū hěn làngfèi shíjiān, suǒyǐ hěn shǎo zhǔdòng kàn shū.', vietnamese: 'Trước đây tôi nghĩ đọc sách rất tốn thời gian nên hiếm khi chủ động đọc.' },
      { chinese: '后来一位老师建议我每天读十分钟，从自己感兴趣的内容开始。', pinyin: 'Hòulái yí wèi lǎoshī jiànyì wǒ měitiān dú shí fēnzhōng, cóng zìjǐ gǎn xìngqù de nèiróng kāishǐ.', vietnamese: 'Sau đó một giáo viên khuyên tôi mỗi ngày đọc mười phút, bắt đầu từ nội dung mình hứng thú.' },
      { chinese: '这个方法不难坚持，而且让我学到了很多新的表达。', pinyin: 'Zhège fāngfǎ bù nán jiānchí, érqiě ràng wǒ xué dào le hěn duō xīn de biǎodá.', vietnamese: 'Phương pháp này không khó duy trì, hơn nữa còn giúp tôi học được nhiều cách diễn đạt mới.' }
    ],
    focusWords: ['以前', '浪费', '时间', '主动', '建议', '内容', '感兴趣', '方法', '坚持', '表达'],
    questions: [
      { question: 'Người kể bắt đầu đọc sách bao lâu mỗi ngày?', options: ['Mười phút', 'Ba mươi phút', 'Một giờ'], answer: 0, explanation: '每天读十分钟 – mỗi ngày đọc mười phút.' },
      { question: 'Ai đã đưa ra lời khuyên?', options: ['Một người bạn', 'Một giáo viên', 'Một đồng nghiệp'], answer: 1, explanation: 'Câu hai nhắc đến 一位老师.' }
    ],
    sourceNote: 'Bài đọc do LinaAI biên soạn mới theo chủ đề và vốn từ HSK 3.'
  },
  {
    id: 'hsk4-time',
    title: 'Học cách quản lý thời gian',
    titleZh: '学会管理时间',
    level: 'HSK 4',
    topic: 'Phát triển bản thân',
    summary: 'Đọc lập luận về ưu tiên, kế hoạch và hiệu quả công việc.',
    estimatedMinutes: 6,
    sentences: [
      { chinese: '很多人抱怨每天的事情太多，却没有认真考虑时间到底花在了哪里。', pinyin: 'Hěn duō rén bàoyuàn měitiān de shìqing tài duō, què méiyǒu rènzhēn kǎolǜ shíjiān dàodǐ huā zài le nǎlǐ.', vietnamese: 'Nhiều người phàn nàn rằng mỗi ngày có quá nhiều việc, nhưng lại chưa nghiêm túc xem thời gian thực sự được dùng vào đâu.' },
      { chinese: '有效的时间管理并不是把日程安排得越满越好，而是先确定最重要的目标。', pinyin: 'Yǒuxiào de shíjiān guǎnlǐ bìng bú shì bǎ rìchéng ānpái de yuè mǎn yuè hǎo, ér shì xiān quèdìng zuì zhòngyào de mùbiāo.', vietnamese: 'Quản lý thời gian hiệu quả không có nghĩa là xếp lịch càng kín càng tốt, mà là xác định mục tiêu quan trọng nhất trước.' },
      { chinese: '把复杂的任务分成几个小步骤，可以减少压力，也更容易检查进度。', pinyin: 'Bǎ fùzá de rènwu fēn chéng jǐ ge xiǎo bùzhòu, kěyǐ jiǎnshǎo yālì, yě gèng róngyì jiǎnchá jìndù.', vietnamese: 'Chia nhiệm vụ phức tạp thành vài bước nhỏ có thể giảm áp lực và giúp kiểm tra tiến độ dễ hơn.' },
      { chinese: '真正重要的不是忙了多长时间，而是有没有完成值得做的事情。', pinyin: 'Zhēnzhèng zhòngyào de bú shì máng le duō cháng shíjiān, ér shì yǒu méiyǒu wánchéng zhídé zuò de shìqing.', vietnamese: 'Điều thực sự quan trọng không phải là bận rộn bao lâu, mà là có hoàn thành những việc đáng làm hay không.' }
    ],
    focusWords: ['抱怨', '认真', '考虑', '有效', '管理', '日程', '安排', '确定', '目标', '复杂', '任务', '步骤', '压力', '进度', '完成'],
    questions: [
      { question: 'Bài đọc khuyên nên làm gì trước?', options: ['Xếp lịch kín', 'Xác định mục tiêu quan trọng', 'Làm nhiều việc cùng lúc'], answer: 1, explanation: 'Câu hai nhấn mạnh 先确定最重要的目标.' },
      { question: 'Chia nhiệm vụ thành bước nhỏ có lợi ích gì?', options: ['Tăng áp lực', 'Giảm áp lực và dễ theo dõi', 'Kéo dài thời gian'], answer: 1, explanation: 'Câu ba nêu 减少压力 và 检查进度.' }
    ],
    sourceNote: 'Bài đọc do LinaAI biên soạn mới theo chủ đề và vốn từ HSK 4.'
  },
  {
    id: 'hsk4-travel',
    title: 'Một chuyến đi có ý nghĩa',
    titleZh: '一次有意义的旅行',
    level: 'HSK 4',
    topic: 'Du lịch & văn hóa',
    summary: 'Luyện kể trải nghiệm, so sánh và rút ra nhận xét.',
    estimatedMinutes: 6,
    sentences: [
      { chinese: '这次旅行让我印象最深的，并不是著名的风景，而是当地人的热情。', pinyin: 'Zhè cì lǚxíng ràng wǒ yìnxiàng zuì shēn de, bìng bú shì zhùmíng de fēngjǐng, ér shì dāngdì rén de rèqíng.', vietnamese: 'Điều khiến tôi ấn tượng sâu sắc nhất trong chuyến đi này không phải phong cảnh nổi tiếng, mà là sự nhiệt tình của người dân địa phương.' },
      { chinese: '有一天我们迷了路，一位老人主动带我们走到车站。', pinyin: 'Yǒu yì tiān wǒmen mí le lù, yí wèi lǎorén zhǔdòng dài wǒmen zǒu dào chēzhàn.', vietnamese: 'Một hôm chúng tôi bị lạc đường, một cụ già đã chủ động dẫn chúng tôi đến nhà ga.' },
      { chinese: '虽然语言不太相同，但是一个微笑和简单的帮助就能拉近人与人之间的距离。', pinyin: 'Suīrán yǔyán bú tài xiāngtóng, dànshì yí ge wēixiào hé jiǎndān de bāngzhù jiù néng lā jìn rén yǔ rén zhījiān de jùlí.', vietnamese: 'Tuy ngôn ngữ không hoàn toàn giống nhau, nhưng một nụ cười và sự giúp đỡ giản dị cũng có thể kéo gần khoảng cách giữa người với người.' }
    ],
    focusWords: ['旅行', '印象', '著名', '风景', '当地', '热情', '主动', '车站', '语言', '相同', '微笑', '距离'],
    questions: [
      { question: 'Điều gì để lại ấn tượng sâu sắc nhất?', options: ['Khách sạn', 'Sự nhiệt tình của người dân', 'Thời tiết'], answer: 1, explanation: 'Câu đầu đối chiếu phong cảnh với 当地人的热情.' },
      { question: 'Ai đã giúp họ khi bị lạc?', options: ['Một cụ già', 'Một hướng dẫn viên', 'Một tài xế'], answer: 0, explanation: 'Câu hai nói 一位老人主动带我们.' }
    ],
    sourceNote: 'Bài đọc do LinaAI biên soạn mới theo chủ đề và vốn từ HSK 4.'
  },
  {
    id: 'hsk5-information',
    title: 'Đọc thông tin trong thời đại số',
    titleZh: '数字时代的信息判断',
    level: 'HSK 5',
    topic: 'Công nghệ & xã hội',
    summary: 'Phân tích cách kiểm chứng nguồn tin và tư duy phản biện.',
    estimatedMinutes: 7,
    sentences: [
      { chinese: '随着网络平台不断发展，人们获取信息的速度明显提高，但信息数量增加并不代表判断能力也随之增强。', pinyin: 'Suízhe wǎngluò píngtái búduàn fāzhǎn, rénmen huòqǔ xìnxī de sùdù míngxiǎn tígāo, dàn xìnxī shùliàng zēngjiā bìng bú dàibiǎo pànduàn nénglì yě suízhī zēngqiáng.', vietnamese: 'Cùng với sự phát triển không ngừng của các nền tảng mạng, tốc độ tiếp nhận thông tin của con người tăng rõ rệt, nhưng số lượng thông tin tăng không có nghĩa năng lực phán đoán cũng tăng theo.' },
      { chinese: '面对一条看起来十分可信的消息，我们仍然需要确认发布者、发布时间以及相关证据。', pinyin: 'Miànduì yì tiáo kàn qǐlai shífēn kěxìn de xiāoxi, wǒmen réngrán xūyào quèrèn fābùzhě, fābù shíjiān yǐjí xiāngguān zhèngjù.', vietnamese: 'Khi đối diện một tin tức có vẻ rất đáng tin, chúng ta vẫn cần xác nhận người đăng, thời điểm đăng và bằng chứng liên quan.' },
      { chinese: '如果不同来源提供的事实互相矛盾，就应该暂时保留结论，而不是急着转发。', pinyin: 'Rúguǒ bùtóng láiyuán tígōng de shìshí hùxiāng máodùn, jiù yīnggāi zànshí bǎoliú jiélùn, ér bú shì jí zhe zhuǎnfā.', vietnamese: 'Nếu các nguồn khác nhau cung cấp những sự thật mâu thuẫn, ta nên tạm thời chưa kết luận thay vì vội vàng chia sẻ lại.' },
      { chinese: '真正的信息素养，不只是知道得多，更包括愿意检查自己的判断。', pinyin: 'Zhēnzhèng de xìnxī sùyǎng, bù zhǐ shì zhīdào de duō, gèng bāokuò yuànyì jiǎnchá zìjǐ de pànduàn.', vietnamese: 'Năng lực thông tin thực sự không chỉ là biết nhiều, mà còn bao gồm sự sẵn lòng kiểm tra lại phán đoán của chính mình.' }
    ],
    focusWords: ['随着', '平台', '获取', '明显', '代表', '判断', '能力', '可信', '确认', '发布者', '证据', '来源', '矛盾', '结论', '转发', '素养'],
    questions: [
      { question: 'Bài đọc khuyên kiểm tra những gì khi gặp tin đáng tin?', options: ['Người đăng, thời điểm và bằng chứng', 'Số lượt thích', 'Ảnh đại diện'], answer: 0, explanation: 'Câu hai liệt kê 发布者、发布时间以及相关证据.' },
      { question: 'Khi các nguồn mâu thuẫn, nên làm gì?', options: ['Chia sẻ ngay', 'Tạm hoãn kết luận', 'Chọn nguồn nổi tiếng nhất'], answer: 1, explanation: 'Câu ba nói 暂时保留结论.' }
    ],
    sourceNote: 'Bài đọc do LinaAI biên soạn mới theo chủ đề và vốn từ HSK 5.'
  },
  {
    id: 'hsk5-learning',
    title: 'Vì sao học sâu quan trọng?',
    titleZh: '为什么深度学习很重要',
    level: 'HSK 5',
    topic: 'Học tập & tư duy',
    summary: 'Đọc về tập trung, ghi nhớ chủ động và vận dụng kiến thức.',
    estimatedMinutes: 7,
    sentences: [
      { chinese: '在信息极其丰富的环境中，学习者很容易误以为看过某个知识点，就等于真正掌握了它。', pinyin: 'Zài xìnxī jíqí fēngfù de huánjìng zhōng, xuéxízhě hěn róngyì wùyǐwéi kàn guo mǒu ge zhīshi diǎn, jiù děngyú zhēnzhèng zhǎngwò le tā.', vietnamese: 'Trong môi trường thông tin vô cùng phong phú, người học rất dễ lầm tưởng rằng đã xem qua một kiến thức thì đồng nghĩa với việc thực sự nắm vững nó.' },
      { chinese: '然而，长期记忆往往来自主动回忆、间隔复习以及在不同情境中灵活运用。', pinyin: 'Rán’ér, chángqī jìyì wǎngwǎng láizì zhǔdòng huíyì, jiàngé fùxí yǐjí zài bùtóng qíngjìng zhōng línghuó yùnyòng.', vietnamese: 'Tuy nhiên, trí nhớ dài hạn thường đến từ việc chủ động nhớ lại, ôn tập ngắt quãng và vận dụng linh hoạt trong những ngữ cảnh khác nhau.' },
      { chinese: '因此，与其连续浏览大量材料，不如选择少量内容，经过理解、练习和反馈后再继续学习。', pinyin: 'Yīncǐ, yǔqí liánxù liúlǎn dàliàng cáiliào, bùrú xuǎnzé shǎoliàng nèiróng, jīngguò lǐjiě, liànxí hé fǎnkuì hòu zài jìxù xuéxí.', vietnamese: 'Vì vậy, thay vì liên tục lướt qua lượng lớn tài liệu, tốt hơn nên chọn một lượng nội dung nhỏ, hiểu, luyện tập và nhận phản hồi rồi mới tiếp tục.' }
    ],
    focusWords: ['丰富', '学习者', '误以为', '掌握', '长期', '记忆', '主动', '回忆', '间隔', '复习', '情境', '灵活', '运用', '连续', '材料', '反馈'],
    questions: [
      { question: 'Điều gì giúp hình thành trí nhớ dài hạn?', options: ['Chỉ đọc lướt', 'Chủ động nhớ lại và ôn tập ngắt quãng', 'Học thật nhiều chủ đề cùng lúc'], answer: 1, explanation: 'Câu hai nêu 主动回忆、间隔复习 và 灵活运用.' },
      { question: 'Tác giả khuyên nên chọn cách học nào?', options: ['Ít nội dung, hiểu và luyện tập sâu', 'Lướt càng nhiều càng tốt', 'Chỉ xem video'], answer: 0, explanation: 'Câu cuối dùng cấu trúc 与其…不如… để đưa ra lời khuyên.' }
    ],
    sourceNote: 'Bài đọc do LinaAI biên soạn mới theo chủ đề và vốn từ HSK 5.'
  },
  {
    id: 'hsk6-economy',
    title: 'Tư duy dài hạn trong kinh tế',
    titleZh: '经济决策中的长期思维',
    level: 'HSK 6',
    topic: 'Kinh tế & xã hội',
    summary: 'Đọc lập luận nâng cao về chi phí cơ hội và quyết định.',
    estimatedMinutes: 8,
    sentences: [
      { chinese: '在复杂多变的经济环境下，短期收益往往容易吸引注意力，却未必能够准确反映一项决策的真实价值。', pinyin: 'Zài fùzá duōbiàn de jīngjì huánjìng xià, duǎnqī shōuyì wǎngwǎng róngyì xīyǐn zhùyìlì, què wèibì nénggòu zhǔnquè fǎnyìng yí xiàng juécè de zhēnshí jiàzhí.', vietnamese: 'Trong môi trường kinh tế phức tạp và biến động, lợi ích ngắn hạn thường dễ thu hút sự chú ý nhưng chưa chắc phản ánh chính xác giá trị thực của một quyết định.' },
      { chinese: '评估方案时，除了直接成本，还应考虑机会成本、潜在风险以及资源配置所带来的长期影响。', pinyin: 'Pínggū fāngàn shí, chúle zhíjiē chéngběn, hái yīng kǎolǜ jīhuì chéngběn, qiánzài fēngxiǎn yǐjí zīyuán pèizhì suǒ dàilái de chángqī yǐngxiǎng.', vietnamese: 'Khi đánh giá phương án, ngoài chi phí trực tiếp, còn cần xem xét chi phí cơ hội, rủi ro tiềm ẩn và ảnh hưởng dài hạn do việc phân bổ nguồn lực tạo ra.' },
      { chinese: '所谓长期思维，并不是忽视眼前的限制，而是在现实约束之内，比较不同选择在未来可能产生的连锁反应。', pinyin: 'Suǒwèi chángqī sīwéi, bìng bú shì hūshì yǎnqián de xiànzhì, ér shì zài xiànshí yuēshù zhī nèi, bǐjiào bùtóng xuǎnzé zài wèilái kěnéng chǎnshēng de liánsuǒ fǎnyìng.', vietnamese: 'Tư duy dài hạn không phải là bỏ qua những giới hạn trước mắt, mà là so sánh các phản ứng dây chuyền có thể phát sinh trong tương lai từ những lựa chọn khác nhau, trong khuôn khổ thực tế.' },
      { chinese: '这种分析方式有助于避免被单一指标误导，也能让决策者更清楚地承担结果。', pinyin: 'Zhè zhǒng fēnxī fāngshì yǒuzhù yú bìmiǎn bèi dānyī zhǐbiāo wùdǎo, yě néng ràng juécèzhě gèng qīngchu de chéngdān jiéguǒ.', vietnamese: 'Cách phân tích này giúp tránh bị một chỉ số đơn lẻ dẫn dắt sai lệch, đồng thời giúp người ra quyết định ý thức rõ hơn về việc chịu trách nhiệm cho kết quả.' }
    ],
    focusWords: ['复杂', '收益', '反映', '决策', '价值', '评估', '方案', '成本', '机会成本', '潜在', '风险', '资源', '配置', '影响', '约束', '连锁反应', '指标', '误导', '承担'],
    questions: [
      { question: 'Ngoài chi phí trực tiếp, cần xem xét điều gì?', options: ['Chi phí cơ hội và rủi ro tiềm ẩn', 'Chỉ doanh thu hôm nay', 'Ý kiến trên mạng'], answer: 0, explanation: 'Câu hai liệt kê 机会成本 và 潜在风险.' },
      { question: 'Tư duy dài hạn có nghĩa là gì?', options: ['Bỏ qua hiện tại', 'So sánh tác động tương lai trong giới hạn thực tế', 'Chỉ chọn lợi ích lớn nhất trước mắt'], answer: 1, explanation: 'Câu ba giải thích định nghĩa 长期思维.' }
    ],
    sourceNote: 'Bài đọc do LinaAI biên soạn mới theo chủ đề và vốn từ HSK 6.'
  },
  {
    id: 'hsk6-history',
    title: 'Lịch sử và cách nhìn đa chiều',
    titleZh: '从多角度理解历史',
    level: 'HSK 6',
    topic: 'Lịch sử & tư duy phản biện',
    summary: 'Đọc văn bản nâng cao về bối cảnh, tư liệu và diễn giải lịch sử.',
    estimatedMinutes: 8,
    sentences: [
      { chinese: '理解历史事件，不能仅凭某个结果倒推当事人的动机，还必须还原当时的制度、技术与社会条件。', pinyin: 'Lǐjiě lìshǐ shìjiàn, bù néng jǐn píng mǒu ge jiéguǒ dàotuī dāngshìrén de dòngjī, hái bìxū huányuán dāngshí de zhìdù, jìshù yǔ shèhuì tiáojiàn.', vietnamese: 'Để hiểu một sự kiện lịch sử, không thể chỉ dựa vào kết quả để suy ngược động cơ của người đương thời; còn phải khôi phục bối cảnh thể chế, kỹ thuật và xã hội lúc đó.' },
      { chinese: '不同史料可能记录了同一事件的不同侧面，因此研究者需要比较来源、形成时间和作者所处的立场。', pinyin: 'Bùtóng shǐliào kěnéng jìlù le tóng yí shìjiàn de bùtóng cèmiàn, yīncǐ yánjiūzhě xūyào bǐjiào láiyuán, xíngchéng shíjiān hé zuòzhě suǒ chǔ de lìchǎng.', vietnamese: 'Các tư liệu lịch sử khác nhau có thể ghi lại những mặt khác nhau của cùng một sự kiện; vì thế nhà nghiên cứu cần so sánh nguồn, thời điểm hình thành và lập trường của tác giả.' },
      { chinese: '多角度分析并不意味着所有解释都同样可靠，而是要求每一种观点都接受证据和逻辑的检验。', pinyin: 'Duō jiǎodù fēnxī bìng bù yìwèizhe suǒyǒu jiěshì dōu tóngyàng kěkào, ér shì yāoqiú měi yì zhǒng guāndiǎn dōu jiēshòu zhèngjù hé luójí de jiǎnyàn.', vietnamese: 'Phân tích đa chiều không có nghĩa mọi cách giải thích đều đáng tin như nhau, mà yêu cầu mỗi quan điểm phải được kiểm nghiệm bằng bằng chứng và logic.' },
      { chinese: '只有区分事实、推测与价值判断，我们才可能形成更加审慎的历史认识。', pinyin: 'Zhǐyǒu qūfēn shìshí, tuīcè yǔ jiàzhí pànduàn, wǒmen cái kěnéng xíngchéng gèngjiā shěnshèn de lìshǐ rènshi.', vietnamese: 'Chỉ khi phân biệt sự kiện, suy đoán và phán đoán giá trị, chúng ta mới có thể hình thành nhận thức lịch sử thận trọng hơn.' }
    ],
    focusWords: ['历史', '事件', '凭', '结果', '倒推', '动机', '制度', '社会', '史料', '研究者', '来源', '立场', '角度', '解释', '可靠', '证据', '逻辑', '检验', '推测', '审慎'],
    questions: [
      { question: 'Vì sao cần so sánh nhiều nguồn tư liệu?', options: ['Vì mỗi nguồn có thể phản ánh một khía cạnh', 'Để tìm nguồn dài nhất', 'Để tránh đọc tài liệu'], answer: 0, explanation: 'Câu hai nói các 史料 có thể ghi lại 不同侧面.' },
      { question: 'Điều gì cần được dùng để kiểm nghiệm quan điểm?', options: ['Cảm xúc', 'Bằng chứng và logic', 'Số lượt chia sẻ'], answer: 1, explanation: 'Câu ba nêu 证据和逻辑的检验.' }
    ],
    sourceNote: 'Bài đọc do LinaAI biên soạn mới theo chủ đề và vốn từ HSK 6.'
  }

  {
    id: 'hsk1-at-restaurant',
    title: 'Gọi món ở quán ăn',
    titleZh: '在饭馆点菜',
    level: 'HSK 1',
    topic: 'Giao tiếp hằng ngày',
    summary: 'Luyện gọi món, hỏi giá và nói lời cảm ơn trong quán ăn.',
    estimatedMinutes: 3,
    sentences: [
      { chinese: '今天我和朋友去饭馆吃饭。', pinyin: 'Jīntiān wǒ hé péngyou qù fànguǎn chīfàn.', vietnamese: 'Hôm nay tôi và bạn đi ăn ở quán.' },
      { chinese: '我想要一碗米饭和一杯水。', pinyin: 'Wǒ xiǎng yào yì wǎn mǐfàn hé yì bēi shuǐ.', vietnamese: 'Tôi muốn một bát cơm và một cốc nước.' },
      { chinese: '服务员说一共三十块钱，我说谢谢。', pinyin: 'Fúwùyuán shuō yígòng sānshí kuài qián, wǒ shuō xièxie.', vietnamese: 'Nhân viên nói tổng cộng ba mươi tệ, tôi nói cảm ơn.' }
    ],
    focusWords: ['今天', '朋友', '饭馆', '吃饭', '想', '要', '米饭', '水', '服务员', '一共', '钱', '谢谢'],
    questions: [
      { question: 'Người kể đi ăn với ai?', options: ['Bạn', 'Giáo viên', 'Mẹ'], answer: 0, explanation: 'Câu đầu nói 我和朋友 – tôi và bạn.' },
      { question: 'Tổng số tiền là bao nhiêu?', options: ['二十块', '三十块', '四十块'], answer: 1, explanation: 'Nhân viên nói 一共三十块钱.' }
    ],
    sourceNote: 'Bài đọc do LinaAI biên soạn mới theo giao tiếp cơ bản HSK 1.'
  },
  {
    id: 'hsk2-ask-directions',
    title: 'Hỏi đường khi đi trong thành phố',
    titleZh: '在城市里问路',
    level: 'HSK 2',
    topic: 'Giao tiếp hằng ngày',
    summary: 'Luyện hỏi vị trí, nghe chỉ dẫn và xác nhận đường đi.',
    estimatedMinutes: 4,
    sentences: [
      { chinese: '请问，地铁站离这里远不远？', pinyin: 'Qǐngwèn, dìtiězhàn lí zhèlǐ yuǎn bu yuǎn?', vietnamese: 'Xin hỏi, ga tàu điện ngầm có xa đây không?' },
      { chinese: '不太远，你一直往前走，在银行旁边就能看见。', pinyin: 'Bú tài yuǎn, nǐ yìzhí wǎng qián zǒu, zài yínháng pángbiān jiù néng kànjiàn.', vietnamese: 'Không xa lắm, bạn cứ đi thẳng về phía trước, sẽ nhìn thấy nó bên cạnh ngân hàng.' },
      { chinese: '好的，谢谢你！我现在就过去。', pinyin: 'Hǎo de, xièxie nǐ! Wǒ xiànzài jiù guòqu.', vietnamese: 'Được rồi, cảm ơn bạn! Bây giờ tôi đi qua đó.' }
    ],
    focusWords: ['请问', '地铁站', '离', '远', '一直', '前', '银行', '旁边', '看见', '现在', '过去'],
    questions: [
      { question: 'Ga tàu điện ngầm ở đâu?', options: ['Bên cạnh ngân hàng', 'Trong trường học', 'Phía sau bệnh viện'], answer: 0, explanation: 'Người chỉ đường nói 在银行旁边.' },
      { question: 'Người hỏi đường sẽ làm gì?', options: ['Gọi taxi', 'Đi đến ga ngay', 'Về nhà'], answer: 1, explanation: 'Câu cuối nói 我现在就过去.' }
    ],
    sourceNote: 'Bài đọc do LinaAI biên soạn mới theo tình huống giao tiếp HSK 2.'
  },
  {
    id: 'hsk3-tea-culture',
    title: 'Một buổi uống trà cùng bạn',
    titleZh: '和朋友一起喝茶',
    level: 'HSK 3',
    topic: 'Văn hóa & phong tục',
    summary: 'Tìm hiểu cách mời trà, trò chuyện và thể hiện sự lịch sự.',
    estimatedMinutes: 5,
    sentences: [
      { chinese: '周末，我第一次去朋友家做客，他的家人热情地请我喝茶。', pinyin: 'Zhōumò, wǒ dì yī cì qù péngyou jiā zuòkè, tā de jiārén rèqíng de qǐng wǒ hē chá.', vietnamese: 'Cuối tuần, lần đầu tiên tôi đến nhà bạn chơi, gia đình bạn nhiệt tình mời tôi uống trà.' },
      { chinese: '主人先给长辈倒茶，再请客人选择自己喜欢的茶。', pinyin: 'Zhǔrén xiān gěi zhǎngbèi dào chá, zài qǐng kèrén xuǎnzé zìjǐ xǐhuan de chá.', vietnamese: 'Chủ nhà rót trà cho người lớn tuổi trước, sau đó mời khách chọn loại trà mình thích.' },
      { chinese: '我们一边喝茶一边聊天，慢慢了解彼此的生活和习惯。', pinyin: 'Wǒmen yìbiān hē chá yìbiān liáotiān, mànmàn liǎojiě bǐcǐ de shēnghuó hé xíguàn.', vietnamese: 'Chúng tôi vừa uống trà vừa trò chuyện, từ từ tìm hiểu cuộc sống và thói quen của nhau.' }
    ],
    focusWords: ['周末', '第一次', '做客', '家人', '热情', '主人', '长辈', '客人', '选择', '一边', '聊天', '习惯'],
    questions: [
      { question: 'Chủ nhà rót trà cho ai trước?', options: ['Trẻ em', 'Người lớn tuổi', 'Người phục vụ'], answer: 1, explanation: 'Câu hai nói 先给长辈倒茶.' },
      { question: 'Hai người vừa uống trà vừa làm gì?', options: ['Trò chuyện', 'Nấu ăn', 'Xem tivi'], answer: 0, explanation: '一边喝茶一边聊天 nghĩa là vừa uống trà vừa trò chuyện.' }
    ],
    sourceNote: 'Bài đọc do LinaAI biên soạn mới về phép lịch sự trong văn hóa tiếp khách.'
  },
  {
    id: 'hsk3-study-plan',
    title: 'Học ít nhưng đều đặn',
    titleZh: '少学一点儿，坚持每天学',
    level: 'HSK 3',
    topic: 'Học tập',
    summary: 'Trao đổi về lịch học ngắn, ôn tập và duy trì động lực.',
    estimatedMinutes: 5,
    sentences: [
      { chinese: '以前我常常在考试前才开始学习，所以总觉得时间不够。', pinyin: 'Yǐqián wǒ chángcháng zài kǎoshì qián cái kāishǐ xuéxí, suǒyǐ zǒng juéde shíjiān bú gòu.', vietnamese: 'Trước đây tôi thường đợi đến trước kỳ thi mới bắt đầu học nên lúc nào cũng thấy không đủ thời gian.' },
      { chinese: '现在我每天安排二十分钟复习生词，再读一小段文章。', pinyin: 'Xiànzài wǒ měitiān ānpái èrshí fēnzhōng fùxí shēngcí, zài dú yì xiǎo duàn wénzhāng.', vietnamese: 'Bây giờ mỗi ngày tôi sắp xếp hai mươi phút ôn từ mới, sau đó đọc một đoạn văn ngắn.' },
      { chinese: '虽然每天学的内容不多，但是坚持下来以后，我发现自己进步了。', pinyin: 'Suīrán měitiān xué de nèiróng bù duō, dànshì jiānchí xiàlai yǐhòu, wǒ fāxiàn zìjǐ jìnbù le.', vietnamese: 'Tuy mỗi ngày học không nhiều, nhưng sau khi kiên trì, tôi nhận ra mình đã tiến bộ.' }
    ],
    focusWords: ['以前', '考试', '开始', '时间', '安排', '分钟', '复习', '生词', '文章', '虽然', '坚持', '发现', '进步'],
    questions: [
      { question: 'Trước đây người kể thường bắt đầu học khi nào?', options: ['Mỗi sáng', 'Trước kỳ thi', 'Cuối mỗi tháng'], answer: 1, explanation: 'Câu đầu nói 在考试前才开始学习.' },
      { question: 'Mỗi ngày người kể dành bao lâu để ôn từ mới?', options: ['十分钟', '二十分钟', '一个小时'], answer: 1, explanation: 'Câu hai nói 安排二十分钟.' }
    ],
    sourceNote: 'Bài đọc do LinaAI biên soạn mới theo chủ đề học tập HSK 3.'
  },
  {
    id: 'hsk4-money-habits',
    title: 'Quản lý tiền bạc trong cuộc sống',
    titleZh: '管理日常开支',
    level: 'HSK 4',
    topic: 'Kinh tế & tiền bạc',
    summary: 'Luyện nói về thu nhập, chi tiêu, tiết kiệm và lựa chọn mua sắm.',
    estimatedMinutes: 6,
    sentences: [
      { chinese: '刚开始工作的时候，我常常月底才发现自己的钱已经花得差不多了。', pinyin: 'Gāng kāishǐ gōngzuò de shíhou, wǒ chángcháng yuèdǐ cái fāxiàn zìjǐ de qián yǐjīng huā de chàbuduō le.', vietnamese: 'Khi mới bắt đầu đi làm, tôi thường đến cuối tháng mới nhận ra mình gần như đã tiêu hết tiền.' },
      { chinese: '后来我把每个月的收入分成生活费、储蓄和学习费用。', pinyin: 'Hòulái wǒ bǎ měi ge yuè de shōurù fēn chéng shēnghuófèi, chǔxù hé xuéxí fèiyòng.', vietnamese: 'Sau đó tôi chia thu nhập mỗi tháng thành chi phí sinh hoạt, tiền tiết kiệm và chi phí học tập.' },
      { chinese: '买东西以前，我会先比较价格，也会想一想自己是不是真的需要它。', pinyin: 'Mǎi dōngxi yǐqián, wǒ huì xiān bǐjiào jiàgé, yě huì xiǎng yi xiǎng zìjǐ shì bú shì zhēn de xūyào tā.', vietnamese: 'Trước khi mua đồ, tôi sẽ so sánh giá và suy nghĩ xem mình có thực sự cần nó hay không.' }
    ],
    focusWords: ['工作', '月底', '发现', '差不多', '收入', '分成', '生活费', '储蓄', '费用', '比较', '价格', '需要'],
    questions: [
      { question: 'Người kể chia thu nhập thành những khoản nào?', options: ['Sinh hoạt, tiết kiệm, học tập', 'Du lịch, quà tặng, giải trí', 'Chỉ tiền ăn'], answer: 0, explanation: 'Câu hai liệt kê 生活费、储蓄和学习费用.' },
      { question: 'Trước khi mua đồ, người kể làm gì?', options: ['Mua ngay', 'So sánh giá và cân nhắc nhu cầu', 'Hỏi tất cả bạn bè'], answer: 1, explanation: 'Câu ba nói 比较价格 và nghĩ xem có thật sự cần không.' }
    ],
    sourceNote: 'Bài đọc do LinaAI biên soạn mới về thói quen tài chính cá nhân, không phải lời khuyên đầu tư.'
  },
  {
    id: 'hsk4-life-attitude',
    title: 'Giữ bình tĩnh trước những thay đổi',
    titleZh: '面对变化，保持平静',
    level: 'HSK 4',
    topic: 'Triết lý sống',
    summary: 'Đọc về chấp nhận thay đổi, phân biệt điều có thể kiểm soát và giữ thái độ tích cực.',
    estimatedMinutes: 6,
    sentences: [
      { chinese: '生活不会总是按照我们的计划发展，有时候变化来得比想象中更快。', pinyin: 'Shēnghuó bú huì zǒngshì ànzhào wǒmen de jìhuà fāzhǎn, yǒu shíhou biànhuà lái de bǐ xiǎngxiàng zhōng gèng kuài.', vietnamese: 'Cuộc sống không phải lúc nào cũng phát triển theo kế hoạch của chúng ta; đôi khi thay đổi đến nhanh hơn tưởng tượng.' },
      { chinese: '遇到困难时，与其一直担心结果，不如先看看自己能够做些什么。', pinyin: 'Yùdào kùnnan shí, yǔqí yìzhí dānxīn jiéguǒ, bùrú xiān kànkan zìjǐ nénggòu zuò xiē shénme.', vietnamese: 'Khi gặp khó khăn, thay vì liên tục lo lắng về kết quả, tốt hơn hãy xem trước mình có thể làm được điều gì.' },
      { chinese: '我们不能决定所有事情，但是可以选择用什么态度面对它们。', pinyin: 'Wǒmen bù néng juédìng suǒyǒu shìqing, dànshì kěyǐ xuǎnzé yòng shénme tàidu miànduì tāmen.', vietnamese: 'Chúng ta không thể quyết định mọi việc, nhưng có thể lựa chọn thái độ để đối diện với chúng.' }
    ],
    focusWords: ['生活', '按照', '计划', '发展', '变化', '想象', '困难', '担心', '结果', '能够', '决定', '选择', '态度', '面对'],
    questions: [
      { question: 'Khi gặp khó khăn, bài đọc khuyên nên làm gì?', options: ['Chỉ lo lắng', 'Xem mình có thể hành động thế nào', 'Bỏ mọi kế hoạch'], answer: 1, explanation: 'Câu hai khuyên先看看自己能够做些什么.' },
      { question: 'Điều gì nằm trong khả năng lựa chọn của chúng ta?', options: ['Mọi kết quả', 'Thái độ đối diện sự việc', 'Hành động của người khác'], answer: 1, explanation: 'Câu cuối nhấn mạnh 可以选择…态度.' }
    ],
    sourceNote: 'Bài đọc do LinaAI biên soạn mới theo chủ đề triết lý sống HSK 4.'
  },
  {
    id: 'hsk5-festival-culture',
    title: 'Ý nghĩa của những ngày lễ truyền thống',
    titleZh: '传统节日的意义',
    level: 'HSK 5',
    topic: 'Văn hóa & phong tục',
    summary: 'Tìm hiểu Tết Nguyên đán, sum họp gia đình và việc gìn giữ phong tục.',
    estimatedMinutes: 7,
    sentences: [
      { chinese: '对很多家庭来说，春节不仅是一个重要的节日，也是家人重新聚在一起的机会。', pinyin: 'Duì hěn duō jiātíng lái shuō, Chūnjié bù jǐn shì yí ge zhòngyào de jiérì, yě shì jiārén chóngxīn jù zài yìqǐ de jīhuì.', vietnamese: 'Với nhiều gia đình, Tết Nguyên đán không chỉ là một ngày lễ quan trọng mà còn là dịp để các thành viên sum họp.' },
      { chinese: '人们准备食物、打扫房间，并向长辈表达祝福和感谢。', pinyin: 'Rénmen zhǔnbèi shíwù, dǎsǎo fángjiān, bìng xiàng zhǎngbèi biǎodá zhùfú hé gǎnxiè.', vietnamese: 'Mọi người chuẩn bị thức ăn, dọn dẹp nhà cửa và gửi lời chúc cùng sự biết ơn đến người lớn tuổi.' },
      { chinese: '时代虽然不断变化，但节日中关于团聚、关心和分享的价值仍然值得保留。', pinyin: 'Shídài suīrán búduàn biànhuà, dàn jiérì zhōng guānyú tuánjù, guānxīn hé fēnxiǎng de jiàzhí réngrán zhídé bǎoliú.', vietnamese: 'Dù thời đại không ngừng thay đổi, những giá trị về đoàn tụ, quan tâm và sẻ chia trong ngày lễ vẫn đáng được gìn giữ.' }
    ],
    focusWords: ['家庭', '春节', '不仅', '重要', '节日', '重新', '机会', '准备', '打扫', '长辈', '表达', '祝福', '感谢', '时代', '变化', '团聚', '分享', '价值', '保留'],
    questions: [
      { question: 'Tết có ý nghĩa gì với nhiều gia đình?', options: ['Chỉ là ngày nghỉ', 'Dịp sum họp gia đình', 'Dịp mua đồ mới'], answer: 1, explanation: 'Câu đầu nói家人重新聚在一起的机会.' },
      { question: 'Giá trị nào được nhắc đến ở câu cuối?', options: ['Đoàn tụ, quan tâm và sẻ chia', 'Cạnh tranh và tốc độ', 'Tiêu dùng và giải trí'], answer: 0, explanation: 'Câu cuối nêu 团聚、关心和分享.' }
    ],
    sourceNote: 'Bài đọc do LinaAI biên soạn mới về văn hóa Tết và giá trị gia đình.'
  },
  {
    id: 'hsk5-life-philosophy',
    title: 'Thành công không chỉ có một định nghĩa',
    titleZh: '成功不只有一种定义',
    level: 'HSK 5',
    topic: 'Triết lý sống',
    summary: 'Thảo luận về thành công, mục tiêu cá nhân và cân bằng trong cuộc sống.',
    estimatedMinutes: 7,
    sentences: [
      { chinese: '社会常常用收入、职位和名声来衡量一个人的成功，却容易忽略每个人的生活目标并不相同。', pinyin: 'Shèhuì chángcháng yòng shōurù, zhíwèi hé míngshēng lái héngliáng yí ge rén de chénggōng, què róngyì hūlüè měi ge rén de shēnghuó mùbiāo bìng bù xiāngtóng.', vietnamese: 'Xã hội thường dùng thu nhập, chức vụ và danh tiếng để đo lường thành công, nhưng dễ bỏ qua việc mục tiêu sống của mỗi người không giống nhau.' },
      { chinese: '有人希望创造事业，有人更重视家庭、健康或持续学习。', pinyin: 'Yǒu rén xīwàng chuàngzào shìyè, yǒu rén gèng zhòngshì jiātíng, jiànkāng huò chíxù xuéxí.', vietnamese: 'Có người muốn xây dựng sự nghiệp, có người coi trọng gia đình, sức khỏe hoặc việc học hỏi liên tục hơn.' },
      { chinese: '与其盲目追随别人的标准，不如先弄清楚自己真正重视什么，再为目标安排时间和精力。', pinyin: 'Yǔqí mángmù zhuīsuí biérén de biāozhǔn, bùrú xiān nòng qīngchu zìjǐ zhēnzhèng zhòngshì shénme, zài wèi mùbiāo ānpái shíjiān hé jīnglì.', vietnamese: 'Thay vì mù quáng chạy theo tiêu chuẩn của người khác, tốt hơn hãy hiểu rõ điều mình thực sự coi trọng rồi dành thời gian và sức lực cho mục tiêu đó.' }
    ],
    focusWords: ['社会', '收入', '职位', '名声', '衡量', '成功', '忽略', '目标', '相同', '创造', '事业', '重视', '持续', '盲目', '追随', '标准', '真正', '精力'],
    questions: [
      { question: 'Theo bài đọc, vì sao không nên chỉ dùng thu nhập để đánh giá thành công?', options: ['Vì mọi người có mục tiêu sống khác nhau', 'Vì thu nhập không quan trọng', 'Vì chức vụ luôn quan trọng hơn'], answer: 0, explanation: 'Câu đầu nói mỗi người có不同的生活目标.' },
      { question: 'Tác giả khuyên nên làm gì trước?', options: ['Bắt chước người khác', 'Hiểu điều bản thân thực sự coi trọng', 'Tăng giờ làm việc'], answer: 1, explanation: 'Câu cuối khuyên先弄清楚自己真正重视什么.' }
    ],
    sourceNote: 'Bài đọc do LinaAI biên soạn mới để luyện diễn đạt quan điểm HSK 5.'
  },
  {
    id: 'hsk6-economic-choices',
    title: 'Chi phí cơ hội trong lựa chọn hằng ngày',
    titleZh: '日常选择中的机会成本',
    level: 'HSK 6',
    topic: 'Kinh tế & tiền bạc',
    summary: 'Giải thích chi phí cơ hội qua thời gian, tiền bạc và quyết định tiêu dùng.',
    estimatedMinutes: 8,
    sentences: [
      { chinese: '当我们决定把时间或金钱用于某件事情时，也就放弃了用同样资源去做其他事情的可能。', pinyin: 'Dāng wǒmen juédìng bǎ shíjiān huò jīnqián yòng yú mǒu jiàn shìqing shí, yě jiù fàngqì le yòng tóngyàng zīyuán qù zuò qítā shìqing de kěnéng.', vietnamese: 'Khi quyết định dùng thời gian hoặc tiền bạc cho một việc, chúng ta cũng từ bỏ khả năng dùng nguồn lực ấy cho việc khác.' },
      { chinese: '经济学把这种被放弃的最佳替代方案称为机会成本，它提醒我们比较选择背后的真实代价。', pinyin: 'Jīngjìxué bǎ zhè zhǒng bèi fàngqì de zuìjiā tìdài fāngàn chēng wéi jīhuì chéngběn, tā tíxǐng wǒmen bǐjiào xuǎnzé bèihòu de zhēnshí dàijià.', vietnamese: 'Kinh tế học gọi phương án thay thế tốt nhất bị từ bỏ này là chi phí cơ hội; khái niệm đó nhắc chúng ta so sánh cái giá thực sự phía sau mỗi lựa chọn.' },
      { chinese: '理解机会成本并不意味着每次都要选择最赚钱的方案，而是让决定更加符合自己的优先顺序。', pinyin: 'Lǐjiě jīhuì chéngběn bìng bù yìwèizhe měi cì dōu yào xuǎnzé zuì zhuànqián de fāngàn, ér shì ràng juédìng gèngjiā fúhé zìjǐ de yōuxiān shùnxù.', vietnamese: 'Hiểu chi phí cơ hội không có nghĩa lần nào cũng phải chọn phương án kiếm nhiều tiền nhất, mà là giúp quyết định phù hợp hơn với thứ tự ưu tiên của bản thân.' }
    ],
    focusWords: ['决定', '时间', '金钱', '放弃', '资源', '可能', '经济学', '最佳', '替代', '方案', '称为', '机会成本', '提醒', '比较', '选择', '代价', '赚钱', '符合', '优先', '顺序'],
    questions: [
      { question: 'Chi phí cơ hội là gì?', options: ['Tổng số tiền đã chi', 'Giá trị của phương án tốt nhất bị từ bỏ', 'Khoản thuế phải nộp'], answer: 1, explanation: 'Câu hai gọi phương án thay thế tốt nhất bị từ bỏ là 机会成本.' },
      { question: 'Hiểu chi phí cơ hội giúp ích điều gì?', options: ['Luôn chọn phương án kiếm nhiều tiền nhất', 'Đưa ra quyết định phù hợp ưu tiên cá nhân', 'Không cần cân nhắc lựa chọn'], answer: 1, explanation: 'Câu cuối nói 决定更加符合自己的优先顺序.' }
    ],
    sourceNote: 'Bài đọc do LinaAI biên soạn mới để giải thích khái niệm kinh tế cơ bản, không phải tư vấn tài chính.'
  },

];

export const HSK_LEVELS: HSKLevel[] = ['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'];
