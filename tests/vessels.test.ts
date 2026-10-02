import {test} from 'node:test';import assert from 'node:assert/strict';
import {Vessels,VESSEL_TARGETS} from '../src/domain/vessels.ts';
import {Journey} from '../src/domain/journey.ts';
import {areaWalkable,AREA_START,AREA_OBJECTS} from '../src/world/areas.ts';
import {route,approach} from '../src/world/harbour.ts';
test('harbour gate requires restoration and only adjacent chapter transitions are allowed',()=>{
 const j=new Journey();assert.equal(j.travel('garden'),false);assert.equal(j.travel('coastal-path'),false);
 j.beaconAwake=true;assert.equal(j.travel('coastal-path'),true);j.gardenCompleted=2;assert.equal(j.travel('garden'),true);
 assert.equal(j.travel('harbour'),false);assert.equal(j.travel('coastal-path'),true);assert.equal(j.travel('harbour'),true);assert.equal(j.gardenCompleted,2);
});
test('every chapter has connected walkable tiles and reachable interaction neighbours',()=>{
 for(const area of ['harbour','coastal-path','garden'] as const){const accessible=(cell:{x:number;y:number})=>areaWalkable(area,cell);
 for(let x=1;x<=18;x++)for(let y=1;y<=14;y++)if(accessible({x,y}))assert.ok(route(AREA_START[area],{x,y},accessible));
 for(const object of AREA_OBJECTS[area])assert.ok(approach(AREA_START[area],object,accessible));}
});
test('five sequential questions use one fixed portion; Empty and Pump never submit',()=>{
 const c=new Vessels();for(const target of VESSEL_TARGETS){c.pump();c.pump();c.empty();assert.equal(c.quantity,0);assert.equal(c.progress.attempts.length,0);
 for(let i=0;i<target;i++)c.pump();assert.equal(c.quantity,target);assert.equal(c.confirm(),'correct');assert.equal(c.confirm(),'unchanged');c.pump();assert.equal(c.quantity,target);c.next();}
 assert.equal(c.phase,'complete');assert.equal(c.completed.length,5);assert.ok(c.completed.every(p=>p.outcome?.kind==='independent-first-response'));c.next();assert.equal(c.index,5);
});
test('incorrect water remains; practice is separate; support survives later vessels',()=>{
 const c=new Vessels();c.pump();c.confirm();assert.equal(c.quantity,1);assert.equal(c.confirm(),'unchanged');c.pump();c.confirm();c.demonstrate();
 for(let i=0;i<3;i++)c.practicePump();assert.equal(c.quantity,2);c.returnToTask();assert.equal(c.confirm(),'unchanged');
 c.pump();c.confirm();assert.equal(c.progress.outcome?.kind,'assisted');c.next();assert.equal(c.progress.support,'assisted');
});
test('post-demo failure offers guidance, which requires actual pumping and preserves guided evidence',()=>{
 const c=new Vessels();c.pump();c.confirm();c.pump();c.confirm();c.demonstrate();for(let i=0;i<3;i++)c.practicePump();c.returnToTask();
 c.empty();c.pump();c.confirm();assert.equal(c.guidedAvailable,true);c.guide();assert.equal(c.quantity,0);assert.equal(c.confirm(),'unchanged');
 for(let i=0;i<8;i++)c.pump();assert.equal(c.quantity,3);c.confirm();assert.equal(c.progress.outcome?.kind,'guided');c.next();assert.equal(c.progress.support,'guided');
});
