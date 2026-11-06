import React from 'react';
import { ReadingStoryLibrary } from './ReadingStoryLibrary';
import type { Vocabulary } from '../../types';

interface Props {
  ownerId: string;
  vocabularies: Vocabulary[];
  onSaveVocabulary: (id: string) => void;
  isVocabularySaved: (id: string) => boolean;
}

const PINYIN_SYLLABLES = new Set(`a ai an ang ao e ei en eng er o ou
ba bai ban bang bao bei ben beng bi bian biao bie bin bing bo bu
pa pai pan pang pao pei pen peng pi pian piao pie pin ping po pou pu
ma mai man mang mao me mei men meng mi mian miao mie min ming miu mo mou mu
fa fan fang fei fen feng fo fou fu
da dai dan dang dao de dei den deng di dia dian diao die ding diu dong dou du duan dui dun duo
ta tai tan tang tao te teng ti tian tiao tie ting tong tou tu tuan tui tun tuo
na nai nan nang nao ne nei nen neng ni nian niang niao nie nin ning niu nong nou nu nuan nuo nv nve
la lai lan lang lao le lei leng li lia lian liang liao lie lin ling liu lo long lou lu luan lun luo lv lve
 ga gai gan gang gao ge gei gen geng gong gou gu gua guai guan guang gui gun guo
ka kai kan kang kao ke ken keng kong kou ku kua kuai kuan kuang kui kun kuo
ha hai han hang hao he hei hen heng hong hou hu hua huai huan huang hui hun huo
ji jia jian jiang jiao jie jin jing jiong jiu ju juan jue jun
qi qia qian qiang qiao qie qin qing qiong qiu qu quan que qun
xi xia xian xiang xiao xie xin xing xiong xiu xu xuan xue xun
zhi zha zhai zhan zhang zhao zhe zhei zhen zheng zhi zhong zhou zhu zhua zhuai zhuan zhuang zhui zhun zhuo
chi cha chai chan chang chao che chen cheng chi chong chou chu chua chuai chuan chuang chui chun chuo
shi sha shai shan shang shao she shei shen sheng shi shou shu shua shuai shuan shuang shui shun shuo
ri ran rang rao re ren reng ri rong rou ru rua ruan rui run ruo
zi za zai zan zang zao ze zei zen zeng zi zong zou zu zuan zui zun zuo
ci ca cai can cang cao ce cen ceng ci cong cou cu cuan cui cun cuo
si sa sai san sang sao se sen seng si song sou su suan sui sun suo
y ya yan yang yao ye yi yin ying yo yong you yu yuan yue yun
w wa wai wan wang wei wen weng wo wu`.split(/\s+/));

const PINYIN_TONE_MAP: Record<string, string> = {ā:'a',á:'a',ǎ:'a',à:'a',ē:'e',é:'e',ě:'e',è:'e',ī:'i',í:'i',ǐ:'i',ì:'i',ō:'o',ó:'o',ǒ:'o',ò:'o',ū:'u',ú:'u',ǔ:'u',ù:'u',ǖ:'v',ǘ:'v',ǚ:'v',ǜ:'v',ü:'v',ń:'n',ň:'n',ḿ:'m'};

export function alignPinyinToHanzi(chinese: string, pinyin: string): Array<{ hanzi: string; pinyin: string }> | null {
  const hanzi = Array.from(chinese).filter(char => /[\u3400-\u9fff]/u.test(char));
  const normalized = Array.from(pinyin.toLocaleLowerCase()).map(char => PINYIN_TONE_MAP[char] || char).join('').replace(/u:/g, 'v');
  const compact = normalized.replace(/[^a-zv]/g, '');
  const memo = new Map<string, string[] | null>();
  const solve = (offset: number, remaining: number): string[] | null => {
    if (remaining === 0) return offset === compact.length ? [] : null;
    if (offset >= compact.length || compact.length - offset < remaining) return null;
    const key = offset + ':' + remaining;
    if (memo.has(key)) return memo.get(key)!;
    const candidates = [...PINYIN_SYLLABLES].filter(syllable => compact.startsWith(syllable, offset)).sort((a, b) => b.length - a.length);
    for (const syllable of candidates) {
      const rest = solve(offset + syllable.length, remaining - 1);
      if (rest) { const result = [syllable, ...rest]; memo.set(key, result); return result; }
    }
    memo.set(key, null);
    return null;
  };
  const syllables = solve(0, hanzi.length);
  if (!syllables || syllables.length !== hanzi.length) return null;
  return hanzi.map((char, index) => ({ hanzi: char, pinyin: syllables[index] }));
}

interface ReadingToken { text: string; focus: boolean; }

export function tokenizeReadingSentence(sentence: string, focusWords: string[]): ReadingToken[] {
  const characters = Array.from(sentence);
  const candidates = [...focusWords].filter(Boolean).sort((a, b) => Array.from(b).length - Array.from(a).length);
  const tokens: ReadingToken[] = [];
  let plain = '';
  const flushPlain = () => {
    if (plain) tokens.push({ text: plain, focus: false });
    plain = '';
  };
  for (let index = 0; index < characters.length;) {
    const match = candidates.find(word => characters.slice(index, index + Array.from(word).length).join('') === word);
    if (match) {
      flushPlain();
      tokens.push({ text: match, focus: true });
      index += Array.from(match).length;
    } else {
      plain += characters[index];
      index += 1;
    }
  }
  flushPlain();
  return tokens;
}

let readingSpeechTimer: number | undefined;

export function getReadingProsody(sentence: string, index = 0) {
  const ending = sentence.trim().slice(-1);
  const expressive = /但是|然而|不过|其实|重要|特别|真正|一定/.test(sentence);
  const pitch = /[？?]$/.test(ending) ? 1.12 : /[！!]$/.test(ending) ? 1.1 : expressive ? 1.06 : index % 2 === 0 ? 0.98 : 1.03;
  const pause = /[！!]$/.test(ending) ? 440 : /[？?]$/.test(ending) ? 400 : /[。；]$/.test(ending) ? 340 : 220;
  return { rate: 0.78, pitch, pause };
}

export const ReadingScreen: React.FC<Props> = ({ ownerId, vocabularies, onSaveVocabulary, isVocabularySaved }) => (
  <ReadingStoryLibrary
    ownerId={ownerId}
    vocabularies={vocabularies}
    onSaveVocabulary={onSaveVocabulary}
    isVocabularySaved={isVocabularySaved}
  />
);
