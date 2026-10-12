// <patio-render>: 3-D design model of the fire-pit patio (three.js)
class PatioRender extends HTMLElement {
  connectedCallback() {
    if (this._init) return; this._init = true;
    this.style.display = 'block'; this.style.position = 'relative'; this.style.width = '100%'; this.style.height = '100%';
    this.style.cursor = 'grab';
    this.boot();
  }
  disconnectedCallback() { this._dead = true; this._ro && this._ro.disconnect(); }
  async boot() {
    const THREE = await import('https://esm.sh/three@0.160.0');
    const { OrbitControls } = await import('https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js');
    if (this._dead) return;
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    r.setPixelRatio(Math.min(2, devicePixelRatio));
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
    r.domElement.style.cssText = 'display:block;position:absolute;inset:0;width:100%;height:100%';
    this.appendChild(r.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#e9e1cf');
    scene.fog = new THREE.Fog('#e9e1cf', 70, 140);
    const cam = new THREE.PerspectiveCamera(38, 1, 0.5, 400);
    const kitchen = this.getAttribute('model') === 'kitchen';
    cam.position.set(...(kitchen ? [-14, 14, 24] : [-6, 22, 34]));
    const ctr = new OrbitControls(cam, r.domElement);
    ctr.target.set(...(kitchen ? [0, 2.5, 0] : [2, 1, -2])); ctr.enableDamping = true; ctr.enablePan = false; ctr.enableZoom = false;
    ctr.minPolarAngle = 0.5; ctr.maxPolarAngle = 1.3; ctr.autoRotate = true; ctr.autoRotateSpeed = 0.5;
    ctr.minAzimuthAngle = -0.9; ctr.maxAzimuthAngle = 0.5;
    let dir = 1;
    scene.add(new THREE.HemisphereLight('#fff8ec', '#8a8070', 1.4));
    const sun = new THREE.DirectionalLight('#fff3dd', 2.6);
    sun.position.set(-18, 30, 16); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 90 });
    sun.shadow.bias = -0.0004; sun.shadow.radius = 4;
    scene.add(sun);
    const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, ...o });
    const add = (g, m, x, y, z, cast = true) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = cast; o.receiveShadow = true; scene.add(o); return o; };

    if (kitchen) {
    const lawnK = add(new THREE.PlaneGeometry(160, 160), M('#8fa36a'), 0, 0, 0, false); lawnK.rotation.x = -Math.PI / 2;
    const tcK = document.createElement('canvas'); tcK.width = tcK.height = 1024; const tk = tcK.getContext('2d');
    tk.fillStyle = '#5f5a54'; tk.fillRect(0, 0, 1024, 1024);
    const tonesK = ['#9a958c', '#8c877f', '#a6a097', '#837e77', '#958f86'];
    let sk = 3; const rk = () => (sk = (sk * 9301 + 49297) % 233280) / 233280;
    for (let y = 0; y < 1024; y += 128) for (let x = (y / 128) % 2 ? -64 : 0; x < 1024; ) { const w = [128, 192, 256][Math.floor(rk() * 3)]; tk.fillStyle = tonesK[Math.floor(rk() * 5)]; tk.fillRect(x + 4, y + 4, w - 8, 120); x += w; }
    const texK = new THREE.CanvasTexture(tcK); texK.colorSpace = THREE.SRGBColorSpace; texK.wrapS = texK.wrapT = THREE.RepeatWrapping; texK.repeat.set(3, 3); texK.anisotropy = 8;
    add(new THREE.BoxGeometry(24, 0.5, 20), [M('#4a4744'), M('#4a4744'), M('#ffffff', { map: texK, roughness: 0.75 }), M('#4a4744'), M('#4a4744'), M('#4a4744')], 0, 0.25, 0);
    // stone veneer texture
    const sc = document.createElement('canvas'); sc.width = sc.height = 512; const sx = sc.getContext('2d');
    sx.fillStyle = '#6b6158'; sx.fillRect(0, 0, 512, 512);
    const st = ['#a89a88', '#968878', '#b5a794', '#8a7d6f', '#9f927f'];
    for (let y = 0; y < 512; y += 40) for (let x = -rk() * 60; x < 512; ) { const w = 50 + rk() * 70; sx.fillStyle = st[Math.floor(rk() * 5)]; sx.fillRect(x + 3, y + 3, w - 6, 34); x += w; }
    const stTex = new THREE.CanvasTexture(sc); stTex.colorSpace = THREE.SRGBColorSpace; stTex.wrapS = stTex.wrapT = THREE.RepeatWrapping;
    const veneer = (w, d) => { const t1 = stTex.clone(); t1.needsUpdate = true; t1.repeat.set(w / 4, 0.9); const t2 = stTex.clone(); t2.needsUpdate = true; t2.repeat.set(d / 4, 0.9); const a = M('#ffffff', { map: t2 }), b = M('#ffffff', { map: t1 }), c = M('#6b6158'); return [a, a, c, c, b, b]; };
    const counterTop = M('#2f2f33', { roughness: 0.35 });
    // L counter: long run along back, return on right
    add(new THREE.BoxGeometry(14, 3, 2.6), veneer(14, 2.6), -1, 2, -6);
    add(new THREE.BoxGeometry(14.6, 0.25, 3.1), counterTop, -1, 3.62, -6);
    add(new THREE.BoxGeometry(2.6, 3, 8), veneer(2.6, 8), 7.3, 2, -0.7);
    add(new THREE.BoxGeometry(3.1, 0.25, 8.6), counterTop, 7.3, 3.62, -0.7);
    // raised bar on return
    add(new THREE.BoxGeometry(0.6, 1.2, 8.6), veneer(0.6, 8.6), 8.4, 4.3, -0.7);
    add(new THREE.BoxGeometry(1.8, 0.2, 9), counterTop, 8.9, 4.98, -0.7);
    // grill
    const steel = M('#c9ccd0', { metalness: 0.85, roughness: 0.3 });
    add(new THREE.BoxGeometry(4, 0.3, 2.2), steel, -3, 3.85, -6);
    const hood = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 4, 24, 1, false, 0, Math.PI), steel);
    hood.rotation.z = Math.PI / 2; hood.rotation.y = Math.PI / 2; hood.rotation.x = Math.PI / 2; hood.position.set(-3, 4, -6.4); hood.rotation.set(-0.5, 0, Math.PI / 2); hood.castShadow = true; scene.add(hood);
    add(new THREE.BoxGeometry(3.6, 1.6, 0.1), steel, -3, 2.2, -4.68);
    add(new THREE.BoxGeometry(2, 1.2, 0.1), steel, 2.5, 2.3, -4.68);
    // sink
    add(new THREE.BoxGeometry(1.6, 0.05, 1.4), M('#8e9296', { metalness: 0.8, roughness: 0.25 }), 7.3, 3.76, 1.2, false);
    const fau = add(new THREE.CylinderGeometry(0.07, 0.07, 1, 8), steel, 7.3, 4.2, 0.1);
    // stools
    for (const z of [-3.5, -0.7, 2.1]) { add(new THREE.CylinderGeometry(0.6, 0.6, 0.18, 20), M('#7b5a3a'), 10.8, 3.2, z); add(new THREE.CylinderGeometry(0.1, 0.18, 3.1, 8), M('#2b2b2b'), 10.8, 1.65, z); }
    // pergola
    const wood = M('#8b6a48', { roughness: 0.9 });
    for (const [x, z] of [[-9, -8.5], [10, -8.5], [-9, 6], [10, 6]]) add(new THREE.BoxGeometry(0.6, 10, 0.6), wood, x, 5.5, z);
    for (const z of [-8.5, 6]) add(new THREE.BoxGeometry(21, 0.8, 0.4), wood, 0.5, 10.4, z);
    for (let x = -9; x <= 10; x += 1.6) add(new THREE.BoxGeometry(0.25, 0.6, 16.4), wood, x, 11, -1.25);
    // dining table
    add(new THREE.BoxGeometry(5, 0.2, 3), M('#8b6a48'), -3, 2.6, 2.5);
    for (const [dx, dz] of [[-2.2, -1.2], [2.2, -1.2], [-2.2, 1.2], [2.2, 1.2]]) add(new THREE.BoxGeometry(0.2, 2.1, 0.2), M('#2b2b2b'), -3 + dx, 1.55, 2.5 + dz);
    // planting
    const shrubK = M('#4f6b3a'), pineK = M('#3b5233');
    for (const [x, z, s] of [[-13, -9, 1.8], [-14, -4, 1.4], [13, -10, 1.6], [-11, 9, 1.3]]) add(new THREE.IcosahedronGeometry(s, 1), shrubK, x, s * 0.8, z);
    for (const [x, z, h] of [[-22, -20, 18], [-28, -12, 22], [16, -24, 20], [26, -14, 16]]) add(new THREE.ConeGeometry(h * 0.22, h, 10), pineK, x, h / 2, z);
    } else {
    // ground: lawn behind, mulch in front
    const lawn = add(new THREE.PlaneGeometry(160, 160), M('#8fa36a'), 0, 0, 0, false); lawn.rotation.x = -Math.PI / 2;
    const mulch = add(new THREE.CircleGeometry(30, 64, 0, Math.PI), M('#4a4540'), 0, 0.02, 8, false); mulch.rotation.x = -Math.PI / 2; mulch.rotation.z = Math.PI;

    // paver texture
    const tc = document.createElement('canvas'); tc.width = tc.height = 1024; const t = tc.getContext('2d');
    t.fillStyle = '#6f675e'; t.fillRect(0, 0, 1024, 1024);
    const tones = ['#b39a82', '#a58c75', '#9c8f84', '#b8a693', '#8f8174', '#ab9480', '#a39a90'];
    let s = 7; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let y = 0; y < 1024; y += 64) for (let x = (y / 64) % 2 ? -48 : 0; x < 1024; ) {
      const w = [64, 96, 128][Math.floor(rnd() * 3)];
      t.fillStyle = tones[Math.floor(rnd() * tones.length)]; t.fillRect(x + 3, y + 3, w - 6, 58); x += w;
    }
    const tex = new THREE.CanvasTexture(tc); tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(0.09, 0.09); tex.anisotropy = 8;

    // patio outline (feet): back edge against house, chamfer front-left, gentle curve front
    const sh = new THREE.Shape();
    sh.moveTo(-14, 10); sh.lineTo(-14, -2); sh.lineTo(-10, -6.5); sh.quadraticCurveTo(0, -9.5, 14, -6); sh.lineTo(14, 10); sh.lineTo(-14, 10);
    const H = 1.1;
    const slab = new THREE.ExtrudeGeometry(sh, { depth: H, bevelEnabled: false, curveSegments: 40 });
    slab.rotateX(-Math.PI / 2);
    const slabM = [M('#8a7a68'), M('#7b5a3a')];
    const slabMesh = add(slab, M('#7b5a3a'), 0, 0, 0);
    const top = new THREE.ShapeGeometry(sh, 40); top.rotateX(-Math.PI / 2);
    const uv = top.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i), uv.getY(i));
    add(top, M('#ffffff', { map: tex, roughness: 0.7 }), 0, H + 0.01, 0, false);

    // timber edge cap along front
    const edgePts = new THREE.CurvePath();
    edgePts.add(new THREE.LineCurve3(new THREE.Vector3(-14, 0, -2), new THREE.Vector3(-10, 0, -6.5)));
    edgePts.add(new THREE.QuadraticBezierCurve3(new THREE.Vector3(-10, 0, -6.5), new THREE.Vector3(0, 0, -9.5), new THREE.Vector3(14, 0, -6)));
    const pts = edgePts.getSpacedPoints(80);
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], len = a.distanceTo(b);
      const g = new THREE.BoxGeometry(len + 0.05, H + 0.15, 0.7);
      const m = add(g, M('#8b5e34', { roughness: 0.9 }), (a.x + b.x) / 2, (H + 0.15) / 2, -(a.z + b.z) / 2);
      m.rotation.y = Math.atan2(-(b.z - a.z), b.x - a.x) * -1;
    }

    // fire pit: stacked stone courses
    const fc = document.createElement('canvas'); fc.width = 1024; fc.height = 192; const fx = fc.getContext('2d');
    fx.fillStyle = '#4e4b47'; fx.fillRect(0, 0, 1024, 192);
    const ft = ['#9a9a96', '#8a8986', '#a7a5a0', '#7f7e7a', '#93918c'];
    let fs = 11; const fr = () => (fs = (fs * 9301 + 49297) % 233280) / 233280;
    for (let row = 0; row < 3; row++) for (let x = row % 2 ? -21 : 0; x < 1024; x += 42.67) { fx.fillStyle = ft[Math.floor(fr() * 5)]; fx.fillRect(x + 2, row * 64 + 2, 38.67, 60); fx.fillStyle = 'rgba(255,255,255,0.06)'; fx.fillRect(x + 2, row * 64 + 2, 38.67, 6); }
    const fTex = new THREE.CanvasTexture(fc); fTex.colorSpace = THREE.SRGBColorSpace; fTex.anisotropy = 8;
    const pitX = -7, pitZ = -4.5, pitH = 1.8;
    const stoneM = M('#ffffff', { map: fTex, roughness: 0.95 });
    add(new THREE.CylinderGeometry(3.2, 3.2, pitH, 48, 1, true), stoneM, pitX, H + pitH / 2, pitZ);
    const inner = add(new THREE.CylinderGeometry(2.1, 2.1, pitH, 48, 1, true), M('#5a5752', { side: THREE.BackSide, roughness: 1 }), pitX, H + pitH / 2, pitZ);
    const cap = add(new THREE.RingGeometry(1.95, 3.4, 48), M('#a3a19c', { roughness: 0.9, side: THREE.DoubleSide }), pitX, H + pitH + 0.3, pitZ); cap.rotation.x = -Math.PI / 2;
    add(new THREE.CylinderGeometry(3.4, 3.4, 0.3, 48, 1, true), M('#a3a19c', { roughness: 0.9 }), pitX, H + pitH + 0.15, pitZ);
    add(new THREE.CylinderGeometry(1.95, 1.95, 0.3, 48, 1, true), M('#8d8b86', { side: THREE.BackSide }), pitX, H + pitH + 0.15, pitZ);
    add(new THREE.CylinderGeometry(2.1, 2.1, 0.3, 32), M('#2c2a28'), pitX, H + 0.2, pitZ, false);

    // house
    const wallM = M('#8f8a80');
    add(new THREE.BoxGeometry(40, 16, 1), wallM, -1, 8, -10.6);
    add(new THREE.BoxGeometry(40.6, 0.4, 1.4), M('#efece4'), -1, 16, -10.4);
    add(new THREE.BoxGeometry(40, 2, 1.1), M('#9a978f'), -1, 1, -10.5);
    for (const x of [-10, -3]) { add(new THREE.BoxGeometry(4.2, 5.4, 0.3), M('#f2f0ea'), x, 10.5, -10); add(new THREE.BoxGeometry(3.4, 4.6, 0.32), M('#5d6b74', { roughness: 0.2, metalness: 0.2 }), x, 10.5, -9.98); }
    add(new THREE.BoxGeometry(4, 7.9, 0.3), M('#f2f0ea'), 13, 5.7 + 3.95, -10);
    add(new THREE.BoxGeometry(3.2, 7.3, 0.32), M('#5d6b74', { roughness: 0.2, metalness: 0.2 }), 13, 5.7 + 3.75, -9.98);
    add(new THREE.BoxGeometry(3.2, 0.25, 0.36), M('#f2f0ea'), 13, 5.7 + 4.2, -9.96);

    // deck + steps
    const wd = M('#6a4430'), trim = M('#efece4'), deckTop = 5.7, dF = -3.1, dB = -10.1, dL = 8.5, dR = 17.5;
    add(new THREE.BoxGeometry(dR - dL, 0.6, dF - dB), M('#7a5235'), (dL + dR) / 2, deckTop - 0.3, (dF + dB) / 2);
    add(new THREE.BoxGeometry(dR - dL - 0.2, deckTop - 0.6, dF - dB - 0.2), trim, (dL + dR) / 2, (deckTop - 0.6) / 2, (dF + dB) / 2);
    const rail = (x1, z1, x2, z2, posts = true) => {
      const len = Math.hypot(x2 - x1, z2 - z1), ang = Math.atan2(x2 - x1, z2 - z1), cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
      const top = add(new THREE.BoxGeometry(0.35, 0.25, len + 0.35), wd, cx, deckTop + 3.2, cz); top.rotation.y = ang;
      const bot = add(new THREE.BoxGeometry(0.2, 0.2, len), wd, cx, deckTop + 0.4, cz); bot.rotation.y = ang;
      const n = Math.max(2, Math.round(len / 0.55));
      for (let k = 1; k < n; k++) add(new THREE.BoxGeometry(0.12, 2.8, 0.12), wd, x1 + (x2 - x1) * k / n, deckTop + 1.8, z1 + (z2 - z1) * k / n);
      if (posts) for (const [x, z] of [[x1, z1], [x2, z2]]) add(new THREE.BoxGeometry(0.45, 3.6, 0.45), wd, x, deckTop + 1.7, z);
    };
    const sL = 10, sR = 15, sW = sR - sL, sC = (sL + sR) / 2;
    rail(dL + 0.2, dF + 0.2, sL, dF + 0.2);
    rail(sR, dF + 0.2, dR - 0.2, dF + 0.2);
    rail(dR - 0.2, dF + 0.2, dR - 0.2, dB + 0.6);
    rail(dL + 0.2, dF + 0.2, dL + 0.2, dB + 0.6);
    for (const x of [dL + 0.2, dR - 0.2]) add(new THREE.BoxGeometry(0.45, deckTop, 0.45), wd, x, deckTop / 2, dF + 0.2);
    const rise = (deckTop - H) / 5, run = 1.15;
    for (let i = 0; i < 4; i++) {
      const top = H + (i + 1) * rise, z = dF + run / 2 + (3 - i) * run, h = top - H;
      add(new THREE.BoxGeometry(sW, h, run), trim, sC, H + h / 2, z);
      add(new THREE.BoxGeometry(sW + 0.2, 0.2, run + 0.15), M('#7a5235'), sC, top + 0.1, z + 0.05);
    }
    const zBot = dF + 4 * run - 0.3, yBot = H + rise + 3.2, zTop = dF + 0.2, yTop = deckTop + 3.2;
    const railLen = Math.hypot(zBot - zTop, yTop - yBot), sAng = Math.atan2(yTop - yBot, zBot - zTop);
    for (const x of [sL, sR]) {
      add(new THREE.BoxGeometry(0.45, yBot - H - rise + 0.3, 0.45), wd, x, H + rise + (yBot - H - rise + 0.3) / 2, zBot);
      const r1 = add(new THREE.BoxGeometry(0.35, 0.25, railLen + 0.4), wd, x, (yBot + yTop) / 2, (zBot + zTop) / 2); r1.rotation.x = sAng;
      for (let k = 1; k < 6; k++) { const tz = zTop + (zBot - zTop) * k / 6, ty = yTop + (yBot - yTop) * k / 6, step = Math.min(3, Math.floor((tz - dF) / run)), base = H + (4 - step) * rise + 0.2; add(new THREE.BoxGeometry(0.12, ty - base, 0.12), wd, x, (ty + base) / 2, tz); }
    }

    // shrubs and pines behind
    const shrubM = M('#4f6b3a'), pineM = M('#3b5233');
    for (const [x, z, s] of [[-20, -8, 2], [-18, -2, 1.6], [-22, 3, 1.4], [-12, -13, 1.3], [-16, -12, 1.6]]) add(new THREE.IcosahedronGeometry(s, 1), shrubM, x, s * 0.8, z);
    for (const [x, z, h] of [[-24, -18, 18], [-30, -12, 22], [-20, -24, 16], [20, -22, 20]]) add(new THREE.ConeGeometry(h * 0.22, h, 10), pineM, x, h / 2, z);

    }
    const fit = () => { const w = this.clientWidth || 1, h = this.clientHeight || 1; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    this._ro = new ResizeObserver(fit); this._ro.observe(this); fit();
    const loop = () => {
      if (this._dead) return;
      const az = ctr.getAzimuthalAngle();
      if (az >= ctr.maxAzimuthAngle - 0.01) dir = -1; else if (az <= ctr.minAzimuthAngle + 0.01) dir = 1;
      ctr.autoRotateSpeed = 0.5 * dir;
      ctr.update(); r.render(scene, cam); requestAnimationFrame(loop);
    };
    loop();
  }
}
customElements.define('patio-render', PatioRender);
