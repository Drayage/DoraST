// ═══════════════ MAP ═══════════════
// 7×7 = 49 타일, 시작위치 24 (행3 열3, 중앙)

function _placeTile(idx, id){
  const def=TILE_TYPES.find(t=>t.id===id);
  if(def) G.tiles[idx]={...def,revealed:false,hasPlayer:false,hasCamp:false,explored:false};
}

function buildMap(){
  const cfg=(ISLANDS[G.islandId]||ISLANDS.mangrove).mapConfig;
  const baseTileIds=cfg.baseTiles;
  const baseTiles=baseTileIds.map(id=>TILE_TYPES.find(t=>t.id===id)).filter(Boolean);
  G.tiles=[];
  for(let i=0;i<49;i++){
    const t=baseTiles[Math.floor(Math.random()*baseTiles.length)];
    G.tiles.push({...t, revealed:false, hasPlayer:false, hasCamp:false, explored:false});
  }

  // 시작 위치(24) 반경 2 이내에 다양한 타일 보장 (기본 타일 풀에서)
  const uniqueBaseTiles=[...new Set(baseTileIds)];
  const guaranteedNear=uniqueBaseTiles.slice(0,3);
  const near=[];
  for(let i=0;i<49;i++){
    if(i!==G.pos && tileDist(i,G.pos)<=2) near.push(i);
  }
  guaranteedNear.forEach(tid=>{
    if(!near.some(i=>G.tiles[i].id===tid)){
      const candidates=near.filter(i=>!guaranteedNear.includes(G.tiles[i].id));
      if(candidates.length){
        const idx=candidates[Math.floor(Math.random()*candidates.length)];
        _placeTile(idx, tid);
      }
    }
  });

  // 특수 타일 배치 — mapConfig.specialTiles 기반으로 일반화
  const placedSpecialIds=new Set();
  const isSpecialPlaced=i=>placedSpecialIds.has(i);

  for(const spec of cfg.specialTiles){
    const count=Array.isArray(spec.count)
      ? spec.count[0]+Math.floor(Math.random()*(spec.count[1]-spec.count[0]+1))
      : spec.count;
    const minDist=spec.minDist||3;

    const pool=shuffle(Array.from({length:49},(_,i)=>i)
      .filter(i=>tileDist(i,G.pos)>=minDist && !isSpecialPlaced(i)));

    let n=0, prevIdx=-1;
    for(const i of pool){
      if(n>=count) break;
      if(n>0 && prevIdx>=0 && tileDist(i,prevIdx)<3) continue;
      // 같은 group의 이미 배치된 타일과 거리 3 이상 보장
      const groupConflict=spec.group && [...placedSpecialIds].some(pi=>{
        const pt=G.tiles[pi];
        const pspec=cfg.specialTiles.find(s=>s.id===pt?.id);
        return pspec?.group===spec.group && tileDist(i,pi)<3;
      });
      if(groupConflict) continue;
      _placeTile(i, spec.id);
      placedSpecialIds.add(i);
      prevIdx=i; n++;
    }
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
  const baseCost=tileDist(G.pos, i);
  const cost=baseCost;
  if(G.ap<cost){log(`AP부족 (이동${baseCost}칸=AP${cost})`, ''); render(); return;}
  G.tiles[G.pos].hasPlayer=false;
  const wasExplored=t.explored;
  G.pos=i; t.hasPlayer=true; G.ap-=cost; G.tilesMoved+=baseCost;
  // 스킬 패시브: 이동 AP 환급 (합산 확률, 1회만)
  const _mvGCnt=allCards().filter(c=>c.id==='sk_mv_g').length;
  const _mvBCnt=allCards().filter(c=>c.id==='sk_mv_b').length;
  const _mvS3Cnt=allCards().filter(c=>c.id==='sk_mv_s3').length;
  let refundChance=0;
  if(_mvBCnt) refundChance+=0.1*_mvBCnt;
  if(_mvGCnt) refundChance+=0.5*_mvGCnt;
  if(wasExplored&&_mvS3Cnt) refundChance=1;
  refundChance=Math.min(1,refundChance);
  if(refundChance>0&&Math.random()<refundChance){
    G.ap=Math.min(G.maxAP+4,G.ap+cost);
    const tag=wasExplored&&_mvS3Cnt?'🧭 탐색자의 눈':_mvGCnt?'🦅 자유로운 영혼':'🥾 가벼운 발';
    log(`${tag}: 이동 AP${cost} 환급! (${Math.round(refundChance*100)}%)`,'success');
  }
  // 스킬 패시브: 이동 후 HP/SAN 회복
  const _mvS1Cnt=allCards().filter(c=>c.id==='sk_mv_s1').length;
  const _mvS2Cnt=allCards().filter(c=>c.id==='sk_mv_s2').length;
  if(_mvS1Cnt) G.hp=Math.min(100,G.hp+_mvS1Cnt);
  if(_mvS2Cnt) G.san=Math.min(100,G.san+_mvS2Cnt);
  // 균류 군락: 첫 진입 시 HP-3
  if(t.id==='fungal_spot'&&!wasExplored){
    G.hp=Math.max(0,G.hp-3);
    flashDamage();
    log('🌫️ 균류 군락: 균사가 살갗을 파고든다. HP-3','danger');
  }
  // 분화구: 진입 시 DOOM+5
  if(t.id==='caldera_tile'&&G.islandId==='caldera'){
    G.doom=Math.min(99,G.doom+5);
    log('🌋 분화구: 열기가 온몸을 태운다. DOOM+5','danger');
  }
  const _getAmbPool=()=>{
    if(G.islandId==='caldera') return ['cbt_lava_crab','cbt_lava_crab','cbt_flame_lizard'];
    if(G.islandId==='mycelium') return ['cbt_swamp_frog','cbt_swamp_frog','cbt_swamp_frog'];
    return ['cbt_boar','cbt_boar','cbt_snake','cbt_snake','cbt_bat','cbt_ghost'];
  };
  if(t.id==='thicket'&&!t.explored){
    t.explored=true;
    const _ambPool=_getAmbPool();
    setTimeout(()=>showThicketAmbush(_ambPool[Math.floor(Math.random()*_ambPool.length)]),300);
  }
  getAdj(i).forEach(j=>{
    const wasRevealed=G.tiles[j].revealed;
    G.tiles[j].revealed=true;
    if(!wasRevealed && G.tiles[j].id==='thicket' && !G.tiles[j].explored){
      G.tiles[j].explored=true;
      const _ambPool=_getAmbPool();
      const ambEvt=_ambPool[Math.floor(Math.random()*_ambPool.length)];
      setTimeout(()=>showThicketAmbush(ambEvt),300);
    }
  });
  log(`📍 ${t.name}으로 이동 (${baseCost}칸·AP-${cost})`, '');
  checkSurvival(); render();
}
