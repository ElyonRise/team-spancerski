/* Team Spancerski — login do painel do treinador (Google). Sem login, o painel não abre. */
(function () {
  'use strict';
  const auth = firebase.auth();
  let overlay;
  function tela(msg) {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#0C1609;display:flex;align-items:center;justify-content:center;padding:20px;font-family:Inter,system-ui,sans-serif;color:#E4ECDC';
      overlay.innerHTML = '<div style="max-width:360px;text-align:center"><img src="logo-transparente.png" alt="" style="width:96px;margin-bottom:12px"><h2 style="margin:0 0 6px">Painel do treinador</h2><p style="color:#8FA083;margin:0 0 20px">Entre com a sua conta Google para continuar.</p><button id="spLoginBtn" style="width:100%;padding:13px;border:0;border-radius:999px;background:#39FF6A;color:#0C1609;font:700 15px Inter,system-ui,sans-serif;cursor:pointer">Entrar com Google</button><p id="spLoginMsg" style="color:#FF6B6B;min-height:20px;margin-top:14px;font-size:14px"></p></div>';
      document.body.appendChild(overlay);
      overlay.querySelector('#spLoginBtn').onclick = () =>
        auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(e => tela('Não foi possível entrar: ' + (e.code || e.message)));
    }
    overlay.querySelector('#spLoginMsg').textContent = msg || '';
    overlay.style.display = 'flex';
  }
  window.__authPronto = new Promise(resolve => {
    auth.onAuthStateChanged(u => {
      if (u) { if (overlay) overlay.style.display = 'none'; resolve(u); }
      else tela();
    });
  });
  window.sairDoPainel = () => auth.signOut().then(() => location.reload());
})();
