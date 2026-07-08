/* ============================================================
   写真の自動ローテーション
   - photos.json の台帳を読み、data-photo="スロット名" の <img> を
     「今月の写真」に差し替える（年月から決まるので月替わりで自動更新）
   - 安全設計：台帳が読めない・写真が存在しない場合は、
     HTMLに書かれた元の写真がそのまま表示される（何も壊れない）
   ============================================================ */
(function () {
  'use strict';

  /* このスクリプト自身のURLから assets/ の場所を割り出す（どの階層のページからでも動く） */
  var script = document.currentScript;
  if (!script) return;
  var assetsBase = script.src.replace(/rotate\.js.*$/, '');

  fetch(assetsBase + 'photos.json')
    .then(function (res) { return res.json(); })
    .then(function (manifest) {
      var now = new Date();
      var seed = now.getFullYear() * 12 + now.getMonth(); /* 月が変わると+1 */

      Object.keys(manifest.slots).forEach(function (slotName) {
        var el = document.querySelector('[data-photo="' + slotName + '"]');
        if (!el) return;
        var def = manifest.slots[slotName];
        var pool = manifest.pools[def.pool];
        if (!pool || !pool.length) return;
        var idx = (seed + (def.offset || 0)) % pool.length;
        var newSrc = assetsBase + 'images/' + pool[idx];
        if (el.src === newSrc) return;
        /* 先に読み込み確認してから差し替える（存在しない写真で枠が壊れないように） */
        var probe = new Image();
        probe.onload = function () { el.src = newSrc; };
        probe.src = newSrc;
      });
    })
    .catch(function () { /* 台帳が読めない場合は元の写真のまま表示 */ });
})();
