import {test,expect} from '@playwright/test';
import {press,select,enterGarden,current,pump,complete,walk} from './gameHelpers.ts';

test('journey gate and revisits preserve unfinished water and the restored beacon',async({page},info)=>{
 const touch=info.project.name==='touch';const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await enterGarden(page,touch,true);
 await page.screenshot({path:info.outputPath('garden.png')});
 await select(page,touch,'pump');await expect(current(page)).toBeVisible({timeout:20000});
 await pump(page,touch,2);await press(page.getByRole('button',{name:'Empty',exact:true}),touch);await expect(page.locator('.water-portion')).toHaveCount(0);
 await pump(page,touch,1);await press(page.getByRole('button',{name:'Confirm',exact:true}),touch);await expect(page.locator('.water-portion')).toHaveCount(1);
 await press(page.getByRole('button',{name:'Back to garden'}),touch);
 await select(page,touch,'coast');await expect(page.locator('#game')).toHaveAttribute('data-area','coastal-path',{timeout:20000});
 await select(page,touch,'harbour');await expect(page.locator('#game')).toHaveAttribute('data-area','harbour',{timeout:20000});
 await expect(page.locator('#game')).toHaveAttribute('data-beacon-awake','true');
 await select(page,touch,'coast');await expect(page.locator('#game')).toHaveAttribute('data-area','coastal-path',{timeout:20000});
 await select(page,touch,'arch');await expect(page.locator('#game')).toHaveAttribute('data-area','garden',{timeout:20000});
 await select(page,touch,'pump');await expect(current(page)).toBeVisible({timeout:20000});await expect(page.locator('.water-portion')).toHaveCount(1);
 await press(page.getByRole('button',{name:'Empty',exact:true}),touch);
 await pump(page,touch,3);await complete(page,touch);
 const evidence=JSON.parse((await current(page).getAttribute('data-evidence'))!);expect(evidence.completed[0].outcome.kind).toBe('independent-retry');
 expect(errors).toEqual([]);
});

test('pump demonstration preserves the answer and guided help restores the same garden water',async({page},info)=>{
 const touch=info.project.name==='touch';await enterGarden(page,touch);await select(page,touch,'pump');await expect(current(page)).toBeVisible({timeout:20000});
 for(let i=0;i<2;i++){await pump(page,touch,1);await press(page.getByRole('button',{name:'Confirm',exact:true}),touch);}
 await press(page.getByRole('button',{name:'Show me with a practice pump'}),touch);
 for(const word of ['One','Two','Three']){await press(page.getByRole('button',{name:'Pump the practice vessel'}),touch);await expect(page.locator('.count-word')).toHaveText(word);}
 await press(page.getByRole('button',{name:'Try your vessel'}),touch);await expect(page.locator('.water-portion')).toHaveCount(2);
 await press(page.getByRole('button',{name:'Empty',exact:true}),touch);await pump(page,touch,1);await press(page.getByRole('button',{name:'Confirm',exact:true}),touch);
 await press(page.getByRole('button',{name:'Count together'}),touch);await expect(page.getByRole('button',{name:'Confirm',exact:true})).toBeDisabled();await pump(page,touch,3);await complete(page,touch);
 const evidence=JSON.parse((await current(page).getAttribute('data-evidence'))!);expect(evidence.completed[0].outcome.kind).toBe('guided');expect(evidence.current.support).toBe('guided');
 for(const target of [5,4,6,5]){await pump(page,touch,target);await complete(page,touch);}
 await press(page.getByRole('button',{name:'Explore the garden'}),touch);
 await select(page,touch,'satchel');await expect(page.locator('#reward-panel')).toBeVisible({timeout:20000});
 await press(page.getByRole('button',{name:'Equip satchel'}),touch);await expect(page.locator('#game')).toHaveAttribute('data-satchel','moss');
});

 test('five sequential vessels restore the garden and reset restores the sleeping harbour',async({page},info)=>{
 test.setTimeout(240000);
 const touch=info.project.name==='touch';await enterGarden(page,touch);await select(page,touch,'pump');await expect(current(page)).toBeVisible({timeout:20000});
 if(touch)await page.setViewportSize({width:390,height:844});
 for(const target of [3,5,4,6,5]){await expect(page.locator('.glass-vessel')).toHaveCount(1);await pump(page,touch,target);await page.screenshot({path:info.outputPath(`vessel-${target}.png`)});await complete(page,touch);}
 await expect(page.getByRole('heading',{name:'The garden has water again.'})).toBeVisible();
 const evidence=JSON.parse((await current(page).getAttribute('data-evidence'))!);expect(evidence.completed).toHaveLength(5);expect(evidence.completed.every((p:{outcome:{kind:string}})=>p.outcome.kind==='independent-first-response')).toBe(true);
 await press(page.getByRole('button',{name:'Explore the garden'}),touch);await expect(page.locator('#goal-text')).toHaveText('Find the explorer satchel');
 await page.screenshot({path:info.outputPath('restored-garden.png')});
 await select(page,touch,'satchel');await expect(page.locator('#reward-panel')).toBeVisible({timeout:20000});
 await expect(page.getByRole('radio')).toHaveCount(3);await expect(page.locator('#game')).toHaveAttribute('data-satchel','none');
 await page.getByRole('radio',{name:'Sunset ochre'}).check();await expect(page.locator('#game')).toHaveAttribute('data-satchel','none');
 if(touch)await press(page.getByRole('button',{name:'Back to garden'}),touch);else await page.keyboard.press('Escape');
 await expect(page.locator('#reward-panel')).toBeHidden();await expect(page.locator('#game')).toHaveAttribute('data-satchel','none');
 await select(page,touch,'satchel');await expect(page.locator('#reward-panel')).toBeVisible({timeout:20000});
 if(touch)await page.getByRole('radio',{name:'Ocean teal'}).check();else {await page.keyboard.press('ArrowRight');await expect(page.getByRole('radio',{name:'Ocean teal'})).toBeChecked();}
 await page.screenshot({path:info.outputPath('satchel-choices.png')});
 if(touch)await press(page.getByRole('button',{name:'Equip satchel'}),touch);else {await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Equip satchel'})).toBeFocused();await page.keyboard.press('Enter');}
 await expect(page.locator('#game')).toHaveAttribute('data-satchel','ocean');await expect(page.locator('#goal-text')).toHaveText('Explore the waking island');
 await page.screenshot({path:info.outputPath('equipped-satchel.png')});
 // The return sign is outside the narrow camera view from the reward corner.
 if(touch){await select(page,touch,'gardener');await expect(page.locator('#speaker')).toHaveText('Garden keeper',{timeout:20000});await press(page.getByRole('button',{name:'Close conversation'}),touch);}
 await select(page,touch,'coast');await expect(page.locator('#game')).toHaveAttribute('data-area','coastal-path',{timeout:20000});
 if(touch)await walk(page,touch,7,6);
 await select(page,touch,'harbour');await expect(page.locator('#game')).toHaveAttribute('data-area','harbour',{timeout:20000});await expect(page.locator('#game')).toHaveAttribute('data-satchel','ocean');
 await select(page,touch,'coast');await expect(page.locator('#game')).toHaveAttribute('data-area','coastal-path',{timeout:20000});
 if(touch)await walk(page,touch,7,6);
 await select(page,touch,'arch');await expect(page.locator('#game')).toHaveAttribute('data-area','garden',{timeout:20000});
 // On return, walk toward the pump before selecting the far reward corner.
 if(touch){await walk(page,touch,7,9);await select(page,touch,'pump');await expect(current(page)).toBeVisible({timeout:20000});await press(page.getByRole('button',{name:'Explore the garden'}),touch);}
 await select(page,touch,'satchel');await expect(page.locator('#reward-panel')).toBeVisible({timeout:20000});await expect(page.getByRole('radio',{name:'Ocean teal'})).toBeChecked();
 for(const [name,id] of [['Moss green','moss'],['Sunset ochre','sunset']] as const){
 await page.getByRole('radio',{name}).check();await press(page.getByRole('button',{name:'Wear this colour'}),touch);await expect(page.locator('#game')).toHaveAttribute('data-satchel',id);
 await select(page,touch,'satchel');await expect(page.locator('#reward-panel')).toBeVisible({timeout:20000});}
 await press(page.getByRole('button',{name:'Back to garden'}),touch);
 await press(page.getByRole('button',{name:'Start again'}),touch);await press(page.getByRole('button',{name:'Start a new journey',exact:true}),touch);await expect(page.locator('#game')).toHaveAttribute('data-area','harbour');await expect(page.locator('#game')).toHaveAttribute('data-beacon-awake','false');await expect(page.locator('#game')).toHaveAttribute('data-satchel','none');await expect(page.locator('#game')).toHaveAttribute('data-reward-unlocked','false');
});
