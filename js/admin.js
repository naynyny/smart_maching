/* =============================================
   SMART MACHINING — admin.js
   Gestión de herramientas y modelados 3D.
   Los datos se guardan en localStorage con
   la misma clave que lee buscador.js (sm_herramientas)
   ============================================= */

'use strict';

// ── Auth guard ──────────────────────────────
if (!sessionStorage.getItem('sm_admin')) {
    window.location.href = 'admin-login.html';
}

// ── Storage helpers ──────────────────────────
const DB = {
    TOOLS:  'sm_herramientas',
    MODELS: 'sm_modelados',
    get(key)       { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } },
    save(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
};

let tools  = DB.get(DB.TOOLS);
let models = DB.get(DB.MODELS);

// ── Init ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    renderHerramientasTable();
    renderModelsGrid();
    renderRecentDash();
});

// ── Navigation ───────────────────────────────
const PAGE_META = {
    dashboard:    ['Dashboard',              'Bienvenido al panel de control'],
    herramientas: ['Gestión de Herramientas','Administra el catálogo público'],
    modelados:    ['Modelados 3D',           'Gestiona los modelos para AR'],
};

function nav(id) {
    document.querySelectorAll('.sec').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sb-link').forEach(l => l.classList.remove('active'));

    const sec = document.getElementById('sec-' + id);
    if (sec) sec.classList.add('active');

    document.querySelectorAll(`.sb-link[data-section="${id}"]`)
            .forEach(l => l.classList.add('active'));

    const [title, sub] = PAGE_META[id] || ['Panel', ''];
    document.getElementById('page-title').textContent = title;
    document.getElementById('page-sub').textContent   = sub;

    // close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
}

// ── Tabs ─────────────────────────────────────
function switchTab(section, which) {
    // deactivate all tabs + panels in this section
    const sec = document.getElementById('sec-' + section);
    sec.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    sec.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

    document.getElementById(`tab-${section[0]}-${which}`)?.classList.add('active');
    document.getElementById(`panel-${section[0]}-${which}`)?.classList.add('active');
}

// ── Stats ─────────────────────────────────────
function updateStats() {
    const st = document.getElementById('s-tools');
    const sm = document.getElementById('s-models');
    if (st) st.textContent = tools.length;
    if (sm) sm.textContent = models.length;
}

// ── Toast ─────────────────────────────────────
function toast(msg, type = 'ok') {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const icons = {
        ok:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        err: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    };
    const t = Object.assign(document.createElement('div'), {
        className: `toast ${type}`,
        innerHTML: (icons[type] || icons.ok) + `<span>${esc(msg)}</span>`,
    });
    document.body.appendChild(t);
    setTimeout(() => {
        t.style.animation = 'toastOut .3s ease forwards';
        setTimeout(() => t.remove(), 300);
    }, 3000);
}

// ── Escape HTML ───────────────────────────────
function esc(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Category helpers ──────────────────────────
const CAT_LABEL = {
    fresado:'Fresado', torneado:'Torneado', taladrado:'Taladrado',
    roscado:'Roscado', medicion:'Medición', corte:'Corte',
    'maquina-cnc':'Máquina CNC', otro:'Otro',
};
const CAT_EMOJI = {
    fresado:'⚙️', torneado:'🔩', taladrado:'🔧',
    roscado:'🔗', medicion:'📏', corte:'✂️', otro:'🛠️',
};

// ════════════════════════════════════════════════
//  HERRAMIENTAS
// ════════════════════════════════════════════════

function saveHerramienta() {
    const nombre      = document.getElementById('h-nombre').value.trim();
    const categoria   = document.getElementById('h-categoria').value;
    const material    = document.getElementById('h-material').value.trim();
    const diametro    = document.getElementById('h-diametro').value.trim() || 'N/A';
    const descripcion = document.getElementById('h-descripcion').value.trim();
    const editId      = document.getElementById('h-edit-id').value;

    if (!nombre || !categoria || !descripcion) {
        toast('Completa los campos obligatorios', 'err'); return;
    }

    const modeloFile = document.getElementById('h-modelo').files[0];
    const imagenFile = document.getElementById('h-imagen').files[0];

    const base = {
        id:           editId ? Number(editId) : Date.now(),
        name:         nombre,
        category:     categoria,
        material:     material || 'N/A',
        diameter:     diametro,
        description:  descripcion,
        modeloNombre: modeloFile ? modeloFile.name : null,
        imagen:       null,
        badge:        null,
        specs:        { material: material || 'N/A', diameter: diametro },
        fecha:        new Date().toLocaleDateString('es-MX'),
    };

    // Si hay imagen, guardamos base64
    const finish = (item) => {
        if (editId) {
            const idx = tools.findIndex(t => t.id === Number(editId));
            if (idx !== -1) {
                // preserve image if no new one uploaded
                if (!imagenFile && tools[idx].imagen) item.imagen = tools[idx].imagen;
                tools[idx] = item;
            }
        } else {
            tools.push(item);
        }
        DB.save(DB.TOOLS, tools);
        updateStats();
        renderHerramientasTable();
        renderRecentDash();
        resetHForm();
        switchTab('herramientas', 'lista');
        toast(editId ? 'Herramienta actualizada ✓' : 'Herramienta guardada y visible en catálogo ✓');
    };

    if (imagenFile) {
        const reader = new FileReader();
        reader.onload = e => { base.imagen = e.target.result; finish(base); };
        reader.readAsDataURL(imagenFile);
    } else {
        finish(base);
    }
}

function resetHForm() {
    ['h-nombre','h-material','h-diametro','h-descripcion'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('h-categoria').value = '';
    document.getElementById('h-edit-id').value   = '';
    document.getElementById('h-form-title').textContent = 'Agregar nueva herramienta';
    clearDz('dz-h-img',  'prev-h-img',  'h-imagen');
    clearDz('dz-h-3d',   'prev-h-3d',   'h-modelo');
}

function editHerramienta(id) {
    const t = tools.find(x => x.id === id);
    if (!t) return;
    document.getElementById('h-nombre').value      = t.name;
    document.getElementById('h-categoria').value   = t.category;
    document.getElementById('h-material').value    = t.material !== 'N/A' ? t.material : '';
    document.getElementById('h-diametro').value    = t.diameter !== 'N/A' ? t.diameter : '';
    document.getElementById('h-descripcion').value = t.description;
    document.getElementById('h-edit-id').value     = t.id;
    document.getElementById('h-form-title').textContent = 'Editar herramienta';

    // Show current image if any
    if (t.imagen) {
        document.getElementById('prev-h-img').innerHTML =
            `<img src="${t.imagen}" class="dz-img-preview" alt="preview">`;
    }

    nav('herramientas');
    switchTab('herramientas', 'agregar');
}

function deleteHerramienta(id) {
    if (!confirm('¿Eliminar esta herramienta del catálogo?')) return;
    tools = tools.filter(t => t.id !== id);
    DB.save(DB.TOOLS, tools);
    updateStats();
    renderHerramientasTable();
    renderRecentDash();
    toast('Herramienta eliminada', 'err');
}

function cancelEdit(section) {
    if (section === 'herramientas') resetHForm();
    switchTab(section, 'lista');
}

function renderHerramientasTable() {
    const tbody  = document.getElementById('h-tbody');
    const search = (document.getElementById('h-search')?.value || '').toLowerCase();
    const cat    = document.getElementById('h-cat-filter')?.value || '';

    const list = tools.filter(t => {
        const matchQ   = !search || t.name.toLowerCase().includes(search) || (t.description||'').toLowerCase().includes(search);
        const matchCat = !cat    || t.category === cat;
        return matchQ && matchCat;
    });

    if (!list.length) {
        tbody.innerHTML = `
        <tr class="empty-row"><td colspan="7">
          <div class="empty-state-inline">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            <p>${search || cat ? 'Sin resultados para ese filtro' : 'Sin herramientas aún.'}</p>
            ${!search && !cat ? `<button class="btn-primary" style="font-size:13px" onclick="switchTab('herramientas','agregar')">+ Agregar primera herramienta</button>` : ''}
          </div>
        </td></tr>`;
        return;
    }

    tbody.innerHTML = list.map((t, i) => `
    <tr>
      <td style="font-size:11px;color:#9a9a94;font-family:'JetBrains Mono',monospace">#${String(i+1).padStart(3,'0')}</td>
      <td>
        <div class="t-tool-name">
          ${t.imagen
            ? `<img src="${t.imagen}" style="width:30px;height:30px;object-fit:cover;border-radius:6px;flex-shrink:0">`
            : `<div class="t-tool-ico">${CAT_EMOJI[t.category]||'🔧'}</div>`}
          ${esc(t.name)}
        </div>
      </td>
      <td><span class="t-cat">${esc(CAT_LABEL[t.category]||t.category)}</span></td>
      <td style="font-size:13px;color:#666660">${esc(t.material)}</td>
      <td><span class="t-desc" title="${esc(t.description)}">${esc(t.description)}</span></td>
      <td>
        ${t.modeloNombre
          ? `<span class="badge-3d yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>${esc(t.modeloNombre.length>18?t.modeloNombre.slice(0,15)+'…':t.modeloNombre)}</span>`
          : `<span class="badge-3d no">Sin modelo</span>`}
      </td>
      <td>
        <div class="action-btns">
          <button class="act-btn edit" title="Editar" onclick="editHerramienta(${t.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="act-btn del" title="Eliminar" onclick="deleteHerramienta(${t.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`).join('');
}

// ════════════════════════════════════════════════
//  MODELADOS 3D
// ════════════════════════════════════════════════

function saveModelado() {
    const nombre      = document.getElementById('m-nombre').value.trim();
    const categoria   = document.getElementById('m-categoria').value;
    const descripcion = document.getElementById('m-descripcion').value.trim();
    const escala      = document.getElementById('m-escala').value;
    const ar          = document.getElementById('m-ar').value === 'si';
    const modeloFile  = document.getElementById('m-modelo').files[0];
    const thumbFile   = document.getElementById('m-thumb').files[0];

    if (!nombre || !categoria || !descripcion) {
        toast('Completa los campos obligatorios', 'err'); return;
    }
    if (!modeloFile) {
        toast('Debes subir un archivo 3D', 'err'); return;
    }

    const item = {
        id:           Date.now(),
        nombre, categoria, descripcion, escala, ar,
        modeloNombre: modeloFile.name,
        thumb:        null,
        fecha:        new Date().toLocaleDateString('es-MX'),
    };

    const finish = (m) => {
        models.push(m);
        DB.save(DB.MODELS, models);
        updateStats();
        renderModelsGrid();
        resetMForm();
        switchTab('modelados', 'lista');
        toast('Modelado publicado ✓');
    };

    if (thumbFile) {
        const reader = new FileReader();
        reader.onload = e => { item.thumb = e.target.result; finish(item); };
        reader.readAsDataURL(thumbFile);
    } else {
        finish(item);
    }
}

function deleteModelado(id) {
    if (!confirm('¿Eliminar este modelado?')) return;
    models = models.filter(m => m.id !== id);
    DB.save(DB.MODELS, models);
    updateStats();
    renderModelsGrid();
    toast('Modelado eliminado', 'err');
}

function resetMForm() {
    ['m-nombre','m-descripcion'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('m-categoria').value = '';
    clearDz('dz-m-3d',  'prev-m-3d',  'm-modelo');
    clearDz('dz-m-img', 'prev-m-img', 'm-thumb');
}

function renderModelsGrid() {
    const grid = document.getElementById('m-grid');
    if (!grid) return;

    if (!models.length) {
        grid.innerHTML = `
        <div class="empty-card" id="m-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          <h4>Sin modelados aún</h4>
          <p>Sube tu primer modelo 3D</p>
          <button class="btn-primary" onclick="switchTab('modelados','agregar')">+ Subir modelo</button>
        </div>`;
        return;
    }

    grid.innerHTML = models.map(m => `
    <div class="model-card">
      <div class="model-thumb">
        ${m.thumb
          ? `<img src="${m.thumb}" alt="${esc(m.nombre)}">`
          : `<div class="model-thumb-ph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div>`}
        ${m.ar ? '<span class="ar-badge">AR</span>' : ''}
      </div>
      <div class="model-body">
        <h4>${esc(m.nombre)}</h4>
        <p class="model-cat">${esc(CAT_LABEL[m.categoria]||m.categoria)} · ${esc(m.escala)}</p>
        <p class="model-desc">${esc(m.descripcion)}</p>
        <p style="font-size:11px;color:#9a9a94;font-family:'JetBrains Mono',monospace;margin-top:4px">${esc(m.modeloNombre)}</p>
      </div>
      <div class="model-foot">
        <button class="model-btn danger" onclick="deleteModelado(${m.id})">Eliminar</button>
      </div>
    </div>`).join('');
}

// ── Dashboard recent ─────────────────────────
function renderRecentDash() {
    const tbody = document.getElementById('recent-tbody');
    if (!tbody) return;
    const recent = [...tools].reverse().slice(0, 6);
    if (!recent.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-td-simple">Sin herramientas aún</td></tr>';
        return;
    }
    tbody.innerHTML = recent.map(t => `
    <tr>
      <td><strong>${esc(t.name)}</strong></td>
      <td><span class="t-cat">${esc(CAT_LABEL[t.category]||t.category)}</span></td>
      <td style="color:#9a9a94;font-size:12px">${esc(t.fecha||'—')}</td>
      <td>${t.modeloNombre
        ? '<span style="font-size:11px;color:#2e7d32;font-weight:700">✓ Sí</span>'
        : '<span style="font-size:11px;color:#9a9a94">—</span>'}</td>
    </tr>`).join('');
}

// ════════════════════════════════════════════════
//  DROPZONE
// ════════════════════════════════════════════════
function dzOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('over');
}
function dzLeave(e, zoneId) {
    document.getElementById(zoneId)?.classList.remove('over');
}
function dzDrop(e, inputId, zoneId, prevId, isImage) {
    e.preventDefault();
    dzLeave(e, zoneId);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const input = document.getElementById(inputId);
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    isImage ? dzPreviewImg(input, prevId, zoneId) : dzPreviewFile(input, prevId, zoneId);
}

function dzPreviewFile(input, prevId, zoneId) {
    const prev = document.getElementById(prevId);
    if (!prev || !input.files[0]) return;
    const f = input.files[0];
    prev.innerHTML = `<div class="dz-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>${esc(f.name)} · ${(f.size/1024).toFixed(0)} KB</div>`;
    document.getElementById(zoneId)?.classList.add('over');
}

function dzPreviewImg(input, prevId, zoneId) {
    const prev = document.getElementById(prevId);
    if (!prev || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = e => {
        prev.innerHTML = `<img src="${e.target.result}" class="dz-img-preview" alt="preview">`;
        document.getElementById(zoneId)?.classList.add('over');
    };
    reader.readAsDataURL(input.files[0]);
}

function clearDz(zoneId, prevId, inputId) {
    document.getElementById(prevId).innerHTML = '';
    document.getElementById(zoneId)?.classList.remove('over');
    document.getElementById(inputId).value = '';
}

// ── Logout ────────────────────────────────────
function logout() {
    if (confirm('¿Cerrar sesión?')) {
        sessionStorage.removeItem('sm_admin');
        window.location.href = 'admin-login.html';
    }
}

// expose globals
window.nav = nav;
window.switchTab = switchTab;
window.saveHerramienta = saveHerramienta;
window.editHerramienta = editHerramienta;
window.deleteHerramienta = deleteHerramienta;
window.cancelEdit = cancelEdit;
window.renderHerramientasTable = renderHerramientasTable;
window.saveModelado = saveModelado;
window.deleteModelado = deleteModelado;
window.logout = logout;
window.dzOver = dzOver;
window.dzLeave = dzLeave;
window.dzDrop = dzDrop;
window.dzPreviewFile = dzPreviewFile;
window.dzPreviewImg = dzPreviewImg;
