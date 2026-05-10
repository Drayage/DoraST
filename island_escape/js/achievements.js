// ═══════════════ ACHIEVEMENTS ═══════════════
// 업적 시스템 — 단일 판(run) 안에서 충족된 조건 기준
// 한 번 달성하면 localStorage(ie_achievements)에 영구 저장

const ACHIEVEMENTS=[
  // 탈출루트 (망각의 맹그로브)
  {id:'ach_raft',     cat:'route', icon:'🛶', name:'뗏목 탈출자',   desc:'뗏목으로 탈출에 성공했다.', hidden:false},
  {id:'ach_signal',   cat:'route', icon:'🎆', name:'조난 신호',     desc:'구조신호로 탈출에 성공했다.', hidden:false},
  {id:'ach_temple',   cat:'route', icon:'🏛️', name:'고대의 의지',   desc:'사원의 저주를 해제하고 탈출했다.', hidden:false},
  // 연속 탈출
  {id:'ach_streak_3', cat:'streak',icon:'🔥', name:'생존의 의지',   desc:'3연속 탈출에 성공했다.', hidden:false},
  {id:'ach_streak_5', cat:'streak',icon:'💀', name:'불굴의 생존자', desc:'5연속 탈출에 성공했다.', hidden:false},
  {id:'ach_streak_7', cat:'streak',icon:'👑', name:'섬의 지배자',   desc:'7연속 탈출에 성공했다.', hidden:false},
  {id:'ach_streak_10',cat:'streak',icon:'🌟', name:'전설의 생존자', desc:'10연속 탈출에 성공했다.', hidden:false},
  // 야리코미 히든
  {id:'ach_no_combat',   cat:'hidden',icon:'🕊️',name:'평화주의자',  desc:'전투 한 번 없이 탈출했다.', hidden:true},
  {id:'ach_low_hp',      cat:'hidden',icon:'🩸',name:'아슬아슬',    desc:'HP 10 이하 상태로 탈출했다.', hidden:true},
  {id:'ach_fast',        cat:'hidden',icon:'⚡',name:'신속한 탈출', desc:'10일 이내에 탈출했다.', hidden:true},
  {id:'ach_gold_skill',  cat:'hidden',icon:'🥇',name:'황금의 경지', desc:'골드 스킬 보유 상태로 탈출했다.', hidden:true},
  {id:'ach_doom_close',  cat:'hidden',icon:'☠️',name:'종말 직전',   desc:'종말 90% 이상에서 탈출했다.', hidden:true},
  {id:'ach_monster_death',cat:'hidden',icon:'💀',name:'짐승의 먹이',desc:'몬스터에게 패배해 죽었다.', hidden:true},
  {id:'ach_big_deck',    cat:'hidden',icon:'📚',name:'수집광',      desc:'덱이 50장을 초과한 적이 있다.', hidden:true},
  {id:'ach_raft_fail3',  cat:'hidden',icon:'🌊',name:'풍랑의 저주', desc:'한 판에 뗏목 추첨을 3번 실패했다.', hidden:true},
  {id:'ach_oblivion3',   cat:'hidden',icon:'🌀',name:'망각의 손길', desc:'한 판에 망각이 3번 스며들었다.', hidden:true},
];

function _getAch(){
  try{ return JSON.parse(localStorage.getItem('ie_achievements')||'{}'); }
  catch(e){ return {}; }
}
function _saveAch(a){
  try{ localStorage.setItem('ie_achievements',JSON.stringify(a)); }catch(e){}
}

function unlockAch(id){
  const a=_getAch();
  if(a[id]) return false;
  const def=ACHIEVEMENTS.find(x=>x.id===id); if(!def) return false;
  a[id]={unlocked:true, date:new Date().toLocaleDateString('ko-KR',{month:'numeric',day:'numeric'})};
  _saveAch(a);
  _showAchToast(def);
  return true;
}

// 게임 중 즉시 트리거 가능한 업적 — 카운터가 임계치 도달하는 순간 호출
function tryUnlockMid(id){ return unlockAch(id); }

// 탈출/사망 종료 시 일괄 호출
function checkAchievements(win, reason, streak){
  if(win){
    if(reason==='raft')   unlockAch('ach_raft');
    if(reason==='signal') unlockAch('ach_signal');
    if(reason==='temple') unlockAch('ach_temple');
    if(streak&&streak.type==='win'){
      if(streak.count>=3)  unlockAch('ach_streak_3');
      if(streak.count>=5)  unlockAch('ach_streak_5');
      if(streak.count>=7)  unlockAch('ach_streak_7');
      if(streak.count>=10) unlockAch('ach_streak_10');
    }
    if(G.kills===0) unlockAch('ach_no_combat');
    if(G.hp<=10)    unlockAch('ach_low_hp');
    if(G.day<=10)   unlockAch('ach_fast');
    if(allCards().some(c=>c.tier==='gold')) unlockAch('ach_gold_skill');
    if(G.doom>=90)  unlockAch('ach_doom_close');
  } else {
    if(G.deathCause==='monster') unlockAch('ach_monster_death');
  }
  // 단일 판 내 카운터 기반 — 도중 트리거 못 잡았을 경우 fallback
  if((G.runMaxDeck||0)>50)      unlockAch('ach_big_deck');
  if((G.raftFail||0)>=3)        unlockAch('ach_raft_fail3');
  if((G.oblivionSeepCnt||0)>=3) unlockAch('ach_oblivion3');
}

// 토스트 — 즉시 표시, 다중 시 스택
function _showAchToast(def){
  let stack=document.getElementById('ach-toast-stack');
  if(!stack){
    stack=document.createElement('div');
    stack.id='ach-toast-stack';
    stack.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;gap:6px;z-index:9999;pointer-events:none;';
    document.body.appendChild(stack);
  }
  const d=document.createElement('div');
  d.className='ach-toast';
  d.innerHTML=`<span style="font-size:20px;">${def.icon}</span>
    <div><div class="ach-toast-name">🏆 업적 달성!</div><div class="ach-toast-desc">${def.name}</div></div>`;
  stack.appendChild(d);
  requestAnimationFrame(()=>d.classList.add('show'));
  setTimeout(()=>{d.classList.remove('show');setTimeout(()=>d.remove(),400);},3200);
}

function showAchievements(){
  const a=_getAch();
  const unlockedCount=Object.keys(a).length;
  const total=ACHIEVEMENTS.length;
  const cats=[
    {key:'route',  label:'🏝 탈출루트 — 망각의 맹그로브'},
    {key:'streak', label:'🏆 연속 탈출'},
    {key:'hidden', label:'🎯 도전 업적 (히든)'},
  ];
  let html=`<div style="font-size:9px;color:var(--text3);font-family:var(--font-m);margin-bottom:10px;">${unlockedCount}/${total} 달성</div>`;
  cats.forEach(cat=>{
    html+=`<div class="pn-tag" style="margin:10px 0 6px;">${cat.label}</div>`;
    html+=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;">`;
    ACHIEVEMENTS.filter(x=>x.cat===cat.key).forEach(ac=>{
      const done=!!a[ac.id];
      const showHidden=ac.hidden&&!done;
      html+=`<div class="ach-card${done?'':' locked'}">
        <div style="font-size:22px;">${done?ac.icon:(showHidden?'❓':'🔒')}</div>
        <div class="ach-name">${done?ac.name:(showHidden?'???':ac.name)}</div>
        ${done?`<div class="ach-date">${a[ac.id].date}</div>`:''}
        <div class="ach-desc">${done?ac.desc:(showHidden?'???':ac.desc)}</div>
      </div>`;
    });
    html+=`</div>`;
  });
  document.getElementById('ach-body').innerHTML=html;
  document.getElementById('ach-mo').style.display='flex';
}
