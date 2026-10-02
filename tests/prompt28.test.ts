import assert from 'node:assert/strict';
import { buildHSKCoverage, inspectContentHealth } from '../src/services/contentHealth';
import { validateCMSItem } from '../src/services/cmsValidation';
import type { CMSContentItem } from '../src/types/cms';

const vocabulary:CMSContentItem={id:'v1',type:'vocabulary',slug:'xihuan',title:'喜欢',status:'published',contentVersion:1,updatedBy:'admin',updatedAt:new Date().toISOString(),createdAt:new Date().toISOString(),data:{hanzi:'喜欢',pinyin:'xǐhuan',vietnamese:'thích',hsk:'HSK 1',example:'我喜欢中文',audio:'https://example.com/a.mp3',difficulty:1}};
assert.equal(validateCMSItem(vocabulary,[]).length,0);
const health=inspectContentHealth([vocabulary]);
assert.equal(health.some(x=>x.code==='MISSING_TRANSLATION'),false);
const coverage=buildHSKCoverage([vocabulary]);
assert.equal(coverage[0].status,'PARTIAL');
assert.equal(coverage[1].status,'CONTENT GAP');
console.log('Prompt 28 CMS and content-health checks passed.');
