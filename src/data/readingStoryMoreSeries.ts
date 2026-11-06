import type { ReadingStorySeries } from './readingStorySeries';

/** Additional original LinaAI graded stories. Each chapter has aligned Hanzi, tone-marked Pinyin, Vietnamese, glossary and comprehension checks. */
export const MORE_READING_STORIES: ReadingStorySeries[] = [
  {
    id: 'hsk1-market-day', title: 'Một buổi đi chợ', titleZh: '去市场的一天', level: 'HSK 1',
    topic: 'Mua sắm · Đồ ăn', description: 'Cùng mẹ đi chợ, hỏi giá và chọn thức ăn cho bữa tối.',
    chapters: [
      {
        id: 'hsk1-market-day-01', title: 'Đi chợ cùng mẹ', titleZh: '和妈妈去市场',
        sentences: [
          { chinese: '星期天早上，我和妈妈去市场。', pinyin: 'Xīngqītiān zǎoshang, wǒ hé māma qù shìchǎng.', vietnamese: 'Sáng Chủ nhật, tôi cùng mẹ đi chợ.' },
          { chinese: '市场里有很多人，也有很多水果。', pinyin: 'Shìchǎng lǐ yǒu hěn duō rén, yě yǒu hěn duō shuǐguǒ.', vietnamese: 'Trong chợ có rất nhiều người và cũng có nhiều trái cây.' },
          { chinese: '妈妈买苹果、香蕉和一些菜。', pinyin: 'Māma mǎi píngguǒ, xiāngjiāo hé yìxiē cài.', vietnamese: 'Mẹ mua táo, chuối và một ít rau.' },
          { chinese: '我帮妈妈拿东西。', pinyin: 'Wǒ bāng māma ná dōngxi.', vietnamese: 'Tôi giúp mẹ xách đồ.' }
        ],
        vocabulary: [
          { hanzi: '市场', pinyin: 'shìchǎng', vietnamese: 'chợ; thị trường' },
          { hanzi: '水果', pinyin: 'shuǐguǒ', vietnamese: 'trái cây' },
          { hanzi: '苹果', pinyin: 'píngguǒ', vietnamese: 'quả táo' },
          { hanzi: '香蕉', pinyin: 'xiāngjiāo', vietnamese: 'quả chuối' },
          { hanzi: '一些', pinyin: 'yìxiē', vietnamese: 'một ít; một vài' },
          { hanzi: '帮', pinyin: 'bāng', vietnamese: 'giúp đỡ' }
        ],
        questions: [
          { question: '“我”和谁去市场？', options: ['爸爸', '妈妈', '朋友'], answer: 1, explanation: '第一句说“我”和妈妈一起去市场。' },
          { question: '“我”帮妈妈做什么？', options: ['拿东西', '做饭', '买书'], answer: 0, explanation: '最后一句说“我”帮妈妈拿东西。' }
        ]
      },
      {
        id: 'hsk1-market-day-02', title: 'Chọn món ăn tối', titleZh: '准备晚饭',
        sentences: [
          { chinese: '回家以后，妈妈开始做晚饭。', pinyin: 'Huí jiā yǐhòu, māma kāishǐ zuò wǎnfàn.', vietnamese: 'Sau khi về nhà, mẹ bắt đầu nấu bữa tối.' },
          { chinese: '我先洗菜，再把水果放在桌子上。', pinyin: 'Wǒ xiān xǐ cài, zài bǎ shuǐguǒ fàng zài zhuōzi shàng.', vietnamese: 'Tôi rửa rau trước, sau đó đặt trái cây lên bàn.' },
          { chinese: '爸爸下班回来，大家一起吃饭。', pinyin: 'Bàba xiàbān huílái, dàjiā yìqǐ chīfàn.', vietnamese: 'Bố tan làm trở về, mọi người cùng ăn cơm.' },
          { chinese: '今天的晚饭简单，但是很好吃。', pinyin: 'Jīntiān de wǎnfàn jiǎndān, dànshì hěn hǎochī.', vietnamese: 'Bữa tối hôm nay đơn giản nhưng rất ngon.' }
        ],
        vocabulary: [
          { hanzi: '回家', pinyin: 'huí jiā', vietnamese: 'về nhà' },
          { hanzi: '晚饭', pinyin: 'wǎnfàn', vietnamese: 'bữa tối' },
          { hanzi: '开始', pinyin: 'kāishǐ', vietnamese: 'bắt đầu' },
          { hanzi: '洗菜', pinyin: 'xǐ cài', vietnamese: 'rửa rau' },
          { hanzi: '下班', pinyin: 'xiàbān', vietnamese: 'tan làm' },
          { hanzi: '简单', pinyin: 'jiǎndān', vietnamese: 'đơn giản' }
        ],
        questions: [
          { question: '“我”先做什么？', options: ['洗菜', '吃水果', '去上班'], answer: 0, explanation: '第二句 nói “我”先洗菜，再放水果。' },
          { question: '谁下班以后回来？', options: ['妈妈', '爸爸', '老师'], answer: 1, explanation: '第三句说爸爸下班回来。' }
        ]
      },
      {
        id: 'hsk1-market-day-03', title: 'Một món quà nhỏ', titleZh: '一个小礼物',
        sentences: [
          { chinese: '吃完晚饭，妈妈给我一个苹果。', pinyin: 'Chī wán wǎnfàn, māma gěi wǒ yí ge píngguǒ.', vietnamese: 'Ăn tối xong, mẹ đưa cho tôi một quả táo.' },
          { chinese: '她说，今天我帮忙做事，做得很好。', pinyin: 'Tā shuō, jīntiān wǒ bāngmáng zuò shì, zuò de hěn hǎo.', vietnamese: 'Mẹ nói hôm nay tôi đã giúp làm việc nhà rất tốt.' },
          { chinese: '我说谢谢，也想明天继续帮忙。', pinyin: 'Wǒ shuō xièxie, yě xiǎng míngtiān jìxù bāngmáng.', vietnamese: 'Tôi nói cảm ơn và cũng muốn ngày mai tiếp tục giúp đỡ.' }
        ],
        vocabulary: [
          { hanzi: '吃完', pinyin: 'chī wán', vietnamese: 'ăn xong' },
          { hanzi: '给', pinyin: 'gěi', vietnamese: 'đưa; cho' },
          { hanzi: '帮忙', pinyin: 'bāngmáng', vietnamese: 'giúp đỡ' },
          { hanzi: '继续', pinyin: 'jìxù', vietnamese: 'tiếp tục' }
        ],
        questions: [
          { question: '妈妈给“我”什么？', options: ['一个苹果', '一本书', '一杯水'], answer: 0, explanation: '第一句说妈妈给“我”一个苹果。' },
          { question: '“我”明天想做什么？', options: ['继续帮忙', '不做事情', '去市场买书'], answer: 0, explanation: '最后一句说“我”明天也想继续帮忙。' }
        ]
      }
    ]
  },
  {
    id: 'hsk2-first-trip', title: 'Chuyến đi đầu tiên bằng tàu', titleZh: '第一次坐火车', level: 'HSK 2',
    topic: 'Du lịch · Giao thông', description: 'Một chuyến đi ngắn giúp người học luyện kể lại kế hoạch, trải nghiệm và cảm xúc.',
    chapters: [
      {
        id: 'hsk2-first-trip-01', title: 'Chuẩn bị lên đường', titleZh: '出发以前',
        sentences: [
          { chinese: '这个周末，我要和朋友坐火车去一个小城市。', pinyin: 'Zhège zhōumò, wǒ yào hé péngyou zuò huǒchē qù yí ge xiǎo chéngshì.', vietnamese: 'Cuối tuần này, tôi sẽ cùng bạn đi tàu hỏa đến một thành phố nhỏ.' },
          { chinese: '我们已经买好了车票，也订了旅馆。', pinyin: 'Wǒmen yǐjīng mǎi hǎo le chēpiào, yě dìng le lǚguǎn.', vietnamese: 'Chúng tôi đã mua vé tàu và cũng đặt khách sạn rồi.' },
          { chinese: '我把衣服、手机和一本书放进包里。', pinyin: 'Wǒ bǎ yīfu, shǒujī hé yì běn shū fàng jìn bāo lǐ.', vietnamese: 'Tôi bỏ quần áo, điện thoại và một quyển sách vào túi.' },
          { chinese: '朋友提醒我早点儿睡觉，别忘了明天的时间。', pinyin: 'Péngyou tíxǐng wǒ zǎodiǎnr shuìjiào, bié wàng le míngtiān de shíjiān.', vietnamese: 'Bạn nhắc tôi ngủ sớm và đừng quên giờ khởi hành ngày mai.' }
        ],
        vocabulary: [
          { hanzi: '周末', pinyin: 'zhōumò', vietnamese: 'cuối tuần' },
          { hanzi: '火车', pinyin: 'huǒchē', vietnamese: 'tàu hỏa' },
          { hanzi: '车票', pinyin: 'chēpiào', vietnamese: 'vé tàu xe' },
          { hanzi: '旅馆', pinyin: 'lǚguǎn', vietnamese: 'nhà nghỉ; khách sạn nhỏ' },
          { hanzi: '提醒', pinyin: 'tíxǐng', vietnamese: 'nhắc nhở' },
          { hanzi: '早点儿', pinyin: 'zǎodiǎnr', vietnamese: 'sớm một chút' }
        ],
        questions: [
          { question: '他们怎么去小城市？', options: ['坐火车', '坐飞机', '骑自行车'], answer: 0, explanation: '第一句说明他们坐火车出行。' },
          { question: '朋友提醒“我”什么？', options: ['早点儿睡觉', '多买衣服', '带很多书'], answer: 0, explanation: '最后一句提醒早点儿睡觉并记住时间。' }
        ]
      },
      {
        id: 'hsk2-first-trip-02', title: 'Đến thành phố mới', titleZh: '到了新城市',
        sentences: [
          { chinese: '火车准时到了，我们先去旅馆放下东西。', pinyin: 'Huǒchē zhǔnshí dào le, wǒmen xiān qù lǚguǎn fàngxià dōngxi.', vietnamese: 'Tàu đến đúng giờ, chúng tôi đến khách sạn cất đồ trước.' },
          { chinese: '旅馆离火车站不远，走路十分钟就到了。', pinyin: 'Lǚguǎn lí huǒchēzhàn bù yuǎn, zǒulù shí fēnzhōng jiù dào le.', vietnamese: 'Khách sạn không xa ga tàu, đi bộ mười phút là tới.' },
          { chinese: '下午我们在老街散步，还吃了当地的小吃。', pinyin: 'Xiàwǔ wǒmen zài lǎojiē sànbù, hái chī le dāngdì de xiǎochī.', vietnamese: 'Buổi chiều chúng tôi đi dạo ở phố cổ và ăn món ăn vặt địa phương.' },
          { chinese: '我觉得这次旅行很轻松，也很有意思。', pinyin: 'Wǒ juéde zhè cì lǚxíng hěn qīngsōng, yě hěn yǒu yìsi.', vietnamese: 'Tôi thấy chuyến đi lần này rất thoải mái và thú vị.' }
        ],
        vocabulary: [
          { hanzi: '准时', pinyin: 'zhǔnshí', vietnamese: 'đúng giờ' },
          { hanzi: '火车站', pinyin: 'huǒchēzhàn', vietnamese: 'ga tàu hỏa' },
          { hanzi: '离', pinyin: 'lí', vietnamese: 'cách; cách xa' },
          { hanzi: '散步', pinyin: 'sànbù', vietnamese: 'đi dạo' },
          { hanzi: '当地', pinyin: 'dāngdì', vietnamese: 'địa phương' },
          { hanzi: '轻松', pinyin: 'qīngsōng', vietnamese: 'thoải mái; nhẹ nhàng' }
        ],
        questions: [
          { question: '旅馆离火车站远吗？', options: ['不远', '很远', '不知道'], answer: 0, explanation: '第二句说旅馆离火车站不远。' },
          { question: '他们下午做什么？', options: ['在老街散步', '去学校上课', '马上坐火车回家'], answer: 0, explanation: '第三句说他们在老街散步、吃小吃。' }
        ]
      }
    ]
  },
  {
    id: 'hsk3-learning-habit', title: 'Xây dựng thói quen học tập', titleZh: '养成学习习惯', level: 'HSK 3',
    topic: 'Học tập · Quản lý thời gian', description: 'Một người học thay đổi cách học để ghi nhớ lâu hơn và bớt căng thẳng.',
    chapters: [
      {
        id: 'hsk3-learning-habit-01', title: 'Thay đổi cách học', titleZh: '改变学习方法',
        sentences: [
          { chinese: '以前我总是在考试前一天才开始复习，所以常常觉得时间不够。', pinyin: 'Yǐqián wǒ zǒngshì zài kǎoshì qián yì tiān cái kāishǐ fùxí, suǒyǐ chángcháng juéde shíjiān bú gòu.', vietnamese: 'Trước đây tôi luôn đợi đến một ngày trước kỳ thi mới bắt đầu ôn tập, vì vậy thường cảm thấy không đủ thời gian.' },
          { chinese: '后来，老师建议我每天安排一小段时间学习。', pinyin: 'Hòulái, lǎoshī jiànyì wǒ měitiān ānpái yì xiǎo duàn shíjiān xuéxí.', vietnamese: 'Sau đó, giáo viên khuyên tôi sắp xếp một khoảng thời gian ngắn để học mỗi ngày.' },
          { chinese: '我把新词写下来，再用自己的话造句。', pinyin: 'Wǒ bǎ xīn cí xiě xiàlái, zài yòng zìjǐ de huà zàojù.', vietnamese: 'Tôi ghi từ mới lại rồi dùng lời của mình đặt câu.' },
          { chinese: '这样虽然每天学得不多，但是记得比较牢。', pinyin: 'Zhèyàng suīrán měitiān xué de bù duō, dànshì jì de bǐjiào láo.', vietnamese: 'Cách này tuy mỗi ngày học không nhiều nhưng ghi nhớ khá chắc.' }
        ],
        vocabulary: [
          { hanzi: '复习', pinyin: 'fùxí', vietnamese: 'ôn tập' },
          { hanzi: '安排', pinyin: 'ānpái', vietnamese: 'sắp xếp' },
          { hanzi: '建议', pinyin: 'jiànyì', vietnamese: 'đề nghị; khuyên' },
          { hanzi: '造句', pinyin: 'zàojù', vietnamese: 'đặt câu' },
          { hanzi: '虽然', pinyin: 'suīrán', vietnamese: 'mặc dù' },
          { hanzi: '牢', pinyin: 'láo', vietnamese: 'chắc; vững' }
        ],
        questions: [
          { question: '以前“我”什么时候开始复习？', options: ['考试前一天', '每天早上', '考试以后'], answer: 0, explanation: '第一句说以前总在考试前一天才复习。' },
          { question: '新方法有什么好处？', options: ['记得比较牢', '不用学习', '每天花更多时间'], answer: 0, explanation: '最后一句说明记忆变得比较牢。' }
        ]
      },
      {
        id: 'hsk3-learning-habit-02', title: 'Kiên trì mỗi ngày', titleZh: '每天坚持一点儿',
        sentences: [
          { chinese: '刚开始的时候，我有时会忘记学习计划。', pinyin: 'Gāng kāishǐ de shíhou, wǒ yǒushí huì wàngjì xuéxí jìhuà.', vietnamese: 'Lúc mới bắt đầu, đôi khi tôi quên kế hoạch học tập.' },
          { chinese: '于是我在日历上写下每天要完成的小任务。', pinyin: 'Yúshì wǒ zài rìlì shàng xiě xià měitiān yào wánchéng de xiǎo rènwu.', vietnamese: 'Vì thế tôi ghi những nhiệm vụ nhỏ cần hoàn thành mỗi ngày lên lịch.' },
          { chinese: '完成以后，我会检查哪里还不明白，并在第二天继续练习。', pinyin: 'Wánchéng yǐhòu, wǒ huì jiǎnchá nǎlǐ hái bù míngbai, bìng zài dì èr tiān jìxù liànxí.', vietnamese: 'Sau khi hoàn thành, tôi kiểm tra chỗ nào chưa hiểu và tiếp tục luyện tập vào ngày hôm sau.' },
          { chinese: '几个月以后，我发现自己比以前更有信心了。', pinyin: 'Jǐ ge yuè yǐhòu, wǒ fāxiàn zìjǐ bǐ yǐqián gèng yǒu xìnxīn le.', vietnamese: 'Vài tháng sau, tôi nhận ra mình tự tin hơn trước.' }
        ],
        vocabulary: [
          { hanzi: '计划', pinyin: 'jìhuà', vietnamese: 'kế hoạch' },
          { hanzi: '日历', pinyin: 'rìlì', vietnamese: 'lịch' },
          { hanzi: '完成', pinyin: 'wánchéng', vietnamese: 'hoàn thành' },
          { hanzi: '任务', pinyin: 'rènwu', vietnamese: 'nhiệm vụ' },
          { hanzi: '检查', pinyin: 'jiǎnchá', vietnamese: 'kiểm tra' },
          { hanzi: '信心', pinyin: 'xìnxīn', vietnamese: 'sự tự tin' }
        ],
        questions: [
          { question: '“我”把小任务写在哪里？', options: ['日历上', '课本里面', '桌子下面'], answer: 0, explanation: '第二句说把任务写在日历上。' },
          { question: '几个月以后，“我”有什么变化？', options: ['更有信心', '不再学习', '更容易忘记'], answer: 0, explanation: '最后一句说自己更有信心了。' }
        ]
      }
    ]
  },
  {
    id: 'hsk4-workplace-team', title: 'Một nhóm làm việc hiệu quả', titleZh: '高效的团队合作', level: 'HSK 4',
    topic: 'Công việc · Hợp tác', description: 'Một nhóm học cách phân chia trách nhiệm và xử lý bất đồng trong dự án.',
    chapters: [
      {
        id: 'hsk4-workplace-team-01', title: 'Phân chia trách nhiệm', titleZh: '明确各自的任务',
        sentences: [
          { chinese: '项目开始之前，负责人先召集大家讨论目标和时间安排。', pinyin: 'Xiàngmù kāishǐ zhīqián, fùzérén xiān zhàojí dàjiā tǎolùn mùbiāo hé shíjiān ānpái.', vietnamese: 'Trước khi dự án bắt đầu, người phụ trách tập hợp mọi người để thảo luận mục tiêu và lịch trình.' },
          { chinese: '每个人根据自己的经验承担不同的任务。', pinyin: 'Měi ge rén gēnjù zìjǐ de jīngyàn chéngdān bùtóng de rènwu.', vietnamese: 'Mỗi người đảm nhận nhiệm vụ khác nhau dựa trên kinh nghiệm của mình.' },
          { chinese: '为了避免重复工作，团队把重要信息记录在同一个文件里。', pinyin: 'Wèile bìmiǎn chóngfù gōngzuò, tuánduì bǎ zhòngyào xìnxī jìlù zài tóng yí ge wénjiàn lǐ.', vietnamese: 'Để tránh làm việc trùng lặp, nhóm ghi lại thông tin quan trọng trong cùng một tài liệu.' },
          { chinese: '大家都清楚自己的责任，合作也就顺利得多。', pinyin: 'Dàjiā dōu qīngchu zìjǐ de zérèn, hézuò yě jiù shùnlì de duō.', vietnamese: 'Mọi người đều hiểu rõ trách nhiệm của mình nên việc hợp tác thuận lợi hơn nhiều.' }
        ],
        vocabulary: [
          { hanzi: '负责人', pinyin: 'fùzérén', vietnamese: 'người phụ trách' },
          { hanzi: '召集', pinyin: 'zhàojí', vietnamese: 'triệu tập; tập hợp' },
          { hanzi: '承担', pinyin: 'chéngdān', vietnamese: 'đảm nhận; gánh vác' },
          { hanzi: '避免', pinyin: 'bìmiǎn', vietnamese: 'tránh' },
          { hanzi: '重复', pinyin: 'chóngfù', vietnamese: 'lặp lại; trùng lặp' },
          { hanzi: '责任', pinyin: 'zérèn', vietnamese: 'trách nhiệm' }
        ],
        questions: [
          { question: '团队为什么把信息记录在同一个文件里？', options: ['为了避免重复工作', '为了减少交流', '为了改变目标'], answer: 0, explanation: '第三句明确说明目的是避免重复工作。' },
          { question: '合作为什么变得更顺利？', options: ['每个人清楚自己的责任', '没有人承担任务', '项目没有时间安排'], answer: 0, explanation: '最后一句说明大家清楚责任后合作更顺利。' }
        ]
      },
      {
        id: 'hsk4-workplace-team-02', title: 'Giải quyết bất đồng', titleZh: '面对不同意见',
        sentences: [
          { chinese: '讨论方案时，两个同事对工作的先后顺序有不同看法。', pinyin: 'Tǎolùn fāng àn shí, liǎng ge tóngshì duì gōngzuò de xiānhòu shùnxù yǒu bùtóng kànfǎ.', vietnamese: 'Khi thảo luận phương án, hai đồng nghiệp có ý kiến khác nhau về thứ tự công việc.' },
          { chinese: '他们没有急着反对对方，而是先说明各自的理由。', pinyin: 'Tāmen méiyǒu jí zhe fǎnduì duìfāng, ér shì xiān shuōmíng gèzì de lǐyóu.', vietnamese: 'Họ không vội phản đối nhau mà trước tiên giải thích lý do của mỗi người.' },
          { chinese: '经过比较，大家发现两个建议可以结合起来。', pinyin: 'Jīngguò bǐjiào, dàjiā fāxiàn liǎng ge jiànyì kěyǐ jiéhé qǐlái.', vietnamese: 'Sau khi so sánh, mọi người nhận ra có thể kết hợp hai đề xuất.' },
          { chinese: '这次经历让团队明白，尊重不同意见有助于找到更好的办法。', pinyin: 'Zhè cì jīnglì ràng tuánduì míngbai, zūnzhòng bùtóng yìjiàn yǒuzhù yú zhǎodào gèng hǎo de bànfǎ.', vietnamese: 'Trải nghiệm này giúp cả nhóm hiểu rằng tôn trọng ý kiến khác biệt sẽ giúp tìm ra cách tốt hơn.' }
        ],
        vocabulary: [
          { hanzi: '方案', pinyin: 'fāng àn', vietnamese: 'phương án' },
          { hanzi: '顺序', pinyin: 'shùnxù', vietnamese: 'thứ tự' },
          { hanzi: '反对', pinyin: 'fǎnduì', vietnamese: 'phản đối' },
          { hanzi: '理由', pinyin: 'lǐyóu', vietnamese: 'lý do' },
          { hanzi: '结合', pinyin: 'jiéhé', vietnamese: 'kết hợp' },
          { hanzi: '尊重', pinyin: 'zūnzhòng', vietnamese: 'tôn trọng' }
        ],
        questions: [
          { question: '两位同事怎样处理不同意见？', options: ['先说明各自的理由', '马上停止讨论', '要求别人接受自己的想法'], answer: 0, explanation: '第二句说明他们先解释各自的理由。' },
          { question: '这次经历让团队明白什么？', options: ['不同意见没有价值', '尊重意见有助于找到好办法', '讨论应该越快越好'], answer: 1, explanation: '最后一句总结了尊重不同意见的作用。' }
        ]
      }
    ]
  },
  {
    id: 'hsk5-digital-life', title: 'Sống thông minh trong thời đại số', titleZh: '数字时代的生活', level: 'HSK 5',
    topic: 'Công nghệ · Đời sống', description: 'Cân nhắc lợi ích của công nghệ và cách bảo vệ sự tập trung, riêng tư.',
    chapters: [
      {
        id: 'hsk5-digital-life-01', title: 'Tiện lợi và đánh đổi', titleZh: '便利背后的代价',
        sentences: [
          { chinese: '移动支付和线上服务让日常生活变得更加方便。', pinyin: 'Yídòng zhīfù hé xiànshàng fúwù ràng rìcháng shēnghuó biànde gèngjiā fāngbiàn.', vietnamese: 'Thanh toán di động và dịch vụ trực tuyến khiến cuộc sống hằng ngày tiện lợi hơn.' },
          { chinese: '不过，便利的背后也隐藏着个人信息被过度收集的风险。', pinyin: 'Búguò, biànlì de bèihòu yě yǐncáng zhe gèrén xìnxī bèi guòdù shōují de fēngxiǎn.', vietnamese: 'Tuy nhiên, đằng sau sự tiện lợi cũng tiềm ẩn nguy cơ thông tin cá nhân bị thu thập quá mức.' },
          { chinese: '使用新服务以前，我们应该了解它需要哪些权限。', pinyin: 'Shǐyòng xīn fúwù yǐqián, wǒmen yīnggāi liǎojiě tā xūyào nǎxiē quánxiàn.', vietnamese: 'Trước khi dùng dịch vụ mới, chúng ta nên tìm hiểu dịch vụ đó cần những quyền truy cập nào.' },
          { chinese: '只有在方便与安全之间保持平衡，技术才能真正帮助我们。', pinyin: 'Zhǐyǒu zài fāngbiàn yǔ ānquán zhījiān bǎochí pínghéng, jìshù cái néng zhēnzhèng bāngzhù wǒmen.', vietnamese: 'Chỉ khi duy trì cân bằng giữa tiện lợi và an toàn, công nghệ mới thực sự giúp ích cho chúng ta.' }
        ],
        vocabulary: [
          { hanzi: '移动支付', pinyin: 'yídòng zhīfù', vietnamese: 'thanh toán di động' },
          { hanzi: '线上', pinyin: 'xiànshàng', vietnamese: 'trực tuyến' },
          { hanzi: '隐藏', pinyin: 'yǐncáng', vietnamese: 'ẩn giấu; tiềm ẩn' },
          { hanzi: '过度', pinyin: 'guòdù', vietnamese: 'quá mức' },
          { hanzi: '权限', pinyin: 'quánxiàn', vietnamese: 'quyền truy cập' },
          { hanzi: '平衡', pinyin: 'pínghéng', vietnamese: 'cân bằng' }
        ],
        questions: [
          { question: '数字服务带来什么风险？', options: ['个人信息被过度收集', '完全不能付款', '没有任何服务'], answer: 0, explanation: '第二句提到个人信息被过度收集的风险。' },
          { question: '作者建议使用新服务前做什么？', options: ['了解所需权限', '分享所有密码', '关闭所有设备'], answer: 0, explanation: '第三句建议先了解服务需要哪些权限。' }
        ]
      },
      {
        id: 'hsk5-digital-life-02', title: 'Giữ lại sự tập trung', titleZh: '重新找回注意力',
        sentences: [
          { chinese: '有些人习惯一有空就查看手机，结果很难长时间专心做一件事。', pinyin: 'Yǒuxiē rén xíguàn yí yǒu kòng jiù chákàn shǒujī, jiéguǒ hěn nán cháng shíjiān zhuānxīn zuò yí jiàn shì.', vietnamese: 'Một số người có thói quen cứ rảnh là xem điện thoại, kết quả là khó tập trung lâu vào một việc.' },
          { chinese: '为了减少干扰，可以把不重要的通知暂时关掉。', pinyin: 'Wèile jiǎnshǎo gānrǎo, kěyǐ bǎ bù zhòngyào de tōngzhī zànshí guān diào.', vietnamese: 'Để giảm xao nhãng, có thể tạm thời tắt những thông báo không quan trọng.' },
          { chinese: '工作一段时间以后，再安排短暂的休息。', pinyin: 'Gōngzuò yí duàn shíjiān yǐhòu, zài ānpái duǎnzàn de xiūxi.', vietnamese: 'Sau khi làm việc một khoảng thời gian, hãy sắp xếp một lần nghỉ ngắn.' },
          { chinese: '管理注意力并不是拒绝科技，而是主动决定何时使用它。', pinyin: 'Guǎnlǐ zhùyìlì bìng bú shì jùjué kējì, ér shì zhǔdòng juédìng héshí shǐyòng tā.', vietnamese: 'Quản lý sự chú ý không phải là từ chối công nghệ, mà là chủ động quyết định khi nào sử dụng nó.' }
        ],
        vocabulary: [
          { hanzi: '习惯', pinyin: 'xíguàn', vietnamese: 'thói quen' },
          { hanzi: '专心', pinyin: 'zhuānxīn', vietnamese: 'chuyên tâm; tập trung' },
          { hanzi: '干扰', pinyin: 'gānrǎo', vietnamese: 'làm phiền; xao nhãng' },
          { hanzi: '通知', pinyin: 'tōngzhī', vietnamese: 'thông báo' },
          { hanzi: '暂时', pinyin: 'zànshí', vietnamese: 'tạm thời' },
          { hanzi: '主动', pinyin: 'zhǔdòng', vietnamese: 'chủ động' }
        ],
        questions: [
          { question: '为什么有些人很难长时间专心？', options: ['总是查看手机', '没有手机', '工作太少'], answer: 0, explanation: '第一句说明频繁查看手机影响专注。' },
          { question: '管理注意力意味着什么？', options: ['完全拒绝科技', '主动决定何时使用科技', '一直打开通知'], answer: 1, explanation: '最后一句给出了作者对管理注意力的解释。' }
        ]
      }
    ]
  },
  {
    id: 'hsk6-critical-thinking', title: 'Tư duy độc lập trước thông tin', titleZh: '信息时代的独立思考', level: 'HSK 6',
    topic: 'Tư duy phản biện · Truyền thông', description: 'Phân tích nguồn tin, bằng chứng và thiên kiến trước khi hình thành kết luận.',
    chapters: [
      {
        id: 'hsk6-critical-thinking-01', title: 'Đừng vội tin tiêu đề', titleZh: '不要被标题左右',
        sentences: [
          { chinese: '信息传播的速度越来越快，吸引眼球的标题往往比完整的事实更容易被转发。', pinyin: 'Xìnxī chuánbō de sùdù yuèláiyuè kuài, xīyǐn yǎnqiú de biāotí wǎngwǎng bǐ wánzhěng de shìshí gèng róngyì bèi zhuǎnfā.', vietnamese: 'Thông tin lan truyền ngày càng nhanh; những tiêu đề gây chú ý thường dễ được chia sẻ hơn cả sự thật đầy đủ.' },
          { chinese: '然而，标题只是对内容的概括，有时甚至带有明显的情绪倾向。', pinyin: 'Rán’ér, biāotí zhǐ shì duì nèiróng de gàikuò, yǒushí shènzhì dàiyǒu míngxiǎn de qíngxù qīngxiàng.', vietnamese: 'Tuy nhiên, tiêu đề chỉ là phần khái quát nội dung và đôi khi còn mang khuynh hướng cảm xúc rõ rệt.' },
          { chinese: '阅读消息时，我们应当查看原始来源，并区分事实、解释和个人判断。', pinyin: 'Yuèdú xiāoxi shí, wǒmen yīngdāng chákàn yuánshǐ láiyuán, bìng qūfēn shìshí, jiěshì hé gèrén pànduàn.', vietnamese: 'Khi đọc tin, chúng ta nên kiểm tra nguồn gốc ban đầu và phân biệt sự kiện, cách diễn giải với nhận định cá nhân.' },
          { chinese: '暂缓转发并不代表冷漠，而是给核实信息留下必要的时间。', pinyin: 'Zànhuǎn zhuǎnfā bìng bù dàibiǎo lěngmò, ér shì gěi héshí xìnxī liúxià bìyào de shíjiān.', vietnamese: 'Chậm chia sẻ không có nghĩa là thờ ơ, mà là dành thời gian cần thiết để xác minh thông tin.' }
        ],
        vocabulary: [
          { hanzi: '传播', pinyin: 'chuánbō', vietnamese: 'lan truyền; truyền bá' },
          { hanzi: '吸引眼球', pinyin: 'xīyǐn yǎnqiú', vietnamese: 'thu hút sự chú ý' },
          { hanzi: '概括', pinyin: 'gàikuò', vietnamese: 'khái quát' },
          { hanzi: '倾向', pinyin: 'qīngxiàng', vietnamese: 'khuynh hướng' },
          { hanzi: '区分', pinyin: 'qūfēn', vietnamese: 'phân biệt' },
          { hanzi: '核实', pinyin: 'héshí', vietnamese: 'xác minh' }
        ],
        questions: [
          { question: '作者建议读者怎样处理消息？', options: ['查看原始来源并区分不同内容', '只看标题', '看到就马上转发'], answer: 0, explanation: '第三句提出查看来源并区分事实、解释和判断。' },
          { question: '暂缓转发的意义是什么？', options: ['给核实信息留下时间', '表示不关心社会', '让消息消失'], answer: 0, explanation: '最后一句说明暂缓转发是为了核实信息。' }
        ]
      },
      {
        id: 'hsk6-critical-thinking-02', title: 'Bằng chứng và kết luận', titleZh: '证据与结论',
        sentences: [
          { chinese: '面对一个看似合理的观点，我们仍然需要追问它依据什么证据。', pinyin: 'Miànduì yí ge kànshì hélǐ de guāndiǎn, wǒmen réngrán xūyào zhuīwèn tā yījù shénme zhèngjù.', vietnamese: 'Khi đối diện một quan điểm có vẻ hợp lý, chúng ta vẫn cần hỏi nó dựa trên bằng chứng nào.' },
          { chinese: '单独一个例子可以帮助理解问题，却不足以证明普遍规律。', pinyin: 'Dāndú yí ge lìzi kěyǐ bāngzhù lǐjiě wèntí, què bù zúyǐ zhèngmíng pǔbiàn guīlǜ.', vietnamese: 'Một ví dụ riêng lẻ có thể giúp hiểu vấn đề nhưng chưa đủ để chứng minh quy luật phổ quát.' },
          { chinese: '如果新证据与原来的判断不一致，我们应该愿意重新检查自己的想法。', pinyin: 'Rúguǒ xīn zhèngjù yǔ yuánlái de pànduàn bù yízhì, wǒmen yīnggāi yuànyì chóngxīn jiǎnchá zìjǐ de xiǎngfǎ.', vietnamese: 'Nếu bằng chứng mới không phù hợp với nhận định ban đầu, chúng ta nên sẵn sàng xem xét lại suy nghĩ của mình.' },
          { chinese: '独立思考不是永远坚持原来的答案，而是根据可靠证据不断修正结论。', pinyin: 'Dúlì sīkǎo bú shì yǒngyuǎn jiānchí yuánlái de dá àn, ér shì gēnjù kěkào zhèngjù búduàn xiūzhèng jiélùn.', vietnamese: 'Tư duy độc lập không phải luôn giữ đáp án cũ, mà là liên tục điều chỉnh kết luận dựa trên bằng chứng đáng tin cậy.' }
        ],
        vocabulary: [
          { hanzi: '观点', pinyin: 'guāndiǎn', vietnamese: 'quan điểm' },
          { hanzi: '依据', pinyin: 'yījù', vietnamese: 'căn cứ; dựa vào' },
          { hanzi: '证据', pinyin: 'zhèngjù', vietnamese: 'bằng chứng' },
          { hanzi: '普遍', pinyin: 'pǔbiàn', vietnamese: 'phổ biến; phổ quát' },
          { hanzi: '一致', pinyin: 'yízhì', vietnamese: 'nhất quán; phù hợp' },
          { hanzi: '修正', pinyin: 'xiūzhèng', vietnamese: 'điều chỉnh; sửa lại' }
        ],
        questions: [
          { question: '一个例子能否证明普遍规律？', options: ['总是可以', '通常不足以证明', '完全没有帮助'], answer: 1, explanation: '第二句说明单独一个例子不足以证明普遍规律。' },
          { question: '作者怎样理解独立思考？', options: ['永远不改变答案', '根据可靠证据修正结论', '只相信自己的感觉'], answer: 1, explanation: '最后一句给出了独立思考的核心定义。' }
        ]
      }
    ]
  }
];
