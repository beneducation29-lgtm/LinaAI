import type { ReadingStorySeries } from './readingStorySeries';

/**
 * Original LinaAI magazine-style readings inspired by the topic-led, graded
 * reading discovery patterns seen across FoxHSK. No source article text is copied.
 */
export const READING_MAGAZINE_SERIES: ReadingStorySeries[] = [
  {
    id: 'magazine-hsk1-daily-life', title: 'Nhịp sống mỗi ngày', titleZh: '每天的生活',
    level: 'HSK 1', topic: 'Đời sống · Thói quen', description: 'Những bài đọc ngắn về lịch sinh hoạt, gia đình và các việc quen thuộc.',
    chapters: [
      { id: 'mag-hsk1-daily-01', title: 'Một buổi sáng bận rộn', titleZh: '忙碌的早上',
        sentences: [
          { chinese: '每天早上，安娜七点起床。', pinyin: 'Měitiān zǎoshang, Ānnà qī diǎn qǐchuáng.', vietnamese: 'Mỗi sáng, Anna thức dậy lúc bảy giờ.' },
          { chinese: '她先洗脸，然后吃早饭。', pinyin: 'Tā xiān xǐ liǎn, ránhòu chī zǎofàn.', vietnamese: 'Cô ấy rửa mặt trước, sau đó ăn sáng.' },
          { chinese: '她喜欢喝牛奶，也喜欢吃鸡蛋。', pinyin: 'Tā xǐhuan hē niúnǎi, yě xǐhuan chī jīdàn.', vietnamese: 'Cô ấy thích uống sữa và cũng thích ăn trứng.' },
          { chinese: '八点，她坐公共汽车去公司。', pinyin: 'Bā diǎn, tā zuò gōnggòng qìchē qù gōngsī.', vietnamese: 'Tám giờ, cô ấy đi xe buýt đến công ty.' }
        ],
        vocabulary: [
          { hanzi: '每天', pinyin: 'měitiān', vietnamese: 'mỗi ngày' }, { hanzi: '起床', pinyin: 'qǐchuáng', vietnamese: 'thức dậy' },
          { hanzi: '先', pinyin: 'xiān', vietnamese: 'trước tiên' }, { hanzi: '然后', pinyin: 'ránhòu', vietnamese: 'sau đó' },
          { hanzi: '洗脸', pinyin: 'xǐ liǎn', vietnamese: 'rửa mặt' }, { hanzi: '公共汽车', pinyin: 'gōnggòng qìchē', vietnamese: 'xe buýt' }
        ],
        questions: [
          { question: '安娜几点起床？', options: ['六点', '七点', '八点'], answer: 1, explanation: '第一句说她七点起床。' },
          { question: '她怎么去公司？', options: ['坐公共汽车', '走路', '坐飞机'], answer: 0, explanation: '最后一句说她坐公共汽车去公司。' }
        ]
      },
      { id: 'mag-hsk1-daily-02', title: 'Buổi tối yên bình', titleZh: '安静的晚上',
        sentences: [
          { chinese: '晚上六点，安娜回到家。', pinyin: 'Wǎnshang liù diǎn, Ānnà huí dào jiā.', vietnamese: 'Sáu giờ tối, Anna về đến nhà.' },
          { chinese: '她和妈妈一起做饭。', pinyin: 'Tā hé māma yìqǐ zuò fàn.', vietnamese: 'Cô ấy cùng mẹ nấu ăn.' },
          { chinese: '吃完饭，她看一会儿书。', pinyin: 'Chī wán fàn, tā kàn yíhuìr shū.', vietnamese: 'Ăn cơm xong, cô ấy đọc sách một lát.' },
          { chinese: '九点半，她准备睡觉。', pinyin: 'Jiǔ diǎn bàn, tā zhǔnbèi shuìjiào.', vietnamese: 'Chín giờ rưỡi, cô ấy chuẩn bị đi ngủ.' }
        ],
        vocabulary: [
          { hanzi: '回到', pinyin: 'huí dào', vietnamese: 'trở về; về đến' }, { hanzi: '一起', pinyin: 'yìqǐ', vietnamese: 'cùng nhau' },
          { hanzi: '做饭', pinyin: 'zuò fàn', vietnamese: 'nấu ăn' }, { hanzi: '吃完', pinyin: 'chī wán', vietnamese: 'ăn xong' },
          { hanzi: '一会儿', pinyin: 'yíhuìr', vietnamese: 'một lát' }, { hanzi: '睡觉', pinyin: 'shuìjiào', vietnamese: 'đi ngủ' }
        ],
        questions: [
          { question: '安娜和谁做饭？', options: ['爸爸', '妈妈', '朋友'], answer: 1, explanation: '第二句说她和妈妈一起做饭。' },
          { question: '她几点准备睡觉？', options: ['八点半', '九点', '九点半'], answer: 2, explanation: '最后一句说九点半准备睡觉。' }
        ]
      }
    ]
  },
  {
    id: 'magazine-hsk2-city-weekend', title: 'Cuối tuần khám phá thành phố', titleZh: '周末逛城市',
    level: 'HSK 2', topic: 'Thành phố · Giao thông · Mua sắm', description: 'Một chuyến đi trong ngày giúp luyện đọc biển chỉ dẫn và kể lại trải nghiệm.',
    chapters: [
      { id: 'mag-hsk2-city-01', title: 'Tìm đường đến bảo tàng', titleZh: '怎么去博物馆',
        sentences: [
          { chinese: '星期六上午，我和姐姐打算去市中心的博物馆。', pinyin: 'Xīngqīliù shàngwǔ, wǒ hé jiějie dǎsuàn qù shì zhōngxīn de bówùguǎn.', vietnamese: 'Sáng thứ Bảy, tôi và chị gái định đến bảo tàng ở trung tâm thành phố.' },
          { chinese: '我们先坐地铁，再走五分钟就到了。', pinyin: 'Wǒmen xiān zuò dìtiě, zài zǒu wǔ fēnzhōng jiù dào le.', vietnamese: 'Chúng tôi đi tàu điện ngầm trước, sau đó đi bộ năm phút là đến.' },
          { chinese: '路上有很多商店，不过今天我们不打算买东西。', pinyin: 'Lùshang yǒu hěn duō shāngdiàn, búguò jīntiān wǒmen bù dǎsuàn mǎi dōngxi.', vietnamese: 'Trên đường có nhiều cửa hàng, nhưng hôm nay chúng tôi không định mua sắm.' },
          { chinese: '姐姐说，了解一座城市也可以从它的历史开始。', pinyin: 'Jiějie shuō, liǎojiě yí zuò chéngshì yě kěyǐ cóng tā de lìshǐ kāishǐ.', vietnamese: 'Chị nói rằng tìm hiểu một thành phố cũng có thể bắt đầu từ lịch sử của nó.' }
        ],
        vocabulary: [
          { hanzi: '市中心', pinyin: 'shì zhōngxīn', vietnamese: 'trung tâm thành phố' }, { hanzi: '博物馆', pinyin: 'bówùguǎn', vietnamese: 'bảo tàng' },
          { hanzi: '地铁', pinyin: 'dìtiě', vietnamese: 'tàu điện ngầm' }, { hanzi: '分钟', pinyin: 'fēnzhōng', vietnamese: 'phút' },
          { hanzi: '打算', pinyin: 'dǎsuàn', vietnamese: 'dự định' }, { hanzi: '历史', pinyin: 'lìshǐ', vietnamese: 'lịch sử' }
        ],
        questions: [
          { question: '他们怎么去博物馆？', options: ['坐出租车', '坐地铁再走路', '坐公共汽车'], answer: 1, explanation: '第二句说明先坐地铁，再走五分钟。' },
          { question: '他们今天打算买东西吗？', options: ['打算', '不打算', '还不知道'], answer: 1, explanation: '第三句说今天不打算买东西。' }
        ]
      },
      { id: 'mag-hsk2-city-02', title: 'Một tấm bản đồ hữu ích', titleZh: '一张有用的地图',
        sentences: [
          { chinese: '进了博物馆以后，我们拿了一张免费的地图。', pinyin: 'Jìn le bówùguǎn yǐhòu, wǒmen ná le yì zhāng miǎnfèi de dìtú.', vietnamese: 'Sau khi vào bảo tàng, chúng tôi lấy một tấm bản đồ miễn phí.' },
          { chinese: '地图上写着每个展厅的名字和开放时间。', pinyin: 'Dìtú shàng xiězhe měi ge zhǎntīng de míngzi hé kāifàng shíjiān.', vietnamese: 'Trên bản đồ ghi tên và giờ mở cửa của từng phòng trưng bày.' },
          { chinese: '我们按照地图参观，没有错过最重要的展览。', pinyin: 'Wǒmen ànzhào dìtú cānguān, méiyǒu cuòguò zuì zhòngyào de zhǎnlǎn.', vietnamese: 'Chúng tôi tham quan theo bản đồ nên không bỏ lỡ triển lãm quan trọng nhất.' },
          { chinese: '回家以前，我们还在附近吃了晚饭。', pinyin: 'Huí jiā yǐqián, wǒmen hái zài fùjìn chī le wǎnfàn.', vietnamese: 'Trước khi về nhà, chúng tôi còn ăn tối ở gần đó.' }
        ],
        vocabulary: [
          { hanzi: '免费', pinyin: 'miǎnfèi', vietnamese: 'miễn phí' }, { hanzi: '地图', pinyin: 'dìtú', vietnamese: 'bản đồ' },
          { hanzi: '展厅', pinyin: 'zhǎntīng', vietnamese: 'phòng trưng bày' }, { hanzi: '开放', pinyin: 'kāifàng', vietnamese: 'mở cửa' },
          { hanzi: '按照', pinyin: 'ànzhào', vietnamese: 'theo; căn cứ theo' }, { hanzi: '错过', pinyin: 'cuòguò', vietnamese: 'bỏ lỡ' }
        ],
        questions: [
          { question: '地图上有什么信息？', options: ['展厅名字和开放时间', '餐厅价格', '公交车票价'], answer: 0, explanation: '第二句提到名字和开放时间。' },
          { question: '他们为什么没有错过重要展览？', options: ['因为有人带路', '因为按照地图参观', '因为展览很短'], answer: 1, explanation: '第三句说明他们按照地图参观。' }
        ]
      }
    ]
  },
  {
    id: 'magazine-hsk3-learning-method', title: 'Học ngoại ngữ hiệu quả', titleZh: '怎样有效地学习外语',
    level: 'HSK 3', topic: 'Giáo dục · Phương pháp học', description: 'Một bài đọc thực tế về mục tiêu nhỏ, ôn tập và sử dụng kiến thức.',
    chapters: [
      { id: 'mag-hsk3-learning-01', title: 'Mục tiêu vừa sức', titleZh: '设定合适的目标',
        sentences: [
          { chinese: '刚开始学习一门外语时，很多人希望很快看到明显的进步。', pinyin: 'Gāng kāishǐ xuéxí yì mén wàiyǔ shí, hěn duō rén xīwàng hěn kuài kàn dào míngxiǎn de jìnbù.', vietnamese: 'Khi mới bắt đầu học một ngoại ngữ, nhiều người mong sớm nhìn thấy sự tiến bộ rõ rệt.' },
          { chinese: '可是，如果每天安排太多任务，反而容易失去兴趣。', pinyin: 'Kěshì, rúguǒ měitiān ānpái tài duō rènwu, fǎn’ér róngyì shīqù xìngqù.', vietnamese: 'Nhưng nếu mỗi ngày sắp xếp quá nhiều nhiệm vụ, người học lại dễ mất hứng thú.' },
          { chinese: '比较好的办法是把大目标分成几个可以完成的小步骤。', pinyin: 'Bǐjiào hǎo de bànfǎ shì bǎ dà mùbiāo fēn chéng jǐ ge kěyǐ wánchéng de xiǎo bùzhòu.', vietnamese: 'Cách tốt hơn là chia mục tiêu lớn thành một vài bước nhỏ có thể hoàn thành.' },
          { chinese: '例如，每天学习十个新词，再用它们说几个句子。', pinyin: 'Lìrú, měitiān xuéxí shí ge xīn cí, zài yòng tāmen shuō jǐ ge jùzi.', vietnamese: 'Ví dụ, mỗi ngày học mười từ mới rồi dùng chúng nói vài câu.' }
        ],
        vocabulary: [
          { hanzi: '外语', pinyin: 'wàiyǔ', vietnamese: 'ngoại ngữ' }, { hanzi: '明显', pinyin: 'míngxiǎn', vietnamese: 'rõ rệt' },
          { hanzi: '安排', pinyin: 'ānpái', vietnamese: 'sắp xếp' }, { hanzi: '反而', pinyin: 'fǎn’ér', vietnamese: 'ngược lại' },
          { hanzi: '失去', pinyin: 'shīqù', vietnamese: 'mất đi' }, { hanzi: '步骤', pinyin: 'bùzhòu', vietnamese: 'bước; trình tự' }
        ],
        questions: [
          { question: '为什么任务太多可能不好？', options: ['容易失去兴趣', '一定学得更快', '不需要复习'], answer: 0, explanation: '第二句说明任务太多容易让人失去兴趣。' },
          { question: '作者建议怎样设定目标？', options: ['每天完成很多大任务', '把大目标分成小步骤', '只在周末学习'], answer: 1, explanation: '第三句直接提出把大目标分成小步骤。' }
        ]
      },
      { id: 'mag-hsk3-learning-02', title: 'Đừng chỉ học từ mới', titleZh: '不要只记新词',
        sentences: [
          { chinese: '记住一个词并不代表真正会使用它。', pinyin: 'Jìzhù yí ge cí bìng bù dàibiǎo zhēnzhèng huì shǐyòng tā.', vietnamese: 'Nhớ được một từ không có nghĩa là thực sự biết sử dụng từ đó.' },
          { chinese: '学习者应该把新词放进句子和真实的对话里。', pinyin: 'Xuéxízhě yīnggāi bǎ xīn cí fàng jìn jùzi hé zhēnshí de duìhuà lǐ.', vietnamese: 'Người học nên đặt từ mới vào câu và những đoạn hội thoại thực tế.' },
          { chinese: '隔一天再回忆一次，也能帮助大脑保存信息。', pinyin: 'Gé yì tiān zài huíyì yí cì, yě néng bāngzhù dà nǎo bǎocún xìnxī.', vietnamese: 'Ôn nhớ lại sau một ngày cũng có thể giúp não bộ lưu giữ thông tin.' },
          { chinese: '学得慢一点没有关系，重要的是持续练习。', pinyin: 'Xué de màn yìdiǎn méiyǒu guānxi, zhòngyào de shì chíxù liànxí.', vietnamese: 'Học chậm hơn một chút cũng không sao, điều quan trọng là luyện tập đều đặn.' }
        ],
        vocabulary: [
          { hanzi: '代表', pinyin: 'dàibiǎo', vietnamese: 'đại diện; có nghĩa là' }, { hanzi: '使用', pinyin: 'shǐyòng', vietnamese: 'sử dụng' },
          { hanzi: '学习者', pinyin: 'xuéxízhě', vietnamese: 'người học' }, { hanzi: '真实', pinyin: 'zhēnshí', vietnamese: 'thực tế' },
          { hanzi: '回忆', pinyin: 'huíyì', vietnamese: 'hồi tưởng; nhớ lại' }, { hanzi: '持续', pinyin: 'chíxù', vietnamese: 'duy trì; liên tục' }
        ],
        questions: [
          { question: '记住一个词以后，还应该做什么？', options: ['马上忘掉它', '在句子和对话中使用', '只抄写很多遍'], answer: 1, explanation: '第二句建议把新词放进句子和真实对话。' },
          { question: '作者认为最重要的是什么？', options: ['持续练习', '学习速度', '一次学很多词'], answer: 0, explanation: '最后一句强调持续练习。' }
        ]
      }
    ]
  },
  {
    id: 'magazine-hsk4-digital-payment', title: 'Thanh toán không tiền mặt', titleZh: '无现金支付的生活',
    level: 'HSK 4', topic: 'Công nghệ · Đời sống hiện đại', description: 'Tìm hiểu sự tiện lợi và những lưu ý khi sử dụng thanh toán số.',
    chapters: [
      { id: 'mag-hsk4-payment-01', title: 'Sự tiện lợi của thanh toán số', titleZh: '数字支付带来的方便',
        sentences: [
          { chinese: '随着移动互联网的发展，数字支付已经进入许多人的日常生活。', pinyin: 'Suízhe yídòng hùliánwǎng de fāzhǎn, shùzì zhīfù yǐjīng jìnrù xǔduō rén de rìcháng shēnghuó.', vietnamese: 'Cùng với sự phát triển của internet di động, thanh toán số đã đi vào đời sống hằng ngày của nhiều người.' },
          { chinese: '买东西时，只要打开手机应用，扫描二维码就可以完成付款。', pinyin: 'Mǎi dōngxi shí, zhǐyào dǎkāi shǒujī yìngyòng, sǎomiáo èrwéimǎ jiù kěyǐ wánchéng fùkuǎn.', vietnamese: 'Khi mua đồ, chỉ cần mở ứng dụng điện thoại và quét mã QR là có thể thanh toán.' },
          { chinese: '这种方式减少了携带现金的麻烦，也让交易速度更快。', pinyin: 'Zhè zhǒng fāngshì jiǎnshǎo le xiédài xiànjīn de máfan, yě ràng jiāoyì sùdù gèng kuài.', vietnamese: 'Cách này giảm phiền phức khi mang tiền mặt và giúp giao dịch nhanh hơn.' },
          { chinese: '不过，方便并不意味着可以忽视个人信息安全。', pinyin: 'Búguò, fāngbiàn bìng bù yìwèizhe kěyǐ hūshì gèrén xìnxī ānquán.', vietnamese: 'Tuy nhiên, tiện lợi không có nghĩa là có thể xem nhẹ an toàn thông tin cá nhân.' }
        ],
        vocabulary: [
          { hanzi: '随着', pinyin: 'suízhe', vietnamese: 'cùng với; theo đà' }, { hanzi: '移动互联网', pinyin: 'yídòng hùliánwǎng', vietnamese: 'internet di động' },
          { hanzi: '数字支付', pinyin: 'shùzì zhīfù', vietnamese: 'thanh toán số' }, { hanzi: '扫描', pinyin: 'sǎomiáo', vietnamese: 'quét' },
          { hanzi: '二维码', pinyin: 'èrwéimǎ', vietnamese: 'mã QR' }, { hanzi: '忽视', pinyin: 'hūshì', vietnamese: 'xem nhẹ; bỏ qua' }
        ],
        questions: [
          { question: '数字支付有什么好处？', options: ['交易更快、少带现金', '完全没有风险', '不需要手机'], answer: 0, explanation: '第三句提到减少携带现金的麻烦并提高速度。' },
          { question: '作者提醒人们注意什么？', options: ['手机颜色', '个人信息安全', '商店距离'], answer: 1, explanation: '最后一句提醒不能忽视个人信息安全。' }
        ]
      },
      { id: 'mag-hsk4-payment-02', title: 'An toàn trước sự tiện lợi', titleZh: '方便之外的安全',
        sentences: [
          { chinese: '使用支付软件时，用户应该设置不容易被猜到的密码。', pinyin: 'Shǐyòng zhīfù ruǎnjiàn shí, yònghù yīnggāi shèzhì bù róngyì bèi cāi dào de mìmǎ.', vietnamese: 'Khi sử dụng phần mềm thanh toán, người dùng nên đặt mật khẩu khó đoán.' },
          { chinese: '收到不熟悉的链接时，不要急着输入账户或验证码。', pinyin: 'Shōudào bù shúxī de liànjiē shí, bú yào jí zhe shūrù zhànghù huò yànzhèngmǎ.', vietnamese: 'Khi nhận được liên kết lạ, đừng vội nhập tài khoản hoặc mã xác minh.' },
          { chinese: '如果发现异常交易，应及时联系服务平台。', pinyin: 'Rúguǒ fāxiàn yìcháng jiāoyì, yīng jíshí liánxì fúwù píngtái.', vietnamese: 'Nếu phát hiện giao dịch bất thường, cần liên hệ nền tảng dịch vụ kịp thời.' },
          { chinese: '养成谨慎的习惯，才能更安心地享受科技带来的便利。', pinyin: 'Yǎngchéng jǐnshèn de xíguàn, cái néng gèng ānxīn de xiǎngshòu kējì dàilái de biànlì.', vietnamese: 'Chỉ khi hình thành thói quen thận trọng, chúng ta mới có thể yên tâm tận hưởng tiện ích công nghệ.' }
        ],
        vocabulary: [
          { hanzi: '密码', pinyin: 'mìmǎ', vietnamese: 'mật khẩu' }, { hanzi: '链接', pinyin: 'liànjiē', vietnamese: 'liên kết' },
          { hanzi: '验证码', pinyin: 'yànzhèngmǎ', vietnamese: 'mã xác minh' }, { hanzi: '异常', pinyin: 'yìcháng', vietnamese: 'bất thường' },
          { hanzi: '及时', pinyin: 'jíshí', vietnamese: 'kịp thời' }, { hanzi: '谨慎', pinyin: 'jǐnshèn', vietnamese: 'thận trọng' }
        ],
        questions: [
          { question: '收到陌生链接时应该怎么做？', options: ['马上输入验证码', '不要急着输入账户信息', '转发给朋友'], answer: 1, explanation: '第二句提醒不要急着输入账户或验证码。' },
          { question: '发现异常交易后应该怎样？', options: ['及时联系服务平台', '删除所有照片', '等待一个月'], answer: 0, explanation: '第三句建议及时联系服务平台。' }
        ]
      }
    ]
  },
  {
    id: 'magazine-hsk5-workplace-change', title: 'Thay đổi trong môi trường làm việc', titleZh: '工作方式的变化',
    level: 'HSK 5', topic: 'Xã hội · Công việc · Kỹ năng', description: 'Phân tích cách làm việc linh hoạt và năng lực thích nghi trong thời đại mới.',
    chapters: [
      { id: 'mag-hsk5-work-01', title: 'Làm việc linh hoạt', titleZh: '灵活工作的机会',
        sentences: [
          { chinese: '远程办公逐渐普及以后，越来越多的企业开始重新考虑工作的组织方式。', pinyin: 'Yuǎnchéng bàngōng zhújiàn pǔjí yǐhòu, yuèláiyuè duō de qǐyè kāishǐ chóngxīn kǎolǜ gōngzuò de zǔzhī fāngshì.', vietnamese: 'Sau khi làm việc từ xa dần phổ biến, ngày càng nhiều doanh nghiệp bắt đầu xem xét lại cách tổ chức công việc.' },
          { chinese: '员工不一定每天到办公室，也可以通过网络与团队保持联系。', pinyin: 'Yuángōng bù yídìng měitiān dào bàngōngshì, yě kěyǐ tōngguò wǎngluò yǔ tuánduì bǎochí liánxì.', vietnamese: 'Nhân viên không nhất thiết phải đến văn phòng mỗi ngày mà có thể duy trì liên lạc với nhóm qua mạng.' },
          { chinese: '这种安排节省了通勤时间，却对自我管理提出了更高要求。', pinyin: 'Zhè zhǒng ānpái jiéshěng le tōngqín shíjiān, què duì zìwǒ guǎnlǐ tíchū le gèng gāo yāoqiú.', vietnamese: 'Cách sắp xếp này tiết kiệm thời gian đi lại nhưng đặt ra yêu cầu cao hơn về tự quản lý.' },
          { chinese: '因此，灵活并不等于没有规则，而是需要更清楚的目标和沟通。', pinyin: 'Yīncǐ, línghuó bìng bù děngyú méiyǒu guīzé, ér shì xūyào gèng qīngchu de mùbiāo hé gōutōng.', vietnamese: 'Vì vậy, linh hoạt không đồng nghĩa với không có quy tắc, mà cần mục tiêu và giao tiếp rõ ràng hơn.' }
        ],
        vocabulary: [
          { hanzi: '远程办公', pinyin: 'yuǎnchéng bàngōng', vietnamese: 'làm việc từ xa' }, { hanzi: '逐渐', pinyin: 'zhújiàn', vietnamese: 'dần dần' },
          { hanzi: '普及', pinyin: 'pǔjí', vietnamese: 'phổ biến rộng rãi' }, { hanzi: '组织方式', pinyin: 'zǔzhī fāngshì', vietnamese: 'cách thức tổ chức' },
          { hanzi: '通勤', pinyin: 'tōngqín', vietnamese: 'đi lại giữa nhà và nơi làm việc' }, { hanzi: '自我管理', pinyin: 'zìwǒ guǎnlǐ', vietnamese: 'tự quản lý' }
        ],
        questions: [
          { question: '远程办公节省了什么？', options: ['通勤时间', '学习时间', '休假时间'], answer: 0, explanation: '第三句明确说节省了通勤时间。' },
          { question: '灵活工作还需要什么？', options: ['没有任何规则', '清楚的目标和沟通', '每天加班'], answer: 1, explanation: '最后一句强调目标和沟通。' }
        ]
      },
      { id: 'mag-hsk5-work-02', title: 'Kỹ năng thích nghi', titleZh: '培养适应能力',
        sentences: [
          { chinese: '工作环境不断变化，单靠过去积累的经验可能已经不够。', pinyin: 'Gōngzuò huánjìng búduàn biànhuà, dān kào guòqù jīlěi de jīngyàn kěnéng yǐjīng bú gòu.', vietnamese: 'Môi trường làm việc liên tục thay đổi, chỉ dựa vào kinh nghiệm tích lũy trước đây có thể đã không đủ.' },
          { chinese: '主动学习新工具，愿意听取不同意见，有助于提高适应能力。', pinyin: 'Zhǔdòng xuéxí xīn gōngjù, yuànyì tīngqǔ bùtóng yìjiàn, yǒuzhù yú tígāo shìyìng nénglì.', vietnamese: 'Chủ động học công cụ mới và sẵn sàng lắng nghe ý kiến khác biệt giúp nâng cao khả năng thích nghi.' },
          { chinese: '遇到困难时，与其急着寻找借口，不如先分析问题出在哪里。', pinyin: 'Yùdào kùnnan shí, yǔqí jí zhe xúnzhǎo jièkǒu, bùrú xiān fēnxī wèntí chū zài nǎli.', vietnamese: 'Khi gặp khó khăn, thay vì vội tìm lý do biện minh, tốt hơn hết hãy phân tích vấn đề nằm ở đâu.' },
          { chinese: '能够持续调整方法的人，往往更容易在变化中找到机会。', pinyin: 'Nénggòu chíxù tiáozhěng fāngfǎ de rén, wǎngwǎng gèng róngyì zài biànhuà zhōng zhǎodào jīhuì.', vietnamese: 'Người có thể liên tục điều chỉnh phương pháp thường dễ tìm thấy cơ hội trong thay đổi hơn.' }
        ],
        vocabulary: [
          { hanzi: '积累', pinyin: 'jīlěi', vietnamese: 'tích lũy' }, { hanzi: '主动', pinyin: 'zhǔdòng', vietnamese: 'chủ động' },
          { hanzi: '听取', pinyin: 'tīngqǔ', vietnamese: 'lắng nghe và tiếp thu' }, { hanzi: '适应能力', pinyin: 'shìyìng nénglì', vietnamese: 'khả năng thích nghi' },
          { hanzi: '与其', pinyin: 'yǔqí', vietnamese: 'thay vì (vế trước cấu trúc)' }, { hanzi: '调整', pinyin: 'tiáozhěng', vietnamese: 'điều chỉnh' }
        ],
        questions: [
          { question: '作者建议遇到困难时先做什么？', options: ['寻找借口', '分析问题', '放弃工作'], answer: 1, explanation: '第三句建议先分析问题出在哪里。' },
          { question: '什么样的人更容易找到机会？', options: ['持续调整方法的人', '拒绝学习的人', '只依赖旧经验的人'], answer: 0, explanation: '最后一句给出了这个结论。' }
        ]
      }
    ]
  },
  {
    id: 'magazine-hsk6-information-literacy', title: 'Đọc tin tức bằng tư duy phản biện', titleZh: '如何理性阅读信息',
    level: 'HSK 6', topic: 'Truyền thông · Tư duy phản biện', description: 'Nhận diện tiêu đề gây chú ý, kiểm tra nguồn và phân biệt dữ kiện với ý kiến.',
    chapters: [
      { id: 'mag-hsk6-media-01', title: 'Đừng chỉ đọc tiêu đề', titleZh: '不要只看标题',
        sentences: [
          { chinese: '在信息传播速度极快的时代，一条消息往往还没有得到核实，就已经被大量转发。', pinyin: 'Zài xìnxī chuánbō sùdù jí kuài de shídài, yì tiáo xiāoxi wǎngwǎng hái méiyǒu dédào héshí, jiù yǐjīng bèi dàliàng zhuǎnfā.', vietnamese: 'Trong thời đại thông tin lan truyền cực nhanh, một tin tức đôi khi đã được chia sẻ rộng rãi trước khi được xác minh.' },
          { chinese: '为了吸引注意，有些标题故意夸大事实，甚至省略关键背景。', pinyin: 'Wèile xīyǐn zhùyì, yǒuxiē biāotí gùyì kuādà shìshí, shènzhì shěnglüè guānjiàn bèijǐng.', vietnamese: 'Để thu hút sự chú ý, một số tiêu đề cố tình phóng đại sự thật, thậm chí lược bỏ bối cảnh quan trọng.' },
          { chinese: '如果读者只根据标题判断，就容易把复杂的问题理解得过于简单。', pinyin: 'Rúguǒ dúzhě zhǐ gēnjù biāotí pànduàn, jiù róngyì bǎ fùzá de wèntí lǐjiě de guòyú jiǎndān.', vietnamese: 'Nếu người đọc chỉ phán đoán dựa trên tiêu đề, họ dễ hiểu vấn đề phức tạp một cách quá đơn giản.' },
          { chinese: '因此，阅读正文并寻找原始出处，是形成独立判断的第一步。', pinyin: 'Yīncǐ, yuèdú zhèngwén bìng xúnzhǎo yuánshǐ chūchù, shì xíngchéng dúlì pànduàn de dì yī bù.', vietnamese: 'Vì vậy, đọc toàn văn và tìm nguồn ban đầu là bước đầu tiên để hình thành nhận định độc lập.' }
        ],
        vocabulary: [
          { hanzi: '传播', pinyin: 'chuánbō', vietnamese: 'truyền bá; lan truyền' }, { hanzi: '核实', pinyin: 'héshí', vietnamese: 'xác minh' },
          { hanzi: '转发', pinyin: 'zhuǎnfā', vietnamese: 'chia sẻ; chuyển tiếp' }, { hanzi: '夸大', pinyin: 'kuādà', vietnamese: 'phóng đại' },
          { hanzi: '省略', pinyin: 'shěnglüè', vietnamese: 'lược bỏ' }, { hanzi: '出处', pinyin: 'chūchù', vietnamese: 'nguồn xuất xứ' }
        ],
        questions: [
          { question: '有些标题为什么夸大事实？', options: ['为了吸引注意', '为了提供背景', '为了减少阅读量'], answer: 0, explanation: '第二句说明目的是吸引注意。' },
          { question: '形成独立判断的第一步是什么？', options: ['马上转发', '只看标题', '阅读正文并寻找原始出处'], answer: 2, explanation: '最后一句明确提出这两个行动。' }
        ]
      },
      { id: 'mag-hsk6-media-02', title: 'Kiểm tra bằng chứng', titleZh: '用证据检验观点',
        sentences: [
          { chinese: '面对有争议的说法，首先应该区分可以验证的事实与个人解释。', pinyin: 'Miànduì yǒu zhēngyì de shuōfǎ, shǒuxiān yīnggāi qūfēn kěyǐ yànzhèng de shìshí yǔ gèrén jiěshì.', vietnamese: 'Trước một nhận định gây tranh cãi, trước tiên cần phân biệt sự thật có thể kiểm chứng với cách diễn giải cá nhân.' },
          { chinese: '其次，要查看证据是否来自可靠来源，并确认数据有没有被断章取义。', pinyin: 'Qícì, yào chákàn zhèngjù shìfǒu láizì kěkào láiyuán, bìng quèrèn shùjù yǒu méiyǒu bèi duànzhāng qǔyì.', vietnamese: 'Tiếp theo, cần xem bằng chứng có đến từ nguồn đáng tin cậy hay không và dữ liệu có bị trích dẫn sai ngữ cảnh không.' },
          { chinese: '不同来源得出相反结论时，不必急着选择自己最喜欢的一方。', pinyin: 'Bùtóng láiyuán déchū xiāngfǎn jiélùn shí, bú bì jí zhe xuǎnzé zìjǐ zuì xǐhuan de yì fāng.', vietnamese: 'Khi các nguồn khác nhau đưa ra kết luận trái ngược, không cần vội chọn phía mình thích nhất.' },
          { chinese: '保持开放态度，同时要求论据充分，才更接近理性的判断。', pinyin: 'Bǎochí kāifàng tàidu, tóngshí yāoqiú lùnjù chōngfèn, cái gèng jiējìn lǐxìng de pànduàn.', vietnamese: 'Giữ thái độ cởi mở đồng thời yêu cầu lập luận đầy đủ mới giúp tiến gần hơn đến phán đoán hợp lý.' }
        ],
        vocabulary: [
          { hanzi: '争议', pinyin: 'zhēngyì', vietnamese: 'tranh cãi' }, { hanzi: '区分', pinyin: 'qūfēn', vietnamese: 'phân biệt' },
          { hanzi: '验证', pinyin: 'yànzhèng', vietnamese: 'kiểm chứng' }, { hanzi: '可靠', pinyin: 'kěkào', vietnamese: 'đáng tin cậy' },
          { hanzi: '断章取义', pinyin: 'duànzhāng qǔyì', vietnamese: 'cắt xén ngữ cảnh để xuyên tạc ý nghĩa' }, { hanzi: '论据', pinyin: 'lùnjù', vietnamese: 'luận cứ; bằng chứng lập luận' }
        ],
        questions: [
          { question: '面对有争议的说法，首先要区分什么？', options: ['事实与个人解释', '标题与图片', '速度与数量'], answer: 0, explanation: '第一句要求区分可验证事实与个人解释。' },
          { question: '怎样更接近理性的判断？', options: ['只相信熟悉的人', '保持开放并要求论据充分', '马上选择一方'], answer: 1, explanation: '最后一句强调开放态度和充分论据。' }
        ]
      }
    ]
  }
];
