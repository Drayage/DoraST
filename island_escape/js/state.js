// ═══════════════ STATE ═══════════════

let G={}, CBT={};
let _dvTab='all', _ttTm=null, _cbtMode=null, _ucHand=[];
let _mobTab='map';
const _tabMap={map:'map-col',deck:'ctr-col',stat:'rgt-col',help:'rgt-col'};
let _pendingItems=null, _itemCb=null, _pendingItemCards=null;

function startGame(islandId){
  clearSave();
  if(islandId && ISLANDS[islandId]) G={islandId};
  else G={islandId: G?.islandId || 'mangrove'};
  document.getElementById('title-scr').style.display='none';
  document.body.classList.remove('game-inactive');
  initGame();
}

// ── 섬 진행 저장/로드 ──
function getIslandProgress(){
  try{ return JSON.parse(localStorage.getItem('ie_islands_progress')||'{}'); }
  catch(e){ return {}; }
}

function isIslandUnlocked(islandId){
  const ORDER=['mangrove','mycelium','caldera','station','beast'];
  if(islandId==='mangrove') return true;
  const p=getIslandProgress();
  if(p[islandId]?.unlocked) return true;
  const idx=ORDER.indexOf(islandId);
  if(idx<=0) return false;
  return !!(p[ORDER[idx-1]]?.cleared);
}

function markIslandCleared(islandId, method){
  try{
    const p=getIslandProgress();
    if(!p[islandId]?.cleared){
      p[islandId]={cleared:true, method: method||'raft',
        date:new Date().toLocaleDateString('ko-KR',{month:'numeric',day:'numeric'})};
      const ORDER=['mangrove','mycelium','caldera','station','beast'];
      const idx=ORDER.indexOf(islandId);
      if(idx>=0 && idx<ORDER.length-1){
        const next=ORDER[idx+1];
        if(!p[next]) p[next]={locked:false};
      }
      localStorage.setItem('ie_islands_progress',JSON.stringify(p));
    }
  }catch(e){}
}

function renderIslandSelect(){
  const el=document.getElementById('island-select');
  if(!el) return;
  const ORDER=['mangrove','mycelium','caldera','station','beast'];
  const p=getIslandProgress();
  let html='<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:10px 0;">';
  ORDER.forEach(id=>{
    const isl=ISLANDS[id];
    if(!isl) return;
    const unlocked=isIslandUnlocked(id);
    const cleared=!!(p[id]?.cleared);
    const active=(G?.islandId===id);
    html+=`<div class="island-card${unlocked?'':' locked'}${active?' active':''}"
      onclick="${unlocked?`startGame('${id}')`:''}">
      <div style="font-size:22px;">${isl.icon}</div>
      <div class="island-name">${isl.name}</div>
      <div class="island-sub">${isl.subtitle}</div>
      ${cleared?`<div class="island-badge">✅ 클리어</div>`
               :unlocked?'':'<div class="island-badge locked-badge">🔒</div>'}
    </div>`;
  });
  html+='</div>';
  el.innerHTML=html;
}

function continueGame(){
  if(!hasSave()) return;
  document.getElementById('title-scr').style.display='none';
  document.body.classList.remove('game-inactive');
  loadGame();
}

const SAVE_KEY='ie_save';

function saveGame(){
  if(!G||!G.day||G.over) return;
  try{
    const snap={...G, logs:(G.logs||[]).slice(-30)};
    localStorage.setItem(SAVE_KEY, JSON.stringify(snap));
  }catch(e){ console.warn('save failed', e); }
}

function loadGame(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw) return false;
    const snap=JSON.parse(raw);
    if(!snap||!snap.day||snap.over) return false;
    G=snap;
    _pendingItems=null; _itemCb=null; _pendingItemCards=null; _ucHand=[];
    document.querySelectorAll('.mo').forEach(el=>el.style.display='none');
    document.getElementById('go-scr').style.display='none';
    initMobile();
    log('💾 저장된 게임을 불러왔습니다.','system');
    render();
    return true;
  }catch(e){ console.warn('load failed', e); return false; }
}

function hasSave(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw) return false;
    const snap=JSON.parse(raw);
    return !!(snap&&snap.day&&!snap.over);
  }catch(e){ return false; }
}

function getSaveInfo(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw) return null;
    const s=JSON.parse(raw);
    if(!s||!s.day||s.over) return null;
    return {day:s.day, escape:s.escape||0, islandId:s.islandId||'mangrove'};
  }catch(e){ return null; }
}

function clearSave(){
  try{ localStorage.removeItem(SAVE_KEY); }catch(e){}
}

function devUnlockAll(){
  const ORDER=['mangrove','mycelium','caldera','station','beast'];
  const p=getIslandProgress();
  ORDER.forEach(id=>{ p[id]={...(p[id]||{}), unlocked:true, cleared:true}; });
  localStorage.setItem('ie_islands_progress',JSON.stringify(p));
  renderIslandSelect();
  const btn=document.querySelector('[onclick="devUnlockAll()"]');
  if(btn){ btn.textContent='✅ 해금됨'; setTimeout(()=>{ btn.textContent='🔓 DEV'; },1500); }
  console.log('[DEV] island progress:', JSON.parse(localStorage.getItem('ie_islands_progress')));
}

function devReset(){
  localStorage.removeItem('ie_islands_progress');
  localStorage.removeItem('ie_achievements');
  clearSave();
  renderIslandSelect();
}

function updateContinueBtn(){
  const btn=document.getElementById('btn-continue');
  if(!btn) return;
  const info=getSaveInfo();
  const lbl=document.getElementById('btn-continue-info');
  if(info){
    btn.disabled=false;
    btn.style.opacity='';
    btn.style.cursor='';
    if(lbl){
      const isl=(typeof ISLANDS!=='undefined'&&ISLANDS[info.islandId])||{name:''};
      lbl.textContent=`Day ${info.day} · 탈출 ${info.escape}%${isl.name?' · '+isl.name:''}`;
      lbl.style.display='';
    }
  } else {
    btn.disabled=true;
    btn.style.opacity='.4';
    btn.style.cursor='not-allowed';
    if(lbl){ lbl.textContent='저장된 게임 없음'; lbl.style.display=''; }
  }
}

function initGame(){
  const islandId = (G && G.islandId && ISLANDS[G.islandId]) ? G.islandId : 'mangrove';
  G={
    day:1, ap:10, maxAP:10,
    hp:100, san:90, hun:80, thi:80,
    doom:0, escape:0,
    doomPhase:0, doomRate:0, doomSurvives:0,
    camps:[], tiles:[], pos:24,
    deck:[], disc:[],
    weather:WEATHER[0], tomorrow:WEATHER[1],
    over:false, win:false, logs:[], kills:0,
    raftTry:0, raftGreat:0, raftFail:0,
    gatherCnt:{}, gatherBonus:{}, tilesMoved:0,
    lastOblivion:-99, signalEscape:false, signalCollected:0,
    templePhase:0, templeEscape:false, templeBoss:null,
    _templeBonus:{atk:0,def:0}, templeMapDrops:{},
    templeRevealed:false, templeEventShown:{},
    actionCnt:{move:0,explore:0,gather:0,camp:0,craft:0,carduse:0,sleep:0,combat:0},
    pendingSkillType:null,
    skillEvtTotal:0,
    skillEvtTriggered:{},
    skillCraftBypass:false,
    runMaxDeck:0, oblivionSeepCnt:0, deathCause:null,
    mycPhase:0, mycEscape:false,
    islandId,
  };
  _pendingItems=null; _itemCb=null; _pendingItemCards=null; _ucHand=[];
  G.escMile={};
  buildDeck(); buildMap();
  document.querySelectorAll('.mo').forEach(el=>el.style.display='none');
  document.getElementById('go-scr').style.display='none';
  initMobile();
  const isl = ISLANDS[G.islandId] || ISLANDS.mangrove;
  const wx=G.weather;
  let wxTxt='';
  if(wx?.eff){
    const [s,v]=wx.eff.split('_');
    const val=parseInt(v);
    if(s==='san'){ G.san=Math.min(100,Math.max(0,G.san+val)); wxTxt=`${wx.icon}${wx.name}: 정신력${val>=0?'+':''}${val}`; }
    else if(s==='thi'){ G.thi=Math.min(100,Math.max(0,G.thi+val)); wxTxt=`${wx.icon}${wx.name}: 갈증${val>=0?'+':''}${val}`; }
    else if(s==='ap'){ G.ap=Math.max(0,G.ap+val); wxTxt=`${wx.icon}${wx.name}: AP${val>=0?'+':''}${val}`; }
    else if(s==='hp'){ G.hp=Math.max(0,Math.min(100,G.hp+val)); wxTxt=`${wx.icon}${wx.name}: HP${val>=0?'+':''}${val}`; }
    else { wxTxt=`${wx.icon}${wx.name}`; }
  }
  log(`${isl.icon} ${isl.startLog}${wxTxt?` ( ${wxTxt} )`:''}`,'system');
  const startDebris=G.deck.filter(c=>c.id==='debris').length;
  log(`🪨 시작 덱에 잔해 ${startDebris}장${startDebris>=3?' (식량·물 +1)':''}`, startDebris>=3?'success':'');
  if(G._deckProfile) log(`📦 덱 구성: ${G._deckProfile.label} — ${G._deckProfile.desc}`,'system');
  log('팁: 탐색→캠프→제작소에서 도구 제작→수집으로 자원 확보','');
  render();
  showIslandIntro(()=>showStartSkillEvent(()=>saveGame()));
}

function buildDeck(){
  // 랜덤 재료 비중 프로필
  const matProfiles=[
    {label:'목재 특화 🪵', desc:'목재가 풍부 → 뗏목·도구 중심 루트',  wood:5, metal:2, stone:0},
    {label:'고철 특화 ⚙️', desc:'고철이 풍부 → 무기·도구 제작 중심',  wood:2, metal:5, stone:0},
    {label:'돌 특화 🪨',   desc:'돌이 풍부 → 석기 무기·채광 중심',    wood:2, metal:2, stone:3},
    {label:'균형 ⚖️',      desc:'균형 잡힌 재료 — 유연한 플레이',      wood:3, metal:3, stone:1},
  ];
  const prof=matProfiles[Math.floor(Math.random()*matProfiles.length)];
  G._deckProfile=prof;

  let c=[];
  CARDS.forEach(d=>{
    let n=d.n;
    if(d.id==='wood')  n=prof.wood;
    if(d.id==='metal') n=prof.metal;
    if(d.id==='stone') n=prof.stone;
    for(let i=0;i<n;i++){
      const card={...d, uid:uid()};
      if(d.dur) card.curDur=d.dur;
      c.push(card);
    }
  });

  // 시작 잔해 카드 2~3장
  const debrisDef=CARDS.find(d=>d.id==='debris');
  const debrisCnt=2+Math.floor(Math.random()*2); // 2 or 3
  if(debrisDef){
    for(let i=0;i<debrisCnt;i++) c.push({...debrisDef,uid:uid()});
  }
  if(debrisCnt>=3){
    // 잔해 3장이면 식량·물 1장씩 보상
    const fd=CARDS.find(d=>d.id==='food'), wd=CARDS.find(d=>d.id==='water');
    if(fd){const fc={...fd,uid:uid()};if(fd.dur)fc.curDur=fd.dur;c.push(fc);}
    if(wd){const wc={...wd,uid:uid()};if(wd.dur)wc.curDur=wd.dur;c.push(wc);}
  }

  G.deck=shuffle(c);
}
