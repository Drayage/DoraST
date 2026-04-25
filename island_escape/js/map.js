// ═══════════════ MAP ═══════════════
// [버그수정] apCost() 실제 이동에 반영

function buildMap(){
  G.tiles=[];
  for(let i=0;i<50;i++){
    const t=TILE_TYPES[Math.floor(Math.random()*TILE_TYPES.length)];
    G.tiles.push({...t, revealed:false, hasPlayer:false, hasCamp:false, explored:false});
  }
  G.tiles[G.pos].revealed=true; G.tiles[G.pos].hasPlayer=true;
  getAdj(G.pos).forEach(i=>G.tiles[i].revealed=true);
}

function getAdj(p){
  const r=Math.floor(p/10), c=p%10, res=[];
  if(r>0) res.push(p-10); if(r<4) res.push(p+10);
  if(c>0) res.push(p-1);  if(c<9) res.push(p+1);
  return res;
}

// 캠프에서 멀수록 이동 AP 증가 (3칸마다 +1)
function apCost(to){
  if(!G.camps.length) return 1;
  let min=99;
  G.camps.forEach(cp=>{
    const dr=Math.abs(Math.floor(cp/10)-Math.floor(to/10));
    const dc=Math.abs((cp%10)-(to%10));
    min=Math.min(min, dr+dc);
  });
  return 1+Math.floor(min/3);
}

function clickTile(i){
  if(G.over) return;
  const t=G.tiles[i];
  if(!t.revealed||i===G.pos) return;
  const cost=apCost(i);
  if(G.ap<cost){log(`AP부족 (이동:AP${cost})`, 'danger'); render(); return;}
  G.tiles[G.pos].hasPlayer=false;
  G.pos=i; t.hasPlayer=true; G.ap-=cost;
  getAdj(i).forEach(j=>G.tiles[j].revealed=true);
  log(`📍 ${t.name}으로 이동 (AP-${cost})`, '');
  checkSurvival(); render();
}
