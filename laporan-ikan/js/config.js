// Pengaturan database.
// backend: 'local'    -> data disimpan di browser (localStorage), cocok untuk coba-coba.
//          'supabase' -> data disimpan di database Supabase (permanen, bisa multi-perangkat).
// Isi supabaseUrl & supabaseKey (anon public key) dari Supabase > Project Settings > API.
var CONFIG = {
  backend: 'local',
  supabaseUrl: '',
  supabaseKey: ''
};
