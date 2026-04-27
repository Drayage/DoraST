// ═══════════════ HELPERS ═══════════════

function uid(){ return Math.random().toString(36).slice(2); }
function shuffle(a){ for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

// [...G.deck,...G.disc] 반복 스프레드 대신 이걸 쓸 것
function allCards(){ return G.deck.concat(G.disc); }

function log(msg, type){
  G.logs.unshift({msg, type});
  if(G.logs.length>60) G.logs.pop();
  if(window.innerWidth<=700 && _mobTab!=='deck'){
    const b=document.getElementById('badge-deck');
    if(b){b.textContent='NEW';b.classList.add('show');}
  }
  if(window.innerWidth<=700 && _mobTab!=='stat' && type==='danger'){
    const b=document.getElementById('badge-stat');
    if(b){b.textContent='!';b.classList.add('show');}
  }
}

function addCard(id, n){
  const def=CARD_MAP[id]; if(!def) return;   // O(1) 조회
  for(let i=0;i<n;i++){
    const card={...def, uid:uid()};
    if(def.dur) card.curDur=def.dur;
    G.disc.push(card);
  }
}

// 취침 시 덱 상단 n장을 버림더미로 이동 (덱 사이클링)
function drawCards(n){
  for(let i=0;i<n;i++){
    if(!G.deck.length){
      if(!G.disc.length) break;
      G.deck=shuffle(G.disc); G.disc=[];
    }
    G.disc.push(G.deck.pop());
  }
}

function cntInDeck(id){ return allCards().reduce((s,c)=>s+(c.id===id?1:0),0); }

function rmFromDeck(id, n){
  let r=n;
  G.disc=G.disc.filter(c=>{ if(c.id===id&&r>0){r--;return false;} return true; });
  if(r>0) G.deck=G.deck.filter(c=>{ if(c.id===id&&r>0){r--;return false;} return true; });
}

function canCraft(rec){ return rec.cost.every(c=>cntInDeck(c.id)>=c.n); }

function hasTool(id){ return allCards().some(c=>c.id===id); }

// 덱에서 n장 드로우 (부족하면 버림더미 섞어 보충)
function drawToHand(n){
  const hand=[];
  for(let i=0;i<n;i++){
    if(!G.deck.length){
      if(!G.disc.length) break;
      G.deck=shuffle(G.disc); G.disc=[];
    }
    hand.push(G.deck.pop());
  }
  return hand;
}

function flashDamage(){
  const el=document.getElementById('dmg-fx');
  if(!el) return;
  const now=Date.now();
  if(!flashDamage._st) flashDamage._st={last:0, queued:0, tm:null};
  const st=flashDamage._st;
  const cd=120; // 연속 틱데미지 과도 점멸 방지
  const play=()=>{
    st.last=Date.now();
    el.classList.add('hit');
    setTimeout(()=>el.classList.remove('hit'),180);
  };
  if(now-st.last>=cd&&!el.classList.contains('hit')){
    play(); return;
  }
  st.queued=Math.min(4,st.queued+1);
  if(st.tm) return;
  st.tm=setTimeout(function run(){
    st.tm=null;
    if(st.queued<=0) return;
    st.queued--;
    play();
    if(st.queued>0) st.tm=setTimeout(run,cd);
  }, cd);
}

// items: [{id, icon, name, n}] — 팝업에서 개별 클릭으로 획득
function showItemPopup(items, title, cb){
  _itemCb=cb;
  _pendingItemCards=[];
  items.forEach(item=>{
    for(let i=0;i<(item.n||1);i++) _pendingItemCards.push({...item, n:1});
  });
  _renderItemPopup(title||'🎁 획득!');
  document.getElementById('item-mo').style.display='flex';
}

function _renderItemPopup(title){
  document.getElementById('item-title').textContent=title;
  const row=document.getElementById('item-row'); row.innerHTML='';
  (_pendingItemCards||[]).forEach((item,idx)=>{
    const div=document.createElement('div'); div.className='item-card';
    div.style.animationDelay=`${idx*0.08}s`;
    div.style.cursor='pointer';
    div.innerHTML=`<div class="item-card-icon">${item.icon}</div><div class="item-card-name">${item.name}</div><div style="font-size:7px;color:var(--green);margin-top:3px;font-family:var(--font-m);">탭→획득</div>`;
    div.onclick=(e)=>{ e.stopPropagation(); claimItem(idx); };
    const def=item.id?CARD_MAP[item.id]:null;
    if(def && window.innerWidth>700){
      div.addEventListener('mouseenter',()=>showTT(def,div));
      div.addEventListener('mouseleave',hideTT);
    }
    row.appendChild(div);
  });
}

function claimItem(idx){
  if(!_pendingItemCards||idx>=_pendingItemCards.length) return;
  const item=_pendingItemCards[idx];
  if(item.id) addCard(item.id, 1);
  log(`📦 획득: ${item.icon}${item.name}`,'success');
  _pendingItemCards.splice(idx,1);
  if(!_pendingItemCards.length){
    document.getElementById('item-mo').style.display='none';
    _pendingItemCards=null;
    const cb=_itemCb; _itemCb=null;
    if(cb) cb();
    render();
  } else {
    _renderItemPopup(document.getElementById('item-title').textContent);
    render();
  }
}

function showConfirm(title, msg, cb){
  document.getElementById('conf-title').textContent=title;
  document.getElementById('conf-msg').textContent=msg;
  document.getElementById('conf-ok').onclick=()=>{closeConfirm();cb();};
  document.getElementById('conf-mo').style.display='flex';
}
function closeConfirm(){
  document.getElementById('conf-mo').style.display='none';
}

function skipItemPopup(){
  document.getElementById('item-mo').style.display='none';
  if(_pendingItemCards&&_pendingItemCards.length){
    const names=_pendingItemCards.map(({icon,name})=>`${icon}${name}`).join(' ');
    log(`🚫 포기: ${names}`,'');
  }
  _pendingItemCards=null;
  const cb=_itemCb; _itemCb=null;
  if(cb) cb();
}

function showIslandIntro(){
  const isl=ISLANDS[G.islandId]||ISLANDS.mangrove;
  document.getElementById('ii-icon').textContent=isl.icon;
  document.getElementById('ii-name').textContent=isl.name;
  document.getElementById('ii-sub').textContent=isl.subtitle;
  document.getElementById('ii-story').textContent=isl.story;
  document.getElementById('ii-mech').textContent=isl.mechanic;
  const hdrTitle=document.getElementById('hdr-title');
  if(hdrTitle) hdrTitle.textContent=`${isl.icon} ${isl.name}`;
  const mapName=document.getElementById('map-island-name');
  if(mapName) mapName.textContent=isl.name;
  document.getElementById('island-intro-mo').style.display='flex';
}
