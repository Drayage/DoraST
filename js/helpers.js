// ═══════════════ HELPERS ═══════════════

function uid(){ return Math.random().toString(36).slice(2); }
function shuffle(a){ for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

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
  const def=CARDS.find(c=>c.id===id); if(!def) return;
  for(let i=0;i<n;i++){
    const card={...def, uid:uid()};
    if(def.dur) card.curDur=def.dur;
    G.disc.push(card);
  }
}

function drawCards(n){
  for(let i=0;i<n;i++){
    if(!G.deck.length){ if(!G.disc.length) break; G.deck=shuffle([...G.disc]); G.disc=[]; }
    if(G.deck.length) G.disc.push(G.deck.pop());
  }
}

function cntInDeck(id){ return [...G.deck,...G.disc].filter(c=>c.id===id).length; }

function rmFromDeck(id, n){
  let r=n;
  G.disc=G.disc.filter(c=>{ if(c.id===id&&r>0){r--;return false;} return true; });
  G.deck=G.deck.filter(c=>{ if(c.id===id&&r>0){r--;return false;} return true; });
}

function canCraft(rec){ return rec.cost.every(c=>cntInDeck(c.id)>=c.n); }

function hasTool(id){ return [...G.deck,...G.disc].some(c=>c.id===id); }
