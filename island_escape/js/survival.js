// ═══════════════ SURVIVAL ═══════════════

function checkSurvival(){
  G.hun=Math.max(0,G.hun); G.thi=Math.max(0,G.thi);
  if(G.hp<=0){
    if(!G.deathCause) G.deathCause = (G.hun<=0?'starve':G.thi<=0?'thirst':'hp');
    triggerGameOver('체력이 소진되었습니다.');
  }
  if(G.san<=0){ if(!G.deathCause) G.deathCause='sanity'; triggerGameOver('정신력이 무너졌습니다.'); }
}

function checkWin(){
  if(!G.escMile) G.escMile={};
  if(G.escape>=70&&!G.escMile[70]){ G.escMile[70]=true; showEscapeMilestone(30); }
  if(G.escape>=85&&!G.escMile[85]){ G.escMile[85]=true; showEscapeMilestone(15); }
  if(G.escape>=100&&!G.over){
    G.over=true;
    const escMethod=G.mycEscape?'mycelium':G.templeEscape?'temple':G.signalEscape?'signal':null;
    showVictoryFanfare(()=>showEnding(true, escMethod));
  }
}

function showEscapeMilestone(left){
  const el=document.createElement('div');
  el.className='esc-milestone';
  el.innerHTML=`<div class="em-pct">🛶 탈출까지 ${left}%!</div>
  <div class="em-msg">${left===15?'거의 다 왔다. 마지막 한 걸음...':'이제 절반을 넘었다. 포기하지 마라!'}</div>`;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),3800);
}

function notifyEscapeChange(prevEsc, nextEsc, reason){
  const delta=nextEsc-prevEsc;
  if(!delta) return;
  if(prevEsc<70&&nextEsc<70) return; // 70% 이상 구간부터 알림
  const el=document.createElement('div');
  const up=delta>0;
  const col=up?'var(--green)':'var(--red)';
  el.style.cssText=`position:fixed;top:94px;left:50%;transform:translateX(-50%);z-index:910;padding:8px 16px;border-radius:11px;border:1px solid ${col};background:rgba(8,16,24,.94);font-family:var(--font-m);font-size:10px;color:${col};box-shadow:0 4px 18px rgba(0,0,0,.35);opacity:0;transition:opacity .14s;pointer-events:none;`;
  el.textContent=`🛶 탈출도 ${up?'+':''}${delta}% → ${nextEsc}%${reason?` · ${reason}`:''}`;
  document.body.appendChild(el);
  requestAnimationFrame(()=>{el.style.opacity='1';});
  setTimeout(()=>{el.style.opacity='0'; setTimeout(()=>el.remove(),180);},1900);
}

function showVictoryFanfare(cb){
  const isl=ISLANDS[G.islandId]||ISLANDS.mangrove;
  const ov=document.createElement('div');
  ov.id='victory-overlay';
  const particles=['✨','🌟','💫','⭐','🎊','🎉'].map(e=>{
    const ang=Math.random()*Math.PI*2, dist=120+Math.random()*180;
    return `<span class="vf-p" style="--tx:${Math.cos(ang)*dist}px;--ty:${Math.sin(ang)*dist}px;animation-delay:${Math.random()*.6}s">${e}</span>`;
  }).join('');
  ov.innerHTML=`<div class="vf-particles">${particles}</div>
    <div class="vf-icon">🛶</div>
    <div class="vf-title">탈출 성공!</div>
    <div class="vf-sub">${G.day}일 만에 ${isl.name}을 탈출했다</div>`;
  document.body.appendChild(ov);
  setTimeout(()=>{ ov.remove(); cb(); }, 2800);
}

function goToTitle(){
  document.getElementById('go-scr').style.display='none';
  document.getElementById('title-scr').style.display='flex';
  document.body.classList.add('game-inactive');
  if(typeof updateContinueBtn==='function') updateContinueBtn();
}

function triggerGameOver(reason){
  if(G.over) return;
  showEnding(false, reason);
}

// ── 엔딩 화면 ──

function showEnding(win, reason){
  G.over=true; G.win=win;
  clearSave();
  const headline=_endHeadline(win, reason);
  const statsHtml=_endStats();
  const hlItems=_endHighlights(win, reason);
  const prevLines=_prevRunComp();
  const streak=_saveRun(win, reason);

  let streakHtml='';
  if(streak.count>=2){
    streakHtml=win
      ?`<div style="font-family:var(--font-t);font-size:20px;color:var(--accent);margin:6px 0;text-shadow:0 0 16px rgba(232,184,75,.5);">🔥 ${streak.count}연승!</div>`
      :`<div style="font-family:var(--font-t);font-size:20px;color:var(--red);margin:6px 0;">💀 ${streak.count}연패</div>`;
  }

  const goEl=document.getElementById('go-scr');
  goEl.innerHTML=`
    <div class="go-card">
      <div class="go-headline ${win?'win':'dead'}">${headline.main}</div>
      <div class="go-reason">${headline.sub}</div>
      ${streakHtml}
      <div class="go-sg">${statsHtml}</div>
      ${hlItems.length?`<div class="go-hls">${hlItems.map(h=>`<div class="go-hl">${h}</div>`).join('')}</div>`:''}
      ${prevLines.length?`<div class="go-prev">${prevLines.map(p=>`<span class="go-pi">${p}</span>`).join('')}</div>`:''}
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:16px;">
        <button class="btn primary" onclick="initGame()" style="font-size:13px;padding:11px 28px;">🔄 다시 도전</button>
        <button class="btn" onclick="goToTitle()" style="font-size:12px;padding:10px 20px;">🏠 타이틀로</button>
      </div>
    </div>`;
  goEl.style.display='flex';
  render();
}

function _endHeadline(win, reason){
  if(win){
    if(reason==='temple'){
      const bossNames={boss_stone_idol:'석조 수호신', boss_oblivion_herald:'망각의 전령'};
      const bossName=bossNames[G.templeBoss]||'고대의 존재';
      return {main:'저주 해제', sub:`${G.day}일 만에 사원의 ${bossName}을 쓰러뜨리고 저주를 풀었다.`};
    }
    if(reason==='signal'){
      const sc=G.signalCollected||0;
      const scTxt=sc>3?`${sc}발의 신호탄을 쏘아 올린 끝에`:`${sc}발의 신호탄으로`;
      return {main:'구조 성공', sub:`${G.day}일 만에 ${scTxt} 구조선을 불러냈다.`};
    }
    if(reason==='mycelium'){
      const bossNames={boss_rot_queen:'부패의 여왕', boss_spore_tyrant:'포자 폭군'};
      const bossName=bossNames[G.mycBoss]||'대균사';
      return {main:'균사의 늪 탈출', sub:`${G.day}일 만에 포자 제단 3단계를 돌파하고 ${bossName}을 쓰러뜨렸다. 포자 구름이 일시에 걷히며 탈출로가 열렸다.`};
    }
    let main='탈출 성공';
    if(G.hp>=70&&G.san>=70&&G.day<=15) main='완벽한 생존';
    else if(G.hp<20||G.san<20)         main='간신히 살아남았다';
    return {main, sub:`${G.day}일 만에 섬을 탈출했다.`};
  }
  let main;
  if(G.escape>=80)       main='거의 탈출할 뻔했다';
  else if(G.escape>=50)  main='한 걸음이 부족했다';
  else if(G.san<=0)      main='마음이 먼저 무너졌다';
  else if(G.day<=4)      main='첫 발부터 쉽지 않았다';
  else if(G.doomSurvives>0) main='섬은 아직 널 놓아주지 않았다';
  else {
    const pool=[
      '준비는 됐지만, 타이밍을 놓쳤다',
      '섬은 아직 널 놓아주지 않았다',
      '이번엔 운이 따르지 않았다',
      '다음엔 다를 것이다',
    ];
    main=pool[G.day%pool.length];
  }
  return {main, sub: reason ? `${reason} (${G.day}일 생존)` : `${G.day}일 생존`};
}

function _endStats(){
  const explored=G.tiles.filter(t=>t.explored).length;
  const rows=[
    ['📅 생존일수', `${G.day}일`],
    ['🛶 탈출 진행', `${G.escape}%`],
    [`${(ISLANDS[G.islandId]||ISLANDS.mangrove).doomIcon||'🌫️'} ${(ISLANDS[G.islandId]||ISLANDS.mangrove).doomName||'DOOM'}`, `${Math.min(100,G.doom)}%`],
    ['⚔️ 처치', `${G.kills}마리`],
    ['🗺️ 탐험 타일', `${explored}칸`],
    ['🚶 이동 거리', `${G.tilesMoved||0}칸`],
    ['🏕️ 캠프', `${G.camps.length}곳`],
    ['❤️ 최후 HP', `${G.hp}`],
  ];
  return rows.map(([l,v])=>`<div class="go-si"><span class="go-sl">${l}</span><span class="go-sv">${v}</span></div>`).join('');
}

function _endHighlights(win, reason){
  const h=[];
  const explored=G.tiles.filter(t=>t.explored).length;

  // 루트별 하이라이트 (고정)
  if(win&&reason==='temple'){
    const bossNames={boss_stone_idol:'석조 수호신', boss_oblivion_herald:'망각의 전령'};
    const bossName=bossNames[G.templeBoss]||'보스';
    h.push(`🏛️ 3개 페이즈를 돌파하고 ${bossName}을 쓰러뜨렸다`);
  }
  if(!win&&G.templePhase>0) h.push(`🏛️ 사원 ${G.templePhase}페이즈까지 진입했다가 쓰러졌다`);
  if(win&&reason==='signal'&&(G.signalCollected||0)>3){
    h.push(`🎆 무려 ${G.signalCollected}발의 신호탄을 쏜 끝에 구조를 불렀다`);
  }
  if(win&&reason==='mycelium'){
    const bossNames={boss_rot_queen:'부패의 여왕', boss_spore_tyrant:'포자 폭군'};
    const bossName=bossNames[G.mycBoss]||'대균사';
    h.push(`🌀 포자 제단 3단계 돌파 — ${bossName} 처치로 탈출`);
    const mapPiecesCnt=Object.keys(G.mycMapDrops||{}).length;
    if(mapPiecesCnt>=3) h.push(`🍃 필드에서 균사지도 조각 ${mapPiecesCnt}종을 수집해 제단에 도전했다`);
  }

  // 골드 스킬 보유
  const goldSkills=allCards().filter(c=>c.tier==='gold');
  if(goldSkills.length>0) h.push(`🥇 황금 스킬 [${goldSkills.map(c=>c.name).join('·')}] 보유`);

  // 일반 하이라이트 (랜덤)
  const pool=[];
  if(G.doomSurvives>0)         pool.push(`🌀 망각의 복권에서 ${G.doomSurvives}번 살아남았다`);
  if(G.doomPhase>=3)            pool.push('🌫️ 안개가 기억을 삼키는 것을 두 눈으로 목격했다');
  if(G.kills>=5)                pool.push(`⚔️ 총 ${G.kills}마리를 쓰러뜨렸다`);
  else if(G.kills===0&&G.day>3) pool.push('⚔️ 한 번도 싸우지 않았다 (평화주의?)');
  if(!win&&G.escape>=80)        pool.push(`🛶 탈출까지 단 ${100-G.escape}%가 남아있었다`);
  else if(!win&&G.escape===0)   pool.push('🛶 뗏목을 한 번도 만들지 못했다');
  if(G.camps.length===0&&G.day>=5) pool.push('🏕️ 캠프 없이 맨몸으로 버텼다');
  else if(G.camps.length>=3)    pool.push(`🏕️ ${G.camps.length}곳에 캠프를 세웠다`);
  if(explored>=20)              pool.push(`🗺️ 섬 ${explored}곳을 샅샅이 뒤졌다`);
  if(G.day>=20)                 pool.push(`📅 ${G.day}일이라는 긴 시간을 버텼다`);
  if(G.tilesMoved>=60)          pool.push(`🚶 총 ${G.tilesMoved}칸을 부지런히 이동했다`);
  if((G.raftGreat||0)>=2)       pool.push(`🛶 뗏목 제작 대성공 ${G.raftGreat}회`);
  if((G.raftFail||0)>=2)        pool.push(`🛶 뗏목 제작 실패 ${G.raftFail}회 끝에 버텼다`);

  h.push(...shuffle([...pool]).slice(0, Math.max(0, 3 - h.length)));
  return h.slice(0, 4);
}

function _prevRunComp(){
  try{
    const prev=JSON.parse(localStorage.getItem('ie_prev')||'null');
    if(!prev) return [];
    const lines=[];
    const rc=(prev.runCount||1)+1;
    lines.push(`${rc}번째 도전`);
    const dd=G.day-prev.day;
    if(prev.win===true&&G.win===true){
      if(dd<0)      lines.push(`지난 시도보다 ${-dd}일 빠르게 탈출`);
      else if(dd>0) lines.push(`지난 시도보다 ${dd}일 더 걸려 탈출`);
    } else if(prev.win===false&&G.win===false){
      if(dd>0)      lines.push(`지난 시도보다 +${dd}일 생존`);
      else if(dd<0) lines.push(`지난 시도보다 ${-dd}일 일찍 실패`);
    }
    const ed=G.escape-prev.escape;
    if(ed>0)            lines.push(`탈출도 +${ed}% 향상`);
    if(!prev.win&&G.win) lines.push('🎉 첫 탈출 성공!');
    if(prev.escape===0&&G.escape>0) lines.push('처음으로 뗏목을 만들었다');
    // 가장 많이 사용한 탈출 루트 (승리 기록 기준)
    try{
      const rec2=JSON.parse(localStorage.getItem('ie_records')||'{}');
      const mc={raft:0,signal:0,temple:0};
      (rec2.runs||[]).filter(r=>r.win).forEach(r=>{ const m=r.method||'raft'; mc[m]=(mc[m]||0)+1; });
      const top=Object.entries(mc).sort((a,b)=>b[1]-a[1])[0];
      const routeNames={raft:'🛶 뗏목',signal:'🎆 구조신호',temple:'🏛️ 사원'};
      if(top&&top[1]>=2) lines.push(`주력 탈출 루트: ${routeNames[top[0]]||top[0]} (${top[1]}회 성공)`);
    }catch(_){}
    return lines.slice(0,4);
  }catch(e){ return []; }
}

function _saveRun(win, reason){
  try{
    const prev=JSON.parse(localStorage.getItem('ie_prev')||'{}');
    localStorage.setItem('ie_prev',JSON.stringify({
      day:G.day, escape:G.escape, kills:G.kills, win,
      runCount:(prev.runCount||0)+1,
    }));
    const rec=JSON.parse(localStorage.getItem('ie_records')||'{"runs":[],"best":{},"streak":{"type":null,"count":0}}');
    const entry={day:G.day,escape:G.escape,doom:Math.min(100,G.doom),win,
      method:reason||'raft',
      date:new Date().toLocaleDateString('ko-KR',{month:'numeric',day:'numeric'})};
    rec.runs.unshift(entry); rec.runs=rec.runs.slice(0,5);
    if(!rec.best.survival||G.day>rec.best.survival.day) rec.best.survival=entry;
    if(win&&(!rec.best.escape||G.day<rec.best.escape.day)) rec.best.escape=entry;
    // 연속 승/패
    if(!rec.streak) rec.streak={type:null,count:0};
    const curType=win?'win':'loss';
    rec.streak = rec.streak.type===curType
      ? {type:curType, count:rec.streak.count+1}
      : {type:curType, count:1};
    if(win)  { if(!rec.best.winStreak ||rec.streak.count>rec.best.winStreak)  rec.best.winStreak =rec.streak.count; }
    else     { if(!rec.best.lossStreak||rec.streak.count>rec.best.lossStreak) rec.best.lossStreak=rec.streak.count; }
    localStorage.setItem('ie_records',JSON.stringify(rec));
    const streakInfo={count:rec.streak.count, type:curType};
    if(win&&typeof markIslandCleared==='function') markIslandCleared(G.islandId||'mangrove', reason||'raft');
    if(typeof checkAchievements==='function') checkAchievements(win, reason, streakInfo);
    return streakInfo;
  }catch(e){ return {count:1, type:win?'win':'loss'}; }
}

function showRecords(){
  try{
    const rec=JSON.parse(localStorage.getItem('ie_records')||'{"runs":[],"best":{}}');
    const mo=document.getElementById('records-mo');
    const runs=rec.runs; const best=rec.best;
    let html='';
    if(best.survival||best.escape||best.winStreak||best.lossStreak){
      html+='<div class="pn-ver" style="margin-bottom:8px;">';
      html+='<div class="pn-tag">🏆 최고 기록</div>';
      if(best.survival)   html+=`<div style="font-size:9px;color:var(--text2);font-family:var(--font-m);margin:2px 0;">🗓️ 최장 생존 <b style="color:var(--accent);">${best.survival.day}일</b> — 탈출 ${best.survival.escape}% · ${best.survival.date}</div>`;
      if(best.escape){const em=best.escape.method==='temple'?'🏛️사원':best.escape.method==='signal'?'🎆신호':'🛶뗏목';html+=`<div style="font-size:9px;color:var(--text2);font-family:var(--font-m);margin:2px 0;">🚀 최단 탈출 <b style="color:var(--green);">${best.escape.day}일</b> ${em} — ${best.escape.date}</div>`;}
      if(best.winStreak)  html+=`<div style="font-size:9px;color:var(--text2);font-family:var(--font-m);margin:2px 0;">🔥 최대 연승 <b style="color:var(--accent);">${best.winStreak}연승</b></div>`;
      if(best.lossStreak) html+=`<div style="font-size:9px;color:var(--text2);font-family:var(--font-m);margin:2px 0;">💀 최대 연패 <b style="color:var(--red);">${best.lossStreak}연패</b></div>`;
      html+='</div>';
    }
    if(runs.length){
      html+='<div class="pn-tag" style="margin-bottom:6px;">📜 최근 기록</div>';
      runs.forEach((r,i)=>{
        const winTxt=r.win?'<span style="color:var(--green);font-weight:700;">탈출 성공</span>':'<span style="color:var(--red);">실패</span>';
        const methodBadge=r.win?(r.method==='temple'?'<span style="color:#ccaaee;">🏛️사원</span>':r.method==='signal'?'<span style="color:var(--accent);">🎆신호</span>':'<span style="color:var(--text3);">🛶뗏목</span>'):'';
        html+=`<div style="display:flex;align-items:center;gap:8px;background:var(--bg3);border-radius:6px;padding:7px 10px;margin-bottom:5px;font-family:var(--font-m);font-size:9px;">
          <span style="color:var(--text3);min-width:14px;">${i+1}</span>
          <span style="color:var(--text3);">${r.date}</span>
          ${winTxt}${methodBadge}
          <span style="color:var(--accent);">🗓️${r.day}일</span>
          <span style="color:var(--green);">🛶${r.escape}%</span>
          <span style="color:var(--red);margin-left:auto;">🌫️${r.doom}%</span>
        </div>`;
      });
    } else {
      html+='<div style="color:var(--text3);font-family:var(--font-m);font-size:9px;text-align:center;padding:20px 0;">아직 기록이 없습니다.</div>';
    }
    mo.querySelector('#records-body').innerHTML=html;
    mo.style.display='flex';
  }catch(e){ console.error(e); }
}
