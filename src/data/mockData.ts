import { Lesson, UserProfile, Vocabulary, Flashcard, Conversation } from '../types';
import linaAvatarImg from '../assets/images/lina_avatar_stylized_1790862594850.jpg';

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'user-001',
  name: 'Bạn',
  avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=LinaUser',
  currentLevel: 'Cơ bản',
  currentHsk: 'HSK 1',
  learningGoal: {
    id: 'goal-001',
    category: '🗣 Giao tiếp',
    targetMinutesPerDay: 10,
    targetHskLevel: 'HSK 2',
    weeklyTargetDays: 5
  },
  dailyGoalMinutes: 10,
  todayMinutesSpent: 0,
  streakDays: 0,
  vocabularyLearnedCount: 0,
  lessonsCompletedCount: 0,
  pronunciationAccuracy: 0,
  savedVocabularyIds: [],
  preferences: {
    showChinese: true,
    showPinyin: true,
    showVietnamese: true,
    theme: 'light'
  },
  onboardingCompleted: false
};

export const INITIAL_VOCABULARIES: Vocabulary[] = [
  {
    id: 'vocab-1',
    hanzi: '你好',
    pinyin: 'nǐ hǎo',
    vietnamese: 'xin chào',
    partOfSpeech: 'Thán từ',
    hskLevel: 'HSK 1',
    exampleSentence: {
      hanzi: '你好！很高兴认识你。',
      pinyin: 'Nǐ hǎo! Hěn gāoxìng rènshí nǐ.',
      vietnamese: 'Xin chào! Rất vui được làm quen với bạn.'
    },
    notes: 'Lời chào phổ biến nhất trong tiếng Trung, có thể dùng vào bất kỳ thời điểm nào trong ngày.'
  },
  {
    id: 'vocab-2',
    hanzi: '叫',
    pinyin: 'jiào',
    vietnamese: 'gọi là / tên là',
    partOfSpeech: 'Động từ',
    hskLevel: 'HSK 1',
    exampleSentence: {
      hanzi: '我叫李明。',
      pinyin: 'Wǒ jiào Lǐ Míng.',
      vietnamese: 'Tôi tên là Lý Minh.'
    },
    notes: 'Dùng cấu trúc: 我叫 + [Tên] để giới thiệu tên mình.'
  },
  {
    id: 'vocab-3',
    hanzi: '什么',
    pinyin: 'shénme',
    vietnamese: 'cái gì / gì',
    partOfSpeech: 'Đại từ nghi vấn',
    hskLevel: 'HSK 1',
    exampleSentence: {
      hanzi: '这是什么？',
      pinyin: 'Zhè shì shénme?',
      vietnamese: 'Đây là cái gì?'
    },
    notes: 'Đứng trước danh từ hoặc đứng một mình để hỏi "cái gì".'
  },
  {
    id: 'vocab-4',
    hanzi: '名字',
    pinyin: 'míngzi',
    vietnamese: 'tên / tên gọi',
    partOfSpeech: 'Danh từ',
    hskLevel: 'HSK 1',
    exampleSentence: {
      hanzi: '你的名字很好听。',
      pinyin: 'Nǐ de míngzi hěn hǎotīng.',
      vietnamese: 'Tên của bạn rất hay.'
    },
    notes: 'Tên họ nói chung, thường dùng trong câu: 你叫什么名字？'
  },
  {
    id: 'vocab-5',
    hanzi: '是',
    pinyin: 'shì',
    vietnamese: 'là / phải',
    partOfSpeech: 'Động từ liên hệ',
    hskLevel: 'HSK 1',
    exampleSentence: {
      hanzi: '我是学生。',
      pinyin: 'Wǒ shì xuéshēng.',
      vietnamese: 'Tôi là học sinh.'
    },
    notes: 'Tương đương với động từ "to be" trong tiếng Anh hoặc "là" trong tiếng Việt.'
  },
  {
    id: 'vocab-6',
    hanzi: '越南',
    pinyin: 'Yuènán',
    vietnamese: 'Việt Nam',
    partOfSpeech: 'Danh từ riêng',
    hskLevel: 'HSK 1',
    exampleSentence: {
      hanzi: '我爱越南。',
      pinyin: 'Wǒ ài Yuènán.',
      vietnamese: 'Tôi yêu Việt Nam.'
    }
  },
  {
    id: 'vocab-7',
    hanzi: '人',
    pinyin: 'rén',
    vietnamese: 'người',
    partOfSpeech: 'Danh từ',
    hskLevel: 'HSK 1',
    exampleSentence: {
      hanzi: '他是中国人。',
      pinyin: 'Tā shì Zhōngguó rén.',
      vietnamese: 'Anh ấy là người Trung Quốc.'
    },
    notes: 'Cấu trúc tên nước + 人 = người nước đó (VD: 越南人: người Việt Nam).'
  },
  {
    id: 'vocab-8',
    hanzi: '谢谢',
    pinyin: 'xièxie',
    vietnamese: 'cảm ơn',
    partOfSpeech: 'Động từ',
    hskLevel: 'HSK 1',
    exampleSentence: {
      hanzi: '谢谢你的帮助！',
      pinyin: 'Xièxie nǐ de bāngzhù!',
      vietnamese: 'Cảm ơn sự giúp đỡ của bạn!'
    },
    notes: 'Từ cảm ơn phổ biến. Đáp lại thường dùng: 不客气 (Bú kèqi - Đừng khách sáo).'
  }
];

export const INITIAL_FLASHCARDS: Flashcard[] = INITIAL_VOCABULARIES.map((vocab, index) => ({
  id: `card-${vocab.id}`,
  vocabulary: vocab,
  nextReviewDate: new Date().toISOString(),
  intervalDays: 1 + index,
  repetitionCount: 2,
  easeFactor: 2.5
}));

export const LESSON_HSK1_1: Lesson = {
  id: 'lesson-hsk1-1',
  hskLevel: 'HSK 1',
  lessonNumber: 1,
  titleVi: 'Tự giới thiệu',
  titleZh: '自我介绍',
  pinyin: 'Zìwǒ jièshào',
  description: 'Học cách chào hỏi, hỏi và giới thiệu tên tuổi, quốc tịch cơ bản.',
  estimatedMinutes: 12,
  sections: [
    {
      id: 'sec-vocab',
      type: 'vocabulary',
      title: 'Từ vựng trọng tâm',
      descriptionVi: 'Làm quen với 5 từ vựng cơ bản nhất để tự giới thiệu bản thân.',
      vocabularies: INITIAL_VOCABULARIES.slice(0, 5)
    },
    {
      id: 'sec-grammar',
      type: 'grammar',
      title: 'Ngữ pháp cơ bản',
      descriptionVi: 'Cấu trúc câu hỏi tên và câu khẳng định giới thiệu họ tên.',
      grammarPoints: [
        {
          id: 'gram-1',
          title: 'Cấu trúc giới thiệu tên: 我叫 + [Tên]',
          structure: 'Chủ ngữ + 叫 + Tên',
          explanationVi: 'Trong tiếng Trung, động từ 叫 (jiào) nghĩa là "gọi là, tên là". Sau 叫 trực tiếp thêm tên riêng mà không cần dùng động từ 是 (shì).',
          examples: [
            { hanzi: '我叫阿明。', pinyin: 'Wǒ jiào Ā Míng.', vietnamese: 'Tôi tên là Minh.' },
            { hanzi: '他叫李华。', pinyin: 'Tā jiào Lǐ Huá.', vietnamese: 'Anh ấy tên là Lý Hoa.' }
          ]
        },
        {
          id: 'gram-2',
          title: 'Hỏi tên người khác: 你叫什么名字？',
          structure: 'Chủ ngữ + 叫 + 什么 + 名字？',
          explanationVi: '什么 (shénme) là đại từ nghi vấn đặt trước danh từ 名字 (míngzi) để tạo thành cụm "tên gì".',
          examples: [
            { hanzi: '你叫什么名字？', pinyin: 'Nǐ jiào shénme míngzi?', vietnamese: 'Bạn tên là gì?' },
            { hanzi: '您贵姓？', pinyin: 'Nín guìxìng?', vietnamese: 'Xin hỏi quý tính của ngài? (lịch sự)' }
          ]
        }
      ]
    },
    {
      id: 'sec-listening',
      type: 'listening',
      title: 'Luyện nghe phản xạ',
      descriptionVi: 'Nghe phát âm từ Lina và chọn câu dịch tiếng Việt chính xác.',
      exercises: [
        {
          id: 'ex-listen-1',
          type: 'listening',
          promptVi: 'Nghe đoạn âm thanh sau và chọn ý nghĩa đúng nhất:',
          targetSentence: {
            hanzi: '你好，你叫什么名字？',
            pinyin: 'Nǐ hǎo, nǐ jiào shénme míngzi?',
            vietnamese: 'Xin chào, bạn tên là gì?'
          },
          options: [
            'Xin chào, bạn tên là gì?',
            'Xin chào, bạn có khỏe không?',
            'Tạm biệt, hẹn gặp lại bạn nhé!'
          ],
          correctAnswer: 'Xin chào, bạn tên là gì?'
        },
        {
          id: 'ex-listen-2',
          type: 'listening',
          promptVi: 'Nghe câu trả lời của Lina và chọn phương án dịch đúng:',
          targetSentence: {
            hanzi: '我是越南人。',
            pinyin: 'Wǒ shì Yuènán rén.',
            vietnamese: 'Tôi là người Việt Nam.'
          },
          options: [
            'Tôi là người Việt Nam.',
            'Tôi là người Trung Quốc.',
            'Tôi thích đi du lịch Việt Nam.'
          ],
          correctAnswer: 'Tôi là người Việt Nam.'
        }
      ]
    },
    {
      id: 'sec-speaking',
      type: 'speaking',
      title: 'Luyện phát âm & nói',
      descriptionVi: 'Luyện nói to theo mẫu câu với giọng đọc chuẩn Bắc Kinh.',
      exercises: [
        {
          id: 'ex-speak-1',
          type: 'speaking',
          promptVi: 'Nhấn mic và đọc to câu chào:',
          targetSentence: {
            hanzi: '你好！很高兴认识你。',
            pinyin: 'Nǐ hǎo! Hěn gāoxìng rènshí nǐ.',
            vietnamese: 'Xin chào! Rất vui được làm quen với bạn.'
          },
          hint: 'Chú ý hai âm thanh 3 đi liền nhau (Nǐ hǎo) đổi thành (Ní hǎo).'
        },
        {
          id: 'ex-speak-2',
          type: 'speaking',
          promptVi: 'Đọc câu giới thiệu tên mình:',
          targetSentence: {
            hanzi: '我叫阿明，我是越南人。',
            pinyin: 'Wǒ jiào Ā Míng, wǒ shì Yuènán rén.',
            vietnamese: 'Tôi tên là Minh, tôi là người Việt Nam.'
          },
          hint: 'Âm 叫 (jiào) thanh 4 dứt khoát, âm 人 (rén) thanh 2 uốn lưỡi nhẹ.'
        }
      ]
    },
    {
      id: 'sec-roleplay',
      type: 'roleplay',
      title: 'Đóng vai đối thoại',
      descriptionVi: 'Mô phỏng tình huống gặp gỡ bạn mới ở trường đại học.',
      exercises: [
        {
          id: 'ex-roleplay-1',
          type: 'speaking',
          promptVi: 'Tình huống: Bạn gặp bạn học mới ngày đầu tiên. Hãy chủ động chào và hỏi tên:',
          targetSentence: {
            hanzi: '你好，我叫莉娜。你叫什么名字？',
            pinyin: 'Nǐ hǎo, wǒ jiào Lìnà. Nǐ jiào shénme míngzi?',
            vietnamese: 'Xin chào, mình tên là Lina. Bạn tên là gì?'
          },
          hint: 'Hãy đáp lại: 我叫... (Tôi tên là...)'
        }
      ]
    },
    {
      id: 'sec-review',
      type: 'review',
      title: 'Ôn tập & Tổng kết',
      descriptionVi: 'Củng cố toàn bộ điểm mấu chốt của bài học số 1.',
      vocabularies: INITIAL_VOCABULARIES.slice(0, 5)
    }
  ]
};

export const INITIAL_CONVERSATION: Conversation = {
  id: 'conv-001',
  topicTitleVi: 'Chào hỏi và làm quen cùng Lina',
  hskLevel: 'HSK 1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  messages: [
    {
      id: 'msg-1',
      sender: 'ai',
      hanzi: '你好，我叫莉娜！很高兴认识你。你叫什么名字？',
      pinyin: 'Nǐ hǎo, wǒ jiào Lìnà! Hěn gāoxìng rènshí nǐ. Nǐ jiào shénme míngzi?',
      vietnamese: 'Xin chào, mình tên là Lina! Rất vui được làm quen với bạn. Bạn tên là gì?',
      timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
      grammarTip: '💡 Cấu trúc: 我叫 + [Tên] (Wǒ jiào ...) dùng để giới thiệu tên mình.',
      suggestedReplies: [
        { hanzi: '你好！我叫阿明。', pinyin: 'Nǐ hǎo! Wǒ jiào Ā Míng.', vietnamese: 'Xin chào! Mình tên là Minh.' },
        { hanzi: '我叫小兰，很高兴认识你！', pinyin: 'Wǒ jiào Xiǎolán, hěn gāoxìng rènshí nǐ!', vietnamese: 'Mình tên là Lan, rất vui được quen bạn!' },
        { hanzi: '老师好！', pinyin: 'Lǎoshī hǎo!', vietnamese: 'Em chào cô giáo ạ!' }
      ]
    }
  ]
};

export { linaAvatarImg };
