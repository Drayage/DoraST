// ═══════════════ SLEEP ═══════════════

function doSleep(){
  if(G.over) return;
  const early=G.ap>=4;
  G.day++; G.doom+=G.day>5?Math.min(12,G.day-3):2;
  let hpR=early?15:9, sanR=early?11:6;
  G.camps.forEach(cp=>{
    const t=G.tiles[cp];
    if(t.id==='cave')   { sanR+=5; }
    if(t.id==='forest') { addCard('food',1); log('🌲 숲캠프: 식량 자동생성','success'); }
    if(t.id==='shore')  { addCard('water',1); log('🌊 해안캠프: 물 자동생성','success'); }
  });
  const fatigueN=[...G.deck,...G.disc].filter(c=>c.id==='fatigue').length;
  G.hun=Math.max(0,G.hun-14); G.thi=Math.max(0,G.thi-18);
  const poisonN=[...G.deck,...G.disc].filter(c=>c.id==='poison_status').length;
  if(poisonN>0){ G.hp=Math.max(0,G.hp-5*poisonN); log(`☠️ 중독 피해: HP-${5*poisonN}`,'danger'); }
  G.hp=Math.min(100,G.hp+hpR); G.san=Math.min(100,G.san+sanR);
  const bonAP=early?2:0;
  G.weather=G.tomorrow;
  G.tomorrow=WEATHER[Math.floor(Math.random()*WEATHER.length)];
  G.ap=Math.max(1,G.maxAP+bonAP-fatigueN*2);
  applyWeather();
  if(G.day>5){
    const fog=G.tiles.filter((t,i)=>t.revealed&&!t.hasCamp&&i!==G.pos);
    const n=Math.floor(fog.length*.08);
    for(let i=0;i<n;i++){const idx=Math.floor(Math.random()*fog.length);const ti=G.tiles.indexOf(fog[idx]);if(ti>=0)G.tiles[ti].revealed=false;fog.splice(idx,1);}
  }
  drawCards(2);
  log(`🌙 ${G.day-1}일→${G.day}일. HP+${hpR} 정신력+${sanR}${bonAP?` 이른취침AP+${bonAP}`:''}${fatigueN?` 피로AP-${fatigueN*2}`:''}`, 'important');
  if(Math.random()*100<calcSleepEvtChance(early)){
    showSleepEvt();
  } else {
    checkSurvival(); checkWin(); render();
  }
}

function calcSleepEvtChance(early){
  if(early) return 8;
  let c=15;
  if(!G.camps.length){
    c+=40;
  } else {
    const minD=Math.min(...G.camps.map(cp=>{
      return Math.abs(Math.floor(cp/10)-Math.floor(G.pos/10))+Math.abs((cp%10)-(G.pos%10));
    }));
    c+=minD*5;
  }
  const stN=[...G.deck,...G.disc].filter(c=>c.tag==='status').length;
  c+=stN*6;
  if(G.hp<40) c+=10; if(G.hun<30) c+=8; if(G.thi<30) c+=8; if(G.ap<=2) c+=5;
  return Math.min(c,95);
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
  document.getElementById('se-title').textContent='🛶 뗏목 부품 제작 — 뽑기!';
  document.getElementById('se-flavor').textContent='부품을 조립하다 보니 결과가 어떻게 될지 알 수 없다. 5장 중 1장을 선택하라.';
  document.getElementById('se-hint').textContent='대성공(1): 탈출+30% | 성공(3): 탈출+15% | 실패(1): 탈출-10%';
  document.getElementById('se-result').textContent='';
  document.getElementById('se-ok').style.display='none';
  const cardsEl=document.getElementById('se-cards'); cardsEl.innerHTML='';
  deck5.forEach(type=>{
    const div=document.createElement('div'); div.className='sc';
    div.dataset.type=type;
    div.onclick=()=>revealRaft(div,type);
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

function showSleepEvt(){
  const stN=[...G.deck,...G.disc].filter(c=>c.tag==='status').length;
  const bad=(G.hp<40||G.hun<20||G.thi<20||G.ap<=2);
  let okN=3, failN=1, badN=1;
  if(stN>=2||bad){ okN=2; failN=1; badN=2; }
  if(stN>=4||(stN>=2&&bad)){ okN=1; failN=1; badN=3; }
  const deck5=shuffle([...Array(okN).fill('ok'),...Array(failN).fill('fail'),...Array(badN).fill('bad')]);
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
