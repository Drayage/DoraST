// ═══════════════ SKILLS ═══════════════

function _checkSkillUnlock(){
  if(G.pendingSkillType) return;
  const types=['move','explore','gather','camp','craft','carduse','sleep','combat'];
  for(const t of types){
    const n = t==='move' ? (G.tilesMoved||0) : (G.actionCnt?.[t]||0);
    const cnt = (G.skillEvtCount?.[t]||0);
    if(cnt >= 2) continue;
    const threshold = SKILL_THRESHOLDS[t] * (cnt + 1);
    if(n >= threshold){
      G.pendingSkillType = t;
      break;
    }
  }
}

function _drawSkillCard(pool, exclude){
  const avail = pool.filter(id => !exclude.includes(id));
  const weighted = [];
  avail.forEach(id => {
    const c = CARD_MAP[id]; if(!c) return;
    const w = SKILL_TIER_WEIGHTS[c.tier||'silver'] || 1;
    for(let i=0;i<w;i++) weighted.push(id);
  });
  if(!weighted.length) return null;
  return weighted[Math.floor(Math.random()*weighted.length)];
}

function showSkillEvent(cb){
  const type = G.pendingSkillType; G.pendingSkillType = null;
  const typeNames = {move:'이동',explore:'탐색',gather:'수집',camp:'캠프건설',
                     craft:'제작',carduse:'카드사용',sleep:'취침',combat:'전투'};
  const pool = SKILL_POOL[type] || [];
  const pick1 = _drawSkillCard(pool, []);
  const pick2 = _drawSkillCard(pool, pick1 ? [pick1] : []);
  const otherPool = Object.entries(SKILL_POOL).filter(([k])=>k!==type).flatMap(([,v])=>v);
  const pick3 = _drawSkillCard(otherPool, []);

  const el = document.getElementById('skill-choices'); el.innerHTML = '';
  [pick1, pick2].filter(Boolean).forEach(id => {
    const c = CARD_MAP[id]; if(!c) return;
    const tierLabel = {bronze:'🥉브론즈', silver:'🥈실버', gold:'🥇골드'}[c.tier] || '';
    const div = document.createElement('div');
    div.className = `skill-choice sk-tier-${c.tier}`;
    div.innerHTML = `<div style="font-size:26px;">${c.icon}</div>
      <div class="sk-name">${c.name}</div>
      <div class="sk-tier-label">${tierLabel}</div>
      <div class="sk-desc">${c.passiveDesc || c.desc || ''}</div>`;
    div.onclick = () => _selectSkill(type, id, false, cb);
    el.appendChild(div);
  });
  if(pick3){
    const div = document.createElement('div');
    div.className = 'skill-choice sk-hidden';
    div.innerHTML = `<div style="font-size:26px;">🎲</div>
      <div class="sk-name">미확인 스킬</div>
      <div class="sk-tier-label">랜덤</div>
      <div class="sk-desc">선택 후 공개됩니다.</div>`;
    div.onclick = () => _selectSkill(type, pick3, true, cb);
    el.appendChild(div);
  }
  const cnt = (G.skillEvtCount?.[type] || 0);
  document.getElementById('skill-type-label').textContent =
    `✨ ${typeNames[type]||type} 스킬 획득! (${cnt+1}/2회)`;
  const skipBtn = document.getElementById('skill-skip');
  if(skipBtn) skipBtn.onclick = () => _skipSkillEvent(type, cb);
  document.getElementById('skill-mo').style.display = 'flex';
}

function _selectSkill(type, id, wasHidden, cb){
  document.getElementById('skill-mo').style.display = 'none';
  const c = CARD_MAP[id]; if(!c) return;
  addCard(id, 1);
  if(!G.skillEvtCount) G.skillEvtCount = {};
  G.skillEvtCount[type] = (G.skillEvtCount[type] || 0) + 1;
  const tl = {bronze:'🥉브론즈', silver:'🥈실버', gold:'🥇골드'}[c.tier] || '';
  log(`✨ 스킬 획득: ${c.icon}${c.name} (${tl})${wasHidden?' [랜덤]':''}`, 'success');
  checkSurvival(); render(); saveGame();
  if(cb) setTimeout(cb, 100);
}

function _skipSkillEvent(type, cb){
  document.getElementById('skill-mo').style.display = 'none';
  const base = SKILL_THRESHOLDS[type] || 1;
  if(type === 'move') G.tilesMoved = Math.max(0, (G.tilesMoved||0) - base);
  else if(G.actionCnt) G.actionCnt[type] = Math.max(0, (G.actionCnt[type]||0) - base);
  log(`⏭️ 스킬 이벤트 건너뜀 — ${base}회 더 쌓이면 다시 발동`, '');
  render(); saveGame();
  if(cb) setTimeout(cb, 100);
}
