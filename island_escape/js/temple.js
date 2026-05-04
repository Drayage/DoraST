// ═══════════════ TEMPLE ═══════════════

function doTemple(){
  if(G.over) return;
  const ph=G.templePhase;
  if(ph>=3){ log('🏛️ 사원의 저주는 이미 해제됐다.',''); return; }
  const apArr=[2,2,3];
  const apCost=apArr[ph];
  if(G.ap<apCost){ log(`AP부족 (사원 ${ph+1}페이즈:AP${apCost})`,'danger'); render(); return; }
  G.ap-=apCost;

  if(ph===0){
    G.templeBoss=Math.random()<0.5?'boss_stone_idol':'boss_oblivion_herald';
    const evtId=G.templeBoss==='boss_stone_idol'?'temple_event_1a':'temple_event_1b';
    log(`🏛️ 사원 1페이즈 진입... (AP-${apCost})`,'');
    showExploreChoice(EVENTS[evtId], ()=>_startTempleCombat('temple_shade',1));
  } else if(ph===1){
    log(`🏛️ 사원 2페이즈 진입... (AP-${apCost})`,'');
    showExploreChoice(EVENTS['temple_event_2'], ()=>_startTempleCombat('temple_guardian_knight',2));
  } else if(ph===2){
    log(`🏛️ 사원 보스 대결 시작... (AP-${apCost})`,'danger');
    _startTempleCombat(G.templeBoss, 3);
  }
  render();
}

function _startTempleCombat(evtId, nextPhase){
  const base=ENEMIES[evtId];
  if(!base){ log('사원 전투 데이터 오류','danger'); return; }
  const enemy={...base};
  enemy._templeNextPhase=nextPhase;
  startCombat(evtId, false, false, enemy);
}
