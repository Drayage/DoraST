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
  const def=CARD_MAP[id]; if(!def) return;
  // 황금 손: 스킬 카드 제외한 모든 카드 획득 2배 (양날의 검)
  const realN=(G&&G.deck&&def.tag!=='skill'&&allCards().some(c=>c.id==='sk_ga_g'))?n*2:n;
  for(let i=0;i<realN;i++){
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

// 덱에서 n장 드로우해 targetArr에 직접 추가 (달리기 등 액션 카드용)
function drawNCards(n, targetArr){
  for(let i=0;i<n;i++){
    if(!G.deck.length){
      if(!G.disc.length) break;
      G.deck=shuffle([...G.disc]); G.disc=[];
      log('🔀 덱 셔플 (달리기)','');
    }
    targetArr.push(G.deck.pop());
  }
}

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
  // 오버레이 버튼 (덱/레시피 확인용)
  let ovRow=document.getElementById('item-overlay-btns');
  if(!ovRow){
    ovRow=document.createElement('div');
    ovRow.id='item-overlay-btns';
    ovRow.style.cssText='display:flex;gap:6px;justify-content:center;margin-top:6px;';
    const ib=document.getElementById('item-box'); if(ib) ib.insertBefore(ovRow, row.nextSibling);
  }
  ovRow.innerHTML=`<button class="btn" style="font-size:8px;padding:3px 10px;" onclick="openOverlayDeck()">📦 덱 보기</button><button class="btn" style="font-size:8px;padding:3px 10px;" onclick="openOverlayRecipes()">📋 레시피</button>`;
}

function openOverlayDeck(){
  const existing=document.getElementById('overlay-deck');
  if(existing){existing.remove();return;}
  const el=document.createElement('div'); el.id='overlay-deck';
  el.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--bg2);border:1px solid var(--border2);border-radius:12px;padding:14px;z-index:1200;max-width:360px;width:90vw;max-height:70vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.6);';
  const cards=allCards(); const grouped={};
  cards.forEach(c=>{ if(!grouped[c.id]) grouped[c.id]={...c,count:0}; grouped[c.id].count++; });
  const _tl={resource:'자원',tool:'도구',combat:'전투',action:'행동',skill:'행동',status:'상태'};
  const rows=Object.values(grouped).map(c=>`<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--border);font-family:var(--font-m);"><span style="font-size:15px;flex-shrink:0;">${c.icon}</span><span style="font-size:9px;flex:1;">${c.name}</span><span class="card-tag tag-${c.tag==='skill'?'action':c.tag}" style="font-size:6px;">${_tl[c.tag]||c.tag}</span><span style="font-size:9px;color:var(--accent);margin-left:4px;">×${c.count}</span></div>`).join('');
  el.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><span style="font-family:var(--font-t);font-size:13px;color:var(--accent);">📦 내 덱 (${cards.length}장)</span><button class="btn" style="font-size:8px;padding:2px 8px;" onclick="document.getElementById('overlay-deck').remove()">✕ 닫기</button></div>${rows||'<div style="font-size:9px;color:var(--text3);font-family:var(--font-m);">덱이 비어있습니다.</div>'}`;
  document.body.appendChild(el);
}

function openOverlayRecipes(){
  const existing=document.getElementById('overlay-recipes');
  if(existing){existing.remove();return;}
  const el=document.createElement('div'); el.id='overlay-recipes';
  el.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--bg2);border:1px solid var(--border2);border-radius:12px;padding:14px;z-index:1200;max-width:380px;width:90vw;max-height:70vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.6);';
  const _orFree=allCards().some(c=>c.id==='sk_cr_g');
  const _orBCnt=allCards().filter(c=>c.id==='sk_cr_b').length;
  const rows=RECIPES.map(rec=>{
    const ok=canCraft(rec);
    const ap=_orFree?0:Math.max(1,rec.ap-_orBCnt);
    const apTxt=ap<rec.ap?`AP<span style="color:var(--green);">${ap}</span>`:`AP${ap}`;
    const costHtml=rec.cost.map(c=>{const d=CARD_MAP[c.id];const have=cntInDeck(c.id);return `<span style="color:${have>=c.n?'var(--green)':'var(--red)'};">${d?.icon||''}${d?.name||c.id}×${c.n}(${have})</span>`;}).join('+');
    return `<div style="padding:5px 0;border-bottom:1px solid var(--border);font-family:var(--font-m);"><div style="display:flex;gap:5px;align-items:center;"><span style="font-size:14px;">${rec.icon}</span><span style="font-size:9px;color:${ok?'var(--text)':'var(--text3)'};">${rec.name}</span><span style="margin-left:auto;font-size:7px;color:var(--text3);">${apTxt}</span></div><div style="font-size:8px;margin-top:2px;">${costHtml}</div></div>`;
  }).join('');
  el.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><span style="font-family:var(--font-t);font-size:13px;color:var(--purple);">📋 레시피 (${RECIPES.length}종)</span><button class="btn" style="font-size:8px;padding:2px 8px;" onclick="document.getElementById('overlay-recipes').remove()">✕ 닫기</button></div>${rows}`;
  document.body.appendChild(el);
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

function showIslandIntro(cb){
  const isl=ISLANDS[G.islandId]||ISLANDS.mangrove;
  document.getElementById('ii-icon').textContent=isl.icon;
  document.getElementById('ii-name').textContent=isl.name;
  document.getElementById('ii-sub').textContent=isl.subtitle;
  document.getElementById('ii-story').textContent=isl.story;
  document.getElementById('ii-mech').textContent=isl.mechanic;
  const hdrTitle=document.getElementById('hdr-title');
  if(hdrTitle){
    const firstTag=document.querySelector('#patch-mo .pn-tag');
    const ver=(firstTag?.textContent||'').trim().split(' ')[0]||'v0.2';
    hdrTitle.textContent=`🏝 무인도 탈출 ${ver}`;
  }
  const mapName=document.getElementById('map-island-name');
  if(mapName) mapName.textContent=isl.name;
  const mo=document.getElementById('island-intro-mo');
  const btn=mo.querySelector('button');
  if(btn&&cb){ btn.onclick=()=>{ mo.style.display='none'; cb(); }; }
  mo.style.display='flex';
}
