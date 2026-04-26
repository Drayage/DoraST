// ═══════════════ STATE ═══════════════

let G={}, CBT={};
let _dvTab='all', _ttTm=null, _cbtMode=null, _ucHand=[];
let _mobTab='map';
const _tabMap={map:'map-col',deck:'ctr-col',stat:'rgt-col',help:'rgt-col'};
let _pendingItems=null, _itemCb=null, _pendingItemCards=null;

function startGame(){
  document.getElementById('title-scr').style.display='none';
  initGame();
}

function initGame(){
  G={
    day:1, ap:10, maxAP:10,
    hp:100, san:100, hun:80, thi:80,
    doom:0, escape:0,
    doomPhase:0, doomRate:0, doomSurvives:0,
    camps:[], tiles:[], pos:22,
    deck:[], disc:[],
    weather:WEATHER[0], tomorrow:WEATHER[1],
    over:false, win:false, logs:[], kills:0,
    gatherCnt:{}, gatherBonus:{}, tilesMoved:0,
  };
  _pendingItems=null; _itemCb=null; _pendingItemCards=null; _ucHand=[];
  buildDeck(); buildMap();
  document.getElementById('go-scr').style.display='none';
  initMobile();
  log('🌊 난파선 섬에 표류했다! 생존하고 탈출하라.','system');
  log('팁: 탐색→캠프→제작소에서 도구 제작→수집으로 자원 확보','');
  render();
}

function buildDeck(){
  let c=[];
  CARDS.forEach(d=>{
    for(let i=0;i<d.n;i++){
      const card={...d, uid:uid()};
      if(d.dur) card.curDur=d.dur;
      c.push(card);
    }
  });
  G.deck=shuffle(c);
}
