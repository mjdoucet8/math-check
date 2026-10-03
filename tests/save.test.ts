import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BrowserSave, SAVE_KEY, encodeSession, decodeSession, freshSession } from '../src/domain/browserSave.ts';
import { VESSEL_TARGETS } from '../src/domain/vessels.ts';
const reload = (s: ReturnType<typeof freshSession>) => decodeSession(encodeSession(s));
function garden() {
 const s=freshSession(); for(let i=0;i<5;i++)s.stones.toggle(i);s.stones.confirm();s.journey.beaconAwake=true;
 s.journey.travel('coastal-path');s.journey.travel('garden');s.journey.positions.set('garden',{x:8,y:7});return s;
}
test('unfinished stones and duplicate-submit guards survive refresh without inventing success',()=>{
 let s=freshSession();for(let i=0;i<5;i++)s.stones.toggle(i);s=reload(s);assert.equal(s.stones.progress.outcome,null);assert.equal(s.journey.beaconAwake,false);
 s.stones.toggle(4);s.stones.confirm();s=reload(s);assert.equal(s.stones.confirm(),'unchanged');s.stones.toggle(4);s.stones.confirm();assert.equal(s.stones.progress.outcome?.kind,'independent-retry');
});
test('stone practice and partially placed guidance preserve original answer and evidence',()=>{
 let s=freshSession();s.stones.toggle(0);s.stones.confirm();s.stones.toggle(1);s.stones.confirm();s.stones.demonstrate();s.stones.nextPracticeStone();s=reload(s);
 assert.equal(s.stones.phase,'demo');assert.equal(s.stones.demoStep,1);assert.equal(s.stones.selected.size,2);
 s.stones.nextPracticeStone();s.stones.nextPracticeStone();s.stones.returnToTask();s.stones.toggle(0);s.stones.confirm();s.stones.guide();s.stones.placeGuidedStone();s=reload(s);
 assert.equal(s.stones.phase,'guided');assert.equal(s.stones.selected.size,1);assert.equal(s.stones.progress.support,'guided');
 for(let i=0;i<4;i++)s.stones.placeGuidedStone();s.stones.confirm();s.journey.beaconAwake=true;s=reload(s);assert.equal(s.stones.progress.outcome?.kind,'guided');
});
test('vessel practice, water, explicit next boundary and later support survive refresh',()=>{
 let s=garden();s.vessels.pump();s.vessels.confirm();s.vessels.pump();s.vessels.confirm();s.vessels.demonstrate();s.vessels.practicePump();s=reload(s);
 assert.equal(s.vessels.phase,'demo');assert.equal(s.vessels.quantity,2);assert.equal(s.vessels.practice,1);
 s.vessels.practicePump();s.vessels.practicePump();s.vessels.returnToTask();s.vessels.empty();s.vessels.pump();s.vessels.confirm();s.vessels.guide();s.vessels.pump();s=reload(s);
 assert.equal(s.vessels.quantity,1);assert.equal(s.vessels.phase,'guided');s.vessels.pump();s.vessels.pump();s.vessels.confirm();s.journey.gardenCompleted=1;s=reload(s);
 assert.equal(s.vessels.phase,'success');assert.equal(s.vessels.index,0);assert.equal(s.vessels.confirm(),'unchanged');s.vessels.next();s.vessels.pump();s=reload(s);
 assert.equal(s.vessels.quantity,1);assert.equal(s.vessels.progress.support,'guided');assert.equal(s.vessels.index,1);
});
test('completed journey retains all outcomes, area positions, residents and satchel',()=>{
 let s=garden();s.journey.visited.set('harbour',new Set(['keeper','beacon']));s.journey.visited.set('garden',new Set(['gardener']));
 for(const target of VESSEL_TARGETS){for(let i=0;i<target;i++)s.vessels.pump();s.vessels.confirm();s.journey.gardenCompleted=s.vessels.completed.length;s.vessels.next();}
 s.journey.equipSatchel('sunset');s.journey.travel('coastal-path');s=reload(s);
 assert.equal(s.journey.area,'coastal-path');assert.equal(s.journey.satchelColour,'sunset');assert.equal(s.vessels.phase,'complete');assert.equal(s.vessels.completed.length,5);assert.ok(s.journey.visited.get('garden')?.has('gardener'));
});
test('malformed, unsupported, inconsistent and fabricated evidence is rejected',()=>{
 const base=JSON.parse(encodeSession(garden()));
 for(const mutate of [
  (v:any)=>v.version=99,(v:any)=>v.journey.positions=[['garden',{x:9,y:4}]],(v:any)=>v.journey.satchelColour='moss',
  (v:any)=>v.stones.progress.outcome.kind='guided',(v:any)=>v.stones.progress.attempts[0].correct=false,
  (v:any)=>v.stones.progress.attempts[0].submissionId='harbour-2',
  (v:any)=>v.stones.submittedRevision=-1,
  (v:any)=>v.vessels.progress.outcome={submissionId:'unsubmitted',kind:'independent-first-response'},
  (v:any)=>v.vessels.quantity=9,(v:any)=>v.journey.gardenCompleted=5,
  (v:any)=>v.stones.selected=[0,0],(v:any)=>v.vessels.index=5,
 ]){const v=structuredClone(base);mutate(v);assert.throws(()=>decodeSession(JSON.stringify(v)));}
 for(const text of ['{','null','[]','x'.repeat(1000001)])assert.throws(()=>decodeSession(text));
});
test('storage failures fall back to a playable fresh session and never throw',()=>{
 const unavailable=new BrowserSave(null);assert.equal(unavailable.load().status,'unavailable');assert.equal(unavailable.save('x'),false);assert.equal(unavailable.clear(),false);
 const throwing=new BrowserSave({getItem(){throw Error('denied');},setItem(){throw Error('quota');},removeItem(){throw Error('denied');}});
 assert.equal(throwing.load().status,'unavailable');assert.equal(throwing.save('x'),false);assert.equal(throwing.clear(),false);
 const damaged=new BrowserSave({getItem(){return '{';},setItem(){},removeItem(){}});assert.equal(damaged.load().status,'damaged');assert.equal(damaged.load().session.journey.satchelColour,null);
});
test('reset replaces the saved journey without clearing unrelated browser data',()=>{
 const data=new Map<string,string>([['other-app','keep']]);const store=new BrowserSave({getItem:k=>data.get(k)??null,setItem:(k,v)=>{data.set(k,v);},removeItem:k=>{data.delete(k);}});
 assert.equal(store.load().status,'new');assert.equal(store.save(encodeSession(garden())),true);assert.equal(store.load().session.journey.area,'garden');store.clear();store.save(encodeSession(freshSession()));assert.equal(store.load().session.journey.beaconAwake,false);assert.equal(data.get('other-app'),'keep');assert.ok(data.has(SAVE_KEY));
});
