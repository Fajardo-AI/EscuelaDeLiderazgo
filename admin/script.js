

// ============================================================
// SECCIóN: PREGUNTAS (FORO / óGORA)
// ============================================================
async function loadPreguntas() {
    try {
        const { data, error } = await supabaseClient
            .from('preguntas_foro')
            .select('*, modulos(nombre)')
            .order('id', { ascending: false });
        if (error) throw error;
        preguntasForo = data || [];
        renderPreguntasTable();
    } catch (err) {
        showToast('Error cargando preguntas: ' + err.message, 'error');
    }
}

function setupPreguntaForm() {
    const form = document.getElementById('pregunta-form');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-pregunta');
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        btn.disabled = true;

        const id_modulo = document.getElementById('preg-modulo').value;
        const tipo = document.getElementById('preg-tipo').value;
        const pregunta = document.getElementById('preg-texto').value.trim();

        try {
            const { error } = await supabaseClient.from('preguntas_foro').insert([{
                id_modulo, tipo, pregunta, activa: true
            }]);
            if (error) throw error;
            showToast('Pregunta guardada', 'success');
            e.target.reset();
            await loadPreguntas();
        } catch (err) {
            showToast('Error: ' + err.message, 'error');
        } finally {
            btn.innerHTML = orig;
            btn.disabled = false;
        }
    });
}

function renderPreguntasTable() {
    const tbody = document.getElementById('preguntas-tbody');
    if (!tbody) return;
    const filterId = document.getElementById('filter-preg-modulo')?.value || 'all';

    let filtrados = preguntasForo;
    if (filterId !== 'all') filtrados = filtrados.filter(p => String(p.id_modulo) === filterId);

    if (filtrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="px-4 py-8 text-center text-gray-400 text-xs">No hay preguntas registradas.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    filtrados.forEach(p => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 transition';
        const modName = p.modulos?.nombre || 'General';
        const tipoBadge = p.tipo === 'nube' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700';
        tr.innerHTML = `
            <td class="px-4 py-3 align-top">
                <div class="font-bold text-xs text-gray-700">${modName}</div>
                <div class="inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-bold uppercase ${tipoBadge}">${p.tipo}</div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">${p.pregunta}</td>
            <td class="px-4 py-3 text-right align-top">
                <button onclick="eliminarPregunta(${p.id})" class="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition" title="Eliminar">
                    <i class="fa-solid fa-trash text-sm"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.eliminarPregunta = async function(id) {
    if (!confirm('óEliminar esta pregunta del foro?')) return;
    try {
        const { error } = await supabaseClient.from('preguntas_foro').delete().eq('id', id);
        if (error) throw error;
        showToast('Pregunta eliminada', 'success');
        await loadPreguntas();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
};


// ============================================================
// CONFIGURACIóN SUPABASE
// ============================================================
const SUPABASE_URL = 'https://daaiqgwumsswbknxdfeu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__L83VhIUpHNGakYyPSNWHA_R5nlmBFB';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// ESTADO GLOBAL
// ============================================================
let currentUser = null;
let modulos = [];
let pdfs = [];       // contenidos tipo 'pdf'
let multimedia = []; // contenidos tipo 'video' o 'podcast'
let preguntasForo = []; // DDBB preguntas

// ============================================================
// UTILIDADES
// ============================================================
async function hashConSHA256(texto) {
    return CryptoJS.SHA256(texto).toString();
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toast-icon');
    const msg = document.getElementById('toast-msg');
    toast.className = `toast-notify ${type}`;
    msg.textContent = message;
    icon.className = type === 'success'
        ? 'fa-solid fa-check-circle text-yellow-400'
        : type === 'error'
            ? 'fa-solid fa-triangle-exclamation'
            : 'fa-solid fa-info-circle text-blue-300';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
}

function formatDate(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ============================================================
// MODALES
// ============================================================
window.openModal = function (id) {
    document.getElementById(id).classList.add('open');
};
window.closeModal = function (id) {
    document.getElementById(id).classList.remove('open');
};

// ============================================================
// ARRANQUE
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuthSession();
    setupNavigation();
    setupPdfForm();
    setupContenidoForm();
    setupModuloForm();
    setupPreguntaForm();
    setupEditPdfForm();
});

// ============================================================
// AUTENTICACIóN
// ============================================================
function checkAuthSession() {
    const saved = localStorage.getItem('vyd_user');
    if (saved) {
        currentUser = JSON.parse(saved);
        if (currentUser.rol !== 'admin') {
            window.location.href = '../index.html';
            return;
        }
        document.getElementById('current-username').textContent = currentUser.nombre || currentUser.whatsapp || 'Admin';
        showDashboard();
    } else {
        window.location.href = '../index.html';
    }
}

// Inicializar logout al no usar las otras formas
setupAuthForms();

function setupAuthForms() {
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('vyd_user');
        currentUser = null;
        window.location.href = '../index.html';
    });
}

window.switchAuthTab = function() {};

function showDashboard() {
    const app = document.getElementById('app-container');
    app.classList.remove('hidden');
    app.style.display = 'flex';
    loadAll();
}

// ============================================================
// NAVEGACIóN
// ============================================================
function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Limpiar todos
            navBtns.forEach(b => {
                b.classList.remove('active-nav', 'text-critico');
                b.classList.add('text-gray-500');
            });
            sections.forEach(s => s.classList.remove('active'));

            // Activar
            btn.classList.add('active-nav', 'text-critico');
            btn.classList.remove('text-gray-500');
            const target = btn.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
        });
    });
}

// ============================================================
// CARGA DE DATOS
// ============================================================
async function loadAll() {
    await loadModulos();
    await loadPreguntas();
    await Promise.all([loadPdfs(), loadContenidos()]);
    updateStats();
}

async function loadModulos() {
    try {
        const { data, error } = await supabaseClient
            .from('modulos')
            .select('*')
            .order('nombre');
        if (error) throw error;
        modulos = data || [];
        renderModulosTable();
        populateModuloSelects();
    } catch (err) {
        showToast('Error cargando módulos: ' + err.message, 'error');
    }
}

async function loadPdfs() {
    try {
        const { data, error } = await supabaseClient
            .from('contenidos')
            .select('*, modulos(nombre)')
            .eq('tipo', 'pdf')
            .order('fecha_subida', { ascending: false });
        if (error) throw error;
        pdfs = data || [];
        renderPdfTable();
    } catch (err) {
        showToast('Error cargando PDFs: ' + err.message, 'error');
    }
}

async function loadContenidos() {
    try {
        const { data, error } = await supabaseClient
            .from('contenidos')
            .select('*, modulos(nombre)')
            .in('tipo', ['video', 'podcast'])
            .order('fecha_subida', { ascending: false });
        if (error) throw error;
        multimedia = data || [];
        renderContenidosTable();
    } catch (err) {
        showToast('Error cargando multimedia: ' + err.message, 'error');
    }
}

function updateStats() {
    document.getElementById('total-pdfs').textContent = pdfs.length;
    document.getElementById('total-modulos').textContent = modulos.length;
    const videos = multimedia.filter(c => c.tipo === 'video');
    const podcasts = multimedia.filter(c => c.tipo === 'podcast');
    document.getElementById('total-videos').textContent = videos.length;
    document.getElementById('total-podcasts').textContent = podcasts.length;
}

function populateModuloSelects() {
    const ids = ['pdf-modulo', 'cont-modulo', 'edit-pdf-modulo', 'filter-pdf-modulo', 'preg-modulo', 'filter-preg-modulo'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const isFilter = id === 'filter-pdf-modulo';
        el.innerHTML = isFilter
            ? '<option value="all">Todos</option>'
            : '<option value="">Selecciona módulo...</option>';
        modulos.forEach(m => {
            el.innerHTML += `<option value="${m.id}">${m.nombre}</option>`;
        });
    });

    const filterPreg = document.getElementById('filter-preg-modulo');
    if (filterPreg) filterPreg.addEventListener('change', renderPreguntasTable);

    // Listener del filtro
    const filterEl = document.getElementById('filter-pdf-modulo');
    if (filterEl) filterEl.addEventListener('change', renderPdfTable);

    const searchEl = document.getElementById('search-pdf');
    if (searchEl) searchEl.addEventListener('input', renderPdfTable);

    const searchCont = document.getElementById('search-contenido');
    if (searchCont) searchCont.addEventListener('input', renderContenidosTable);
}

// ============================================================
// SECCIóN: BIBLIOTECA PDFs
// ============================================================

// -- Subir PDF --
function setupPdfForm() {
    const fileInput = document.getElementById('pdf-file');
    const dropZone = document.getElementById('drop-zone');

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            dropZone.querySelector('.file-label').textContent = fileInput.files[0].name;
            dropZone.classList.add('border-critico', 'bg-red-50');
        } else {
            dropZone.querySelector('.file-label').textContent = 'Arrastra el PDF aquó o haz clic';
            dropZone.classList.remove('border-critico', 'bg-red-50');
        }
    });

    // Drag and drop visual
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); });

    document.getElementById('pdf-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-subir-pdf');
        const origText = btn.innerHTML;
        btn.disabled = true;

        const titulo = document.getElementById('pdf-titulo').value.trim();
        const desc = document.getElementById('pdf-desc').value.trim();
        const id_modulo = document.getElementById('pdf-modulo').value;
        const file = document.getElementById('pdf-file').files[0];

        if (!file) { showToast('Selecciona un archivo PDF', 'error'); btn.disabled = false; return; }

        try {
            // 1. Subir a Supabase Storage
            btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up fa-bounce mr-2"></i>Subiendo PDF...';
            const wrap = document.getElementById('upload-progress-wrap');
            wrap.classList.remove('hidden');
            simulateProgress();

            const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
            const { error: uploadErr } = await supabaseClient.storage
                .from('Biblioteca')
                .upload(fileName, file, { contentType: 'application/pdf', upsert: false });

            if (uploadErr) throw new Error('Error al subir archivo: ' + uploadErr.message);

            // 2. Obtener URL póblica
            const { data: urlData } = supabaseClient.storage.from('Biblioteca').getPublicUrl(fileName);
            const urlFinal = urlData.publicUrl;

            // 3. Insertar en BD
            btn.innerHTML = '<i class="fa-solid fa-database mr-2"></i>Guardando en BD...';
            const { error: dbErr } = await supabaseClient.from('contenidos').insert([{
                titulo,
                descripcion: desc,
                tipo: 'pdf',
                url: urlFinal,
                id_modulo: id_modulo || null,
                fecha_subida: new Date().toISOString()
            }]);

            if (dbErr) throw new Error('Error en BD: ' + dbErr.message);

            showToast(`? "${titulo}" subido a la Biblioteca`, 'success');
            e.target.reset();
            dropZone.querySelector('.file-label').textContent = 'Arrastra el PDF aquó o haz clic';
            dropZone.classList.remove('border-critico', 'bg-red-50');
            wrap.classList.add('hidden');
            await loadPdfs();
            updateStats();

        } catch (err) {
            showToast(err.message, 'error');
            document.getElementById('upload-progress-wrap').classList.add('hidden');
        } finally {
            btn.innerHTML = origText;
            btn.disabled = false;
        }
    });
}

function simulateProgress() {
    const bar = document.getElementById('upload-bar');
    const pct = document.getElementById('upload-pct');
    let val = 0;
    const interval = setInterval(() => {
        val = Math.min(val + Math.random() * 15, 90);
        bar.style.width = val + '%';
        pct.textContent = Math.round(val) + '%';
        if (val >= 90) clearInterval(interval);
    }, 300);
}

// -- Renderizar tabla PDFs --
function renderPdfTable() {
    const tbody = document.getElementById('pdf-tbody');
    const searchQ = (document.getElementById('search-pdf')?.value || '').toLowerCase().trim();
    const filterId = document.getElementById('filter-pdf-modulo')?.value || 'all';

    let filtrados = pdfs;
    if (filterId !== 'all') filtrados = filtrados.filter(p => String(p.id_modulo) === filterId);
    if (searchQ) {
        filtrados = filtrados.filter(p =>
            p.titulo.toLowerCase().includes(searchQ) ||
            (p.descripcion && p.descripcion.toLowerCase().includes(searchQ))
        );
    }

    const count = document.getElementById('pdf-count');
    if (count) count.textContent = `${filtrados.length} documento(s) encontrado(s)`;

    if (filtrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-4 py-10 text-center text-gray-400 text-xs">No se encontraron PDFs.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    filtrados.forEach(pdf => {
        const modNombre = pdf.modulos?.nombre || 'ó';
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 transition group';
        tr.innerHTML = `
            <td class="px-4 py-3">
                <div class="flex items-start gap-2">
                    <i class="fa-solid fa-file-pdf text-red-500 text-lg mt-0.5 shrink-0"></i>
                    <div>
                        <p class="font-bold text-sm text-gray-800 leading-tight">${pdf.titulo}</p>
                        <p class="text-[11px] text-gray-400 mt-0.5 line-clamp-1">${pdf.descripcion || 'ó'}</p>
                    </div>
                </div>
            </td>
            <td class="px-4 py-3 text-xs text-gray-600 hidden sm:table-cell">
                <span class="bg-red-50 text-red-700 px-2 py-0.5 rounded font-medium">${modNombre}</span>
            </td>
            <td class="px-4 py-3 text-xs text-gray-400 hidden md:table-cell">${formatDate(pdf.fecha_subida)}</td>
            <td class="px-4 py-3">
                <div class="flex justify-end gap-1">
                    <a href="${pdf.url}" target="_blank"
                        class="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition" title="Ver PDF">
                        <i class="fa-solid fa-eye text-sm"></i>
                    </a>
                    <button onclick="abrirEditPdf(${pdf.id})"
                        class="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Editar">
                        <i class="fa-solid fa-pen text-sm"></i>
                    </button>
                    <button onclick="eliminarPdf(${pdf.id})"
                        class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Eliminar">
                        <i class="fa-solid fa-trash text-sm"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// -- Editar PDF --
window.abrirEditPdf = function (id) {
    const pdf = pdfs.find(p => p.id === id);
    if (!pdf) return;
    document.getElementById('edit-pdf-id').value = pdf.id;
    document.getElementById('edit-pdf-titulo').value = pdf.titulo;
    document.getElementById('edit-pdf-desc').value = pdf.descripcion || '';

    // Poblar select de módulos en el modal
    const sel = document.getElementById('edit-pdf-modulo');
    sel.innerHTML = '<option value="">Sin módulo</option>';
    modulos.forEach(m => {
        sel.innerHTML += `<option value="${m.id}" ${m.id == pdf.id_modulo ? 'selected' : ''}>${m.nombre}</option>`;
    });

    openModal('modal-edit-pdf');
};

function setupEditPdfForm() {
    document.getElementById('edit-pdf-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-edit-pdf');
        const origText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        btn.disabled = true;

        const id = document.getElementById('edit-pdf-id').value;
        const titulo = document.getElementById('edit-pdf-titulo').value.trim();
        const descripcion = document.getElementById('edit-pdf-desc').value.trim();
        const id_modulo = document.getElementById('edit-pdf-modulo').value || null;

        try {
            const { error } = await supabaseClient
                .from('contenidos')
                .update({ titulo, descripcion, id_modulo })
                .eq('id', id);

            if (error) throw error;

            showToast('PDF actualizado correctamente', 'success');
            closeModal('modal-edit-pdf');
            await loadPdfs();
            updateStats();
        } catch (err) {
            showToast('Error al actualizar: ' + err.message, 'error');
        } finally {
            btn.innerHTML = origText;
            btn.disabled = false;
        }
    });
}

// -- Eliminar PDF --
window.eliminarPdf = async function (id) {
    if (!confirm('óSeguro que quieres eliminar este PDF de la Biblioteca?')) return;
    try {
        const { error } = await supabaseClient.from('contenidos').delete().eq('id', id);
        if (error) throw error;
        showToast('PDF eliminado de la Biblioteca', 'success');
        await loadPdfs();
        updateStats();
    } catch (err) {
        showToast('Error al eliminar: ' + err.message, 'error');
    }
};

// ============================================================
// SECCIóN: MóDULOS
// ============================================================
function setupModuloForm() {
    document.getElementById('modulo-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        btn.disabled = true;

        const nombre = document.getElementById('mod-nombre').value.trim();
        const descripcion = document.getElementById('mod-desc').value.trim();

        try {
            const { error } = await supabaseClient.from('modulos').insert([{ nombre, descripcion }]);
            if (error) throw error;
            showToast('Módulo creado', 'success');
            e.target.reset();
            await loadModulos();
        } catch (err) {
            showToast('Error: ' + err.message, 'error');
        } finally {
            btn.innerHTML = orig;
            btn.disabled = false;
        }
    });
}

function renderModulosTable() {
    const tbody = document.querySelector('#modulos-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (modulos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-4 py-8 text-center text-gray-400 text-xs">No hay módulos creados.</td></tr>';
        return;
    }

    modulos.forEach(m => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 transition';
        tr.innerHTML = `
            <td class="px-4 py-3 text-xs font-mono text-gray-400">#${m.id}</td>
            <td class="px-4 py-3 font-bold text-sm">${m.nombre}</td>
            <td class="px-4 py-3 text-xs text-gray-500">${m.descripcion || 'ó'}</td>
            <td class="px-4 py-3 text-right">
                <button onclick="eliminarModulo(${m.id})" class="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition" title="Eliminar">
                    <i class="fa-solid fa-trash text-sm"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.eliminarModulo = async function (id) {
    if (!confirm('óEliminar este módulo? Los contenidos asociados quedarón sin módulo.')) return;
    try {
        const { error } = await supabaseClient.from('modulos').delete().eq('id', id);
        if (error) throw error;
        showToast('Módulo eliminado', 'success');
        await loadAll();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
};

// ============================================================
// SECCIóN: VIDEO / PODCAST
// ============================================================
function setupContenidoForm() {
    document.getElementById('contenido-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-content');
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        btn.disabled = true;

        const tipo = document.querySelector('input[name="cont-tipo"]:checked')?.value || 'video';
        const titulo = document.getElementById('cont-titulo').value.trim();
        const descripcion = document.getElementById('cont-desc').value.trim();
        const id_modulo = document.getElementById('cont-modulo').value || null;
        const url = document.getElementById('cont-url').value.trim();

        try {
            const { error } = await supabaseClient.from('contenidos').insert([{
                titulo, descripcion, tipo, url, id_modulo,
                fecha_subida: new Date().toISOString()
            }]);
            if (error) throw error;
            showToast('Contenido guardado', 'success');
            e.target.reset();
            await loadContenidos();
            updateStats();
        } catch (err) {
            showToast('Error: ' + err.message, 'error');
        } finally {
            btn.innerHTML = orig;
            btn.disabled = false;
        }
    });
}

function renderContenidosTable() {
    const tbody = document.getElementById('contenidos-tbody');
    const searchQ = (document.getElementById('search-contenido')?.value || '').toLowerCase();

    let filtrados = multimedia;
    if (searchQ) filtrados = filtrados.filter(c => c.titulo.toLowerCase().includes(searchQ));

    if (filtrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-4 py-8 text-center text-gray-400 text-xs">No hay contenido multimedia.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    filtrados.forEach(cont => {
        const modNombre = cont.modulos?.nombre || 'ó';
        const isVideo = cont.tipo === 'video';
        const badge = isVideo
            ? 'bg-purple-100 text-purple-700'
            : 'bg-blue-100 text-blue-700';
        const icon = isVideo ? 'fa-video' : 'fa-podcast';

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 transition';
        tr.innerHTML = `
            <td class="px-4 py-3">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badge}">
                    <i class="fa-solid ${icon}"></i> ${cont.tipo}
                </span>
            </td>
            <td class="px-4 py-3">
                <p class="font-bold text-sm text-gray-800 leading-tight">${cont.titulo}</p>
                <p class="text-[11px] text-gray-400">${cont.descripcion ? cont.descripcion.substring(0,50)+'...' : ''}</p>
            </td>
            <td class="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">${modNombre}</td>
            <td class="px-4 py-3">
                <div class="flex justify-end gap-1">
                    <a href="${cont.url}" target="_blank"
                        class="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition" title="Ver">
                        <i class="fa-solid fa-external-link-alt text-sm"></i>
                    </a>
                    <button onclick="eliminarContenido(${cont.id})"
                        class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Eliminar">
                        <i class="fa-solid fa-trash text-sm"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.eliminarContenido = async function (id) {
    if (!confirm('óEliminar este contenido multimedia?')) return;
    try {
        const { error } = await supabaseClient.from('contenidos').delete().eq('id', id);
        if (error) throw error;
        showToast('Contenido eliminado', 'success');
        await loadContenidos();
        updateStats();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
};
// ============================================================
// MODERACION: Resenas, Nube de Palabras, Propuestas del Muro
// ============================================================

window.switchModTab = function(tabId) {
    var tabs = ['mod-preguntas', 'mod-resenas', 'mod-nube', 'mod-propuestas'];
    var btns = ['tab-preguntas', 'tab-resenas', 'tab-nube', 'tab-propuestas'];
    tabs.forEach(function(t) {
        var el = document.getElementById(t);
        if (el) el.classList.toggle('hidden', t !== tabId);
    });
    btns.forEach(function(b) {
        var btn = document.getElementById(b);
        if (!btn) return;
        var isActive = ('tab-' + tabId.replace('mod-', '')) === b;
        btn.classList.toggle('text-critico', isActive);
        btn.classList.toggle('border-critico', isActive);
        btn.classList.toggle('text-gray-400', !isActive);
        btn.classList.toggle('border-transparent', !isActive);
    });
    if (tabId === 'mod-resenas') loadResenas();
    if (tabId === 'mod-nube') loadNubeAdmin();
    if (tabId === 'mod-propuestas') loadPropuestasAdmin();
};

window.loadResenas = async function() {
    var container = document.getElementById('resenas-container');
    container.innerHTML = '<div class="p-6 text-center text-gray-400 text-xs"><i class="fa-solid fa-circle-notch fa-spin mr-1"></i> Cargando...</div>';
    try {
        var res = await supabaseClient.from('resenas').select('*').order('fecha', { ascending: false });
        if (res.error) throw res.error;
        if (!res.data || res.data.length === 0) {
            container.innerHTML = '<div class="p-8 text-center text-gray-400 text-sm"><i class="fa-solid fa-comment-slash text-3xl mb-2 block"></i>No hay resenas registradas aun.</div>';
            return;
        }
        container.innerHTML = '';
        res.data.forEach(function(r) {
            var fecha = new Date(r.fecha).toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' });
            var div = document.createElement('div');
            div.className = 'p-4 hover:bg-gray-50 transition border-b';
            div.innerHTML = '<div class="flex justify-between items-start gap-3">' +
                '<div class="flex-1">' +
                '<div class="flex items-center gap-2 mb-1">' +
                '<span class="text-[10px] font-bold uppercase bg-red-50 text-red-700 px-2 py-0.5 rounded">' + (r.recurso_titulo || 'Sin titulo') + '</span>' +
                '<span class="text-[10px] text-gray-400">' + fecha + '</span>' +
                '</div>' +
                '<p class="text-sm text-gray-700 italic border-l-2 border-green-400 pl-2 mt-1">"' + r.texto + '"</p>' +
                '</div>' +
                '<button onclick="eliminarResena(' + r.id + ')" class="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition shrink-0"><i class="fa-solid fa-trash text-sm"></i></button>' +
                '</div>';
            container.appendChild(div);
        });
    } catch(err) {
        container.innerHTML = '<div class="p-6 text-center text-red-400 text-xs">Error: ' + err.message + '</div>';
    }
};

window.eliminarResena = async function(id) {
    if (!confirm('Eliminar esta resena?')) return;
    try {
        var res = await supabaseClient.from('resenas').delete().eq('id', id);
        if (res.error) throw res.error;
        showToast('Resena eliminada', 'success');
        loadResenas();
    } catch(err) { showToast('Error: ' + err.message, 'error'); }
};

window.loadNubeAdmin = async function() {
    var preview = document.getElementById('nube-admin-preview');
    preview.innerHTML = '<span class="text-gray-300 text-xs">Cargando...</span>';
    try {
        var res = await supabaseClient.from('nube_palabras').select('*').order('fecha', { ascending: true });
        if (res.error) throw res.error;
        if (!res.data || res.data.length === 0) {
            preview.innerHTML = '<span class="text-gray-400 text-sm italic">La nube esta vacia.</span>';
            return;
        }
        preview.innerHTML = '';
        res.data.forEach(function(row) {
            var size = Math.floor(Math.random() * 14 + 12);
            var span = document.createElement('span');
            span.className = 'inline-flex items-center gap-1 mx-1 my-0.5 bg-red-50 text-red-800 font-medium px-2 py-0.5 rounded-full text-sm';
            span.innerHTML = row.palabra + '<button onclick="eliminarPalabra(' + row.id + ', this)" class="text-red-300 hover:text-red-600 text-xs ml-1"><i class="fa-solid fa-xmark"></i></button>';
            preview.appendChild(span);
        });
        var count = document.createElement('p');
        count.className = 'text-xs text-gray-400 mt-3 pt-2 border-t';
        count.innerHTML = '<i class="fa-solid fa-hashtag mr-1"></i>Total de palabras: <strong>' + res.data.length + '</strong>';
        preview.appendChild(count);
    } catch(err) {
        preview.innerHTML = '<span class="text-red-400 text-xs">Error: ' + err.message + '</span>';
    }
};

window.eliminarPalabra = async function(id, btn) {
    try {
        var res = await supabaseClient.from('nube_palabras').delete().eq('id', id);
        if (res.error) throw res.error;
        btn.closest('span').remove();
        showToast('Palabra eliminada', 'success');
    } catch(err) { showToast('Error: ' + err.message, 'error'); }
};

window.resetNube = async function() {
    if (!confirm('CONFIRMAS borrar TODAS las palabras de la nube? Esta accion no se puede deshacer.')) return;
    try {
        var res = await supabaseClient.from('nube_palabras').delete().gt('id', 0);
        if (res.error) throw res.error;
        showToast('Nube reseteada', 'success');
        loadNubeAdmin();
    } catch(err) { showToast('Error: ' + err.message, 'error'); }
};

window.loadPropuestasAdmin = async function() {
    var container = document.getElementById('propuestas-container');
    container.innerHTML = '<div class="p-6 text-center text-gray-400 text-xs"><i class="fa-solid fa-circle-notch fa-spin mr-1"></i> Cargando...</div>';
    try {
        var res = await supabaseClient.from('propuestas').select('*').order('fecha', { ascending: false });
        if (res.error) throw res.error;
        if (!res.data || res.data.length === 0) {
            container.innerHTML = '<div class="p-8 text-center text-gray-400 text-sm"><i class="fa-solid fa-comments text-3xl mb-2 block"></i>No hay propuestas aun.</div>';
            return;
        }
        container.innerHTML = '';
        res.data.forEach(function(prop) {
            var fecha = new Date(prop.fecha).toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' });
            var div = document.createElement('div');
            div.className = 'p-4 hover:bg-gray-50 transition border-b';
            div.innerHTML = '<div class="flex justify-between items-start gap-3">' +
                '<div class="flex-1">' +
                '<div class="flex items-center gap-2 mb-1">' +
                '<span class="text-[10px] font-bold uppercase bg-amber-50 text-amber-700 px-2 py-0.5 rounded">' + (prop.tipo || 'Propuesta') + '</span>' +
                '<span class="text-[10px] text-gray-400">' + fecha + '</span>' +
                '</div>' +
                '<p class="text-sm text-gray-700 italic border-l-2 border-amber-400 pl-2 mt-1">"' + prop.texto + '"</p>' +
                '</div>' +
                '<button onclick="eliminarPropuestaAdmin(' + prop.id + ')" class="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition shrink-0"><i class="fa-solid fa-trash text-sm"></i></button>' +
                '</div>';
            container.appendChild(div);
        });
    } catch(err) {
        container.innerHTML = '<div class="p-6 text-center text-red-400 text-xs">Error: ' + err.message + '</div>';
    }
};

window.eliminarPropuestaAdmin = async function(id) {
    if (!confirm('Eliminar esta propuesta del Muro Critico?')) return;
    try {
        var res = await supabaseClient.from('propuestas').delete().eq('id', id);
        if (res.error) throw res.error;
        showToast('Propuesta eliminada', 'success');
        loadPropuestasAdmin();
    } catch(err) { showToast('Error: ' + err.message, 'error'); }
};