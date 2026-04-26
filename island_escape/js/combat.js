// ═══════════════ COMBAT ═══════════════
// [버그수정] 창 관통 방어무시 구현 / 뱀·박쥐 패널티 적용 / 유령 패널티는 패배 시에만

function drawCombatHand(){ return drawToHand(5); }

function startCombat(evtId){
  const enemy=ENEMIES[evtId];
  CBT={enemy:{...enemy,curHp:enemy.hp},hand:[],atkZone:[],defZone:[],resolved:false,turn:1,stunned:false,poisoned:false};
  CBT.hand=drawCombatHand(); _cbtMode=null;
  ['btn-cbt-resolve','btn-cbt-flee'].forEach(id=>document.getElementById(id).style.display='');
  document.getElementById('btn-cbt-close').style.display='none';
  document.getElementById('cbt-res').style.display='none';
  document.getElementById('cbt-mo').style.display='flex';
  renderCombat();
  log(`⚔️ ${enemy.name} 출현! 전투 시작.`,'danger');
}

function setCbtMode(m){
  _cbtMode=m;
  document.getElementById('btn-matk').style.background=m==='atk'?'rgba(224,80,80,.2)':'';
  document.getElementById('btn-mdef').style.background=m==='def'?'rgba(74,144,212,.2)':'';
}

function smartAssign(){
  CBT.atkZone=[]; CBT.defZone=[];
  CBT.hand.forEach(c=>{
    if(c.atk>0&&c.def<=0)      CBT.atkZone.push(c);
    else if(c.def>0&&c.atk<=0) CBT.defZone.push(c);
    else if(c.atk>0)           CBT.atkZone.push(c);
  });
  renderCombat();
}

function clearAssign(){ CBT.atkZone=[]; CBT.defZone=[]; renderCombat(); }

function cbtCardClick(i){
  const c=CBT.hand[i]; if(!c) return;
  const inA=CBT.atkZone.some(x=>x.uid===c.uid);
  const inD=CBT.defZone.some(x=>x.uid===c.uid);
  if(inA||inD){
    CBT.atkZone=CBT.atkZone.filter(x=>x.uid!==c.uid);
    CBT.defZone=CBT.defZone.filter(x=>x.uid!==c.uid);
    renderCombat(); return;
  }
  if(_cbtMode==='atk'){ CBT.atkZone.push(c); renderCombat(); return; }
  if(_cbtMode==='def'){ CBT.defZone.push(c); renderCombat(); return; }
  // 팝업
  const ep=document.getElementById('cbt-popup'); if(ep) ep.remove();
  const pop=document.createElement('div'); pop.id='cbt-popup';
  pop.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--bg2);border:1px solid var(--border2);border-radius:9px;padding:13px;z-index:300;min-width:200px;text-align:center;';
  pop.innerHTML=`<div style="font-size:22px;">${c.icon}</div>
    <div style="font-family:var(--font-t);font-size:14px;margin:4px 0;">${c.name}</div>
    <div style="font-size:8px;color:var(--text3);font-family:var(--font-m);margin-bottom:9px;">ATK${c.atk} DEF${c.def} [${c.tag}]${c.cbtFx?`<br><span style="color:var(--blue)">★${c.cbtFx}</span>`:''}</div>
    <div style="display:flex;gap:6px;justify-content:center;">
      <button class="btn" style="color:var(--red);border-color:var(--red2);" onclick="assignCard(${i},'atk')">⚔️ 공격</button>
      <button class="btn" style="color:var(--blue);border-color:var(--blue2);" onclick="assignCard(${i},'def')">🛡️ 방어</button>
      <button class="btn" onclick="document.getElementById('cbt-popup').remove()">취소</button>
    </div>`;
  document.body.appendChild(pop);
}

function assignCard(i, zone){
  const pop=document.getElementById('cbt-popup'); if(pop) pop.remove();
  const c=CBT.hand[i]; if(!c) return;
  CBT.atkZone=CBT.atkZone.filter(x=>x.uid!==c.uid);
  CBT.defZone=CBT.defZone.filter(x=>x.uid!==c.uid);
  if(zone==='atk') CBT.atkZone.push(c); else CBT.defZone.push(c);
  renderCombat();
}

function renderCombat(){
  const e=CBT.enemy;
  document.getElementById('cbt-title').textContent=`⚔️ ${e.name} 출현!`;
  document.getElementById('cbt-sub').textContent=`라운드${CBT.turn} | 적 다음행동: ${CBT.stunned?'기절(피해없음)':`공격-${e.atk}HP`}`;
  const phpEl=document.getElementById('cbt-php');
  phpEl.textContent=G.hp; phpEl.style.color=G.hp<30?'var(--red)':'var(--green)';
  const psanEl=document.getElementById('cbt-psan');
  psanEl.textContent=G.san; psanEl.style.color=G.san<30?'var(--red)':'var(--purple)';
  document.getElementById('cbt-eicon').textContent=e.icon;
  document.getElementById('cbt-ename').textContent=e.name;
  document.getElementById('cbt-ehp').textContent=Math.max(0,e.curHp);
  document.getElementById('cbt-emhp').textContent=e.hp;
  document.getElementById('cbt-ehpbar').style.width=Math.max(0,e.curHp/e.hp*100)+'%';
  document.getElementById('cbt-intent').textContent=CBT.stunned?'💫 기절':`💥 공격: ${e.atk}`;
  const aT=CBT.atkZone.reduce((s,c)=>s+Math.max(0,c.atk),0);
  const dT=CBT.defZone.reduce((s,c)=>s+Math.max(0,c.def),0);
  document.getElementById('atk-tot').textContent=aT;
  document.getElementById('def-tot').textContent=dT;
  renderZone('atk-zone',CBT.atkZone,'atk');
  renderZone('def-zone',CBT.defZone,'def');
  const hEl=document.getElementById('cbt-hand'); hEl.innerHTML='';
  CBT.hand.forEach((c,i)=>{
    const inA=CBT.atkZone.some(x=>x.uid===c.uid);
    const inD=CBT.defZone.some(x=>x.uid===c.uid);
    const div=document.createElement('div');
    div.className='c-card'+(inA?' a-atk':inD?' a-def':'');
    div.innerHTML=`<div style="font-size:16px;">${c.icon}</div><div style="font-size:7px;font-weight:700;margin:2px 0;">${c.name}</div><div style="font-size:6px;font-family:var(--font-m);color:var(--text3);">A${c.atk} D${c.def}</div><div class="card-tag tag-${c.tag}" style="font-size:5px;">${c.tag}</div>`;
    div.onclick=()=>cbtCardClick(i);
    div.addEventListener('mouseenter',()=>showTT(c,div));
    div.addEventListener('mouseleave',hideTT);
    hEl.appendChild(div);
  });
}

function renderZone(id, arr, t){
  const el=document.getElementById(id); el.innerHTML='';
  arr.forEach(c=>{
    const mc=document.createElement('span'); mc.className='mini-card';
    mc.innerHTML=`${c.icon} ${c.name} ${t==='atk'?`⚔️${Math.max(0,c.atk)}`:`🛡️${Math.max(0,c.def)}`}`;
    mc.onclick=()=>{ CBT.atkZone=CBT.atkZone.filter(x=>x.uid!==c.uid); CBT.defZone=CBT.defZone.filter(x=>x.uid!==c.uid); renderCombat(); };
    el.appendChild(mc);
  });
}

function resolveCombat(){
  const e=CBT.enemy;
  let pD=0, normalAtk=0, pierceAtk=0;
  const lines=[]; let stun=false, poisonApplied=false;
  const hasArmor=allCards().some(c=>c.id==='leather_armor');

  [...CBT.atkZone,...CBT.defZone].forEach(c=>{
    if(c.cbtFx==='pierce'&&CBT.atkZone.some(x=>x.uid===c.uid)){
      // 관통: 적 방어 완전무시 (별도 집계)
      pierceAtk+=c.atk+4;
      lines.push({t:`★ 창 관통: 방어무시 ATK${c.atk+4}`,cls:'good'});
    } else if(c.cbtFx==='block'&&CBT.defZone.some(x=>x.uid===c.uid)){
      pD+=c.def+5; lines.push({t:`★ 방패 완전방어+5`,cls:'good'});
    } else if(c.cbtFx==='stun'){
      stun=true; normalAtk+=c.atk+3; pD+=c.def;
      lines.push({t:`★ 함정: 기절+추가ATK3`,cls:'good'});
    } else if(c.cbtFx==='poison'&&CBT.atkZone.some(x=>x.uid===c.uid)){
      normalAtk+=c.atk; poisonApplied=true;
      lines.push({t:`★ 독칼: 독상태 부여(매라운드+3)`,cls:'good'});
    } else {
      if(CBT.atkZone.some(x=>x.uid===c.uid)) normalAtk+=Math.max(0,c.atk);
      if(CBT.defZone.some(x=>x.uid===c.uid)) pD+=Math.max(0,c.def);
    }
  });

  const poisonDmg=CBT.poisoned?3:0;
  if(CBT.poisoned) lines.push({t:`☠️ 독 지속피해: 적 -3`,cls:'good'});
  if(poisonApplied) CBT.poisoned=true;

  // 일반 공격은 적 방어를 뺌, 관통 공격은 방어 무시
  const dmgE=Math.max(0,normalAtk-e.def)+pierceAtk+poisonDmg;
  const eA=CBT.stunned?0:e.atk;
  let dmgP=Math.max(0,eA-pD);
  if(hasArmor&&dmgP>0){ dmgP=Math.max(0,dmgP-2); lines.push({t:`🧥 가죽갑옷: 피해-2`,cls:'good'}); }

  e.curHp=Math.max(0,e.curHp-dmgE);
  const prevHp=G.hp;
  G.hp=Math.max(0,G.hp-dmgP);
  if(dmgP>0) flashDamage();
  lines.unshift({t:`⚔️ 내공격: 일반${normalAtk}-방어${e.def}+관통${pierceAtk}+독${poisonDmg}=${dmgE}피해`,cls:'good'});
  lines.unshift({t:`🛡️ 내방어:${pD}${hasArmor?'(갑옷-2)':''}-적공격${eA}=${dmgP}피해`,cls:dmgP>0?'bad':'good'});
  CBT.stunned=stun;

  const resEl=document.getElementById('cbt-res');
  resEl.style.display='block';
  resEl.innerHTML=lines.map(l=>`<div class="rl ${l.cls}">${l.t}</div>`).join('');

  if(e.curHp<=0){
    // 승리 처리
    const rewardItems=[];
    if(e.reward?.cards){ e.reward.cards.forEach(r=>{ addCard(r.id,r.n); const d=CARD_MAP[r.id]; rewardItems.push({icon:d?.icon||'📦',name:d?.name||r.id,n:r.n}); }); }
    if(e.reward?.san){ G.san=Math.min(100,G.san+e.reward.san); }
    resEl.innerHTML+=`<div class="rl good" style="font-size:13px;margin-top:5px;">🏆 ${e.name} 처치!</div>`;
    resEl.innerHTML+=`<div class="rl good">💎 보상: ${e.rewardDesc}</div>`;
    G.kills++; CBT.resolved=true;
    log(`⚔️ ${e.name} 처치! 보상: ${e.rewardDesc}`,'success');
    document.getElementById('btn-cbt-resolve').style.display='none';
    document.getElementById('btn-cbt-flee').style.display='none';
    document.getElementById('btn-cbt-close').style.display='';
    if(rewardItems.length) showItemPopup(rewardItems,`🏆 ${e.name} 처치!`,null);
  } else if(G.hp<=0){
    // 패배 — 패널티 적용
    flashDamage();
    if(e.penalty){
      if(e.penalty.card){ addCard(e.penalty.card,1); log(`${e.penalty.desc||e.penalty.card+' 추가'}`, 'danger'); }
      if(e.penalty.san){ G.san=Math.max(0,G.san+e.penalty.san); log(`${e.penalty.desc||'정신력'+e.penalty.san}`, 'danger'); }
    }
    resEl.innerHTML+=`<div class="rl bad" style="margin-top:5px;">💀 사망...</div>`;
    document.getElementById('btn-cbt-resolve').style.display='none';
    document.getElementById('btn-cbt-flee').style.display='none';
    document.getElementById('btn-cbt-close').style.display=''; CBT.resolved=true;
  } else {
    // 피해를 입었을 때 패널티 (독사, 박쥐)
    if(dmgP>0&&e.penalty&&!CBT.penaltyApplied){
      CBT.penaltyApplied=true;
      if(e.penalty.card){ addCard(e.penalty.card,1); resEl.innerHTML+=`<div class="rl bad">⚠️ ${e.penalty.desc||e.penalty.card+' 추가'}</div>`; log(`${e.penalty.desc||e.penalty.card+' 추가'}`, 'danger'); }
      if(e.penalty.san){ G.san=Math.max(0,G.san+e.penalty.san); resEl.innerHTML+=`<div class="rl bad">⚠️ ${e.penalty.desc||'정신력'+e.penalty.san}</div>`; log(`${e.penalty.desc||'정신력'+e.penalty.san}`, 'danger'); }
    }
    CBT.turn++;
    CBT.atkZone=[]; CBT.defZone=[];
    G.disc.push(...CBT.hand); CBT.hand=[];
    CBT.hand=drawCombatHand();
    resEl.innerHTML+=`<div class="rl neutral">— 라운드${CBT.turn}: ${CBT.hand.length}장 드로우 —</div>`;
    log(`⚔️ 라운드${CBT.turn} (내HP:${G.hp} 적HP:${e.curHp})`,'combat');
  }
  renderCombat(); render();
}

function fleeCombat(){
  const hasCloak=allCards().some(c=>c.id==='feather_cloak');
  const cost=hasCloak?2:8;
  G.hp=Math.max(0,G.hp-cost);
  log(`💨 도망. HP-${cost}${hasCloak?' (🧣깃털망토 효과)':''}`, 'danger');
  closeCombat();
}

function closeCombat(){
  document.getElementById('cbt-mo').style.display='none';
  const p=document.getElementById('cbt-popup'); if(p) p.remove();
  if(CBT.hand?.length){ G.disc.push(...CBT.hand); CBT.hand=[]; }
  if(G.hp<=0) triggerGameOver('전투 중 사망했습니다.');
  checkSurvival(); checkWin(); render();
}
