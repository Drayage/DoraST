// ═══════════════ SLEEP ═══════════════

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

function doSleep(){
  if(G.over) return;
  const early=G.ap>=4;
  G.day++;

  let hpR=early?15:9, sanR=early?4:2;
  if(G.doomPhase===4){ hpR=Math.max(0,hpR-4); sanR=Math.max(0,sanR-2); }

  let ruinsBonusAP=0;
  G.camps.forEach(cp=>{
    const t=G.tiles[cp];
    if(t.id==='cave')   { sanR+=3; }
    if(t.id==='forest') { addCard('berry',1); log('🌲 숲캠프: 작은 열매 자동생성 🍒','success'); }
    if(t.id==='shore')  { addCard('dew',1);   log('🌊 해안캠프: 맺힌이슬 자동생성 💦','success'); }
    if(t.id==='ruins')  { ruinsBonusAP+=1; log('🏚️ 폐허캠프: AP+1','success'); }
  });
  const fatigueN=allCards().filter(c=>c.id==='fatigue').length;
  G.hun=Math.max(0,G.hun-14); G.thi=Math.max(0,G.thi-18);
  const poisonN=allCards().filter(c=>c.id==='poison_status').length;
  if(poisonN>0){ G.hp=Math.max(0,G.hp-5*poisonN); log(`☠️ 중독 피해: HP-${5*poisonN}`,'danger'); }
  G.hp=Math.min(100,G.hp+hpR);
  const doomSanExtra=G.doomPhase>=4?Math.floor((G.doom-79)/6):0;
  const sanDrain=(G.camps.length?2:5)+doomSanExtra;
  G.san=Math.min(100,Math.max(0,G.san+sanR-sanDrain));
  const bonAP=early?2:0;
  G.weather=G.tomorrow;
  G.tomorrow=WEATHER[Math.floor(Math.random()*WEATHER.length)];
  G.ap=Math.max(1,G.maxAP+bonAP+ruinsBonusAP-fatigueN*2);
  applyWeather();
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

  const sanNet=sanR-sanDrain;
  const _di=(ISLANDS[G.islandId]||ISLANDS.mangrove).doomIcon||'🌫️';
  const doomHint=G.doomRate>0?` | ${_di}DOOM+${G.doomRate}/일(${G.doom}%)`:G.doomPhase>=4?` | ${_di}DOOM ${G.doom}%`:'';
  log(`🌙 ${G.day-1}일→${G.day}일. HP+${hpR} 정신력${sanNet>=0?'+':''}${sanNet}${bonAP?` 이른취침AP+${bonAP}`:''}${ruinsBonusAP?` 폐허캠프AP+${ruinsBonusAP}`:''}${fatigueN?` 피로AP-${fatigueN*2}`:''}${doomHint}`,'important');

  _processDoom(early);
}

function _processDoom(early){
  const _di=(ISLANDS[G.islandId]||ISLANDS.mangrove).doomIcon||'🌫️';
  // 스토리 이벤트 확인
  const storyEvt=DOOM_STORY.find(e=>e.phase===G.doomPhase&&(e.minDay===undefined||G.day>=e.minDay));
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

  // 망각 단계 (80%+)
  if(G.doomPhase===4){
    const add=2+Math.floor(Math.random()*2);
    G.doom=Math.min(100,G.doom+add);
    const fl=DOOM_ENDGAME_FL[Math.floor(Math.random()*DOOM_ENDGAME_FL.length)];
    G.hp=Math.max(0,G.hp-fl.hpPen); G.san=Math.max(0,G.san-fl.sanPen);
    if(fl.hpPen>0) flashDamage();
    if(G.san<50&&Math.random()*100<(40-G.san*0.5)){
      addCard('amnesia',1);
      log('🌀 잠결에 환각이 스며들었다. 망각 카드가 덱에 추가됐다.','danger');
    }
    log(`${_di} ${fl.txt} 정신력-${fl.sanPen}${fl.hpPen>0?` HP-${fl.hpPen}`:''}  DOOM+${add}(${G.doom}%)`,'danger');
    if(G.doom>=100){
      G.doomPhase=5; // 반복 모달 방지
      checkSurvival(); if(G.over) return;
      _showDoomModal('🌫️ 완전한 망각',fl.txt+'\n\n안개가 100%에 도달했다.\n이제 탈출 의지 자체가 흐릿해진다.\n다음 취침부터 생사의 복권이 시작된다.',`DOOM ${G.doom}%`,()=>_afterDoom(early));
      return;
    }
    _showDoomModal('🌫️ 망각의 진행',fl.txt+`\n\n정신력 -${fl.sanPen}${fl.hpPen>0?` · 체력 -${fl.hpPen}`:''}`,`종말 +${add}% → ${G.doom}%`,()=>_afterDoom(early));
    return;
  }
  _afterDoom(early);
}

function _afterDoom(early){
  checkSurvival(); if(G.over) return;
  checkWin(); if(G.over) return;
  // DOOM 100% → 복권으로 대체
  if(G.doom>=100 && G.doomPhase>=4){
    showDoomLottery(); return;
  }
  if(Math.random()*100<calcSleepEvtChance(early)) showSleepEvt();
  else render();
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
  const stN=allCards().filter(c=>c.tag==='status').length;
  c+=stN*6;
  if(G.hp<40) c+=10; if(G.hun<30) c+=8; if(G.thi<30) c+=8; if(G.ap<=2) c+=4;
  return Math.min(c,80);
}

function applyWeather(){
  const w=G.weather;
  if(!w.eff){log(`${w.icon} 날씨: ${w.name}`,'');return;}
  const [s,v]=w.eff.split('_'); const val=parseInt(v);
  const pos=val>0; const sign=pos?'+':'';
  if(s==='ap') { G.ap=Math.max(0,G.ap+val); log(`${w.icon} ${w.name}: AP${sign}${val}`,pos?'':'danger'); }
  else if(s==='thi'){ G.thi=Math.min(100,Math.max(0,G.thi+val)); log(`${w.icon} ${w.name}: 갈증${sign}${val}`,pos?'success':'danger'); }
  else if(s==='san'){ G.san=Math.min(100,Math.max(0,G.san+val)); log(`${w.icon} ${w.name}: 정신력${sign}${val}`,pos?'success':'danger'); }
  else if(s==='hp') { G.hp=Math.max(0,G.hp+val); log(`${w.icon} ${w.name}: HP${sign}${val}`,'danger'); }
  else               log(`${w.icon} ${w.name}: 안개`,'danger');
}

function showRaftLottery(){
  const deck5=shuffle(['great','ok','ok','ok','fail']);
  document.getElementById('se-ok').textContent='확인 →';
  document.getElementById('se-ok').onclick=null;
  document.getElementById('se-title').textContent='🛶 뗏목 부품 제작 — 뽑기!';
  document.getElementById('se-flavor').textContent='부품을 조립하다 보니 결과가 어떻게 될지 알 수 없다. 5장 중 1장을 선택하라.';
  document.getElementById('se-hint').textContent='대성공(1): 탈출+30% | 성공(3): 탈출+15% | 실패(1): 탈출-10%';
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
      resEl.style.color='var(--accent)'; resEl.textContent='★ 대성공! 뛰어난 부품 완성. 탈출도 +30%';
      log('🛶 뗏목 제작 대성공! 탈출도+30%','success');
    } else if(type==='ok'){
      G.escape=Math.min(100,G.escape+15);
      resEl.style.color='var(--green)'; resEl.textContent='✓ 성공. 괜찮은 부품 완성. 탈출도 +15%';
      log('🛶 뗏목 제작 성공. 탈출도+15%','success');
    } else {
      G.escape=Math.max(0,G.escape-10);
      G.raftFail=(G.raftFail||0)+1;
      resEl.style.color='var(--red)'; resEl.textContent='✗ 실패. 부품이 망가졌다. 탈출도 -10%';
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
  const stN=allCards().filter(c=>c.tag==='status').length;
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
      resEl.textContent='✓ 푹 잤다! 덱의 상태이상 카드 1장이 사라졌다.';
      rmStatusCard();
      log('😴 취침이벤트: 숙면 — 상태이상 1장 제거','success');
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

function rmStatusCard(){
  let i=G.disc.findIndex(c=>c.tag==='status');
  if(i>=0){G.disc.splice(i,1);return;}
  i=G.deck.findIndex(c=>c.tag==='status');
  if(i>=0) G.deck.splice(i,1);
}

function closeSleepEvt(){
  document.getElementById('se-mo').style.display='none';
  checkSurvival(); checkWin(); render();
}
