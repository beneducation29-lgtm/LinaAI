/**
 * Quick Pinyin and Vietnamese dictionary mapper for recognized speech preview
 */

interface PhraseLookup {
  pinyin: string;
  vietnamese: string;
}

const COMMON_PHRASES: Record<string, PhraseLookup> = {
  '我喜欢喝咖啡': {
    pinyin: 'Wǒ xǐhuān hē kāfēi.',
    vietnamese: 'Tôi thích uống cà phê.'
  },
  '你好': {
    pinyin: 'Nǐ hǎo.',
    vietnamese: 'Xin chào.'
  },
  '我叫阿明': {
    pinyin: 'Wǒ jiào Ā Míng.',
    vietnamese: 'Tôi tên là Minh.'
  },
  '我是越南人': {
    pinyin: 'Wǒ shì Yuènán rén.',
    vietnamese: 'Tôi là người Việt Nam.'
  },
  '很高兴认识你': {
    pinyin: 'Hěn gāoxìng rènshi nǐ.',
    vietnamese: 'Rất vui được làm quen với bạn.'
  },
  '你叫什么名字': {
    pinyin: 'Nǐ jiào shénme míngzi?',
    vietnamese: 'Bạn tên là gì?'
  },
  '谢谢': {
    pinyin: 'Xièxie.',
    vietnamese: 'Cảm ơn.'
  },
  '不客气': {
    pinyin: 'Bú kèqi.',
    vietnamese: 'Không có chi.'
  },
  '再见': {
    pinyin: 'Zàijiàn.',
    vietnamese: 'Tạm biệt.'
  },
  '我昨天去北京吗': {
    pinyin: 'Wǒ zuótiān qù Běijīng ma?',
    vietnamese: 'Tôi hôm qua đi Bắc Kinh à?'
  },
  '我昨天去北京了吗': {
    pinyin: 'Wǒ zuótiān qù Běijīng le ma?',
    vietnamese: 'Hôm qua tôi đã đi Bắc Kinh phải không?'
  },
  '我想点一份米饭': {
    pinyin: 'Wǒ xiǎng diǎn yí fèn mǐfàn.',
    vietnamese: 'Tôi muốn gọi một suất cơm.'
  },
  '请问地铁站在哪里': {
    pinyin: 'Qǐngwèn dìtiězhàn zài nǎlǐ?',
    vietnamese: 'Xin hỏi ga tàu điện ngầm ở đâu?'
  }
};

const CHAR_PINYIN: Record<string, string> = {
  '我': 'wǒ', '你': 'nǐ', '他': 'tā', '她': 'tā', '是': 'shì',
  '的': 'de', '在': 'zài', '有': 'yǒu', '人': 'rén', '这': 'zhè',
  '个': 'gè', '上': 'shàng', '们': 'men', '来': 'lái', '到': 'dào',
  '说': 'shuō', '要': 'yào', '去': 'qù', '很': 'hěn', '好': 'hǎo',
  '叫': 'jiào', '什': 'shén', '么': 'me', '名': 'míng', '字': 'zi',
  '喜': 'xǐ', '欢': 'huan', '喝': 'hē', '咖': 'kā', '啡': 'fēi',
  '越': 'yuè', '南': 'nán', '中': 'zhōng', '国': 'guó', '学': 'xué',
  '生': 'shēng', '老': 'lǎo', '师': 'shī', '谢': 'xiè', '吗': 'ma',
  '呢': 'ne', '吧': 'ba', '想': 'xiǎng', '点': 'diǎn', '餐': 'cān',
  '饭': 'fàn', '水': 'shuǐ', '茶': 'chá', '明': 'míng', '昨': 'zuó',
  '天': 'tiān', '问': 'wèn', '路': 'lù', '北': 'běi', '京': 'jīng',
  '了': 'le', '不': 'bù', '高': 'gāo', '兴': 'xìng', '认': 'rèn', '识': 'shi'
};

export function getQuickPinyin(hanziText: string): string {
  if (COMMON_PHRASES[hanziText]) {
    return COMMON_PHRASES[hanziText].pinyin;
  }

  const pinyinWords: string[] = [];
  for (const char of hanziText) {
    if (CHAR_PINYIN[char]) {
      pinyinWords.push(CHAR_PINYIN[char]);
    } else if (/[a-zA-Z0-9\s]/.test(char)) {
      pinyinWords.push(char);
    }
  }

  if (pinyinWords.length === 0) return '';
  const joined = pinyinWords.join(' ');
  return joined.charAt(0).toUpperCase() + joined.slice(1);
}

export function getQuickVietnamese(hanziText: string): string {
  if (COMMON_PHRASES[hanziText]) {
    return COMMON_PHRASES[hanziText].vietnamese;
  }
  return 'Đoạn nói bằng tiếng Trung của bạn';
}
