// ═══════════════ MYCELIUM ESCAPE ═══════════════

function doSporeShrine(){
  if(G.over) return;
  const ph=G.mycPhase||0;
  if(ph>=3){ log('🌀 대균사는 이미 쓰러뜨렸다.',''); return; }
  const apArr=[3,3,4];
  const apCost=apArr[ph];
  if(G.ap<apCost){ log(`AP부족 (포자 제단 ${ph+1}페이즈:AP${apCost})`,'danger'); render(); return; }
  G.ap-=apCost;

  if(ph===0){
    log(`🌀 포자 제단 진입... 포자 인간이 나타났다! (AP-${apCost})`,'danger');
    _startMycCombat('cbt_spore_walker', 1);
  } else if(ph===1){
    log(`🌀 균사 수호수가 몸을 드러냈다! (AP-${apCost})`,'danger');
    _startMycCombat('cbt_mycelium_beast', 2);
  } else if(ph===2){
    log(`🌀 대균사의 심층부에 도달했다! (AP-${apCost})`,'danger');
    _startMycCombat('boss_great_mycelium', 3);
  }
  render();
}

function _startMycCombat(enemyId, nextPhase){
  const base=ENEMIES[enemyId];
  if(!base){ log('균사 전투 데이터 오류','danger'); return; }
  const enemy={...base, _mycNextPhase:nextPhase};
  startCombat(enemyId, false, false, enemy);
}
