import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

const stage = read('src/components/avatar/AvatarStage.tsx');
const tutor = read('src/components/tutor/TutorScreen.tsx');
const avatar = read('src/components/avatar/LinaAvatar.tsx');
const machine = read('src/services/avatarStateMachine.ts');
const avatarService = read('src/services/avatarService.ts');

assert.match(stage, /LinaAvatar/);
assert.match(stage, /你好，我是 Lina!/);
assert.match(stage, /hskLevel/);
assert.match(stage, /topicTitle/);

for (const state of ['IDLE','LISTENING','THINKING','SPEAKING','HAPPY','ENCOURAGING','CONFUSED','ERROR']) {
  assert.match(avatar, new RegExp(state));
  assert.match(avatarService, new RegExp(state));
}

assert.match(machine, /LISTENING: \['THINKING', 'ERROR', 'IDLE'\]/);
assert.match(machine, /THINKING: \['SPEAKING'/);
assert.match(machine, /SPEAKING: \['IDLE'/);
assert.match(machine, /ERROR: \['IDLE'/);

assert.match(tutor, /<AvatarStage/);
assert.match(tutor, /Bắt đầu nói chuyện/);
assert.match(tutor, /Nói chậm/);
assert.match(tutor, /Giải thích/);
assert.match(tutor, /LayerToggles compact/);
assert.match(tutor, /setState\('SPEAKING'\)/);
assert.match(tutor, /setState\('IDLE'\)/);

assert.equal(stage.includes('saymei.app'), false);
assert.equal(avatar.includes('saymei.app'), false);
assert.equal(tutor.includes('saymei.app'), false);

console.log('Avatar/Tutor UI architecture checks passed.');
