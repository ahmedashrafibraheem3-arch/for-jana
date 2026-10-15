import * as THREE from 'three';

/* =========================================================
   ⚙️  CONFIG
   ========================================================= */
const CONFIG = {
  herName : 'Jana',
  herFull : 'Hossam',

  letter : [
    'From the very first day I saw you…',
    'The whole world felt a little brighter.',
    'Your laugh became the sweetest sound in my day,',
    'And you became the most beautiful part of it.',
    "I can't find the right words…",
    'So I built this with my heart before my hands.',
    'Every line written with longing, every color picked just for you.',
  ],

  question : 'Will you keep going with me?',

  noTexts : [
    'No',
    'Are you sure? 🥺',
    'Think again',
    'The button is running 😂',
    "You can't catch it 😌",
    'Just say yes 🙈',
  ],

  whatsapp : 'https://wa.me/93708719417',

  photos : [
    'photo1.jpg','photo2.jpg','photo3.jpg','photo4.jpg',
    'photo5.jpg','photo6.jpg','photo7.jpg','photo8.jpg',
  ],
};

/* =========================================================
   🔥 FIREBASE — حط الـ config بتاعك هنا
   =========================================================
   لما تجيب الـ config من Firebase Console،
   استبدل القيم اللي تحت بالقيم بتاعتك.
   ========================================================= */
const firebaseConfig = {
  apiKey: "PUT_YOUR_API_KEY_HERE",
  authDomain: "PUT_YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://PUT_YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "PUT_YOUR_PROJECT",
  storageBucket: "PUT_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PUT_YOUR_SENDER_ID",
  appId: "PUT_YOUR_APP_ID"
};

/* تهيئة Firebase لو الـ config اتملى */
let db = null;
try {
  if (firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('PUT_')) {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
  }
} catch (e) {
  console.warn('Firebase not initialized:', e);
}

/* =========================================================
   THREE.JS
   ========================================================= */
const canvas   = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 9);

scene.add(new THREE.AmbientLight(0xffb3d1, 0.55));
const keyLight = new THREE.PointLight(0xff4d88, 3.5, 40);
keyLight.position.set(6, 6, 8); scene.add(keyLight);
const fillLight = new THREE.PointLight(0x8b5cf6, 2.6, 40);
fillLight.position.set(-6, -4, 6); scene.add(fillLight);
const rimLight = new THREE.PointLight(0xffffff, 2.2, 40);
rimLight.position.set(0, 2, -8); scene.add(rimLight);

function makeHeartShape(){
  const s = new THREE.Shape();
  const x = 0, y = 0;
  s.moveTo(x+5, y+5);
  s.bezierCurveTo(x+5, y+5, x+4, y, x, y);
  s.bezierCurveTo(x-6, y, x-6, y+7, x-6, y+7);
  s.bezierCurveTo(x-6, y+11, x-3, y+15.4, x+5, y+19);
  s.bezierCurveTo(x+12, y+15.4, x+16, y+11, x+16, y+7);
  s.bezierCurveTo(x+16, y+7, x+16, y, x+10, y);
  s.bezierCurveTo(x+7, y, x+5, y+5, x+5, y+5);
  return s;
}
const heartShape = makeHeartShape();

function makePhotoHeart(photoUrl, scale = 0.14){
  const geo = new THREE.ShapeGeometry(heartShape, 32);
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  const size = new THREE.Vector3(); bb.getSize(size);
  const uv  = geo.attributes.uv;
  const pos = geo.attributes.position;
  for (let i = 0; i < uv.count; i++){
    const px = pos.getX(i), py = pos.getY(i);
    uv.setXY(i,
      (px - bb.min.x) / size.x,
      (py - bb.min.y) / size.y);
  }
  uv.needsUpdate = true;
  geo.center(); geo.scale(scale, scale, scale);

  const tex = new THREE.TextureLoader().load(photoUrl);
  tex.colorSpace = THREE.SRGBColorSpace;

  const mat = new THREE.MeshBasicMaterial({
    map: tex, side: THREE.DoubleSide, toneMapped: false,
  });
  return new THREE.Mesh(geo, mat);
}

const heartGroup = new THREE.Group();
scene.add(heartGroup);

const photoHeart = makePhotoHeart(CONFIG.photos[0], 0.14);
photoHeart.position.z = 0.30;
heartGroup.add(photoHeart);

const extrudeGeo = new THREE.ExtrudeGeometry(heartShape, {
  depth: 0.6, bevelEnabled: true,
  bevelSegments: 3, bevelSize: 0.35, bevelThickness: 0.35,
  curveSegments: 32,
});
extrudeGeo.center();
extrudeGeo.scale(0.15, 0.15, 0.15);

const frameMat = new THREE.MeshPhysicalMaterial({
  color: 0xff2d6f, emissive: 0xff2d6f, emissiveIntensity: 0.55,
  metalness: 0.55, roughness: 0.15,
  clearcoat: 1, clearcoatRoughness: 0.08,
  transparent: true, opacity: 0.85,
});
const frameHeart = new THREE.Mesh(extrudeGeo, frameMat);
frameHeart.position.z = -0.05;
frameHeart.scale.set(1.10, 1.10, 1.10);
heartGroup.add(frameHeart);

const heartLight = new THREE.PointLight(0xff4d88, 5, 12);
heartGroup.add(heartLight);

/* نجوم */
const starGeo = new THREE.BufferGeometry();
const STAR_COUNT = 900;
const starPos = new Float32Array(STAR_COUNT * 3);
const starCol = new Float32Array(STAR_COUNT * 3);
const C1 = new THREE.Color(0xffb3d1);
const C2 = new THREE.Color(0xffffff);
const C3 = new THREE.Color(0x8b5cf6);
for (let i = 0; i < STAR_COUNT; i++){
  starPos[i*3]     = (Math.random() - 0.5) * 160;
  starPos[i*3+1]   = (Math.random() - 0.5) * 160;
  starPos[i*3+2]   = (Math.random() - 0.5) * 160;
  const c = Math.random() < 0.5 ? C1 : (Math.random() < 0.5 ? C2 : C3);
  starCol[i*3] = c.r; starCol[i*3+1] = c.g; starCol[i*3+2] = c.b;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
starGeo.setAttribute('color',    new THREE.BufferAttribute(starCol, 3));

const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
  size: 0.22, vertexColors: true, transparent: true, opacity: 0.9,
  sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
}));
scene.add(stars);

/* القمر */
const moonPos = new THREE.Vector3(-10, 6, -22);
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(2.4, 48, 48),
  new THREE.MeshBasicMaterial({ color: 0xffe8f0 })
);
moon.position.copy(moonPos);
scene.add(moon);

const glowCanvas = document.createElement('canvas');
glowCanvas.width = glowCanvas.height = 256;
const gctx = glowCanvas.getContext('2d');
const ggrad = gctx.createRadialGradient(128,128,0,128,128,128);
ggrad.addColorStop(0,   'rgba(255,230,240,1)');
ggrad.addColorStop(0.25,'rgba(255,180,210,0.7)');
ggrad.addColorStop(0.6, 'rgba(255,100,150,0.25)');
ggrad.addColorStop(1,   'rgba(255,100,150,0)');
gctx.fillStyle = ggrad;
gctx.fillRect(0,0,256,256);

const moonGlow = new THREE.Sprite(new THREE.SpriteMaterial({
  map: new THREE.CanvasTexture(glowCanvas),
  blending: THREE.AdditiveBlending,
  depthWrite: false, transparent: true,
}));
moonGlow.scale.set(20, 20, 1);
moonGlow.position.copy(moonPos);
scene.add(moonGlow);

/* بريق */
const GLITTER_COUNT = 220;
const gGeo = new THREE.BufferGeometry();
const gPos = new Float32Array(GLITTER_COUNT * 3);
const gPhase = new Float32Array(GLITTER_COUNT);
for (let i = 0; i < GLITTER_COUNT; i++){
  gPos[i*3]     = (Math.random() - 0.5) * 30;
  gPos[i*3+1]   = (Math.random() - 0.5) * 24;
  gPos[i*3+2]   = (Math.random() - 0.5) * 18;
  gPhase[i] = Math.random() * Math.PI * 2;
}
gGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3));

function makeSparkleTexture(){
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  const grad = x.createRadialGradient(32,32,0,32,32,32);
  grad.addColorStop(0,   'rgba(255,255,255,1)');
  grad.addColorStop(0.35,'rgba(255,220,235,0.6)');
  grad.addColorStop(1,   'rgba(255,150,200,0)');
  x.fillStyle = grad; x.fillRect(0,0,64,64);
  return new THREE.CanvasTexture(c);
}

const glitter = new THREE.Points(gGeo, new THREE.PointsMaterial({
  size: 0.55, map: makeSparkleTexture(),
  transparent: true, opacity: 0.9,
  blending: THREE.AdditiveBlending, depthWrite: false,
  color: 0xffd6e6, sizeAttenuation: true,
}));
scene.add(glitter);

/* انفجارات */
const expGeo = new THREE.ExtrudeGeometry(heartShape, {
  depth: 0.6, bevelEnabled: false, curveSegments: 12,
});
expGeo.center(); expGeo.scale(0.06, 0.06, 0.06);

const EXP_COLORS = [0xff4d88,0xff85b3,0xc026d3,0x8b5cf6,0xffd6e6,0xffffff];
const explosion = [];

function explode(x = 0, y = 0, count = 60, power = 1){
  for (let i = 0; i < count; i++){
    const mat = new THREE.MeshBasicMaterial({
      color: EXP_COLORS[(Math.random() * EXP_COLORS.length) | 0],
      transparent: true, opacity: 1, toneMapped: false,
    });
    const m = new THREE.Mesh(expGeo, mat);
    m.position.set(x, y, 0);
    scene.add(m);

    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const sp    = (0.10 + Math.random() * 0.22) * power;

    explosion.push({
      mesh: m,
      vx: Math.sin(phi)*Math.cos(theta)*sp,
      vy: Math.sin(phi)*Math.sin(theta)*sp + 0.02,
      vz: Math.cos(phi)*sp,
      life: 1,
      rotX: (Math.random()-0.5)*0.25,
      rotY: (Math.random()-0.5)*0.25,
    });
  }
}

const heartState = { y:0, scale:1, targetY:0, targetScale:1 };
function setHeartTarget(y, scale){ heartState.targetY = y; heartState.targetScale = scale; }

const clock = new THREE.Clock();
let shake = 0;

function animate(){
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  heartState.y     += (heartState.targetY     - heartState.y)     * 0.08;
  heartState.scale += (heartState.targetScale - heartState.scale) * 0.08;

  heartGroup.position.y = heartState.y + Math.sin(t * 1.3) * 0.10;
  heartGroup.position.x = Math.sin(t * 0.7) * 0.08;
  heartGroup.scale.setScalar(heartState.scale);

  heartGroup.rotation.y = Math.sin(t * 0.55) * 0.55;
  heartGroup.rotation.x = Math.sin(t * 0.4)  * 0.18;
  heartGroup.rotation.z = Math.sin(t * 0.3)  * 0.06;

  stars.rotation.y = t * 0.018;
  stars.rotation.x = t * 0.010;

  const gp = gGeo.attributes.position.array;
  for (let i = 0; i < GLITTER_COUNT; i++){
    gp[i*3+1] += Math.sin(t + gPhase[i]) * 0.001;
  }
  gGeo.attributes.position.needsUpdate = true;
  glitter.material.opacity = 0.65 + Math.sin(t * 2.0) * 0.25;

  moon.rotation.y = t * 0.15;
  moonGlow.material.opacity = 0.85 + Math.sin(t * 1.2) * 0.15;

  for (let i = explosion.length - 1; i >= 0; i--){
    const e = explosion[i];
    e.mesh.position.x += e.vx;
    e.mesh.position.y += e.vy;
    e.mesh.position.z += e.vz;
    e.vy -= 0.003;
    e.mesh.rotation.x += e.rotX;
    e.mesh.rotation.y += e.rotY;
    e.life -= 0.009;
    e.mesh.material.opacity = Math.max(0, e.life);
    e.mesh.scale.setScalar(0.6 + e.life * 0.6);
    if (e.life <= 0){
      scene.remove(e.mesh);
      e.mesh.material.dispose();
      explosion.splice(i, 1);
    }
  }

  if (shake > 0.001){
    camera.position.x = (Math.random()-0.5) * shake;
    camera.position.y = (Math.random()-0.5) * shake;
    camera.position.z = 9 + (Math.random()-0.5) * shake * 0.3;
    shake *= 0.90;
  } else {
    camera.position.x += (0 - camera.position.x) * 0.08;
    camera.position.y += (0 - camera.position.y) * 0.08;
    camera.position.z += (9 - camera.position.z) * 0.08;
  }
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* =========================================================
   التنقل بين الشاشات
   ========================================================= */
const screens = {
  intro     : document.getElementById('s-intro'),
  questions : document.getElementById('s-questions'),
  letter    : document.getElementById('s-letter'),
  question  : document.getElementById('s-question'),
  finale    : document.getElementById('s-finale'),
};

function show(name){
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');

  if (name === 'intro')     setHeartTarget(0,    1.00);
  if (name === 'questions') setHeartTarget(0.30, 0.24);
  if (name === 'letter')    setHeartTarget(0.20, 0.28);
  if (name === 'question')  setHeartTarget(0.20, 0.32);
  if (name === 'finale')    setHeartTarget(2.20, 0.55);
}

/* =========================================================
   الكتابة حرف بحرف
   ========================================================= */
function typeLines(el, lines, onDone){
  let li = 0, ci = 0;
  el.innerHTML = '';
  const caret = document.createElement('span');
  caret.className = 'caret';

  (function step(){
    if (li >= lines.length){ caret.remove(); onDone && onDone(); return; }
    if (ci === 0){
      const p = document.createElement('p');
      p.className = 'line';
      el.appendChild(p);
      el.appendChild(caret);
    }
    const p = el.querySelectorAll('.line')[li];
    p.textContent = lines[li].slice(0, ++ci);

    if (ci >= lines[li].length){
      li++; ci = 0;
      setTimeout(step, 520);
    } else {
      setTimeout(step, 48);
    }
  })();
}

/* =========================================================
   الشاشة 1 → 2 (Intro → Questions)
   ========================================================= */
document.getElementById('openBtn').addEventListener('click', () => {
  show('questions');
});

/* =========================================================
   شاشة الأسئلة — إرسال
   ========================================================= */
const qForm      = document.getElementById('qForm');
const sendBtn    = document.getElementById('sendBtn');
const sendingBox = document.getElementById('sendingBox');

qForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // جمع الإجابات
  const data = new FormData(qForm);
  const answers = {
    q1: (data.get('q1') || '').toString().trim(),
    q2: (data.get('q2') || '').toString().trim(),
    q3: (data.get('q3') || '').toString().trim(),
    q4: (data.get('q4') || '').toString().trim(),
    q5: (data.get('q5') || '').toString().trim(),
    time: new Date().toISOString(),
  };

  // لو فيه فراغ، نبلغ
  if (!answers.q1 || !answers.q2 || !answers.q3 || !answers.q4 || !answers.q5){
    alert('Please answer all 5 questions ❤️');
    return;
  }

  // نعطّل الزر ونظهر overlay الإرسال
  sendBtn.disabled = true;
  sendingBox.classList.add('show');

  // نحاول نحفظ في Firebase
  try {
    if (db) {
      await db.ref('answers/' + Date.now()).set(answers);
    }
  } catch (err) {
    console.warn('Firebase save failed:', err);
  }

  // نستنى شويّة عشان تبان "Sending..."
  setTimeout(() => {
    sendingBox.classList.remove('show');
    // نروح لصفحة الرسالة
    show('letter');
    typeLines(document.getElementById('letterBox'), CONFIG.letter, () => {
      document.getElementById('nextBtn').classList.remove('hidden');
    });
  }, 1400);
});

/* =========================================================
   الشاشة 3 → 4 (Letter → Question)
   ========================================================= */
document.getElementById('nextBtn').addEventListener('click', () => {
  show('question');
  document.getElementById('question').textContent = CONFIG.question;
});

/* =========================================================
   زر No اللي بيهرب
   ========================================================= */
const noBtn  = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
let noCount = 0, yesScale = 1, escaped = false;

function escapeNo(){
  if (!escaped){
    escaped = true;
    const r = noBtn.getBoundingClientRect();
    const slot = document.createElement('span');
    slot.style.cssText = `display:inline-block;width:${r.width}px;height:${r.height}px`;
    noBtn.parentNode.insertBefore(slot, noBtn);

    noBtn.style.position = 'fixed';
    noBtn.style.left = r.left + 'px';
    noBtn.style.top  = r.top  + 'px';
    noBtn.style.width = r.width + 'px';
    noBtn.style.margin = '0';
    noBtn.style.zIndex = '15';
  }

  const pad = 14;
  const w = noBtn.offsetWidth, h = noBtn.offsetHeight;
  const maxX = Math.max(pad, window.innerWidth  - w - pad);
  const maxY = Math.max(pad, window.innerHeight - h - pad);

  noBtn.style.left = (pad + Math.random() * (maxX - pad)) + 'px';
  noBtn.style.top  = (pad + Math.random() * (maxY - pad)) + 'px';

  noCount++;
  noBtn.textContent = CONFIG.noTexts[Math.min(noCount, CONFIG.noTexts.length - 1)];
  yesScale = Math.min(yesScale + 0.14, 2.6);
  yesBtn.style.setProperty('--s', yesScale);
}

noBtn.addEventListener('mouseenter', escapeNo);
noBtn.addEventListener('click', escapeNo);
noBtn.addEventListener('touchstart', e => { e.preventDefault(); escapeNo(); }, { passive:false });

/* =========================================================
   Yes → Finale
   ========================================================= */
yesBtn.addEventListener('click', () => {
  buildGallery();
  show('finale');

  shake = 0.55;
  explode(0, 0, 90, 1.4);

  let shots = 0;
  const iv = setInterval(() => {
    explode(
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 4,
      45, 1.1
    );
    shake = 0.35;
    if (++shots > 6) clearInterval(iv);
  }, 550);
});

/* =========================================================
   معرض الصور
   ========================================================= */
let galleryBuilt = false;
function buildGallery(){
  if (galleryBuilt) return;
  galleryBuilt = true;

  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';

  CONFIG.photos.forEach(src => {
    const ph = document.createElement('div');
    ph.className = 'ph';

    const img = document.createElement('img');
    img.src = src;
    img.alt = 'memory';
    img.loading = 'lazy';
    img.onerror = () => {
      img.style.background = 'linear-gradient(135deg,#ff4d88,#8b5cf6)';
      img.removeAttribute('src');
    };

    ph.appendChild(img);
    gallery.appendChild(ph);
  });
}

/* =========================================================
   زرار الواتساب
   ========================================================= */
document.getElementById('waBtn').href = CONFIG.whatsapp;

/* =========================================================
   الموسيقى
   ========================================================= */
const music    = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');
let musicOK    = true;

music.volume = 0.7;
music.addEventListener('error', () => {
  musicOK = false;
  musicBtn.style.display = 'none';
});
music.load();

musicBtn.addEventListener('click', () => {
  if (!musicOK) return;
  if (music.paused){
    music.play().then(() => {
      musicBtn.classList.add('playing');
      musicBtn.textContent = '🎵';
    }).catch(() => {});
  } else {
    music.pause();
    musicBtn.classList.remove('playing');
    musicBtn.textContent = '🔇';
  }
});

/* =========================================================
   اسم Jana في العنوان
   ========================================================= */
document.querySelector('.name').innerHTML =
  `${CONFIG.herName} <span>${CONFIG.herFull}</span>`;