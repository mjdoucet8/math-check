import { test, expect } from '@playwright/test';
import { freshSession, encodeSession, SAVE_KEY } from '../../src/domain/browserSave.ts';
import { press, select, pump, complete, current } from './gameHelpers.ts';
function supportedGarden() {
 const s=freshSession();for(let i=0;i<5;i++)s.stones.toggle(i);s.stones.confirm();s.journey.beaconAwake=true;s.journey.travel('coastal-path');s.journey.travel('garden');s.journey.positions.set('garden',{x:8,y:7});s.journey.visited.set('garden',new Set(['gardener']));
 const c=s.vessels;c.pump();c.confirm();c.pump();c.confirm();c.demonstrate();for(let i=0;i<3;i++)c.practicePump();c.returnToTask();c.empty();c.pump();c.confirm();c.guide();for(let i=0;i<3;i++)c.pump();c.confirm();s.journey.gardenCompleted=1;c.next();
 c.pump();c.confirm();c.pump();c.confirm();c.demonstrate();c.practicePump();return encodeSession(s);
}
test('real harbour edits and submitted retries survive reload without extra attempts',async({page},info)=>{
 const touch=info.project.name==='touch';await page.goto('./');await expect(page.locator('#game')).toHaveAttribute('data-ready','true');
 await select(page,touch,'keeper');await expect(page.locator('#speaker')).toHaveText('Harbour keeper',{timeout:20000});await press(page.getByRole('button',{name:'Close conversation'}),touch);
 await select(page,touch,'beacon');await expect(page.locator('#challenge-panel')).toBeVisible({timeout:20000});
 for(let i=0;i<3;i++)await press(page.getByRole('button',{name:'Move stone into tray',exact:true}).first(),touch);
 await press(page.getByRole('button',{name:'Confirm',exact:true}),touch);await page.reload();await expect(page.locator('#game')).toHaveAttribute('data-ready','true');await expect(page.locator('#game')).toHaveAttribute('data-beacon-awake','false');
 await select(page,touch,'beacon');await expect(page.locator('#challenge-panel')).toBeVisible({timeout:20000});await expect(page.getByRole('button',{name:'Return stone to shore'})).toHaveCount(3);
 await press(page.getByRole('button',{name:'Confirm',exact:true}),touch);let evidence=JSON.parse((await page.locator('#challenge-panel').getAttribute('data-evidence'))!);expect(evidence.attempts).toHaveLength(1);expect(evidence.outcome).toBeNull();
 for(let i=0;i<2;i++)await press(page.getByRole('button',{name:'Move stone into tray',exact:true}).first(),touch);await press(page.getByRole('button',{name:'Confirm',exact:true}),touch);
 await page.reload();await expect(page.locator('#game')).toHaveAttribute('data-beacon-awake','true');
 const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),SAVE_KEY);expect(saved.stones.progress.outcome.kind).toBe('independent-retry');expect(saved.stones.progress.attempts).toHaveLength(2);
});
test('garden practice, success boundary, satchel and deliberate reset persist in browser',async({page},info)=>{
 test.setTimeout(240000);const touch=info.project.name==='touch';const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('./');await expect(page.locator('#game')).toHaveAttribute('data-ready','true');await page.evaluate(({key,text})=>localStorage.setItem(key,text),{key:SAVE_KEY,text:supportedGarden()});await page.reload();
 await expect(page.locator('#game')).toHaveAttribute('data-area','garden');await select(page,touch,'pump');await expect(current(page)).toHaveAttribute('data-phase','demo',{timeout:20000});await expect(page.locator('.water-portion')).toHaveCount(1);
 for(const word of ['Two','Three']){await press(page.getByRole('button',{name:'Pump the practice vessel'}),touch);await expect(page.locator('.count-word')).toHaveText(word);}
 await press(page.getByRole('button',{name:'Try your vessel'}),touch);await expect(page.locator('.water-portion')).toHaveCount(2);await pump(page,touch,3);await press(page.getByRole('button',{name:'Confirm',exact:true}),touch);
 await page.reload();await expect(page.locator('#game')).toHaveAttribute('data-area','garden');await select(page,touch,'pump');await expect(current(page)).toHaveAttribute('data-phase','success',{timeout:20000});
 let evidence=JSON.parse((await current(page).getAttribute('data-evidence'))!);expect(evidence.completed).toHaveLength(2);expect(evidence.completed.every((p:{outcome:{kind:string}})=>p.outcome.kind==='guided')).toBe(true);
 await press(page.getByRole('button',{name:'Find the next vessel'}),touch);for(const target of [4,6,5]){await pump(page,touch,target);await complete(page,touch);}
 await press(page.getByRole('button',{name:'Explore the garden'}),touch);await select(page,touch,'satchel');await expect(page.locator('#reward-panel')).toBeVisible({timeout:20000});await page.getByRole('radio',{name:'Sunset ochre'}).check();await press(page.getByRole('button',{name:'Equip satchel'}),touch);
 await page.reload();await expect(page.locator('#game')).toHaveAttribute('data-area','garden');await expect(page.locator('#game')).toHaveAttribute('data-satchel','sunset');await expect(page.locator('#goal-text')).toHaveText('Explore the waking island');await expect(page.locator('#save-status')).toContainText('Progress saved');
 await page.screenshot({path:info.outputPath('resumed-journey.png')});
 const before=await page.evaluate(key=>localStorage.getItem(key),SAVE_KEY);await press(page.getByRole('button',{name:'Start again'}),touch);await expect(page.getByRole('dialog',{name:'Start a new journey?'})).toBeVisible();await page.screenshot({path:info.outputPath('reset-confirmation.png')});
 await press(page.getByRole('button',{name:'Keep exploring'}),touch);expect(await page.evaluate(key=>localStorage.getItem(key),SAVE_KEY)).toBe(before);await expect(page.locator('#game')).toHaveAttribute('data-satchel','sunset');
 await press(page.getByRole('button',{name:'Start again'}),touch);if(!touch){await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Start a new journey',exact:true})).toBeFocused();}
 await press(page.getByRole('button',{name:'Start a new journey',exact:true}),touch);await page.reload();await expect(page.locator('#game')).toHaveAttribute('data-area','harbour');await expect(page.locator('#game')).toHaveAttribute('data-satchel','none');await expect(page.locator('#game')).toHaveAttribute('data-beacon-awake','false');
 expect(errors).toEqual([]);
});
test('damaged and unsupported saves recover without invented unlocks',async({page})=>{
 await page.goto('./');await expect(page.locator('#game')).toHaveAttribute('data-ready','true');
 for(const text of ['{',JSON.stringify({version:99})]){await page.evaluate(({key,text})=>localStorage.setItem(key,text),{key:SAVE_KEY,text});await page.reload();await expect(page.locator('#game')).toHaveAttribute('data-ready','true');await expect(page.locator('#game')).toHaveAttribute('data-beacon-awake','false');await expect(page.locator('#game')).toHaveAttribute('data-satchel','none');await expect(page.locator('#save-status')).toContainText('earlier save could not be read');}
});
test('quota failures leave navigation and deliberate reset playable',async({page},info)=>{
 await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get:()=>({getItem:()=>null,setItem:()=>{throw new DOMException('Full','QuotaExceededError');},removeItem:()=>{throw new DOMException('Full','QuotaExceededError');}})}));
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('./');await expect(page.locator('#game')).toHaveAttribute('data-ready','true');await expect(page.locator('#save-status')).toContainText('Saving is unavailable');
 await select(page,info.project.name==='touch','keeper');await expect(page.locator('#speaker')).toHaveText('Harbour keeper',{timeout:20000});await page.getByRole('button',{name:'Close conversation'}).click();
 await page.getByRole('button',{name:'Start again'}).click();await page.getByRole('button',{name:'Start a new journey',exact:true}).click();await expect(page.locator('#game')).toHaveAttribute('data-cell','7,11');await expect(page.locator('#save-status')).toContainText('could not be cleared');expect(errors).toEqual([]);
});
test('denied storage access still starts a playable journey',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get:()=>{throw new DOMException('Denied','SecurityError');}}));const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('./');await expect(page.locator('#game')).toHaveAttribute('data-ready','true');await expect(page.locator('#save-status')).toContainText('Saving is unavailable');expect(errors).toEqual([]);
});
