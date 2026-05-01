// ═══════════════ CRAFT ═══════════════
// [버그수정] 뗏목 UI에서 escapeBonus undefined 표시 제거

let _craftFilter='전체';

function openCraft(){
  if(G.over) return;
  if(!G.tiles[G.pos].hasCamp){log('제작은 캠프 위치에서만 가능.','danger');render();return;}
  document.getElementById('cr-msg').style.display='none';
  document.getElementById('cr-mo').style.display='flex';
  renderCraft();
}

function closeCraft(){ document.getElementById('cr-mo').style.display='none'; render(); }

function renderCraft(){
  const mEl=document.getElementById('cr-mats');
  mEl.innerHTML='<span style="color:var(--text3);margin-right:3px;">재료:</span>';
  ['wood','metal','food','water'].forEach(id=>{
    const d=CARD_MAP[id]; const cnt=cntInDeck(id);
    mEl.innerHTML+=`<span style="background:var(--bg4);padding:2px 6px;border-radius:3px;margin-right:3px;color:${cnt>0?'var(--text)':'var(--text3)'};">${d.icon}${d.name}<b style="color:var(--accent);margin-left:2px;">×${cnt}</b></span>`;
  });
  mEl.innerHTML+=`<span style="margin-left:auto;color:var(--text3);">총 ${G.deck.length+G.disc.length}장</span>`;

  // 필터 버튼
  const fEl=document.getElementById('cr-filter'); fEl.innerHTML='';
  ['전체','전투','생존','수집','탈출'].forEach(f=>{
    const b=document.createElement('button'); b.className='btn';
    b.textContent=f;
    b.style.cssText=`font-size:8px;padding:2px 8px;${f===_craftFilter?'border-color:var(--purple);color:var(--purple);':''}`;
    b.onclick=()=>{ _craftFilter=f; renderCraft(); };
    fEl.appendChild(b);
  });

  // 정렬: 제작가능+AP있음 → 재료있음 → 불가
  const sorted=[...RECIPES]
    .filter(r=>_craftFilter==='전체'||r.cat===_craftFilter)
    .sort((a,b)=>{
      const aFull=canCraft(a)&&G.ap>=a.ap, bFull=canCraft(b)&&G.ap>=b.ap;
      const aOk=canCraft(a), bOk=canCraft(b);
      if(aFull!==bFull) return bFull-aFull;
      if(aOk!==bOk) return (bOk?1:0)-(aOk?1:0);
      return 0;
    });

  const lEl=document.getElementById('cr-list'); lEl.innerHTML='';
  sorted.forEach(rec=>{
    const ok=canCraft(rec), hasAP=G.ap>=rec.ap, canDo=ok&&hasAP;
    const resultDef=rec.result?CARD_MAP[rec.result]:null;
    const costHtml=rec.cost.map(c=>{
      const d=CARD_MAP[c.id]; const have=cntInDeck(c.id);
      return `<span style="color:${have>=c.n?'var(--green)':'var(--red)'};">${d.icon}${d.name}×${c.n}(${have})</span>`;
    }).join('+');
    const resHtml=rec.raftLottery
      ?`<span style="color:var(--green);">🎲 뽑기 (대성공+30%/성공+15%/실패-10%)</span>`
      :`<span style="color:var(--accent);">${resultDef?.icon||''}${resultDef?.name||rec.result}</span>`;
    const div=document.createElement('div');
    div.className='cr-recipe'+(ok?' avail':'');
    div.innerHTML=`
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="font-size:20px;">${rec.icon}</span>
        <div>
          <div style="font-family:var(--font-t);font-size:12px;color:${ok?'var(--text)':'var(--text3)'};">${rec.name}</div>
          <div style="font-size:8px;font-family:var(--font-m);color:var(--text3);">${rec.raftLottery?'🛶탈출':'📦아이템'}</div>
        </div>
        <span style="margin-left:auto;font-size:8px;font-family:var(--font-m);color:${hasAP?'var(--text3)':'var(--red)'};">AP${rec.ap}</span>
      </div>
      <div style="font-size:8px;color:var(--text2);line-height:1.5;">${rec.desc}</div>
      <div style="font-size:8px;font-family:var(--font-m);">재료: ${costHtml} → ${resHtml}</div>
      <button class="btn" style="${canDo?'border-color:var(--purple);color:var(--purple);':''}" onclick="event.stopPropagation();doCraft('${rec.id}')" ${canDo?'':'disabled'}>
        🔨 제작 (AP${rec.ap})${!ok?' — 재료부족':!hasAP?' — AP부족':''}
      </button>`;
    if(resultDef){
      if(window.innerWidth>700){ div.addEventListener('mouseenter',()=>showTT(resultDef,div)); div.addEventListener('mouseleave',hideTT); }
      else { div.addEventListener('click',e=>{ e.stopPropagation(); const tt=document.getElementById('tt'); if(tt.style.display==='block') tt.style.display='none'; else showTT(resultDef,div); }); }
    }
    lEl.appendChild(div);
  });
}

function _showCraftFlash(icon, name, n, recName){
  let el=document.getElementById('craft-flash');
  if(!el){
    el=document.createElement('div');
    el.id='craft-flash';
    document.body.appendChild(el);
  }
  el.innerHTML=`<div class="cf-inner"><div class="cf-icon">${icon}</div><div class="cf-name">${name}${n>1?` ×${n}`:''}</div><div class="cf-label">🔨 ${recName} 완료!</div></div>`;
  el.style.display='flex';
  clearTimeout(el._tm);
  el._tm=setTimeout(()=>{el.style.display='none';},1500);
}

function openRecipes(){
  const mEl=document.getElementById('recipe-mats');
  mEl.innerHTML='<span style="color:var(--text3);margin-right:3px;">현재 보유:</span>';
  ['wood','metal','food','water','herb','hide','feather','venom','shard'].forEach(id=>{
    const d=CARD_MAP[id]; if(!d) return;
    const cnt=cntInDeck(id);
    if(cnt>0) mEl.innerHTML+=`<span style="background:var(--bg4);padding:2px 6px;border-radius:3px;margin-right:3px;">${d.icon}${d.name}<b style="color:var(--accent);margin-left:2px;">×${cnt}</b></span>`;
  });
  const lEl=document.getElementById('recipe-list'); lEl.innerHTML='';
  RECIPES.forEach(rec=>{
    const ok=canCraft(rec);
    const resultDef=rec.result?CARD_MAP[rec.result]:null;
    const costHtml=rec.cost.map(c=>{
      const d=CARD_MAP[c.id]; const have=cntInDeck(c.id);
      return `<span style="color:${have>=c.n?'var(--green)':'var(--red)'};">${d.icon}${d.name}×${c.n}(${have})</span>`;
    }).join('+');
    const resHtml=rec.raftLottery
      ?`<span style="color:var(--green);">🎲 뽑기</span>`
      :`<span style="color:var(--accent);">${resultDef?.icon||''}${resultDef?.name||rec.result}</span>`;
    const div=document.createElement('div');
    div.className='cr-recipe'+(ok?' avail':'');
    div.innerHTML=`
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="font-size:18px;">${rec.icon}</span>
        <div style="flex:1;">
          <div style="font-family:var(--font-t);font-size:12px;color:${ok?'var(--text)':'var(--text3)'};">${rec.name}</div>
          <div style="font-size:7px;font-family:var(--font-m);color:var(--text3);">${rec.cat} · AP${rec.ap}</div>
        </div>
      </div>
      <div style="font-size:8px;font-family:var(--font-m);">재료: ${costHtml} → ${resHtml}</div>
      <div style="font-size:8px;color:var(--text3);font-family:var(--font-m);">${rec.desc}</div>`;
    lEl.appendChild(div);
  });
  document.getElementById('recipe-mo').style.display='flex';
}

function doCraft(id){
  const rec=RECIPES.find(r=>r.id===id);
  if(!rec||!canCraft(rec)) return;
  if(G.ap<rec.ap){log('AP부족','');return;}
  G.ap-=rec.ap;
  rec.cost.forEach(c=>rmFromDeck(c.id,c.n));

  if(rec.raftLottery){
    closeCraft();
    showRaftLottery();
    return;
  }

  addCard(rec.result, rec.rn);
  const d=CARDS.find(c=>c.id===rec.result);
  log(`🔨 ${rec.name}. ${d?.icon||''}${d?.name||''}×${rec.rn} (AP-${rec.ap})`,'success');
  if(rec.result==='compass'){
    const escBefore=G.escape;
    G.escape=Math.min(100,G.escape+20);
    notifyEscapeChange(escBefore,G.escape,'유물나침반');
    log('🧭 유물나침반: 탈출도 즉시+20%!','success');
  }
  if(navigator.vibrate) navigator.vibrate([30,20,60]);
  _showCraftFlash(d?.icon||'📦', d?.name||rec.result, rec.rn, rec.name);
  renderCraft(); checkWin(); render();
}
