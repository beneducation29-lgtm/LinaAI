import { LessonGenerationParameters } from '../types/lessonEngine';

export const LESSON_ENGINE_TEST_CASES: Array<{name:string;parameters:LessonGenerationParameters}> = [
  {name:'HSK 1 lesson',parameters:{level:'Cơ bản',topic:'Chào hỏi',goal:'Nói và hiểu hội thoại giới thiệu cơ bản',duration:15,hskLevel:'HSK 1',targetVocabulary:['你好','叫','名字','学生'],targetGrammar:['A 是 B','吗'],lessonType:'mixed'}},
  {name:'Grammar lesson',parameters:{level:'Cơ bản',topic:'吗',goal:'Phân biệt câu hỏi có/không',duration:10,hskLevel:'HSK 1',targetVocabulary:['吗','学生'],targetGrammar:['主语 + 谓语 + 吗？'],lessonType:'grammar'}},
  {name:'Vocabulary lesson',parameters:{level:'Cơ bản',topic:'Gia đình',goal:'Củng cố từ vựng gia đình',duration:10,hskLevel:'HSK 1',targetVocabulary:['家','妈妈','爸爸','哥哥','妹妹'],lessonType:'vocabulary'}},
  {name:'Personalized lesson',parameters:{level:'Cơ bản',topic:'Ôn lỗi gần đây',goal:'Cá nhân hóa theo lỗi và hiệu suất gần đây',duration:10,hskLevel:'HSK 1',learnerWeaknesses:['吗','câu hỏi có/không','叫'],targetVocabulary:['吗','叫'],targetGrammar:['主语 + 谓语 + 吗？'],lessonType:'mixed',personalized:true}},
  {name:'5-minute micro lesson',parameters:{level:'Cơ bản',topic:'thanh 3',goal:'Luyện nhận biết và phát âm thanh 3',duration:5,hskLevel:'HSK 1',learnerWeaknesses:['tone 3'],targetVocabulary:['你','好'],targetGrammar:[],lessonType:'speaking'}}
];

export function validateLessonEngineTestCases() {
  return LESSON_ENGINE_TEST_CASES.every(c => c.parameters.duration >= 5 && c.parameters.duration <= 180 && !!c.parameters.topic && !!c.parameters.goal);
}