// ═══════════════ SLEEP ═══════════════

// ── 화산 종말 시나리오 ──
const DOOM_STORY=[
  {phase:0,
   title:'🌋 불길한 진동',
   story:'첫 번째 밤, 묵직한 울림이 섬 전체를 흔들었다.\n눈을 떠보니 모래사장에 선명한 균열이 생겨 있었다.\n\n섬 중앙을 바라보니 열기 섞인 연기가 피어오르고 있었다.\n\n이 섬은... 화산섬이었다.',
   detail:'종말 진행도 +1% → 이후 매 취침마다 +2% 증가',
   doomAdd:1,rateAfter:2,nextPhase:1},
  {phase:1,minDay:6,
   title:'🔥 화산의 눈뜸',
   story:'섬 중앙에서 검은 연기 기둥이 솟구쳤다.\n\n땅이 뜨거워지고, 나무들이 시들어간다.\n발밑에서 열기가 올라오는 게 느껴진다.\n\n화산이 깨어났다. 더 이상 망설일 시간이 없다.',
   detail:'종말 진행도 +15% → 이후 매 취침마다 +3% 증가',
   doomAdd:15,rateAfter:3,nextPhase:2},
  {phase:2,minDay:11,
   title:'🌊 마그마의 전진',
   story:'동쪽 절벽에서 붉은 마그마가 쏟아져 내렸다.\n해안선의 바닷물이 끓어오르고\n유황 냄새가 폐부를 찌른다.\n\n섬의 절반이 이미 불길에 잠식되고 있다.',
   detail:'종말 진행도 +25% → 이후 매 취침마다 +4% 증가',
   doomAdd:25,rateAfter:4,nextPhase:3},
  {phase:3,minDay:16,
   title:'💥 분화 임박',
   story:'화산이 폭발했다.\n\n거대한 화염 기둥이 하늘을 찌르고\n화산재가 사방을 뒤덮었다.\n용암이 모든 것을 집어삼키며 흘러온다.\n\n지금 이 순간부터 — 매 순간이 생사의 갈림길이다.',
   detail:'종말 진행도 → 80% | 종말 단계: 매 취침 회복 감소·추가 피해',
   doomSet:80,rateAfter:0,nextPhase:4},
];

const DOOM_ENDGAME_FL=[
  {txt:'밤새 용암이 조금 더 가까워졌다. 열기에 잠을 설쳤다.',hpPen:3,sanPen:2},
  {txt:'화산재가 폐부를 찌른다. 밤새 기침이 멈추지 않았다.',hpPen:5,sanPen:3},
  {txt:'지열로 인해 잠자리가 뜨거웠다. 충분히 회복하지 못했다.',hpPen:2,sanPen:4},
  {txt:'폭발음이 귀를 찢었다. 공포에 잠들기 어려웠다.',hpPen:2,sanPen:5},
  {txt:'용암 전선이 5미터 더 가까워졌다.',hpPen:4,sanPen:2},
  {txt:'유황 가스가 진동한다. 눈과 목이 따갑다.',hpPen:6,sanPen:1},
];

function doSleep(){
  if(G.over) return;
  const early=G.ap>=4;
  G.day++;

  let hpR=early?15:9, sanR=early?4:2;
  if(G.doomPhase===4){ hpR=Math.max(0,hpR-4); sanR=Math.max(0,sanR-2); }

  G.camps.forEach(cp=>{
    const t=G.tiles[cp];
    if(t.id==='cave')   { sanR+=5; }
    if(t.id==='forest') { addCard('food',1); log('🌲 숲캠프: 식량 자동생성','success'); }
    if(t.id==='shore')  { addCard('water',1); log('🌊 해안캠프: 물 자동생성','success'); }
    if(t.id==='ruins')  { G.ap=Math.min(G.maxAP+4,G.ap+1); log('🏚️ 폐허캠프: AP+1','success'); }
  });
  const fatigueN=allCards().filter(c=>c.id==='fatigue').length;
  G.hun=Math.max(0,G.hun-14); G.thi=Math.max(0,G.thi-18);
  const poisonN=allCards().filter(c=>c.id==='poison_status').length;
  if(poisonN>0){ G.hp=Math.max(0,G.hp-5*poisonN); log(`☠️ 중독 피해: HP-${5*poisonN}`,'danger'); }
  G.hp=Math.min(100,G.hp+hpR);
  const sanDrain=G.camps.length?2:5;
  G.san=Math.min(100,Math.max(0,G.san+sanR-sanDrain));
  const bonAP=early?2:0;
  G.weather=G.tomorrow;
  G.tomorrow=WEATHER[Math.floor(Math.random()*WEATHER.length)];
  G.ap=Math.max(1,G.maxAP+bonAP-fatigueN*2);
  applyWeather();
  if(G.day>5){
    const fog=G.tiles.filter((t,i)=>{
      if(!t.revealed||t.hasCamp||i===G.pos) return false;
      const dr=Math.abs(Math.floor(i/10)-Math.floor(G.pos/10));
      const dc=Math.abs((i%10)-(G.pos%10));
      return dr+dc>1;
    });
    const n=Math.floor(fog.length*.08);
    for(let i=0;i<n;i++){const idx=Math.floor(Math.random()*fog.length);const ti=G.tiles.indexOf(fog[idx]);if(ti>=0){G.tiles[ti].wasSeen=true;G.tiles[ti].revealed=false;}fog.splice(idx,1);}
  }
  G.deck=shuffle(G.deck.concat(G.disc)); G.disc=[];

  const sanNet=sanR-sanDrain;
  const doomHint=G.doomRate>0?` | 🌋DOOM+${G.doomRate}/일(${G.doom}%)`:G.doomPhase>=4?` | 🌋DOOM ${G.doom}%`:'';
  log(`🌙 ${G.day-1}일→${G.day}일. HP+${hpR} 정신력${sanNet>=0?'+':''}${sanNet}${bonAP?` 이른취침AP+${bonAP}`:''}${fatigueN?` 피로AP-${fatigueN*2}`:''}${doomHint}`,'important');

  _processDoom(early);
}

function _processDoom(early){
  // 스토리 이벤트 확인
  const storyEvt=DOOM_STORY.find(e=>e.phase===G.doomPhase&&(e.minDay===undefined||G.day>=e.minDay));
  if(storyEvt){
    if(storyEvt.doomSet!==undefined) G.doom=storyEvt.doomSet;
    else G.doom=Math.min(100,G.doom+(storyEvt.doomAdd||0));
    G.doomRate=storyEvt.rateAfter;
    G.doomPhase=storyEvt.nextPhase;
    log(`🌋 종말이벤트: ${storyEvt.title} — DOOM ${G.doom}%`,'danger');
    _showDoomModal(storyEvt.title,storyEvt.story,storyEvt.detail,()=>_afterDoom(early));
    return;
  }
  // 일일 수동 증가
  if(G.doomRate>0 && G.doomPhase<4) G.doom=Math.min(100,G.doom+G.doomRate);

  // 종말 단계 (80%+)
  if(G.doomPhase===4){
    const add=1+Math.floor(Math.random()*3);
    G.doom=Math.min(100,G.doom+add);
    const fl=DOOM_ENDGAME_FL[Math.floor(Math.random()*DOOM_ENDGAME_FL.length)];
    G.hp=Math.max(0,G.hp-fl.hpPen); G.san=Math.max(0,G.san-fl.sanPen);
    if(fl.hpPen>0) flashDamage();
    log(`🌋 ${fl.txt} HP-${fl.hpPen} 정신력-${fl.sanPen} DOOM+${add}(${G.doom}%)`,'danger');
    if(G.doom>=100){
      checkSurvival(); if(G.over) return;
      _showDoomModal('🌋 종말 임박',fl.txt+'\n\n종말 진행도가 100%에 도달했다.\n다음 취침부터 생사의 복권이 시작된다.',`DOOM ${G.doom}%`,()=>_afterDoom(early));
      return;
    }
    _showDoomModal('🌋 종말 진행',fl.txt+`\n\n체력 -${fl.hpPen} · 정신력 -${fl.sanPen}`,`종말 +${add}% → ${G.doom}%`,()=>_afterDoom(early));
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
    G.doomPhase>=4?'(매 취침 +1~3%)':G.doomRate>0?`(매 취침 +${G.doomRate}%)`:'';
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
  if(s==='ap') { G.ap=Math.max(0,G.ap+val);  log(`${w.icon} ${w.name}: AP${val}`,'danger'); }
  else if(s==='thi'){ G.thi=Math.max(0,G.thi+val); log(`${w.icon} ${w.name}: 갈증${val}`,'danger'); }
  else if(s==='hp') { G.hp=Math.max(0,G.hp+val);   log(`${w.icon} ${w.name}: HP${val}`,'danger'); }
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
  if(el.classList.contains('revealed')) return;
  document.querySelectorAll('.sc:not(.revealed)').forEach(c=>c.onclick=null);
  el.classList.add('revealed');
  const resEl=document.getElementById('se-result');
  if(type==='great'){
    el.classList.add('sc-ok'); el.textContent='🌟';
    G.escape=Math.min(100,G.escape+30);
    resEl.style.color='var(--accent)';
    resEl.textContent='★ 대성공! 뛰어난 부품 완성. 탈출도 +30%';
    log('🛶 뗏목 제작 대성공! 탈출도+30%','success');
  } else if(type==='ok'){
    el.classList.add('sc-ok'); el.textContent='✅';
    G.escape=Math.min(100,G.escape+15);
    resEl.style.color='var(--green)';
    resEl.textContent='✓ 성공. 괜찮은 부품 완성. 탈출도 +15%';
    log('🛶 뗏목 제작 성공. 탈출도+15%','success');
  } else {
    el.classList.add('sc-fail'); el.textContent='💥';
    G.escape=Math.max(0,G.escape-10);
    resEl.style.color='var(--red)';
    resEl.textContent='✗ 실패. 부품이 망가졌다. 탈출도 -10%';
    log('🛶 뗏목 제작 실패. 탈출도-10%','danger');
  }
  document.getElementById('se-ok').style.display='';
  checkWin(); render();
}

function showDoomLottery(){
  const survN=Math.max(0,4-G.doomSurvives);
  const dieN=Math.min(5,1+G.doomSurvives);
  const deck5=shuffle([...Array(survN).fill('survive'),...Array(dieN).fill('death')]);
  document.getElementById('se-ok').textContent='다음날로 →';
  document.getElementById('se-ok').onclick=null;
  document.getElementById('se-title').textContent='🌋 최후의 불길';
  document.getElementById('se-flavor').textContent=
    survN===0
      ?'돌아올 수 없는 선을 넘었다. 이 불지옥에서 살아남을 방법이 없다.'
      :'섬이 거의 완전히 용암에 잠겼다. 5장 중 1장을 선택하라.';
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
  if(el.classList.contains('revealed')) return;
  document.querySelectorAll('.sc:not(.revealed)').forEach(c=>c.onclick=null);
  el.classList.add('revealed');
  const resEl=document.getElementById('se-result');
  if(type==='survive'){
    el.classList.add('sc-ok'); el.textContent='🌟';
    G.doomSurvives++;
    const left=Math.max(0,4-G.doomSurvives);
    resEl.style.color='var(--green)';
    resEl.textContent=`✓ 기적적으로 살아남았다! 하지만 다음엔 더 어렵다. (생존카드 ${left}장 남음)`;
    log(`🌟 종말 복권: 생존! (생존카드 ${left}장 남음)`,'success');
    document.getElementById('se-ok').style.display='';
  } else {
    el.classList.add('sc-bad'); el.textContent='💀';
    resEl.style.color='var(--red)';
    resEl.textContent='💀 용암이 모든 것을 삼켰다.';
    log('💀 종말 복권: 사망 — 화산에 의해 최후를 맞이했다.','danger');
    document.getElementById('se-ok').textContent='게임 오버';
    document.getElementById('se-ok').onclick=()=>{
      document.getElementById('se-mo').style.display='none';
      triggerGameOver('🌋 화산 폭발로 인해 섬이 완전히 소멸했습니다.');
    };
    document.getElementById('se-ok').style.display='';
  }
  render();
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
  if(el.classList.contains('revealed')) return;
  document.querySelectorAll('.sc:not(.revealed)').forEach(c=>c.onclick=null);
  el.classList.add('revealed');
  const resEl=document.getElementById('se-result');
  if(type==='ok'){
    el.classList.add('sc-ok'); el.textContent='😴';
    resEl.style.color='var(--green)';
    resEl.textContent='✓ 푹 잤다! 덱의 상태이상 카드 1장이 사라졌다.';
    rmStatusCard();
    log('😴 취침이벤트: 숙면 — 상태이상 1장 제거','success');
  } else if(type==='fail'){
    el.classList.add('sc-fail'); el.textContent='😓';
    resEl.style.color='var(--red)';
    resEl.textContent='✗ 잠을 설쳤다. AP -2.';
    G.ap=Math.max(1,G.ap-2);
    log('😓 취침이벤트: 잠설침 — AP-2','danger');
  } else {
    el.classList.add('sc-bad'); el.textContent='💀';
    resEl.style.color='var(--red)';
    resEl.textContent='💀 악몽에 시달렸다! 피로 카드가 덱에 추가됐다.';
    addCard('fatigue',1);
    log('💀 취침이벤트: 악몽 — 피로카드 추가','danger');
  }
  document.getElementById('se-ok').style.display='';
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
