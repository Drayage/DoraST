// ═══════════════ MAP ═══════════════
// 7×7 = 49 타일, 시작위치 24 (행3 열3, 중앙)

// 랜덤 생성에 쓸 기본 5종 타일만 추출
const BASE_TILE_IDS=['beach','forest','cave','ruins','shore'];

function _placeTile(idx, id){
  const def=TILE_TYPES.find(t=>t.id===id);
  if(def) G.tiles[idx]={...def,revealed:false,hasPlayer:false,hasCamp:false,explored:false};
}

function buildMap(){
  const baseTiles=TILE_TYPES.filter(t=>BASE_TILE_IDS.includes(t.id));
  G.tiles=[];
  for(let i=0;i<49;i++){
    const t=baseTiles[Math.floor(Math.random()*baseTiles.length)];
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
        _placeTile(idx, tid);
      }
    }
  });

  // 특수 타일 배치 — 이미 특수 타일이 없는 칸에만 덮어씀
  const specialIds=['lookout','oblivion_lake','oblivion_swamp'];
  const isSpecial=i=>specialIds.includes(G.tiles[i].id);

  // 전망대(lookout) 1개: 시작 거리 5 이상
  const lookoutPool=shuffle(Array.from({length:49},(_,i)=>i)
    .filter(i=>tileDist(i,G.pos)>=5 && !isSpecial(i)));
  if(lookoutPool.length) _placeTile(lookoutPool[0], 'lookout');

  // 망각의 호수(oblivion_lake) 1개: 시작 거리 3 이상, lookout과 거리 2 이상
  const lookoutIdx=G.tiles.findIndex(t=>t.id==='lookout');
  const lakePool=shuffle(Array.from({length:49},(_,i)=>i)
    .filter(i=>tileDist(i,G.pos)>=3 && !isSpecial(i)
            && (lookoutIdx<0||tileDist(i,lookoutIdx)>=2)));
  if(lakePool.length) _placeTile(lakePool[0], 'oblivion_lake');

  // 망각의 늪(oblivion_swamp) 2개: 시작 거리 3 이상, 특수 타일과 거리 2 이상, 서로 거리 3 이상
  const swampBase=shuffle(Array.from({length:49},(_,i)=>i)
    .filter(i=>tileDist(i,G.pos)>=3 && !isSpecial(i)));
  let placed=0;
  let firstSwampIdx=-1;
  for(const i of swampBase){
    if(placed===0){
      _placeTile(i,'oblivion_swamp'); firstSwampIdx=i; placed++;
    } else if(placed===1){
      if(tileDist(i,firstSwampIdx)>=3){ _placeTile(i,'oblivion_swamp'); placed++; break; }
    }
  }

  // 고대 사원(temple) 1개: 시작 거리 5 이상, lookout과 거리 3 이상
  const allSpecialIds=[...specialIds,'temple','thicket'];
  const isAnySpecial=i=>allSpecialIds.includes(G.tiles[i].id);
  const templePool=shuffle(Array.from({length:49},(_,i)=>i)
    .filter(i=>tileDist(i,G.pos)>=5 && !isAnySpecial(i)
            && (lookoutIdx<0||tileDist(i,lookoutIdx)>=3)));
  if(templePool.length) _placeTile(templePool[0],'temple');

  // 수풀(thicket) 0~2개: 시작 거리 2 이상, 서로 거리 3 이상
  const thicketCount=Math.floor(Math.random()*3);
  const thicketBase=shuffle(Array.from({length:49},(_,i)=>i)
    .filter(i=>tileDist(i,G.pos)>=2 && !isAnySpecial(i)));
  let thicketPlaced=0, firstThicketIdx=-1;
  for(const i of thicketBase){
    if(thicketPlaced>=thicketCount) break;
    if(thicketPlaced===0){
      _placeTile(i,'thicket'); firstThicketIdx=i; thicketPlaced++;
    } else {
      if(tileDist(i,firstThicketIdx)>=3){ _placeTile(i,'thicket'); thicketPlaced++; }
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
  if(t.id==='thicket'&&!t.explored){
    t.explored=true;
    const _ambPool=['cbt_boar','cbt_boar','cbt_snake','cbt_snake','cbt_bat','cbt_ghost'];
    setTimeout(()=>showThicketAmbush(_ambPool[Math.floor(Math.random()*_ambPool.length)]),300);
  }
  getAdj(i).forEach(j=>{
    const wasRevealed=G.tiles[j].revealed;
    G.tiles[j].revealed=true;
    if(!wasRevealed && G.tiles[j].id==='thicket' && !G.tiles[j].explored){
      G.tiles[j].explored=true;
      const _ambPool=['cbt_boar','cbt_boar','cbt_snake','cbt_snake','cbt_bat','cbt_ghost'];
      const ambEvt=_ambPool[Math.floor(Math.random()*_ambPool.length)];
      setTimeout(()=>showThicketAmbush(ambEvt),300);
    }
  });
  log(`📍 ${t.name}으로 이동 (${baseCost}칸·AP-${cost})`, '');
  checkSurvival(); render();
}
