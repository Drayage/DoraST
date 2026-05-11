// ═══════════════ USE CARD ═══════════════

let _prevUcHandUIDs=new Set();

function openUseCard(){
  if(G.over) return;
  if(G.ap<1){log('AP부족 (카드사용:AP1)','danger');render();return;}
  G.ap-=1;
  if(!G.actionCnt) G.actionCnt={move:0,explore:0,gather:0,camp:0,craft:0,carduse:0,sleep:0,combat:0};
  G.actionCnt.carduse=(G.actionCnt.carduse||0)+1;
  const ropeCnt=allCards().filter(c=>c.id==='rope').length;
  const campDouble=allCards().some(c=>c.id==='sk_cp_g');
  const rawBeachCnt=G.camps.filter(cp=>G.tiles[cp].id==='beach').length;
  const beachCampCnt=rawBeachCnt*(campDouble?2:1);
  const _cuS1Cnt=allCards().filter(c=>c.id==='sk_cu_s1').length;
  const skillDrawBonus=3*_cuS1Cnt;
  const drawN=5+ropeCnt+beachCampCnt+skillDrawBonus;
  _ucHand=drawToHand(drawN);
  if(!_ucHand.length){log('덱이 비어있다.','danger');G.ap+=1;render();return;}
  _prevUcHandUIDs=new Set();
  const bonusDesc=(ropeCnt?` (🪢밧줄+${ropeCnt})`:'')+(rawBeachCnt?` (🏖️해변캠프+${beachCampCnt}${campDouble?' 🏰×2':''})`:'')+(skillDrawBonus?` (🔀손놀림+${skillDrawBonus})`:'');
  document.getElementById('uc-sub').textContent=`${_ucHand.length}장 드로우${bonusDesc} — 사용할 카드 선택`;
  document.getElementById('uc-result').textContent='';
  document.getElementById('uc-mo').style.display='flex';
  renderUcCards(); render();
}

function renderUcCards(){
  const el=document.getElementById('uc-cards'); el.innerHTML='';
  const _curUcUIDs=new Set(_ucHand.map(c=>c.uid));
  let _ucAnimIdx=0;
  _ucHand.forEach((card,i)=>{
    const usable=(!!card.use||card.tag==='action')&&card.id!=='flare_kit'&&card.id!=='signal';
    const kBoost=hasTool('knife')?8:0;
    const durStr=card.dur?`<div style="font-size:8px;color:var(--accent);font-family:var(--font-m);">🔋${card.curDur||card.dur}/${card.dur}</div>`:'';
    const gsHp=allCards().some(c=>c.id==='sk_cp_s3')?20:10, gsSan=allCards().some(c=>c.id==='sk_cp_s3')?16:8;
    const useLabels={eat_rotten:'🤢HP-5·정신력-3',eat:`🍗허기+${22+kBoost}`,drink:'💧갈증+28',heal:'🌿HP+10',good_sleep:`😪HP+${gsHp}·정신력+${gsSan}`,temple_map:'🏛️사원 위치 표시',lure:'🪤야생 동물 유인 → 전투!',_action:'🏃2장 드로우',sk_ex_reexplore:'📖재탐색 활성화',sk_ga_spot:'🎒현장채집(AP1)',sk_cr_anywhere:'🗂️이동 제작소',sk_cu_peek:'👁️덱 미리보기',sk_cu_discard:'🌀손 카드 1장 소멸',sk_sl_wake:'⏰AP+10(1회용)',sk_cb_strike:'💥전투에서만 사용 가능'};
    const div=document.createElement('div');
    div.style.cssText=`background:var(--bg3);border:1px solid ${usable?'var(--green2)':'var(--border)'};border-radius:9px;padding:10px 8px;width:90px;text-align:center;cursor:${usable?'pointer':'default'};opacity:${usable?1:0.5};transition:all .12s;`;
    if(!_prevUcHandUIDs.has(card.uid)){
      div.classList.add('card-draw');
      div.style.animationDelay=(_ucAnimIdx++*80)+'ms';
    }
    const _ucTagLbl={resource:'자원',tool:'도구',combat:'전투',action:'행동',skill:'행동',status:'상태'};
    const _ucTagCls=card.tag==='skill'?'action':card.tag;
    div.innerHTML=`<div style="font-size:24px;margin-bottom:4px;">${card.icon}</div>
      <div style="font-size:8px;font-weight:700;color:var(--text);margin-bottom:2px;">${card.name}</div>
      <div class="card-tag tag-${_ucTagCls}" style="font-size:6px;display:inline-block;margin-bottom:4px;">${_ucTagLbl[card.tag]||card.tag}</div>
      <div style="font-size:7px;color:var(--text3);font-family:var(--font-m);">A${card.atk} D${card.def}</div>
      ${durStr}
      ${usable?`<div style="margin-top:4px;font-size:8px;color:var(--green);font-family:var(--font-m);">${card.tag==='action'?useLabels._action:(useLabels[card.use]||'')}</div>`
              :'<div style="font-size:7px;color:var(--text3);margin-top:4px;">사용불가</div>'}`;
    if(usable) div.onclick=()=>ucUse(i);
    div.addEventListener('mouseenter',()=>showTT(card,div));
    div.addEventListener('mouseleave',hideTT);
    el.appendChild(div);
  });
  _prevUcHandUIDs=_curUcUIDs;
}

function ucUse(i){
  const card=_ucHand[i]; if(!card) return;
  if(card.id==='flare_kit'||card.id==='signal'){
    document.getElementById('uc-result').textContent=`${card.icon} ${card.name} — 전망대(🗼)에서만 사용 가능`;
    document.getElementById('uc-result').style.color='var(--red)';
    return;
  }
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
  const _cuS2Cnt=allCards().filter(c=>c.id==='sk_cu_s2').length;
  const foodBonus=8*_cuS2Cnt;
  if(card.use==='eat_rotten'){
    G.hp=Math.max(0,G.hp-5); G.san=Math.max(0,G.san-3);
    flashDamage();
    resEl.textContent='🤢 썩은 음식 — HP-5, 정신력-3 (균사에 오염됐다)';
    resEl.style.color='var(--red)';
    log('🤢 썩은 음식 섭취. HP-5, 정신력-3','danger');
  } else if(card.use==='eat'){
    const g=22+kBoost+foodBonus; G.hun=Math.min(100,G.hun+g);
    resEl.textContent=`🍗 ${card.name} — 허기+${g}${kBoost?` (🔪+${kBoost})`:''}${foodBonus?` (🍴+${foodBonus})`:''}`;
    resEl.style.color='var(--accent)';
    log(`🍗 섭취. 허기+${g}`,'success');
  } else if(card.use==='drink'){
    const w=28+foodBonus; G.thi=Math.min(100,G.thi+w);
    resEl.textContent=`💧 물 음용 — 갈증+${w}${foodBonus?` (🍴+${foodBonus})`:''}`;
    resEl.style.color='var(--blue)';
    log(`💧 음용. 갈증+${w}`,'success');
  } else if(card.use==='heal'){
    G.hp=Math.min(100,G.hp+10);
    resEl.textContent='🌿 약초 — HP+10';
    resEl.style.color='var(--green)';
    log('🌿 약초. HP+10','success');
  } else if(card.use==='good_sleep'){
    const cpS3=allCards().some(c=>c.id==='sk_cp_s3');
    const gsHp=cpS3?20:10, gsSan=cpS3?16:8;
    G.hp=Math.min(100,G.hp+gsHp);
    G.san=Math.min(100,G.san+gsSan);
    resEl.textContent=`😪 꿀잠 — HP+${gsHp}, 정신력+${gsSan}${cpS3?' (🔥2배)':''}`;
    resEl.style.color='var(--green)';
    log(`😪 꿀잠. HP+${gsHp}, 정신력+${gsSan}`,'success');
  } else if(card.use==='temple_map'){
    const ti=G.tiles.findIndex(t=>t.id==='temple');
    if(ti>=0&&!G.templeRevealed){
      G.templeRevealed=true;
      G.tiles[ti].revealed=true;
      resEl.textContent='🏛️ 사원지도 — 사원 위치가 밝혀졌다!';
      resEl.style.color='var(--accent)';
      log('🏛️ 사원의 위치가 지도에 표시됐다!','success');
    } else if(ti>=0&&G.templeRevealed){
      resEl.textContent='🏛️ 사원 위치는 이미 알려져 있다.';
      resEl.style.color='var(--text3)';
    } else {
      resEl.textContent='🏛️ 이 섬에 사원이 없다.';
      resEl.style.color='var(--text3)';
    }
    render();
  } else if(card.use==='sk_ex_reexplore'){
    G.tiles[G.pos].explored=false;
    resEl.textContent='📖 기억: 현재 타일 재탐색 가능';
    resEl.style.color='var(--green)';
    log('📖 재탐색 활성화','success');
  } else if(card.use==='sk_ga_spot'){
    if(G.ap<1){resEl.textContent='AP 부족';resEl.style.color='var(--red)';return;}
    G.ap-=1;
    const t=G.tiles[G.pos]; const glist=t.gather||[];
    if(!glist.length){G.ap+=1;resEl.textContent='수집 가능한 자원 없음 (AP 환급)';resEl.style.color='var(--text3)';return;}
    const opt=glist[Math.floor(Math.random()*glist.length)];
    const d=CARD_MAP[opt.res];
    const n=Math.random()<0.25?2:1;
    addCard(opt.res,n);
    resEl.textContent=`🎒 현장채집: ${d?.name||opt.res}×${n}${n>1?' (행운!)':''}`;
    resEl.style.color='var(--green)';
    log(`🎒 현장채집: ${d?.icon||''}${d?.name||opt.res}×${n}`,'success');
  } else if(card.use==='sk_cr_anywhere'){
    G.skillCraftBypass=true;
    resEl.textContent='🗂️ 이동 제작소: 다음 제작은 캠프 불필요';
    resEl.style.color='var(--green)';
    log('🗂️ 이동 제작소 활성화','success');
  } else if(card.use==='sk_cu_peek'){
    const peekCards=[];
    for(let p=0;p<3;p++){
      if(!G.deck.length&&G.disc.length){G.deck=shuffle(G.disc);G.disc=[];}
      if(G.deck.length) peekCards.push(G.deck.pop());
    }
    if(!peekCards.length){resEl.textContent='덱이 비어있다.';resEl.style.color='var(--text3)';return;}
    resEl.textContent='👁️ 선견지명: 카드를 선택하세요';
    resEl.style.color='var(--accent)';
    _showPeekChoices(peekCards);
    return;
  } else if(card.use==='sk_cu_discard'){
    if(!_ucHand.length){resEl.textContent='손패에 카드가 없다.';resEl.style.color='var(--text3)';return;}
    const tgtIdx=Math.floor(Math.random()*_ucHand.length);
    const tgt=_ucHand[tgtIdx];
    _ucHand.splice(tgtIdx,1);
    resEl.textContent=`🌀 소멸: ${tgt.icon}${tgt.name}`;
    resEl.style.color='var(--accent)';
    log(`🌀 신속한 손: ${tgt.icon}${tgt.name} 소멸`,'success');
    renderUcCards(); checkSurvival(); render(); return;
  } else if(card.use==='sk_sl_wake'){
    G.ap=Math.min(G.maxAP+4,G.ap+10);
    resEl.textContent='⏰ 꿈에서 깨다: AP+10 회복';
    resEl.style.color='var(--green)';
    log('⏰ 꿈에서 깨다. AP+10','success');
  } else if(card.use==='sk_cb_strike'){
    resEl.textContent='💥 힘을 담은 일격은 전투 핸드에서만 사용 가능합니다.';
    resEl.style.color='var(--red)';
    return;
  } else if(card.use==='lure'){
    const _lurePool=['cbt_boar','cbt_snake','cbt_bat','cbt_ghost'];
    const evtId=_lurePool[Math.floor(Math.random()*_lurePool.length)];
    const e=ENEMIES[evtId];
    log(`🪤 유인 미끼: ${e.icon}${e.name}이(가) 나타났다!`,'danger');
    // durability
    if(card.dur){ card.curDur=(card.curDur||card.dur)-1; if(card.curDur<=0) _ucHand.splice(i,1); else G.disc.push(..._ucHand.splice(i,1)); }
    else G.disc.push(..._ucHand.splice(i,1));
    G.disc.push(..._ucHand); _ucHand=[];
    _prevUcHandUIDs=new Set();
    document.getElementById('uc-mo').style.display='none';
    checkSurvival(); render();
    setTimeout(()=>startCombat(evtId,true,true,{...ENEMIES[evtId],noFlee:true}), 200);
    return;
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
  _prevUcHandUIDs=new Set();
  document.getElementById('uc-mo').style.display='none';
  document.getElementById('tt').style.display='none';
  render();
}

function _showPeekChoices(cards){
  const uc=document.getElementById('uc-cards'); uc.innerHTML='';
  const lbl=document.createElement('div');
  lbl.style.cssText='font-size:9px;color:var(--accent);font-family:var(--font-m);text-align:center;margin-bottom:8px;width:100%;';
  lbl.textContent='👁️ 선견지명: 1장을 선택해 손패에 추가 (나머지는 버림)';
  uc.appendChild(lbl);
  cards.forEach((card,idx)=>{
    const div=document.createElement('div');
    div.style.cssText='background:var(--bg3);border:1px solid var(--accent);border-radius:9px;padding:10px 8px;width:90px;text-align:center;cursor:pointer;transition:all .12s;';
    div.innerHTML=`<div style="font-size:24px;margin-bottom:4px;">${card.icon}</div>
      <div style="font-size:8px;font-weight:700;color:var(--text);margin-bottom:2px;">${card.name}</div>
      <div class="card-tag tag-${card.tag}" style="font-size:6px;display:inline-block;margin-bottom:4px;">${card.tag}</div>
      <div style="font-size:7px;color:var(--text3);font-family:var(--font-m);">A${card.atk} D${card.def}</div>`;
    div.onclick=()=>{
      _ucHand.push(card);
      cards.forEach((c,i)=>{ if(i!==idx) G.disc.push(c); });
      log(`👁️ 선견지명: ${card.icon}${card.name} 손패 추가`,'success');
      renderUcCards(); checkSurvival(); render();
    };
    uc.appendChild(div);
  });
}
