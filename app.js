import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.getElementById('viewerCanvas');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingTitle = document.getElementById('loadingTitle');
const loadingBar = document.getElementById('loadingBar');
const loadingText = document.getElementById('loadingText');

const objectSelect = document.getElementById('objectSelect');
const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
const sidebar = document.getElementById('sidebar');

const autoRotateBtn = document.getElementById('autoRotateBtn');
const wireframeBtn = document.getElementById('wireframeBtn');
const gridBtn = document.getElementById('gridBtn');
const rulerBtn = document.getElementById('rulerBtn');
const lightAngleInput = document.getElementById('lightAngleInput');
const exposureInput = document.getElementById('exposureInput');

const rulerHud = document.getElementById('rulerHud');
const rulerStatus = document.getElementById('rulerStatus');
const rulerResult = document.getElementById('rulerResult');
const clearRulerBtn = document.getElementById('clearRulerBtn');

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');

// --- Three.js Scene Setup ---
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = parseFloat(exposureInput.value);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environment = envTexture;
scene.environmentIntensity = 0.55;

const camera = new THREE.PerspectiveCamera(40, 1, 0.005, 25);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 0.06;
controls.maxDistance = 4.0;
controls.autoRotateSpeed = 1.4;

// Studio lighting
const hemiLight = new THREE.HemisphereLight(0xf6f3ec, 0x262a33, 0.65);
scene.add(hemiLight);

const keyLight = new THREE.DirectionalLight(0xfff8ee, 1.85);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.bias = -0.0004;
keyLight.shadow.camera.near = 0.1;
keyLight.shadow.camera.far = 3.0;
const shadowBounds = 0.35;
keyLight.shadow.camera.left = -shadowBounds;
keyLight.shadow.camera.right = shadowBounds;
keyLight.shadow.camera.top = shadowBounds;
keyLight.shadow.camera.bottom = -shadowBounds;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xd2e1ff, 0.55);
rimLight.position.set(-0.6, 0.45, -0.7);
scene.add(rimLight);

function updateKeyLightPosition(deg) {
  const rad = THREE.MathUtils.degToRad(deg);
  const radius = 0.9;
  keyLight.position.set(Math.sin(rad) * radius, 0.85, Math.cos(rad) * radius);
}
updateKeyLightPosition(parseFloat(lightAngleInput.value));

// Scale Reference Grid (0.50 m x 0.50 m, 50 divisions => 10 mm per square)
const gridHelper = new THREE.GridHelper(0.5, 50, 0xd4a359, 0x363e4f);
gridHelper.position.y = -0.0003;
scene.add(gridHelper);

// Soft shadow catcher plane
const shadowPlane = new THREE.Mesh(
  new THREE.CircleGeometry(0.45, 64),
  new THREE.ShadowMaterial({ opacity: 0.35 })
);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.y = -0.0005;
shadowPlane.receiveShadow = true;
scene.add(shadowPlane);

// State
let catalogData = null;
let currentModelGroup = null;
let modelCenter = new THREE.Vector3(0, 0.12, 0);
let modelRadius = 0.16;
let isWireframe = false;

// Ruler state
let isRulerActive = false;
let rulerPoints = [];
const rulerGroup = new THREE.Group();
scene.add(rulerGroup);
const raycaster = new THREE.Raycaster();
let pointerDownPos = { x: 0, y: 0 };

const gltfLoader = new GLTFLoader();

function resizeRenderer() {
  const rect = canvas.parentElement.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resizeRenderer);
resizeRenderer();

// Render loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// --- Camera Presets ---
function setCameraView(viewName) {
  const dist = Math.max(0.35, modelRadius * 2.75);
  const target = modelCenter.clone();
  controls.target.copy(target);

  switch (viewName) {
    case 'front':
      camera.position.set(target.x, target.y + modelRadius * 0.12, target.z + dist);
      break;
    case 'back':
      camera.position.set(target.x, target.y + modelRadius * 0.12, target.z - dist);
      break;
    case 'side':
      camera.position.set(target.x + dist, target.y + modelRadius * 0.12, target.z);
      break;
    case 'top':
      camera.position.set(target.x, target.y + dist * 1.15, target.z + 0.001);
      break;
    case 'reset':
    default:
      camera.position.set(target.x + dist * 0.48, target.y + dist * 0.25, target.z + dist * 0.88);
      break;
  }
  controls.update();
}

document.querySelectorAll('[data-view]').forEach((btn) => {
  btn.addEventListener('click', () => setCameraView(btn.dataset.view));
});

// --- UI Controls ---
toggleSidebarBtn.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
  setTimeout(resizeRenderer, 20);
});

autoRotateBtn.addEventListener('click', () => {
  controls.autoRotate = !controls.autoRotate;
  autoRotateBtn.classList.toggle('active', controls.autoRotate);
  autoRotateBtn.setAttribute('aria-pressed', String(controls.autoRotate));
});

wireframeBtn.addEventListener('click', () => {
  isWireframe = !isWireframe;
  wireframeBtn.classList.toggle('active', isWireframe);
  wireframeBtn.setAttribute('aria-pressed', String(isWireframe));
  if (currentModelGroup) {
    currentModelGroup.traverse((child) => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((m) => {
          m.wireframe = isWireframe;
        });
      }
    });
  }
});

gridBtn.addEventListener('click', () => {
  const visible = !gridHelper.visible;
  gridHelper.visible = visible;
  gridBtn.classList.toggle('active', visible);
  gridBtn.setAttribute('aria-pressed', String(visible));
});

lightAngleInput.addEventListener('input', (e) => {
  updateKeyLightPosition(parseFloat(e.target.value));
});

exposureInput.addEventListener('input', (e) => {
  renderer.toneMappingExposure = parseFloat(e.target.value);
});

// Tabs
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => {
      const active = b === btn;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', String(active));
    });
    const tab = btn.dataset.tab;
    document.getElementById('tabSpecs').classList.toggle('active', tab === 'specs');
    document.getElementById('tabQa').classList.toggle('active', tab === 'qa');
  });
});

// --- Ruler Logic ---
function clearRuler() {
  rulerPoints = [];
  while (rulerGroup.children.length > 0) {
    const child = rulerGroup.children.pop();
    if (child.geometry) child.geometry.dispose();
    if (child.material) child.material.dispose();
  }
  rulerStatus.textContent = 'Kliknij pierwszy punkt na powierzchni modelu.';
  rulerResult.classList.add('hidden');
  rulerResult.textContent = '';
}

clearRulerBtn.addEventListener('click', clearRuler);

rulerBtn.addEventListener('click', () => {
  isRulerActive = !isRulerActive;
  rulerBtn.classList.toggle('active', isRulerActive);
  rulerBtn.setAttribute('aria-pressed', String(isRulerActive));
  canvas.parentElement.classList.toggle('ruler-mode', isRulerActive);
  rulerHud.classList.toggle('hidden', !isRulerActive);
  if (!isRulerActive) {
    clearRuler();
  }
});

canvas.addEventListener('pointerdown', (e) => {
  pointerDownPos = { x: e.clientX, y: e.clientY };
});

canvas.addEventListener('pointerup', (e) => {
  if (!isRulerActive || !currentModelGroup || e.button !== 0) return;
  const dx = e.clientX - pointerDownPos.x;
  const dy = e.clientY - pointerDownPos.y;
  if (Math.hypot(dx, dy) > 4) return; // Ignore orbit drags

  const rect = canvas.getBoundingClientRect();
  const ndc = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1
  );
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObject(currentModelGroup, true);
  if (!hits.length) return;

  if (rulerPoints.length >= 2) {
    clearRuler();
  }

  const pt = hits[0].point.clone();
  rulerPoints.push(pt);

  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.0028, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffc857 })
  );
  marker.position.copy(pt);
  rulerGroup.add(marker);

  if (rulerPoints.length === 1) {
    rulerStatus.textContent = 'Kliknij drugi punkt na modelu, aby zmierzyć odcinek.';
  } else if (rulerPoints.length === 2) {
    const [a, b] = rulerPoints;
    const lineGeo = new THREE.BufferGeometry().setFromPoints([a, b]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffc857, depthTest: false });
    const line = new THREE.Line(lineGeo, lineMat);
    line.renderOrder = 999;
    rulerGroup.add(line);

    const distMm = a.distanceTo(b) * 1000;
    const dX = Math.abs(b.x - a.x) * 1000;
    const dY = Math.abs(b.y - a.y) * 1000;
    const dZ = Math.abs(b.z - a.z) * 1000;
    rulerStatus.textContent = 'Kliknij ponownie na model, aby rozpocząć nowy pomiar.';
    rulerResult.textContent = `${distMm.toFixed(2)} mm (ΔX ${dX.toFixed(1)}, ΔY ${dY.toFixed(1)}, ΔZ ${dZ.toFixed(1)})`;
    rulerResult.classList.remove('hidden');
  }
});

// --- Lightbox ---
function openLightbox(title, url, caption) {
  lightboxTitle.textContent = title;
  lightboxImg.src = url;
  lightboxImg.alt = title;
  lightboxCaption.textContent = caption || '';
  lightbox.classList.remove('hidden');
}

function closeLightbox() {
  lightbox.classList.add('hidden');
  lightboxImg.src = '';
}

lightboxCloseBtn.addEventListener('click', closeLightbox);
lightbox.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
    closeLightbox();
  }
});

// --- Object Loading & Sidebar Population ---
function populateSidebar(obj) {
  document.getElementById('objIdBadge').textContent = obj.id;
  document.getElementById('objCategory').textContent = obj.category;
  document.getElementById('objTitle').textContent = obj.title;
  document.getElementById('objAuthor').textContent = `${obj.author} • ${obj.material}`;

  document.getElementById('kpiDims').textContent = obj.dimensionsMm.label;
  document.getElementById('kpiGlb').textContent = `${obj.specs.lowPolyGlb.triangles} • ${obj.specs.lowPolyGlb.fileSize}`;
  document.getElementById('kpiCloud').textContent = obj.specs.pointCloud.points;
  document.getElementById('kpiDeviation').textContent = `${obj.specs.deviation.median} (${obj.specs.deviation.within1mm})`;

  const specRows = [
    ['Fotogrametria i skala', `${obj.specs.photosCount} zdjęć • ${obj.specs.scaleMethod}`],
    ['Model użytkowy (GLB)', `${obj.specs.lowPolyGlb.triangles}, ${obj.specs.lowPolyGlb.vertices} • tekstura ${obj.specs.lowPolyGlb.texture}`],
    ['Odchyłka LowPoly vs HighPoly', `Mediana: ${obj.specs.deviation.median} • P95: ${obj.specs.deviation.p95} • ${obj.specs.deviation.within1mm}`],
    ['Chmura punktów (XYZ)', `${obj.specs.pointCloud.points} • mediana gęstości ${obj.specs.pointCloud.medianSpacing}, P95 ${obj.specs.pointCloud.p95Spacing}`],
    ['Model archiwalny HighPoly', `${obj.specs.highPoly.triangles} • ${obj.specs.highPoly.fileSize} • tekstura ${obj.specs.highPoly.texture}`],
    ['Eksport geometrii (STL)', `${obj.specs.stl.triangles} • ${obj.specs.stl.fileSize}`]
  ];

  const specsList = document.getElementById('specsList');
  specsList.innerHTML = '';
  for (const [label, value] of specRows) {
    const row = document.createElement('div');
    row.className = 'spec-row';
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    row.append(dt, dd);
    specsList.appendChild(row);
  }

  document.getElementById('dlGlb').href = obj.glbUrl;
  document.getElementById('dlQaHtml').href = obj.qaReportUrl;
  document.getElementById('dlJson').href = obj.metadataUrl;
  document.getElementById('dlManifest').href = obj.manifestUrl;

  const qaGallery = document.getElementById('qaGallery');
  qaGallery.innerHTML = '';
  for (const item of obj.qaImages || []) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'qa-card';
    card.innerHTML = `
      <img src="${item.url}" alt="${item.title}" loading="lazy" />
      <div class="qa-card-body">
        <div class="qa-card-title">${item.title}</div>
        <div class="qa-card-caption">${item.caption}</div>
      </div>
    `;
    card.addEventListener('click', () => openLightbox(item.title, item.url, item.caption));
    qaGallery.appendChild(card);
  }
}

function disposeModel(group) {
  if (!group) return;
  scene.remove(group);
  group.traverse((child) => {
    if (child.isMesh) {
      if (child.geometry) child.geometry.dispose();
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m) => {
        if (!m) return;
        for (const key of Object.keys(m)) {
          if (m[key] && m[key].isTexture) m[key].dispose();
        }
        m.dispose();
      });
    }
  });
}

async function loadObject(obj) {
  populateSidebar(obj);
  clearRuler();
  disposeModel(currentModelGroup);
  currentModelGroup = null;

  loadingTitle.textContent = `Ładowanie modelu ${obj.id}…`;
  loadingBar.style.width = '0%';
  loadingText.textContent = 'Pobieranie siatki GLB i tekstury…';
  loadingOverlay.classList.remove('hidden');

  try {
    const gltf = await new Promise((resolve, reject) => {
      gltfLoader.load(
        obj.glbUrl,
        resolve,
        (xhr) => {
          if (xhr.lengthComputable && xhr.total > 0) {
            const pct = Math.min(100, Math.round((xhr.loaded / xhr.total) * 100));
            const mbLoaded = (xhr.loaded / (1024 * 1024)).toFixed(1);
            const mbTotal = (xhr.total / (1024 * 1024)).toFixed(1);
            loadingBar.style.width = `${pct}%`;
            loadingText.textContent = `${pct}% (${mbLoaded} / ${mbTotal} MB)`;
          } else if (xhr.loaded > 0) {
            const mbLoaded = (xhr.loaded / (1024 * 1024)).toFixed(1);
            loadingText.textContent = `Pobrano ${mbLoaded} MB…`;
          }
        },
        reject
      );
    });

    const root = gltf.scene;
    root.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m) => {
            m.wireframe = isWireframe;
            if (m.roughness !== undefined && m.roughness < 0.7) {
              m.roughness = 0.85;
            }
            if (m.metalness !== undefined) {
              m.metalness = 0.0;
            }
          });
        }
      }
    });

    // Center X and Z while preserving real-world scale in meters (Y = 0 base)
    const box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    root.position.set(-center.x, -box.min.y, -center.z);

    const wrapper = new THREE.Group();
    wrapper.add(root);
    scene.add(wrapper);
    currentModelGroup = wrapper;

    const finalBox = new THREE.Box3().setFromObject(wrapper);
    modelCenter = finalBox.getCenter(new THREE.Vector3());
    const sphere = finalBox.getBoundingSphere(new THREE.Sphere());
    modelRadius = Math.max(0.08, sphere.radius);

    setCameraView('reset');
    loadingOverlay.classList.add('hidden');
  } catch (err) {
    console.error('Błąd ładowania modelu GLB:', err);
    loadingTitle.textContent = 'Nie udało się załadować modelu';
    loadingText.textContent = err?.message || 'Sprawdź połączenie lub uruchom aplikację przez serwer HTTP.';
  }
}

async function init() {
  try {
    const res = await fetch('objects.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    catalogData = await res.json();

    if (catalogData.collectionTitle) {
      document.getElementById('collectionTitle').textContent = catalogData.collectionTitle;
    }

    objectSelect.innerHTML = '';
    catalogData.objects.forEach((obj, idx) => {
      const opt = document.createElement('option');
      opt.value = String(idx);
      opt.textContent = `${obj.id} — ${obj.title}`;
      objectSelect.appendChild(opt);
    });

    objectSelect.addEventListener('change', (e) => {
      const idx = parseInt(e.target.value, 10) || 0;
      loadObject(catalogData.objects[idx]);
    });

    if (catalogData.objects.length > 0) {
      await loadObject(catalogData.objects[0]);
    }
  } catch (err) {
    console.error('Błąd ładowania objects.json:', err);
    loadingTitle.textContent = 'Błąd konfiguracji katalogu';
    loadingText.textContent = `Nie można wczytać objects.json (${err.message}).`;
  }
}

init();
