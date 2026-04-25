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
