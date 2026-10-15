import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Volume2 } from 'lucide-react';

type Segment = { zh: string; py: string; vi: string };
type Passage = { title: string; topic: string; segments: Segment[] };
const passages: Record<number, Passage> = {
1:{title:'我的一天',topic:'Sinh hoạt hằng ngày',segments:[
{zh:'我叫小安，今年二十岁。',py:'Wǒ jiào Xiǎo Ān, jīnnián èrshí suì.',vi:'Tôi tên là Tiểu An, năm nay hai mươi tuổi.'},
{zh:'每天早上七点，我起床、洗脸，然后吃早饭。',py:'Měitiān zǎoshang qī diǎn, wǒ qǐchuáng, xǐ liǎn, ránhòu chī zǎofàn.',vi:'Mỗi sáng lúc bảy giờ, tôi thức dậy, rửa mặt rồi ăn sáng.'},
{zh:'我坐公共汽车去学校，八点开始上课。',py:'Wǒ zuò gōnggòng qìchē qù xuéxiào, bā diǎn kāishǐ shàngkè.',vi:'Tôi đi xe buýt đến trường, tám giờ bắt đầu vào học.'},
{zh:'中午我和同学一起吃饭，也会说一会儿中文。',py:'Zhōngwǔ wǒ hé tóngxué yìqǐ chīfàn, yě huì shuō yíhuìr Zhōngwén.',vi:'Buổi trưa tôi ăn cùng bạn học và cũng nói tiếng Trung một lúc.'},
{zh:'下午下课以后，我去图书馆看书、做作业。',py:'Xiàwǔ xiàkè yǐhòu, wǒ qù túshūguǎn kàn shū, zuò zuòyè.',vi:'Buổi chiều tan học, tôi đến thư viện đọc sách và làm bài tập.'},
{zh:'晚上我跟家人吃晚饭，然后听音乐。',py:'Wǎnshang wǒ gēn jiārén chī wǎnfàn, ránhòu tīng yīnyuè.',vi:'Buổi tối tôi ăn cơm cùng gia đình rồi nghe nhạc.'},
{zh:'我每天练习中文，因为我想跟更多中国朋友聊天。',py:'Wǒ měitiān liànxí Zhōngwén, yīnwèi wǒ xiǎng gēn gèng duō Zhōngguó péngyou liáotiān.',vi:'Tôi luyện tiếng Trung mỗi ngày vì muốn trò chuyện với nhiều bạn Trung Quốc hơn.'},
{zh:'虽然有时候很累，但是我觉得学习很有意思。',py:'Suīrán yǒushíhou hěn lèi, dànshì wǒ juéde xuéxí hěn yǒu yìsi.',vi:'Dù đôi khi rất mệt, tôi vẫn thấy việc học rất thú vị.'}]},
2:{title:'一次周末旅行',topic:'Chuyến đi cuối tuần',segments:[
{zh:'上个周末，我和两个朋友决定去附近的城市旅行。',py:'Shàng ge zhōumò, wǒ hé liǎng ge péngyou juédìng qù fùjìn de chéngshì lǚxíng.',vi:'Cuối tuần trước, tôi và hai người bạn quyết định đi du lịch thành phố gần đó.'},
{zh:'我们提前在网上买了火车票，也订好了酒店。',py:'Wǒmen tíqián zài wǎngshàng mǎi le huǒchē piào, yě dìng hǎo le jiǔdiàn.',vi:'Chúng tôi mua vé tàu trên mạng từ trước và đặt khách sạn xong.'},
{zh:'到达以后，先去老街吃当地有名的小吃。',py:'Dàodá yǐhòu, xiān qù lǎojiē chī dāngdì yǒumíng de xiǎochī.',vi:'Sau khi đến nơi, chúng tôi đến phố cổ ăn món ăn vặt nổi tiếng địa phương.'},
{zh:'虽然天气有一点热，但是街道很干净，大家也很热情。',py:'Suīrán tiānqì yǒu yìdiǎn rè, dànshì jiēdào hěn gānjìng, dàjiā yě hěn rèqíng.',vi:'Tuy thời tiết hơi nóng nhưng đường phố sạch sẽ và mọi người rất nhiệt tình.'},
{zh:'下午我们参观博物馆，了解这座城市的历史。',py:'Xiàwǔ wǒmen cānguān bówùguǎn, liǎojiě zhè zuò chéngshì de lìshǐ.',vi:'Buổi chiều chúng tôi tham quan bảo tàng và tìm hiểu lịch sử thành phố.'},
{zh:'晚上下起了雨，我们就在一家小餐馆里休息。',py:'Wǎnshang xià qǐ le yǔ, wǒmen jiù zài yì jiā xiǎo cānguǎn lǐ xiūxi.',vi:'Buổi tối trời bắt đầu mưa nên chúng tôi nghỉ trong một quán ăn nhỏ.'},
{zh:'这次旅行花的钱不多，却让我们看到了不同的生活方式。',py:'Zhè cì lǚxíng huā de qián bù duō, què ràng wǒmen kàndào le bùtóng de shēnghuó fāngshì.',vi:'Chuyến đi này không tốn nhiều tiền nhưng giúp chúng tôi thấy những cách sống khác nhau.'},
{zh:'回家以后，我把照片整理好，还计划下次带家人一起去。',py:'Huí jiā yǐhòu, wǒ bǎ zhàopiàn zhěnglǐ hǎo, hái jìhuà xià cì dài jiārén yìqǐ qù.',vi:'Về nhà, tôi sắp xếp ảnh và còn dự định lần sau đưa gia đình đi cùng.'}]},
3:{title:'学习语言的方法',topic:'Phương pháp học ngoại ngữ',segments:[
{zh:'刚开始学习中文的时候，我常常觉得听力比阅读困难。',py:'Gāng kāishǐ xuéxí Zhōngwén de shíhou, wǒ chángcháng juéde tīnglì bǐ yuèdú kùnnan.',vi:'Khi mới học tiếng Trung, tôi thường thấy nghe khó hơn đọc.'},
{zh:'老师告诉我，语言能力需要通过持续练习慢慢建立。',py:'Lǎoshī gàosu wǒ, yǔyán nénglì xūyào tōngguò chíxù liànxí mànmàn jiànlì.',vi:'Giáo viên nói năng lực ngôn ngữ cần được xây dựng dần qua luyện tập liên tục.'},
{zh:'所以我每天选择一段适合自己水平的材料，先听一遍。',py:'Suǒyǐ wǒ měitiān xuǎnzé yí duàn shìhé zìjǐ shuǐpíng de cáiliào, xiān tīng yí biàn.',vi:'Vì vậy mỗi ngày tôi chọn một đoạn phù hợp trình độ và nghe một lượt trước.'},
{zh:'第一次不看文字，尽量理解主题和说话人的主要意思。',py:'Dì yī cì bú kàn wénzì, jǐnliàng lǐjiě zhǔtí hé shuōhuàrén de zhǔyào yìsi.',vi:'Lần đầu tôi không xem chữ, cố gắng hiểu chủ đề và ý chính của người nói.'},
{zh:'第二次我打开拼音和翻译，检查哪些地方没有听清楚。',py:'Dì èr cì wǒ dǎkāi pīnyīn hé fānyì, jiǎnchá nǎxiē dìfang méiyǒu tīng qīngchu.',vi:'Lần thứ hai tôi mở pinyin và bản dịch để kiểm tra chỗ nào chưa nghe rõ.'},
{zh:'遇到不熟悉的词语，我会记录下来，并用它们造句。',py:'Yùdào bù shúxī de cíyǔ, wǒ huì jìlù xiàlai, bìng yòng tāmen zàojù.',vi:'Gặp từ chưa quen, tôi ghi lại và dùng chúng đặt câu.'},
{zh:'每周复习以前的内容，可以减少遗忘，也能发现自己的进步。',py:'Měi zhōu fùxí yǐqián de nèiróng, kěyǐ jiǎnshǎo yíwàng, yě néng fāxiàn zìjǐ de jìnbù.',vi:'Ôn nội dung cũ mỗi tuần giúp giảm quên và nhận ra sự tiến bộ.'},
{zh:'对我来说，最重要的不是一次学得很多，而是保持习惯。',py:'Duì wǒ lái shuō, zuì zhòngyào de bú shì yí cì xué de hěn duō, ér shì bǎochí xíguàn.',vi:'Với tôi, quan trọng nhất không phải học thật nhiều một lần mà là duy trì thói quen.'}]},
4:{title:'城市生活与公共空间',topic:'Đời sống đô thị',segments:[
{zh:'随着城市人口不断增加，公共空间的规划变得越来越重要。',py:'Suízhe chéngshì rénkǒu búduàn zēngjiā, gōnggòng kōngjiān de guīhuà biàn de yuèláiyuè zhòngyào.',vi:'Khi dân số đô thị liên tục tăng, quy hoạch không gian công cộng ngày càng quan trọng.'},
{zh:'公园不仅为居民提供休息的地方，也有助于改善空气质量。',py:'Gōngyuán bùjǐn wèi jūmín tígōng xiūxi de dìfang, yě yǒuzhù yú gǎishàn kōngqì zhìliàng.',vi:'Công viên không chỉ là nơi nghỉ ngơi mà còn góp phần cải thiện chất lượng không khí.'},
{zh:'然而，如果交通设计不合理，人们可能需要花很多时间通勤。',py:'Rán’ér, rúguǒ jiāotōng shèjì bù hélǐ, rénmen kěnéng xūyào huā hěn duō shíjiān tōngqín.',vi:'Tuy nhiên, nếu thiết kế giao thông thiếu hợp lý, người dân có thể mất nhiều thời gian đi lại.'},
{zh:'因此，城市管理者应该同时考虑效率、安全和居民的实际需求。',py:'Yīncǐ, chéngshì guǎnlǐzhě yīnggāi tóngshí kǎolǜ xiàolǜ, ānquán hé jūmín de shíjì xūqiú.',vi:'Vì vậy, nhà quản lý cần đồng thời cân nhắc hiệu quả, an toàn và nhu cầu thực tế.'},
{zh:'在制定新方案之前，听取不同社区的意见也十分必要。',py:'Zài zhìdìng xīn fāngàn zhīqián, tīngqǔ bùtóng shèqū de yìjiàn yě shífēn bìyào.',vi:'Trước khi xây dựng phương án mới, lắng nghe ý kiến các cộng đồng khác nhau cũng rất cần thiết.'},
{zh:'有些措施短期内需要投入资金，却可能在未来带来更大的收益。',py:'Yǒuxiē cuòshī duǎnqī nèi xūyào tóurù zījīn, què kěnéng zài wèilái dàilái gèng dà de shōuyì.',vi:'Một số biện pháp cần vốn đầu tư trước mắt nhưng có thể đem lại lợi ích lớn hơn về sau.'},
{zh:'评价城市发展的成果时，不能只看建筑数量或经济数据。',py:'Píngjià chéngshì fāzhǎn de chéngguǒ shí, bùnéng zhǐ kàn jiànzhù shùliàng huò jīngjì shùjù.',vi:'Khi đánh giá phát triển đô thị, không thể chỉ nhìn số công trình hay dữ liệu kinh tế.'},
{zh:'一个适合生活的城市，还应该让不同年龄的人都感到方便和安心。',py:'Yí ge shìhé shēnghuó de chéngshì, hái yīnggāi ràng bùtóng niánlíng de rén dōu gǎndào fāngbiàn hé ānxīn.',vi:'Một thành phố đáng sống còn cần khiến người ở nhiều độ tuổi cảm thấy thuận tiện và an tâm.'}]},
5:{title:'信息时代的判断力',topic:'Tư duy phản biện',segments:[
{zh:'在信息传播速度不断加快的今天，获取消息已经变得非常容易。',py:'Zài xìnxī chuánbō sùdù búduàn jiākuài de jīntiān, huòqǔ xiāoxi yǐjīng biàn de fēicháng róngyì.',vi:'Ngày nay, khi thông tin lan truyền ngày càng nhanh, việc tiếp cận tin tức đã rất dễ dàng.'},
{zh:'然而，信息数量的增加并不意味着人们一定能更准确地理解世界。',py:'Rán’ér, xìnxī shùliàng de zēngjiā bìng bù yìwèizhe rénmen yídìng néng gèng zhǔnquè de lǐjiě shìjiè.',vi:'Tuy nhiên, nhiều thông tin hơn không có nghĩa con người chắc chắn hiểu thế giới chính xác hơn.'},
{zh:'面对看起来十分可信的消息，我们仍然需要追问来源和证据。',py:'Miànduì kàn qǐlai shífēn kěxìn de xiāoxi, wǒmen réngrán xūyào zhuīwèn láiyuán hé zhèngjù.',vi:'Trước một tin có vẻ đáng tin, chúng ta vẫn cần hỏi về nguồn và bằng chứng.'},
{zh:'如果只选择支持自己观点的材料，就容易忽略相反的信息。',py:'Rúguǒ zhǐ xuǎnzé zhīchí zìjǐ guāndiǎn de cáiliào, jiù róngyì hūlüè xiāngfǎn de xìnxī.',vi:'Nếu chỉ chọn tài liệu ủng hộ quan điểm của mình, ta dễ bỏ qua thông tin trái chiều.'},
{zh:'比较多个独立来源，可以帮助我们发现事实之间的联系与差异。',py:'Bǐjiào duō ge dúlì láiyuán, kěyǐ bāngzhù wǒmen fāxiàn shìshí zhījiān de liánxì yǔ chāyì.',vi:'So sánh nhiều nguồn độc lập giúp phát hiện mối liên hệ và khác biệt giữa các sự kiện.'},
{zh:'当证据还不充分时，承认暂时无法得出结论反而更加负责任。',py:'Dāng zhèngjù hái bù chōngfèn shí, chéngrèn zànshí wúfǎ déchū jiélùn fǎn’ér gèngjiā fù zérèn.',vi:'Khi bằng chứng chưa đủ, thừa nhận chưa thể kết luận lại là cách có trách nhiệm hơn.'},
{zh:'这种习惯需要时间培养，却能帮助我们减少误判和不必要的争论。',py:'Zhè zhǒng xíguàn xūyào shíjiān péiyǎng, què néng bāngzhù wǒmen jiǎnshǎo wùpàn hé bù bìyào de zhēnglùn.',vi:'Thói quen này cần thời gian rèn luyện nhưng giúp giảm đánh giá sai và tranh luận không cần thiết.'},
{zh:'真正的判断力，不只是知道得多，更是清楚自己为什么相信一件事。',py:'Zhēnzhèng de pànduànlì, bù zhǐ shì zhīdào de duō, gèng shì qīngchu zìjǐ wèishénme xiāngxìn yí jiàn shì.',vi:'Năng lực phán đoán thực sự không chỉ là biết nhiều mà còn hiểu vì sao mình tin điều gì.'}]},
6:{title:'技术进步与社会责任',topic:'Công nghệ và trách nhiệm xã hội',segments:[
{zh:'技术创新不断改变生产方式，也重新塑造人与社会之间的关系。',py:'Jìshù chuàngxīn búduàn gǎibiàn shēngchǎn fāngshì, yě chóngxīn sùzào rén yǔ shèhuì zhījiān de guānxì.',vi:'Đổi mới công nghệ liên tục thay đổi phương thức sản xuất và tái định hình quan hệ giữa con người với xã hội.'},
{zh:'自动化能够提高效率、降低成本，但其影响并不会平均地分配给所有群体。',py:'Zìdònghuà nénggòu tígāo xiàolǜ, jiàngdī chéngběn, dàn qí yǐngxiǎng bìng bú huì píngjūn de fēnpèi gěi suǒyǒu qúntǐ.',vi:'Tự động hóa có thể tăng hiệu suất, giảm chi phí, nhưng tác động không được phân bổ đồng đều cho mọi nhóm.'},
{zh:'部分岗位可能消失，与此同时，新的职业和技能需求也会逐渐出现。',py:'Bùfen gǎngwèi kěnéng xiāoshī, yǔcǐ tóngshí, xīn de zhíyè hé jìnéng xūqiú yě huì zhújiàn chūxiàn.',vi:'Một số vị trí có thể biến mất, đồng thời nghề nghiệp và nhu cầu kỹ năng mới cũng dần xuất hiện.'},
{zh:'因此，政策制定者和企业不能只关注技术带来的短期收益。',py:'Yīncǐ, zhèngcè zhìdìngzhě hé qǐyè bùnéng zhǐ guānzhù jìshù dàilái de duǎnqī shōuyì.',vi:'Vì vậy, nhà hoạch định chính sách và doanh nghiệp không thể chỉ chú ý lợi ích ngắn hạn của công nghệ.'},
{zh:'他们还需要评估转型成本，并为受到影响的劳动者提供培训和支持。',py:'Tāmen hái xūyào pínggū zhuǎnxíng chéngběn, bìng wèi shòudào yǐngxiǎng de láodòngzhě tígōng péixùn hé zhīchí.',vi:'Họ còn cần đánh giá chi phí chuyển đổi và hỗ trợ đào tạo cho người lao động bị ảnh hưởng.'},
{zh:'与此同时，个人信息保护、算法透明度和责任归属也必须得到认真讨论。',py:'Yǔcǐ tóngshí, gèrén xìnxī bǎohù, suànfǎ tòumíngdù hé zérèn guīshǔ yě bìxū dédào rènzhēn tǎolùn.',vi:'Đồng thời, bảo vệ dữ liệu cá nhân, tính minh bạch thuật toán và trách nhiệm cũng cần được thảo luận nghiêm túc.'},
{zh:'如果缺乏适当的监督，技术优势可能转化为新的不平等。',py:'Rúguǒ quēfá shìdàng de jiāndū, jìshù yōushì kěnéng zhuǎnhuà wéi xīn de bù píngděng.',vi:'Nếu thiếu giám sát phù hợp, lợi thế công nghệ có thể chuyển thành bất bình đẳng mới.'},
{zh:'衡量进步的标准，最终应当包括社会是否更加公平、开放且具有韧性。',py:'Héngliáng jìnbù de biāozhǔn, zuìzhōng yīngdāng bāokuò shèhuì shìfǒu gèngjiā gōngpíng, kāifàng qiě jùyǒu rènxìng.',vi:'Thước đo tiến bộ cuối cùng nên bao gồm việc xã hội có công bằng, cởi mở và có khả năng thích ứng hơn hay không.'}]}
};

export const LongListeningLab: React.FC = () => {
 const [hsk,setHsk]=useState(1); const [active,setActive]=useState(-1); const [isPlaying,setIsPlaying]=useState(false); const [showPy,setShowPy]=useState(true); const [showVi,setShowVi]=useState(true); const [rate,setRate]=useState(0.85);
 const utteranceRef=useRef<SpeechSynthesisUtterance|null>(null); const indexRef=useRef(-1);
 const passage=passages[hsk];
 const stop=()=>{if('speechSynthesis' in window) window.speechSynthesis.cancel(); utteranceRef.current=null; indexRef.current=-1; setIsPlaying(false);setActive(-1);};
 const playFrom=(start:number)=>{if(!('speechSynthesis' in window)){return;} window.speechSynthesis.cancel(); indexRef.current=start;setIsPlaying(true);
  const next=()=>{const i=indexRef.current;if(i<0||i>=passage.segments.length){setIsPlaying(false);setActive(-1);return;}const seg=passage.segments[i];setActive(i);const u=new SpeechSynthesisUtterance(seg.zh);u.lang='zh-CN';u.rate=rate;const voice=window.speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('zh-cn'))||window.speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('zh'));if(voice)u.voice=voice;u.onend=()=>{if(indexRef.current===i){indexRef.current=i+1;next();}};u.onerror=()=>{setIsPlaying(false);setActive(-1);};utteranceRef.current=u;window.speechSynthesis.speak(u);};next();
 };
 useEffect(()=>()=>{if('speechSynthesis' in window)window.speechSynthesis.cancel();},[]);
 useEffect(()=>{stop();},[hsk]);
 return <section className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm dark:border-amber-900/50 dark:from-amber-950/20 dark:to-stone-900 sm:p-6">
  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Long-form shadow listening</div><h2 className="mt-1 text-xl font-bold text-stone-900 dark:text-stone-100">Nghe đoạn văn dài · HSK 1–6</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-stone-600 dark:text-stone-300">Đọc đồng bộ từng câu: chữ Hán, pinyin và nghĩa tiếng Việt cùng được tô sáng khi câu đang phát. Chọn một câu để nghe lại từ vị trí đó.</p></div>
   <label className="text-sm font-semibold text-stone-700 dark:text-stone-200">Trình độ<select value={hsk} onChange={e=>setHsk(Number(e.target.value))} className="mt-1 block min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3 dark:border-stone-700 dark:bg-stone-900">{[1,2,3,4,5,6].map(n=><option key={n} value={n}>HSK {n}</option>)}</select></label>
  </div>
  <div className="mt-4 flex flex-wrap items-center gap-2"><button onClick={()=>isPlaying?stop():playFrom(Math.max(0,active))} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-500 px-4 font-bold text-white hover:bg-amber-600">{isPlaying?<Pause size={17}/>:<Play size={17}/>} {isPlaying?'Dừng phát':'Nghe từ đầu'}</button><button onClick={()=>playFrom(0)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-stone-300 px-3 text-sm font-semibold dark:border-stone-700"><RotateCcw size={16}/> Phát lại</button><label className="flex items-center gap-2 text-sm">Tốc độ <select value={rate} onChange={e=>setRate(Number(e.target.value))} className="min-h-10 rounded-lg border border-stone-300 bg-white px-2 dark:border-stone-700 dark:bg-stone-900"><option value={0.65}>0.65×</option><option value={0.85}>0.85×</option><option value={1}>1×</option><option value={1.15}>1.15×</option></select></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showPy} onChange={e=>setShowPy(e.target.checked)}/> Pinyin</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showVi} onChange={e=>setShowVi(e.target.checked)}/> Tiếng Việt</label></div>
  <div className="mt-4 flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400"><BookOpenIcon/> <span><strong>{passage.title}</strong> · {passage.topic} · {passage.segments.length} câu đồng bộ</span><span className="ml-auto inline-flex items-center gap-1"><Volume2 size={15}/> TTS tiếng Trung trên thiết bị</span></div>
  <div className="mt-3 space-y-2">{passage.segments.map((s,i)=><button type="button" key={i} onClick={()=>playFrom(i)} className={`block w-full rounded-2xl border p-3 text-left transition sm:p-4 ${active===i?'border-amber-400 bg-amber-100 ring-2 ring-amber-300/60 dark:border-amber-600 dark:bg-amber-950/50':'border-stone-200 bg-white/80 hover:border-amber-300 dark:border-stone-800 dark:bg-stone-950/30'}`}><div className="flex gap-3"><span className="mt-1 text-xs font-bold text-stone-400">{String(i+1).padStart(2,'0')}</span><div className="min-w-0 flex-1"><p className={`text-lg leading-8 sm:text-xl ${active===i?'font-semibold text-amber-950 dark:text-amber-100':'text-stone-900 dark:text-stone-100'}`}>{s.zh}</p>{showPy&&<p className={`mt-1 text-sm leading-6 ${active===i?'font-semibold text-amber-800 dark:text-amber-200':'text-sky-700 dark:text-sky-300'}`}>{s.py}</p>}{showVi&&<p className={`mt-1 text-sm leading-6 ${active===i?'font-semibold text-amber-800 dark:text-amber-200':'text-stone-600 dark:text-stone-300'}`}>{s.vi}</p>}</div></div></button>)}</div>
  <p className="mt-3 text-xs leading-5 text-stone-500 dark:text-stone-400">Lưu ý: highlight hiện đồng bộ theo từng câu/nhịp đọc, không phải từng âm tiết. Giọng đọc phụ thuộc giọng tiếng Trung có sẵn trên trình duyệt hoặc thiết bị.</p>
 </section>;
};
const BookOpenIcon: React.FC = () => <span aria-hidden="true">📖</span>;
