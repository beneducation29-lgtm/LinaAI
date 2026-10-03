import type { HSKGrammarKnowledge, HSKVocabularyKnowledge, KnowledgeNode } from '../types/hskKnowledge';

export interface HSKValidationIssue {
  code:'REQUIRED_FIELD'|'INVALID_LEVEL'|'MISSING_CURRICULUM_VERSION'|'INVALID_PINYIN'|'DUPLICATE'|'BROKEN_REFERENCE'|'INVALID_PREREQUISITE'|'MISSING_AUDIO'|'INVALID_DIFFICULTY'|'UNVERIFIED_SOURCE';
  severity:'error'|'warning'; field?:string; message:string;
}
const levels=new Set(['HSK 1','HSK 2','HSK 3','HSK 4','HSK 5','HSK 6']);
const pinyinPattern=/[a-zA-ZüÜāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/;
function required(value:unknown,field:string,issues:HSKValidationIssue[]){if(value===undefined||value===null||(typeof value==='string'&&!value.trim()))issues.push({code:'REQUIRED_FIELD',severity:'error',field,message:'Thiếu trường bắt buộc: '+field});}

export function validateVocabulary(item:HSKVocabularyKnowledge,all:HSKVocabularyKnowledge[]=[]):HSKValidationIssue[]{
 const issues:HSKValidationIssue[]=[];
 required(item.id,'id',issues); required(item.hanzi,'hanzi',issues); required(item.pinyin,'pinyin',issues); required(item.meaningVi,'meaningVi',issues); required(item.hskLevel,'hskLevel',issues); required(item.curriculumVersion,'curriculumVersion',issues);
 if(!levels.has(item.hskLevel))issues.push({code:'INVALID_LEVEL',severity:'error',field:'hskLevel',message:'HSK level phải thuộc HSK 1–6.'});
 if(item.pinyin&&!pinyinPattern.test(item.pinyin))issues.push({code:'INVALID_PINYIN',severity:'error',field:'pinyin',message:'Pinyin không có ký tự Latin/diacritic hợp lệ.'});
 if(!item.audio)issues.push({code:'MISSING_AUDIO',severity:'warning',field:'audio',message:'Chưa có audio reference; không được tạo score âm thanh giả.'});
 if(!item.source?.verified)issues.push({code:'UNVERIFIED_SOURCE',severity:'warning',field:'source',message:'Nguồn curriculum chưa được xác minh.'});
 if(item.difficulty<1||item.difficulty>5)issues.push({code:'INVALID_DIFFICULTY',severity:'error',field:'difficulty',message:'Difficulty phải từ 1 đến 5.'});
 const duplicate=all.find(x=>x.id!==item.id&&x.hanzi===item.hanzi&&x.curriculumVersion===item.curriculumVersion);
 if(duplicate)issues.push({code:'DUPLICATE',severity:'error',field:'hanzi',message:'Trùng vocabulary với '+duplicate.id+'.'});
 for(const id of item.prerequisiteVocabulary)if(!all.some(x=>x.id===id))issues.push({code:'BROKEN_REFERENCE',severity:'error',field:'prerequisiteVocabulary',message:'Không tìm thấy prerequisite vocabulary: '+id});
 return issues;
}
export function validateGrammar(item:HSKGrammarKnowledge,all:HSKGrammarKnowledge[]=[]):HSKValidationIssue[]{
 const issues:HSKValidationIssue[]=[];
 required(item.id,'id',issues); required(item.pattern,'pattern',issues); required(item.structure,'structure',issues); required(item.meaningVi,'meaningVi',issues); required(item.curriculumVersion,'curriculumVersion',issues);
 if(!levels.has(item.hskLevel))issues.push({code:'INVALID_LEVEL',severity:'error',field:'hskLevel',message:'HSK level phải thuộc HSK 1–6.'});
 if(!item.source?.verified)issues.push({code:'UNVERIFIED_SOURCE',severity:'warning',field:'source',message:'Nguồn grammar chưa được xác minh.'});
 const duplicate=all.find(x=>x.id!==item.id&&x.pattern===item.pattern&&x.curriculumVersion===item.curriculumVersion);
 if(duplicate)issues.push({code:'DUPLICATE',severity:'error',field:'pattern',message:'Trùng grammar với '+duplicate.id+'.'});
 for(const id of item.prerequisiteGrammar)if(!all.some(x=>x.id===id))issues.push({code:'BROKEN_REFERENCE',severity:'error',field:'prerequisiteGrammar',message:'Không tìm thấy prerequisite grammar: '+id});
 return issues;
}
export function validateKnowledgeGraph(nodes:KnowledgeNode[]):HSKValidationIssue[]{
 const issues:HSKValidationIssue[]=[]; const ids=new Set(nodes.map(n=>n.id));
 for(const node of nodes)for(const prerequisite of node.prerequisiteIds)if(!ids.has(prerequisite))issues.push({code:'BROKEN_REFERENCE',severity:'error',field:'prerequisiteIds',message:'Node '+node.id+' tham chiếu prerequisite không tồn tại: '+prerequisite});
 return issues;
}
export function hasPublishBlockingIssues(issues:HSKValidationIssue[]){return issues.some(x=>x.severity==='error'||x.code==='UNVERIFIED_SOURCE');}
