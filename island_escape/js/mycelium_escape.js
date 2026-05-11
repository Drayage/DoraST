// ═══════════════ MYCELIUM ESCAPE ═══════════════

function doSporeShrine(){
  if(G.over) return;
  const ph=G.mycPhase||0;
  if(ph>=3){ log('🌀 대균사는 이미 쓰러뜨렸다.',''); return; }
  const apArr=[3,3,4];
  const apCost=apArr[ph];
  if(G.ap<apCost){ log(`AP부족 (포자 제단 ${ph+1}페이즈:AP${apCost})`,'danger'); render(); return; }

  // 지도 없으면 제단 내부 진입 불가
  const hasMap=allCards().some(c=>c.id==='myc_map')||G.mycMapUsed;
  if(!hasMap){
    log('🗺️ 제단 내부로 이어지는 길을 헤맸다. 균사지도가 필요하다.','danger');
    // 포자 교환 이벤트만 표시
    showExploreChoice(EVENTS['myc_spore_exchange'], ()=>render());
    return;
  }

  G.ap-=apCost;

  // 보스 타입 결정 (첫 번째 페이즈 시작 시)
  if(ph===0 && !G.mycBoss){
    G.mycBoss=Math.random()<0.5?'boss_rot_queen':'boss_spore_tyrant';
  }

  if(ph===0){
    log(`🌀 포자 제단 진입... (AP-${apCost})`,'');
    const introEvt=EVENTS['myc_shrine_ev0'];
    if(!G.mycEventShown) G.mycEventShown={};
    if(!G.mycEventShown[0]){
      G.mycEventShown[0]=true;
      showExploreChoice(introEvt, ()=>{
        showExploreChoice(EVENTS['myc_shrine_ev1'], ()=>_startMycCombat('cbt_spore_walker',1));
      });
    } else {
      showExploreChoice(EVENTS['myc_shrine_ev1'], ()=>_startMycCombat('cbt_spore_walker',1));
    }
  } else if(ph===1){
    log(`🌀 균사 수호수가 몸을 드러냈다! (AP-${apCost})`,'danger');
    showExploreChoice(EVENTS['myc_shrine_ev2'], ()=>_startMycCombat('cbt_mycelium_beast',2));
  } else if(ph===2){
    log(`🌀 대균사의 심층부에 도달했다! (AP-${apCost})`,'danger');
    const bossIntroEvt=G.mycBoss==='boss_rot_queen'?EVENTS['myc_boss_rot_intro']:EVENTS['myc_boss_spore_intro'];
    showExploreChoice(bossIntroEvt, ()=>_startMycCombat(G.mycBoss,3));
  }
  render();
}

function _startMycCombat(enemyId, nextPhase){
  const base=ENEMIES[enemyId];
  if(!base){ log('균사 전투 데이터 오류','danger'); return; }
  const enemy={...base, _mycNextPhase:nextPhase};
  if(enemy.bossType) enemy._phase2=false;
  startCombat(enemyId, false, false, enemy);
}

function doSporeShrineExchange(){
  if(G.over) return;
  if(G.ap<1){log('AP부족','danger');return;}
  const sporeCnt=allCards().filter(c=>c.id==='spore').length;
  if(!sporeCnt){log('🌱 포자가 없다.','danger');return;}
  G.ap-=1;
  showExploreChoice(EVENTS['myc_spore_exchange'], ()=>render());
}
