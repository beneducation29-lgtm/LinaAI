export interface PrivacyPreferences{  aiMemoryEnabled:boolean;
  conversationHistoryEnabled:boolean;
  analyticsEnabled:boolean;
  voiceDataEnabled:boolean;
  personalizationEnabled:boolean;
}

export const DEFAULT_PRIVACY_PREFERENCES:PrivacyPreferences={
  aiMemoryEnabled:true,
  conversationHistoryEnabled:true,
  analyticsEnabled:true,
  voiceDataEnabled:false,
  personalizationEnabled:true,
};

export function normalizePrivacyPreferences(input:unknown):PrivacyPreferences{
  const x=(input&&typeof input==='object'?input:{}) as Record<string,unknown>;
  return {
    aiMemoryEnabled:x.aiMemoryEnabled!==false,
    conversationHistoryEnabled:x.conversationHistoryEnabled!==false,
    analyticsEnabled:x.analyticsEnabled!==false,
    voiceDataEnabled:x.voiceDataEnabled===true,
    personalizationEnabled:x.personalizationEnabled!==false,
  };
}


export function clearLearningDataLocally(){
  if(typeof localStorage==='undefined')return;
  const keys=[
    'lina_conversation_v1','lina_flashcards_v1','lina_structured_progress_v1',
    'lina_review_schedules_v1','lina_mistakes_v1','lina_structured_saved_v1',
    'lina_tutor_mode_v1','lina_learner_memory_v1','lina_sync_queue_v1','lina_sync_meta_v1'
  ];
  for(const key of keys){try{localStorage.removeItem(key);}catch{}}
}
