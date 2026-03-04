<?php
$conexion = new mysqli("localhost", "root", "", "smartmaching");

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

$resultado = $conexion->query("SELECT `id`, `nombre`, `categoria`, `descripcion`, `model_path`, `color`, `destacado`, `created_at` FROM `herramientas` WHERE 1");
$herramientas = [];

while($fila = $resultado->fetch_assoc()){
    $herramientas[] = $fila;
}

$conexion->close();

// catalogo.php está en php/ y los modelos en login/models/
// Ruta relativa desde php/ hacia login/models/
$modelsBase = '../login/models/';

// Pasar datos a JS de forma segura
$toolsJson = json_encode($herramientas, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT);
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Catálogo — Smart Maching</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <link rel="stylesheet" href="../style/catalogo.css"/> 
</head>
<body>

<!-- ════════ NAV ════════ -->
<header>
  <a href="#" class="logo">SMART MACHING</a>
  <nav>
    <ul>
      <li><a href="../index.html">Inicio</a></li>
      <li><a href="#catalogo">Catálogo</a></li>
      <li><a href="../html/chatbot.html">Chatbot IA</a></li>
      <li><a href="../html/ra.html">Realidad Aumentada</a></li>
    </ul>
  </nav>
</header>

<!-- ════════ HERO ════════ -->
<section class="hero">
  <div class="hero-text">
    <div class="hero-label">▸ CATÁLOGO TÉCNICO PROFESIONAL</div>
    <h1>HERRAMIENTAS<br><span>DE ALTO</span><br>RENDIMIENTO</h1>
    <p>Equipamiento técnico especializado para profesionales de la mecánica industrial y automotriz.</p>
    <a href="#catalogo" class="btn-primary">EXPLORAR HERRAMIENTAS →</a>
  </div>

  <div class="hero-preview" id="heroPreview">
    <div class="card-loader" id="heroLoader">CARGANDO MODELO...</div>
    <div class="hero-preview-info">
      <div class="hero-preview-cat" id="heroCat"></div>
      <div class="hero-preview-name" id="heroName"></div>
      <div class="hero-preview-hint">CLIC PARA VER EN 3D</div>
    </div>
    <div class="hero-corner" id="heroCorner"></div>
  </div>
</section>

<!-- ════════ DESTACADOS ════════ -->
<div class="section-wrap" id="featuredSection">
  <div class="section-head">
    <div class="section-bar" style="background:rgba(255,255,255,0.3)"></div>
    <h2>HERRAMIENTAS DESTACADAS</h2>
    <div class="section-line"></div>
  </div>
  <div class="cards-grid" id="featuredGrid"></div>
</div>

<!-- ════════ CATÁLOGO COMPLETO ════════ -->
<div class="section-wrap" id="catalogo">
  <div class="section-head">
    <div class="section-bar" style="background:rgba(255,255,255,0.3)"></div>
    <h2>CATÁLOGO COMPLETO</h2>
    <div class="section-line"></div>
    <div class="section-count" id="catalogCount"></div>
  </div>
  <div class="filters">
    <div class="filters-cats" id="catButtons"></div>
    <div class="search-box">
      <span style="color:var(--dim)">⌕</span>
      <input type="text" id="searchInput" placeholder="Buscar herramienta..."/>
    </div>
  </div>

  <div class="cards-grid" id="catalogGrid"></div>
</div>

<!-- ════════ MODAL ════════ -->
<div class="modal-overlay" id="modalOverlay">
  <div class="modal-box">
    <div class="modal-3d" id="modal3d">
      <div class="modal-loader" id="modalLoader">CARGANDO MODELO...</div>
      <div class="modal-drag-hint">ARRASTRAR · SCROLL PARA ZOOM</div>
      <div class="modal-corner-h" id="modalCornerH"></div>
      <div class="modal-corner-v" id="modalCornerV"></div>
    </div>
    <div class="modal-info">
      <div class="modal-close-row">
        <button class="modal-close" id="modalCloseBtn">×</button>
      </div>
      <div>
        <span class="modal-cat-badge" id="modalCat"></span>
        <div class="modal-name" id="modalName"></div>
      </div>
      <div class="modal-divider">
        <div id="modalDivBar" style="height:3px;border-radius:2px;"></div>
        <div style="width:8px;height:3px;background:#2a2f38;border-radius:2px;"></div>
      </div>
      <p class="modal-desc" id="modalDesc"></p>
      <div class="modal-specs">
        <div class="modal-specs-title">FICHA TÉCNICA</div>
        <div class="modal-specs-grid" id="modalSpecs"></div>
      </div>
      <div class="modal-status">
        <div class="dot-green"></div>
        <span>HERRAMIENTA REGISTRADA</span>
      </div>
      <!-- BOTÓN DESCARGA -->
      <a class="modal-download" id="modalDownloadBtn" href="#" download>
        <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        DESCARGAR MODELO 3D (.GLB)
      </a>
    </div>
  </div>
</div>

<!-- ════════ FOOTER ════════ -->
<footer class="main-footer">
  <div class="footer-container">
    <div class="footer-col">
      <h2>SMART MACHING</h2>
      <p>Transformamos la producción con tecnología de vanguardia. Desde herramientas inteligentes hasta realidad aumentada, llevamos el mecanizado al futuro.</p>
      <div class="socials">
        <a href="#">LinkedIn</a>
        <a href="#">Facebook</a>
        <a href="#">Instagram</a>
      </div>
    </div>
    <div class="footer-col">
      <h3>Empresa</h3>
      <ul>
        <li><a href="#">Sobre Nosotros</a></li>
        <li><a href="#">Servicios</a></li>
        <li><a href="#">Partners</a></li>
        <li><a href="#">Contacto</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h3>Soluciones</h3>
      <ul>
        <li><a href="#">Catálogo</a></li>
        <li><a href="#">Asistencia IA</a></li>
        <li><a href="#">Realidad Aumentada</a></li>
        <li><a href="#">Modelado 3D</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h3>Soporte</h3>
      <ul>
        <li><a href="#">FAQ</a></li>
        <li><a href="#">Términos y Condiciones</a></li>
        <li><a href="#">Política de Privacidad</a></li>
        <li><a href="#">Ayuda Técnica</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">© 2026 Smart Maching. Todos los derechos reservados.</div>
</footer>

<script>
/* ══════════════════════════════════════════
   DATOS DESDE PHP/MySQL
   ══════════════════════════════════════════
   Los campos de la BD son:
     id, nombre, categoria, descripcion, model_path, color, destacado
   El JS original usaba: name, category, description, modelPath, featured
   → hacemos el mapeo aquí
*/
const rawTools   = <?= $toolsJson ?>;
const MODELS_BASE = <?= json_encode($modelsBase) ?>;  // ruta base auto-detectada

// Mapear nombres de columnas BD → nombres que usa el JS
const tools = rawTools.map(t => ({
  id:          t.id,
  name:        t.nombre,
  category:    t.categoria,
  description: t.descripcion,
  // Extraer solo el nombre del archivo y construir ruta correcta
  modelPath:   '../login/models/' + t.model_path.split('/').pop(),
  color: t.color || '#e8e8e8',
  featured:    t.destacado == 1 || t.destacado === true
}));

const CATEGORIES = ['Todos','Medición','Sujeción','Neumática','Diagnóstico','Corte','Otra'];

let activeCategory = 'Todos';
let searchTerm     = '';
let heroToolId     = null;

/* ══════════════════════════════════════════
   THREE.JS — visor reutilizable por canvas
   ══════════════════════════════════════════ */
const viewers = new Map();

function createViewer(container, modelPath, interactive) {
  const vid = '_v' + Math.random().toString(36).slice(2);
  const w = container.clientWidth  || container.offsetWidth  || 300;
  const h = container.clientHeight || container.offsetHeight || 200;

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 3));         // más resolución
  renderer.setSize(w, h);
  renderer.outputEncoding  = THREE.sRGBEncoding;
  renderer.physicallyCorrectLights = true;                      
  renderer.toneMapping     = THREE.ACESFilmicToneMapping;        
  renderer.toneMappingExposure = 1.4;                            
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type  = THREE.PCFSoftShadowMap;             
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  // Fondo: gris oscuro-azulado medio — no pierde piezas negras ni blancas
  const _bgCv = document.createElement('canvas');
  _bgCv.width = 2; _bgCv.height = 512;
  const _bgCx = _bgCv.getContext('2d');
  // Fondo: degradado azul-pizarra con profundidad
  const _bgGr = _bgCx.createLinearGradient(0, 0, 0, 512);
  _bgGr.addColorStop(0,    '#28384a');
  _bgGr.addColorStop(0.5,  '#161e28');
  _bgGr.addColorStop(1,    '#090d12');
  _bgCx.fillStyle = _bgGr;
  _bgCx.fillRect(0, 0, 2, 512);
  scene.background = new THREE.CanvasTexture(_bgCv);

  const camera = new THREE.PerspectiveCamera(45, w / h, 0.01, 1000);
  camera.position.set(3, 2, 4);

  // ── Iluminación estudio PBR ──────────────────────────────
  // physicallyCorrectLights=true → intensidades en lúmenes

  // Luz clave: spot cálido alto-derecha (simula estudio)
  const key = new THREE.DirectionalLight(0xfff8f0, 800);
  key.position.set(6, 10, 5);
  key.castShadow = true;
  key.shadow.mapSize.width  = 2048;
  key.shadow.mapSize.height = 2048;
  key.shadow.camera.near = 0.1;
  key.shadow.camera.far  = 50;
  key.shadow.bias = -0.001;
  scene.add(key);

  // Relleno: azul-frío suave desde la izquierda
  const fill = new THREE.DirectionalLight(0xb0d0ff, 300);
  fill.position.set(-6, 3, 5); scene.add(fill);

  // Rim: naranja brillante desde atrás — define silueta en piezas negras
  const rim = new THREE.DirectionalLight(0xff7722, 600);
  rim.position.set(1, 5, -7); scene.add(rim);

  // Sub: blanco desde abajo para separar del suelo
  const sub = new THREE.DirectionalLight(0xffffff, 150);
  sub.position.set(0, -5, 3); scene.add(sub);

  // Ambiental IBL simulada — hemisférica cielo/suelo
  const hemi = new THREE.HemisphereLight(0x334466, 0x221100, 80);
  scene.add(hemi);

  // Grid premium — reflejo muy sutil
  const grid = new THREE.GridHelper(12, 24, 0x1e3048, 0x111e2a);
  grid.material.opacity = 0.6;
  grid.material.transparent = true;
  grid.position.y = -1.2; scene.add(grid);

  // OrbitControls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping   = true;
  controls.dampingFactor   = 0.07;
  controls.enablePan       = false;
  controls.minDistance     = 0.5;
  controls.maxDistance     = 20;
  controls.autoRotate      = true;
  controls.autoRotateSpeed = 1.5;
  controls.target.set(0, 0, 0);
  if (!interactive) { controls.enableZoom = false; controls.enableRotate = false; }

  // Loader: buscar en el container padre si no está dentro
  const loaderEl = container.querySelector('.card-loader, .modal-loader')
                || container.parentElement && container.parentElement.querySelector('.card-loader, .modal-loader');

  if (!modelPath) {
    if (loaderEl) loaderEl.textContent = 'SIN MODELO';
    let frame;
    const loop = () => { frame = requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera); };
    loop();
    viewers.set(vid, { renderer, controls, frame });
    return vid;
  }

  new THREE.GLTFLoader().load(
    modelPath,
    (gltf) => {
      if (loaderEl) loaderEl.style.display = 'none';
      const model = gltf.scene;
      const bbox   = new THREE.Box3().setFromObject(model);
      const center = bbox.getCenter(new THREE.Vector3());
      const size   = bbox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale  = maxDim > 0 ? 2.5 / maxDim : 1;
      model.scale.setScalar(scale);
      model.position.sub(center.multiplyScalar(scale));
      model.traverse(c => {
        if (c.isMesh) {
          c.castShadow    = true;
          c.receiveShadow = true;
          // Mejorar material si es plástico/metal negro sin PBR
          if (c.material) {
            const mats = Array.isArray(c.material) ? c.material : [c.material];
            mats.forEach(m => {
              if (m.isMeshStandardMaterial || m.isMeshPhysicalMaterial) {
                m.roughness    = Math.min(m.roughness, 0.45);   // más brillante
                m.metalness    = Math.max(m.metalness, 0.25);   // toque metálico
                m.envMapIntensity = 1.2;
              }
            });
          }
        }
      });
      scene.add(model);
      controls.update();
    },
    (xhr) => {
      if (loaderEl && xhr.total)
        loaderEl.textContent = 'CARGANDO ' + Math.round(xhr.loaded / xhr.total * 100) + '%';
    },
    (err) => {
      console.error('GLB error:', modelPath, err);
      if (loaderEl) { loaderEl.style.display = 'flex'; loaderEl.textContent = 'ERROR AL CARGAR'; }
    }
  );

  let frame;
  const loop = () => { frame = requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera); };
  loop();

  viewers.set(vid, { renderer, controls, frame });
  return vid;
}

function destroyViewer(vid) {
  const v = viewers.get(vid);
  if (!v) return;
  cancelAnimationFrame(v.frame);
  v.controls.dispose();
  v.renderer.dispose();
  viewers.delete(vid);
}

/* ══════════════════════════════════════════
   HERO
   ══════════════════════════════════════════ */
let heroVid = null;

function renderHero() {
  const tool = tools.find(t => t.featured) || tools[0];
  if (!tool) return;
  heroToolId = tool.id;
  document.getElementById('heroCat').style.color = 'var(--accent)';
  document.getElementById('heroCorner').style.background = 'rgba(255,255,255,0.3)';
  document.getElementById('heroName').textContent  = tool.name;
  document.getElementById('heroCorner').style.background = tool.color;

  const box = document.getElementById('heroPreview');
  if (heroVid) destroyViewer(heroVid);
  heroVid = createViewer(box, tool.modelPath, false);
  box.onclick = () => openModal(heroToolId);
}

/* ══════════════════════════════════════════
   CARDS
   ══════════════════════════════════════════ */
let cardVids = [];

function makeCard(tool) {
  const div = document.createElement('div');
  div.className = 'tool-card' + (tool.featured ? ' featured' : '');
  if (tool.featured) div.style.borderTopColor = 'rgba(255,255,255,0.3)';
  div.innerHTML = `
    <div class="card-3d" id="c3d_${tool.id}">
      <div class="card-loader">CARGANDO...</div>
    </div>
    <div class="card-info">
      <div class="card-cat" style="color: var(--accent)">${tool.category}</div>
      <div class="card-name">${tool.name}</div>
      <div class="card-footer">
        <div class="badge3d"><div class="dot-green"></div><span>MODELO 3D</span></div>
        <div class="card-arrow">VER →</div>
      </div>
    </div>`;
  div.addEventListener('click', () => openModal(tool.id));
  return div;
}

function renderFeatured() {
  const grid    = document.getElementById('featuredGrid');
  const section = document.getElementById('featuredSection');
  const list    = tools.filter(t => t.featured);
  if (!list.length) { section.style.display = 'none'; return; }
  section.style.display = '';
  grid.innerHTML = '';
  list.forEach(t => {
    grid.appendChild(makeCard(t));
    const vid = createViewer(document.getElementById('c3d_' + t.id), t.modelPath, false);
    cardVids.push(vid);
  });
}

function renderCatalog() {
  cardVids.forEach(destroyViewer);
  cardVids = [];
  const grid = document.getElementById('catalogGrid');
  grid.innerHTML = '';

  const list = tools.filter(t => {
    const mc = activeCategory === 'Todos' || t.category === activeCategory;
    const ms = !searchTerm ||
      t.name.toLowerCase().includes(searchTerm) ||
      t.category.toLowerCase().includes(searchTerm) ||
      t.description.toLowerCase().includes(searchTerm);
    return mc && ms;
  });

  document.getElementById('catalogCount').textContent = list.length + ' HERRAMIENTAS';

  if (!list.length) {
    grid.innerHTML = '<div class="empty-state">NO SE ENCONTRARON HERRAMIENTAS</div>';
    return;
  }

  list.forEach(t => {
    grid.appendChild(makeCard(t));
    const vid = createViewer(document.getElementById('c3d_' + t.id), t.modelPath, false);
    cardVids.push(vid);
  });
}

function renderCatButtons() {
  const wrap = document.getElementById('catButtons');
  wrap.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (cat === activeCategory ? ' active' : '');
    btn.textContent = cat;
    btn.onclick = () => { activeCategory = cat; renderCatButtons(); renderCatalog(); };
    wrap.appendChild(btn);
  });
}

/* ══════════════════════════════════════════
   MODAL
   ══════════════════════════════════════════ */
let modalVid = null;

function openModal(id) {
  const tool = tools.find(t => t.id === id);
  if (!tool) return;

  document.getElementById('modalCat').textContent              = tool.category;
  document.getElementById('modalCat').style.background     = 'rgba(255,255,255,0.1)';
  document.getElementById('modalName').textContent             = tool.name;
  document.getElementById('modalDesc').textContent             = tool.description;
  document.getElementById('modalDivBar').style.cssText      = `width:32px;height:3px;border-radius:2px;background:rgba(255,255,255,0.3)`;
  document.getElementById('modalCornerH').style.background  = 'rgba(255,255,255,0.3)';
  document.getElementById('modalCornerV').style.background  = 'rgba(255,255,255,0.3)';
  
  document.getElementById('modalSpecs').innerHTML = [
    ['CATEGORÍA', tool.category],
    ['ARCHIVO',   tool.modelPath.split('/').pop()],
    ['ID REF.',   tool.id],
    ['ESTADO',    'Disponible'],
  ].map(([k, v]) => `<div><div class="spec-key">${k}</div><div class="spec-val">${v}</div></div>`).join('');

  // Botón de descarga
  const dlBtn = document.getElementById('modalDownloadBtn');
  dlBtn.href     = tool.modelPath;
  dlBtn.download = tool.modelPath.split('/').pop();

  // Visor 3D
  const pane = document.getElementById('modal3d');
  if (modalVid) destroyViewer(modalVid);
  const old = pane.querySelector('canvas');
  if (old) old.remove();
  const loader = document.getElementById('modalLoader');
  loader.style.display = 'flex';
  loader.textContent = 'CARGANDO MODELO...';

  modalVid = createViewer(pane, tool.modelPath, true);

  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  if (modalVid) { destroyViewer(modalVid); modalVid = null; }
}

document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

document.getElementById('searchInput').addEventListener('input', e => {
  searchTerm = e.target.value.toLowerCase().trim();
  renderCatalog();
});

/* ══════════════════════════════════════════
   INIT — directo, sin async ni localStorage
   ══════════════════════════════════════════ */
renderHero();
renderFeatured();
renderCatButtons();
renderCatalog();
</script>
</body>
</html>