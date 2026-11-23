// ---------- Item Pouch x3 + Gunner Pouch + hapus massal (offset dari perbandingan save; 8 slot x (ID u16, jumlah u16)) ----------
const PGB=[B+51988,B+52020,B+52052,B+51956],PGN=8,PGNAME=["Item Pouch 1","Item Pouch 2","Item Pouch 3","Gunner Pouch"];
const pgBase=()=>PGB[+$("pgSel").value|0];
function pgDraw(){if(!S)return;const v=dv(),b=pgBase();let o="",opts="";
 for(let i=0;i<PGN;i++){const id=v.getUint16(b+i*4,true),c=v.getUint16(b+i*4+2,true),on=id||c;
  opts+=`<option value="${i}">${i+1}${on?" · "+esc(nm(id)):" · kosong"}</option>`;
  if(!on)continue;
  o+=`<tr><td>${i+1}</td><td class="nm">${ic(id)}${esc(nm(id))}<br><small>ID ${id}</small></td><td><input type="number" min="0" max="99" value="${c}" data-pgi="${i}"></td><td><button class="del" data-pgd="${i}">\u2715</button></td></tr>`}
 $("pgtb").innerHTML=o||"<tr><td colspan=4>Pouch kosong</td></tr>";
 const keep=$("pgslot").value;$("pgslot").innerHTML=opts;if(keep!=="")$("pgslot").value=keep}
const _pgLoad=load;load=function(){_pgLoad.apply(this,arguments);pgDraw()};
$("pgSel").onchange=pgDraw;
$("pgq").oninput=()=>{delete $("pgq").dataset.id;const q=$("pgq").value.trim().toLowerCase(),o=[];if(q){for(let i=1;i<NAMES.length&&o.length<12;i++)if(!bad(NAMES[i])&&(NAMES[i].toLowerCase().includes(q)||String(i)===q))o.push(`<button data-p="${i}">${ic(i)}${esc(NAMES[i])} \u00b7 ${i}</button>`)}$("pgsug").innerHTML=o.join("")};
$("pgsug").onclick=e=>{const b=e.target.closest("button");if(!b)return;$("pgq").dataset.id=b.dataset.p;$("pgq").value=NAMES[+b.dataset.p];$("pgsug").innerHTML=""};
$("pgadd").onclick=()=>{if(!S){alert("Pilih file save dulu");return}
 let id=+($("pgq").dataset.id||0);const t=$("pgq").value.trim();if(!id||NAMES[id]!==t){id=/^\d+$/.test(t)?+t:NAMES.findIndex(n=>n.toLowerCase()===t.toLowerCase())}
 if(!(id>=1&&id<NAMES.length)||bad(NAMES[id])){alert("Pilih item dari daftar saran atau isi ID yang valid.");return}
 const c=Math.max(1,Math.min(99,+$("pgcnt").value|0)),i=+$("pgslot").value,v=dv(),b=pgBase();$("pgnote").textContent="";
 v.setUint16(b+i*4,id,true);v.setUint16(b+i*4+2,c,true);mark(true);pgDraw()};
$("pgtb").onchange=e=>{if(e.target.dataset.pgi===undefined)return;const i=+e.target.dataset.pgi,c=Math.max(0,Math.min(99,+e.target.value|0)),v=dv(),b=pgBase();v.setUint16(b+i*4+2,c,true);if(!c)v.setUint16(b+i*4,0,true);mark(true);pgDraw()};
$("pgtb").onclick=e=>{const x=e.target.closest("button.del");if(!x)return;const i=+x.dataset.pgd,v=dv(),b=pgBase();v.setUint16(b+i*4,0,true);v.setUint16(b+i*4+2,0,true);mark(true);pgDraw()};
function pgZero(v,k){const b=PGB[k];for(let i=0;i<PGN*2;i++)v.setUint16(b+i*2,0,true)}
function pgZeroBox(v){for(let i=0;i<N*2;i++)v.setUint16(B+O.item+i*2,0,true)}
function pgZeroEq(v){for(let i=0;i<EQCOUNT*EQSIZE;i++)v.setUint8(EQBASE+i,0);for(let i=0;i<7;i++)v.setUint16(EQINDEX+i*2,0xFFFF,true)}
function pgRefresh(){pgDraw();draw();eqSelected=-1;eqPage=0;eqDraw();loadWorn();mark(true)}
const pgNeed=()=>{if(!S){alert("Pilih file save dulu");return false}return true};
$("pgclr").onclick=()=>{if(!pgNeed()||!confirm("Kosongkan "+PGNAME[+$("pgSel").value|0]+"?"))return;pgZero(dv(),+$("pgSel").value|0);pgRefresh()};
$("pgclrP").onclick=()=>{if(!pgNeed()||!confirm("Kosongkan semua pouch (Item Pouch 1–3 dan Gunner Pouch)?"))return;const v=dv();for(let k=0;k<4;k++)pgZero(v,k);pgRefresh()};
$("pgclrBox").onclick=()=>{if(!pgNeed()||!confirm("Kosongkan seluruh Item Box?"))return;pgZeroBox(dv());pgRefresh()};
$("pgclrEq").onclick=()=>{if(!pgNeed()||!confirm("Kosongkan seluruh Equipment Box? Equipment yang dipakai juga dilepas."))return;pgZeroEq(dv());pgRefresh()};
$("pgclrAll").onclick=()=>{if(!pgNeed()||!confirm("Kosongkan SEMUA: Item Box, Equipment Box, dan semua pouch? Backup save dulu."))return;const v=dv();pgZeroBox(v);pgZeroEq(v);for(let k=0;k<4;k++)pgZero(v,k);pgRefresh()};

// ---------- Preset Item Pouch & Gunner Pouch ----------
const PGPRE={item:[["Starter OP (heal & buff)",["Mega Potion","Max Potion","Mega Nutrients","Mega Dash Juice","Mega Armorskin","Mega Demondrug","Dust of Life","Farcaster"]],
 ["Utilitas OP (bom, trap, seed)",["Flash Bomb","Sonic Bomb","Pitfall Trap","Shock Trap","Might Seed","Adamant Seed","Whetstone","Lifepowder"]]],
 gun:[["Amunisi OP",["Normal S Lv3","Pierce S Lv3","Pellet S Lv3","Clust S Lv3","Crag S Lv3","Recover S Lv2","Demon S","Armor S"]],
 ["Amunisi status & elemen",["Poison S Lv2","Para S Lv2","Sleep S Lv2","Exhaust S Lv2","Flaming S","Water S","Thunder S","Freeze S"]]]};
const pgPreList=()=>PGPRE[(+$("pgSel").value|0)===3?"gun":"item"];
function pgPreOpts(){const l=pgPreList(),keep=$("pgpre").value;$("pgpre").innerHTML=l.map((x,i)=>`<option value="${i}">${x[0]}</option>`).join("");if(keep&&l[+keep])$("pgpre").value=keep}
$("pgSel").onchange=()=>{pgPreOpts();pgDraw()};pgPreOpts();
$("pgprb").onclick=()=>{if(!pgNeed())return;const k=+$("pgSel").value|0,pr=pgPreList()[+$("pgpre").value|0];if(!pr)return;
 if(!confirm("Ganti isi "+PGNAME[k]+" dengan preset ini?"))return;
 const c=Math.max(1,Math.min(99,+$("pgcnt").value|0)),v=dv(),b=PGB[k];pgZero(v,k);let n=0;
 for(const nmv of pr[1]){const id=NAMES.indexOf(nmv);if(id>0&&n<PGN){v.setUint16(b+n*4,id,true);v.setUint16(b+n*4+2,c,true);n++}}
 mark(true);pgDraw()};
