// ═══════════════ CAMP ═══════════════

function doCamp(){
  if(G.over) return;
  if(G.ap<8){log('AP부족 (캠프:AP8)','danger');render();return;}
  if(G.tiles[G.pos].hasCamp){log('이미 캠프가 있다.','');return;}
  G.tiles[G.pos].hasCamp=true; G.camps.push(G.pos); G.ap-=8;
  const t=G.tiles[G.pos];
  const bns={beach:'허기감소 완화',forest:'매일 식량 자동생성',cave:'매일 정신력+5',ruins:'탐색확률 향상',shore:'매일 물 자동생성'};
  log(`🏕️ ${t.name} 캠프 건설! (AP-8) — ${bns[t.id]||''}`, 'success');
  render();
}
