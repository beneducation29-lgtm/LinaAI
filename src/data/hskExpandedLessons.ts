import type { StructuredLesson, StructuredVocabulary, GrammarRecord, StructuredSentence, ReviewItem, SpeakingExercise, RoleplayScenario } from '../types/learning';

type Level = 'HSK 2'|'HSK 3'|'HSK 4'|'HSK 5'|'HSK 6';

const data: Record<Level, Array<{vi:string; zh:string; py:string; objective:string; cat:string; words:Array<[string,string,string,string,string]>; grammar:[string,string,string,string,string[]]; prompt:[string,string,string,string]; role:string; situation:string}>> = {
  'HSK 2': [
    {vi:'Sinh hoạt cuối tuần',zh:'周末生活',py:'Zhōumò shēnghuó',objective:'Nói về lịch cuối tuần và hoạt động đã lên kế hoạch.',cat:'đời sống',words:[['周末','zhōumò','cuối tuần','danh từ','我周末喜欢看电影。'],['一起','yìqǐ','cùng nhau','phó từ','我们一起学习吧。'],['打算','dǎsuàn','dự định','động từ','我打算周末去北京。'],['已经','yǐjīng','đã','phó từ','我已经吃饭了。'],['还','hái','vẫn / còn','phó từ','我还想喝茶。']],grammar:['h2-g1','已经 + V + 了','Đã làm… rồi','已经 đứng trước động từ, thường đi với 了 để nhấn mạnh việc đã xảy ra.',['我已经吃饭了。','他已经到了。']],prompt:['你周末打算做什么？','Nǐ zhōumò dǎsuàn zuò shénme?','Cuối tuần bạn định làm gì?','Nói một kế hoạch cuối tuần.'],role:'Lên kế hoạch cuối tuần',situation:'Bạn và Lina bàn kế hoạch cho cuối tuần.'},
    {vi:'Giao thông',zh:'交通',py:'Jiāotōng',objective:'Hỏi đường và nói phương tiện di chuyển.',cat:'di chuyển',words:[['地铁','dìtiě','tàu điện ngầm','danh từ','我每天坐地铁上班。'],['公共汽车','gōnggòng qìchē','xe buýt','danh từ','我坐公共汽车去学校。'],['离','lí','cách','giới từ','学校离我家很近。'],['远','yuǎn','xa','tính từ','这里离车站很远。'],['方便','fāngbiàn','tiện lợi','tính từ','坐地铁很方便。']],grammar:['h2-g2','A 离 B + 远/近','A cách B xa/gần','离 dùng để nói khoảng cách giữa hai địa điểm.',['我家离学校很近。','公司离地铁站不远。']],prompt:['你怎么去学校？','Nǐ zěnme qù xuéxiào?','Bạn đi đến trường bằng cách nào?','Nói phương tiện bạn thường dùng.'],role:'Hỏi đường',situation:'Lina đang tìm ga tàu gần nhất.'},
    {vi:'Sức khỏe',zh:'健康',py:'Jiànkāng',objective:'Mô tả triệu chứng đơn giản và đưa lời khuyên.',cat:'sức khỏe',words:[['身体','shēntǐ','cơ thể / sức khỏe','danh từ','身体很重要。'],['舒服','shūfu','dễ chịu','tính từ','今天感觉很舒服。'],['头疼','tóuténg','đau đầu','động từ','我今天头疼。'],['休息','xiūxi','nghỉ ngơi','động từ','你应该休息一下。'],['应该','yīnggāi','nên','động từ năng nguyện','你应该早点睡觉。']],grammar:['h2-g3','应该 + V','Nên làm…','应该 dùng để đưa lời khuyên hoặc nghĩa vụ nhẹ.',['你应该早点休息。','你应该多喝水。']],prompt:['你今天感觉怎么样？','Nǐ jīntiān gǎnjué zěnmeyàng?','Hôm nay bạn cảm thấy thế nào?','Mô tả tình trạng sức khỏe.'],role:'Tại phòng khám',situation:'Bạn nói triệu chứng với Lina và nhận lời khuyên.'},
    {vi:'Học tập',zh:'学习',py:'Xuéxí',objective:'Nói về cách học và tiến độ học tiếng Trung.',cat:'học tập',words:[['复习','fùxí','ôn tập','động từ','我每天复习生词。'],['练习','liànxí','luyện tập','động từ','我要多练习口语。'],['进步','jìnbù','tiến bộ','động từ/danh từ','我的中文进步了。'],['忘记','wàngjì','quên','động từ','我忘记这个词了。'],['办法','bànfǎ','cách / biện pháp','danh từ','我们想一个办法。']],grammar:['h2-g4','一边…一边…','Vừa… vừa…','Diễn tả hai hoạt động diễn ra đồng thời.',['我一边听一边写。','她一边走一边说。']],prompt:['你怎么学习中文？','Nǐ zěnme xuéxí Zhōngwén?','Bạn học tiếng Trung thế nào?','Nói một thói quen học tập.'],role:'Lập kế hoạch học',situation:'Lina giúp bạn lập lịch ôn từ mới.'},
    {vi:'Mua sắm và giá cả',zh:'购物',py:'Gòuwù',objective:'So sánh lựa chọn và hỏi giá trong tình huống mua sắm.',cat:'mua sắm',words:[['便宜','piányi','rẻ','tính từ','这个比较便宜。'],['贵','guì','đắt','tính từ','那个太贵了。'],['颜色','yánsè','màu sắc','danh từ','你喜欢什么颜色？'],['件','jiàn','cái/chiếc (áo)','lượng từ','我要一件衣服。'],['选择','xuǎnzé','lựa chọn','động từ/danh từ','这里有很多选择。']],grammar:['h2-g5','比 + A + Adj','A … hơn B','比 dùng để so sánh hai đối tượng.',['这个比那个便宜。','今天比昨天冷。']],prompt:['你觉得哪个比较好？','Nǐ juéde nǎge bǐjiào hǎo?','Bạn thấy cái nào tốt hơn?','So sánh hai lựa chọn.'],role:'Mua quần áo',situation:'Bạn chọn một chiếc áo phù hợp với ngân sách.'}
  ],
  'HSK 3': [
    {vi:'Kế hoạch và kinh nghiệm',zh:'计划与经验',py:'Jìhuà yǔ jīngyàn',objective:'Kể kinh nghiệm và nói về kế hoạch tương lai.',cat:'kế hoạch',words:[['经验','jīngyàn','kinh nghiệm','danh từ','他有很多工作经验。'],['决定','juédìng','quyết định','động từ','我决定每天练习。'],['参加','cānjiā','tham gia','động từ','我想参加比赛。'],['机会','jīhuì','cơ hội','danh từ','这是一个好机会。'],['准备','zhǔnbèi','chuẩn bị','động từ','我正在准备考试。']],grammar:['h3-g1','虽然…但是…','Mặc dù… nhưng…','Nối hai mệnh đề có quan hệ tương phản.',['虽然很累，但是我还要学习。','虽然下雨，但是他来了。']],prompt:['你最近有什么计划？','Nǐ zuìjìn yǒu shénme jìhuà?','Gần đây bạn có kế hoạch gì?','Nói một kế hoạch và lý do.'],role:'Lập kế hoạch thi HSK',situation:'Lina giúp bạn lên kế hoạch ôn thi.'},
    {vi:'Công việc',zh:'工作与职场',py:'Gōngzuò yǔ zhíchǎng',objective:'Trao đổi về công việc, trách nhiệm và lịch trình.',cat:'công việc',words:[['同事','tóngshì','đồng nghiệp','danh từ','我的同事很友好。'],['负责','fùzé','phụ trách','động từ','我负责这个项目。'],['会议','huìyì','cuộc họp','danh từ','下午有一个会议。'],['完成','wánchéng','hoàn thành','động từ','我已经完成任务。'],['安排','ānpái','sắp xếp','động từ','经理安排了工作。']],grammar:['h3-g2','把 + O + V','Xử lý/đặt O…','把 đưa tân ngữ lên trước để nhấn mạnh cách xử lý đối tượng.',['请把文件给我。','我把作业做完了。']],prompt:['你在工作中负责什么？','Nǐ zài gōngzuò zhōng fùzé shénme?','Trong công việc bạn phụ trách gì?','Mô tả một trách nhiệm.'],role:'Trao đổi công việc',situation:'Bạn báo cáo tiến độ một nhiệm vụ cho Lina.'},
    {vi:'Du lịch',zh:'旅行',py:'Lǚxíng',objective:'Kể lại chuyến đi và xử lý tình huống du lịch.',cat:'du lịch',words:[['旅行','lǚxíng','du lịch','động từ/danh từ','我喜欢一个人旅行。'],['风景','fēngjǐng','phong cảnh','danh từ','这里的风景很美。'],['预订','yùdìng','đặt trước','động từ','我预订了酒店。'],['护照','hùzhào','hộ chiếu','danh từ','请带好护照。'],['行李','xíngli','hành lý','danh từ','我的行李在哪里？']],grammar:['h3-g3','除了…以外，还…','Ngoài… còn…','Thêm thông tin ngoài thành phần đã nêu.',['除了北京以外，我还去过上海。','除了中文，我还学英语。']],prompt:['你去过哪个城市？','Nǐ qùguo nǎge chéngshì?','Bạn đã từng đi thành phố nào?','Kể một trải nghiệm du lịch.'],role:'Tại khách sạn',situation:'Bạn nhận phòng và hỏi về tiện nghi.'},
    {vi:'Công nghệ và thói quen',zh:'科技与习惯',py:'Kējì yǔ xíguàn',objective:'Nói về ứng dụng, thiết bị và thói quen số.',cat:'công nghệ',words:[['网络','wǎngluò','mạng Internet','danh từ','这里的网络很快。'],['应用','yìngyòng','ứng dụng','danh từ','这个应用很方便。'],['下载','xiàzǎi','tải xuống','động từ','我下载了一个应用。'],['消息','xiāoxi','tin nhắn / tin tức','danh từ','我收到一条消息。'],['密码','mìmǎ','mật khẩu','danh từ','请不要告诉别人密码。']],grammar:['h3-g4','越来越 + Adj','Ngày càng…','Diễn tả mức độ thay đổi tăng dần.',['中文越来越有意思。','天气越来越热。']],prompt:['你每天使用手机做什么？','Nǐ měitiān shǐyòng shǒujī zuò shénme?','Mỗi ngày bạn dùng điện thoại làm gì?','Nói về một thói quen số.'],role:'Hỗ trợ công nghệ',situation:'Lina giúp bạn giải quyết một vấn đề với ứng dụng.'},
    {vi:'Môi trường',zh:'环境',py:'Huánjìng',objective:'Mô tả vấn đề môi trường và đề xuất giải pháp.',cat:'môi trường',words:[['环境','huánjìng','môi trường','danh từ','我们要保护环境。'],['污染','wūrǎn','ô nhiễm','danh từ/động từ','空气污染很严重。'],['节约','jiéyuē','tiết kiệm','động từ','我们应该节约用水。'],['垃圾','lājī','rác','danh từ','请把垃圾放这里。'],['保护','bǎohù','bảo vệ','động từ','保护环境很重要。']],grammar:['h3-g5','为了 + mục đích','Để…','为了 giới thiệu mục đích của hành động.',['为了健康，我每天运动。','为了学习中文，他来中国。']],prompt:['我们应该怎么保护环境？','Wǒmen yīnggāi zěnme bǎohù huánjìng?','Chúng ta nên bảo vệ môi trường thế nào?','Đề xuất hai giải pháp.'],role:'Thảo luận môi trường',situation:'Bạn cùng Lina chọn các hành động xanh.'}
  ],
  'HSK 4': [
    {vi:'Ý kiến và lập luận',zh:'观点与理由',py:'Guāndiǎn yǔ lǐyóu',objective:'Trình bày quan điểm và đưa lý do rõ ràng.',cat:'ý kiến',words:[['观点','guāndiǎn','quan điểm','danh từ','我同意你的观点。'],['理由','lǐyóu','lý do','danh từ','你有什么理由？'],['影响','yǐngxiǎng','ảnh hưởng','động từ/danh từ','这会影响我们的生活。'],['实际','shíjì','thực tế','tính từ','这个方法很实际。'],['考虑','kǎolǜ','cân nhắc','động từ','我们需要考虑成本。']],grammar:['h4-g1','不仅…而且…','Không những… mà còn…','Liên kết hai đặc điểm hoặc hành động cùng chiều.',['他不仅聪明，而且很努力。','学习中文不仅有用，而且很有意思。']],prompt:['你同意这个观点吗？为什么？','Nǐ tóngyì zhège guāndiǎn ma? Wèishénme?','Bạn có đồng ý quan điểm này không? Vì sao?','Nêu quan điểm và hai lý do.'],role:'Tranh luận nhẹ',situation:'Lina đưa ra một quan điểm để bạn phản biện.'},
    {vi:'Tin tức và xã hội',zh:'新闻与社会',py:'Xīnwén yǔ shèhuì',objective:'Tóm tắt thông tin và phân biệt sự kiện với ý kiến.',cat:'xã hội',words:[['新闻','xīnwén','tin tức','danh từ','我每天看新闻。'],['报道','bàodào','bản tin / đưa tin','động từ/danh từ','这篇报道很详细。'],['社会','shèhuì','xã hội','danh từ','社会变化很快。'],['现象','xiànxiàng','hiện tượng','danh từ','这是一个常见现象。'],['调查','diàochá','điều tra / khảo sát','động từ/danh từ','调查结果已经公布。']],grammar:['h4-g2','被 + V','Bị…','Câu bị động với 被 nhấn mạnh đối tượng chịu tác động.',['他被邀请参加会议。','手机被人拿走了。']],prompt:['你最近看到什么新闻？','Nǐ zuìjìn kàndào shénme xīnwén?','Gần đây bạn thấy tin gì?','Tóm tắt ngắn một tin.'],role:'Bản tin ngắn',situation:'Bạn kể lại một tin cho Lina.'},
    {vi:'Giáo dục và mục tiêu',zh:'教育与目标',py:'Jiàoyù yǔ mùbiāo',objective:'Nói về phương pháp học và mục tiêu dài hạn.',cat:'giáo dục',words:[['教育','jiàoyù','giáo dục','danh từ','教育对社会很重要。'],['目标','mùbiāo','mục tiêu','danh từ','我的目标是通过HSK。'],['方法','fāngfǎ','phương pháp','danh từ','这个学习方法很有效。'],['效率','xiàolǜ','hiệu quả','danh từ','提高学习效率很重要。'],['坚持','jiānchí','kiên trì','động từ','只要坚持就会进步。']],grammar:['h4-g3','只要…就…','Chỉ cần… thì…','Điều kiện đủ dẫn đến kết quả.',['只要坚持，就会进步。','只要有时间，我就练习。']],prompt:['你的中文学习目标是什么？','Nǐ de Zhōngwén xuéxí mùbiāo shì shénme?','Mục tiêu học tiếng Trung của bạn là gì?','Nói mục tiêu và kế hoạch.'],role:'Huấn luyện học tập',situation:'Lina giúp bạn biến mục tiêu thành kế hoạch.'},
    {vi:'Văn hóa và khác biệt',zh:'文化与差异',py:'Wénhuà yǔ chāyì',objective:'So sánh phong tục và giải thích khác biệt văn hóa.',cat:'văn hóa',words:[['文化','wénhuà','văn hóa','danh từ','中国文化很丰富。'],['传统','chuántǒng','truyền thống','danh từ','这是一个传统习俗。'],['习惯','xíguàn','thói quen','danh từ/động từ','每个国家都有不同习惯。'],['尊重','zūnzhòng','tôn trọng','động từ','我们应该尊重不同文化。'],['差异','chāyì','khác biệt','danh từ','两种文化有一些差异。']],grammar:['h4-g4','与其…不如…','Thay vì… chi bằng…','So sánh hai lựa chọn, nhấn mạnh lựa chọn thứ hai.',['与其担心，不如行动。','与其等待，不如开始。']],prompt:['你觉得两种文化有什么不同？','Nǐ juéde liǎng zhǒng wénhuà yǒu shénme bùtóng?','Bạn thấy hai nền văn hóa khác nhau thế nào?','Nêu một điểm khác biệt.'],role:'Giao lưu văn hóa',situation:'Bạn và Lina chia sẻ phong tục của hai nước.'},
    {vi:'Dịch vụ và giải quyết vấn đề',zh:'服务与解决问题',py:'Fúwù yǔ jiějué wèntí',objective:'Khiếu nại lịch sự và đề xuất cách giải quyết.',cat:'dịch vụ',words:[['服务','fúwù','dịch vụ','danh từ/động từ','这里的服务很好。'],['问题','wèntí','vấn đề','danh từ','我们需要解决这个问题。'],['解决','jiějué','giải quyết','động từ','问题已经解决了。'],['协调','xiétiáo','phối hợp / điều phối','động từ','我们需要协调各部门的工作。'],['满意','mǎnyì','hài lòng','tính từ','我对服务很满意。']],grammar:['h4-g5','即使…也…','Cho dù… cũng…','Diễn tả kết quả không thay đổi trong điều kiện giả định.',['即使很忙，我也会完成。','即使下雨，我们也去。']],prompt:['如果服务有问题，你会怎么说？','Rúguǒ fúwù yǒu wèntí, nǐ huì zěnme shuō?','Nếu dịch vụ có vấn đề, bạn sẽ nói thế nào?','Đưa ra một lời phàn nàn lịch sự.'],role:'Khiếu nại lịch sự',situation:'Bạn cần đổi một dịch vụ không đúng yêu cầu.'}
  ],
  'HSK 5': [
    {vi:'Phân tích thông tin',zh:'信息分析',py:'Xìnxī fēnxī',objective:'Tóm tắt, so sánh và đánh giá thông tin.',cat:'học thuật',words:[['分析','fēnxī','phân tích','động từ/danh từ','我们需要分析数据。'],['资料','zīliào','tài liệu','danh từ','请准备相关资料。'],['数据','shùjù','dữ liệu','danh từ','这些数据很重要。'],['趋势','qūshì','xu hướng','danh từ','我们发现一个趋势。'],['结论','jiélùn','kết luận','danh từ','最后得出结论。']],grammar:['h5-g1','既然…就…','Đã… thì…','Dùng khi điều kiện đã được xác nhận và dẫn tới kết luận/hành động.',['既然决定了，就坚持下去。','既然有数据，就应该分析。']],prompt:['你怎么判断一条信息是否可靠？','Nǐ zěnme pànduàn yì tiáo xìnxī shìfǒu kěkào?','Bạn đánh giá một thông tin có đáng tin không thế nào?','Nêu hai tiêu chí.'],role:'Phân tích dữ liệu',situation:'Lina đưa hai nguồn thông tin để bạn so sánh.'},
    {vi:'Công việc chuyên môn',zh:'专业工作',py:'Zhuānyè gōngzuò',objective:'Trình bày tiến độ, rủi ro và phương án.',cat:'công việc',words:[['项目','xiàngmù','dự án','danh từ','项目进展顺利。'],['进展','jìnzhǎn','tiến độ','danh từ','项目有什么进展？'],['风险','fēngxiǎn','rủi ro','danh từ','我们要考虑风险。'],['方案','fāngàn','phương án','danh từ','请提出一个方案。'],['资源','zīyuán','nguồn lực','danh từ','项目需要更多资源。']],grammar:['h5-g2','一旦…就…','Một khi… thì…','Nói về điều kiện một khi xảy ra sẽ dẫn đến kết quả.',['一旦开始，就不要放弃。','一旦确认，就立即执行。']],prompt:['项目目前有什么风险？','Xiàngmù mùqián yǒu shénme fēngxiǎn?','Dự án hiện có rủi ro gì?','Nêu rủi ro và phương án.'],role:'Báo cáo dự án',situation:'Bạn báo cáo ngắn tình hình dự án.'},
    {vi:'Tranh luận và phản biện',zh:'讨论与论证',py:'Tǎolùn yǔ lùnzhèng',objective:'Phản biện lịch sự và bảo vệ lập luận.',cat:'tranh luận',words:[['证据','zhèngjù','bằng chứng','danh từ','你有什么证据？'],['立场','lìchǎng','lập trường','danh từ','我们应该尊重不同的立场。'],['合理','hélǐ','hợp lý','tính từ','这个解释很合理。'],['质疑','zhìyí','nghi ngờ / chất vấn','động từ','我们可以质疑这个结论。'],['角度','jiǎodù','góc độ','danh từ','从另一个角度看。']],grammar:['h5-g3','尽管…还是…','Mặc dù… vẫn…','Thể hiện sự nhượng bộ nhưng kết quả không đổi.',['尽管很困难，他还是完成了。','尽管有问题，我们还是继续。']],prompt:['你如何回应不同意见？','Nǐ rúhé huíyìng bùtóng yìjiàn?','Bạn phản hồi ý kiến khác biệt thế nào?','Đưa ra phản hồi có lý do.'],role:'Tranh luận học thuật',situation:'Lina đưa ra ý kiến trái chiều và bạn phản biện.'},
    {vi:'Tin tức và truyền thông',zh:'媒体与传播',py:'Méitǐ yǔ chuánbō',objective:'Đánh giá cách thông tin được truyền tải.',cat:'truyền thông',words:[['媒体','méitǐ','truyền thông','danh từ','媒体报道了这件事。'],['传播','chuánbō','lan truyền','động từ','信息传播得很快。'],['公众','gōngzhòng','công chúng','danh từ','公众对此很关注。'],['舆论','yúlùn','dư luận','danh từ','舆论产生了影响。'],['准确','zhǔnquè','chính xác','tính từ','信息需要准确。']],grammar:['h5-g4','不但…反而…','Không những… mà ngược lại…','Dùng khi kết quả thực tế trái với kỳ vọng.',['他不但没有失败，反而成功了。','问题不但没减少，反而增加了。']],prompt:['为什么信息准确很重要？','Wèishénme xìnxī zhǔnquè hěn zhòngyào?','Vì sao thông tin chính xác quan trọng?','Giải thích bằng hai ý.'],role:'Kiểm tra tin',situation:'Bạn cùng Lina kiểm tra một thông tin trước khi chia sẻ.'},
    {vi:'Đời sống và cân bằng',zh:'生活与平衡',py:'Shēnghuó yǔ pínghéng',objective:'Nói về ưu tiên, áp lực và cân bằng cuộc sống.',cat:'đời sống',words:[['压力','yālì','áp lực','danh từ','工作给他很大压力。'],['平衡','pínghéng','cân bằng','động từ/danh từ','生活需要平衡。'],['优先','yōuxiān','ưu tiên','động từ/phó từ','健康应该优先。'],['调整','tiáozhěng','điều chỉnh','động từ','我们需要调整计划。'],['状态','zhuàngtài','trạng thái','danh từ','最近状态不错。']],grammar:['h5-g5','与其…倒不如…','Thay vì… chi bằng…','Đưa ra lựa chọn có tính khuyến nghị mạnh hơn.',['与其焦虑，倒不如行动。','与其等待，倒不如尝试。']],prompt:['你怎样保持学习和生活的平衡？','Nǐ zěnyàng bǎochí xuéxí hé shēnghuó de pínghéng?','Bạn cân bằng học và cuộc sống thế nào?','Nêu chiến lược cá nhân.'],role:'Coaching thói quen',situation:'Lina giúp bạn điều chỉnh lịch học để giảm áp lực.'}
  ],
  'HSK 6': [
    {vi:'Tư duy và quyết định',zh:'思考与决策',py:'Sīkǎo yǔ juécè',objective:'Phân tích lựa chọn và giải thích quyết định phức tạp.',cat:'tư duy',words:[['决策','juécè','quyết sách / quyết định','danh từ','这个决策影响很大。'],['权衡','quánhéng','cân nhắc','động từ','需要权衡利弊。'],['依据','yījù','căn cứ','danh từ','我们要有充分依据。'],['利弊','lìbì','lợi và hại','danh từ','先分析利弊。'],['取舍','qǔshě','lựa chọn bỏ/giữ','danh từ/động từ','生活中需要取舍。']],grammar:['h6-g1','与其说…不如说…','Nói là… chi bằng nói là…','Điều chỉnh cách diễn đạt để nhấn mạnh bản chất phù hợp hơn.',['与其说这是失败，不如说是经验。','与其说困难，不如说需要耐心。']],prompt:['你做重要决定时最看重什么？','Nǐ zuò zhòngyào juédìng shí zuì kànzhòng shénme?','Khi quyết định việc quan trọng bạn coi trọng điều gì nhất?','Trình bày tiêu chí và lý do.'],role:'Ra quyết định',situation:'Bạn và Lina cân nhắc hai phương án có ưu nhược điểm.'},
    {vi:'Kinh tế và xã hội',zh:'经济与社会',py:'Jīngjì yǔ shèhuì',objective:'Thảo luận xu hướng kinh tế và tác động xã hội.',cat:'kinh tế',words:[['经济','jīngjì','kinh tế','danh từ','经济发展影响就业。'],['就业','jiùyè','việc làm','danh từ','就业机会增加了。'],['消费','xiāofèi','tiêu dùng','động từ/danh từ','消费方式正在改变。'],['产业','chǎnyè','ngành công nghiệp','danh từ','这个产业发展很快。'],['增长','zēngzhǎng','tăng trưởng','động từ/danh từ','经济保持增长。']],grammar:['h6-g2','随着…','Cùng với…','Nêu một thay đổi đi kèm một xu hướng khác.',['随着技术发展，生活更方便。','随着经验增加，他更自信。']],prompt:['科技发展会怎样影响就业？','Kējì fāzhǎn huì zěnyàng yǐngxiǎng jiùyè?','Công nghệ ảnh hưởng việc làm thế nào?','Phân tích một lợi ích và một rủi ro.'],role:'Thảo luận kinh tế',situation:'Lina đặt câu hỏi về tác động của công nghệ.'},
    {vi:'Khoa học và bằng chứng',zh:'科学与证据',py:'Kēxué yǔ zhèngjù',objective:'Trình bày giả thuyết, bằng chứng và giới hạn kết luận.',cat:'khoa học',words:[['假设','jiǎshè','giả thuyết','danh từ/động từ','这个假设需要验证。'],['验证','yànzhèng','xác minh','động từ','我们需要进一步验证。'],['实验','shíyàn','thí nghiệm','danh từ','实验结果很有意思。'],['变量','biànliàng','biến số','danh từ','控制变量很重要。'],['可靠','kěkào','đáng tin cậy','tính từ','结果是否可靠？']],grammar:['h6-g3','既…又…','Vừa… vừa…','Liên kết hai đặc điểm cùng tồn tại trong một đối tượng.',['这个方法既简单又可靠。','他既认真又有经验。']],prompt:['什么样的证据才比较可靠？','Shénme yàng de zhèngjù cái bǐjiào kěkào?','Bằng chứng thế nào mới đáng tin?','Đưa ra tiêu chí và ví dụ.'],role:'Kiểm tra giả thuyết',situation:'Bạn cùng Lina đánh giá một kết quả thử nghiệm.'},
    {vi:'Văn hóa và ngôn ngữ',zh:'语言与文化',py:'Yǔyán yǔ wénhuà',objective:'Phân tích mối quan hệ giữa ngôn ngữ và bối cảnh văn hóa.',cat:'ngôn ngữ',words:[['语境','yǔjìng','ngữ cảnh','danh từ','理解词语需要语境。'],['含义','hányì','hàm ý / ý nghĩa','danh từ','这个词有不同含义。'],['表达','biǎodá','biểu đạt','động từ/danh từ','这种表达很自然。'],['隐含','yǐnhán','hàm chứa','động từ','这句话隐含了另一层意思。'],['误解','wùjiě','hiểu lầm','động từ/danh từ','缺少语境容易误解。']],grammar:['h6-g4','并非…而是…','Không phải… mà là…','Phủ định một cách giải thích và thay bằng nguyên nhân/giải thích đúng.',['并非他不努力，而是方法不合适。','并非没有机会，而是需要准备。']],prompt:['为什么语境会影响理解？','Wèishénme yǔjìng huì yǐngxiǎng lǐjiě?','Vì sao ngữ cảnh ảnh hưởng việc hiểu?','Giải thích bằng một ví dụ.'],role:'Phân tích hội thoại',situation:'Lina đưa một câu có hàm ý để bạn giải thích.'},
    {vi:'Tầm nhìn và mục tiêu',zh:'长期目标',py:'Chángqī mùbiāo',objective:'Trình bày tầm nhìn dài hạn và đánh giá tiến độ.',cat:'phát triển',words:[['长期','chángqī','dài hạn','tính từ/danh từ','我们要考虑长期影响。'],['战略','zhànlüè','chiến lược','danh từ','需要制定长期战略。'],['执行','zhíxíng','thực hiện','động từ','计划需要认真执行。'],['成果','chéngguǒ','thành quả','danh từ','我们看到了成果。'],['持续','chíxù','tiếp tục / kéo dài','động từ','学习需要持续进行。']],grammar:['h6-g5','既然…那么…','Đã… thì…','Nêu tiền đề đã xác nhận rồi suy ra kết luận/hành động.',['既然目标明确，那么就要坚持执行。','既然已经决定，那么就继续。']],prompt:['你的长期学习目标是什么？','Nǐ de chángqī xuéxí mùbiāo shì shénme?','Mục tiêu học dài hạn của bạn là gì?','Nói mục tiêu, chiến lược và cách đo tiến bộ.'],role:'Coaching dài hạn',situation:'Lina giúp bạn thiết kế mục tiêu học tiếng Trung dài hạn.'}
  ]
};

const curatedSentenceContent: Record<string, [string, string]> = {
  '我周末喜欢看电影。': ['Wǒ zhōumò xǐhuan kàn diànyǐng.', 'Cuối tuần tôi thích xem phim.'],
  '我们一起学习吧。': ['Wǒmen yìqǐ xuéxí ba.', 'Chúng ta cùng học nhé.'],
  '我打算周末去北京。': ['Wǒ dǎsuàn zhōumò qù Běijīng.', 'Tôi dự định cuối tuần đi Bắc Kinh.'],
  '我已经吃饭了。': ['Wǒ yǐjīng chīfàn le.', 'Tôi ăn cơm rồi.'],
  '我还想喝茶。': ['Wǒ hái xiǎng hē chá.', 'Tôi vẫn muốn uống trà.'],
  '我每天坐地铁上班。': ['Wǒ měitiān zuò dìtiě shàngbān.', 'Hằng ngày tôi đi tàu điện ngầm đến chỗ làm.'],
  '我坐公共汽车去学校。': ['Wǒ zuò gōnggòng qìchē qù xuéxiào.', 'Tôi đi xe buýt đến trường.'],
  '学校离我家很近。': ['Xuéxiào lí wǒ jiā hěn jìn.', 'Trường học rất gần nhà tôi.'],
  '这里离车站很远。': ['Zhèlǐ lí chēzhàn hěn yuǎn.', 'Ở đây cách nhà ga rất xa.'],
  '坐地铁很方便。': ['Zuò dìtiě hěn fāngbiàn.', 'Đi tàu điện ngầm rất thuận tiện.'],
  '身体很重要。': ['Shēntǐ hěn zhòngyào.', 'Sức khỏe rất quan trọng.'],
  '今天感觉很舒服。': ['Jīntiān gǎnjué hěn shūfu.', 'Hôm nay tôi cảm thấy rất dễ chịu.'],
  '我今天头疼。': ['Wǒ jīntiān tóuténg.', 'Hôm nay tôi bị đau đầu.'],
  '你应该休息一下。': ['Nǐ yīnggāi xiūxi yíxià.', 'Bạn nên nghỉ ngơi một chút.'],
  '你应该早点睡觉。': ['Nǐ yīnggāi zǎodiǎn shuìjiào.', 'Bạn nên đi ngủ sớm.'],
  '我每天复习生词。': ['Wǒ měitiān fùxí shēngcí.', 'Mỗi ngày tôi ôn tập từ mới.'],
  '我要多练习口语。': ['Wǒ yào duō liànxí kǒuyǔ.', 'Tôi cần luyện nói nhiều hơn.'],
  '我的中文进步了。': ['Wǒ de Zhōngwén jìnbù le.', 'Tiếng Trung của tôi đã tiến bộ.'],
  '我忘记这个词了。': ['Wǒ wàngjì zhège cí le.', 'Tôi quên từ này rồi.'],
  '我们想一个办法。': ['Wǒmen xiǎng yí ge bànfǎ.', 'Chúng ta hãy nghĩ ra một cách.'],
  '这个比较便宜。': ['Zhège bǐjiào piányi.', 'Cái này tương đối rẻ.'],
  '那个太贵了。': ['Nàge tài guì le.', 'Cái kia đắt quá.'],
  '你喜欢什么颜色？': ['Nǐ xǐhuan shénme yánsè?', 'Bạn thích màu gì?'],
  '我要一件衣服。': ['Wǒ yào yí jiàn yīfu.', 'Tôi muốn mua một chiếc áo.'],
  '这里有很多选择。': ['Zhèlǐ yǒu hěn duō xuǎnzé.', 'Ở đây có nhiều lựa chọn.'],
  '他已经到了。': ['Tā yǐjīng dào le.', 'Anh ấy đến nơi rồi.'],
  '我家离学校很近。': ['Wǒ jiā lí xuéxiào hěn jìn.', 'Nhà tôi ở rất gần trường học.'],
  '公司离地铁站不远。': ['Gōngsī lí dìtiě zhàn bù yuǎn.', 'Công ty cách ga tàu điện ngầm không xa.'],
  '你应该早点休息。': ['Nǐ yīnggāi zǎodiǎn xiūxi.', 'Bạn nên nghỉ ngơi sớm.'],
  '你应该多喝水。': ['Nǐ yīnggāi duō hē shuǐ.', 'Bạn nên uống nhiều nước.'],
  '我一边听一边写。': ['Wǒ yìbiān tīng yìbiān xiě.', 'Tôi vừa nghe vừa viết.'],
  '她一边走一边说。': ['Tā yìbiān zǒu yìbiān shuō.', 'Cô ấy vừa đi vừa nói.'],
  '这个比那个便宜。': ['Zhège bǐ nàge piányi.', 'Cái này rẻ hơn cái kia.'],
  '今天比昨天冷。': ['Jīntiān bǐ zuótiān lěng.', 'Hôm nay lạnh hơn hôm qua.'],
  '他有很多工作经验。': ['Tā yǒu hěn duō gōngzuò jīngyàn.', 'Anh ấy có nhiều kinh nghiệm làm việc.'],
  '我决定每天练习。': ['Wǒ juédìng měitiān liànxí.', 'Tôi quyết định luyện tập mỗi ngày.'],
  '我想参加比赛。': ['Wǒ xiǎng cānjiā bǐsài.', 'Tôi muốn tham gia cuộc thi.'],
  '这是一个好机会。': ['Zhè shì yí ge hǎo jīhuì.', 'Đây là một cơ hội tốt.'],
  '我正在准备考试。': ['Wǒ zhèngzài zhǔnbèi kǎoshì.', 'Tôi đang chuẩn bị cho kỳ thi.'],
  '我的同事很友好。': ['Wǒ de tóngshì hěn yǒuhǎo.', 'Đồng nghiệp của tôi rất thân thiện.'],
  '我负责这个项目。': ['Wǒ fùzé zhège xiàngmù.', 'Tôi phụ trách dự án này.'],
  '下午有一个会议。': ['Xiàwǔ yǒu yí ge huìyì.', 'Chiều nay có một cuộc họp.'],
  '我已经完成任务。': ['Wǒ yǐjīng wánchéng rènwu.', 'Tôi đã hoàn thành nhiệm vụ.'],
  '经理安排了工作。': ['Jīnglǐ ānpái le gōngzuò.', 'Quản lý đã sắp xếp công việc.'],
  '我喜欢一个人旅行。': ['Wǒ xǐhuan yí ge rén lǚxíng.', 'Tôi thích đi du lịch một mình.'],
  '这里的风景很美。': ['Zhèlǐ de fēngjǐng hěn měi.', 'Phong cảnh ở đây rất đẹp.'],
  '我预订了酒店。': ['Wǒ yùdìng le jiǔdiàn.', 'Tôi đã đặt khách sạn.'],
  '请带好护照。': ['Qǐng dài hǎo hùzhào.', 'Vui lòng mang theo hộ chiếu đầy đủ.'],
  '我的行李在哪里？': ['Wǒ de xíngli zài nǎlǐ?', 'Hành lý của tôi ở đâu?'],
  '这里的网络很快。': ['Zhèlǐ de wǎngluò hěn kuài.', 'Mạng Internet ở đây rất nhanh.'],
  '这个应用很方便。': ['Zhège yìngyòng hěn fāngbiàn.', 'Ứng dụng này rất tiện lợi.'],
  '我下载了一个应用。': ['Wǒ xiàzǎi le yí ge yìngyòng.', 'Tôi đã tải xuống một ứng dụng.'],
  '我收到一条消息。': ['Wǒ shōudào yì tiáo xiāoxi.', 'Tôi nhận được một tin nhắn.'],
  '请不要告诉别人密码。': ['Qǐng bú yào gàosu biérén mìmǎ.', 'Đừng cho người khác biết mật khẩu nhé.'],
  '我们要保护环境。': ['Wǒmen yào bǎohù huánjìng.', 'Chúng ta cần bảo vệ môi trường.'],
  '空气污染很严重。': ['Kōngqì wūrǎn hěn yánzhòng.', 'Ô nhiễm không khí rất nghiêm trọng.'],
  '我们应该节约用水。': ['Wǒmen yīnggāi jiéyuē yòngshuǐ.', 'Chúng ta nên tiết kiệm nước.'],
  '请把垃圾放这里。': ['Qǐng bǎ lājī fàng zài zhèlǐ.', 'Vui lòng bỏ rác vào đây.'],
  '保护环境很重要。': ['Bǎohù huánjìng hěn zhòngyào.', 'Bảo vệ môi trường rất quan trọng.'],
  '虽然很累，但是我还要学习。': ['Suīrán hěn lèi, dànshì wǒ hái yào xuéxí.', 'Mặc dù rất mệt, nhưng tôi vẫn phải học.'],
  '虽然下雨，但是他来了。': ['Suīrán xiàyǔ, dànshì tā lái le.', 'Mặc dù trời mưa, nhưng anh ấy vẫn đến.'],
  '请把文件给我。': ['Qǐng bǎ wénjiàn gěi wǒ.', 'Vui lòng đưa tài liệu cho tôi.'],
  '我把作业做完了。': ['Wǒ bǎ zuòyè zuò wán le.', 'Tôi đã làm xong bài tập.'],
  '除了北京以外，我还去过上海。': ['Chúle Běijīng yǐwài, wǒ hái qùguo Shànghǎi.', 'Ngoài Bắc Kinh, tôi còn từng đến Thượng Hải.'],
  '除了中文，我还学英语。': ['Chúle Zhōngwén, wǒ hái xué Yīngyǔ.', 'Ngoài tiếng Trung, tôi còn học tiếng Anh.'],
  '中文越来越有意思。': ['Zhōngwén yuèláiyuè yǒu yìsi.', 'Tiếng Trung ngày càng thú vị.'],
  '天气越来越热。': ['Tiānqì yuèláiyuè rè.', 'Thời tiết ngày càng nóng.'],
  '为了健康，我每天运动。': ['Wèile jiànkāng, wǒ měitiān yùndòng.', 'Vì sức khỏe, ngày nào tôi cũng tập thể dục.'],
  '为了学习中文，他来中国。': ['Wèile xuéxí Zhōngwén, tā lái Zhōngguó.', 'Để học tiếng Trung, anh ấy đến Trung Quốc.'],
  '我同意你的观点。': ['Wǒ tóngyì nǐ de guāndiǎn.', 'Tôi đồng ý với quan điểm của bạn.'],
  '你有什么理由？': ['Nǐ yǒu shénme lǐyóu?', 'Bạn có lý do gì?'],
  '这会影响我们的生活。': ['Zhè huì yǐngxiǎng wǒmen de shēnghuó.', 'Điều này sẽ ảnh hưởng đến cuộc sống của chúng ta.'],
  '这个方法很实际。': ['Zhège fāngfǎ hěn shíjì.', 'Phương pháp này rất thiết thực.'],
  '我们需要考虑成本。': ['Wǒmen xūyào kǎolǜ chéngběn.', 'Chúng ta cần cân nhắc chi phí.'],
  '我每天看新闻。': ['Wǒ měitiān kàn xīnwén.', 'Tôi xem tin tức mỗi ngày.'],
  '这篇报道很详细。': ['Zhè piān bàodào hěn xiángxì.', 'Bài tường thuật này rất chi tiết.'],
  '社会变化很快。': ['Shèhuì biànhuà hěn kuài.', 'Xã hội thay đổi rất nhanh.'],
  '这是一个常见现象。': ['Zhè shì yí ge chángjiàn xiànxiàng.', 'Đây là một hiện tượng thường gặp.'],
  '调查结果已经公布。': ['Diàochá jiéguǒ yǐjīng gōngbù.', 'Kết quả khảo sát đã được công bố.'],
  '教育对社会很重要。': ['Jiàoyù duì shèhuì hěn zhòngyào.', 'Giáo dục rất quan trọng đối với xã hội.'],
  '我的目标是通过HSK。': ['Wǒ de mùbiāo shì tōngguò HSK.', 'Mục tiêu của tôi là thi đỗ HSK.'],
  '这个学习方法很有效。': ['Zhège xuéxí fāngfǎ hěn yǒuxiào.', 'Phương pháp học này rất hiệu quả.'],
  '提高学习效率很重要。': ['Tígāo xuéxí xiàolǜ hěn zhòngyào.', 'Nâng cao hiệu suất học tập rất quan trọng.'],
  '只要坚持就会进步。': ['Zhǐyào jiānchí jiù huì jìnbù.', 'Chỉ cần kiên trì thì sẽ tiến bộ.'],
  '中国文化很丰富。': ['Zhōngguó wénhuà hěn fēngfù.', 'Văn hóa Trung Quốc rất phong phú.'],
  '这是一个传统习俗。': ['Zhè shì yí ge chuántǒng xísú.', 'Đây là một phong tục truyền thống.'],
  '每个国家都有不同习惯。': ['Měi ge guójiā dōu yǒu bùtóng xíguàn.', 'Mỗi quốc gia đều có những thói quen khác nhau.'],
  '我们应该尊重不同文化。': ['Wǒmen yīnggāi zūnzhòng bùtóng wénhuà.', 'Chúng ta nên tôn trọng các nền văn hóa khác nhau.'],
  '两种文化有一些差异。': ['Liǎng zhǒng wénhuà yǒu yìxiē chāyì.', 'Hai nền văn hóa có một số điểm khác biệt.'],
  '这里的服务很好。': ['Zhèlǐ de fúwù hěn hǎo.', 'Dịch vụ ở đây rất tốt.'],
  '我们需要解决这个问题。': ['Wǒmen xūyào jiějué zhège wèntí.', 'Chúng ta cần giải quyết vấn đề này.'],
  '问题已经解决了。': ['Wèntí yǐjīng jiějué le.', 'Vấn đề đã được giải quyết rồi.'],
  '我们需要协调各部门的工作。': ['Wǒmen xūyào xiétiáo gè bùmén de gōngzuò.', 'Chúng ta cần điều phối công việc giữa các phòng ban.'],
  '我对服务很满意。': ['Wǒ duì fúwù hěn mǎnyì.', 'Tôi rất hài lòng với dịch vụ.'],
  '他不仅聪明，而且很努力。': ['Tā bùjǐn cōngming, érqiě hěn nǔlì.', 'Anh ấy không những thông minh mà còn rất chăm chỉ.'],
  '学习中文不仅有用，而且很有意思。': ['Xuéxí Zhōngwén bùjǐn yǒuyòng, érqiě hěn yǒu yìsi.', 'Học tiếng Trung không những hữu ích mà còn rất thú vị.'],
  '他被邀请参加会议。': ['Tā bèi yāoqǐng cānjiā huìyì.', 'Anh ấy được mời tham dự cuộc họp.'],
  '手机被人拿走了。': ['Shǒujī bèi rén ná zǒu le.', 'Điện thoại đã bị ai đó lấy đi.'],
  '只要坚持，就会进步。': ['Zhǐyào jiānchí, jiù huì jìnbù.', 'Chỉ cần kiên trì thì sẽ tiến bộ.'],
  '只要有时间，我就练习。': ['Zhǐyào yǒu shíjiān, wǒ jiù liànxí.', 'Chỉ cần có thời gian là tôi sẽ luyện tập.'],
  '与其担心，不如行动。': ['Yǔqí dānxīn, bùrú xíngdòng.', 'Thay vì lo lắng, chi bằng hành động.'],
  '与其等待，不如开始。': ['Yǔqí děngdài, bùrú kāishǐ.', 'Thay vì chờ đợi, chi bằng bắt đầu.'],
  '即使很忙，我也会完成。': ['Jíshǐ hěn máng, wǒ yě huì wánchéng.', 'Cho dù rất bận, tôi vẫn sẽ hoàn thành.'],
  '即使下雨，我们也去。': ['Jíshǐ xiàyǔ, wǒmen yě qù.', 'Cho dù trời mưa, chúng tôi vẫn đi.']

function makeVocabulary(level:Level, lessonNo:number, words:Array<[string,string,string,string,string]>, cat:string):StructuredVocabulary[]{
  return words.map((w,i)=>{const example=curatedSentenceContent[w[4]];return{id:level.replace(' ','').toLowerCase()+'-v'+lessonNo+'-'+(i+1),hanzi:w[0],pinyin:w[1],pinyinNumbered:w[1],vietnamese:w[2],partOfSpeech:w[3],exampleChinese:w[4],examplePinyin:example?.[0]||'',exampleVietnamese:example?.[1]||'',hskLevel:level,category:cat,audio:'',difficulty:(i<2?1:i<4?2:3) as 1|2|3};});
}
function sentence(id:string,chinese:string,pinyin:string,vietnamese:string):StructuredSentence{return{id,chinese,pinyin,vietnamese};}
function makeLesson(level:Level,lessonNo:number,item:(typeof data)[Level][number]):StructuredLesson{
  const vocab=makeVocabulary(level,lessonNo,item.words,item.cat);
  const g:GrammarRecord={id:item.grammar[0],pattern:item.grammar[1],meaning:item.grammar[2],explanationVi:item.grammar[3],examples:item.grammar[4].map((x,i)=>{const content=curatedSentenceContent[x];return sentence(item.grammar[0]+'-'+i,x,content?.[0]||'',content?.[1]||'');}),commonMistakes:['Dùng sai trật tự thành phần hoặc áp dụng cấu trúc ngoài ngữ cảnh.','Cần kiểm tra chủ ngữ, thời điểm và quan hệ logic của hai mệnh đề.'],practiceQuestions:item.grammar[4]};
  const prompt=sentence(level.replace(' ','')+'-'+lessonNo+'-prompt',item.prompt[0],item.prompt[1],item.prompt[2]);
  const follow=sentence(level.replace(' ','')+'-'+lessonNo+'-follow',item.prompt[0],item.prompt[1],item.prompt[3]);
  const review:ReviewItem[]=vocab.slice(0,5).map((v,i)=>({id:v.id+'-review',type:i%2?'vi-to-zh':'zh-to-vi',prompt:i%2?v.vietnamese:v.hanzi,answer:i%2?v.hanzi:v.vietnamese,vocabularyId:v.id}));
  const speaking:SpeakingExercise={id:level.replace(' ','')+'-'+lessonNo+'-speak',prompt,expectedMeaning:item.prompt[2],followUp:follow};
  const roleplay:RoleplayScenario={id:level.replace(' ','')+'-'+lessonNo+'-roleplay',title:item.role,situation:item.situation,aiOpening:prompt,targetVocabIds:vocab.map(v=>v.id),evaluationDimensions:['meaning','grammar','vocabulary','naturalness','pronunciation']};
  return{id:level.replace(' ','').toLowerCase()+'-lesson-'+lessonNo,hskLevel:level,lessonNumber:lessonNo,titleVi:item.vi,titleZh:item.zh,pinyin:item.py,objective:item.objective,estimatedMinutes:15,vocabulary:vocab,grammar:[g],dialogue:[prompt,follow],listening:[prompt,follow],speaking:[speaking],roleplay,review};
}
export const HSK2_6_LESSONS:StructuredLesson[]=(['HSK 2','HSK 3','HSK 4','HSK 5','HSK 6'] as Level[]).flatMap(level=>data[level].map((item,i)=>makeLesson(level,i+1,item)));
export const HSK_LESSONS:StructuredLesson[] = HSK2_6_LESSONS;
