export interface LinaOutfitConfig { id:string; type:string; color:string; sleeve:string; neckline:string; texture:string; style:string; }
export interface LinaVisualConfig { characterId:string; name:string; chineseName:string; hairstyle:string; hairColor:string; framing:string; camera:string; background:string; lighting:string; outfit:LinaOutfitConfig; }
export const LINA_DEFAULT_OUTFIT: LinaOutfitConfig = {
 id:'default-lina-outfit', type:'ribbed-knit-top', color:'dusty-rose-pink', sleeve:'long', neckline:'scoop', texture:'subtle-ribbed', style:'elegant-casual-teacher'
};
export const LINA_VISUAL_CONFIG: LinaVisualConfig = {
 characterId:'lina-original-fictional-tutor-v1', name:'Lina', chineseName:'林娜',
 hairstyle:'dark short bob', hairColor:'soft dark brunette', framing:'stable upper-body medium close-up',
 camera:'eye-level stable direct communication angle', background:'warm neutral modern indoor tutor room with subtle depth',
 lighting:'soft natural warm light', outfit:LINA_DEFAULT_OUTFIT
};
export const LINA_AVATAR_FALLBACK_ORDER=['realtime','animated','static'] as const;
