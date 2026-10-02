import assert from 'node:assert/strict';
import { buildHSKCoverage, inspectContentHealth } from '../src/services/contentHealth';
import { canTransitionTo, bulkPublish, diffContent, qualityCount } from '../src/services/cmsWorkflow';
import { validateCMSItem } from '../src/services/cmsValidation';
import type { CMSContentItem } from '../src/types/cms';

const vocabulary:CMSContentItem={id:'v1',type:'vocabulary',slug:'xihuan',title:'喜欢',status:'published',contentVersion:1,updatedBy:'admin',updatedAt:new Date().toISOString(),createdAt:new Date().toISOString(),data:{hanzi:'喜欢',pinyin:'xǐhuan',vietnamese:'thích',hsk:'HSK 1',example:'我喜欢中文',audio:'https://example.com/a.mp3',difficulty:1}};
assert.equal(validateCMSItem(vocabulary,[]).length,0);
assert.equal(inspectContentHealth([vocabulary]).some(x=>x.code==='MISSING_TRANSLATION'),false);
assert.equal(buildHSKCoverage([vocabulary])[0].status,'PARTIAL');
assert.equal(buildHSKCoverage([vocabulary])[1].status,'CONTENT GAP');
assert.equal(qualityCount(vocabulary),'7/7 checks passed');
const changed={...vocabulary,title:'喜欢 — updated',contentVersion:2};
assert.equal(diffContent(vocabulary,changed).length,2);
assert.equal(canTransitionTo(vocabulary,'published',[vocabulary]),true);
assert.equal(bulkPublish([vocabulary],[vocabulary]).allowed,true);
const invalid={...vocabulary,id:'v2',slug:'bad',data:{...vocabulary.data,pinyin:'***'}};
assert.equal(bulkPublish([invalid],[vocabulary,invalid]).allowed,false);
console.log('Prompt 28 CMS and content-health checks passed.');
