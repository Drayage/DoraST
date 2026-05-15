// ═══════════════ SLEEP ═══════════════

const MYCELIUM_DOOM_STORY=[
  {phase:0,
   title:'🍄 최초의 포자',
   story:'첫 번째 밤이 지나고, 배낭 안을 열었더니\n식량 하나에 하얀 균사가 피어 있었다.\n\n달콤하고 낯선 냄새.\n먹을 수 없다.\n\n이 섬의 균사는 살아있다 —\n네 음식에 손을 뻗기 시작했다.',
   detail:'⚠️ 균사 잠식 시작: 매 취침마다 식량 카드 25%가 썩은 음식으로 변질',
   doomAdd:1, rateAfter:2, nextPhase:1},
  {phase:1, minDay:6,
   title:'☁️ 포자가 번진다',
   story:'포자 구름이 폐 속까지 들어왔다.\n쓴맛이 혀 끝에 남는다.\n\n균사망이 섬 전체를 촘촘히 연결하고 있다.\n발바닥이 그 진동을 먼저 느꼈다.\n\n식량 냄새가 달라졌다.\n탈출 시간이 짧아지고 있다.',
   detail:'⚠️ DOOM 즉시 +15%p → 이후 매 취침마다 +3%p 자동 증가',
   doomAdd:15, rateAfter:3, nextPhase:2},
  {phase:2, minDay:11,
   title:'🍄 잠식의 가속',
   story:'음식 냄새가 이상하다.\n꺼내보면 멀쩡해 보이는데,\n먹고 나면 속이 뒤집힌다.\n\n균사가 내 안에서도 자라는 것 같다.\n꿈에서도 균사 냄새가 났다.\n\n식량을 믿을 수가 없다.',
   detail:'⚠️ DOOM 즉시 +25%p | 식량 변질 확률 25%→50% | 포자 카드 덱 침투 시작',
   doomAdd:25, rateAfter:4, nextPhase:3},
  {phase:3, minDay:16,
   title:'🌑 완전 잠식',
   story:'섬 전체가 균사로 뒤덮이고 있다.\n\n아침에 일어났을 때\n무엇을 먹었는지 기억이 없었다.\n잠에서 깨면 손에 썩은 것들이 쥐어져 있다.\n\n탈출하지 않으면 —\n이 섬의 일부가 된다.',
   detail:'⚠️ DOOM 강제로 80%p 도달 | 매 취침 생사의 복권 시작',
   doomSet:80, rateAfter:0, nextPhase:4},
];

const MYCELIUM_ENDGAME_FL=[
  {txt:'균사 뿌리가 발목 근처까지 뻗어있다. 잘라냈지만 내일도 자라날 것이다.',hpPen:2,sanPen:5},
  {txt:'식량을 꺼냈더니 손가락에 포자가 묻었다. 씻어내는 데 오래 걸렸다.',hpPen:0,sanPen:7},
  {txt:'잠결에 썩은 음식을 먹은 것 같다. 속이 불편하다.',hpPen:3,sanPen:4},
  {txt:'균사 나무가 점점 가까워지는 느낌이다. 아니면 내가 가까이 간 건가.',hpPen:1,sanPen:6},
  {txt:'포자 구름 속에서 사람의 형상을 봤다. 달려갔더니 균사 덩어리였다.',hpPen:0,sanPen:8},
  {txt:'균사가 발밑에서 올라온다. 이미 무릎까지 뻗어있는 것 같다.',hpPen:2,sanPen:6},
];

// ── 흑색 화산섬 종말 시나리오 ──
const CALDERA_DOOM_STORY=[
  {phase:0,
   title:'🌋 첫 번째 진동',
   story:'발밑이 뜨겁다. 밤새 지진이 두 번 있었다.\n\n지평선 저 너머에서 연기가 피어오른다.\n아직은 멀다.',
   detail:'⚠️ 칼데라 시작: DOOM +1%, 이후 매 취침 +2%',
   doomAdd:1, rateAfter:2, nextPhase:1},
  {phase:1, minDay:6,
   title:'🔥 화산이 깨어났다',
   story:'화산이 깨어났다.\n지평선이 붉게 물들었다.\n\n재가 내린다.\n물을 구하기 어렵고 숨 쉬기도 힘들다.',
   detail:'⚠️ DOOM 즉시 +15%p → 이후 매 취침 +3%p',
   doomAdd:15, rateAfter:3, nextPhase:2},
  {phase:2, minDay:11,
   title:'💨 대분화 임박',
   story:'용암이 흐르기 시작했다.\n지형이 무너지고 있다.\n\n숨겨진 마을(🏘️)을 찾아라.\n그곳에서 대분화를 기다려야 한다.',
   detail:'⚠️ DOOM 즉시 +25%p | 이후 매 취침 +4%p',
   doomAdd:25, rateAfter:4, nextPhase:3},
  {phase:3, minDay:16,
   title:'🌑 최후의 선택',
   story:'섬이 사라지고 있다.\n\n마을(🏘️)에서 대분화를 기다려 5일을 버텨내거나,\n뗏목·연기 신호로 지금 당장 탈출하라.',
   detail:'⚠️ DOOM 강제 80%p | 매 취침 생사 복권 시작',
   doomSet:80, rateAfter:0, nextPhase:4},
];
const CALDERA_ENDGAME_FL=[
  {txt:'흑색 재가 손등에 쌓인다. 섬이 사라지고 있다.',hpPen:3,sanPen:3},
  {txt:'지반이 흔들려 물건을 잃을 뻔했다.',hpPen:2,sanPen:5},
  {txt:'화산재 속에서 방향을 잃었다.',hpPen:0,sanPen:8},
  {txt:'용암이 눈앞까지 왔다. 뒤로 물러섰다.',hpPen:4,sanPen:4},
  {txt:'뜨거운 공기가 폐를 태운다.',hpPen:5,sanPen:2},
];
// 5일간 대분화 종말 이벤트 풀
const CALDERA_DOOM_EVENTS=[
  {id:'caldera_fire', name:'🔥 대화재',
   flavor:'마을 전체에 불이 번졌다! 덱이 타오른다.',
   choices:[
     {label:'필사적으로 막는다',icon:'🔥',req:'tool',
      reward:{removeCards:4},failPen:{removeCards:7},
      desc:'도구판정. 성공:비상태 4장 소멸 / 실패:비상태 7장 소멸'},
     {label:'포기하고 피한다',icon:'🏃',req:null,reward:{removeCards:5},fixed:true,
      desc:'무조건. 비상태 5장 소멸.'},
   ]},
  {id:'caldera_heat', name:'💨 극한 열기',
   flavor:'화산 열기가 몸속 수분을 모두 태워버린다.',
   choices:[
     {label:'방어구로 버팀',icon:'🛡️',req:null,subReq:'방어구',
      reward:{thi:-30},failPen:{thi:-65,addCard:'thirst_card',n:2},
      desc:'방어구 판정. 성공:갈증-30 / 실패:갈증-65+목마름2장'},
     {label:'그냥 버틴다',icon:'😤',req:null,reward:{thi:-65,addCard:'thirst_card',n:2},fixed:true,
      desc:'무조건. 갈증-65+목마름2장.'},
   ]},
  {id:'caldera_gas', name:'☁️ 독성 화산 가스',
   flavor:'유독한 화산 가스가 마을을 완전히 덮쳤다.',
   choices:[
     {label:'불꽃으로 가스 태움',icon:'🔥',req:null,subReq:'불꽃',
      reward:{hp:-10},failPen:{hp:-35,thi:-20},
      desc:'불꽃 판정. 성공:HP-10 / 실패:HP-35+갈증-20'},
     {label:'숨을 참고 통과',icon:'😮‍💨',req:null,reward:{hp:-25,thi:-20},fixed:true,
      desc:'무조건. HP-25, 갈증-20.'},
   ]},
  {id:'caldera_quake', name:'🌍 대지진',
   flavor:'섬 자체가 쪼개질 것처럼 흔들린다.',
   choices:[
     {label:'무거운 것으로 버팀',icon:'⚒️',req:null,subReq:'무거움',
      reward:{hp:-12},failPen:{hp:-40,removeCards:2},
      desc:'무거움 판정. 성공:HP-12 / 실패:HP-40+비상태 2장 소멸'},
     {label:'그냥 버틴다',icon:'😤',req:null,reward:{hp:-30},fixed:true,
      desc:'무조건. HP-30.'},
   ]},
  {id:'caldera_lava_burst', name:'🌋 용암 분출',
   flavor:'마을 지하에서 용암이 솟구쳤다! HP가 타들어 간다.',
   choices:[
     {label:'날카로운 것으로 대피로 확보',icon:'🗡️',req:null,subReq:'날카로움',
      reward:{hp:-8,thi:-10},failPen:{hp:-30,thi:-20},
      desc:'날카로움 판정. 성공:HP-8+갈증-10 / 실패:HP-30+갈증-20'},
     {label:'무조건 뛰어나간다',icon:'💨',req:null,reward:{hp:-20,thi:-15},fixed:true,
      desc:'무조건. HP-20, 갈증-15.'},
   ]},
  // 몬스터 습격 — isCombat:true (기습 전투)
  {id:'caldera_monster_raid', isCombat:true,
   flavor:'화산 폭발을 피해 달아나던 몬스터 떼가 마을로 쏟아졌다!',
   combatPool:['cbt_lava_crab','cbt_flame_lizard']},
];

// ── 망각의 맹그로브 섬 종말 시나리오 ──
const DOOM_STORY=[
  {phase:0,
   title:'🌫️ 섬의 첫 번째 숨결',
   story:'첫 번째 밤, 낮고 짙은 안개가 섬 전체를 감쌌다.\n잠에서 깨어보니 방향 감각이 흐릿했다.\n\n맹그로브 뿌리 사이에서 무언가 속삭이는 소리가 들렸다.\n기억인지 환각인지 알 수 없는 그 소리가\n이 섬의 이름을 알려주었다 —\n\n여기는 망각의 맹그로브 섬이다.',
   detail:'⚠️ DOOM 즉시 +1%p 상승 → 이후 매 취침마다 +2%p 자동 증가',
   doomAdd:1,rateAfter:2,nextPhase:1},
  {phase:1,minDay:6,
   title:'👁 첫 번째 환각',
   story:'탐색 중 잠시 길을 잃었다.\n방금 지나온 나무가 두 그루였는데, 돌아보니 하나였다.\n\n맹그로브 뿌리가 발목을 감는 것 같은 느낌.\n물 위에 비친 내 얼굴이 조금 낯설었다.\n\n섬이 나를 흡수하려는 건지도 모른다.',
   detail:'⚠️ DOOM 즉시 +15%p 상승 → 이후 매 취침마다 +3%p 자동 증가',
   doomAdd:15,rateAfter:3,nextPhase:2},
  {phase:2,minDay:11,
   title:'🌊 안개가 기억을 삼킨다',
   story:'3일 전에 탐색한 구역을 다시 걷는 기분이 든다.\n하지만 발자국을 보면 처음 오는 곳이다.\n\n밤이면 누군가의 발소리가 들린다.\n뒤돌아보면 아무도 없다.\n\n이 섬은 방문자의 기억을 먹고 산다.',
   detail:'⚠️ DOOM 즉시 +25%p 상승 → 이후 매 취침마다 +4%p 자동 증가',
   doomAdd:25,rateAfter:4,nextPhase:3},
  {phase:3,minDay:16,
   title:'🌑 망각의 심연',
   story:'오늘 아침 내 이름이 기억나지 않았다.\n\n뗏목을 짜던 손이 멈췄다.\n왜 이걸 만들고 있었는지,\n어디로 가야 하는지가\n안개처럼 흩어졌다.\n\n하지만 손은 기억한다. 계속 움직인다.\n몸보다 먼저 탈출을 원하고 있다.',
   detail:'⚠️ DOOM 강제로 80%p 도달 | 망각 단계 시작: 탐색 시 망각 카드 침투 · 정신력 가속 소모',
   doomSet:80,rateAfter:0,nextPhase:4},
];

const DOOM_ENDGAME_FL=[
  {txt:'안개 속에서 지나온 길을 잃었다. 한 시간을 헤맸다.',hpPen:1,sanPen:6},
  {txt:'잠결에 모르는 언어로 중얼거렸다. 깨어나도 기억이 없다.',hpPen:0,sanPen:7},
  {txt:'맹그로브 나무들이 모두 같은 얼굴로 보인다.',hpPen:2,sanPen:5},
  {txt:'물 위의 내 그림자가 반대 방향으로 움직였다.',hpPen:1,sanPen:6},
  {txt:'뗏목에 새긴 날짜가 흐릿해졌다. 오늘이 며칠인지 모른다.',hpPen:0,sanPen:8},
  {txt:'동이 틀 때까지 맹그로브 뿌리들이 움직이는 소리를 들었다.',hpPen:3,sanPen:4},
];

function getWeatherDelta(w){
  const d={ap:0,san:0,thi:0,hp:0,fog:false};
  if(!w?.eff) return d;
  const [s,v]=w.eff.split('_');
  const val=parseInt(v);
  if(s==='ap') d.ap=val;
  else if(s==='san') d.san=val;
  else if(s==='thi') d.thi=val;
  else if(s==='hp') d.hp=val;
  else if(s==='fog') d.fog=true;
  return d;
}

function calcDeficitDamage(cur, need, base){
  const deficit=Math.max(0,need-cur);
  return {deficit, dmg:deficit>0?base+deficit:0};
}

function checkSleepDanger(){
  const tW=getWeatherDelta(G.tomorrow);
  const poisonN=allCards().filter(c=>c.id==='poison_status').length;

  // ── 칼데라 대분화 절정: 별도 피해 계산 ──
  if(G.islandId==='caldera'&&G.calderaFinale){
    const sHpR=G.ap>=4?6:3;
    const hunLoss=35, thiLoss=45;
    const hunDef=Math.max(0,hunLoss-G.hun);
    const thiDef=Math.max(0,thiLoss-G.thi);
    const finalePen=(hunDef>0?15+hunDef:0)+(thiDef>0?20+thiDef:0)+5*poisonN;
    const rawHpAfter=G.hp-finalePen+sHpR;
    if(rawHpAfter<=0){
      showConfirm('🌋 대분화 — 취침 사망 위기',
        `취침 후 체력이 0이 됩니다.\n현재 HP ${G.hp} → 피해 ${finalePen} / 회복 ${sHpR}\n(허기-35, 갈증-45 소모)\n계속 진행하시겠습니까?`,
        ()=>doSleep());
      return;
    }
    doSleep(); return;
  }

  const sNeedHun=14, sNeedThi=Math.max(0,18-tW.thi);
  const shDmg=Math.max(0,sNeedHun-G.hun)>0?15+Math.max(0,sNeedHun-G.hun):0;
  const stDmg=Math.max(0,sNeedThi-G.thi)>0?24+Math.max(0,sNeedThi-G.thi):0;
  const wHpDmg=Math.max(0,-tW.hp);
  const sHpR=(G.ap>=4?15:9)-(G.doomPhase===4?4:0);
  const totalDmg=shDmg+stDmg+wHpDmg+5*poisonN;
  const rawHpAfter=G.hp-totalDmg+sHpR;
  if(rawHpAfter<=0){
    showConfirm('⚠️ 사망 위기',
      `취침 후 체력이 0이 됩니다.\n현재 HP ${G.hp} → 피해 ${totalDmg} / 회복 ${sHpR}\n계속 진행하시겠습니까?`,
      ()=>doSleep());
    return;
  }
  // 정신력 0 예측
  const early=G.ap>=4;
  let sSanR=early?4:2;
  if(G.doomPhase===4) sSanR=Math.max(0,sSanR-2);
  G.camps.forEach(cp=>{ if(G.tiles[cp]?.id==='cave') sSanR+=3; });
  const ruinsCnt=G.camps.filter(cp=>G.tiles[cp]?.id==='ruins').length;
  const sanAfterRuins=Math.max(0,G.san-ruinsCnt*2);
  const doomSanExtra=G.doomPhase>=4?Math.floor((G.doom-79)/6):0;
  const sanDrain=(G.camps.length?2:5)+doomSanExtra;
  const sanAfter=Math.min(100,Math.max(0,sanAfterRuins+sSanR-sanDrain+tW.san));
  if(sanAfter<=0){
    showConfirm('⚠️ 정신력 위기',
      `취침 후 정신력이 0이 됩니다.\n현재 정신력 ${G.san} → 예상 ${sanAfter}\n계속 진행하시겠습니까?`,
      ()=>doSleep());
    return;
  }
  doSleep();
}

function checkGatherDanger(){
  const ghDmg=Math.max(0,5-G.hun)>0?10+Math.max(0,5-G.hun):0;
  const gtDmg=Math.max(0,6-G.thi)>0?16+Math.max(0,6-G.thi):0;
  const totalDmg=ghDmg+gtDmg;
  if(totalDmg>0 && G.hp-totalDmg<=0){
    showConfirm('⚠️ 사망 위기',
      `수집 후 체력이 0이 됩니다.\n현재 HP ${G.hp} → 예상 피해 ${totalDmg}\n계속 진행하시겠습니까?`,
      ()=>openGather());
    return;
  }
  openGather();
}

function showVolcanoEffect(cb){
  const wrap=document.getElementById('wrap')||document.getElementById('game-wrap')||document.body;
  wrap.classList.add('volcano-shake');
  setTimeout(()=>wrap.classList.remove('volcano-shake'),1200);
  const ov=document.getElementById('volcano-overlay');
  if(ov){ov.style.display='';ov.style.animation='none';void ov.offsetWidth;ov.style.animation='volcanoFlash 2.5s ease-out forwards';setTimeout(()=>{ov.style.display='none';},2500);}
  log('🌋💥 대분화!!!  용암이 마을 주변을 삼키고 있다!','danger');
  if(cb) setTimeout(cb, 1800);
}

function _showCalderaDoomEvent(cb){
  const ev=CALDERA_DOOM_EVENTS[Math.floor(Math.random()*CALDERA_DOOM_EVENTS.length)];
  log(`🌋 대분화 종말이벤트: ${ev.name||ev.id}. ${ev.flavor||''}`,'danger');
  if(ev.isCombat){
    const mId=ev.combatPool[Math.floor(Math.random()*ev.combatPool.length)];
    _calderaCombatCallback=cb;
    startCombat(mId, true, false, null);
    // combat finish calls _calderaCombatCallback via startCombatWithCallback pattern
  } else {
    showExploreChoice(ev, cb);
  }
}
let _calderaCombatCallback=null;
function calderaCombatDone(){
  const cb=_calderaCombatCallback; _calderaCombatCallback=null;
  if(cb) cb();
}

function doCalderaFinaleStart(){
  if(G.over||G.calderaFinale) return;
  showConfirm(
    '🌋 화산의 종말을 기다립니다',
    '대분화가 시작됩니다. 5일간 극한의 이벤트가 발생합니다.\n화상×8, 목마름×3이 덱에 추가되고 매 취침마다 추가됩니다.\n주변 타일이 용암으로 막힙니다. 이 선택은 되돌릴 수 없습니다.',
    ()=>{
      G.calderaFinale=true;
      G.calderaFinaleDays=0;
      G.doom=100; // 즉시 doom 100 — 칼데라 finale 중에는 doom 사망 비활성
      const _mk=id=>{const d=CARD_MAP[id];if(!d)return null;const c={...d,uid:uid()};if(d.dur)c.curDur=d.dur;c.addedDay=G.day;return c;};
      for(let i=0;i<8;i++){const c=_mk('burn_card');if(c)G.deck.push(c);}
      for(let i=0;i<3;i++){const c=_mk('thirst_card');if(c)G.deck.push(c);}
      G.deck=shuffle(G.deck);
      log('🌋🔥 대분화 시작! 화상×8, 목마름×3이 뽑기덱에 직접 섞였다!','danger');
      // 맵 전체를 용암으로 봉쇄 (village·caldera_tile 제외)
      const SAFE=['village','caldera_tile'];
      let blockedCnt=0;
      G.tiles.forEach((t,i)=>{
        if(i===G.pos||SAFE.includes(t.id)||t.lavaDead) return;
        t.lavaDead=true; t.revealed=true; blockedCnt++;
      });
      if(blockedCnt>0) log(`🌋 섬 전체가 용암에 잠겼다! ${blockedCnt}개 타일 봉쇄.`,'danger');
      // 분화구 타일과 그 주변을 모두 강제 공개 (화산에서 퍼져나오는 느낌)
      const calderaIdx=G.tiles.findIndex(t=>t.id==='caldera_tile');
      if(calderaIdx>=0){
        G.tiles[calderaIdx].revealed=true;
        getAdj(calderaIdx).forEach(i=>{ G.tiles[i].revealed=true; });
      }
      showVolcanoEffect(()=>{render();saveGame();});
    }
  );
}

function doSleep(){
  if(G.over) return;
  const early=G.ap>=4;
  if(!G.actionCnt) G.actionCnt={move:0,explore:0,gather:0,camp:0,craft:0,carduse:0,sleep:0,combat:0};
  G.actionCnt.sleep=(G.actionCnt.sleep||0)+1;
  G.day++;

  // ── 칼데라: 대분화 절정 5일 버티기 ──
  if(G.islandId==='caldera'&&G.calderaFinale&&!G.over){
    G.calderaFinaleDays=(G.calderaFinaleDays||0)+1;
    G.doom=100; // doom 사망 방지

    // ── 캠프 보너스 ──
    let ruinsBonusAP=0, hpR=early?6:3, sanR=early?3:1; // 대분화 중 회복량 감소
    const campCount={cave:0,forest:0,shore:0,ruins:0};
    const inCampNow=G.camps.includes(G.pos);
    const campDouble=allCards().some(c=>c.id==='sk_cp_g');
    G.camps.forEach(cp=>{
      const t=G.tiles[cp];
      if(t.id==='cave')   { sanR+=campDouble?6:3; campCount.cave++; }
      if(t.id==='forest') { addCard('berry',campDouble?2:1); campCount.forest++; }
      if(t.id==='shore')  { addCard('dew',campDouble?2:1); campCount.shore++; }
      if(t.id==='ruins')  { ruinsBonusAP+=campDouble?2:1; G.san=Math.max(0,G.san-(campDouble?4:2)); campCount.ruins++; }
    });
    const _cx=n=>n>1?`(x${n})`:'';
    if(campCount.cave)   log(`🪨 동굴캠프${_cx(campCount.cave)}: 정신력+${(campDouble?6:3)*campCount.cave}`,'success');
    if(campCount.forest) log(`🌲 숲캠프${_cx(campCount.forest)}: 열매×${campDouble?campCount.forest*2:campCount.forest}`,'success');
    if(campCount.shore)  log(`🌊 해안캠프${_cx(campCount.shore)}: 이슬×${campDouble?campCount.shore*2:campCount.shore}`,'success');
    if(campCount.ruins)  log(`🏚️ 폐허캠프${_cx(campCount.ruins)}: AP+${campDouble?campCount.ruins*2:campCount.ruins}`,'');

    // ── 스킬 패시브 (취침 HP/SAN) ──
    const _slS1Cnt=allCards().filter(c=>c.id==='sk_sl_s1').length;
    const _slS2Cnt=allCards().filter(c=>c.id==='sk_sl_s2').length;
    const _cpS1Cnt=allCards().filter(c=>c.id==='sk_cp_s1').length;
    hpR+=8*_slS1Cnt; sanR+=8*_slS2Cnt;
    if(inCampNow) hpR+=5*_cpS1Cnt;

    // ── 날씨 적용 ──
    G.weather=G.tomorrow;
    const wD=getWeatherDelta(G.weather);
    G.tomorrow=WEATHER_CALDERA[Math.floor(Math.random()*WEATHER_CALDERA.length)];

    // ── 극심한 허기·갈증 소모 (일반의 2~3배) ──
    const finaleHunLoss=35, finaleThlLoss=45;
    const prevHun=G.hun, prevThi=G.thi;
    const hunDeficit=Math.max(0,finaleHunLoss-prevHun);
    const thiDeficit=Math.max(0,finaleThlLoss-prevThi);
    G.hun=Math.max(0,prevHun-finaleHunLoss);
    G.thi=Math.max(0,prevThi-finaleThlLoss);
    let finalePen=0;
    if(hunDeficit>0){finalePen+=15+hunDeficit; log(`🍗 화산 열기에 식량이 타버렸다. 허기 부족 → HP-${15+hunDeficit}`,'danger');}
    if(thiDeficit>0){finalePen+=20+thiDeficit; log(`💧 극심한 탈수. 갈증 부족 → HP-${20+thiDeficit}`,'danger');}

    // ── HP·SAN 최종 적용 ──
    const poisonN=allCards().filter(c=>c.id==='poison_status').length;
    if(poisonN>0){ finalePen+=5*poisonN; log(`☠️ 중독 피해: HP-${5*poisonN}`,'danger'); }
    const rawHp=G.hp+hpR-finalePen+Math.min(0,wD.hp); // 날씨 HP 디버프만 적용
    G.hp=Math.min(100,Math.max(0,rawHp));
    if(finalePen>0) flashDamage();
    const sanDrain=G.camps.length?2:5;
    G.san=Math.min(100,Math.max(0,G.san+sanR-sanDrain+wD.san));

    // ── 화상×8, 목마름×3 뽑기덱에 직접 삽입 ──
    const _mkCard=id=>{const d=CARD_MAP[id];if(!d)return null;const c={...d,uid:uid()};if(d.dur)c.curDur=d.dur;c.addedDay=G.day;return c;};
    for(let i=0;i<8;i++){const c=_mkCard('burn_card');if(c)G.deck.push(c);}
    for(let i=0;i<3;i++){const c=_mkCard('thirst_card');if(c)G.deck.push(c);}

    // ── 덱 셔플 (버림덱 합산) ──
    const fatigueN=allCards().filter(c=>c.id==='fatigue').length;
    G.ap=Math.max(1,G.maxAP+(early?2:0)+ruinsBonusAP-fatigueN*2+wD.ap);
    G.deck=shuffle(G.deck.concat(G.disc)); G.disc=[];

    const sanNet=sanR-sanDrain+wD.san;
    log(`🌙🌋 ${G.day-1}일→${G.day}일 (대분화 ${G.calderaFinaleDays}/5일). HP${hpR-finalePen>=0?'+':''}${hpR-finalePen} 정신력${sanNet>=0?'+':''}${sanNet} AP${G.ap} | 화상×8+목마름×3 뽑기덱 투입`,'important');

    checkSurvival(); if(G.over) return;
    _showCalderaDoomEvent(()=>{
      log(`🌋 대분화 버티기 ${G.calderaFinaleDays}/5일`,'');
      if(G.calderaFinaleDays>=5){
        G.escape=100;
        G.calderaVillageEscape=true;
        log('🏘️ 5일을 버텼다! 화산이 진정됐다. 마을 밖으로 나올 수 있다!','success');
        checkWin(); return;
      }
      checkSurvival(); if(G.over) return;
      render(); saveGame();
    });
    return;
  }

  let hpR=early?15:9, sanR=early?4:2;
  if(G.doomPhase===4){ hpR=Math.max(0,hpR-4); sanR=Math.max(0,sanR-2); }

  let ruinsBonusAP=0;
  const campCount={cave:0,forest:0,shore:0,ruins:0};
  const inCampNow=G.camps.includes(G.pos);
  const campDouble=allCards().some(c=>c.id==='sk_cp_g');
  G.camps.forEach(cp=>{
    const t=G.tiles[cp];
    if(t.id==='cave')   { sanR+=campDouble?6:3; campCount.cave++; }
    if(t.id==='forest') { addCard('berry',campDouble?2:1); campCount.forest++; }
    if(t.id==='shore')  { addCard('dew',campDouble?2:1); campCount.shore++; }
    if(t.id==='ruins')  { ruinsBonusAP+=campDouble?2:1; G.san=Math.max(0,G.san-(campDouble?4:2)); campCount.ruins++; }
  });
  // 스킬 패시브: 취침 HP/SAN 보너스 (count 기반)
  const _slS1Cnt=allCards().filter(c=>c.id==='sk_sl_s1').length;
  const _slS2Cnt=allCards().filter(c=>c.id==='sk_sl_s2').length;
  const _cpS1Cnt=allCards().filter(c=>c.id==='sk_cp_s1').length;
  hpR+=8*_slS1Cnt;
  sanR+=8*_slS2Cnt;
  if(inCampNow) hpR+=5*_cpS1Cnt;
  const _cx=n=>n>1?`(x${n})`:'';
  if(campCount.cave)   log(`🪨 동굴캠프${_cx(campCount.cave)}: 취침 정신력+${(campDouble?6:3)*campCount.cave}${campDouble?' (🏰야영의 달인 ×2)':''}`,'success');
  if(campCount.forest) log(`🌲 숲캠프${_cx(campCount.forest)}: 작은 열매 🍒 ×${campDouble?campCount.forest*2:campCount.forest} 자동생성${campDouble?' (🏰×2)':''}`,'success');
  if(campCount.shore)  log(`🌊 해안캠프${_cx(campCount.shore)}: 맺힌이슬 💦 ×${campDouble?campCount.shore*2:campCount.shore} 자동생성${campDouble?' (🏰×2)':''}`,'success');
  if(campCount.ruins)  log(`🏚️ 폐허캠프${_cx(campCount.ruins)}: AP+${campDouble?campCount.ruins*2:campCount.ruins}${campDouble?' (🏰×2)':''} / 정신력-${campCount.ruins*(campDouble?4:2)}`,'');
  const fatigueN=allCards().filter(c=>c.id==='fatigue').length;
  const preHun=G.hun, preThi=G.thi;
  G.weather=G.tomorrow;
  const wD=getWeatherDelta(G.weather);
  const needHun=14;
  const needThi=Math.max(0,18-wD.thi);
  const hLoss=calcDeficitDamage(preHun,needHun,15);
  const tLoss=calcDeficitDamage(preThi,needThi,24);
  const wHpDmg=Math.max(0,-wD.hp);
  const actionDmg=hLoss.dmg+tLoss.dmg+wHpDmg;
  G.hun=Math.max(0,preHun-needHun);
  G.thi=Math.max(0,preThi-needThi);
  let rawHp=G.hp;
  if(actionDmg>0){
    rawHp-=actionDmg;
    flashDamage();
    log(`🛌 취침 피해: ${hLoss.dmg?`허기HP-${hLoss.dmg} `:''}${tLoss.dmg?`갈증HP-${tLoss.dmg} `:''}${wHpDmg?`날씨HP-${wHpDmg}`:''}`,'danger');
  }
  const poisonN=allCards().filter(c=>c.id==='poison_status').length;
  if(poisonN>0){ rawHp-=5*poisonN; log(`☠️ 중독 피해: HP-${5*poisonN}`,'danger'); }
  rawHp+=hpR;
  G.hp=Math.min(100,Math.max(0,rawHp));
  if(rawHp<=0){ checkSurvival(); if(G.over) return; }
  const doomSanExtra=G.doomPhase>=4?Math.floor((G.doom-79)/6):0;
  const sanDrain=(G.camps.length?2:5)+doomSanExtra;
  G.san=Math.min(100,Math.max(0,G.san+sanR-sanDrain+wD.san));
  const bonAP=early?2:0;
  const _wPool=G.islandId==='mycelium'?WEATHER_MYCELIUM:G.islandId==='caldera'?WEATHER_CALDERA:WEATHER;
  G.tomorrow=_wPool[Math.floor(Math.random()*_wPool.length)];
  G.ap=Math.max(1,G.maxAP+bonAP+ruinsBonusAP-fatigueN*2+wD.ap);
  if(wD.fog) log(`${G.weather.icon} ${G.weather.name}: 안개가 짙어졌다.`,'danger');
  if(G.day>5){
    const fog=G.tiles.filter((t,i)=>{
      if(!t.revealed||t.hasCamp||i===G.pos) return false;
      const dr=Math.abs(Math.floor(i/7)-Math.floor(G.pos/7));
      const dc=Math.abs((i%7)-(G.pos%7));
      return dr+dc>1;
    });
    const n=Math.floor(fog.length*.08);
    for(let i=0;i<n;i++){const idx=Math.floor(Math.random()*fog.length);const ti=G.tiles.indexOf(fog[idx]);if(ti>=0){G.tiles[ti].wasSeen=true;G.tiles[ti].revealed=false;}fog.splice(idx,1);}
  }
  G.deck=shuffle(G.deck.concat(G.disc)); G.disc=[];

  // ── 균사의 늪: 취침 시 식량 카드 변질 ──
  if(G.islandId==='mycelium'){
    const foodIds=['food','berry','herb'];
    const phase3=G.doomPhase>=3;
    const rate=phase3?0.5:0.25;
    const rottenDef=CARDS.find(d=>d.id==='rotten_food');
    if(rottenDef){
      let rottenCnt=0;
      G.deck=G.deck.map(c=>{
        if(!foodIds.includes(c.id)) return c;
        // 이번 턴(취침 직전 행동)에 얻은 카드는 보호
        if(c.addedDay!==undefined && c.addedDay>=G.day-1) return c;
        // 25% 단계: 하루 최대 1장
        if(!phase3 && rottenCnt>=1) return c;
        if(Math.random()<rate){ rottenCnt++; return {...rottenDef,uid:uid()}; }
        return c;
      });
      if(rottenCnt>0) log(`🍄 균사가 식량 ${rottenCnt}장을 오염시켰다.`,'danger');
    }
  }

  const sanNet=sanR-sanDrain+wD.san;
  const _di=(ISLANDS[G.islandId]||ISLANDS.mangrove).doomIcon||'🌫️';
  const doomHint=G.doomRate>0?` | ${_di}DOOM+${G.doomRate}/일(${G.doom}%)`:G.doomPhase>=4?` | ${_di}DOOM ${G.doom}%`:'';
  log(`🌙 ${G.day-1}일→${G.day}일. HP+${hpR} 정신력${sanNet>=0?'+':''}${sanNet}${bonAP?` 이른취침AP+${bonAP}`:''}${ruinsBonusAP?` 폐허캠프AP+${ruinsBonusAP}`:''}${fatigueN?` 피로AP-${fatigueN*2}`:''}${doomHint}`,'important');

  _processDoom(early);
}

function _processDoom(early){
  const _di=(ISLANDS[G.islandId]||ISLANDS.mangrove).doomIcon||'🌫️';
  // 스토리 이벤트 확인
  const storyArr=G.islandId==='mycelium'?MYCELIUM_DOOM_STORY:G.islandId==='caldera'?CALDERA_DOOM_STORY:DOOM_STORY;
  const storyEvt=storyArr.find(e=>e.phase===G.doomPhase&&(e.minDay===undefined||G.day>=e.minDay));
  if(storyEvt){
    if(storyEvt.doomSet!==undefined) G.doom=storyEvt.doomSet;
    else G.doom=Math.min(100,G.doom+(storyEvt.doomAdd||0));
    G.doomRate=storyEvt.rateAfter;
    G.doomPhase=storyEvt.nextPhase;
    log(`${_di} 종말이벤트: ${storyEvt.title} — DOOM ${G.doom}%`,'danger');
    _showDoomModal(storyEvt.title,storyEvt.story,storyEvt.detail,()=>_afterDoom(early));
    return;
  }
  // 일일 수동 증가
  if(G.doomRate>0 && G.doomPhase<4) G.doom=Math.min(100,G.doom+G.doomRate);

  // ── 균사의 늪: doom 단계 3+ 포자 카드 침투 (첫 취침 1장, 이후 2취침마다 +1, 최대 5장) ──
  if(G.islandId==='mycelium'&&G.doomPhase>=3){
    G.sporeSleepCnt=(G.sporeSleepCnt||0)+1;
    const batch=Math.min(5,1+Math.floor((G.sporeSleepCnt-1)/2));
    addCard('spore_card',batch);
    log(`🌡️ 포자가 가득하다. 포자 흡입 카드 ${batch}장이 덱에 스며들었다.`,'danger');
  }

  // 망각 단계 (80%+)
  if(G.doomPhase===4){
    const add=2+Math.floor(Math.random()*2);
    G.doom=Math.min(100,G.doom+add);
    const flArr=G.islandId==='mycelium'?MYCELIUM_ENDGAME_FL:G.islandId==='caldera'?CALDERA_ENDGAME_FL:DOOM_ENDGAME_FL;
    const fl=flArr[Math.floor(Math.random()*flArr.length)];
    G.hp=Math.max(0,G.hp-fl.hpPen); G.san=Math.max(0,G.san-fl.sanPen);
    if(fl.hpPen>0) flashDamage();
    if(G.islandId==='mycelium'){
      if(G.san<50&&Math.random()*100<(40-G.san*0.5)){
        addCard('spore_card',1);
        log('🌡️ 포자 흡입: 포자 카드가 스며들었다','danger');
      }
    } else {
      if(G.san<50&&Math.random()*100<(40-G.san*0.5)){
        addCard('amnesia',1);
        log('🌀 잠결에 환각이 스며들었다. 망각 카드가 덱에 추가됐다.','danger');
      }
    }
    log(`${_di} ${fl.txt} 정신력-${fl.sanPen}${fl.hpPen>0?` HP-${fl.hpPen}`:''}  DOOM+${add}(${G.doom}%)`,'danger');
    if(G.doom>=100){
      G.doomPhase=5; // 반복 모달 방지
      checkSurvival(); if(G.over) return;
      const doom100Txt=G.islandId==='mycelium'
        ?fl.txt+'\n\n포자 잠식이 100%에 도달했다.\n모든 식량이 균사에 물들었다.\n다음 취침부터 생사의 복권이 시작된다.'
        :fl.txt+'\n\n안개가 100%에 도달했다.\n이제 탈출 의지 자체가 흐릿해진다.\n다음 취침부터 생사의 복권이 시작된다.';
      const doom100Title=G.islandId==='mycelium'?'🍄 완전 잠식':'🌫️ 완전한 망각';
      _showDoomModal(doom100Title,doom100Txt,`DOOM ${G.doom}%`,()=>_afterDoom(early));
      return;
    }
    const doomProgressTitle=G.islandId==='mycelium'?'🍄 균사 잠식':'🌫️ 망각의 진행';
    _showDoomModal(doomProgressTitle,fl.txt+`\n\n정신력 -${fl.sanPen}${fl.hpPen>0?` · 체력 -${fl.hpPen}`:''}`,`종말 +${add}% → ${G.doom}%`,()=>_afterDoom(early));
    return;
  }
  _afterDoom(early);
}

function _afterDoom(early){
  _checkSkillUnlock();
  if(G.pendingSkillType){
    showSkillEvent(()=>_afterDoomContinue(early));
    return;
  }
  _afterDoomContinue(early);
}

function _afterDoomContinue(early){
  checkSurvival(); if(G.over) return;
  checkWin(); if(G.over) return;
  // 칼데라: DOOM 100% 도달 시 마을(village) 안이면 대분화 절정 모드 진입
  if(G.doom>=100 && G.islandId==='caldera' && !G.calderaFinale && G.doomPhase>=4){
    if(G.tiles[G.pos]?.id==='village'){
      G.calderaFinale=true;
      G.calderaFinaleDays=0;
      G.doom=99; // 즉사 방지
      log('🏘️ 대분화! 마을이 버텨주고 있다. 5일을 버텨라!','danger');
      render(); saveGame(); return;
    }
    // village 밖이면 정상 doom 사망으로 처리
  }
  // DOOM 100% → 복권으로 대체 (caldera village 없는 경우 포함)
  if(G.doom>=100 && G.doomPhase>=4){
    showDoomLottery(); return;
  }
  // 스킬 패시브: 완벽한 수면
  if(allCards().some(c=>c.id==='sk_sl_g')){
    addCard('good_sleep',1);
    log('✨ 완벽한 수면: 꿀잠 카드 추가 (이벤트 면역)','success');
    render(); saveGame(); return;
  }
  if(Math.random()*100<calcSleepEvtChance(early)) showSleepEvt();
  else {
    const inCamp=G.camps.includes(G.pos);
    if(inCamp){
      const fatigueCards=[...G.deck.filter(c=>c.id==='fatigue'),...G.disc.filter(c=>c.id==='fatigue')];
      if(fatigueCards.length>=2&&Math.random()<0.5){
        // 피로 회복: 피로 1장 제거 (꿀잠 없음)
        const removeFrom=G.deck.findIndex(c=>c.id==='fatigue')>=0?G.deck:G.disc;
        const fi=removeFrom.findIndex(c=>c.id==='fatigue');
        if(fi>=0) removeFrom.splice(fi,1);
        log(`💤 캠프에서 충분히 쉬었다. 피로 1장 제거 (${fatigueCards.length-1}장 남음)`,'success');
      } else {
        addCard('good_sleep',1);
        log('😪 캠프에서 숙면: 꿀잠 카드 추가','success');
        // 모닥불의 온기 패시브
        if(allCards().some(c=>c.id==='sk_cp_s3')){
          addCard('good_sleep',1);
          log('🔥 모닥불의 온기: 꿀잠 카드 추가','success');
        }
      }
    }
    render(); saveGame();
  }
}

function _showDoomModal(title,story,detail,cb){
  document.getElementById('doom-title').textContent=title;
  document.getElementById('doom-story').textContent=story;
  document.getElementById('doom-detail').textContent=detail;
  document.getElementById('doom-pbar').style.width=Math.min(100,G.doom)+'%';
  document.getElementById('doom-pct2').textContent=G.doom;
  document.getElementById('doom-rate2').textContent=
    G.doomPhase>=5?'(매 취침 생사 복권)':G.doomPhase>=4?'(매 취침 +2~3%)':G.doomRate>0?`(매 취침 +${G.doomRate}%)`:'';
  document.getElementById('doom-ok').onclick=()=>{
    document.getElementById('doom-ev-mo').style.display='none';
    if(cb) cb();
  };
  document.getElementById('doom-ev-mo').style.display='flex';
  render();
}

function calcSleepEvtChance(early){
  let c;
  if(!G.camps.length){
    c=early?20:50;
  } else {
    const minD=Math.min(...G.camps.map(cp=>tileDist(cp,G.pos)));
    if(minD===0)      c=0;
    else if(minD===1) c=early?3:5;
    else if(minD===2) c=early?5:10;
    else              c=early?5+(minD-2)*5:10+(minD-2)*8;
  }
  const stN=allCards().filter(c=>c.tag==='status'&&c.id!=='rotten_food').length;
  c+=stN*6;
  if(G.hp<40) c+=10; if(G.hun<30) c+=8; if(G.thi<30) c+=8; if(G.ap<=2) c+=4;
  // 스킬 패시브 (count 기반)
  const _slBCnt=allCards().filter(c=>c.id==='sk_sl_b').length;
  const _cpS2Cnt=allCards().filter(c=>c.id==='sk_cp_s2').length;
  c-=15*_slBCnt;
  const inCamp=G.camps.includes(G.pos);
  if(inCamp&&_cpS2Cnt) c=0;
  // 균사늪 캠프: 취침이벤트 확률 -5%
  const curTile=G.tiles&&G.tiles[G.pos];
  if(inCamp&&G.islandId==='mycelium'&&curTile&&curTile.id==='swamp') c=Math.max(0,c-5);
  return Math.min(Math.max(c,0),80);
}

function showRaftLottery(){
  const deck5=shuffle(['great','ok','ok','ok','fail']);
  document.getElementById('se-ok').textContent='확인 →';
  document.getElementById('se-ok').onclick=null;
  document.getElementById('se-title').textContent='🛶 뗏목 부품 제작 — 뽑기!';
  document.getElementById('se-flavor').textContent='부품을 조립하다 보니 결과가 어떻게 될지 알 수 없다. 5장 중 1장을 선택하라.';
  document.getElementById('se-hint').textContent='대성공(1): 탈출+30%+잔해 | 성공(3): 탈출+15%+잔해 | 실패(1): 탈출-10%·잔해 제거';
  document.getElementById('se-result').textContent='';
  document.getElementById('se-ok').style.display='none';
  const cardsEl=document.getElementById('se-cards'); cardsEl.innerHTML='';
  deck5.forEach(type=>{
    const div=document.createElement('div'); div.className='sc';
    div.dataset.type=type; div.onclick=()=>revealRaft(div,type);
    cardsEl.appendChild(div);
  });
  document.getElementById('se-mo').style.display='flex';
}

function revealRaft(el, type){
  if(el.classList.contains('revealed')||el.classList.contains('sc-flipping')) return;
  document.querySelectorAll('.sc:not(.revealed)').forEach(c=>c.onclick=null);
  const suspense=G.escape>=70;
  const fullMs=suspense?1800:350, halfMs=Math.floor(fullMs/2);
  el.classList.add('sc-flipping');
  if(suspense) el.classList.add('sc-slow');
  setTimeout(()=>{
    el.classList.add('revealed');
    if(type==='great'){ el.classList.add('sc-ok'); el.textContent='🌟'; }
    else if(type==='ok'){ el.classList.add('sc-ok'); el.textContent='✅'; }
    else { el.classList.add('sc-fail'); el.textContent='💥'; }
  }, halfMs);
  setTimeout(()=>{
    el.classList.remove('sc-flipping','sc-slow');
    const resEl=document.getElementById('se-result');
    const escBefore=G.escape;
    G.raftTry=(G.raftTry||0)+1;
    if(type==='great'){
      G.escape=Math.min(100,G.escape+30);
      G.raftGreat=(G.raftGreat||0)+1;
      addCard('debris',1);
      resEl.style.color='var(--accent)'; resEl.textContent='★ 대성공! 뛰어난 부품 완성. 탈출도 +30% (잔해 +1)';
      log('🛶 뗏목 제작 대성공! 탈출도+30%, 잔해 카드 추가','success');
    } else if(type==='ok'){
      G.escape=Math.min(100,G.escape+15);
      addCard('debris',1);
      resEl.style.color='var(--green)'; resEl.textContent='✓ 성공. 괜찮은 부품 완성. 탈출도 +15% (잔해 +1)';
      log('🛶 뗏목 제작 성공. 탈출도+15%, 잔해 카드 추가','success');
    } else {
      G.escape=Math.max(0,G.escape-10);
      G.raftFail=(G.raftFail||0)+1;
      if(G.raftFail>=3&&typeof tryUnlockMid==='function') tryUnlockMid('ach_raft_fail3');
      let di=G.disc.findIndex(c=>c.id==='debris');
      if(di>=0){G.disc.splice(di,1);log('🪨 잔해 카드 1장 소멸','');}
      else{di=G.deck.findIndex(c=>c.id==='debris');if(di>=0){G.deck.splice(di,1);log('🪨 잔해 카드 1장 소멸','');}}
      resEl.style.color='var(--red)'; resEl.textContent='✗ 실패. 부품이 망가졌다. 탈출도 -10% (잔해 제거)';
      log('🛶 뗏목 제작 실패. 탈출도-10%','danger');
    }
    if(G.escape!==escBefore) notifyEscapeChange(escBefore,G.escape,'뗏목 제작');
    document.getElementById('se-ok').style.display='';
    document.getElementById('se-ok').onclick=()=>closeSleepEvt();
    checkWin(); render();
  }, fullMs);
}

function showDoomLottery(){
  const survN=Math.max(0,4-G.doomSurvives);
  const dieN=Math.min(5,1+G.doomSurvives);
  const deck5=shuffle([...Array(survN).fill('survive'),...Array(dieN).fill('death')]);
  document.getElementById('se-ok').textContent='다음날로 →';
  document.getElementById('se-ok').onclick=null;
  document.getElementById('se-title').textContent='🌫️ 망각의 문턱';
  document.getElementById('se-flavor').textContent=
    survN===0
      ?'기억이 모두 사라졌다. 이름도, 고향도, 탈출 이유도 잊었다. 돌아갈 수 없다.'
      :'안개가 섬을 완전히 삼켰다. 의식이 흐릿하다. 5장 중 1장을 선택하라.';
  document.getElementById('se-hint').textContent=`생존 ${survN}장 · 죽음 ${dieN}장 (${G.doomSurvives}번 생존)`;
  document.getElementById('se-result').textContent='';
  document.getElementById('se-ok').style.display='none';
  const cardsEl=document.getElementById('se-cards'); cardsEl.innerHTML='';
  deck5.forEach(type=>{
    const div=document.createElement('div'); div.className='sc';
    div.dataset.type=type; div.onclick=()=>revealDoomLottery(div,type);
    cardsEl.appendChild(div);
  });
  document.getElementById('se-mo').style.display='flex';
}

function revealDoomLottery(el,type){
  if(el.classList.contains('revealed')||el.classList.contains('sc-flipping')) return;
  document.querySelectorAll('.sc:not(.revealed)').forEach(c=>c.onclick=null);
  el.classList.add('sc-flipping','sc-slow','sc-doom-pulse');
  setTimeout(()=>{
    el.classList.add('revealed');
    if(type==='survive'){ el.classList.add('sc-ok'); el.textContent='🌟'; }
    else { el.classList.add('sc-bad'); el.textContent='🌀'; }
  }, 900);
  setTimeout(()=>{
    el.classList.remove('sc-flipping','sc-slow','sc-doom-pulse');
    const resEl=document.getElementById('se-result');
    if(type==='survive'){
      G.doomSurvives++;
      const left=Math.max(0,4-G.doomSurvives);
      resEl.style.color='var(--green)';
      resEl.textContent=`✓ 기적적으로 살아남았다! 하지만 다음엔 더 어렵다. (생존카드 ${left}장 남음)`;
      log(`🌟 종말 복권: 생존! (생존카드 ${left}장 남음)`,'success');
      document.getElementById('se-ok').style.display='';
      document.getElementById('se-ok').onclick=()=>closeSleepEvt();
    } else {
      resEl.style.color='var(--red)';
      resEl.textContent='🌫️ 안개 속으로 사라졌다. 돌아오지 않았다.';
      log('🌀 망각 복권: 사망 — 섬의 안개에 흡수되어 사라졌다.','danger');
      document.getElementById('se-ok').textContent='사라지다...';
      document.getElementById('se-ok').onclick=()=>{
        document.getElementById('se-mo').style.display='none';
        triggerGameOver('🌫️ 망각의 안개에 흡수되었습니다.');
      };
      document.getElementById('se-ok').style.display='';
    }
    render();
  }, 1800);
}

function showSleepEvt(){
  const stN=allCards().filter(c=>c.tag==='status'&&c.id!=='rotten_food').length;
  const bad=(G.hp<40||G.hun<20||G.thi<20||G.ap<=2);
  let okN=3, failN=1, badN=1;
  if(stN>=2||bad){ okN=2; failN=1; badN=2; }
  if(stN>=4||(stN>=2&&bad)){ okN=1; failN=1; badN=3; }
  const deck5=shuffle([...Array(okN).fill('ok'),...Array(failN).fill('fail'),...Array(badN).fill('bad')]);
  document.getElementById('se-ok').textContent='다음날로 →';
  document.getElementById('se-ok').onclick=null;
  document.getElementById('se-title').textContent='🌙 취침 이벤트';
  document.getElementById('se-flavor').textContent=
    !G.camps.length
      ?'아무 곳에나 눕자 불안함이 엄습한다. 잠을 잘 잘 수 있을까?'
      :'오늘 하루가 무거웠다. 잠자리에 드는 순간 여러 생각이 밀려온다.';
  document.getElementById('se-hint').textContent=`덱 상태: 성공${okN} 실패${failN} 대실패${badN} (5장 중 1장 선택)`;
  document.getElementById('se-result').textContent='';
  document.getElementById('se-ok').style.display='none';
  const cardsEl=document.getElementById('se-cards'); cardsEl.innerHTML='';
  deck5.forEach(type=>{
    const div=document.createElement('div'); div.className='sc';
    div.dataset.type=type; div.onclick=()=>revealSC(div,type);
    cardsEl.appendChild(div);
  });
  document.getElementById('se-mo').style.display='flex';
}

function revealSC(el, type){
  if(el.classList.contains('revealed')||el.classList.contains('sc-flipping')) return;
  document.querySelectorAll('.sc:not(.revealed)').forEach(c=>c.onclick=null);
  el.classList.add('sc-flipping');
  setTimeout(()=>{
    el.classList.add('revealed');
    if(type==='ok'){ el.classList.add('sc-ok'); el.textContent='😴'; }
    else if(type==='fail'){ el.classList.add('sc-fail'); el.textContent='😓'; }
    else { el.classList.add('sc-bad'); el.textContent='💀'; }
  }, 175);
  setTimeout(()=>{
    el.classList.remove('sc-flipping');
    const resEl=document.getElementById('se-result');
    if(type==='ok'){
      resEl.style.color='var(--green)';
      resEl.textContent='✓ 꿀잠! 회복 카드가 덱에 추가됐다.';
      addCard('good_sleep',1);
      log('😴 취침이벤트: 꿀잠 — 😪꿀잠 카드 추가','success');
    } else if(type==='fail'){
      resEl.style.color='var(--red)';
      resEl.textContent='✗ 잠을 설쳤다. AP -2.';
      G.ap=Math.max(1,G.ap-2);
      log('😓 취침이벤트: 잠설침 — AP-2','danger');
    } else {
      resEl.style.color='var(--red)';
      resEl.textContent='💀 악몽에 시달렸다! 피로 카드가 덱에 추가됐다.';
      addCard('fatigue',1);
      log('💀 취침이벤트: 악몽 — 피로카드 추가','danger');
    }
    document.getElementById('se-ok').style.display='';
    document.getElementById('se-ok').onclick=()=>closeSleepEvt();
  }, 350);
}

function closeSleepEvt(){
  document.getElementById('se-mo').style.display='none';
  checkSurvival(); checkWin(); render();
  saveGame();
}
