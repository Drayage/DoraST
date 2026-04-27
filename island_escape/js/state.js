// ═══════════════ STATE ═══════════════

let G={}, CBT={};
let _dvTab='all', _ttTm=null, _cbtMode=null, _ucHand=[];
let _mobTab='map';
const _tabMap={map:'map-col',deck:'ctr-col',stat:'rgt-col',help:'rgt-col'};
let _pendingItems=null, _itemCb=null, _pendingItemCards=null;

function startGame(){
  document.getElementById('title-scr').style.display='none';
  document.body.classList.remove('game-inactive');
  initGame();
}

function initGame(){
  const islandId = (G && G.islandId) ? G.islandId : 'mangrove';
  G={
    day:1, ap:10, maxAP:10,
    hp:100, san:90, hun:80, thi:80,
    doom:0, escape:0,
    doomPhase:0, doomRate:0, doomSurvives:0,
    camps:[], tiles:[], pos:24,
    deck:[], disc:[],
    weather:WEATHER[0], tomorrow:WEATHER[1],
    over:false, win:false, logs:[], kills:0,
    raftTry:0, raftGreat:0, raftFail:0,
    gatherCnt:{}, gatherBonus:{}, tilesMoved:0,
    islandId,
  };
  _pendingItems=null; _itemCb=null; _pendingItemCards=null; _ucHand=[];
  G.escMile={};
  buildDeck(); buildMap();
  document.querySelectorAll('.mo').forEach(el=>el.style.display='none');
  document.getElementById('go-scr').style.display='none';
  initMobile();
  const isl = ISLANDS[G.islandId] || ISLANDS.mangrove;
  const wx=G.weather;
  let wxTxt='';
  if(wx?.eff){
    const [s,v]=wx.eff.split('_');
    const val=parseInt(v);
    if(s==='san'){ G.san=Math.min(100,Math.max(0,G.san+val)); wxTxt=`${wx.icon}${wx.name}: 정신력${val>=0?'+':''}${val}`; }
    else if(s==='thi'){ G.thi=Math.min(100,Math.max(0,G.thi+val)); wxTxt=`${wx.icon}${wx.name}: 갈증${val>=0?'+':''}${val}`; }
    else if(s==='ap'){ G.ap=Math.max(0,G.ap+val); wxTxt=`${wx.icon}${wx.name}: AP${val>=0?'+':''}${val}`; }
    else if(s==='hp'){ G.hp=Math.max(0,Math.min(100,G.hp+val)); wxTxt=`${wx.icon}${wx.name}: HP${val>=0?'+':''}${val}`; }
    else { wxTxt=`${wx.icon}${wx.name}`; }
  }
  log(`${isl.icon} ${isl.startLog}${wxTxt?` ( ${wxTxt} )`:''}`,'system');
  log('팁: 탐색→캠프→제작소에서 도구 제작→수집으로 자원 확보','');
  render();
  showIslandIntro();
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
