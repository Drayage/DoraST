// ═══════════════ CAMP ═══════════════

function doCamp(){
  if(G.over) return;
  // 스킬 패시브: 캠프 AP 비용 (count 기반)
  const _cpBCnt=allCards().filter(c=>c.id==='sk_cp_b').length;
  const campCost=Math.max(0,8-2*_cpBCnt);
  if(G.ap<campCost){log(`AP부족 (캠프:AP${campCost})`,'danger');render();return;}
  if(G.tiles[G.pos].hasCamp){log('이미 캠프가 있다.','');return;}
  G.tiles[G.pos].hasCamp=true; G.camps.push(G.pos); G.ap-=campCost;
  if(!G.actionCnt) G.actionCnt={move:0,explore:0,gather:0,camp:0,craft:0,carduse:0,sleep:0,combat:0};
  G.actionCnt.camp=(G.actionCnt.camp||0)+1;
  const t=G.tiles[G.pos];
  const bns={beach:'카드사용+1드로우',forest:'취침 식량 자동생성',cave:'취침 정신력+3',ruins:'취침 AP+1',shore:'취침 물 자동생성'};
  log(`🏕️ ${t.name} 캠프 건설! (AP-${campCost}) — ${bns[t.id]||''}`, 'success');
  render();
}
