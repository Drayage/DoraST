// ═══════════════ USE CARD ═══════════════

function openUseCard(){
  if(G.over) return;
  if(G.ap<1){log('AP부족 (카드사용:AP1)','danger');render();return;}
  G.ap-=1;
  const ropeCnt=allCards().filter(c=>c.id==='rope').length;
  const beachCampCnt=G.camps.filter(cp=>G.tiles[cp].id==='beach').length;
  const drawN=5+ropeCnt+beachCampCnt;
  _ucHand=drawToHand(drawN);
  if(!_ucHand.length){log('덱이 비어있다.','danger');G.ap+=1;render();return;}
  const bonusDesc=(ropeCnt?` (🪢밧줄+${ropeCnt})`:'')+(beachCampCnt?` (🏖️해변캠프+${beachCampCnt})`:'');
  document.getElementById('uc-sub').textContent=`${_ucHand.length}장 드로우${bonusDesc} — 사용할 카드 선택`;
  document.getElementById('uc-result').textContent='';
  document.getElementById('uc-mo').style.display='flex';
  renderUcCards(); render();
}

function renderUcCards(){
  const el=document.getElementById('uc-cards'); el.innerHTML='';
  _ucHand.forEach((card,i)=>{
    const usable=!!card.use||card.tag==='action';
    const kBoost=hasTool('knife')?8:0;
    const durStr=card.dur?`<div style="font-size:8px;color:var(--accent);font-family:var(--font-m);">🔋${card.curDur||card.dur}/${card.dur}</div>`:'';
    const useLabels={eat:`🍗허기+${22+kBoost}`,drink:'💧갈증+28',heal:'🌿HP+10',_action:'🏃2장 드로우'};
    const div=document.createElement('div');
    div.style.cssText=`background:var(--bg3);border:1px solid ${usable?'var(--green2)':'var(--border)'};border-radius:9px;padding:10px 8px;width:90px;text-align:center;cursor:${usable?'pointer':'default'};opacity:${usable?1:0.5};transition:all .12s;`;
    div.innerHTML=`<div style="font-size:24px;margin-bottom:4px;">${card.icon}</div>
      <div style="font-size:8px;font-weight:700;color:var(--text);margin-bottom:2px;">${card.name}</div>
      <div class="card-tag tag-${card.tag}" style="font-size:6px;display:inline-block;margin-bottom:4px;">${card.tag}</div>
      <div style="font-size:7px;color:var(--text3);font-family:var(--font-m);">A${card.atk} D${card.def}</div>
      ${durStr}
      ${usable?`<div style="margin-top:4px;font-size:8px;color:var(--green);font-family:var(--font-m);">${card.tag==='action'?useLabels._action:(useLabels[card.use]||'')}</div>`
              :'<div style="font-size:7px;color:var(--text3);margin-top:4px;">사용불가</div>'}`;
    if(usable) div.onclick=()=>ucUse(i);
    div.addEventListener('mouseenter',()=>showTT(card,div));
    div.addEventListener('mouseleave',hideTT);
    el.appendChild(div);
  });
}

function ucUse(i){
  const card=_ucHand[i]; if(!card) return;
  // 행동 카드 처리
  if(card.tag==='action'){
    const before=_ucHand.length;
    _ucHand.splice(i,1);
    G.disc.push({...card});
    drawNCards(2, _ucHand);
    const drawn=_ucHand.length-before+1;
    log(`🏃 달리기: ${drawn}장 드로우`,'success');
    renderUcCards(); checkSurvival(); render(); return;
  }
  if(!card.use) return;
  const resEl=document.getElementById('uc-result');
  const kBoost=hasTool('knife')?8:0;
  if(card.use==='eat'){
    const g=22+kBoost; G.hun=Math.min(100,G.hun+g);
    resEl.textContent=`🍗 ${card.name} — 허기+${g}${kBoost?` (🔪+${kBoost})`:''}`;
    resEl.style.color='var(--accent)';
    log(`🍗 섭취. 허기+${g}`,'success');
  } else if(card.use==='drink'){
    G.thi=Math.min(100,G.thi+28);
    resEl.textContent='💧 물 음용 — 갈증+28';
    resEl.style.color='var(--blue)';
    log('💧 음용. 갈증+28','success');
  } else if(card.use==='heal'){
    G.hp=Math.min(100,G.hp+10);
    resEl.textContent='🌿 약초 — HP+10';
    resEl.style.color='var(--green)';
    log('🌿 약초. HP+10','success');
  }
  if(card.dur){
    card.curDur=(card.curDur||card.dur)-1;
    if(card.curDur<=0){
      _ucHand.splice(i,1);
      log(`${card.icon} ${card.name} 소진 — 덱에서 제거`,'');
    } else {
      G.disc.push(..._ucHand.splice(i,1));
      log(`${card.icon} 내구도 ${card.curDur}/${card.dur} 남음`,'');
    }
  } else {
    G.disc.push(..._ucHand.splice(i,1));
  }
  renderUcCards(); checkSurvival(); render();
}

function closeUseCard(){
  G.disc.push(..._ucHand); _ucHand=[];
  document.getElementById('uc-mo').style.display='none';
  document.getElementById('tt').style.display='none';
  render();
}
