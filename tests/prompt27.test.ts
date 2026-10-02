import assert from 'node:assert/strict';
import { buildRetrievalSequence, generatePracticeSession, getListeningLadder, getReadingSupport, scheduleActivityReview } from '../src/services/activityEngine';
import { createActivity } from '../src/services/activityEngine';
import type { ActivityItem, ActivitySRSItem } from '../src/types/activity';

const base=createActivity({id:'v1',type:'vocabulary-recall',hskLevel:'HSK 1',skill:'vocabulary',difficulty:'ADAPTIVE',targetIds:['喜欢'],prompt:'Tôi thích tiếng Trung là gì?',answer:'我喜欢中文'});
const seq=buildRetrievalSequence(base);
assert.deepEqual(seq.map(x=>x.retrievalStage),['recognize','recall','produce']);
const review:ActivitySRSItem={itemId:'v1',itemType:'vocabulary',schedule:{lastReviewed:null,nextReview:new Date(Date.now()-1000).toISOString(),interval:0,ease:2.5,correctCount:0,incorrectCount:0,mastery:0}};
const updated=scheduleActivityReview(review,true,5);
assert.ok(updated.schedule.nextReview);
const catalog:ActivityItem[]=[
  base,
  createActivity({id:'g1',type:'grammar-transformation',hskLevel:'HSK 1',skill:'grammar',difficulty:'NORMAL',targetIds:['了'],prompt:'Chọn dạng đúng'}),
  createActivity({id:'l1',type:'listening-choice',hskLevel:'HSK 1',skill:'listening',difficulty:'NORMAL',targetIds:['v1'],prompt:'Nghe và chọn'}),
  createActivity({id:'s1',type:'speaking',hskLevel:'HSK 1',skill:'speaking',difficulty:'ADAPTIVE',targetIds:['v1'],prompt:'Nói một câu'}),
];
const session=generatePracticeSession({userId:'u1',hskLevel:'HSK 1',availableTime:15,weakAreas:['喜欢'],reviewDue:[review],recentLessons:[]},catalog);
assert.ok(session.activities.length>=3);
assert.ok(new Set(session.activities.map(x=>x.type)).size>=2);
assert.deepEqual(getListeningLadder(),['slow','normal','no-pinyin','no-vietnamese','question','dictation']);
assert.deepEqual(getReadingSupport('beginner'),{chinese:true,pinyin:true,vietnamese:true});
assert.deepEqual(getReadingSupport('advanced'),{chinese:true,pinyin:false,vietnamese:false});
console.log('Prompt 27 activity engine checks passed.');
