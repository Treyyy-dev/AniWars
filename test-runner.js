const { chromium } = require('playwright');
const mode = process.argv[2] || 'battle';
(async () => {
  const b = await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
  const p = await b.newPage({viewport:{width:390,height:844}, deviceScaleFactor:1});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e))); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text())});
  const px = process.argv[3] || 'off';
  await p.addInitScript(`localStorage.setItem('moonpetal-v1', JSON.stringify({v:2,gold:1e9,stage:60,kills:0,farm:false,roster:{akari:{lv:50,star:1}},team:['akari'],crystals:5000,pity:0,tap:10,crit:0,fort:0,spirit:0,best:60,ult:0,mute:true,taps:0,seen:0,fps:60,q:'high',px:'${px}',peak:60,last:Date.now()}))`);
  await p.goto('file://'+process.cwd()+'/game.html'); await p.waitForTimeout(2000);
  const ev = c => p.evaluate(c => window.__ev(c), c);
  const info = await ev(`(() => {
    const byW = {}; ROSTER.forEach(h => { (byW[h.weapon] = byW[h.weapon] || []).push(h.id); });
    ROSTER.forEach(h => S.roster[h.id] = {lv: 20, star: 1});
    const pick = Object.values(byW).map(a => a[0]);
    window.__pick = pick; S.team = (window.__team || pick).slice(0, 3);
    beginGame(); const it = document.getElementById('intro'); if (it) it.hidden = true; teamSig = '';
    return JSON.stringify({weapons: Object.keys(byW), team: S.team.map(id => HB[id].weapon)});
  })()`);
  await p.waitForTimeout(800);
  if (mode === 'battle') {
    for (const set of [[0,3],[3,6],[6,9]]) { await ev(`S.team = __pick.slice(${set[0]},${set[1]}); teamSig='';`); await p.waitForTimeout(1200); await p.screenshot({path:`out_b${set[0]}.png`, clip:{x:0,y:0,width:390,height:420}}); }
  } else if (mode === 'weapons') {
    await ev(`(() => { const c = document.createElement('canvas'); c.width = 6*130; c.height = 2*170; const g = c.getContext('2d'); g.fillStyle='#2b2450'; g.fillRect(0,0,c.width,c.height);
      __pick.forEach((id,i) => { const im = portraitImage(HB[id], 130, 170, 'full'); if (im) g.drawImage(im, (i%6)*130, Math.floor(i/6)*170); g.fillStyle='#fff'; g.font='12px sans-serif'; g.fillText(HB[id].weapon, (i%6)*130+4, Math.floor(i/6)*170+14); });
      c.id='wsheet'; c.style.cssText='position:fixed;left:0;top:0;z-index:999'; document.body.appendChild(c); })()`);
    await p.waitForTimeout(300);
    const el = await p.$('#wsheet'); await el.screenshot({path:'out_weapons.png'});
  } else if (mode === 'home') {
    await ev(`(() => { const h = homeData(); h.sel = Object.keys(S.roster).slice(0, 15); setMode(true); })()`);
    await p.waitForTimeout(3000); await p.screenshot({path:'out_home0.png'});
    await ev(`homeScroll(3)`); await p.waitForTimeout(8000); await p.screenshot({path:'out_home1.png'});
    console.log(await ev(`JSON.stringify(Object.values(RES).map(r => [r.f, r.st, +r.pos.y.toFixed(1)]))`));
  }
  console.log(info); console.log('ERRS', JSON.stringify(errs.slice(0,8)));
  await b.close();
})();
