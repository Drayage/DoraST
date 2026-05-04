// ═══════════════ EXPLORE ═══════════════

let _exploreCallback=null;

function doExplore(){
  if(G.over) return;
  if(G.ap<2){log('AP부족 (탐색:AP2)','');render();return;}
  const t=G.tiles[G.pos];
  if(t.explored){log('이미 탐색한 지역이다.','');return;}
  G.ap-=2; t.explored=true;
  if(t.id==='oblivion_swamp') _swampDevour();
  const evtId=t.events[Math.floor(Math.random()*t.events.length)];
  if(ENEMIES[evtId]){ showEncounter(evtId); return; }
  const evt=EVENTS[evtId];
  if(!evt){log('이벤트 오류','danger');return;}
  showExploreChoice(evt);
}

function showExploreChoice(evt, callback){
  _exploreCallback=callback||null;
  // Use actual draw pile for probability; fall back to deck+disc only when draw pile is empty
  const baseDeck=G.deck.length?G.deck:allCards();
  const hasCompass=hasTool('compass');
  document.getElementById('ex-title').textContent=`${G.tiles[G.pos].icon} ${evt.name}`;
  document.getElementById('ex-flavor').textContent=evt.flavor;
  const el=document.getElementById('ex-choices'); el.innerHTML='';
  evt.choices.forEach(ch=>{
    let matchCnt;
    if(ch.req)         matchCnt=baseDeck.reduce((s,c)=>s+(c.tag===ch.req?1:0),0);
    else if(ch.subReq) matchCnt=baseDeck.reduce((s,c)=>s+((c.subTags||[]).includes(ch.subReq)?1:0),0);
    else               matchCnt=baseDeck.length;
    const deckLen=Math.max(1,baseDeck.length);
    const baseP=matchCnt/deckLen;
    let displayProb, compassNote='';
    if(ch.req||ch.subReq){
      if(hasCompass&&baseDeck.length>=2){
        // advantage: pick better of 2 draws → P(success) = 1-(1-p)²
        displayProb=Math.min(99,Math.round((1-(1-baseP)*(1-baseP))*100));
        compassNote=' 🧭';
      } else {
        displayProb=Math.min(99,Math.round(baseP*100));
      }
    } else {
      displayProb=100;
    }
    const probColor=displayProb>=70?'var(--green)':displayProb>=40?'var(--text2)':'var(--red)';
    const div=document.createElement('div'); div.className='ex-choice fi';
    const reqBadge=ch.req
      ?`<span class="card-tag tag-${ch.req}" style="font-size:8px;">${ch.req}판정</span>`
      :ch.subReq
        ?`<span class="sub-tag" style="font-size:8px;padding:2px 5px;">#${ch.subReq} 판정</span>`
        :`<span style="color:var(--green);font-size:8px;">✓ 무조건</span>`;
    const greatInfo=ch.greatCard
      ?`<span style="color:var(--accent);font-size:8px;"> ★ ${CARD_MAP[ch.greatCard]?.name} 뽑으면 대성공</span>`:'';
    const rTxt=fmtR(ch.reward), pTxt=ch.failPen?fmtP(ch.failPen):'', gTxt=ch.greatBonus?fmtR(ch.greatBonus):'';
    div.innerHTML=`
      <div class="ex-ci">${ch.icon}</div>
      <div>
        <div class="ex-cn">${ch.label}</div>
        <div class="ex-cd">${reqBadge} <span style="color:${probColor};">성공률≈${displayProb}%${compassNote}</span>${greatInfo}</div>
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
  if(r.cards) r.cards.forEach(c=>{const d=CARD_MAP[c.id];if(d)p.push(`${d.icon}${d.name}×${c.n||1}`);});
  if(r.san)        p.push(`정신력${r.san>=0?'+':''}${r.san}`);
  if(r.escape)     p.push(`탈출+${r.escape}%`);
  if(r.hun)        p.push(`허기+${r.hun}`);
  if(r.hp)         p.push(`HP+${r.hp}`);
  if(r.ap)         p.push(`AP+${r.ap}`);
  if(r.revealTile){const td=TILE_TYPES.find(t=>t.id===r.revealTile);p.push(`${td?.icon||'📍'}${td?.name||r.revealTile} 위치 표시`);}
  if(r.removeCard){const d=CARD_MAP[r.removeCard];p.push(`${d?.icon||''}${d?.name||r.removeCard} 소멸`);}
  if(r.devourCard){const d=CARD_MAP[r.devourCard];p.push(`${d?.icon||''}${d?.name||r.devourCard} 소멸(제물)`);}
  if(r.sacrifice){if(r.sacrifice.hp)p.push(`HP-${r.sacrifice.hp}`);if(r.sacrifice.san)p.push(`정신력-${r.sacrifice.san}`);}
  if(r.templeAtk) p.push(`보스전ATK+${r.templeAtk}`);
  if(r.templeDef) p.push(`보스전DEF+${r.templeDef}`);
  if(r.devourTopCard) p.push('자원카드 소멸');
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
  // devourTag: 해당 태그 카드를 덱 맨 위로 이동 후 소멸
  if(ch.devourTag&&G.deck.length){
    const pool=[...G.deck,...G.disc];
    const tagIdx=G.deck.findIndex(c=>c.tag===ch.devourTag);
    if(tagIdx<0){
      // 덱에 없으면 버림더미 포함해서 셔플
      const allTagged=[...G.deck,...G.disc].filter(c=>c.tag===ch.devourTag);
      if(allTagged.length){
        G.deck=shuffle([...G.deck,...G.disc]); G.disc=[];
        const ni=G.deck.findIndex(c=>c.tag===ch.devourTag);
        if(ni>=0&&ni!==G.deck.length-1){const t=G.deck[G.deck.length-1];G.deck[G.deck.length-1]=G.deck[ni];G.deck[ni]=t;}
      }
    } else if(tagIdx!==G.deck.length-1){
      const t=G.deck[G.deck.length-1];G.deck[G.deck.length-1]=G.deck[tagIdx];G.deck[tagIdx]=t;
    }
  }
  let top, compassExtra=null;
  const hasCompass=hasTool('compass');
  if(hasCompass&&G.deck.length>=2){
    const c1=G.deck[G.deck.length-1], c2=G.deck[G.deck.length-2];
    const score=c=>!c?-1:ch.greatCard&&c.id===ch.greatCard?3:ch.req&&c.tag===ch.req?2:ch.subReq&&(c.subTags||[]).includes(ch.subReq)?1:!ch.req&&!ch.subReq?1:0;
    const useSecond=score(c2)>score(c1);
    top=useSecond?c2:c1; compassExtra=useSecond?c1:c2;
    G.disc.push(G.deck.pop()); G.disc.push(G.deck.pop());
  } else {
    top=G.deck.length?G.deck[G.deck.length-1]:null;
    if(top) G.disc.push(G.deck.pop());
  }
  const primaryOk=ch.req?(top&&top.tag===ch.req):(!ch.subReq);
  const subOk=!!(ch.subReq&&top&&(top.subTags||[]).includes(ch.subReq));
  const success=primaryOk||subOk;
  const isGreat=!!(ch.greatCard&&top&&top.id===ch.greatCard);
  const escGain=Math.max(ch.reward?.escape||0, ch.greatBonus?.escape||0);
  const escLoss=Math.max(ch.failPen?.escape||0, 0);
  const escRelevant=escGain>0||escLoss>0;
  const canReach100=escGain>0&&(G.escape+escGain>=100);
  const slow=escRelevant&&G.escape>=70;
  const preFlipDelay=slow?(canReach100?950:650):400;
  const postFlipDelay=slow?(canReach100?950:650):500;
  const escBefore=G.escape;

  const cardEl=document.getElementById('jdg-card'), backEl=document.getElementById('jdg-back');
  cardEl.classList.remove('flipped'); backEl.className='jdg-back';
  ['jdg-res','jdg-det','jdg-bon','jdg-ok'].forEach(id=>document.getElementById(id).style.display='none');
  document.getElementById('jdg-title').textContent=ch.devourDrawn?'🪦 소멸 — 덱 맨 위 카드를 확인한다...':'🎴 덱 맨 위 카드를 뒤집는 중...';
  // 카드 딜 애니메이션 (기존 클래스 제거 → reflow → 재추가)
  const wrapEl=document.getElementById('jdg-wrap');
  wrapEl.classList.remove('jdg-deal'); void wrapEl.offsetWidth; wrapEl.classList.add('jdg-deal');
  {
    let reqTxt;
    if(ch.req&&ch.subReq) reqTxt=`요구: ${ch.req} 태그 또는 #${ch.subReq}`;
    else if(ch.req)       reqTxt=`요구 태그: ${ch.req}`;
    else if(ch.subReq)    reqTxt=`요구: #${ch.subReq} 카드 (보조 태그)`;
    else                  reqTxt='조건 없음 — 무조건 성공';
    document.getElementById('jdg-req').textContent=reqTxt;
  }
  document.getElementById('jdg-cicon').textContent=top?top.icon:'?';
  document.getElementById('jdg-cname').textContent=top?top.name:'덱 없음';
  document.getElementById('jdg-ctag').innerHTML=top?`<span class="card-tag tag-${top.tag}" style="font-size:7px;">${top.tag}</span>`:'';
  document.getElementById('jdg-mo').style.display='flex';

  setTimeout(()=>{
    cardEl.classList.add('flipped');
    backEl.classList.add(ch.devourDrawn?'fail':isGreat?'great':success?'ok':'fail');
    setTimeout(()=>{
      const resEl=document.getElementById('jdg-res');
      resEl.style.display='';
      const lines=[], bonLines=[];
      // 망각 카드 효과 + 종말 환각
      if(top&&top.id==='amnesia'){
        G.san=Math.max(0,G.san-3);
        flashDamage();
        bonLines.push('🌀 망각이 판정에 스며들었다. 정신력-3');
        if(G.doomPhase>=4&&Math.random()<0.35){
          addCard('amnesia',1);
          bonLines.push('🌀 환각이 퍼진다: 망각 카드 추가');
        }
      }
      if(G.doomPhase>=4&&G.san<40){
        const hRate=15+Math.max(0,40-G.san)*0.8;
        if(Math.random()*100<hRate){
          addCard('amnesia',1);
          bonLines.push('🌀 환각: 정체불명의 카드가 손안으로 스며들었다');
          log('🌀 환각 발동! 망각 카드가 덱에 추가됐다.','danger');
        }
      }
      if(compassExtra) bonLines.push(`🧭 나침반: ${compassExtra.icon}${compassExtra.name} 제외 → 유리한 카드 선택`);
      if(subOk&&!primaryOk) bonLines.push(`🏷️ #${ch.subReq} 보조 태그 매치 성공!`);
      if(ch.devourDrawn){
        const tagMatch=!ch.devourTag||(top&&top.tag===ch.devourTag);
        if(top&&tagMatch){
          resEl.className='jdg-res fail'; resEl.textContent='🪦 소멸 완료';
          const di=G.disc.findIndex(c=>c.uid===top.uid);
          if(di>=0) G.disc.splice(di,1);
          lines.push(`🪦 ${top.icon}${top.name} 영구 소멸`);
          log(`🪦 파편 정리: ${top.icon}${top.name} 소멸`,'danger');
        } else {
          resEl.className='jdg-res ok'; resEl.textContent='✓ 자원 카드 없음';
          lines.push(top?'자원 카드 없음':'덱이 비어있음');
        }
      } else if(isGreat){
        resEl.className='jdg-res great'; resEl.textContent='★ 대성공!';
        applyR(ch.reward,lines); applyR(ch.greatBonus,lines);
        bonLines.push(`★ ${CARD_MAP[ch.greatCard]?.name||ch.greatCard} 대성공 발동!`);
      } else if(success){
        resEl.className='jdg-res ok'; resEl.textContent='✓ 성공!';
        applyR(ch.reward,lines);
        if(hasTool('torch')&&ch.req==='tool'){
          if(!G.deck.length&&G.disc.length){G.deck=shuffle(G.disc);G.disc=[];}
          if(G.deck.length){const b=G.deck.pop();G.disc.push(b);bonLines.push(`🕯️ 횃불 패시브: ${b.icon}${b.name} 추가`);}
        }
      } else {
        resEl.className='jdg-res fail'; resEl.textContent='✗ 실패...';
        if(ch.failPen) applyPen(ch.failPen,lines); else lines.push('별다른 피해 없음');
      }
      // curseDeck: 선택 시 무조건 덱에 저주 카드 추가
      if(ch.curseDeck){
        addCard(ch.curseDeck,1);
        bonLines.push(`🌀 ${CARD_MAP[ch.curseDeck]?.name||ch.curseDeck}: 덱에 스며들었다`);
      }
      const detEl=document.getElementById('jdg-det');
      detEl.style.display=''; detEl.textContent=lines.join('\n');
      const bonEl=document.getElementById('jdg-bon');
      if(bonLines.length){bonEl.style.display='';bonEl.textContent=bonLines.join(' · ');}
      const okEl=document.getElementById('jdg-ok');
      okEl.onclick=()=>closeJdg();
      okEl.style.display='';
      if(G.escape!==escBefore) notifyEscapeChange(escBefore,G.escape,evt.name);
      log(`[${ch.devourDrawn?'소멸':isGreat?'대성공':success?'성공':'실패'}] ${evt.name} — ${lines.join(', ')}`,ch.devourDrawn?'danger':(isGreat||success)?'success':'danger');
      checkSurvival(); checkWin(); render();
    }, postFlipDelay);
  }, preFlipDelay);
}

function applyR(r, lines){
  if(!r) return;
  if(r.card){
    const d=CARD_MAP[r.card];
    lines.push(`${d?.icon||''}${d?.name||r.card}×${r.n||1}`);
    if(_pendingItems!=null){
      for(let i=0;i<(r.n||1);i++) _pendingItems.push({id:r.card,icon:d?.icon||'📦',name:d?.name||r.card,n:1});
    } else {
      addCard(r.card,r.n||1);
    }
  }
  if(r.cards){
    r.cards.forEach(c=>{
      const d=CARD_MAP[c.id];
      lines.push(`${d?.icon||''}${d?.name||c.id}×${c.n||1}`);
      if(c.force){
        // 강제 추가: 팝업 없이 즉시 덱에 추가 (선택 불가)
        addCard(c.id,c.n||1);
      } else if(_pendingItems!=null){
        for(let i=0;i<(c.n||1);i++) _pendingItems.push({id:c.id,icon:d?.icon||'📦',name:d?.name||c.id,n:1});
      } else {
        addCard(c.id,c.n||1);
      }
    });
  }
  if(r.san)        {G.san=Math.min(100,Math.max(0,G.san+r.san)); lines.push(r.san>=0?`정신력+${r.san}`:`정신력${r.san}`);}
  if(r.escape)     {G.escape=Math.min(100,G.escape+r.escape);lines.push(`탈출+${r.escape}%`);}
  if(r.hun)        {G.hun=Math.min(100,G.hun+r.hun);  lines.push(`허기+${r.hun}`);}
  if(r.hp)         {G.hp=Math.min(100,G.hp+r.hp);     lines.push(`HP+${r.hp}`);}
  if(r.ap)         {G.ap=Math.min(G.maxAP+4,G.ap+r.ap);lines.push(`AP+${r.ap}환급`);}
  if(r.revealTile) {
    const idx=G.tiles.findIndex(t=>t.id===r.revealTile);
    if(idx>=0&&!G.tiles[idx].revealed){ G.tiles[idx].revealed=true; const td=TILE_TYPES.find(t=>t.id===r.revealTile); lines.push(`${td?.icon||'📍'}${td?.name||r.revealTile} 위치 발견`); }
  }
  if(r.removeCard){
    const rd=CARD_MAP[r.removeCard];
    let di=G.disc.findIndex(c=>c.id===r.removeCard);
    if(di>=0){G.disc.splice(di,1);lines.push(`${rd?.icon||''}${rd?.name||r.removeCard} 소멸`);}
    else{di=G.deck.findIndex(c=>c.id===r.removeCard);if(di>=0){G.deck.splice(di,1);lines.push(`${rd?.icon||''}${rd?.name||r.removeCard} 소멸`);}
    else lines.push(`${rd?.name||r.removeCard} 없음`);}
  }
  if(r.devourCard){
    const rd=CARD_MAP[r.devourCard];
    let di=G.deck.findIndex(c=>c.id===r.devourCard);
    if(di>=0){G.deck.splice(di,1);lines.push(`${rd?.icon||''}${rd?.name||r.devourCard} 소멸(제물)`);}
    else{di=G.disc.findIndex(c=>c.id===r.devourCard);if(di>=0){G.disc.splice(di,1);lines.push(`${rd?.icon||''}${rd?.name||r.devourCard} 소멸(제물)`);}
    else lines.push(`(${rd?.name||r.devourCard} 없음)`);}
  }
  if(r.sacrifice){
    if(r.sacrifice.hp){G.hp=Math.max(0,G.hp-r.sacrifice.hp);lines.push(`HP-${r.sacrifice.hp}(제물)`);flashDamage();}
    if(r.sacrifice.san){G.san=Math.max(0,G.san-r.sacrifice.san);lines.push(`정신력-${r.sacrifice.san}(제물)`);}
  }
  if(r.templeAtk){if(!G._templeBonus)G._templeBonus={atk:0,def:0};G._templeBonus.atk+=r.templeAtk;lines.push(`보스전 ATK+${r.templeAtk}`);}
  if(r.templeDef) {if(!G._templeBonus)G._templeBonus={atk:0,def:0};G._templeBonus.def+=r.templeDef;lines.push(`보스전 DEF+${r.templeDef}`);}
  if(r.devourTopCard){
    const ti=G.deck.findIndex(c=>c.tag==='resource');
    if(ti>=0){const dc=G.deck.splice(ti,1)[0];lines.push(`${dc.icon}${dc.name} 소멸(제물)`);}
    else{
      const ti2=G.disc.findIndex(c=>c.tag==='resource');
      if(ti2>=0){const dc=G.disc.splice(ti2,1)[0];lines.push(`${dc.icon}${dc.name} 소멸(제물)`);}
      else lines.push('(자원 카드 없음)');
    }
  }
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
  const cb=_exploreCallback; _exploreCallback=null;
  if(_pendingItems&&_pendingItems.length){
    const items=[..._pendingItems]; _pendingItems=null;
    showItemPopup(items,'🎁 탐색 획득!', cb||null);
  } else {
    _pendingItems=null;
    if(cb) setTimeout(cb,100);
  }
  saveGame();
}
