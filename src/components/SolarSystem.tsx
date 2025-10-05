import { useEffect, useRef } from 'react';

export default function SolarSystem() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (scriptLoadedRef.current) return;
    scriptLoadedRef.current = true;

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;
    script.onload = () => {
      initSolarSystem();
    };
    document.head.appendChild(script);

    return () => {
      const canvas = document.querySelector('#canvas');
      if (canvas) {
        canvas.innerHTML = '';
      }
    };
  }, []);

  const initSolarSystem = () => {
    // @ts-ignore
    const THREE = window.THREE;
    if (!THREE) return;

    var sc = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    var rend = new THREE.WebGLRenderer({ antialias: true });
    rend.setSize(window.innerWidth, window.innerHeight);
    const canvasEl = document.getElementById('canvas');
    if (canvasEl) {
      canvasEl.appendChild(rend.domElement);
    }
    cam.position.set(0, 500, 800);

    var grp = new THREE.Group();
    sc.add(grp);

    var paused = false, showOrb = true, mdown = false, mx = 0, my = 0;
    var objs:any[] = [], orbs:any[] = [], sel:any = null, zoomed = false;
    var ray = new THREE.Raycaster(), mou = new THREE.Vector2();
    var tpos = new THREE.Vector3(0, 500, 800), tlook = new THREE.Vector3(0, 0, 0), clook = new THREE.Vector3(0, 0, 0);

    var sg = new THREE.BufferGeometry(), sv = [];
    for (var i = 0; i < 3000; i++) sv.push((Math.random() - 0.5) * 4000, (Math.random() - 0.5) * 4000, (Math.random() - 0.5) * 4000);
    sg.setAttribute('position', new THREE.Float32BufferAttribute(sv, 3));
    sc.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 2 })));

    var data = [
        { n: 'Sun', d: 0, s: 40, c: 0xFDB813, sp: 0, star: 1, img: 'https://science.nasa.gov/wp-content/uploads/2023/09/sun-jpg.webp', i: { t: 'Star', r: '695700 km', day: '25 hours', o: 'Our star a yellow dwarf that powers the Solar System', atm: 'Plasma H2 73 percent He 25 percent', f: ['99 percent of Solar System mass', 'Surface temp 5500 C', 'Core temp 15 million C', 'Light takes 8 min to Earth'] }, m: [] },
        { n: 'Mercury', d: 80, s: 6, c: 0x8C7853, sp: 0.04, img: 'https://science.nasa.gov/wp-content/uploads/2023/06/mercury-messenger-globe-pia15162-full.jpg', i: { t: 'Terrestrial', r: '2439 km', day: '59 Earth days', orb: '88 days', o: 'Smallest planet closest to Sun with extreme temperatures', atm: 'Extremely thin O2 Na H He', f: ['No moons or rings', 'Temp -173 C to 427 C', 'Fastest orbiting planet', 'Heavily cratered'] }, m: [] },
        { n: 'Venus', d: 120, s: 10, c: 0xFFC649, sp: 0.015, img: 'https://science.nasa.gov/wp-content/uploads/2023/06/venus-mariner-10-pia23791-fig2-16.jpg', i: { t: 'Terrestrial', r: '6051 km', day: '243 Earth days', orb: '225 days', o: 'Hottest planet with thick atmosphere rotates backwards', atm: 'CO2 96 percent N2 4 percent', f: ['Brightest planet', 'Surface temp 465 C', 'Pressure 92x Earth', 'Rotates clockwise'] }, m: [] },
        { n: 'Earth', d: 160, s: 10, c: 0x4A90E2, sp: 0.01, img: 'https://science.nasa.gov/wp-content/uploads/2023/09/blue-marble-apollo-17-pia00122-jpg.webp', i: { t: 'Terrestrial', r: '6371 km', day: '24 hours', orb: '365 days', o: 'Our home planet with liquid water and life', atm: 'N2 78 percent O2 21 percent Ar 1 percent', f: ['71 percent water', 'Plate tectonics', 'Magnetic field', '1 moon'] }, m: [{ n: 'Moon', d: 20, s: 3.5, c: 0xcccccc, sp: 0.05 }] },
        { n: 'Mars', d: 200, s: 8, c: 0xE27B58, sp: 0.008, img: 'https://science.nasa.gov/wp-content/uploads/2023/09/mars-full-globe-jpg.webp', i: { t: 'Terrestrial', r: '3389 km', day: '24 hours', orb: '687 days', o: 'Red Planet with ice caps and tallest volcano', atm: 'CO2 95 percent N2 3 percent Ar 2 percent', f: ['Olympus Mons tallest volcano', 'Has seasons', 'Two moons', 'Ancient water'] }, m: [{ n: 'Phobos', d: 15, s: 1.2, c: 0x888888, sp: 0.08 }, { n: 'Deimos', d: 20, s: 0.8, c: 0x999999, sp: 0.05 }]},
        { n: 'Jupiter', d: 300, s: 30, c: 0xC88B3A, sp: 0.002, img: 'https://science.nasa.gov/wp-content/uploads/2023/09/jupiter-marble-pia22946-16.jpg', i: { t: 'Gas Giant', r: '69911 km', day: '10 hours', orb: '12 years', o: 'Largest planet with Great Red Spot and 95 moons', atm: 'H2 90 percent He 10 percent', f: ['Mass 2.5x all planets', 'Great Red Spot storm', 'Strongest magnetic field', 'Faint rings'] }, m: [{ n: 'Io', d: 45, s: 3.8, c: 0xffcc00, sp: 0.06 }, { n: 'Europa', d: 55, s: 3.2, c: 0xdddddd, sp: 0.04 }, { n: 'Ganymede', d: 65, s: 5.5, c: 0x999999, sp: 0.03 }, { n: 'Callisto', d: 75, s: 5, c: 0x777777, sp: 0.02 }]},
        { n: 'Saturn', d: 400, s: 26, c: 0xFAD5A5, sp: 0.001, img: 'https://science.nasa.gov/wp-content/uploads/2023/09/saturn-farewell-pia21345.jpg', i: { t: 'Gas Giant', r: '58232 km', day: '11 hours', orb: '29 years', o: 'Famous ring system with 146 moons', atm: 'H2 96 percent He 3 percent', f: ['Least dense planet', 'Rings span 282000 km', 'Titan has atmosphere', '7 ring groups'] }, ring: 1, m: [{ n: 'Titan', d: 65, s: 5.5, c: 0xffaa44, sp: 0.03 }]},
        { n: 'Uranus', d: 500, s: 18, c: 0x4FD0E7, sp: 0.0007, img: 'https://science.nasa.gov/wp-content/uploads/2023/11/uranus-pia18182-jpg.webp', i: { t: 'Ice Giant', r: '25362 km', day: '17 hours', orb: '84 years', o: 'Tilted on side with blue green color', atm: 'H2 83 percent He 15 percent CH4 2 percent', f: ['Rotates on side 98 deg', 'Coldest atmosphere -224 C', '13 rings', '27 moons'] }, m: [{ n: 'Titania', d: 45, s: 4, c: 0x88ccdd, sp: 0.04 }]},
        { n: 'Neptune', d: 580, s: 18, c: 0x4166F5, sp: 0.0005, img: 'https://science.nasa.gov/wp-content/uploads/2023/11/neptune-full-disk-pia01492.jpg', i: { t: 'Ice Giant', r: '24622 km', day: '16 hours', orb: '165 years', o: 'Farthest planet with strongest winds', atm: 'H2 80 percent He 19 percent CH4 1 percent', f: ['Winds 2100 km per hour', 'Great Dark Spot', 'Found by math', '14 moons'] }, m: [{ n: 'Triton', d: 40, s: 4.5, c: 0xaaccff, sp: 0.045 }]}
    ];

    for (var p = 0; p < data.length; p++) {
        var pd = data[p];
        var geo = new THREE.SphereGeometry(pd.s, 64, 64);
        var mat = pd.star ? new THREE.MeshBasicMaterial({ color: pd.c }) : new THREE.MeshPhongMaterial({ color: pd.c, shininess: 30, specular: 0x333333 });
        var pl = new THREE.Mesh(geo, mat);
        if (pd.star) pl.add(new THREE.Mesh(new THREE.SphereGeometry(pd.s * 1.2, 32, 32), new THREE.MeshBasicMaterial({ color: pd.c, transparent: true, opacity: 0.3 })));
        var isGasGiant = (pd.i.t === 'Gas Giant' || pd.i.t === 'Ice Giant');
        if (!pd.star && isGasGiant) {
            var atmGeo = new THREE.SphereGeometry(pd.s * 1.1, 32, 32);
            var atmMat = new THREE.MeshBasicMaterial({ color: pd.c, transparent: true, opacity: 0.15, side: THREE.BackSide });
            var atmMesh = new THREE.Mesh(atmGeo, atmMat);
            pl.add(atmMesh);
        }
        var obj:any = { mesh: pl, d: pd.d, sp: pd.sp, ang: Math.random() * Math.PI * 2, n: pd.n, i: pd.i, moons: [], ring: pd.ring, s: pd.s, img: pd.img };
        for (var mm = 0; mm < pd.m.length; mm++) {
            var md = pd.m[mm];
            var msh = new THREE.Mesh(new THREE.SphereGeometry(md.s, 32, 32), new THREE.MeshPhongMaterial({ color: md.c }));
            obj.moons.push({ mesh: msh, d: md.d, sp: md.sp, ang: Math.random() * Math.PI * 2 });
            grp.add(msh);
        }
        if (pd.ring) {
            var rg = new THREE.Mesh(new THREE.RingGeometry(pd.s * 1.5, pd.s * 2.2, 64), new THREE.MeshBasicMaterial({ color: 0xFAD5A5, side: THREE.DoubleSide, transparent: true, opacity: 0.7 }));
            rg.rotation.x = Math.PI / 2;
            pl.add(rg);
        }
        objs.push(obj);
        grp.add(pl);
        if (pd.d > 0) {
            var opts = [];
            for (var ii = 0; ii <= 64; ii++) { var an = (ii / 64) * Math.PI * 2; opts.push(Math.cos(an) * pd.d, 0, Math.sin(an) * pd.d); }
            var og = new THREE.BufferGeometry();
            og.setAttribute('position', new THREE.Float32BufferAttribute(opts, 3));
            var orb = new THREE.Line(og, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 }));
            orbs.push(orb);
            grp.add(orb);
        }
    }

    sc.add(new THREE.AmbientLight(0x333333));
    sc.add(new THREE.PointLight(0xffffff, 2, 2000));

    function anim() {
        requestAnimationFrame(anim);
        if (!paused) {
            for (var i = 0; i < objs.length; i++) {
                var o = objs[i];
                o.ang += o.sp;
                o.mesh.position.x = Math.cos(o.ang) * o.d;
                o.mesh.position.z = Math.sin(o.ang) * o.d;
                o.mesh.rotation.y += 0.01;
                for (var j = 0; j < o.moons.length; j++) {
                    var mn = o.moons[j];
                    mn.ang += mn.sp;
                    mn.mesh.position.x = o.mesh.position.x + Math.cos(mn.ang) * mn.d;
                    mn.mesh.position.z = o.mesh.position.z + Math.sin(mn.ang) * mn.d;
                }
            }
        }
        if (zoomed && sel) {
            var wp = new THREE.Vector3();
            sel.mesh.getWorldPosition(wp);
            var off = sel.s * 3.5;
            tpos.set(wp.x + off, wp.y + off * 0.5, wp.z + off);
            tlook.copy(wp);
            cam.position.lerp(tpos, 0.05);
            clook.lerp(tlook, 0.05);
            cam.lookAt(clook);
        } else {
            cam.lookAt(0, 0, 0);
        }
        rend.render(sc, cam);
    }
    anim();

    function zoom(obj:any) {
        zoomed = true;
        sel = obj;
        const hdr = document.getElementById('hdr');
        const ctrl = document.getElementById('ctrl');
        const back = document.getElementById('back');
        if (hdr) hdr.classList.add('hidden');
        if (ctrl) ctrl.classList.add('hidden');
        if (back) back.classList.add('visible');
        var cd = document.createElement('div');
        cd.className = 'card';
        var h = '<button class="close" onclick="window.resetV()">×</button>';
        h += '<img src="' + obj.img + '" class="card-img" onerror="this.style.display=\'none\'">';
        h += '<div class="card-content"><h2>' + obj.n + '</h2>';
        h += '<div class="section">Overview</div><p class="subtitle">' + obj.i.o + '</p>';
        h += '<div class="section">Physical</div><ul class="info-list">';
        h += '<li><span class="info-label">Type</span><span class="info-value">' + obj.i.t + '</span></li>';
        h += '<li><span class="info-label">Radius</span><span class="info-value">' + obj.i.r + '</span></li>';
        h += '<li><span class="info-label">Day Length</span><span class="info-value">' + obj.i.day + '</span></li></ul>';
        if (obj.i.orb) h += '<div class="section">Orbit</div><ul class="info-list"><li><span class="info-label">Orbital Period</span><span class="info-value">' + obj.i.orb + '</span></li></ul>';
        h += '<div class="section">Atmosphere</div><p class="subtitle">' + obj.i.atm + '</p>';
        h += '<div class="section">Fun Facts</div><ul class="info-list facts">';
        for (var i = 0; i < obj.i.f.length; i++) h += '<li>' + obj.i.f[i] + '</li>';
        h += '</ul></div>';
        cd.innerHTML = h;
        document.body.appendChild(cd);
    }

    function resetV() {
        zoomed = false;
        sel = null;
        cam.position.set(0, 500, 800);
        const hdr = document.getElementById('hdr');
        const ctrl = document.getElementById('ctrl');
        const back = document.getElementById('back');
        if (hdr) hdr.classList.remove('hidden');
        if (ctrl) ctrl.classList.remove('hidden');
        if (back) back.classList.remove('visible');
        var cd = document.querySelector('.card');
        if (cd) cd.remove();
    }

    // @ts-ignore
    window.resetV = resetV;

    const playBtn = document.getElementById('play');
    const orbBtn = document.getElementById('orb');
    const rstBtn = document.getElementById('rst');
    const backBtn = document.getElementById('back');

    if (playBtn) playBtn.onclick = function() { paused = !paused; this.textContent = paused ? 'Play' : 'Pause'; };
    if (orbBtn) orbBtn.onclick = function() { showOrb = !showOrb; for (var i = 0; i < orbs.length; i++) orbs[i].visible = showOrb; this.classList.toggle('active'); };
    if (rstBtn) rstBtn.onclick = function() { grp.rotation.x = 0; grp.rotation.y = 0; resetV(); };
    if (backBtn) backBtn.onclick = resetV;

    if (rend.domElement) {
      rend.domElement.onmousedown = function(e) { mdown = true; mx = e.clientX; my = e.clientY; };
      rend.domElement.onmousemove = function(e) {
          if (mdown && !zoomed) {
              grp.rotation.y += (e.clientX - mx) * 0.005;
              grp.rotation.x += (e.clientY - my) * 0.005;
              mx = e.clientX; my = e.clientY;
          }
      };
      rend.domElement.onmouseup = function() { mdown = false; };
      rend.domElement.onwheel = function(e) { if (!zoomed) { e.preventDefault(); cam.position.multiplyScalar(e.deltaY > 0 ? 1.1 : 0.9); } };
      rend.domElement.onclick = function(e) {
          var dx = Math.abs(e.clientX - mx), dy = Math.abs(e.clientY - my);
          if (dx > 5 || dy > 5) return;
          mou.x = (e.clientX / window.innerWidth) * 2 - 1;
          mou.y = -(e.clientY / window.innerHeight) * 2 + 1;
          ray.setFromCamera(mou, cam);
          var ms = [];
          for (var i = 0; i < objs.length; i++) ms.push(objs[i].mesh);
          var hits = ray.intersectObjects(ms);
          if (hits.length > 0) {
              for (var i = 0; i < objs.length; i++) {
                  if (objs[i].mesh === hits[0].object) { zoom(objs[i]); break; }
              }
          }
      };
    }

    window.onresize = function() { cam.aspect = window.innerWidth / window.innerHeight; cam.updateProjectionMatrix(); rend.setSize(window.innerWidth, window.innerHeight); };
  };

  return (
    <div ref={containerRef}>
      <div className="header" id="hdr">
        <h1>3D Solar System</h1>
        <p>Drag to rotate • Click planets • Scroll to zoom</p>
      </div>
      <button className="back" id="back">Back</button>
      <div id="canvas"></div>
      <div className="controls" id="ctrl">
        <button className="control-btn" id="play">Pause</button>
        <button className="control-btn active" id="orb">Orbits</button>
        <button className="control-btn" id="rst">Reset</button>
      </div>
    </div>
  );
}
