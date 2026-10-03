import assert from 'node:assert/strict';
import { HSK_CURRICULUM_LEVELS } from '../src/data/hskCurriculum';
import { buildKnowledgeGraph, calculateReadiness, chooseDifficulty, generateDailyHSKSession, masteryBand } from '../src/services/hskKnowledgeEngine';
import { validateGrammar, validateKnowledgeGraph, validateVocabulary } from '../src/services/hskContentValidator';

assert.equal(HSK_CURRICULUM_LEVELS.length,6);
assert.ok(HSK_CURRICULUM_LEVELS.every(x=>x.contentStatus==='CONTENT_GAP'));
assert.equal(masteryBand(20,false,1,0),'LEARNING');
assert.equal(masteryBand(90,false,4,0),'MASTERED');
assert.equal(masteryBand(90,true,4,0),'REVIEW_DUE');
assert.equal(masteryBand(90,false,4,2),'STRUGGLING');
assert.equal(chooseDifficulty(20,0),'EASY');
assert.equal(chooseDifficulty(90,.1),'CHALLENGING');

const graph=buildKnowledgeGraph(
 [{id:'v1',type:'vocabulary',title:'词',level:'HSK 1',curriculumVersion:'TEST',prerequisiteIds:[],relatedIds:[]},{id:'g1',type:'grammar',title:'是',level:'HSK 1',curriculumVersion:'TEST',prerequisiteIds:['v1'],relatedIds:[]}],
 [{from:'v1',to:'g1',relation:'PREREQUISITE'}]
);
assert.deepEqual(graph.edges,[{from:'v1',to:'g1',relation:'PREREQUISITE'}]);
assert.deepEqual(validateKnowledgeGraph(graph.nodes),[]);
assert.equal(calculateReadiness('HSK 3',{v1:80},{vocabulary:80,grammar:60,listening:50,speaking:40,reading:70,writing:30,pronunciation:50}).isOfficialCertification,false);
const session=generateDailyHSKSession({userId:'u1',hskLevel:'HSK 3',availableMinutes:15,weakSkills:['listening'],mastery:{v1:80},reviewDueIds:['v1'],recentMistakes:['v2'],recentLessonId:'l1'});
assert.equal(session.minutes,15);assert.ok(session.items.length>0);assert.equal(session.items[0].stage,'warm-up');

const validVocab:any={id:'v1',hanzi:'学',simplified:'学',pinyin:'xué',meaningVi:'học',collocations:[],synonyms:[],antonyms:[],examples:['我学习中文。'],hskLevel:'HSK 1',curriculumVersion:'UNVERIFIED_PROJECT_CURRICULUM',difficulty:1,relatedWords:[],commonMistakes:[],prerequisiteVocabulary:[],status:'DRAFT',version:'1',createdAt:'',updatedAt:'',source:{id:'s',label:'unverified',version:'UNVERIFIED_PROJECT_CURRICULUM',verified:false}};
assert.ok(validateVocabulary(validVocab).some(x=>x.code==='UNVERIFIED_SOURCE'));
assert.ok(validateVocabulary(validVocab).some(x=>x.code==='MISSING_AUDIO'));
const validGrammar:any={id:'g1',pattern:'A 是 B',structure:'A 是 B',meaningVi:'là',usage:'identity',examples:['我是学生。'],commonMistakes:[],contrastGrammar:[],hskLevel:'HSK 1',curriculumVersion:'UNVERIFIED_PROJECT_CURRICULUM',prerequisiteGrammar:[],relatedVocabulary:[],status:'DRAFT',version:'1',createdAt:'',updatedAt:'',source:{id:'s',label:'unverified',version:'UNVERIFIED_PROJECT_CURRICULUM',verified:false}};
assert.ok(validateGrammar(validGrammar).some(x=>x.code==='UNVERIFIED_SOURCE'));
console.log('Prompt 33 deep HSK knowledge engine tests passed.');
