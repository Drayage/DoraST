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
  const doomIconEl=document.getElementById('doom-icon-hdr');
  if(doomIconEl) doomIconEl.textContent=(ISLANDS[p.islandId]||ISLANDS.mangrove).doomIcon||'🌫️';
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
    el.addEventListener('mousemove', e=>showTileTT(e.clientX,e.clientY,t,i));
    el.addEventListener('mouseleave', hideTileTT);
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

  // 모바일 미니 로그 (최근 2줄)
  const mlsEl=document.getElementById('mob-log-strip');
  if(mlsEl) mlsEl.innerHTML=p.logs.slice(0,2).map(l=>`<div class="mls-entry ${l.type||''}">${l.msg}</div>`).join('');

  // 버튼 활성화 + 액션 툴팁 데이터
  const warns=[];
  if(p.hp<=20)  warns.push({icon:'❤️', text:'체력 위험', cls:'warn'});
  if(p.hun<=10) warns.push({icon:'🍗', text:'허기 부족', cls:'warn'});
  if(p.thi<=10) warns.push({icon:'💧', text:'갈증 부족', cls:'warn'});

  // 탐색
  d.btnExp.disabled=p.ap<2||p.over||ct.explored;
  d.btnExp._att={title:'🔍 탐색', cost:'AP 2', rows:[
    {icon:'🎴', text:'덱 맨 위 카드 태그로 성공/실패 판정', cls:'info'},
    {icon:'👁', text:'이미 탐색한 타일 재탐색 불가', cls:'info'},
    ...warns,
  ]};

  // 수집
  const hasGaTool=ct.explored&&(ct.gather||[]).some(o=>cards.some(c=>c.id===o.tool));
  d.btnGa.disabled=p.ap<3||p.over||!ct.explored||!hasGaTool;
  d.btnGa.innerHTML=ct.explored&&!hasGaTool?'🎒 도구없음 <span class="apb">AP3</span>':'🎒 수집 <span class="apb">AP3</span>';
  d.btnGa._att={title:'🎒 수집', cost:'AP 3', rows:[
    {icon:'🍗', text:'허기 -5', cls:'loss'},
    {icon:'💧', text:'갈증 -6', cls:'loss'},
    {icon:'🔧', text:'탐색 완료 + 수집 도구 필요', cls:'info'},
    ...warns,
  ]};

  // 캠프
  const ctBonus=campBonus(ct.id);
  d.btnCamp.disabled=p.ap<8||p.over||ct.hasCamp;
  const campRows=[
    {icon:'🏕️', text:'취침 이벤트 확률 대폭 감소', cls:'gain'},
    {icon:'🔨', text:'캠프 위치에서 제작 가능', cls:'info'},
  ];
  if(ctBonus) campRows.push({icon:'⭐', text:'지형 보너스: '+ctBonus, cls:'accent'});
  if(ct.hasCamp) campRows.push({icon:'✓', text:'이미 설치됨', cls:'info'});
  d.btnCamp._att={title:'🏕️ 캠프 건설', cost:'AP 8', rows:campRows};

  // 제작
  d.btnCraft.disabled=p.over||!ct.hasCamp;
  d.btnCraft._att={title:'🔨 제작소', cost:'AP 1~', rows:[
    {icon:'🏕️', text:'캠프 위치에서만 사용 가능', cls:'info'},
    {icon:'🛶', text:'뗏목 제작 → 탈출도 +15~30%', cls:'gain'},
    {icon:'🗡️', text:'도구·무기·장비 제작', cls:'info'},
  ]};

  // 카드 사용
  const beachCamp=p.camps.some(cp=>p.tiles[cp].id==='beach');
  const drawN=5+(hasTool('rope')?1:0)+(beachCamp?1:0);
  d.btnUse.disabled=p.ap<1||p.over;
  d.btnUse.innerHTML=`✨ 카드 사용 — ${drawN}장 드로우 <span class="apb">AP1</span>`;
  const useRows=[{icon:'🎴', text:`${drawN}장 드로우`, cls:'gain'}];
  if(hasTool('rope')) useRows.push({icon:'🪢', text:'밧줄 패시브 +1장', cls:'info'});
  if(beachCamp)       useRows.push({icon:'🏖️', text:'해변 캠프 +1장', cls:'info'});
  useRows.push({icon:'🍗', text:'식량·물·약초 즉시 사용 가능', cls:'info'});
  d.btnUse._att={title:'✨ 카드 사용', cost:'AP 1', rows:useRows};

  // 취침
  const sleepEarly=p.ap>=4;
  const sHpR=sleepEarly?15:9;
  const sSanR=sleepEarly?4:2;
  const sDrain=p.camps.length?2:5;
  const sSanNet=sSanR-sDrain;
  const sEvt=calcSleepEvtChance(sleepEarly);
  d.btnSleep.disabled=p.over;
  const sleepRows=[
    {icon:'❤️', text:`HP +${sHpR}`, cls:'gain'},
    {icon:'🧠', text:`정신력 ${sSanNet>=0?'+':''}${sSanNet}`, cls:sSanNet>=0?'gain':'loss'},
    {icon:'🍗', text:'허기 -14', cls:'loss'},
    {icon:'💧', text:'갈증 -18', cls:'loss'},
  ];
  if(sleepEarly) sleepRows.push({icon:'🌙', text:'이른취침 · AP+2 · 회복↑', cls:'early'});
  if(sEvt>0)     sleepRows.push({icon:'🎲', text:`취침 이벤트 ${sEvt}%`, cls:'info'});
  if(p.doomRate>0)      sleepRows.push({icon:'🌫️', text:`DOOM +${p.doomRate}%`, cls:'doom'});
  else if(p.doomPhase>=4) sleepRows.push({icon:'🌫️', text:'DOOM +1~3%', cls:'doom'});
  sleepRows.push(...warns);
  d.btnSleep._att={title:'🌙 취침', cost:'다음 날로', rows:sleepRows};
}
