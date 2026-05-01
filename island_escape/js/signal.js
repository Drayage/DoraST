// ═══════════════ SIGNAL / OBLIVION ═══════════════

// ── 전망대: 신호탄 탐색 ──
function doFlareSearch(){
  if(G.over) return;
  if(G.ap<2){log('AP부족 (신호탄 탐색:AP2)','danger');return;}
  const kit=allCards().find(c=>c.id==='flare_kit');
  if(!kit){log('🧨 신호탄 키트가 없다. 캠프에서 제작해야 한다.','danger');return;}

  G.ap-=2;
  // 덱 5장 드로우
  const drawn=drawToHand(5);
  G.disc.push(...drawn);

  const hit=drawn.some(c=>c.id==='flare_kit');
  if(hit){
    addCard('signal',1);
    log(`🎆 신호탄 성공! 구조신호 획득 (5장 중 키트 발견: ${drawn.map(c=>c.icon).join('')})`, 'success');
  } else {
    log(`🧨 신호 실패. 키트가 나오지 않았다 (${drawn.map(c=>c.icon).join('')})`, '');
  }
  render();
}

// ── 전망대: 구조신호 발사 ──
function attemptSignalEscape(){
  if(G.over) return;
  if(G.ap<3){log('AP부족 (구조신호 발사:AP3)','danger');return;}
  const sigCnt=allCards().filter(c=>c.id==='signal').length;
  if(!sigCnt){log('🎆 구조신호가 없다. 신호탄 탐색으로 먼저 획득해야 한다.','danger');return;}

  G.ap-=3;
  const pool=[...G.deck,...G.disc];
  const shuffled=shuffle([...pool]);
  const drawn=shuffled.slice(0,Math.min(10,shuffled.length));
  const count=drawn.filter(c=>c.id==='signal').length;

  _showSignalResultModal(drawn, count);
  render();
}

function _showSignalResultModal(drawn, count){
  const mo=document.getElementById('sigres-mo');
  if(!mo) return;
  const success=count>=5;
  document.getElementById('sigres-title').textContent=success?'🎆 구조신호 발사 성공!':'🆘 신호 부족 — 실패';
  document.getElementById('sigres-title').style.color=success?'var(--green)':'var(--red)';
  document.getElementById('sigres-count').textContent=`${count} / ${drawn.length}장 — ${success?'구조선이 신호를 포착했다!':'5장 이상 필요'}`;
  document.getElementById('sigres-count').style.color=success?'var(--green)':'var(--accent)';
  const cardsEl=document.getElementById('sigres-cards');
  cardsEl.innerHTML=drawn.map(c=>{
    const hi=c.id==='signal';
    return `<span style="display:inline-block;font-size:20px;margin:2px;${hi?'filter:drop-shadow(0 0 6px #40e080);':'opacity:.5;'}" title="${c.name}">${c.icon}</span>`;
  }).join('');
  const okBtn=document.getElementById('sigres-ok');
  okBtn.onclick=()=>{
    mo.style.display='none';
    if(success){
      G.signalEscape=true;
      G.escape=100;
      checkWin();
    }
  };
  mo.style.display='flex';
}

// ── 망각의 호수: 망각 행동 ──
function doOblivion(){
  if(G.over) return;
  if(G.day-(G.lastOblivion||-99)<3){
    log(`🌑 아직 망각의 힘이 차오르지 않았다. (쿨다운: ${3-(G.day-(G.lastOblivion||-99))}일 남음)`,'');
    return;
  }
  if(G.ap<2){log('AP부족 (망각:AP2)','danger');return;}

  // 덱+버림더미에서 3장 드로우
  const pool=[...G.deck,...G.disc];
  if(!pool.length){log('🌑 덱이 비어있다.','');return;}

  const drawn=drawToHand(Math.min(3,pool.length));
  // drawn cards are now removed from deck/disc; show modal for selection
  _showOblivionModal(drawn);
}

function _showOblivionModal(drawn){
  const mo=document.getElementById('oblivion-mo');
  if(!mo) return;
  const listEl=document.getElementById('oblivion-cards');
  listEl.innerHTML='';
  drawn.forEach((card,i)=>{
    const div=document.createElement('div');
    div.className='oblivion-card-pick';
    div.innerHTML=`<div style="font-size:28px;">${card.icon}</div>
      <div style="font-size:10px;font-weight:700;color:var(--text);margin-top:3px;">${card.name}</div>
      <div class="card-tag tag-${card.tag}" style="font-size:7px;display:inline-block;margin-top:2px;">${card.tag}</div>
      <div style="font-size:8px;color:var(--red);margin-top:4px;font-family:var(--font-m);">클릭 → 소멸</div>`;
    div.onclick=()=>{
      mo.style.display='none';
      const rest=drawn.filter((_,j)=>j!==i);
      _confirmOblivion(card, rest);
    };
    listEl.appendChild(div);
  });
  mo.style.display='flex';
}

function _confirmOblivion(chosen, rest){
  // rest는 버림더미로, chosen은 영구 소멸
  G.disc.push(...rest);
  G.lastOblivion=G.day;
  G.ap-=2;
  log(`🌑 망각: ${chosen.icon}${chosen.name} 영구 소멸`, 'danger');
  render();
}

// ── 망각의 늪: 탐색 시 무작위 카드 소멸 ──
function _swampDevour(){
  const pool=[...G.deck,...G.disc];
  if(!pool.length){ log('🕳️ 늪이 삼키려 했으나 덱이 비어있다.',''); return; }
  const victim=pool[Math.floor(Math.random()*pool.length)];
  // 덱 또는 버림더미에서 제거
  const di=G.deck.findIndex(c=>c.uid===victim.uid);
  if(di>=0) G.deck.splice(di,1);
  else { const dsi=G.disc.findIndex(c=>c.uid===victim.uid); if(dsi>=0) G.disc.splice(dsi,1); }
  log(`🕳️ 망각의 늪: ${victim.icon}${victim.name} 이(가) 삼켜졌다. (영구 소멸)`, 'danger');
  flashDamage();
  _showSwampToast(victim);
}

function _showSwampToast(victim){
  const el=document.createElement('div');
  el.className='swamp-toast';
  el.textContent=`🕳️ ${victim.icon} ${victim.name} 소멸`;
  document.body.appendChild(el);
  setTimeout(()=>{ if(el.parentNode) el.remove(); }, 2800);
}
