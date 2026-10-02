import {test,expect,type Page,type Locator} from '@playwright/test';
async function press(locator:Locator,touch:boolean){if(touch)await locator.tap();else await locator.click();}
async function select(page:Page,touch:boolean,id:string){
 await page.waitForTimeout(500);const host=page.locator('#game');const objects=JSON.parse((await host.getAttribute('data-objects'))!);
 const o=objects.find((v:{id:string})=>v.id===id);const view=JSON.parse((await host.getAttribute('data-view'))!);
 const height=id==='beacon'?75:id==='arch'?105:40;
 const p={x:((o.x-o.y)*40-view.left)*view.zoom,y:((o.x+o.y)*20-height-view.top)*view.zoom};
 if(touch)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);
}
async function enterGarden(page:Page,touch:boolean,checkGate=false){
 await page.goto('/');await expect(page.locator('#game')).toHaveAttribute('data-ready','true');
 if(checkGate){await select(page,touch,'coast');await expect(page.locator('#speech')).toContainText('Bring the harbour light',{timeout:20000});
 await expect(page.locator('#game')).toHaveAttribute('data-area','harbour');await press(page.getByRole('button',{name:'Close conversation'}),touch);}
 await select(page,touch,'keeper');await expect(page.locator('#speaker')).toHaveText('Harbour keeper',{timeout:20000});await press(page.getByRole('button',{name:'Close conversation'}),touch);
 await select(page,touch,'beacon');await expect(page.locator('#challenge-panel')).toBeVisible({timeout:20000});
 for(let i=0;i<5;i++)await press(page.getByRole('button',{name:'Move stone into tray',exact:true}).first(),touch);
 await press(page.getByRole('button',{name:'Confirm',exact:true}),touch);await press(page.getByRole('button',{name:'Continue exploring'}),touch);
 await select(page,touch,'coast');await expect(page.locator('#game')).toHaveAttribute('data-area','coastal-path',{timeout:20000});
 await select(page,touch,'arch');await expect(page.locator('#game')).toHaveAttribute('data-area','garden',{timeout:20000});
 await select(page,touch,'gardener');await expect(page.locator('#speaker')).toHaveText('Garden keeper',{timeout:20000});await expect(page.locator('#speech')).toContainText('old pump');await press(page.getByRole('button',{name:'Close conversation'}),touch);
}
const current=(page:Page)=>page.locator('#vessel-panel');
async function pump(page:Page,touch:boolean,n:number){for(let i=0;i<n;i++)await press(page.getByRole('button',{name:'Pump',exact:true}),touch);}
async function complete(page:Page,touch:boolean){await press(page.getByRole('button',{name:'Confirm',exact:true}),touch);await press(page.getByRole('button',{name:/Find the next vessel|Finish restoration/}),touch);}

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
});

 test('five sequential vessels restore the garden and reset restores the sleeping harbour',async({page},info)=>{
 const touch=info.project.name==='touch';await enterGarden(page,touch);await select(page,touch,'pump');await expect(current(page)).toBeVisible({timeout:20000});
 if(touch)await page.setViewportSize({width:390,height:844});
 for(const target of [3,5,4,6,5]){await expect(page.locator('.glass-vessel')).toHaveCount(1);await pump(page,touch,target);await page.screenshot({path:info.outputPath(`vessel-${target}.png`)});await complete(page,touch);}
 await expect(page.getByRole('heading',{name:'The garden has water again.'})).toBeVisible();
 const evidence=JSON.parse((await current(page).getAttribute('data-evidence'))!);expect(evidence.completed).toHaveLength(5);expect(evidence.completed.every((p:{outcome:{kind:string}})=>p.outcome.kind==='independent-first-response')).toBe(true);
 await press(page.getByRole('button',{name:'Explore the garden'}),touch);await expect(page.locator('#goal-text')).toHaveText('The garden water is restored');
 await page.screenshot({path:info.outputPath('restored-garden.png')});
 await press(page.getByRole('button',{name:'Start again'}),touch);await expect(page.locator('#game')).toHaveAttribute('data-area','harbour');await expect(page.locator('#game')).toHaveAttribute('data-beacon-awake','false');
});
