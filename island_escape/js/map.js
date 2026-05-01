// ═══════════════ MAP ═══════════════
// 7×7 = 49 타일, 시작위치 24 (행3 열3, 중앙)

function buildMap(){
  G.tiles=[];
  for(let i=0;i<49;i++){
    const t=TILE_TYPES[Math.floor(Math.random()*TILE_TYPES.length)];
    G.tiles.push({...t, revealed:false, hasPlayer:false, hasCamp:false, explored:false});
  }
  // 시작 위치(24) 반경 2 이내에 forest/beach/cave 보장
  const near=[];
  for(let i=0;i<49;i++){
    if(i!==G.pos && tileDist(i,G.pos)<=2) near.push(i);
  }
  ['forest','beach','cave'].forEach(tid=>{
    if(!near.some(i=>G.tiles[i].id===tid)){
      const candidates=near.filter(i=>!['forest','beach','cave'].includes(G.tiles[i].id));
      if(candidates.length){
        const idx=candidates[Math.floor(Math.random()*candidates.length)];
        const tDef=TILE_TYPES.find(t=>t.id===tid);
        if(tDef) G.tiles[idx]={...tDef,revealed:false,hasPlayer:false,hasCamp:false,explored:false};
      }
    }
  });
  // lookout 1개, oblivion_lake 1개 보장 (시작 위치에서 거리 4 이상)
  ['lookout','oblivion_lake'].forEach(tid=>{
    if(!G.tiles.some(t=>t.id===tid)){
      const cands=[];
      for(let i=0;i<49;i++){
        if(tileDist(i,G.pos)>=4 && !['lookout','oblivion_lake'].includes(G.tiles[i].id)) cands.push(i);
      }
      if(cands.length){
        const idx=cands[Math.floor(Math.random()*cands.length)];
        const tDef=TILE_TYPES.find(t=>t.id===tid);
        if(tDef) G.tiles[idx]={...tDef,revealed:false,hasPlayer:false,hasCamp:false,explored:false};
      }
    }
  });
  // oblivion_swamp 2개 배치 (시작 위치에서 거리 3 이상, lookout/oblivion_lake 자리 제외)
  const specialIds=['lookout','oblivion_lake','oblivion_swamp'];
  const swampCands=[];
  for(let i=0;i<49;i++){
    if(tileDist(i,G.pos)>=3 && !specialIds.includes(G.tiles[i].id)) swampCands.push(i);
  }
  shuffle(swampCands);
  const swampDef=TILE_TYPES.find(t=>t.id==='oblivion_swamp');
  for(let s=0;s<2&&s<swampCands.length;s++){
    if(swampDef) G.tiles[swampCands[s]]={...swampDef,revealed:false,hasPlayer:false,hasCamp:false,explored:false};
  }
  G.tiles[G.pos].revealed=true; G.tiles[G.pos].hasPlayer=true;
  getAdj(G.pos).forEach(i=>G.tiles[i].revealed=true);
}

function getAdj(p){
  const r=Math.floor(p/7), c=p%7, res=[];
  if(r>0) res.push(p-7); if(r<6) res.push(p+7);
  if(c>0) res.push(p-1); if(c<6) res.push(p+1);
  return res;
}

// 맨해튼 거리 (칸당 AP1)
function tileDist(a, b){
  return Math.abs(Math.floor(a/7)-Math.floor(b/7))+Math.abs((a%7)-(b%7));
}

function clickTile(i){
  if(G.over) return;
  const t=G.tiles[i];
  if(!t.revealed||i===G.pos) return;
  const cost=tileDist(G.pos, i);
  if(G.ap<cost){log(`AP부족 (이동${cost}칸=AP${cost})`, ''); render(); return;}
  G.tiles[G.pos].hasPlayer=false;
  G.pos=i; t.hasPlayer=true; G.ap-=cost; G.tilesMoved+=cost;
  getAdj(i).forEach(j=>G.tiles[j].revealed=true);
  log(`📍 ${t.name}으로 이동 (${cost}칸·AP-${cost})`, '');
  checkSurvival(); render();
}
