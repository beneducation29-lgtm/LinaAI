export interface PrivacyPreferences{
  aiMemoryEnabled:boolean;
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
