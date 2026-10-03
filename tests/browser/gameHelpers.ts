import {expect,type Page,type Locator} from '@playwright/test';
export async function press(locator:Locator,touch:boolean){if(touch)await locator.tap();else await locator.click();}
export async function select(page:Page,touch:boolean,id:string){
 await page.waitForTimeout(500);const host=page.locator('#game');const objects=JSON.parse((await host.getAttribute('data-objects'))!);
 const o=objects.find((v:{id:string})=>v.id===id);const view=JSON.parse((await host.getAttribute('data-view'))!);
 const height=id==='beacon'?75:id==='arch'?105:40;
 const p={x:((o.x-o.y)*40-view.left)*view.zoom,y:((o.x+o.y)*20-height-view.top)*view.zoom};
 if(touch)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);
}
export async function walk(page:Page,touch:boolean,x:number,y:number){
 // Allow the new area camera to render before reading its projection.
 await page.waitForTimeout(700);
 const view=JSON.parse((await page.locator('#game').getAttribute('data-view'))!);
 const point={x:((x-y)*40-view.left)*view.zoom,y:((x+y)*20-view.top)*view.zoom};
 const viewport=page.viewportSize()!;expect(point.x).toBeGreaterThan(0);expect(point.x).toBeLessThan(viewport.width);expect(point.y).toBeGreaterThan(200);expect(point.y).toBeLessThan(viewport.height-100);
 if(touch)await page.touchscreen.tap(point.x,point.y);else await page.mouse.click(point.x,point.y);
 await expect(page.locator('#game')).toHaveAttribute('data-cell',`${x},${y}`,{timeout:20000});await expect(page.locator('#game')).toHaveAttribute('data-moving','false');await page.waitForTimeout(700);
}
export async function enterGarden(page:Page,touch:boolean,checkGate=false){
 await page.goto('/');await expect(page.locator('#game')).toHaveAttribute('data-ready','true');
 if(checkGate){await select(page,touch,'coast');await expect(page.locator('#speech')).toContainText('Bring the harbour light',{timeout:20000});
 await expect(page.locator('#game')).toHaveAttribute('data-area','harbour');await press(page.getByRole('button',{name:'Close conversation'}),touch);}
 await select(page,touch,'keeper');await expect(page.locator('#speaker')).toHaveText('Harbour keeper',{timeout:20000});await press(page.getByRole('button',{name:'Close conversation'}),touch);
 await select(page,touch,'beacon');await expect(page.locator('#challenge-panel')).toBeVisible({timeout:20000});
 for(let i=0;i<5;i++)await press(page.getByRole('button',{name:'Move stone into tray',exact:true}).first(),touch);
 await press(page.getByRole('button',{name:'Confirm',exact:true}),touch);await press(page.getByRole('button',{name:'Continue exploring'}),touch);
 await select(page,touch,'coast');await expect(page.locator('#game')).toHaveAttribute('data-area','coastal-path',{timeout:20000});
 await select(page,touch,'arch');await expect(page.locator('#game')).toHaveAttribute('data-area','garden',{timeout:20000});
 await expect(page.locator('#game')).toHaveAttribute('data-reward-unlocked','false');await expect(page.locator('#reward-panel')).toBeHidden();
 await select(page,touch,'gardener');await expect(page.locator('#speaker')).toHaveText('Garden keeper',{timeout:20000});await expect(page.locator('#speech')).toContainText('old pump');await press(page.getByRole('button',{name:'Close conversation'}),touch);
}
export const current=(page:Page)=>page.locator('#vessel-panel');
export async function pump(page:Page,touch:boolean,n:number){for(let i=0;i<n;i++)await press(page.getByRole('button',{name:'Pump',exact:true}),touch);}
export async function complete(page:Page,touch:boolean){await press(page.getByRole('button',{name:'Confirm',exact:true}),touch);await press(page.getByRole('button',{name:/Find the next vessel|Finish restoration/}),touch);}

