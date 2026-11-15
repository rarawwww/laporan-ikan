// Adapter database. Antarmuka sama untuk semua backend:
//   subscribe(nama, onRows, onError), set(nama, obj), update(nama, id, patch), remove(nama, id)
// Koleksi: items, tx, exp, rs. Setiap dokumen punya field "id".
function createDB(cfg) {
  return cfg.backend === 'supabase' ? supabaseDB(cfg) : localDB();
}

function localDB() {
  var KEY = 'laporan-ikan-v1', subs = {};
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function emit(n) { var d = load(); (subs[n] || []).forEach(function (f) { f(Object.keys(d[n] || {}).map(function (k) { return d[n][k]; })); }); }
  function write(n, fn) {
    return new Promise(function (res) {
      var d = load(); d[n] = d[n] || {}; fn(d[n]);
      localStorage.setItem(KEY, JSON.stringify(d)); emit(n); res();
    });
  }
  return {
    subscribe: function (n, ok) { (subs[n] = subs[n] || []).push(ok); emit(n); },
    set: function (n, o) { return write(n, function (c) { c[o.id] = o; }); },
    update: function (n, id, p) { return write(n, function (c) { if (!c[id]) throw new Error('Data tidak ditemukan'); Object.assign(c[id], p); }); },
    remove: function (n, id) { return write(n, function (c) { delete c[id]; }); }
  };
}

function supabaseDB(cfg) {
  if (!window.supabase) throw new Error('Library Supabase gagal dimuat (cek koneksi internet).');
  if (!cfg.supabaseUrl || !cfg.supabaseKey) throw new Error('Isi supabaseUrl dan supabaseKey di js/config.js');
  var c = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey), subs = {};
  function chk(r) { if (r.error) throw r.error; return r; }
  function refresh(n) {
    return c.from(n).select('data').then(chk).then(function (r) {
      var rows = r.data.map(function (x) { return x.data; });
      (subs[n] || []).forEach(function (s) { s.ok(rows); });
    }).catch(function (e) { (subs[n] || []).forEach(function (s) { if (s.err) s.err(e); }); });
  }
  return {
    login: function (email, pass) { return c.auth.signInWithPassword({ email: email, password: pass }).then(chk); },
    logout: function () { return c.auth.signOut(); },
    hasSession: function () { return c.auth.getSession().then(function (r) { return !!(r.data && r.data.session); }); },
    subscribe: function (n, ok, err) {
      (subs[n] = subs[n] || []).push({ ok: ok, err: err });
      refresh(n);
      c.channel('rt-' + n).on('postgres_changes', { event: '*', schema: 'public', table: n }, function () { refresh(n); }).subscribe();
    },
    set: function (n, o) { return c.from(n).upsert({ id: o.id, data: o }).then(chk).then(function () { return refresh(n); }); },
    update: function (n, id, p) {
      return c.from(n).select('data').eq('id', id).single().then(chk).then(function (r) {
        return c.from(n).upsert({ id: id, data: Object.assign({}, r.data.data, p) }).then(chk);
      }).then(function () { return refresh(n); });
    },
    remove: function (n, id) { return c.from(n).delete().eq('id', id).then(chk).then(function () { return refresh(n); }); }
  };
}
