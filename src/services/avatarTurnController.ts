export class AvatarTurnController {
  private sequence=0; private activeTurnId:string|null=null; private sentenceSequence=0;
  beginTurn():string{const id=\`turn_\${++this.sequence}\`;this.activeTurnId=id;this.sentenceSequence=0;return id;}
  nextSentence(turnId:string):string|null{if(!this.isCurrent(turnId))return null;return \`\${turnId}_sentence_\${++this.sentenceSequence}\`;}
  isCurrent(turnId:string|null):boolean{return Boolean(turnId&&this.activeTurnId===turnId);}
  cancel(turnId?:string){if(!turnId||this.isCurrent(turnId))this.activeTurnId=null;}
  getActiveTurnId(){return this.activeTurnId;}
}
export const avatarTurnController=new AvatarTurnController();
