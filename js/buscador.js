/**
 * Smart Machining — buscador.js
 * Muestra el catálogo combinando herramientas estáticas
 * + las que el administrador haya agregado desde admin.html
 */

// ── Herramientas base (estáticas) ─────────────────────────────────────────
const toolsBase = [
    {
        id: 1,
        name: "Fresa de Carburo Ø12mm",
        category: "fresado",
        description: "Fresa de carburo sólido de alta precisión para acabados finos en aceros y aleaciones.",
        material: "Carburo",
        diameter: "12mm",
        badge: "Popular",
        specs: { flutes: 4, length: "75mm", coating: "TiAlN" }
    },
    {
        id: 2,
        name: "Plaquita de Torneado WNMG080408",
        category: "torneado",
        description: "Plaquita reversible para torneado exterior con geometría de viruta optimizada.",
        material: "Cermet",
        diameter: "N/A",
        badge: "Nuevo",
        specs: { shape: "Romboidal", grade: "GC4225", coating: "CVD" }
    },
    {
        id: 3,
        name: "Broca HSS-Co Ø8.5mm",
        category: "taladrado",
        description: "Broca de acero rápido con cobalto para perforación en aceros inoxidables y aleaciones duras.",
        material: "HSS-Co",
        diameter: "8.5mm",
        badge: null,
        specs: { length: "117mm", point: "135°", shank: "Cilíndrico" }
    },
    {
        id: 4,
        name: "Macho de Roscar M10x1.5",
        category: "roscado",
        description: "Macho de roscar HSS para roscas métricas. Excelente para aceros al carbono.",
        material: "HSS",
        diameter: "M10",
        badge: null,
        specs: { pitch: "1.5mm", passes: 3, coating: "TiN" }
    },
    {
        id: 5,
        name: "Micrómetro Digital 0-25mm",
        category: "medicion",
        description: "Micrómetro digital de alta precisión con display LCD. Resolución 0.001mm.",
        material: "Acero Endurecido",
        diameter: "N/A",
        badge: "Pro",
        specs: { resolution: "0.001mm", accuracy: "±2μm", battery: "SR44" }
    },
    {
        id: 6,
        name: "Inserto CNMG120408-MM",
        category: "torneado",
        description: "Inserto de torneado para desbaste medio en aceros y fundiciones.",
        material: "Carburo",
        diameter: "N/A",
        badge: null,
        specs: { shape: "Romboidal 80°", grade: "2025", edge: "Molido" }
    },
    {
        id: 7,
        name: "Fresa Frontal Ø50mm",
        category: "fresado",
        description: "Fresa frontal de plaquitas intercambiables para desbaste pesado.",
        material: "Carburo",
        diameter: "50mm",
        badge: "Popular",
        specs: { inserts: 6, cutting: "90°", coolant: "Interno" }
    },
    {
        id: 8,
        name: "Calibre Pie de Rey Digital",
        category: "medicion",
        description: "Calibrador digital de acero inoxidable. Medición interna, externa y profundidad.",
        material: "Acero Inoxidable",
        diameter: "N/A",
        badge: "Nuevo",
        specs: { range: "0-150mm", resolution: "0.01mm", accuracy: "±0.02mm" }
    },
    {
        id: 9,
        name: "Broca de Carburo Ø6mm",
        category: "taladrado",
        description: "Broca de carburo sólido para materiales endurecidos y aceros templados.",
        material: "Carburo",
        diameter: "6mm",
        badge: "Pro",
        specs: { length: "95mm", point: "140°", coolant: "Interno" }
    },
    {
        id: 10,
        name: "Porta-herramientas PCLNR",
        category: "torneado",
        description: "Porta-herramientas para torneado exterior con sujeción mecánica.",
        material: "Acero",
        diameter: "N/A",
        badge: null,
        specs: { shank: "25x25mm", angle: "95°", clamp: "Palanca" }
    },
    {
        id: 11,
        name: "Fresa Esférica Ø10mm",
        category: "fresado",
        description: "Fresa esférica de carburo para superficies complejas y acabados 3D.",
        material: "Carburo",
        diameter: "10mm",
        badge: "Popular",
        specs: { radius: "5mm", length: "80mm", coating: "AlCrN" }
    },
    {
        id: 12,
        name: "Terraja M16",
        category: "roscado",
        description: "Terraja ajustable para roscado exterior métrico. Incluye portaterrajas.",
        material: "HSS",
        diameter: "M16",
        badge: null,
        specs: { range: "M14-M18", passes: "Manual", holder: "Incluido" }
    }
];

// ── Leer herramientas del admin (localStorage) ────────────────────────────
function getAdminTools() {
    try {
        return JSON.parse(localStorage.getItem('sm_herramientas')) || [];
    } catch { return []; }
}

// ── Normalizar herramienta admin al formato del catálogo ──────────────────
function normalizeAdminTool(t) {
    return {
        id:          t.id,
        name:        t.name        || t.nombre      || 'Sin nombre',
        category:    t.category    || t.categoria   || 'otro',
        description: t.description || t.descripcion || '',
        material:    t.material    || 'N/A',
        diameter:    t.diameter    || t.diametro    || 'N/A',
        badge:       t.badge       || 'Nuevo',
        imagen:      t.imagen      || null,
        modeloNombre: t.modeloNombre || null,
        isAdmin:     true,
        specs:       t.specs || { material: t.material || 'N/A', diameter: t.diameter || 'N/A' },
    };
}

// ── Catálogo combinado ────────────────────────────────────────────────────
function buildCatalog() {
    const adminTools = getAdminTools().map(normalizeAdminTool);

    // Avoid duplicates: admin tools override base tools with same name (case-insensitive)
    const adminNames = new Set(adminTools.map(t => t.name.toLowerCase()));
    const filtered   = toolsBase.filter(t => !adminNames.has(t.name.toLowerCase()));

    // Admin tools first (more recent), then base
    return [...adminTools, ...filtered];
}

// ── Globals ───────────────────────────────────────────────────────────────
let toolsDatabase = buildCatalog();
let currentFilter = 'all';
let searchTerm    = '';

// ── Init ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    toolsDatabase = buildCatalog();
    renderTools(toolsDatabase);
    initializeFilters();
    initializeSearch();
    updateToolCount();
});

// ── Count label ───────────────────────────────────────────────────────────
function updateToolCount() {
    const sub = document.querySelector('.hero-subtitle, .tools-subtitle');
    if (sub) {
        sub.textContent = `${toolsDatabase.length} herramientas de mecanizado con especificaciones técnicas y modelos 3D`;
    }
}

// ── Render ────────────────────────────────────────────────────────────────
function renderTools(tools) {
    const grid      = document.getElementById('toolsGrid');
    const noResults = document.getElementById('noResults');
    grid.innerHTML  = '';

    if (!tools.length) {
        grid.style.display   = 'none';
        noResults.style.display = 'block';
        return;
    }

    grid.style.display      = 'grid';
    noResults.style.display = 'none';
    tools.forEach(t => grid.appendChild(createToolCard(t)));
    animateCards();
}

function createToolCard(tool) {
    const card = document.createElement('div');
    card.className        = 'tool-card';
    card.dataset.category = tool.category;

    // Image: admin-uploaded > svg icon
    const imgBlock = tool.imagen
        ? `<img src="${tool.imagen}" alt="${esc(tool.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;">`
        : getToolIcon(tool.category);

    // Admin badge
    const adminBadge = tool.isAdmin
        ? `<div class="tool-badge" style="background:#2e7d32">Admin</div>`
        : (tool.badge ? `<div class="tool-badge">${tool.badge}</div>` : '');

    // 3D badge
    const badge3d = tool.modeloNombre
        ? `<div class="tool-badge" style="background:#1a1a1a;right:auto;left:10px">3D</div>` : '';

    card.innerHTML = `
    <div class="tool-image">
        ${imgBlock}
        ${adminBadge}
        ${badge3d}
    </div>
    <div class="tool-category">${getCategoryName(tool.category)}</div>
    <h3 class="tool-title">${esc(tool.name)}</h3>
    <p class="tool-description">${esc(tool.description)}</p>
    <div class="tool-specs">
        <div class="spec-item">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            <span>${esc(tool.diameter)}</span>
        </div>
        <div class="spec-item">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
            <span>${esc(tool.material)}</span>
        </div>
    </div>
    <div class="tool-actions">
        <button class="action-btn" onclick="viewTool3D(${tool.id})">Ver en 3D</button>
        <button class="action-btn" onclick="viewSpecs(${tool.id})">Especificaciones</button>
    </div>`;

    return card;
}

function esc(s) {
    return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Icons ─────────────────────────────────────────────────────────────────
function getToolIcon(category) {
    const icons = {
        corte:    '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
        torneado: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
        fresado:  '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
        taladrado:'<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>',
        roscado:  '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
        medicion: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>',
        otro:     '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.2 4.2l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.2-4.2l4.2-4.2"/></svg>',
    };
    return icons[category] || icons.otro;
}

function getCategoryName(category) {
    const n = {
        corte:'Herramientas de Corte', torneado:'Torneado', fresado:'Fresado',
        taladrado:'Taladrado', roscado:'Roscado', medicion:'Medición', otro:'General',
        'maquina-cnc':'Máquina CNC',
    };
    return n[category] || 'General';
}

// ── Filters ───────────────────────────────────────────────────────────────
function initializeFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.category;
            applyFilters();
        });
    });
}

function initializeSearch() {
    const inp = document.getElementById('searchInput');
    if (!inp) return;
    inp.addEventListener('input', e => {
        searchTerm = e.target.value.toLowerCase();
        applyFilters();
    });
}

function applyFilters() {
    let list = toolsDatabase;
    if (currentFilter !== 'all') list = list.filter(t => t.category === currentFilter);
    if (searchTerm) {
        list = list.filter(t =>
            t.name.toLowerCase().includes(searchTerm) ||
            t.description.toLowerCase().includes(searchTerm) ||
            t.material.toLowerCase().includes(searchTerm) ||
            t.category.toLowerCase().includes(searchTerm)
        );
    }
    renderTools(list);
}

// ── Animate ───────────────────────────────────────────────────────────────
function animateCards() {
    document.querySelectorAll('.tool-card').forEach((card, i) => {
        card.style.opacity   = '0';
        card.style.transform = 'translateY(24px)';
        setTimeout(() => {
            card.style.transition = 'opacity .45s ease, transform .45s ease';
            card.style.opacity    = '1';
            card.style.transform  = 'translateY(0)';
        }, i * 45);
    });
}

// ── Placeholders ──────────────────────────────────────────────────────────
function viewTool3D(toolId) {
    const t = toolsDatabase.find(x => x.id === toolId);
    if (!t) return;
    if (t.modeloNombre) {
        alert(`Modelo 3D: ${t.modeloNombre}\n\nEsta función abrirá el visor 3D interactivo.`);
    } else {
        alert(`${t.name} no tiene modelo 3D cargado aún.\nPuede agregarlo desde el panel de administración.`);
    }
}

function viewSpecs(toolId) {
    const t = toolsDatabase.find(x => x.id === toolId);
    if (!t) return;
    let txt = `Especificaciones: ${t.name}\n\n`;
    txt += `Categoría: ${getCategoryName(t.category)}\n`;
    txt += `Material: ${t.material}\n`;
    txt += `Diámetro: ${t.diameter}\n\n`;
    Object.entries(t.specs).forEach(([k, v]) => { txt += `${k}: ${v}\n`; });
    alert(txt);
}

window.viewTool3D = viewTool3D;
window.viewSpecs  = viewSpecs;

console.log('%c🔧 Catálogo Smart Machining', 'color:#c9a961;font-weight:700');
console.log(`Herramientas base: ${toolsBase.length} | Admin: ${getAdminTools().length} | Total: ${toolsDatabase.length}`);
