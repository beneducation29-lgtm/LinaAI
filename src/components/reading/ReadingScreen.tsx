import React from 'react';
import { ReadingStoryLibrary } from './ReadingStoryLibrary';
import type { Vocabulary } from '../../types';

interface Props {
  ownerId: string;
  vocabularies: Vocabulary[];
  onSaveVocabulary: (id: string) => void;
  isVocabularySaved: (id: string) => boolean;
}

/** The chapter-based library is the single reading experience; the old duplicate graded list is retired. */
export const ReadingScreen: React.FC<Props> = ({ ownerId, vocabularies, onSaveVocabulary, isVocabularySaved }) => (
  <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
    <ReadingStoryLibrary
      ownerId={ownerId}
      vocabularies={vocabularies}
      onSaveVocabulary={onSaveVocabulary}
      isVocabularySaved={isVocabularySaved}
    />
  </div>
);
