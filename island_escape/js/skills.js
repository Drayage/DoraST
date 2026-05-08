// ═══════════════ SKILLS ═══════════════

function _checkSkillUnlock(){
  if(G.pendingSkillType) return;
  if((G.skillEvtTotal||0)>=2) return; // 게임 전체 최대 2회
  const types=['move','explore','gather','camp','craft','carduse','sleep','combat'];
  for(const t of types){
    if(G.skillEvtTriggered?.[t]) continue; // 이미 이 타입에서 수락함
    const n=t==='move'?(G.tilesMoved||0):(G.actionCnt?.[t]||0);
    if(n>=SKILL_THRESHOLDS[t]){
      G.pendingSkillType=t;
      break;
    }
  }
}

function _drawSkillCard(pool, exclude){
  const avail=pool.filter(id=>!exclude.includes(id));
  const weighted=[];
  avail.forEach(id=>{
    const c=CARD_MAP[id];
    // 'action' 카드는 tier 없음 → bronze 가중치(4)
    const tier=c?c.tier:'bronze';
    const w=SKILL_TIER_WEIGHTS[tier||'bronze']||4;
    for(let i=0;i<w;i++) weighted.push(id);
  });
  if(!weighted.length) return null;
  return weighted[Math.floor(Math.random()*weighted.length)];
}

function showSkillEvent(cb){
  const type=G.pendingSkillType; G.pendingSkillType=null;
  const typeNames={move:'이동',explore:'탐색',gather:'수집',camp:'캠프건설',
                   craft:'제작',carduse:'카드사용',sleep:'취침',combat:'전투'};
  const pool=SKILL_POOL[type]||[];
  const pick1=_drawSkillCard(pool,[]);
  const pick2=_drawSkillCard(pool,pick1?[pick1]:[]);
  const otherPool=Object.entries(SKILL_POOL).filter(([k])=>k!==type).flatMap(([,v])=>v);
  const pick3=_drawSkillCard(otherPool,[]);

  const el=document.getElementById('skill-choices'); el.innerHTML='';
  const _tierLabels={bronze:'🥉브론즈',silver:'🥈실버',gold:'🥇골드'};
  [pick1,pick2].filter(Boolean).forEach((id,idx)=>{
    const c=CARD_MAP[id];
    const isAction=(!c||c.tag==='action');
    const tierLabel=isAction?'🏃행동카드':_tierLabels[c?.tier]||'';
    const icon=c?c.icon:'🏃';
    const name=c?c.name:'달리기';
    const descTxt=isAction?'즉시 사용: 카드 2장 드로우':(c?.passiveDesc||c?.desc||'');
    const div=document.createElement('div');
    div.className=`skill-choice skill-flip-in${isAction?' sk-tier-bronze':` sk-tier-${c?.tier||'silver'}`}`;
    div.style.animationDelay=`${idx*130}ms`;
    div.innerHTML=`<div style="font-size:26px;">${icon}</div>
      <div class="sk-name">${name}</div>
      <div class="sk-tier-label">${tierLabel}</div>
      <div class="sk-desc">${descTxt}</div>`;
    div.onclick=()=>_selectSkill(type,id,false,cb);
    el.appendChild(div);
  });
  if(pick3){
    const div=document.createElement('div');
    div.className='skill-choice sk-hidden skill-draw-in';
    div.style.animationDelay='260ms';
    div.innerHTML=`<div style="font-size:26px;">🎲</div>
      <div class="sk-name">미확인 스킬</div>
      <div class="sk-tier-label">랜덤</div>
      <div class="sk-desc">선택 후 공개됩니다.</div>`;
    div.onclick=()=>{
      // 뒤집어서 카드 공개 후 선택
      const c3=CARD_MAP[pick3];
      if(c3){
        const tier3=c3.tier||'bronze';
        div.className=`skill-choice sk-tier-${tier3} skill-flip-in`;
        div.style.animationDelay='0ms';
        div.innerHTML=`<div style="font-size:26px;">${c3.icon}</div>
          <div class="sk-name">${c3.name}</div>
          <div class="sk-tier-label">${_tierLabels[tier3]||''} <span style="color:var(--accent2);font-size:7px;">[랜덤]</span></div>
          <div class="sk-desc">${c3.passiveDesc||c3.desc||''}</div>`;
        div.onclick=null;
        setTimeout(()=>_selectSkill(type,pick3,true,cb),550);
      } else { _selectSkill(type,pick3,true,cb); }
    };
    el.appendChild(div);
  }
  const total=(G.skillEvtTotal||0);
  document.getElementById('skill-type-label').textContent=
    `✨ ${typeNames[type]||type} 스킬 획득! (게임 ${total+1}/2회)`;
  const skipBtn=document.getElementById('skill-skip');
  if(skipBtn){ skipBtn.style.display=''; skipBtn.onclick=()=>_skipSkillEvent(type,cb); }
  document.getElementById('skill-mo').style.display='flex';
}

function _selectSkill(type,id,wasHidden,cb){
  document.getElementById('skill-mo').style.display='none';
  const c=CARD_MAP[id];
  addCard(id,1);
  if(!G.skillEvtTriggered) G.skillEvtTriggered={};
  G.skillEvtTriggered[type]=true;
  G.skillEvtTotal=(G.skillEvtTotal||0)+1;
  const tl=c?.tag==='action'?'행동카드':{bronze:'🥉브론즈',silver:'🥈실버',gold:'🥇골드'}[c?.tier]||'';
  log(`✨ 스킬 획득: ${c?.icon||'🏃'}${c?.name||id} (${tl})${wasHidden?' [랜덤]':''}`, 'success');
  checkSurvival(); render(); saveGame();
  if(cb) setTimeout(cb,100);
}

function _skipSkillEvent(type,cb){
  document.getElementById('skill-mo').style.display='none';
  const base=SKILL_THRESHOLDS[type]||1;
  if(type==='move') G.tilesMoved=Math.max(0,(G.tilesMoved||0)-base);
  else if(G.actionCnt) G.actionCnt[type]=Math.max(0,(G.actionCnt[type]||0)-base);
  // skillEvtTotal과 skillEvtTriggered 변경 없음 → 다시 임계치 도달하면 재발동
  log(`⏭️ 스킬 이벤트 건너뜀 — ${base}회 더 쌓이면 다시 발동`, '');
  render(); saveGame();
  if(cb) setTimeout(cb,100);
}

// 게임 시작 시 브론즈 8종 중 5장 앞면 제시 → 2장 선택
function showStartSkillEvent(cb){
  const pool=['running','sk_mv_b','sk_ex_b','sk_ga_b','sk_cp_b','sk_cr_b','sk_sl_b','sk_cb_b'];
  const picks=shuffle([...pool]).slice(0,5);
  const _tierLabels={bronze:'🥉브론즈'};
  const selected=[];
  let done=false;

  const labelEl=document.getElementById('skill-type-label');
  const el=document.getElementById('skill-choices'); el.innerHTML='';

  function updateLabel(){
    labelEl.textContent=`✨ 시작 스킬 선택! ${selected.length}/2장 — 2장을 골라주세요`;
  }

  picks.forEach((id,idx)=>{
    const c=CARD_MAP[id];
    const isAction=!c||c.tag==='action';
    const icon=isAction?'🏃':(c?.icon||'?');
    const name=isAction?'달리기':(c?.name||id);
    const descTxt=isAction?'즉시 사용: 카드 2장 드로우':(c?.passiveDesc||c?.desc||'');
    const tierLabel=isAction?'🏃행동카드':'🥉브론즈';

    const div=document.createElement('div');
    div.className='skill-choice sk-tier-bronze skill-flip-in';
    div.style.animationDelay=`${idx*80}ms`;
    div.innerHTML=`<div style="font-size:26px;">${icon}</div>
      <div class="sk-name">${name}</div>
      <div class="sk-tier-label">${tierLabel}</div>
      <div class="sk-desc">${descTxt}</div>`;

    div.onclick=()=>{
      if(done) return;
      const si=selected.indexOf(id);
      if(si>=0){
        // 이미 선택됨 → 취소
        selected.splice(si,1);
        div.classList.remove('sk-selected');
      } else {
        if(selected.length>=2) return; // 이미 2장
        selected.push(id);
        div.classList.add('sk-selected');
        if(selected.length===2){
          done=true;
          labelEl.textContent='✨ 선택 완료!';
          setTimeout(()=>{
            document.getElementById('skill-mo').style.display='none';
            selected.forEach(sid=>{
              addCard(sid,1);
              const sc=CARD_MAP[sid];
              const sAction=!sc||sc.tag==='action';
              const sName=sAction?'달리기':(sc?.name||sid);
              const sIcon=sAction?'🏃':(sc?.icon||'');
              const sDesc=sAction?'즉시 사용: 카드 2장 드로우':(sc?.passiveDesc||sc?.desc||'');
              log(`✨ 시작 스킬: ${sIcon}${sName} (🥉브론즈) — ${sDesc}`,'success');
            });
            G._startSkillId=selected[0];
            render(); saveGame();
            if(cb) cb();
          },400);
        }
      }
      updateLabel();
    };
    el.appendChild(div);
  });

  updateLabel();
  const skipBtn=document.getElementById('skill-skip');
  if(skipBtn) skipBtn.style.display='none';
  document.getElementById('skill-mo').style.display='flex';
}
