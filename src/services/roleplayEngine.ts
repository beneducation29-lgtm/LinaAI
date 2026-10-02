import { aiTutor, SendMessageOptions } from './aiTutor';
import { ConversationMessage, RoleplayScenario, RoleplaySessionState, RoleplaySummary, ImmersionLevel } from '../types';

export const ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  {id:'rp-new-person',scenario:'Gặp người mới',context:'Hai người lần đầu gặp nhau trong một buổi học.',character:'Bạn mới quen',learnerRole:'Người học',aiRole:'Người mới quen',difficulty:'beginner',targetVocabulary:['你好','名字','认识','来自'],targetGrammar:['我叫…','我是…人'],successCriteria:['Giới thiệu tên','Nói mình đến từ đâu','Hỏi lại một thông tin']},
  {id:'rp-restaurant',scenario:'Gọi món',context:'Bạn đang gọi món tại một nhà hàng ở Trung Quốc.',character:'Nhân viên nhà hàng',learnerRole:'Khách hàng',aiRole:'Nhân viên',difficulty:'beginner',targetVocabulary:['菜单','点菜','米饭','喝','多少钱'],targetGrammar:['我想要…','请给我…'],successCriteria:['Gọi ít nhất một món','Chọn đồ uống','Xác nhận đơn']},
  {id:'rp-shopping',scenario:'Mua đồ',context:'Bạn đang mua một món đồ trong cửa hàng.',character:'Nhân viên bán hàng',learnerRole:'Khách hàng',aiRole:'Nhân viên',difficulty:'beginner',targetVocabulary:['喜欢','颜色','大','小','买'],targetGrammar:['我想买…','有没有…'],successCriteria:['Nêu món muốn mua','Mô tả lựa chọn','Quyết định mua']},
  {id:'rp-price',scenario:'Hỏi giá',context:'Bạn muốn biết giá và thương lượng lịch sự.',character:'Người bán',learnerRole:'Khách hàng',aiRole:'Người bán',difficulty:'beginner',targetVocabulary:['多少钱','便宜','贵','块','可以'],targetGrammar:['多少钱？','可以便宜一点吗？'],successCriteria:['Hỏi giá','Phản hồi về giá','Kết thúc giao dịch']},
  {id:'rp-directions',scenario:'Hỏi đường',context:'Bạn đang tìm ga tàu điện gần đó.',character:'Người địa phương',learnerRole:'Người hỏi đường',aiRole:'Người địa phương',difficulty:'beginner',targetVocabulary:['地铁站','怎么走','左边','右边','前面'],targetGrammar:['请问…怎么走？','在…旁边'],successCriteria:['Hỏi địa điểm','Hiểu hướng dẫn','Xác nhận lại đường']},
  {id:'rp-taxi',scenario:'Đi taxi',context:'Bạn bắt taxi đến một địa chỉ.',character:'Tài xế taxi',learnerRole:'Hành khách',aiRole:'Tài xế',difficulty:'beginner',targetVocabulary:['出租车','去','地址','到了','多少钱'],targetGrammar:['请到…','要多久？'],successCriteria:['Nói điểm đến','Hỏi thời gian','Hỏi giá']},
  {id:'rp-hotel',scenario:'Khách sạn',context:'Bạn nhận phòng và hỏi về tiện nghi.',character:'Lễ tân',learnerRole:'Khách',aiRole:'Lễ tân',difficulty:'intermediate',targetVocabulary:['预订','房间','护照','早餐','入住'],targetGrammar:['我预订了…','有没有…'],successCriteria:['Xác nhận đặt phòng','Hỏi một tiện nghi','Xử lý một vấn đề nhỏ']},
  {id:'rp-airport',scenario:'Sân bay',context:'Bạn làm thủ tục và hỏi thông tin chuyến bay.',character:'Nhân viên sân bay',learnerRole:'Hành khách',aiRole:'Nhân viên',difficulty:'intermediate',targetVocabulary:['登机牌','航班','行李','登机口','护照'],targetGrammar:['在哪里…？','我的航班是…'],successCriteria:['Hỏi cổng','Nói thông tin chuyến bay','Hỏi về hành lý']},
  {id:'rp-school',scenario:'Trường học',context:'Bạn nói chuyện với một bạn học mới.',character:'Bạn cùng lớp',learnerRole:'Học sinh',aiRole:'Bạn cùng lớp',difficulty:'beginner',targetVocabulary:['学校','同学','老师','课程','喜欢'],targetGrammar:['你喜欢…吗？','我觉得…'],successCriteria:['Nói về lớp học','Hỏi sở thích học tập']},
  {id:'rp-work',scenario:'Công việc',context:'Bạn trao đổi ngắn với đồng nghiệp.',character:'Đồng nghiệp',learnerRole:'Nhân viên',aiRole:'Đồng nghiệp',difficulty:'intermediate',targetVocabulary:['工作','会议','今天','明天','完成'],targetGrammar:['我们需要…','什么时候…？'],successCriteria:['Nói nhiệm vụ','Hỏi thời gian','Xác nhận việc cần làm']},
  {id:'rp-phone',scenario:'Gọi điện',context:'Bạn gọi điện để hẹn một cuộc gặp.',character:'Người bạn gọi',learnerRole:'Người gọi',aiRole:'Người nhận cuộc gọi',difficulty:'intermediate',targetVocabulary:['打电话','方便','见面','时间','明天'],targetGrammar:['现在方便吗？','我们…怎么样？'],successCriteria:['Mở đầu cuộc gọi','Đề xuất thời gian','Xác nhận lịch']},
  {id:'rp-doctor',scenario:'Đi khám',context:'Bạn mô tả một triệu chứng đơn giản với bác sĩ.',character:'Bác sĩ',learnerRole:'Bệnh nhân',aiRole:'Bác sĩ',difficulty:'intermediate',targetVocabulary:['医生','身体','疼','不舒服','昨天'],targetGrammar:['我觉得…','…的时候…'],successCriteria:['Mô tả triệu chứng','Nói thời điểm bắt đầu','Trả lời câu hỏi của bác sĩ']},
  {id:'rp-intro',scenario:'Giới thiệu bản thân',context:'Bạn giới thiệu bản thân trong một nhóm học tiếng Trung.',character:'Thành viên nhóm',learnerRole:'Người giới thiệu',aiRole:'Thành viên nhóm',difficulty:'beginner',targetVocabulary:['叫','来自','学习','喜欢','工作'],targetGrammar:['我叫…','我来自…','我喜欢…'],successCriteria:['Tên','Nơi đến','Một sở thích hoặc công việc']},
  {id:'rp-family',scenario:'Nói về gia đình',context:'Bạn trò chuyện với một người bạn mới về gia đình.',character:'Người bạn',learnerRole:'Người học',aiRole:'Người bạn',difficulty:'beginner',targetVocabulary:['家人','爸爸','妈妈','哥哥','姐姐'],targetGrammar:['我家有…','我的…是…'],successCriteria:['Nói số thành viên','Giới thiệu ít nhất một người']},
  {id:'rp-hobby',scenario:'Nói về sở thích',context:'Hai người trò chuyện sau giờ học.',character:'Bạn học',learnerRole:'Người học',aiRole:'Bạn học',difficulty:'beginner',targetVocabulary:['喜欢','兴趣','看书','音乐','运动'],targetGrammar:['我喜欢…','因为…所以…'],successCriteria:['Nói sở thích','Giải thích ngắn lý do','Hỏi lại sở thích']}
];

export class RoleplayEngine {
  private session: RoleplaySessionState | null = null;
  constructor(private tutor = aiTutor) {}
  start(scenario: RoleplayScenario, immersion: ImmersionLevel = 'beginner'): RoleplaySessionState { this.session={scenario,immersion,learnerFacts:[],choices:[],turnCount:0,startedAt:new Date().toISOString()}; return this.session; }
  getState(){return this.session;}
  buildTurnPrompt(userText:string):string {
    if(!this.session)return userText; const s=this.session;
    const memory=s.learnerFacts.length?'Trong roleplay, Lina đã biết: '+s.learnerFacts.join(' | '):'Chưa có thông tin cá nhân nào được ghi nhớ.';
    const immersion=s.immersion==='beginner'?'Chinese + Pinyin + Vietnamese':s.immersion==='intermediate'?'Chinese + Pinyin; Vietnamese chỉ khi cần hỗ trợ':'Chinese only, không giải thích dài';
    return '[ROLEPLAY]\nTình huống: '+s.scenario.scenario+'. Context: '+s.scenario.context+'.\nLina đóng vai: '+s.scenario.aiRole+'. Người học: '+s.scenario.learnerRole+'.\nMục tiêu: '+s.scenario.successCriteria.join('; ')+'.\nTừ vựng mục tiêu: '+s.scenario.targetVocabulary.join(', ')+'.\nNgữ pháp mục tiêu: '+s.scenario.targetGrammar.join(' | ')+'.\nImmersion: '+immersion+'.\n'+memory+'\nLuôn phản ứng theo đúng câu người học vừa nói. Nếu câu khác dự kiến nhưng đúng ý, tiếp tục tình huống. Nếu sai: hiểu ý trước, sửa ngắn gọn, đưa một gợi ý nhỏ rồi tiếp tục roleplay. Phân biệt câu đúng ngữ pháp với cách nói tự nhiên; nếu câu đúng nhưng chưa tự nhiên, nói ngắn: Câu của bạn đúng. Trong hội thoại tự nhiên, có thể nói… Không hỏi lại thông tin đã được nói trong session. Không biến roleplay thành bài giảng.\nLượt hiện tại: '+userText;
  }
  async sendTurn(options:Omit<SendMessageOptions,'topicTitleVi'|'mode'>,userText:string){
    if(!this.session)throw new Error('Roleplay session has not started'); this.session.turnCount++; this.session.choices.push(userText);
    const prompt=this.buildTurnPrompt(userText);
    const memoryFacts=['ROLEPLAY: '+this.session.scenario.scenario,'Context: '+this.session.scenario.context,'Vai Lina: '+this.session.scenario.aiRole,'Vai learner: '+this.session.scenario.learnerRole,'Immersion: '+this.session.immersion,...this.session.learnerFacts];
    return this.tutor.sendMessage({...options,topicTitleVi:'Roleplay · '+this.session.scenario.scenario,mode:'conversation',memoryFacts},prompt);
  }
  rememberFact(fact:string){if(this.session&&fact.trim()&&!this.session.learnerFacts.includes(fact.trim()))this.session.learnerFacts.push(fact.trim());}
  setImmersion(level:ImmersionLevel){if(this.session)this.session.immersion=level;}
  summarize(messages:ConversationMessage[]):RoleplaySummary {
    if(!this.session)return {summary:'Chưa có roleplay.',vocabularyLearned:[],grammarLearned:[],mistakes:[],pronunciationIssues:[],usefulExpressions:[],suggestedReview:[]};
    const ai=messages.filter(m=>m.sender==='ai'); const user=messages.filter(m=>m.sender==='user');
    const vocab=[...new Set(ai.flatMap(m=>(m.vocabulary||[]).map(v=>v.hanzi+' · '+v.pinyin+' · '+v.vietnamese)))].slice(0,12);
    const grammar=[...new Set(ai.flatMap(m=>(m.grammar||[]).map(g=>g.structure+' · '+g.meaningVi)))].slice(0,8);
    const mistakes=[...new Set(ai.filter(m=>m.correction?.hasMistake).map(m=>m.correction!.originalSentence+' → '+m.correction!.correctedSentence))].slice(0,8);
    const expressions=[...new Set(ai.flatMap(m=>m.suggestedReplies||[]).map(x=>x.hanzi+' · '+x.pinyin))].slice(0,8);
    return {summary:'Bạn đã hoàn thành '+user.length+' lượt trong tình huống “'+this.session.scenario.scenario+'”.',vocabularyLearned:vocab,grammarLearned:grammar,mistakes,pronunciationIssues:['Chưa có dữ liệu acoustic đủ tin cậy để đánh giá điểm phát âm.'],usefulExpressions:expressions,suggestedReview:[...new Set([...mistakes,...this.session.scenario.targetVocabulary])].slice(0,8)};
  }
}
export const createRoleplayEngine=()=>new RoleplayEngine();