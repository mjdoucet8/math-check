export type Cell = { x: number; y: number };
export const TILE_W = 58, TILE_H = 30;
export const cottages = [{x:3,y:3,w:3,h:2},{x:9,y:2,w:3,h:2},{x:12,y:6,w:2,h:2}];
export const obstacles = [{x:5,y:8},{x:6,y:8},{x:10,y:9},{x:2,y:6}];
export const residents = [{id:'mara', x:8,y:6,name:'Mara',line:'Welcome, little explorer. Every journey begins with a small step. Take your time — the harbour is yours to discover.'},{id:'beacon',x:11,y:7,name:'The brass beacon',line:'A warm light for every new arrival. Beyond the harbour, a hidden garden is waiting. For now, enjoy finding your way.'}];
export function land(x:number,y:number){return x>=1 && y>=1 && x<=15 && y<=12 && !(x<3&&y>8) && !(x>12&&y>10) && !(x>13&&y<4) && !(x<2&&y<3);}
export function walkable(x:number,y:number){return land(x,y)&&!cottages.some(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h)&&!obstacles.some(b=>b.x===x&&b.y===y)&&!residents.some(b=>b.x===x&&b.y===y);}
export function project(x:number,y:number){return {x:(x-y)*TILE_W/2,y:(x+y)*TILE_H/2};}
export function unproject(x:number,y:number){return {x:Math.round(x/TILE_W+y/TILE_H),y:Math.round(y/TILE_H-x/TILE_W)};}
export function route(start:Cell,end:Cell):Cell[]|null{
 if(!walkable(end.x,end.y))return null;
 const key=(p:Cell)=>`${p.x},${p.y}`, queue=[start], seen=new Set([key(start)]), prev=new Map<string,Cell>();
 for(let i=0;i<queue.length;i++) {const c=queue[i];if(c.x===end.x&&c.y===end.y){const path:Cell[]=[];let p=c;while(key(p)!==key(start)){path.unshift(p);p=prev.get(key(p))!;}return path;}
 for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const p={x:c.x+dx,y:c.y+dy};if(walkable(p.x,p.y)&&!seen.has(key(p))){seen.add(key(p));prev.set(key(p),c);queue.push(p);}}}return null;
}
