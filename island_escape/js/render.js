// ═══════════════ RENDER ═══════════════

let _dom=null;
function getDOM(){
  if(_dom) return _dom;
  const $=id=>document.getElementById(id);
  _dom={
    hvHp:$('hv-hp'),hvSan:$('hv-san'),hvHun:$('hv-hun'),hvThi:$('hv-thi'),
    hvWx:$('hv-wx'),hvTmrw:$('hv-tmrw'),hvDay:$('hv-day'),hvAp:$('hv-ap'),
    doomPct:$('doom-pct'),doomFill:$('doom-fill'),hvEsc:$('hv-esc'),
    svHp:$('sv-hp'),svSan:$('sv-san'),svHun:$('sv-hun'),svThi:$('sv-thi'),
    barHp:$('bar-hp'),barSan:$('bar-san'),barHun:$('bar-hun'),barThi:$('bar-thi'),
    svEsc:$('sv-esc'),barEsc:$('bar-esc'),
    campInfo:$('camp-info'),passiveInfo:$('passive-info'),
    curTileIcon:$('cur-tile-icon'),curTileName:$('cur-tile-name'),
    curTileStatus:$('cur-tile-status'),curTileGather:$('cur-tile-gather'),
    grid:$('grid'),deckGrid:$('deck-grid'),
    dkTotal:$('dk-total'),dkDeck:$('dk-deck'),dkDisc:$('dk-disc'),
    logMain:$('log-main'),
    btnExp:$('btn-exp'),btnGa:$('btn-ga'),btnCamp:$('btn-camp'),
    btnCraft:$('btn-craft'),btnUse:$('btn-use'),btnSleep:$('btn-sleep'),
  };
  return _dom;
}

function campBonus(tileId){
  if(tileId==='beach')  return '카드사용+1드로우';
  if(tileId==='cave')   return '취침 정신력+5';
  if(tileId==='forest') return '취침 식량생성';
  if(tileId==='shore')  return '취침 물생성';
  if(tileId==='ruins')  return '취침 AP+1';
  return '';
}

function render(){
  const p=G, d=getDOM();

  // 헤더
  d.hvHp.textContent=p.hp; d.hvHp.className='val'+(p.hp<30?' low':'');
  d.hvSan.textContent=p.san; d.hvHun.textContent=p.hun; d.hvThi.textContent=p.thi;
  d.hvWx.textContent=`${p.weather.icon} ${p.weather.name}`;
  d.hvTmrw.textContent=`${p.tomorrow.icon} ${p.tomorrow.name}`;
  d.hvDay.textContent=p.day;
  d.hvAp.textContent=p.ap;
  const doom=Math.min(100,p.doom);
  d.doomPct.textContent=doom; d.doomFill.style.width=doom+'%';
  const doomRateEl=document.getElementById('doom-rate-hdr');
  if(doomRateEl) doomRateEl.textContent=p.doomRate>0?`+${p.doomRate}%/일`:p.doomPhase>=4?'+1~3%/일':'';
  d.hvEsc.textContent=p.escape;

  // 스탯 바
  d.svHp.textContent=p.hp;   d.barHp.style.width=p.hp+'%';
  d.svSan.textContent=p.san; d.barSan.style.width=p.san+'%';
  d.svHun.textContent=p.hun; d.barHun.style.width=p.hun+'%';
  d.svThi.textContent=p.thi; d.barThi.style.width=p.thi+'%';
  d.svEsc.textContent=p.escape+'%'; d.barEsc.style.width=p.escape+'%';

  // 캠프 정보
  d.campInfo.textContent=p.camps.length?`캠프 ${p.camps.length}곳 (제작 가능)`:'캠프 없음 (취침이벤트↑)';
  d.campInfo.style.color=p.camps.length?'var(--green)':'var(--red)';
  const campBonusesEl=document.getElementById('camp-bonuses');
  if(campBonusesEl){
    if(p.camps.length){
      campBonusesEl.textContent=p.camps.map(cp=>{const t=p.tiles[cp];const b=campBonus(t.id);return `· ${t.icon}${t.name}${b?`: ${b}`:''}`;}).join('\n');
      campBonusesEl.style.display='';
    } else { campBonusesEl.style.display='none'; }
  }

  // 취침 이벤트 확률 표시
  const sleepChanceEl=document.getElementById('sleep-evt-chance');
  if(sleepChanceEl){
    const chance=calcSleepEvtChance(p.ap>=4);
    const col=chance<=5?'var(--green)':chance<=20?'var(--accent)':'var(--red)';
    sleepChanceEl.innerHTML=`취침 이벤트 확률: <span style="color:${col};font-weight:700;">${chance}%</span>${p.ap>=4?' (이른취침)':''}`;
  }

  // 현재 위치 지형
  const ct=p.tiles[p.pos];
  d.curTileIcon.textContent=ct.icon||'❓';
  d.curTileName.textContent=ct.name||'?';
  const bonus=ct.hasCamp?campBonus(ct.id):'';
  d.curTileStatus.textContent=ct.hasCamp?`🏕️ 캠프${bonus?` (${bonus})`:''}`:ct.explored?'✓ 탐색완료':'— 미탐색';
  // 수집 도구 + 수집 횟수 표시
  const gatherParts=(ct.gather||[]).map(o=>{
    const key=`${p.pos}_${o.tool}`;
    const cnt=G.gatherCnt[key]||0;
    const icon=CARD_MAP[o.tool]?.icon||'';
    const name=CARD_MAP[o.tool]?.name||o.tool;
    return `${icon}${name}${cnt>0?`(${cnt}회)`:''}`;
  });
  d.curTileGather.textContent=gatherParts.length?`수집: ${gatherParts.join(' ')}`:'';

  // 패시브 목록
  const cards=allCards();
  const passives=[...new Set(cards.filter(c=>c.passiveDesc).map(c=>c.passiveDesc))];
  d.passiveInfo.textContent=passives.length?passives.join(' / '):'없음';

  // 맵
  const mapFrag=document.createDocumentFragment();
  p.tiles.forEach((t,i)=>{
    const el=document.createElement('div');
    el.className='tile'
      +(t.revealed?` revealed ${t.cls}`:t.wasSeen?` seen-fog`:'fog')
      +(i===p.pos?' player':'')
      +(t.hasCamp?' camp-t':'')
      +(t.revealed&&t.explored?' explored':'');
    if(t.revealed) el.textContent=i===p.pos?'🧍':(t.hasCamp?'🏕️':t.icon);
    const moveCost=i!==p.pos?` (이동 AP${tileDist(p.pos,i)})`:' (현재위치)';
    el.title=t.revealed?`${t.name}${t.explored?' ✓':''}${moveCost}`:t.wasSeen?`${t.name} (안개 속)`:' ';
    el.onclick=()=>clickTile(i);
    mapFrag.appendChild(el);
  });
  d.grid.innerHTML=''; d.grid.appendChild(mapFrag);

  // 덱 표시 (버림더미 카드는 회색)
  const discUids=new Set(G.disc.map(c=>c.uid));
  const deckFrag=document.createDocumentFragment();
  cards.forEach(c=>{
    const div=document.createElement('div');
    div.className='card'+(discUids.has(c.uid)?' card-disc':'');
    const durDisp=c.dur?`<br><span style="color:var(--accent);font-size:6px;">🔋${c.curDur||c.dur}/${c.dur}</span>`:'';
    div.innerHTML=`<div class="card-icon">${c.icon}</div>
      <div class="card-name">${c.name}</div>
      <div class="card-tag tag-${c.tag}">${c.tag}</div>
      <div class="card-stats">A${c.atk} D${c.def}${durDisp}</div>`;
    div.addEventListener('mouseenter',()=>showTT(c,div));
    div.addEventListener('mouseleave',hideTT);
    addCardTouchTT(div, c);
    deckFrag.appendChild(div);
  });
  d.deckGrid.innerHTML=''; d.deckGrid.appendChild(deckFrag);
  d.dkTotal.textContent=cards.length;
  d.dkDeck.textContent=p.deck.length;
  d.dkDisc.textContent=p.disc.length;

  // 로그
  d.logMain.innerHTML=
    p.logs.slice(0,25).map(l=>`<div class="le ${l.type||''}">${l.msg}</div>`).join('');

  // 버튼 활성화 + 툴팁
  const warns=[];
  if(p.hp<=20) warns.push('❤️위험');
  if(p.hun<=10) warns.push('🍗부족');
  if(p.thi<=10) warns.push('💧부족');
  const warnTip=warns.length?` ⚠️ ${warns.join(' ')}`:' ';

  d.btnExp.disabled=p.ap<2||p.over||ct.explored;
  d.btnExp.title=`탐색 AP2${warnTip}`;

  const hasGaTool=ct.explored&&(ct.gather||[]).some(o=>cards.some(c=>c.id===o.tool));
  d.btnGa.disabled=p.ap<3||p.over||!ct.explored||!hasGaTool;
  d.btnGa.innerHTML=ct.explored&&!hasGaTool?'🎒 도구없음 <span class="apb">AP3</span>':'🎒 수집 <span class="apb">AP3</span>';
  d.btnGa.title=`수집 AP3 (허기-5 갈증-6)${warnTip}`;

  const ctBonus=campBonus(ct.id);
  d.btnCamp.disabled=p.ap<8||p.over||ct.hasCamp;
  d.btnCamp.title=`캠프 건설 AP8${ctBonus?' — 보너스: '+ctBonus:''}`;

  d.btnCraft.disabled=p.over||!ct.hasCamp;

  // 카드사용 드로우 수 동적 표시
  const beachCamp=p.camps.some(cp=>p.tiles[cp].id==='beach');
  const drawN=5+(hasTool('rope')?1:0)+(beachCamp?1:0);
  d.btnUse.disabled=p.ap<1||p.over;
  d.btnUse.innerHTML=`✨ 카드 사용 — ${drawN}장 드로우 <span class="apb">AP1</span>`;

  // 취침 hover 미리보기
  const sleepEarly=p.ap>=4;
  const sHpR=sleepEarly?15:9;
  const sSanR=sleepEarly?4:2;
  const sDrain=p.camps.length?2:5;
  const sSanNet=sSanR-sDrain;
  const sEvt=calcSleepEvtChance(sleepEarly);
  const sDoom=p.doomRate>0?` DOOM+${p.doomRate}%`:p.doomPhase>=4?' DOOM+1~3%':'';
  d.btnSleep.disabled=p.over;
  d.btnSleep.title=`HP+${sHpR} 정신력${sSanNet>=0?'+':''}${sSanNet} 허기-14 갈증-18${sleepEarly?' 이른취침AP+2':''}${sEvt>0?` 이벤트${sEvt}%`:''}${sDoom}`;
}
