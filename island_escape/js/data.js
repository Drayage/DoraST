// ═══════════════ DATA ═══════════════

const TILE_TYPES=[
  {id:'beach', name:'해변',icon:'🏖️',cls:'t-beach',flavor:'해변의 모래사장을 걷는다. 파도 소리가 들려온다.',
   events:['res_wood','res_metal','res_food','old_fire','nothing'],
   gather:[{tool:'fishing_rod',res:'food',label:'낚시',flavor:'해변에서 낚싯대로 물고기를 잡는다.'}]},
  {id:'forest',name:'숲',  icon:'🌲',cls:'t-forest',flavor:'울창한 숲이다. 여러 동식물의 소리가 들린다.',
   events:['res_wood','res_wood','res_food','res_herb','cbt_boar','cbt_snake','trap_pit'],
   gather:[
     {tool:'gathering_knife',res:'herb',label:'약초채집',flavor:'채집칼로 약초를 모은다.'},
     {tool:'axe',res:'wood',label:'나무베기',flavor:'도끼로 나무를 벤다.'},
   ]},
  {id:'cave',  name:'동굴',icon:'🪨',cls:'t-cave',flavor:'어두운 동굴 입구가 보인다. 안에서 차가운 공기가 흘러나온다.',
   events:['res_metal','res_metal','res_metal','cbt_bat','find_shelter','nothing'],
   gather:[{tool:'pickaxe',res:'metal',label:'채굴',flavor:'곡괭이로 동굴 벽을 캔다.'}]},
  {id:'ruins', name:'폐허',icon:'🏚️',cls:'t-ruins',flavor:'오래된 구조물의 잔해가 흩어져 있다. 무언가 숨겨져 있을 것 같다.',
   events:['res_metal','find_blueprint','cbt_ghost','res_food','survivor_note','haunted_spot'],
   gather:[{tool:'torch',res:'metal',label:'유물탐색',flavor:'횃불로 폐허를 샅샅이 뒤진다.'}]},
  {id:'shore', name:'해안',icon:'🌊',cls:'t-shore',flavor:'거친 파도가 해안을 두드린다. 표류물이 밀려와 있다.',
   events:['res_food','res_metal','find_wreckage','nothing','isolation_dread'],
   gather:[
     {tool:'fishing_rod',res:'food',label:'낚시',flavor:'해안에서 낚싯대로 낚시한다.'},
     {tool:'canteen',res:'water',label:'물 채집',flavor:'물통에 깨끗한 물을 담는다.'},
   ]},
];

const WEATHER=[
  {id:'sunny', name:'맑음',    icon:'☀️', eff:'san_+2'},
  {id:'cloudy',name:'흐림',    icon:'☁️', eff:'thi_+5'},
  {id:'rain',  name:'폭우',    icon:'🌧️',eff:'ap_-1'},
  {id:'heat',  name:'폭염',    icon:'🔥', eff:'thi_-14'},
  {id:'fog',   name:'짙은안개',icon:'🌫️',eff:'fog'},
  {id:'storm', name:'폭풍',    icon:'⛈️', eff:'hp_-10'},
];

// dur: n회 사용 후 덱에서 영구 제거. 인스턴스에 curDur 추가
const CARDS=[
  {id:'wood',  name:'목재', icon:'🪵',tag:'resource',atk:0,def:1,n:4,
   desc:'뗏목·도구 제작 핵심. 방어 판정에 유리.'},
  {id:'metal', name:'고철', icon:'⚙️', tag:'resource',atk:1,def:0,n:3,
   desc:'도구 제작·공격 판정. 해안에서 많이 발견.'},
  {id:'food',  name:'식량', icon:'🍗',tag:'resource',atk:0,def:0,n:4,use:'eat',dur:3,
   desc:'허기 +22 (칼 보유 시 +30). 내구도 3회 사용 후 소진.'},
  {id:'water', name:'물',   icon:'💧',tag:'resource',atk:0,def:0,n:3,use:'drink',dur:3,
   desc:'갈증 +28. 내구도 3회 사용 후 소진.'},
  {id:'berry', name:'작은 열매',icon:'🍒',tag:'resource',atk:0,def:0,n:0,use:'eat',dur:1,
   desc:'캠프 주변 열매. 허기 +22. 1회용.'},
  {id:'dew',   name:'맺힌이슬', icon:'💦',tag:'resource',atk:0,def:0,n:0,use:'drink',dur:1,
   desc:'이슬을 모아 마신다. 갈증 +28. 1회용.'},
  {id:'herb',  name:'약초', icon:'🌿',tag:'resource',atk:0,def:0,n:2,use:'heal',dur:2,
   desc:'HP +10. 내구도 2회 사용 후 소진.'},
  // 도구 — 패시브 + 수집장비
  {id:'knife',    name:'칼',    icon:'🔪',tag:'tool',atk:4,def:1,n:0,
   passiveDesc:'식량 섭취 허기+8 추가 (22→30)',
   desc:'패시브: 식량 회복 증가. 전투 공격력 4.'},
  {id:'torch',    name:'횃불',  icon:'🕯️',tag:'tool',atk:2,def:1,n:0,gatherTool:true,
   passiveDesc:'탐색 tool 판정 성공 시 추가 보상 1장',
   desc:'패시브: 탐색 tool 성공 시 추가보상 1장 드로우. ATK2 DEF1.',
   gatherDesc:'🏚️ 폐허에서 수집 가능 → ⚙️고철 1~2개 획득'},
  {id:'rope',     name:'밧줄',  icon:'🪢',tag:'tool',atk:0,def:3,n:0,
   passiveDesc:'카드사용 시 드로우 +1장 (중첩)',
   desc:'패시브: 카드사용 드로우 +1장 (개수만큼 중첩). DEF3.'},
  {id:'axe',      name:'도끼',  icon:'🪓',tag:'tool',atk:3,def:1,n:0,gatherTool:true,
   desc:'🌲 숲에서 나무베기 수집 가능. 전투 ATK3 DEF1.',
   gatherDesc:'🌲 숲에서 수집 가능 → 🪵목재 1~2개 획득'},
  {id:'gathering_knife',name:'채집칼',icon:'🗡️',tag:'tool',atk:2,def:1,n:0,gatherTool:true,
   desc:'🌲 숲에서 약초채집 수집 가능. 전투 ATK2 DEF1.',
   gatherDesc:'🌲 숲에서 수집 가능 → 🌿약초 1~2개 획득'},
  {id:'fishing_rod',name:'낚싯대',icon:'🎣',tag:'tool',atk:0,def:2,n:0,gatherTool:true,
   desc:'🏖️해변·🌊해안에서 낚시 수집 가능. DEF2.',
   gatherDesc:'🏖️ 해변·🌊 해안에서 수집 가능 → 🍗식량 1~2개 획득'},
  {id:'canteen',  name:'물통',  icon:'🫙',tag:'tool',atk:0,def:2,n:0,gatherTool:true,
   desc:'🌊 해안에서 물 채집 수집 가능. DEF2.',
   gatherDesc:'🌊 해안에서 수집 가능 → 💧물 1~2개 획득'},
  {id:'pickaxe',  name:'곡괭이',icon:'⛏️',tag:'tool',atk:3,def:0,n:0,gatherTool:true,
   desc:'🪨 동굴에서 채굴 수집 가능. 전투 ATK3.',
   gatherDesc:'🪨 동굴에서 수집 가능 → ⚙️고철 1~2개 획득'},
  // 전투
  {id:'spear', name:'창',  icon:'🗡️',tag:'combat',atk:8,def:0,n:1,cbtFx:'pierce',
   desc:'관통: 공격배정 시 적 방어 완전무시 +4 추가공격.'},
  {id:'shield',name:'방패',icon:'🛡️',tag:'combat',atk:0,def:8,n:1,cbtFx:'block',
   desc:'완전방어: 방어배정 시 +5 추가방어. DEF8.'},
  {id:'trap',  name:'함정',icon:'🪤',tag:'combat',atk:5,def:3,n:1,cbtFx:'stun',
   desc:'기절: 배정 시 적 다음라운드 피해 0. 추가ATK3.'},
  // 전투 획득 재료
  {id:'hide',    name:'가죽',    icon:'🦴',tag:'resource',atk:0,def:1,n:0,
   desc:'전투 획득. 가죽갑옷·독칼 제작 재료.'},
  {id:'venom',   name:'독낭',    icon:'🧪',tag:'resource',atk:0,def:0,n:0,
   desc:'전투 획득. 독칼 제작 재료.'},
  {id:'feather', name:'깃털',    icon:'🪶',tag:'resource',atk:0,def:0,n:0,
   desc:'전투 획득. 깃털망토 제작 재료.'},
  {id:'shard',   name:'고대파편',icon:'🔮',tag:'resource',atk:0,def:0,n:0,
   desc:'전투 획득. 유물나침반 제작 재료.'},
  // 제작 아이템
  {id:'leather_armor',name:'가죽갑옷',icon:'🧥',tag:'combat',atk:0,def:4,n:0,
   passiveDesc:'전투 시 받는 피해 -2',cbtFx:'armor',
   desc:'패시브: 전투 피해 경감 -2. DEF4.'},
  {id:'poison_knife',name:'독칼',icon:'☠️',tag:'combat',atk:6,def:0,n:0,
   cbtFx:'poison',desc:'독: 공격배정 시 적에게 매 라운드 추가 3피해. ATK6.'},
  {id:'feather_cloak',name:'깃털망토',icon:'🧣',tag:'combat',atk:0,def:2,n:0,
   passiveDesc:'도망 비용 HP-15 → HP-2',cbtFx:'cloak',
   desc:'패시브: 도망 비용 대폭 감소. DEF2.'},
  {id:'compass',name:'유물나침반',icon:'🧭',tag:'tool',atk:0,def:0,n:0,
   passiveDesc:'탈출도 +20% 즉시. 탐색 판정 2장 중 유리한 것 선택',
   desc:'고대 유물. 탈출도 즉시 +20%. 탐색 판정 어드밴티지.'},
  {id:'ambush_fist',name:'맨손 기습',icon:'👊',tag:'combat',atk:3,def:0,n:0,cbtFx:'raw',
   desc:'공격카드 없이 맨손 기습. ATK 3(방어무시). 전투 후 소멸.'},
  // 상태이상
  {id:'injury',      name:'부상',icon:'🩹',tag:'status',atk:-1,def:-1,n:0,desc:'ATK·DEF -1.'},
  {id:'fear',        name:'공포',icon:'😱',tag:'status',atk:-1,def:-1,n:0,desc:'ATK·DEF -1.'},
  {id:'fatigue',     name:'피로',icon:'😴',tag:'status',atk:0, def:-1,n:0,desc:'DEF -1. 취침 AP회복 -2.'},
  {id:'poison_status',name:'중독',icon:'💀',tag:'status',atk:-1,def:0,n:0,desc:'ATK -1. 매 취침 HP -5.'},
  {id:'amnesia',     name:'망각',icon:'🌀',tag:'status',atk:-1,def:0,n:0,
   desc:'환각이 현실을 침식한다. 탐색 판정 시 정신력-3. 종말 단계에서 확률로 다시 출현한다.',
   passiveDesc:'망각: 탐색 판정 시 정신력-3'},
];

const ENEMIES={
  cbt_boar:{name:'멧돼지',icon:'🐗',hp:30,atk:12,def:4,
    encDesc:'덤불 속에서 성난 멧돼지가 으르렁거린다. 강한 돌진이 예상된다.',
    observeReward:[{id:'food',n:2},{id:'hide',n:1}],
    observeText:'멧돼지가 자리를 피한 틈에 먹이와 가죽을 챙겼다.',
    reward:{cards:[{id:'food',n:1}]},
    altCards:[[{id:'hide',n:2}],[{id:'wood',n:2}]],
    rewardDesc:'식량×1 + (가죽×2 또는 목재×2)'},
  cbt_snake:{name:'독사',  icon:'🐍',hp:18,atk:10,def:2,
    encDesc:'바위 틈에서 독사가 혀를 날름거린다. 독이 있어 물리면 위험하다.',
    observeReward:[{id:'herb',n:1},{id:'venom',n:1}],
    observeText:'독사 굴 근처에서 약초와 독낭을 조심스럽게 채취했다.',
    reward:{cards:[{id:'food',n:1}]},
    altCards:[[{id:'herb',n:1},{id:'venom',n:1}],[{id:'metal',n:2}]],
    rewardDesc:'식량×1 + (약초+독낭 또는 고철×2)',
    penalty:{card:'injury',desc:'독사에게 물려 부상 카드 추가'}},
  cbt_bat:{name:'박쥐떼',icon:'🦇',hp:22,atk:8, def:1,
    encDesc:'동굴 천장에 수백 마리의 박쥐가 매달려 있다. 자극하면 떼로 공격한다.',
    observeReward:[{id:'feather',n:2},{id:'food',n:1}],
    observeText:'박쥐들이 잠든 틈에 깃털을 모으고 먹이를 챙겼다.',
    reward:{cards:[{id:'food',n:1}]},
    altCards:[[{id:'feather',n:2}],[{id:'metal',n:1}]],
    rewardDesc:'식량×1 + (깃털×2 또는 고철×1)',
    penalty:{san:-10,desc:'박쥐떼에 시달려 정신력 -10'}},
  cbt_ghost:{name:'환각존재',icon:'👻',hp:24,atk:10,def:3,
    encDesc:'공기가 일그러지며 빛나는 형상이 나타났다. 섬의 저주인가, 환각인가.',
    observeReward:[{id:'shard',n:2}],
    observeText:'형상이 사라진 자리에 고대 파편이 남아 있었다.',
    reward:{san:12,cards:[{id:'food',n:1}]},
    altCards:[[{id:'shard',n:2}],[{id:'metal',n:2}]],
    rewardDesc:'정신력+12 + 식량×1 + (파편×2 또는 고철×2)',
    penalty:{san:-20,desc:'환각에 시달려 정신력 -20'}},
};

const EVENTS={
  res_wood:{
    name:'목재 더미 발견',flavor:'해안가에 파도에 쓸려온 통나무가 쌓여 있다.',
    choices:[
      {label:'꼼꼼히 수거',icon:'🪵',req:'resource',reward:{card:'wood',n:3},failPen:{hun:-12},
       greatCard:'axe',greatBonus:{card:'wood',n:2,ap:1},desc:'자원판정. 성공:목재×3 / 대성공(도끼):+목재×2+AP환급 / 실패:허기-12'},
      {label:'빠르게만 챙긴다',icon:'👀',req:null,reward:{card:'wood',n:1},desc:'무조건 성공. 목재×1.'},
    ]},
  res_food:{
    name:'먹을 것 발견',flavor:'덤불 사이에 먹을 수 있을 것 같은 것들이 보인다.',
    choices:[
      {label:'독 여부 확인',icon:'🔍',req:'tool',reward:{card:'food',n:2},failPen:{hp:-8},
       greatCard:'gathering_knife',greatBonus:{card:'food',n:1},desc:'도구판정. 성공:식량×2 / 대성공(채집칼):+식량'},
      {label:'그냥 조금 먹어본다',icon:'🍽️',req:'resource',reward:{card:'food',n:1},failPen:{san:-8},desc:'자원판정. 실패:정신력↓'},
    ]},
  res_metal:{
    name:'고철 잔해 발견',flavor:'부서진 기계 부품들이 흩어져 있다.',
    choices:[
      {label:'꼼꼼히 분해',icon:'⚙️',req:'tool',reward:{card:'metal',n:2},failPen:{hp:-6},
       greatCard:'pickaxe',greatBonus:{card:'metal',n:2,ap:1},desc:'도구판정. 성공:고철×2 / 대성공(곡괭이):+고철×2+AP'},
      {label:'보이는 것만 줍기',icon:'👋',req:'resource',reward:{card:'metal',n:1},desc:'자원판정. 실패:빈손.'},
    ]},
  res_herb:{
    name:'약초 군락 발견',flavor:'상처에 좋아 보이는 풀들이 자라고 있다.',
    choices:[
      {label:'약효 있는 것 선별',icon:'🌿',req:'tool',reward:{card:'herb',n:2},failPen:{san:-5},
       greatCard:'gathering_knife',greatBonus:{card:'herb',n:1},desc:'도구판정. 성공:약초×2 / 대성공(채집칼):+약초'},
      {label:'보이는 대로 채집',icon:'🤲',req:'resource',reward:{card:'herb',n:1},desc:'자원판정. 실패:빈손.'},
    ]},
  find_shelter:{
    name:'은신처 발견',flavor:'폭풍을 피할 수 있는 작은 동굴 입구가 보인다.',
    choices:[
      {label:'깊이 탐색한다',icon:'🕯️',req:'tool',reward:{san:10,card:'metal',n:1},failPen:{hp:-15},
       greatCard:'torch',greatBonus:{san:8,ap:2},desc:'도구판정. 성공:정신력+10+고철 / 대성공(횃불):+정신력+8+AP×2 / 실패:HP-15'},
      {label:'입구만 살핀다',icon:'👁️',req:null,reward:{san:5},desc:'무조건. 정신력+5.'},
    ]},
  find_blueprint:{
    name:'탈출 설계도!',flavor:'낡은 상자 안에 뭔가 적힌 종이가 보인다.',
    choices:[
      {label:'신중히 분석',icon:'📐',req:'tool',reward:{escape:30},failPen:{san:-10},
       greatCard:'torch',greatBonus:{escape:15,ap:1},desc:'도구판정. 성공:탈출+30% / 대성공(횃불):+15%+AP'},
      {label:'일단 챙긴다',icon:'🗂️',req:'resource',reward:{escape:15},desc:'자원판정. 실패:탈출 없음.'},
    ]},
  find_wreckage:{
    name:'난파 잔해',flavor:'배의 잔해가 해안에 널려있다.',
    choices:[
      {label:'잠수해서 수거',icon:'🤿',req:'tool',reward:{card:'metal',n:3},failPen:{hp:-12},
       greatCard:'rope',greatBonus:{card:'metal',n:2},desc:'도구판정. 성공:고철×3 / 대성공(밧줄):+고철×2'},
      {label:'육지 잔해만',icon:'🏖️',req:'resource',reward:{card:'metal',n:1},desc:'자원판정. 실패:빈손.'},
    ]},
  nothing:{
    name:'아무것도 없음',flavor:'이 주변을 둘러봤지만 특별한 것은 없었다.',
    choices:[
      {label:'한 번 더 살핀다',icon:'🔎',req:'tool',reward:{card:'food',n:2,ap:1},failPen:{hp:-8},
       greatCard:'torch',greatBonus:{card:'metal',n:2},desc:'도구판정. 성공:식량×2+AP환급 / 대성공(횃불):고철×2 / 실패:HP-8'},
      {label:'그냥 돌아간다',icon:'↩️',req:null,reward:{},desc:'무조건. 빈손.'},
    ]},
  survivor_note:{
    name:'생존자의 흔적',flavor:'누군가 이 곳에 있었던 것 같다. 낡은 메모와 흔적이 남아있다.',
    choices:[
      {label:'흔적을 철저히 조사',icon:'🕯️',req:'tool',
       reward:{card:'metal',n:1,escape:15},failPen:{hp:-8},
       greatCard:'torch',greatBonus:{card:'wood',n:1,ap:2},
       desc:'도구판정. 성공:고철×1+탈출+15% / 대성공(횃불):+목재+AP×2 / 실패:HP-8'},
      {label:'메모만 빠르게 읽는다',icon:'📝',req:null,
       reward:{escape:5},
       desc:'무조건. 탈출도+5%.'},
    ]},
  trap_pit:{
    name:'야생 덫 구덩이',flavor:'덤불 사이에 정교하게 파인 함정이 보인다. 먹이가 걸려든 것 같다.',
    choices:[
      {label:'전리품을 회수한다',icon:'🎯',req:'resource',
       reward:{card:'food',n:3},failPen:{hp:-12},
       greatCard:'gathering_knife',greatBonus:{card:'hide',n:1},
       desc:'자원판정. 성공:식량×3 / 대성공(채집칼):+가죽×1 / 실패:HP-12'},
      {label:'건드리지 않고 지나친다',icon:'🚶',req:null,
       reward:{},
       desc:'무조건. 빈손. 안전.'},
    ]},
  haunted_spot:{
    name:'으스스한 기운',flavor:'이 폐허에서 무언가를 강하게 느꼈다. 환각인지 현실인지 경계가 흐려지기 시작한다.',
    choices:[
      {label:'정신을 다잡고 탐색한다',icon:'🕯️',req:'tool',
       reward:{card:'metal',n:1},failPen:{san:-18},
       greatCard:'torch',greatBonus:{san:10,escape:5},
       desc:'도구판정. 성공:고철×1 / 대성공(횃불):정신력+10+탈출+5% / 실패:정신력-18'},
      {label:'이 곳을 빨리 벗어난다',icon:'🏃',req:null,
       reward:{san:-6},
       desc:'무조건. 황급히 벗어나지만 정신력-6.'},
    ]},
  isolation_dread:{
    name:'극도의 고립감',flavor:'수평선을 바라보다 아무도 없다는 사실이 갑자기 절망적으로 느껴진다.',
    choices:[
      {label:'탈출을 생각하며 버틴다',icon:'🌊',req:'resource',
       reward:{san:8,escape:5},failPen:{san:-15},
       desc:'자원판정. 성공:정신력+8+탈출+5% / 실패:정신력-15'},
      {label:'그냥 눈을 감는다',icon:'😔',req:null,
       reward:{san:-5},
       desc:'무조건. 체념하며 버틴다. 정신력-5.'},
    ]},
  old_fire:{
    name:'꺼진 모닥불 흔적',flavor:'누군가 야영했던 자리다. 숯불 주위에 쓸만한 것이 남아있을지도 모른다.',
    choices:[
      {label:'재와 주변을 뒤진다',icon:'🔥',req:'resource',
       reward:{card:'wood',n:2,san:5},failPen:{hun:-10},
       greatCard:'axe',greatBonus:{card:'wood',n:1,ap:1},
       desc:'자원판정. 성공:목재×2+정신력+5 / 대성공(도끼):+목재+AP환급 / 실패:허기-10'},
      {label:'불을 다시 피운다',icon:'🕯️',req:null,
       reward:{san:8},
       desc:'무조건. 따뜻한 불로 정신력+8 회복.'},
    ]},
};

const RECIPES=[
  {id:'r_knife',   cat:'생존',name:'칼',       icon:'🔪',result:'knife',          rn:1,ap:1,cost:[{id:'wood',n:1},{id:'metal',n:2}],  desc:'패시브:식량회복+8. 전투ATK4.'},
  {id:'r_torch',   cat:'수집',name:'횃불',     icon:'🕯️',result:'torch',          rn:1,ap:1,cost:[{id:'wood',n:2}],                   desc:'패시브:탐색추가보상. 폐허수집장비.'},
  {id:'r_rope',    cat:'생존',name:'밧줄',     icon:'🪢',result:'rope',           rn:1,ap:1,cost:[{id:'wood',n:1},{id:'food',n:1}],   desc:'패시브:드로우+1. 방어DEF3.'},
  {id:'r_axe',     cat:'수집',name:'도끼',     icon:'🪓',result:'axe',            rn:1,ap:1,cost:[{id:'wood',n:2},{id:'metal',n:1}],  desc:'숲 나무베기. 전투ATK3.'},
  {id:'r_gknife',  cat:'수집',name:'채집칼',   icon:'🗡️',result:'gathering_knife',rn:1,ap:1,cost:[{id:'metal',n:2}],                  desc:'숲 약초채집. 전투ATK2.'},
  {id:'r_frod',    cat:'수집',name:'낚싯대',   icon:'🎣',result:'fishing_rod',    rn:1,ap:1,cost:[{id:'wood',n:2},{id:'metal',n:1}],  desc:'해변·해안 낚시. 방어DEF2.'},
  {id:'r_canteen', cat:'수집',name:'물통',     icon:'🫙',result:'canteen',        rn:1,ap:1,cost:[{id:'metal',n:2}],                  desc:'해안 물 채집. 방어DEF2.'},
  {id:'r_pick',    cat:'수집',name:'곡괭이',   icon:'⛏️',result:'pickaxe',       rn:1,ap:1,cost:[{id:'wood',n:1},{id:'metal',n:3}],  desc:'동굴 채굴. 전투ATK3.'},
  {id:'r_spear',   cat:'전투',name:'창',       icon:'🗡️',result:'spear',         rn:1,ap:2,cost:[{id:'wood',n:2},{id:'metal',n:3}],  desc:'관통특수. ATK8+4관통. 최강공격.'},
  {id:'r_larmor',  cat:'전투',name:'가죽갑옷', icon:'🧥',result:'leather_armor',  rn:1,ap:1,cost:[{id:'hide',n:2}],                  desc:'패시브:전투피해-2. DEF4. 가죽×2.'},
  {id:'r_pknife',  cat:'전투',name:'독칼',     icon:'☠️',result:'poison_knife',   rn:1,ap:1,cost:[{id:'hide',n:1},{id:'venom',n:1}],  desc:'독:매라운드+3피해. ATK6. 가죽+독낭.'},
  {id:'r_fcloak',  cat:'전투',name:'깃털망토', icon:'🧣',result:'feather_cloak',  rn:1,ap:1,cost:[{id:'feather',n:2}],               desc:'패시브:도망비용HP-2. DEF2. 깃털×2.'},
  {id:'r_compass', cat:'탈출',name:'유물나침반',icon:'🧭',result:'compass',       rn:1,ap:1,cost:[{id:'shard',n:2}],                  desc:'즉시 탈출도+20%. 고대파편×2.'},
  // 뗏목 — 뽑기 시스템 (대성공1/성공3/실패1)
  {id:'r_raft',    cat:'탈출',name:'뗏목 부품',icon:'🛶',result:null,             rn:0,ap:2,cost:[{id:'wood',n:3},{id:'metal',n:1}],
   desc:'대성공(1/5): +30%  성공(3/5): +15%  실패(1/5): -10%', raftLottery:true},
];

// O(1) 카드 조회 맵 — CARDS.find() 대신 CARD_MAP[id] 사용
const CARD_MAP = Object.fromEntries(CARDS.map(c=>[c.id,c]));

// ─── 섬 정의 ───────────────────────────────────────────
// 향후 섬 추가 시 여기에 객체 추가 (id, name, icon, subtitle, story, mechanic, doomName, startLog)
const ISLANDS = {
  mangrove: {
    id: 'mangrove',
    name: '망각의 맹그로브 섬',
    icon: '🌿',
    subtitle: '기억을 잃은 자의 섬',
    story: '정신을 차렸을 때, 이름조차 떠오르지 않았다.\n\n습한 공기, 뒤엉킨 맹그로브 뿌리들, 조용히 흐르는 검은 물.\n여기가 어딘지, 어떻게 왔는지 — 아무것도 기억나지 않는다.\n\n숲 너머로 바다가 보인다. 섬은 조용하고, 그 조용함이 더 무섭다.\n오래 있을수록 안개가 머릿속을 채워간다.\n\n탈출해야 한다. 기억이 완전히 사라지기 전에.',
    mechanic: '🌀 망각의 안개\nDOOM이 높아질수록 짙어지는 안개가 정신력을 가속 소모시킨다.\nDOOM 80% 이후, 탐색·수면 중 망각 상태이상 카드가 덱에 침투한다.\n망각 카드가 판정에 뽑히면 정신력-3. 오래 머물수록 기억이 무너진다.',
    doomName: '망각의 안개',
    doomIcon: '🌫️',
    startLog: '🌿 망각의 맹그로브 섬에 홀로 깨어났다. 기억이 흐릿하다.',
  },
};
