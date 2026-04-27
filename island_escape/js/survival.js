// ═══════════════ SURVIVAL ═══════════════

function checkSurvival(){
  G.hun=Math.max(0,G.hun); G.thi=Math.max(0,G.thi);
  if(G.hun===0){ G.hp=Math.max(0,G.hp-5); log('🍗 굶주림! HP-5','danger'); }
  if(G.thi===0){ G.hp=Math.max(0,G.hp-8); log('💧 탈수! HP-8','danger'); }
  if(G.hp<=0)  triggerGameOver('체력이 소진되었습니다.');
  if(G.san<=0) triggerGameOver('정신력이 무너졌습니다.');
}

function checkWin(){
  if(!G.escMile) G.escMile={};
  if(G.escape>=70&&!G.escMile[70]){ G.escMile[70]=true; showEscapeMilestone(30); }
  if(G.escape>=85&&!G.escMile[85]){ G.escMile[85]=true; showEscapeMilestone(15); }
  if(G.escape>=100&&!G.over){
    G.over=true;
    showVictoryFanfare(()=>showEnding(true,null));
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
}

function triggerGameOver(reason){
  if(G.over) return;
  showEnding(false, reason);
}

// ── 엔딩 화면 ──

function showEnding(win, reason){
  G.over=true; G.win=win;
  const headline=_endHeadline(win, reason);
  const statsHtml=_endStats();
  const hlItems=_endHighlights(win);
  const prevLines=_prevRunComp();
  _saveRun(win);

  const goEl=document.getElementById('go-scr');
  goEl.innerHTML=`
    <div class="go-card">
      <div class="go-headline ${win?'win':'dead'}">${headline.main}</div>
      <div class="go-reason">${headline.sub}</div>
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

function _endHighlights(win){
  const h=[];
  const explored=G.tiles.filter(t=>t.explored).length;

  if(G.doomSurvives>0)         h.push(`🌀 망각의 복권에서 ${G.doomSurvives}번 살아남았다`);
  if(G.doomPhase>=3)            h.push('🌫️ 안개가 기억을 삼키는 것을 두 눈으로 목격했다');
  if(G.kills>=5)                h.push(`⚔️ 총 ${G.kills}마리를 쓰러뜨렸다`);
  else if(G.kills===0&&G.day>3) h.push('⚔️ 한 번도 싸우지 않았다 (평화주의?)');
  if(!win&&G.escape>=80)        h.push(`🛶 탈출까지 단 ${100-G.escape}%가 남아있었다`);
  else if(!win&&G.escape===0)   h.push('🛶 뗏목을 한 번도 만들지 못했다');
  if(G.camps.length===0&&G.day>=5) h.push('🏕️ 캠프 없이 맨몸으로 버텼다');
  else if(G.camps.length>=3)    h.push(`🏕️ ${G.camps.length}곳에 캠프를 세웠다`);
  if(explored>=20)              h.push(`🗺️ 섬 ${explored}곳을 샅샅이 뒤졌다`);
  if(G.day>=20)                 h.push(`📅 ${G.day}일이라는 긴 시간을 버텼다`);
  if(G.tilesMoved>=60)          h.push(`🚶 총 ${G.tilesMoved}칸을 부지런히 이동했다`);

  return shuffle([...h]).slice(0,3);
}

function _prevRunComp(){
  try{
    const prev=JSON.parse(localStorage.getItem('ie_prev')||'null');
    if(!prev) return [];
    const lines=[];
    const rc=(prev.runCount||1)+1;
    lines.push(`${rc}번째 도전`);
    const dd=G.day-prev.day;
    if(dd>0)       lines.push(`지난 시도보다 +${dd}일 생존`);
    else if(dd<0)  lines.push(`지난 시도보다 ${-dd}일 일찍 탈락`);
    const ed=G.escape-prev.escape;
    if(ed>0)            lines.push(`탈출도 +${ed}% 향상`);
    if(!prev.win&&G.win) lines.push('🎉 첫 탈출 성공!');
    if(prev.escape===0&&G.escape>0) lines.push('처음으로 뗏목을 만들었다');
    return lines.slice(0,3);
  }catch(e){ return []; }
}

function _saveRun(win){
  try{
    const prev=JSON.parse(localStorage.getItem('ie_prev')||'{}');
    localStorage.setItem('ie_prev',JSON.stringify({
      day:G.day, escape:G.escape, kills:G.kills, win,
      runCount:(prev.runCount||0)+1,
    }));
    // 기록 저장
    const rec=JSON.parse(localStorage.getItem('ie_records')||'{"runs":[],"best":{}}');
    const entry={day:G.day,escape:G.escape,doom:Math.min(100,G.doom),win,
      date:new Date().toLocaleDateString('ko-KR',{month:'numeric',day:'numeric'})};
    rec.runs.unshift(entry); rec.runs=rec.runs.slice(0,5);
    if(!rec.best.survival||G.day>rec.best.survival.day) rec.best.survival=entry;
    if(win&&(!rec.best.escape||G.day<rec.best.escape.day)) rec.best.escape=entry;
    localStorage.setItem('ie_records',JSON.stringify(rec));
  }catch(e){}
}

function showRecords(){
  try{
    const rec=JSON.parse(localStorage.getItem('ie_records')||'{"runs":[],"best":{}}');
    const mo=document.getElementById('records-mo');
    const runs=rec.runs; const best=rec.best;
    let html='';
    if(best.survival||best.escape){
      html+='<div class="pn-ver" style="margin-bottom:8px;">';
      html+='<div class="pn-tag">🏆 최고 기록</div>';
      if(best.survival) html+=`<div style="font-size:9px;color:var(--text2);font-family:var(--font-m);margin:2px 0;">🗓️ 최장 생존 <b style="color:var(--accent);">${best.survival.day}일</b> — 탈출 ${best.survival.escape}% · ${best.survival.date}</div>`;
      if(best.escape)   html+=`<div style="font-size:9px;color:var(--text2);font-family:var(--font-m);margin:2px 0;">🚀 최단 탈출 <b style="color:var(--green);">${best.escape.day}일</b> — ${best.escape.date}</div>`;
      html+='</div>';
    }
    if(runs.length){
      html+='<div class="pn-tag" style="margin-bottom:6px;">📜 최근 기록</div>';
      runs.forEach((r,i)=>{
        const win=r.win?'<span style="color:var(--green);font-weight:700;">탈출 성공</span>':'<span style="color:var(--red);">실패</span>';
        html+=`<div style="display:flex;align-items:center;gap:8px;background:var(--bg3);border-radius:6px;padding:7px 10px;margin-bottom:5px;font-family:var(--font-m);font-size:9px;">
          <span style="color:var(--text3);min-width:14px;">${i+1}</span>
          <span style="color:var(--text3);">${r.date}</span>
          ${win}
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
