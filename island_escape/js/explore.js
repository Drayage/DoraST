// ═══════════════ EXPLORE ═══════════════

function doExplore(){
  if(G.over) return;
  if(G.ap<2){log('AP부족 (탐색:AP2)','');render();return;}
  const t=G.tiles[G.pos];
  if(t.explored){log('이미 탐색한 지역이다.','');return;}
  G.ap-=2; t.explored=true;
  const evtId=t.events[Math.floor(Math.random()*t.events.length)];
  if(ENEMIES[evtId]){ startCombat(evtId); return; }
  const evt=EVENTS[evtId];
  if(!evt){log('이벤트 오류','danger');return;}
  showExploreChoice(evt);
}

function showExploreChoice(evt){
  const cards=allCards();
  document.getElementById('ex-title').textContent=`${G.tiles[G.pos].icon} ${evt.name}`;
  document.getElementById('ex-flavor').textContent=evt.flavor;
  const el=document.getElementById('ex-choices'); el.innerHTML='';
  evt.choices.forEach(ch=>{
    const matchCnt=ch.req?cards.reduce((s,c)=>s+(c.tag===ch.req?1:0),0):99;
    const prob=ch.req?Math.min(99,Math.round(matchCnt/Math.max(1,cards.length)*100)):100;
    const div=document.createElement('div'); div.className='ex-choice fi';
    const reqBadge=ch.req
      ?`<span class="card-tag tag-${ch.req}" style="font-size:8px;">${ch.req}판정</span>`
      :`<span style="color:var(--green);font-size:8px;">✓ 무조건</span>`;
    const greatInfo=ch.greatCard
      ?`<span style="color:var(--accent);font-size:8px;"> ★ ${CARD_MAP[ch.greatCard]?.name} 뽑으면 대성공</span>`:'';
    const rTxt=fmtR(ch.reward), pTxt=ch.failPen?fmtP(ch.failPen):'', gTxt=ch.greatBonus?fmtR(ch.greatBonus):'';
    div.innerHTML=`
      <div class="ex-ci">${ch.icon}</div>
      <div>
        <div class="ex-cn">${ch.label}</div>
        <div class="ex-cd">${reqBadge} <span style="color:var(--text3);">성공률≈${prob}%</span>${greatInfo}</div>
        <div class="ex-cd">${ch.desc}</div>
        <div style="font-size:8px;margin-top:3px;">
          ${rTxt?`<span style="color:var(--green);">✓ ${rTxt}</span>`:''}
          ${pTxt?`<span style="color:var(--red);margin-left:6px;">✗ ${pTxt}</span>`:''}
          ${gTxt?`<span style="color:var(--accent);margin-left:6px;">★ ${gTxt}</span>`:''}
        </div>
      </div>`;
    div.onclick=()=>{ document.getElementById('ex-mo').style.display='none'; doJudgment(evt,ch); };
    el.appendChild(div);
  });
  document.getElementById('ex-mo').style.display='flex';
}

function fmtR(r){
  if(!r) return '';
  const p=[];
  if(r.card){const d=CARD_MAP[r.card];if(d)p.push(`${d.icon}${d.name}×${r.n||1}`);}
  if(r.san)   p.push(`정신력+${r.san}`);
  if(r.escape)p.push(`탈출+${r.escape}%`);
  if(r.hun)   p.push(`허기+${r.hun}`);
  if(r.hp)    p.push(`HP+${r.hp}`);
  if(r.ap)    p.push(`AP+${r.ap}`);
  return p.join(' ');
}

function fmtP(p){
  const a=[];
  if(p.hp)    a.push(`HP${p.hp}`);
  if(p.hun)   a.push(`허기${p.hun}`);
  if(p.san)   a.push(`정신력${p.san}`);
  if(p.escape)a.push(`탈출-${p.escape}%`);
  return a.join(' ');
}

function doJudgment(evt, ch){
  _pendingItems=[];
  if(!G.deck.length&&G.disc.length){G.deck=shuffle(G.disc);G.disc=[];}
  const top=G.deck.length?G.deck[G.deck.length-1]:null;
  const success=!ch.req||(top&&top.tag===ch.req);
  const isGreat=!!(ch.greatCard&&top&&top.id===ch.greatCard);
  if(top) G.disc.push(G.deck.pop());

  const cardEl=document.getElementById('jdg-card'), backEl=document.getElementById('jdg-back');
  cardEl.classList.remove('flipped'); backEl.className='jdg-back';
  ['jdg-res','jdg-det','jdg-bon','jdg-ok'].forEach(id=>document.getElementById(id).style.display='none');
  document.getElementById('jdg-title').textContent='🎴 덱 맨 위 카드를 뒤집는 중...';
  document.getElementById('jdg-req').textContent=ch.req?`요구 태그: ${ch.req}`:'조건 없음 — 무조건 성공';
  document.getElementById('jdg-cicon').textContent=top?top.icon:'?';
  document.getElementById('jdg-cname').textContent=top?top.name:'덱 없음';
  document.getElementById('jdg-ctag').innerHTML=top?`<span class="card-tag tag-${top.tag}" style="font-size:7px;">${top.tag}</span>`:'';
  document.getElementById('jdg-mo').style.display='flex';

  setTimeout(()=>{
    cardEl.classList.add('flipped');
    backEl.classList.add(isGreat?'great':success?'ok':'fail');
    setTimeout(()=>{
      const resEl=document.getElementById('jdg-res');
      resEl.style.display='';
      const lines=[], bonLines=[];
      if(isGreat){
        resEl.className='jdg-res great'; resEl.textContent='★ 대성공!';
        applyR(ch.reward,lines); applyR(ch.greatBonus,lines);
        bonLines.push(`★ ${CARD_MAP[ch.greatCard]?.name||ch.greatCard} 대성공 발동!`);
      } else if(success){
        resEl.className='jdg-res ok'; resEl.textContent='✓ 성공!';
        applyR(ch.reward,lines);
        if(hasTool('torch')&&ch.req==='tool'){
          if(!G.deck.length&&G.disc.length){G.deck=shuffle(G.disc);G.disc=[];}
          if(G.deck.length){const b=G.deck.pop();G.disc.push(b);bonLines.push(`🔦 횃불 패시브: ${b.icon}${b.name} 추가`);}
        }
      } else {
        resEl.className='jdg-res fail'; resEl.textContent='✗ 실패...';
        if(ch.failPen) applyPen(ch.failPen,lines); else lines.push('별다른 피해 없음');
      }
      const detEl=document.getElementById('jdg-det');
      detEl.style.display=''; detEl.textContent=lines.join('\n');
      const bonEl=document.getElementById('jdg-bon');
      if(bonLines.length){bonEl.style.display='';bonEl.textContent=bonLines.join(' · ');}
      document.getElementById('jdg-ok').style.display='';
      log(`[${isGreat?'대성공':success?'성공':'실패'}] ${evt.name} — ${lines.join(', ')}`,(isGreat||success)?'success':'danger');
      checkSurvival(); checkWin(); render();
    }, 500);
  }, 400);
}

function applyR(r, lines){
  if(!r) return;
  if(r.card){addCard(r.card,r.n||1);const d=CARD_MAP[r.card];lines.push(`${d?.icon||''}${d?.name||r.card}×${r.n||1}`);if(_pendingItems)_pendingItems.push({icon:d?.icon||'📦',name:d?.name||r.card,n:r.n||1});}
  if(r.san)   {G.san=Math.min(100,G.san+r.san);  lines.push(`정신력+${r.san}`);}
  if(r.escape){G.escape=Math.min(100,G.escape+r.escape);lines.push(`탈출+${r.escape}%`);}
  if(r.hun)   {G.hun=Math.min(100,G.hun+r.hun);  lines.push(`허기+${r.hun}`);}
  if(r.hp)    {G.hp=Math.min(100,G.hp+r.hp);     lines.push(`HP+${r.hp}`);}
  if(r.ap)    {G.ap=Math.min(G.maxAP+4,G.ap+r.ap);lines.push(`AP+${r.ap}환급`);}
}

function applyPen(p, lines){
  if(p.hp)    {G.hp=Math.max(0,G.hp+p.hp);     lines.push(`HP${p.hp}`);if(p.hp<0)flashDamage();}
  if(p.hun)   {G.hun=Math.max(0,G.hun+p.hun);  lines.push(`허기${p.hun}`);}
  if(p.san)   {G.san=Math.max(0,G.san+p.san);  lines.push(`정신력${p.san}`);if(p.san<0)flashDamage();}
  if(p.card)  {addCard(p.card,1);               lines.push(`${p.card}카드추가`);}
  if(p.escape){G.escape=Math.max(0,G.escape-p.escape);lines.push(`탈출-${p.escape}%`);}
}

function closeJdg(){
  document.getElementById('jdg-mo').style.display='none';
  if(_pendingItems&&_pendingItems.length){
    const items=[..._pendingItems]; _pendingItems=null;
    showItemPopup(items,'🎁 탐색 획득!',null);
  } else {
    _pendingItems=null;
  }
}
