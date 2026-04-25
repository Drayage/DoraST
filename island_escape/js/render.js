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
    grid:$('grid'),deckGrid:$('deck-grid'),
    dkTotal:$('dk-total'),dkDeck:$('dk-deck'),dkDisc:$('dk-disc'),
    logMain:$('log-main'),
    btnExp:$('btn-exp'),btnGa:$('btn-ga'),btnCamp:$('btn-camp'),
    btnCraft:$('btn-craft'),btnUse:$('btn-use'),btnSleep:$('btn-sleep'),
  };
  return _dom;
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

  // 패시브 목록
  const cards=allCards();
  const passives=[...new Set(cards.filter(c=>c.passiveDesc).map(c=>c.passiveDesc))];
  d.passiveInfo.textContent=passives.length?passives.join(' / '):'없음';

  // 맵
  const mapFrag=document.createDocumentFragment();
  p.tiles.forEach((t,i)=>{
    const el=document.createElement('div');
    el.className='tile'
      +(t.revealed?` revealed ${t.cls}`:'fog')
      +(i===p.pos?' player':'')
      +(t.hasCamp?' camp-t':'')
      +(t.revealed&&t.explored?' explored':'');
    if(t.revealed) el.textContent=i===p.pos?'🧍':(t.hasCamp?'🏕️':t.icon);
    el.title=t.revealed?`${t.name}${t.explored?' ✓':''}`:' ';
    el.onclick=()=>clickTile(i);
    mapFrag.appendChild(el);
  });
  d.grid.innerHTML=''; d.grid.appendChild(mapFrag);

  // 덱 표시
  const deckFrag=document.createDocumentFragment();
  cards.forEach(c=>{
    const div=document.createElement('div'); div.className='card';
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

  // 버튼 활성화
  d.btnExp.disabled=p.ap<2||p.over;
  d.btnGa.disabled=p.ap<3||p.over||!p.tiles[p.pos].explored;
  d.btnCamp.disabled=p.ap<8||p.over||p.tiles[p.pos].hasCamp;
  d.btnCraft.disabled=p.over||!p.tiles[p.pos].hasCamp;
  d.btnUse.disabled=p.ap<1||p.over;
  d.btnSleep.disabled=p.over;
}
