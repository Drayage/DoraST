// ═══════════════ COMBAT ═══════════════
// [버그수정] 창 관통 방어무시 구현 / 뱀·박쥐 패널티 적용 / 유령 패널티는 패배 시에만

function drawCombatHand(){ return drawToHand(5); }

function showCbtDeckView(which){
  const panel=document.getElementById('cbt-dv');
  const closeBtn=document.getElementById('cbt-dv-close');
  if(!panel) return;
  const cards=which==='deck'?G.deck:[...G.disc].reverse();
  if(!cards.length){
    panel.innerHTML=`<div style="font-size:9px;color:var(--text3);font-family:var(--font-m);padding:6px;">${which==='deck'?'덱이 비어있습니다.':'버림더미가 비어있습니다.'}</div>`;
  } else {
    panel.innerHTML=cards.map(c=>`
      <div style="display:flex;align-items:center;gap:7px;padding:3px 0;border-bottom:1px solid var(--border);font-family:var(--font-m);">
        <span style="font-size:14px;flex-shrink:0;">${c.icon}</span>
        <span style="font-size:9px;color:var(--text);flex:1;">${c.name}</span>
        <span class="card-tag tag-${c.tag}" style="font-size:6px;">${c.tag}</span>
        <span style="font-size:8px;color:var(--text3);white-space:nowrap;">A${c.atk} D${c.def}${c.curDur?` 🔋${c.curDur}/${c.dur}`:''}</span>
      </div>`).join('');
  }
  panel.style.display='block';
  closeBtn.style.display='';
  // 버튼 하이라이트
  document.getElementById('cbt-dk-n').parentElement.style.borderColor=which==='deck'?'var(--accent2)':'';
  document.getElementById('cbt-dc-n').parentElement.style.borderColor=which==='disc'?'var(--accent2)':'';
}

function hideCbtDeckView(){
  const panel=document.getElementById('cbt-dv');
  const closeBtn=document.getElementById('cbt-dv-close');
  if(panel) panel.style.display='none';
  if(closeBtn) closeBtn.style.display='none';
}

// 기습: 첫 라운드 전투카드 1장 보장
function drawAmbushHand(){
  const isCbt = c => c.tag === 'combat';
  // 1. 덱에 공격카드 있으면 맨 끝(첫 드로우)으로 이동
  let idx = G.deck.findIndex(isCbt);
  if(idx !== -1){
    const [pick]=G.deck.splice(idx,1); G.deck.push(pick);
    return drawToHand(5);
  }
  // 2. 버림더미에 있으면 셔플 후 보장
  if(G.disc.some(isCbt)){
    G.deck=shuffle([...G.deck,...G.disc]); G.disc=[];
    idx=G.deck.findIndex(isCbt);
    const [pick]=G.deck.splice(idx,1); G.deck.push(pick);
    log('🔀 버림더미 셔플 후 공격카드 보장','');
    return drawToHand(5);
  }
  // 3. 어디에도 공격카드 없음 → 맨손 기습 임시카드
  const fist={...CARD_MAP['ambush_fist'], uid:Date.now()+Math.random(), _temp:true};
  log('👊 덱에 공격카드 없음 — 맨손 기습 (방어무시 ATK3) 임시 지급','danger');
  return [fist, ...drawToHand(4)];
}

// 전투 전 조우 모달
function showEncounter(evtId){
  const enemy = ENEMIES[evtId];
  if(!enemy){ startCombat(evtId,false,false); return; }
  const cards = allCards();
  const toolCnt = cards.filter(c=>c.tag==='tool').length;
  const obsRate = Math.min(95, 40 + Math.round(toolCnt/Math.max(1,cards.length)*100));

  document.getElementById('enc-title').textContent = `${enemy.icon} ${enemy.name} 발견!`;
  document.getElementById('enc-desc').textContent = enemy.encDesc || '위험한 기운이 도사리고 있다.';
  const el = document.getElementById('enc-choices'); el.innerHTML='';

  // 1. 기습
  const ambDiv = document.createElement('div'); ambDiv.className='ex-choice fi';
  ambDiv.innerHTML=`
    <div class="ex-ci">⚔️</div>
    <div>
      <div class="ex-cn">기습 공격</div>
      <div class="ex-cd">선제 공격으로 유리한 위치를 점한다.</div>
      <div style="font-size:8px;margin-top:3px;">
        <span style="color:var(--green);">★ 첫 라운드 전투카드 1장 이상 보장</span>
        <span style="color:var(--red);margin-left:6px;">✗ 도주 시 HP-15</span>
      </div>
    </div>`;
  ambDiv.onclick=()=>{
    document.getElementById('enc-mo').style.display='none';
    log(`⚔️ 기습 공격! ${enemy.name}에게 선제 공격!`,'danger');
    startCombat(evtId,true,true);
  };

  // 2. 상황탐색
  const obsRewardTxt = (enemy.observeReward||[]).map(r=>{
    const d=CARD_MAP[r.id];
    return `${d?.icon||''}${d?.name||r.id}×${r.n||1}`;
  }).join(' ');
  const obsDiv = document.createElement('div'); obsDiv.className='ex-choice fi';
  obsDiv.innerHTML=`
    <div class="ex-ci">👁</div>
    <div>
      <div class="ex-cn">상황을 살핀다 <span style="color:var(--text3);font-size:8px;">성공률 ${obsRate}%</span></div>
      <div class="ex-cd">도구 비율에 따라 싸우지 않고 이득을 취할 수 있다.</div>
      <div style="font-size:8px;margin-top:3px;">
        <span style="color:var(--green);">✓ ${obsRewardTxt||'아이템 획득'}</span>
        <span style="color:var(--red);margin-left:6px;">✗ 실패: 전투</span>
      </div>
    </div>`;
  obsDiv.onclick=()=>{
    document.getElementById('enc-mo').style.display='none';
    encObserve(evtId, enemy, obsRate);
  };

  // 3. 도망
  const fleeDiv = document.createElement('div'); fleeDiv.className='ex-choice fi';
  fleeDiv.innerHTML=`
    <div class="ex-ci">💨</div>
    <div>
      <div class="ex-cn">도망친다</div>
      <div class="ex-cd">그 자리를 피해 달아난다.</div>
      <div style="font-size:8px;margin-top:3px;color:var(--red);">✗ 허기-5 · 정신력-10</div>
    </div>`;
  fleeDiv.onclick=()=>{
    document.getElementById('enc-mo').style.display='none';
    encFlee();
  };

  el.appendChild(ambDiv); el.appendChild(obsDiv); el.appendChild(fleeDiv);
  document.getElementById('enc-mo').style.display='flex';
}

function encObserve(evtId, enemy, rate){
  const success=Math.random()*100<rate;
  // card flip animation via jdg-mo
  const cardEl=document.getElementById('jdg-card'), backEl=document.getElementById('jdg-back');
  cardEl.classList.remove('flipped'); backEl.className='jdg-back';
  ['jdg-res','jdg-det','jdg-bon','jdg-ok'].forEach(id=>document.getElementById(id).style.display='none');
  document.getElementById('jdg-title').textContent=`👁 ${enemy.name} — 상황을 살핀다...`;
  document.getElementById('jdg-req').textContent=`도구 비율 판정 (성공률 ${rate}%)`;
  document.getElementById('jdg-cicon').textContent=success?'👁':'💥';
  document.getElementById('jdg-cname').textContent=success?'상황 파악':'들켰다!';
  document.getElementById('jdg-ctag').innerHTML='';
  document.getElementById('jdg-mo').style.display='flex';
  setTimeout(()=>{
    cardEl.classList.add('flipped');
    backEl.classList.add(success?'ok':'fail');
    setTimeout(()=>{
      const resEl=document.getElementById('jdg-res'); resEl.style.display='';
      const detEl=document.getElementById('jdg-det'); detEl.style.display='';
      const okBtn=document.getElementById('jdg-ok'); okBtn.style.display='';
      if(success){
        resEl.className='jdg-res ok'; resEl.textContent='✓ 성공! 상황을 파악했다.';
        detEl.textContent=enemy.observeText||'싸우지 않고 이득을 취했다.';
        log(`👁 상황탐색 성공! 싸우지 않고 이득을 취했다.`,'success');
        okBtn.onclick=()=>{
          document.getElementById('jdg-mo').style.display='none';
          if(enemy.observeReward){
            const items=enemy.observeReward.map(r=>{
              const d=CARD_MAP[r.id];
              return {id:r.id,icon:d?.icon||'📦',name:d?.name||r.id,n:r.n||1};
            });
            showItemPopup(items,`👁 ${enemy.observeText||'탐색 성공!'}`,()=>{checkSurvival();render();});
          } else { checkSurvival(); render(); }
        };
      } else {
        const hitDmg=Math.ceil(enemy.atk/2);
        G.hp=Math.max(0,G.hp-hitDmg);
        flashDamage();
        resEl.className='jdg-res fail'; resEl.textContent=`✗ 실패! ${enemy.icon} ${enemy.name}에게 들켰다!`;
        detEl.textContent=`선제 공격을 받았다! HP -${hitDmg}`;
        log(`👁 상황탐색 실패! ${enemy.name}의 선제 공격 HP-${hitDmg}. 전투 시작.`,'danger');
        okBtn.onclick=()=>{
          document.getElementById('jdg-mo').style.display='none';
          startCombat(evtId,false,false);
        };
      }
    }, 500);
  }, 400);
}

function encFlee(){
  G.hun = Math.max(0, G.hun-5);
  G.san = Math.max(0, G.san-10);
  log('💨 도망쳤다. 허기-5 정신력-10','danger');
  checkSurvival(); render();
}

function startCombat(evtId, ambush, fightChosen){
  const enemy=ENEMIES[evtId];
  CBT={enemy:{...enemy,curHp:enemy.hp},hand:[],atkZone:[],defZone:[],resolved:false,turn:1,stunned:false,poisoned:false,penaltyApplied:false,fightChosen:!!fightChosen};
  CBT.hand = ambush ? drawAmbushHand() : drawCombatHand();
  _cbtMode=null;
  ['btn-cbt-resolve','btn-cbt-flee'].forEach(id=>document.getElementById(id).style.display='');
  document.getElementById('btn-cbt-close').style.display='none';
  document.getElementById('cbt-res').style.display='none';
  document.getElementById('cbt-mo').style.display='flex';
  renderCombat();
  log(`⚔️ ${enemy.name} 전투 시작${ambush?' (기습! 전투카드 우선)':''}.`,'danger');
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
  const dkN=document.getElementById('cbt-dk-n'); if(dkN) dkN.textContent=G.deck.length;
  const dcN=document.getElementById('cbt-dc-n'); if(dcN) dcN.textContent=G.disc.length;
  const fleeBtn=document.getElementById('btn-cbt-flee');
  if(fleeBtn&&fleeBtn.style.display!=='none'){
    const {cost,hasCloak}=getFleeHpCost();
    fleeBtn.innerHTML=`💨 도망 (HP-${cost}${hasCloak?' 🧣':''})`;
    const rows=[
      {icon:'💨',text:'기본 도망 비용: HP -15',cls:hasCloak?'info':'loss'},
    ];
    rows.push({icon:'⚔️',text:'전투 중 도주는 항상 HP-15',cls:'warn'});
    if(hasCloak) rows.push({icon:'🧣',text:`깃털망토 패시브 → HP -${cost} (감소)`,cls:'gain'});
    rows.push({icon:'❤️',text:`현재 HP ${G.hp} → 도망 후 ${G.hp-cost}`,cls:G.hp-cost<=0?'loss':G.hp-cost<15?'warn':'info'});
    fleeBtn._att={title:'💨 도망',cost:`HP -${cost}`,rows};
  }
  document.getElementById('cbt-title').textContent=`⚔️ ${e.name} 출현!`;
  document.getElementById('cbt-sub').textContent=`라운드${CBT.turn} | 적 다음행동: ${CBT.stunned?'기절(피해없음)':`공격-${e.atk}HP`}`;
  const phpEl=document.getElementById('cbt-php');
  const phpClr=G.hp<30?'var(--red)':'var(--green)';
  phpEl.textContent=G.hp; phpEl.style.color=phpClr;
  const phpBar=document.getElementById('cbt-php-bar');
  phpBar.style.width=G.hp+'%'; phpBar.style.background=phpClr;
  const psanEl=document.getElementById('cbt-psan');
  const psanClr=G.san<30?'var(--red)':'var(--purple)';
  psanEl.textContent=G.san; psanEl.style.color=psanClr;
  const psanBar=document.getElementById('cbt-psan-bar');
  psanBar.style.width=G.san+'%'; psanBar.style.background=psanClr;
  document.getElementById('cbt-eicon').textContent=e.icon;
  document.getElementById('cbt-ename').textContent=e.name;
  document.getElementById('cbt-ehp').textContent=Math.max(0,e.curHp);
  document.getElementById('cbt-emhp').textContent=e.hp;
  const edefEl=document.getElementById('cbt-edef'); if(edefEl) edefEl.textContent=e.def;
  document.getElementById('cbt-ehpbar').style.width=Math.max(0,e.curHp/e.hp*100)+'%';
  document.getElementById('cbt-intent').textContent=CBT.stunned?'💫 기절':`💥 공격: ${e.atk}`;
  const aT=CBT.atkZone.reduce((s,c)=>s+Math.max(0,c.atk),0);
  const dT=CBT.defZone.reduce((s,c)=>s+Math.max(0,c.def),0);
  document.getElementById('atk-tot').textContent=aT;
  document.getElementById('def-tot').textContent=dT;
  // 예상 피해 미리보기
  const prevEl=document.getElementById('cbt-preview');
  if(prevEl){
    let preAtk=0; let hasPierce=false;
    CBT.atkZone.forEach(c=>{if(c.cbtFx==='pierce'){preAtk+=c.atk+4;hasPierce=true;}else if(c.cbtFx==='stun')preAtk+=c.atk+3;else preAtk+=Math.max(0,c.atk);});
    let preDef=0; CBT.defZone.forEach(c=>{preDef+=c.cbtFx==='block'?c.def+5:Math.max(0,c.def);});
    const dmgE=hasPierce?preAtk:Math.max(0,preAtk-e.def);
    const eAk=CBT.stunned?0:e.atk; let dmgP=Math.max(0,eAk-preDef);
    if(allCards().some(c=>c.id==='leather_armor')&&dmgP>0) dmgP=Math.max(0,dmgP-2);
    prevEl.innerHTML=`예상: <span style="color:var(--red);">적 ${dmgE}피해</span> · <span style="color:${dmgP>0?'var(--red)':'var(--green)'};">내 ${dmgP}피해</span>`;
  }
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
    if(c.cbtFx==='raw'&&CBT.atkZone.some(x=>x.uid===c.uid)){
      pierceAtk+=c.atk;
      lines.push({t:`★ 방어무시: ATK${c.atk}(방어무시)`,cls:'good'});
    } else if(c.cbtFx==='pierce'&&CBT.atkZone.some(x=>x.uid===c.uid)){
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

  // 일반 공격은 적 방어를 뺌, 관통 공격은 방어 무시
  const dmgE=Math.max(0,normalAtk-e.def)+pierceAtk+poisonDmg;

  // 처치 시 반격 없음
  const willKillEnemy = (e.curHp - dmgE) <= 0;
  const eA=CBT.stunned?0:e.atk;
  let dmgP = willKillEnemy ? 0 : Math.max(0,eA-pD);
  if(!willKillEnemy && hasArmor && dmgP>0){ dmgP=Math.max(0,dmgP-2); lines.push({t:`🧥 가죽갑옷: 피해-2`,cls:'good'}); }
  if(willKillEnemy) lines.push({t:`⚔️ 이번 공격으로 처치 — 적의 반격 없음`,cls:'good'});

  lines.unshift({t:`⚔️ 내공격: 일반${normalAtk}-방어${e.def}+관통${pierceAtk}+독${poisonDmg}=${dmgE}피해`,cls:'good'});
  lines.unshift({t:`🛡️ 내방어:${pD}${hasArmor&&!willKillEnemy?'(갑옷-2)':''}-적공격${eA}=${dmgP}피해`,cls:dmgP>0?'bad':'good'});

  // 사망 확인: 이 라운드에 죽을 예정이면 확인 팝업
  if(!willKillEnemy && dmgP>0 && G.hp - dmgP <= 0){
    showConfirm(
      '⚠️ 사망 위기',
      `이번 라운드 해결 시 체력이 0이 됩니다.\n현재 HP ${G.hp} → 예상 피해 ${dmgP}\n계속 진행하시겠습니까?`,
      ()=>_finishResolveCombat(e,dmgE,dmgP,lines,stun,poisonApplied,hasArmor,willKillEnemy)
    );
    return;
  }
  // 도망 불가 경고: 피해 후 HP가 도망 비용 미만이면 확인 팝업
  const {cost:fleeCost,hasCloak:fleeCloak}=getFleeHpCost();
  const hpAfter=G.hp-dmgP;
  if(!willKillEnemy && dmgP>0 && hpAfter>0 && hpAfter<fleeCost){
    showConfirm(
      '⚠️ 도망 위험',
      `이번 라운드 후 HP ${G.hp} → ${hpAfter}\n도망 비용 HP-${fleeCost}${fleeCloak?' (🧣망토)':''}보다 낮아\n이후 도망 시 사망합니다. 계속하시겠습니까?`,
      ()=>_finishResolveCombat(e,dmgE,dmgP,lines,stun,poisonApplied,hasArmor,willKillEnemy)
    );
    return;
  }
  _finishResolveCombat(e,dmgE,dmgP,lines,stun,poisonApplied,hasArmor,willKillEnemy);
}

function _finishResolveCombat(e,dmgE,dmgP,lines,stun,poisonApplied,hasArmor,willKillEnemy){
  if(poisonApplied) CBT.poisoned=true;
  e.curHp=Math.max(0,e.curHp-dmgE);
  G.hp=Math.max(0,G.hp-dmgP);
  if(dmgP>0) flashDamage();
  CBT.stunned=stun;

  const resEl=document.getElementById('cbt-res');
  resEl.style.display='block';
  resEl.innerHTML=lines.map(l=>`<div class="rl ${l.cls}">${l.t}</div>`).join('');

  if(e.curHp<=0){
    // 승리 처리 — 기본 보상 + 랜덤 추가 전리품
    const rewardItems=[];
    if(e.reward?.san) G.san=Math.min(100,G.san+e.reward.san);
    if(e.reward?.cards) e.reward.cards.forEach(r=>{ const d=CARD_MAP[r.id]; rewardItems.push({id:r.id,icon:d?.icon||'📦',name:d?.name||r.id,n:r.n}); });
    if(e.altCards){
      const bonus=e.altCards[Math.floor(Math.random()*e.altCards.length)];
      bonus.forEach(r=>{ const d=CARD_MAP[r.id]; rewardItems.push({id:r.id,icon:d?.icon||'📦',name:d?.name||r.id,n:r.n}); });
    }
    resEl.innerHTML+=`<div class="rl good" style="font-size:13px;margin-top:5px;">🏆 ${e.name} 처치!</div>`;
    resEl.innerHTML+=`<div class="rl good">💎 전리품: ${rewardItems.map(r=>r.icon+r.name+'×'+r.n).join(' ')} — 클릭해서 선택 획득</div>`;
    G.kills++; CBT.resolved=true;
    log(`⚔️ ${e.name} 처치! 전리품 선택 획득 가능`,'success');
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
    G.disc.push(...CBT.hand.filter(c=>!c._temp)); CBT.hand=[];
    CBT.hand=drawCombatHand();
    resEl.innerHTML+=`<div class="rl neutral">— 라운드${CBT.turn}: ${CBT.hand.length}장 드로우 —</div>`;
    log(`⚔️ 라운드${CBT.turn} (내HP:${G.hp} 적HP:${e.curHp})`,'combat');
  }
  renderCombat(); render();
}

function getFleeHpCost(){
  const hasCloak=allCards().some(c=>c.id==='feather_cloak');
  return {cost:hasCloak?2:15, hasCloak};
}

function fleeCombat(){
  const {cost,hasCloak}=getFleeHpCost();
  // 사망 확인
  if(G.hp - cost <= 0){
    showConfirm(
      '⚠️ 사망 위기',
      `도망 시 체력이 0이 됩니다.\n현재 HP ${G.hp} → 도주 비용 ${cost}\n계속 진행하시겠습니까?`,
      ()=>_doFleeCombat(cost, hasCloak)
    );
    return;
  }
  _doFleeCombat(cost, hasCloak);
}

function _doFleeCombat(cost, hasCloak){
  G.hp=Math.max(0,G.hp-cost);
  log(`💨 도망. HP-${cost}${hasCloak?' (🧣깃털망토 효과)':''}`, 'danger');
  closeCombat();
}

function closeCombat(){
  document.getElementById('cbt-mo').style.display='none';
  const p=document.getElementById('cbt-popup'); if(p) p.remove();
  if(CBT.hand?.length){ G.disc.push(...CBT.hand.filter(c=>!c._temp)); CBT.hand=[]; }
  if(G.hp<=0) triggerGameOver('전투 중 사망했습니다.');
  checkSurvival(); checkWin(); render();
  saveGame();
}
