var $=function(s){return document.querySelector(s)};
var rp=function(n){return (n<0?'-':'')+'Rp '+Math.abs(Math.round(n)).toLocaleString('id-ID')};
var uid=function(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)};
function fmt(d){var m=d.getMonth()+1,x=d.getDate();return d.getFullYear()+'-'+(m<10?'0':'')+m+'-'+(x<10?'0':'')+x}
var today=fmt(new Date());
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function nm(i){return i.cat+' · '+i.name+(i.size?' '+i.size:'')}
var tab='lap',mode='d',pd=today,cat='Semua';
var TABS=[['lap','Laporan'],['jual','Penjualan'],['biaya','Biaya & Modal'],['stok','Stok']];
function nav(){$('#nav').innerHTML=TABS.map(function(t){return '<button class="'+(tab==t[0]?'on':'')+'" onclick="tab=\''+t[0]+'\';render()">'+t[1]+'</button>'}).join('')}
function range(){var d=new Date(pd+'T00:00:00');
 if(mode=='d')return[pd,pd,'Harian · '+pd];
 if(mode=='w'){var k=(d.getDay()+6)%7;var a=new Date(d);a.setDate(d.getDate()-k);var b=new Date(a);b.setDate(a.getDate()+6);return[fmt(a),fmt(b),'Mingguan · '+fmt(a)+' s/d '+fmt(b)]}
 var a2=new Date(d.getFullYear(),d.getMonth(),1),b2=new Date(d.getFullYear(),d.getMonth()+1,0);
 return[fmt(a2),fmt(b2),'Bulanan · '+d.toLocaleDateString('id-ID',{month:'long',year:'numeric'})]}
function K(l,v,c){return '<div class="k"><small>'+l+'</small><b class="'+(c||'')+'">'+v+'</b></div>'}
function vLap0(){var r=range(),T=S.tx.filter(function(t){return t.date>=r[0]&&t.date<=r[1]}),E=S.exp.filter(function(e){return e.date>=r[0]&&e.date<=r[1]});
 var jual=0,hpp=0,biaya=0,modalP=0;
 T.forEach(function(t){jual+=t.qty*t.price;hpp+=t.qty*t.cost});
 E.forEach(function(e){if(e.type=='modal')modalP+=e.amt;else biaya+=e.amt});
 var kotor=jual-hpp,bersih=kotor-biaya;
 var stokVal=S.items.reduce(function(a,i){return a+i.qty*i.cost},0);
 var modalAll=S.exp.filter(function(e){return e.type=='modal'}).reduce(function(a,e){return a+e.amt},0);
 var h='<div class="card"><div class="row"><label>Periode<select onchange="mode=this.value;render()"><option value="d"'+(mode=='d'?' selected':'')+'>Harian</option><option value="w"'+(mode=='w'?' selected':'')+'>Mingguan</option><option value="m"'+(mode=='m'?' selected':'')+'>Bulanan</option></select></label><label>Tanggal acuan<input type="date" value="'+pd+'" onchange="pd=this.value||today;render()"></label></div><div class="note">'+r[2]+'</div></div>';
 h+='<div class="grid">'+K('Penjualan',rp(jual))+K('HPP (modal barang terjual)',rp(hpp))+K('Laba kotor',rp(kotor),kotor<0?'neg':'pos')+K('Biaya operasional',rp(biaya))+K('Laba bersih',rp(bersih),bersih<0?'neg':'pos')+K('Setoran modal periode',rp(modalP))+'</div>';
 h+='<div class="grid">'+K('Nilai stok saat ini (harga modal)',rp(stokVal))+K('Total modal tambahan (semua waktu)',rp(modalAll))+'</div>';
 var by={};T.forEach(function(t){var o=by[t.name]||(by[t.name]={q:0,j:0,l:0});o.q+=t.qty;o.j+=t.qty*t.price;o.l+=t.qty*(t.price-t.cost)});
 var rows=Object.keys(by).sort(function(a,b){return by[b].l-by[a].l}).map(function(k){var o=by[k];return '<tr><td>'+esc(k)+'</td><td class="r">'+o.q+'</td><td class="r">'+rp(o.j)+'</td><td class="r '+(o.l<0?'neg':'pos')+'">'+rp(o.l)+'</td></tr>'}).join('');
 h+='<div class="card"><h2>Rincian per produk</h2><div class="tw"><table><tr><th>Produk</th><th class="r">Terjual</th><th class="r">Penjualan</th><th class="r">Laba</th></tr>'+(rows||'<tr><td colspan="4">Belum ada penjualan di periode ini.</td></tr>')+'</table></div></div>';
 var er=E.map(function(e){return '<tr><td>'+e.date+'</td><td>'+(e.type=='modal'?'Modal':'Operasional')+'</td><td>'+esc(e.note)+'</td><td class="r">'+rp(e.amt)+'</td></tr>'}).join('');
 h+='<div class="card"><h2>Biaya &amp; modal periode ini</h2><div class="tw"><table><tr><th>Tanggal</th><th>Jenis</th><th>Keterangan</th><th class="r">Jumlah</th></tr>'+(er||'<tr><td colspan="4">Tidak ada.</td></tr>')+'</table></div></div>';
 return h}
function vJual(){var opts=['Ikan','Cupang','Alat'].map(function(c){return '<optgroup label="'+c+'">'+S.items.filter(function(i){return i.cat==c}).map(function(i){return '<option value="'+i.id+'">'+esc(nm(i))+' (stok '+i.qty+')</option>'}).join('')+'</optgroup>'}).join('');
 var h='<div class="card"><h2>Catat penjualan</h2><div class="row"><label>Tanggal<input type="date" id="sd" value="'+today+'"></label><label>Produk<select id="si" onchange="fillP()">'+opts+'</select></label><label>Jumlah<input type="number" id="sq" value="1" min="1" style="width:80px"></label><label>Harga satuan<input type="number" id="sp" style="width:120px"></label><button class="b" onclick="addTx()">Simpan</button></div><div class="note">Harga otomatis dari harga jual, bisa diubah per transaksi (nego). Stok berkurang otomatis.</div></div>';
 var rows=S.tx.slice().sort(function(a,b){return a.date<b.date?1:-1}).slice(0,60).map(function(t){return '<tr><td>'+t.date+'</td><td>'+esc(t.name)+'</td><td class="r">'+t.qty+'</td><td class="r">'+rp(t.price)+'</td><td class="r">'+rp(t.qty*t.price)+'</td><td><button class="x" onclick="delTx(\''+t.id+'\')">✕</button></td></tr>'}).join('');
 return h+'<div class="card"><h2>Riwayat (60 terakhir)</h2><div class="tw"><table><tr><th>Tgl</th><th>Produk</th><th class="r">Qty</th><th class="r">Harga</th><th class="r">Total</th><th></th></tr>'+(rows||'<tr><td colspan="6">Belum ada.</td></tr>')+'</table></div></div>'}
function fillP(){var i=S.items.find(function(x){return x.id==$('#si').value});if(i)$('#sp').value=i.sell||''}


function vBiaya(){var h='<div class="card"><h2>Catat biaya / modal</h2><div class="row"><label>Tanggal<input type="date" id="ed" value="'+today+'"></label><label>Jenis<select id="et"><option value="op">Biaya operasional</option><option value="modal">Setoran modal</option></select></label><label>Keterangan<input id="en" placeholder="listrik, pakan, ongkir…"></label><label>Jumlah (Rp)<input type="number" id="ea" style="width:130px"></label><button class="b" onclick="addE()">Simpan</button></div></div>';
 var rows=S.exp.slice().sort(function(a,b){return a.date<b.date?1:-1}).map(function(e){return '<tr><td>'+e.date+'</td><td>'+(e.type=='modal'?'Modal':'Operasional')+'</td><td>'+esc(e.note)+'</td><td class="r">'+rp(e.amt)+'</td><td><button class="x" onclick="delE(\''+e.id+'\')">✕</button></td></tr>'}).join('');
 return h+'<div class="card"><div class="tw"><table><tr><th>Tgl</th><th>Jenis</th><th>Ket.</th><th class="r">Jumlah</th><th></th></tr>'+(rows||'<tr><td colspan="5">Belum ada.</td></tr>')+'</table></div></div>'}


function vStok0(){var cs=['Semua','Ikan','Cupang','Alat'];
 var h='<div class="card"><div class="row"><label>Kategori<select onchange="cat=this.value;render()">'+cs.map(function(c){return '<option'+(c==cat?' selected':'')+'>'+c+'</option>'}).join('')+'</select></label></div><div class="note">Ubah angka langsung di tabel, otomatis tersimpan di database. Baris kuning = stok ≤ 5. Harga jual alat masih 0 (belum ada di data klien), isi dulu.</div></div>';
 var rows=S.items.filter(function(i){return cat=='Semua'||i.cat==cat}).map(function(i){return '<tr class="'+(i.qty<=5?'low':'')+'"><td>'+esc(nm(i))+'</td><td><input type="number" value="'+i.qty+'" onchange="upd(\''+i.id+'\',\'qty\',this.value)"></td><td><input type="number" value="'+i.cost+'" onchange="upd(\''+i.id+'\',\'cost\',this.value)"></td><td><input type="number" value="'+i.sell+'" onchange="upd(\''+i.id+'\',\'sell\',this.value)"></td></tr>'}).join('');
 h+='<div class="card"><div class="tw"><table><tr><th>Produk</th><th>Stok</th><th>Harga modal</th><th>Harga jual</th></tr>'+rows+'</table></div></div>';
 h+='<div class="card"><h2>Tambah produk</h2><div class="row"><label>Kategori<select id="nc"><option>Ikan</option><option>Cupang</option><option>Alat</option></select></label><label>Nama<input id="nn"></label><label>Ukuran<input id="ns" style="width:90px"></label><label>Stok<input type="number" id="nq" style="width:80px"></label><label>Modal<input type="number" id="nk" style="width:110px"></label><label>Jual<input type="number" id="nj" style="width:110px"></label><button class="b" onclick="addI()">Tambah</button></div></div>';
 return h}



var S={items:[],tx:[],exp:[],rs:[]},DB=null,ready=false;
function fail(e){alert('Gagal: '+(e&&e.message||e))}
function put(n,o){if(!DB)return alert('Database belum siap.');o.id=o.id||uid();return DB.set(n,o).catch(fail)}
function del(n,id){return DB&&DB.remove(n,id).catch(fail)}
function patch(id,o){return DB&&DB.update('items',id,o).catch(fail)}
function sub(n){DB.subscribe(n,function(rows){S[n]=rows.sort(function(a,b){return a.id<b.id?-1:1});ready=true;render()},function(e){ready=true;render();fail(e)})}
function start(){['items','tx','exp','rs'].forEach(sub)}
function showLogin(){ready=true;nav();$('#app').innerHTML='<div class="card"><h2>Login</h2><div class="row"><label>Email<input id="le" type="email"></label><label>Password<input id="lp" type="password"></label><button class="b" onclick="doLogin()">Masuk</button></div></div>'}
function doLogin(){DB.login($('#le').value,$('#lp').value).then(function(){ready=false;render();start()}).catch(fail)}
function seedBox(){return(ready&&DB&&!S.items.length)?'<div class="card"><h2>Stok masih kosong</h2><button class="b" onclick="seedItems()">Isi stok awal dari data klien ('+SEED_ITEMS.length+' produk)</button></div>':''}
function seedItems(){if(confirm('Isi '+SEED_ITEMS.length+' produk stok awal?'))SEED_ITEMS.forEach(function(o){put('items',Object.assign({},o))})}
(async function(){try{DB=createDB(CONFIG)}catch(e){ready=true;render();alert(e.message);return}
 if(DB.login&&!(await DB.hasSession())){showLogin();return}
 start()})();
function upd(id,f,v){var o={};o[f]=+v||0;patch(id,o)}
function addI(){var n=$('#nn').value.trim();if(!n)return alert('Isi nama.');put('items',{cat:$('#nc').value,name:n,size:$('#ns').value,qty:+$('#nq').value||0,cost:+$('#nk').value||0,sell:+$('#nj').value||0})}
function addTx(){var i=S.items.find(function(x){return x.id==$('#si').value}),q=+$('#sq').value,p=+$('#sp').value;
 if(!i||q<1||$('#sp').value==='')return alert('Isi produk, jumlah, dan harga.');
 if(q>i.qty&&!confirm('Jumlah melebihi stok ('+i.qty+'). Lanjut?'))return;
 put('tx',{date:$('#sd').value||today,itemId:i.id,name:nm(i),qty:q,price:p,cost:i.cost});patch(i.id,{qty:i.qty-q})}
function delTx(id){var t=S.tx.find(function(x){return x.id==id});if(!t||!confirm('Hapus transaksi ini? Stok dikembalikan.'))return;
 var i=S.items.find(function(x){return x.id==t.itemId});if(i)patch(i.id,{qty:i.qty+t.qty});del('tx',id)}
function addE(){var a=+$('#ea').value;if(!(a>0))return alert('Isi jumlah.');put('exp',{date:$('#ed').value||today,type:$('#et').value,note:$('#en').value,amt:a})}
function delE(id){if(confirm('Hapus?'))del('exp',id)}
function addRs(){var i=S.items.find(function(x){return x.id==$('#ri').value}),q=+$('#rq').value;if(!i||q<1)return alert('Isi produk dan jumlah.');var c=+$('#rc').value||i.cost;
 put('rs',{date:$('#rd').value||today,itemId:i.id,name:nm(i),qty:q,amt:q*c});patch(i.id,{qty:i.qty+q,cost:c})}
function delRs(id){var x=S.rs.find(function(r){return r.id==id});if(!x||!confirm('Hapus catatan restock? Stok dikurangi kembali.'))return;
 var i=S.items.find(function(r){return r.id==x.itemId});if(i)patch(i.id,{qty:Math.max(0,i.qty-x.qty)});del('rs',id)}
function days(){var r=range(),e=mode=='d'?pd:r[1],s=mode=='d'?fmt(new Date(new Date(pd+'T00:00:00').getTime()-6*864e5)):r[0],o=[];
 for(var d=new Date(s+'T00:00:00');fmt(d)<=e;d.setDate(d.getDate()+1))o.push(fmt(d));return o}
function chart(){var D=days(),V=D.map(function(d){var j=0,l=0;S.tx.forEach(function(t){if(t.date==d){j+=t.qty*t.price;l+=t.qty*(t.price-t.cost)}});return[d,j,l]});
 var mx=Math.max(1,Math.max.apply(null,V.map(function(v){return v[1]}))),w=600/V.length,s='';
 V.forEach(function(v,i){var x=i*w+w*.1,h1=v[1]/mx*130,h2=Math.max(0,v[2])/mx*130;
 s+='<rect x="'+x+'" y="'+(150-h1)+'" width="'+w*.8+'" height="'+h1+'" fill="var(--ac)" opacity=".35"/><rect x="'+x+'" y="'+(150-h2)+'" width="'+w*.8+'" height="'+h2+'" fill="var(--ok)"/>';
 if(V.length<=10||i%5==0)s+='<text x="'+(x+w*.4)+'" y="168" font-size="10" text-anchor="middle" fill="var(--mu)">'+v[0].slice(8)+'</text>'});
 return '<div class="card"><h2>Tren penjualan &amp; laba per hari</h2><svg viewBox="0 0 600 175" width="100%"><line x1="0" x2="600" y1="150" y2="150" stroke="var(--br)"/>'+s+'</svg><div class="note">Biru muda = penjualan, hijau = laba. Skala tertinggi '+rp(mx)+'. Mode harian menampilkan 7 hari terakhir.</div></div>'}
function vLap(){var kas=0;S.exp.forEach(function(e){kas+=e.type=='modal'?e.amt:-e.amt});S.tx.forEach(function(t){kas+=t.qty*t.price});S.rs.forEach(function(x){kas-=x.amt});
 var low=S.items.filter(function(i){return i.qty<=5});
 return vLap0()+chart()+'<div class="grid">'+K('Estimasi kas (modal + penjualan − biaya − restock)',rp(kas),kas<0?'neg':'pos')+'</div><div class="card"><h2>Stok menipis (≤ 5)</h2>'+(low.length?low.map(function(i){return esc(nm(i))+' ('+i.qty+')'}).join(', '):'Aman.')+'</div><div class="card"><button class="b" onclick="exportCsv()">Unduh laporan periode ini (CSV/Excel)</button><div class="note">Estimasi kas belum memasukkan nilai stok awal.</div></div>'}
async function exportCsv(){var r=range(),L=[['Tanggal','Produk','Qty','Harga','Total','HPP','Laba']];
 S.tx.filter(function(t){return t.date>=r[0]&&t.date<=r[1]}).forEach(function(t){L.push([t.date,t.name,t.qty,t.price,t.qty*t.price,t.qty*t.cost,t.qty*(t.price-t.cost)])});
 var csv='\ufeff'+L.map(function(l){return l.map(function(c){return '"'+String(c).replace(/"/g,'""')+'"'}).join(';')}).join('\n');
 var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='laporan-'+r[0]+'_'+r[1]+'.csv';a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},1000)}
function vStok(){var o=['Ikan','Cupang','Alat'].map(function(c){return '<optgroup label="'+c+'">'+S.items.filter(function(i){return i.cat==c}).map(function(i){return '<option value="'+i.id+'">'+esc(nm(i))+'</option>'}).join('')+'</optgroup>'}).join('');
 var rr=S.rs.slice().sort(function(a,b){return a.date<b.date?1:-1}).slice(0,20).map(function(x){return '<tr><td>'+x.date+'</td><td>'+esc(x.name)+'</td><td class="r">'+x.qty+'</td><td class="r">'+rp(x.amt)+'</td><td><button class="x" onclick="delRs(\''+x.id+'\')">✕</button></td></tr>'}).join('');
 return vStok0()+'<div class="card"><h2>Restock (tambah stok)</h2><div class="row"><label>Tanggal<input type="date" id="rd" value="'+today+'"></label><label>Produk<select id="ri">'+o+'</select></label><label>Jumlah<input type="number" id="rq" style="width:80px"></label><label>Modal/satuan<input type="number" id="rc" style="width:110px" placeholder="opsional"></label><button class="b" onclick="addRs()">Simpan</button></div><div class="note">Menambah stok dan tercatat sebagai pengeluaran restock. Kalau modal/satuan diisi, harga modal produk ikut diperbarui.</div></div><div class="card"><h2>Riwayat restock</h2><div class="tw"><table><tr><th>Tgl</th><th>Produk</th><th class="r">Qty</th><th class="r">Biaya</th><th></th></tr>'+(rr||'<tr><td colspan="5">Belum ada.</td></tr>')+'</table></div></div>'}
function render(){nav();if(!ready){$('#app').innerHTML='<div class="card">Memuat data…</div>';return}
 $('#app').innerHTML=(DB?'':'<div class="card">Database tidak tersedia. Cek js/config.js.</div>')+seedBox()+{lap:vLap,jual:vJual,biaya:vBiaya,stok:vStok}[tab]();if(tab=='jual')fillP()}
render();
