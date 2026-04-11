
        // âââââââââââââââ SUPABASE âââââââââââââââ
        const SUPA_URL = 'https://daaiqgwumsswbknxdfeu.supabase.co';
        const SUPA_KEY = 'sb_publishable__L83VhIUpHNGakYyPSNWHA_R5nlmBFB';
        const db = window.supabase.createClient(SUPA_URL, SUPA_KEY);

        // âââââââââââââââ UTILIDADES âââââââââââââââ
        async function hashPassword(password) {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hash = await crypto.subtle.digest('SHA-256', data);
            return Array.from(new Uint8Array(hash))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        }

        // âââââââââââââââ TOAST âââââââââââââââ
        function mostrarToast(msg, isAuth = false) {
            const id = isAuth ? 'toast' : 'toast-app';
            const el = document.getElementById(id);
            if (!el) return;
            el.textContent = msg;
            el.classList.add('show');
            setTimeout(() => el.classList.remove('show'), 2800);
        }

        function showAlert(containerId, type, msg) {
            const el = document.getElementById(containerId);
            if (!el) return;
            el.innerHTML = `<div class="alert-box alert-${type}"><i class="fa-solid fa-${type === 'error' ? 'circle-exclamation' : 'circle-check'}"></i><span>${msg}</span></div>`;
        }

        function clearAlert(containerId) {
            const el = document.getElementById(containerId);
            if (el) el.innerHTML = '';
        }

        // âââââââââââââââ AUTH TABS âââââââââââââââ
        function switchTab(tab) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.form-section').forEach(f => f.classList.remove('active-form'));
            document.getElementById('tab-' + tab).classList.add('active');
            document.getElementById('form-' + tab).classList.add('active-form');
            clearAlert('login-alert');
            clearAlert('register-alert');
        }

        // âââââââââââââââ CIUDADES âââââââââââââââ
        const ciudadesPorDep = {
            'Antioquia': ['MedellÃ­n', 'Bello', 'ItagÃ¼Ã­', 'Envigado', 'Rionegro', 'ApartadÃ³', 'Turbo', 'Caucasia', 'Caldas', 'Sabaneta'],
            'BogotÃ¡ D.C.': ['BogotÃ¡'],
            'Valle del Cauca': ['Cali', 'Palmira', 'Buenaventura', 'TuluÃ¡', 'Cartago', 'Buga'],
            'AtlÃ¡ntico': ['Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga'],
            'Cundinamarca': ['Soacha', 'FusagasugÃ¡', 'Girardot', 'FacatativÃ¡', 'ZipaquirÃ¡', 'ChÃ­a'],
            'BolÃ­var': ['Cartagena', 'MaganguÃ©', 'El Carmen de BolÃ­var'],
            'Santander': ['Bucaramanga', 'Floridablanca', 'GirÃ³n', 'Piedecuesta', 'Barrancabermeja'],
            'CÃ³rdoba': ['MonterÃ­a', 'CeretÃ©', 'SahagÃºn', 'Lorica'],
            'NariÃ±o': ['Pasto', 'Tumaco', 'Ipiales', 'TÃºquerres'],
            'Norte de Santander': ['CÃºcuta', 'OcaÃ±a', 'Pamplona', 'Villa del Rosario'],
            'Tolima': ['IbaguÃ©', 'Espinal', 'Melgar', 'Honda'],
            'Huila': ['Neiva', 'Pitalito', 'GarzÃ³n', 'La Plata'],
            'Caldas': ['Manizales', 'La Dorada', 'Riosucio', 'ChinchinÃ¡'],
            'Risaralda': ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal'],
            'QuindÃ­o': ['Armenia', 'CalarcÃ¡', 'Montenegro'],
            'Meta': ['Villavicencio', 'AcacÃ­as', 'Granada'],
            'Casanare': ['Yopal', 'Aguazul', 'Villanueva'],
            'Cauca': ['PopayÃ¡n', 'Santander de Quilichao', 'Puerto Tejada'],
            'Cesar': ['Valledupar', 'Aguachica', 'Codazzi'],
            'La Guajira': ['Riohacha', 'Maicao', 'Uribia'],
            'Magdalena': ['Santa Marta', 'CiÃ©naga', 'FundaciÃ³n'],
            'Sucre': ['Sincelejo', 'Corozal', 'SampuÃ©s'],
            'BoyacÃ¡': ['Tunja', 'Duitama', 'Sogamoso', 'ChiquinquirÃ¡'],
            'Arauca': ['Arauca', 'Saravena', 'Tame'],
            'CaquetÃ¡': ['Florencia', 'San Vicente del CaguÃ¡n'],
            'Putumayo': ['Mocoa', 'Puerto AsÃ­s', 'Orito'],
            'ChocÃ³': ['QuibdÃ³', 'Istmina', 'Tumaco'],
            'Guaviare': ['San JosÃ© del Guaviare'],
            'Vichada': ['Puerto CarreÃ±o'],
            'GuainÃ­a': ['InÃ­rida'],
            'VaupÃ©s': ['MitÃº'],
            'Amazonas': ['Leticia', 'Puerto NariÃ±o'],
            'San AndrÃ©s y Providencia': ['San AndrÃ©s', 'Providencia']
        };

        function cargarCiudades() {
            const dep = document.getElementById('select-departamento').value;
            const datalist = document.getElementById('lista-ciudades');
            datalist.innerHTML = '';
            const ciudades = ciudadesPorDep[dep] || [];
            ciudades.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c;
                datalist.appendChild(opt);
            });
            document.getElementById('input-ciudad').value = '';
            document.getElementById('input-ciudad').placeholder = ciudades.length ? 'Escribe o elige...' : 'Escribe tu ciudad...';
        }

        // âââââââââââââââ LOGIN âââââââââââââââ
        async function iniciarSesion(event) {
            event.preventDefault();
            clearAlert('login-alert');
            const btn = document.getElementById('btn-login');
            const wpp = document.getElementById('log-whatsapp').value.trim().replace(/\s/g, '');
            const pwd = document.getElementById('log-password').value.trim();

            if (!wpp || !pwd) {
                showAlert('login-alert', 'error', 'Por favor completa todos los campos.');
                return;
            }

            btn.classList.add('loading');
            btn.disabled = true;

            try {
                const pwdHash = await hashPassword(pwd);

                const { data, error } = await db
                    .from('usuarios')
                    .select('id, nombre, rol, password')
                    .eq('whatsapp', wpp)
                    .single();

                if (error || !data) {
                    showAlert('login-alert', 'error', 'No encontramos una cuenta con ese WhatsApp. Â¿Ya te registraste?');
                    return;
                }

                if (data.password !== pwdHash) {
                    showAlert('login-alert', 'error', 'ContraseÃ±a incorrecta. Recuerda: aÃ±o de nacimiento + tu edad.');
                    return;
                }

                // Guardar sesiÃ³n
                localStorage.setItem('vyd_user', JSON.stringify({
                    id: data.id,
                    nombre: data.nombre,
                    rol: data.rol,
                    whatsapp: wpp
                }));

                mostrarToast(`Â¡Bienvenido/a, ${data.nombre.split(' ')[0]}! ð`, true);
                setTimeout(() => entrarApp(), 800);

            } catch (err) {
                showAlert('login-alert', 'error', 'Error de conexiÃ³n. Intenta de nuevo.');
                console.error(err);
            } finally {
                btn.classList.remove('loading');
                btn.disabled = false;
            }
        }

        // âââââââââââââââ REGISTRO âââââââââââââââ
        async function registrarVoluntario(event) {
            event.preventDefault();
            clearAlert('register-alert');

            const btn = document.getElementById('btn-register');
            const nombre = document.getElementById('reg-nombre').value.trim();
            const wpp = document.getElementById('reg-whatsapp').value.trim().replace(/\s/g, '');
            const edad = document.getElementById('reg-edad').value;
            const dep = document.getElementById('select-departamento').value;
            const ciudad = document.getElementById('input-ciudad').value.trim();
            const sector = document.getElementById('reg-sector').value.trim();
            const profesion = document.getElementById('reg-profesion').value.trim();
            const bandera = document.getElementById('reg-bandera').value;
            const tiempo = document.getElementById('reg-tiempo').value;
            const pwd = document.getElementById('reg-password').value.trim();
            const apoyo = document.querySelector('input[name="apoyo"]:checked')?.value;

            const areas = Array.from(document.querySelectorAll('.custom-checkbox:checked')).map(c => c.value);

            // Validaciones
            if (!nombre || !wpp || !edad || !dep || !ciudad || !sector || !profesion || !bandera || !tiempo || !pwd || !apoyo) {
                showAlert('register-alert', 'error', 'Por favor completa todos los campos obligatorios.');
                return;
            }
            if (areas.length === 0) {
                showAlert('register-alert', 'error', 'Selecciona al menos un Ã¡rea donde puedes aportar.');
                return;
            }
            if (wpp.length < 7) {
                showAlert('register-alert', 'error', 'El nÃºmero de WhatsApp no parece correcto.');
                return;
            }

            btn.classList.add('loading');
            btn.disabled = true;

            try {
                // Verificar si ya existe
                const { data: exists } = await db
                    .from('usuarios')
                    .select('id')
                    .eq('whatsapp', wpp)
                    .maybeSingle();

                if (exists) {
                    showAlert('register-alert', 'error', 'Ya existe una cuenta con ese nÃºmero. Usa "Iniciar SesiÃ³n".');
                    return;
                }

                const pwdHash = await hashPassword(pwd);

                const { data, error } = await db
                    .from('usuarios')
                    .insert([{
                        username: wpp, nombre, whatsapp: wpp, edad: parseInt(edad),
                        departamento: dep, ciudad, sector, profesion,
                        bandera, areas: areas, tiempo_disponible: tiempo,
                        firmeza_apoyo: parseInt(apoyo), password: pwdHash, rol: 'usuario'
                    }])
                    .select()
                    .single();

                if (error) throw error;

                localStorage.setItem('vyd_user', JSON.stringify({
                    id: data.id, nombre: data.nombre,
                    rol: data.rol, whatsapp: wpp
                }));

                mostrarToast(`Â¡Registro exitoso! Bienvenido/a ${nombre.split(' ')[0]} ð`, true);
                setTimeout(() => entrarApp(), 900);

            } catch (err) {
                showAlert('register-alert', 'error', 'Error al registrar: ' + (err.message || 'Intenta de nuevo.'));
                console.error(err);
            } finally {
                btn.classList.remove('loading');
                btn.disabled = false;
            }
        }

        // âââââââââââââââ ENTER/SALIR APP âââââââââââââââ
        function entrarApp() {
            document.getElementById('auth-screen').style.display = 'none';
            document.getElementById('app-screen').style.display = 'block';
            cargarBiblioteca();
            cargarDatosForo();
            cargarPropuestasMuro();
            actualizarContadorUI();
            initBot();
        }

        function cerrarSesion() {
            localStorage.removeItem('vyd_user');
            document.getElementById('auth-screen').style.display = 'flex';
            document.getElementById('app-screen').style.display = 'none';
        }

        // âââââââââââââââ AUTO-LOGIN âââââââââââââââ
        document.addEventListener('DOMContentLoaded', function () {
            const saved = localStorage.getItem('vyd_user');
            if (saved) {
                try {
                    const user = JSON.parse(saved);
                    if (user && user.id) {
                        entrarApp();
                        return;
                    }
                } catch (e) { localStorage.removeItem('vyd_user'); }
            }
        });

        // âââââââââââââââ APP FUNCTIONS âââââââââââââââ
        let bibPdfs = [];
        let resenasCompletadas = new Set();
        let contadorComentariosUsuario = 0;

        async function cargarBiblioteca() {
            const grid = document.getElementById('biblioteca-grid');
            grid.innerHTML = '<div style="text-align:center;padding:48px 0;color:#9ca3af;"><i class="fa-solid fa-circle-notch fa-spin" style="font-size:2rem;display:block;margin-bottom:8px;"></i><p style="font-size:13px;">Cargando biblioteca...</p></div>';
            try {
                const { data, error } = await db.from('contenidos').select('*, modulos(nombre)').order('fecha_subida', { ascending: false });
                if (error) throw error;
                bibPdfs = data || [];
                renderBiblioteca(bibPdfs);
                actualizarContadorResenas();
            } catch (err) {
                grid.innerHTML = '<div style="text-align:center;padding:32px 0;color:#9ca3af;font-size:13px;"><i class="fa-solid fa-triangle-exclamation" style="font-size:2rem;display:block;margin-bottom:8px;"></i>No se pudo cargar la biblioteca.</div>';
            }
        }

        function getEmbedUrl(url) {
            const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
            if (ytMatch) return 'https://www.youtube.com/embed/' + ytMatch[1];
            const vmMatch = url.match(/vimeo\.com\/(\d+)/);
            if (vmMatch) return 'https://player.vimeo.com/video/' + vmMatch[1];
            return null;
        }

        function renderBiblioteca(items) {
            const grid = document.getElementById('biblioteca-grid');
            const searchQ = (document.getElementById('bib-search')?.value || '').toLowerCase().trim();
            const filterType = document.getElementById('bib-filter')?.value || 'all';
            let filtrados = items;
            if (filterType !== 'all') filtrados = filtrados.filter(i => i.tipo === filterType);
            if (searchQ) filtrados = filtrados.filter(i =>
                i.titulo.toLowerCase().includes(searchQ) ||
                (i.descripcion && i.descripcion.toLowerCase().includes(searchQ))
            );
            if (filtrados.length === 0) {
                grid.innerHTML = '<div style="text-align:center;padding:40px 0;color:#9ca3af;font-size:13px;"><i class="fa-solid fa-book-open" style="font-size:2rem;display:block;margin-bottom:8px;"></i>No se encontraron contenidos.</div>';
                return;
            }
            grid.innerHTML = filtrados.map(function (item) {
                var modNombre = (item.modulos && item.modulos.nombre) ? item.modulos.nombre : 'Sin mÃ³dulo';
                var badgeColor = item.tipo === 'video' ? '#7c3aed' : item.tipo === 'podcast' ? '#2563eb' : 'var(--primary)';
                var badgeIcon = item.tipo === 'video' ? 'fa-video' : item.tipo === 'podcast' ? 'fa-podcast' : 'fa-file-pdf';
                var badgeLabel = item.tipo === 'video' ? 'Video' : item.tipo === 'podcast' ? 'Podcast' : 'PDF';
                var mediaHtml = '';
                if (item.tipo === 'video') {
                    var embedUrl = getEmbedUrl(item.url);
                    mediaHtml = embedUrl
                        ? '<div style="aspect-ratio:16/9;margin-top:12px;border-radius:8px;overflow:hidden;background:#e5e7eb;"><iframe src="' + embedUrl + '" style="width:100%;height:100%;" frameborder="0" allowfullscreen></iframe></div>'
                        : '<a href="' + item.url + '" target="_blank" style="margin-top:10px;display:inline-flex;align-items:center;gap:6px;color:#7c3aed;font-size:13px;font-weight:600;text-decoration:underline;"><i class="fa-solid fa-external-link-alt"></i>Ver video</a>';
                } else if (item.tipo === 'podcast') {
                    mediaHtml = '<a href="' + item.url + '" target="_blank" style="margin-top:10px;display:inline-flex;align-items:center;gap:6px;color:#2563eb;font-size:13px;font-weight:600;text-decoration:underline;"><i class="fa-solid fa-headphones"></i>Escuchar podcast</a>';
                } else {
                    mediaHtml = '<a href="' + item.url + '" target="_blank" style="margin-top:10px;display:inline-flex;align-items:center;gap:6px;color:var(--primary);font-size:13px;font-weight:600;text-decoration:underline;"><i class="fa-regular fa-file-pdf"></i>Abrir PDF</a>';
                }
                return '<div class="card-soberana" style="background:white;padding:16px;border-radius:10px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">' +
                    '<span style="font-size:10px;font-weight:700;text-transform:uppercase;background:' + badgeColor + '15;color:' + badgeColor + ';padding:3px 10px;border-radius:999px;"><i class="fa-solid ' + badgeIcon + ' mr-1"></i>' + modNombre + ' Â· ' + badgeLabel + '</span>' +
                    '<h3 style="font-size:15px;font-weight:700;margin-top:10px;line-height:1.3;">' + item.titulo + '</h3>' +
                    (item.descripcion ? '<p style="font-size:13px;color:#6b7280;margin-top:4px;">' + item.descripcion + '</p>' : '') +
                    mediaHtml +
                    '<div style="margin-top:12px;padding-top:12px;border-top:1px solid #f0f0f0;display:flex;flex-wrap:wrap;gap:8px;">' +
                    '<button onclick="toggleResenaForm(\'item-' + item.id + '\')" style="background:#f0fff4;color:#16a34a;font-size:12px;font-weight:600;border:1.5px solid #bbf7d0;border-radius:8px;padding:7px 14px;cursor:pointer;font-family:\'Inter\',sans-serif;display:inline-flex;align-items:center;gap:6px;"><i class="fa-regular fa-pen-to-square"></i>Dar mi reseña</button>' +
                    '<button onclick="verResenasLibro(\'item-' + item.id + '\', this)" style="background:#f3f4f6;color:#6b7280;font-size:12px;font-weight:600;border:1.5px solid #e5e7eb;border-radius:8px;padding:7px 14px;cursor:pointer;font-family:\'Inter\',sans-serif;display:inline-flex;align-items:center;gap:6px;"><i class="fa-regular fa-comments"></i>Ver reseñas</button>' +
                    '</div>' +
                    '<div id="resena-form-item-' + item.id + '" style="display:none;margin-top:12px;">' +
                    '<textarea id="resena-txt-item-' + item.id + '" data-titulo="' + item.titulo.replace(/'/g, "&#39;") + '" placeholder="Escribe tu reseña crítica (mínimo 20 caracteres)..." rows="3" style="width:100%;border:1.5px solid #d1d5db;border-radius:8px;padding:10px;font-size:13px;font-family:\'Inter\',sans-serif;outline:none;resize:vertical;transition:border-color 0.2s;box-sizing:border-box;"></textarea>' +
                    '<div style="display:flex;gap:8px;margin-top:8px;">' +
                    '<button onclick="enviarResenaLibro(\'item-' + item.id + '\')" style="background:#16a34a;color:white;padding:8px 16px;border-radius:8px;font-size:13px;border:none;cursor:pointer;font-weight:600;font-family:\'Inter\',sans-serif;">Enviar reseña</button>' +
                    '<button onclick="toggleResenaForm(\'item-' + item.id + '\', true)" style="background:#f3f4f6;color:#6b7280;padding:8px 12px;border-radius:8px;font-size:13px;border:none;cursor:pointer;font-family:\'Inter\',sans-serif;">Cancelar</button>' +
                    '</div></div>' +
                    '<div id="resenas-lista-item-' + item.id + '" style="display:none;margin-top:10px;"></div>' +
                    '</div></div>';
            }).join('');
        }

        document.addEventListener('DOMContentLoaded', function () {
            var si = document.getElementById('bib-search');
            var fi = document.getElementById('bib-filter');
            if (si) si.addEventListener('input', function () { renderBiblioteca(bibPdfs); });
            if (fi) fi.addEventListener('change', function () { renderBiblioteca(bibPdfs); });
        });

        function showTab(tabId) {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            if (tabId === 'biblioteca') cargarBiblioteca();
            actualizarContadorUI();
        }

        function descargarTexto(id, nombre) { mostrarToast('ð Descargando "' + nombre + '"'); }

        window.toggleResenaForm = function(recursoId, close) {
            var form = document.getElementById('resena-form-' + recursoId);
            if (!form) return;
            form.style.display = (close || form.style.display === 'block') ? 'none' : 'block';
        };

        window.enviarResenaLibro = async function(recursoId) {
            var textarea = document.getElementById('resena-txt-' + recursoId);
            if (!textarea) return;
            var titulo = textarea.getAttribute('data-titulo') || recursoId;
            var resena = textarea.value.trim();
            if (resena.length < 20) { mostrarToast('La reseña debe tener al menos 20 caracteres.'); return; }
            var btn = document.querySelector('#resena-form-' + recursoId + ' button');
            var orig = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
            btn.disabled = true;
            try {
                var userLog = JSON.parse(localStorage.getItem('vyd_user') || '{}');
                var { error } = await db.from('resenas').insert([{
                    recurso_id: recursoId,
                    recurso_titulo: titulo,
                    texto: resena,
                    usuario_nombre: userLog.nombre || 'Anonimo',
                    usuario_whatsapp: userLog.whatsapp || null
                }]);
                if (error) throw error;
                resenasCompletadas.add(recursoId);
                actualizarContadorResenas();
                mostrarToast('Resena enviada con exito.');
                textarea.value = '';
                document.getElementById('resena-form-' + recursoId).style.display = 'none';
            } catch(err) {
                mostrarToast('Error al guardar: ' + (err.message || err));
            } finally {
                btn.innerHTML = orig;
                btn.disabled = false;
            }
        };

        window.verResenasLibro = async function(recursoId, btnEl) {
            var lista = document.getElementById('resenas-lista-' + recursoId);
            if (!lista) return;
            if (lista.style.display === 'block') {
                lista.style.display = 'none';
                btnEl.innerHTML = '<i class="fa-regular fa-comments"></i> Ver resenas';
                return;
            }
            lista.style.display = 'block';
            btnEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Cargando...';
            try {
                var { data, error } = await db.from('resenas').select('texto, fecha').eq('recurso_id', recursoId).order('fecha', { ascending: false });
                if (error) throw error;
                if (!data || data.length === 0) {
                    lista.innerHTML = '<p style="font-size:12px;color:#9ca3af;font-style:italic;padding:8px 0;">Se el primero en dejar una resena.</p>';
                } else {
                    lista.innerHTML = '<p style="font-size:10px;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:8px;letter-spacing:0.5px;">Resenas anonimas de la comunidad</p>' +
                        data.map(r => '<div style="background:#f9fafb;border-left:3px solid #16a34a;padding:8px 10px;border-radius:6px;margin-bottom:6px;font-size:12px;color:#374151;font-style:italic;">"' + r.texto + '"</div>').join('');
                }
            } catch(err) {
                lista.innerHTML = '<p style="font-size:12px;color:#ef4444;">Error cargando resenas.</p>';
            }
            btnEl.innerHTML = '<i class="fa-regular fa-eye-slash"></i> Ocultar resenas';
        };

        function actualizarContadorResenas() {
            const total = bibPdfs.length || 5;
            const pending = total - resenasCompletadas.size;
            const el = document.getElementById('resenas-pendientes');
            if (el) el.innerText = Math.max(0, pending);
        }


        window.enviarPalabraNube = async function (id_modulo, inputId) {
            var val = document.getElementById(inputId).value.trim();
            if (val) {
                document.getElementById(inputId).value = '';
                var nubeBox = document.getElementById('nube-dinamica-' + id_modulo);
                if (nubeBox) {
                    var span = document.createElement('span');
                    var size = Math.floor(Math.random() * 12 + 12);
                    span.className = 'nube-palabra';
                    span.style.cssText = 'font-size:' + size + 'px;font-weight:600;color:var(--primary);';
                    span.innerText = val;
                    nubeBox.appendChild(span);
                }
                mostrarToast(val + ' aï¿½adido a la nube.');
                db.from('nube_palabras').insert([{ palabra: val, id_modulo: id_modulo }]).then(({error}) => { if(error) console.error(error); });
            }
        }

        window.responderFoco = async function (id_pregunta, inputId) {
            var val = document.getElementById(inputId).value.trim();
            if (val) {
                document.getElementById(inputId).value = '';
                mostrarToast('Registrando respuesta...');
                var user = JSON.parse(localStorage.getItem('vyd_user') || '{}');
                try {
                    await db.from('respuestas_foro').insert([{
                        id_pregunta: id_pregunta,
                        respuesta: val,
                        id_usuario: user.id || null
                    }]);
                    mostrarToast('Respuesta registrada en el ï¿½gora.', 'success');
                } catch (e) { console.warn(e); }
            }
        } // Cierra responderFoco

        window.verRespuestasFoco = async function(preguntaId, btnEl) {
            var lista = document.getElementById('respuestas-foco-' + preguntaId);
            if (!lista) return;
            if (lista.style.display === 'block') {
                lista.style.display = 'none';
                btnEl.innerHTML = '<i class="fa-regular fa-eye"></i> Ver respuestas';
                return;
            }
            lista.style.display = 'block';
            btnEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Cargando...';
            try {
                var { data, error } = await db.from('respuestas_foro').select('respuesta, created_at').eq('id_pregunta', preguntaId).order('created_at', { ascending: false });
                if (error) throw error;
                if (!data || data.length === 0) {
                    lista.innerHTML = '<p style="font-size:12px;color:#9ca3af;font-style:italic;padding:6px 0;">Aun no hay respuestas. Se el primero.</p>';
                } else {
                    lista.innerHTML = '<p style="font-size:10px;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:8px;letter-spacing:0.5px;">Respuestas anonimas (' + data.length + ')</p>' +
                        data.map(r => '<div style="background:#fffbeb;border-left:3px solid var(--gold);padding:8px 10px;border-radius:6px;margin-bottom:5px;font-size:12px;color:#374151;">" ' + r.respuesta + '</div>').join('');
                }
            } catch(err) {
                lista.innerHTML = '<p style="font-size:12px;color:#ef4444;">Error: ' + (err.message || err) + '</p>';
            }
            btnEl.innerHTML = '<i class="fa-regular fa-eye-slash"></i> Ocultar respuestas';
        };
        
        function agregarPropuestaAlMuro(texto, tipo = 'Propuesta') {
                const muro = document.getElementById('muro-actividades');
                const card = document.createElement('div');
                card.style.cssText = 'background:white;padding:16px;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.08);border:1px solid #e5e7eb;';
                card.setAttribute('data-propuesta-id', prop ? prop.id : '');
                card.innerHTML = `
            <p style="font-weight:700;font-size:10px;text-transform:uppercase;color:#9ca3af;margin-bottom:8px;">${tipo}:</p>
            <p style="color:#374151;font-style:italic;border-left:4px solid #d1d5db;padding-left:10px;margin-bottom:12px;">"${texto.replace(/</g, '&lt;')}"</p>
            <div class="comentario-critico" style="padding:10px;border-radius:6px;">
                <p style="font-size:10px;text-transform:uppercase;font-weight:700;color:var(--gold);margin-bottom:6px;">Comentario crÃ­tico (obligatorio):</p>
                <input type="text" placeholder="Aporta una crÃ­tica constructiva..." style="font-size:12px;width:100%;background:transparent;border-bottom:1px solid #d1d5db;outline:none;padding:4px;font-family:'Inter',sans-serif;">
                <button onclick="agregarComentarioCritico(this)" style="font-size:10px;background:#fef9c3;padding:3px 10px;border-radius:6px;margin-top:6px;border:none;cursor:pointer;font-family:'Inter',sans-serif;color:#7a6212;font-weight:600;">Enviar crÃ­tica</button>
            </div>
            <div class="comentarios-lista" style="margin-top:8px;font-size:11px;color:#6b7280;"></div>
        `;
                muro.prepend(card);
                mostrarToast('Nueva propuesta publicada.');
            }

            async function subirPropuesta() {
                var text = document.getElementById('propuesta-texto').value.trim();
                if (!text) return;
                try { const { error } = await db.from('propuestas').insert([{ texto: text, tipo: 'Propuesta' }]); if(error) console.error(error); } catch(e) { console.error(e); }
                agregarPropuestaAlMuro(text, 'Propuesta');
                document.getElementById('propuesta-texto').value = '';
            }

            async function agregarComentarioCritico(btn) {
                const container = btn.closest('.comentario-critico');
                const input = container.querySelector('input');
                const comentario = input.value.trim();
                if (!comentario || comentario.length < 10) { mostrarToast('La crítica debe tener al menos 10 caracteres.'); return; }
                btn.disabled = true;
                btn.textContent = '...';
                try {
                    var userLog = JSON.parse(localStorage.getItem('vyd_user') || '{}');
                    // propuesta_id stored in the card
                    var card = btn.closest('[data-propuesta-id]');
                    var propuestaId = card ? card.getAttribute('data-propuesta-id') : null;
                    await db.from('comentarios_muro').insert([{
                        comentario: comentario,
                        propuesta_id: propuestaId,
                        usuario_nombre: userLog.nombre || 'Anónimo'
                    }]);
                } catch(e) { console.warn('Error guardando crítica:', e); }
                const lista = container.parentElement.querySelector('.comentarios-lista');
                const p = document.createElement('p');
                p.style.cssText = 'border-top:1px solid #f0f0f0;padding-top:4px;margin-top:4px;font-size:11px;';
                p.innerHTML = '<i class="fa-regular fa-comment-dots"></i> <strong>Crítica:</strong> "' + comentario + '"';
                lista.appendChild(p);
                input.value = '';
                btn.disabled = false;
                btn.textContent = 'Enviar crítica';
                contadorComentariosUsuario++;
                actualizarContadorUI();
                if (contadorComentariosUsuario >= 2) mostrarToast('< ¡2 comentarios completos! Puedes solicitar certificación.');
                else mostrarToast('Comentario registrado. ' + contadorComentariosUsuario + '/2 para certificar.');
            }

            function actualizarContadorUI() {
                const el = document.getElementById('mis-comentarios-count');
                if (el) el.innerText = contadorComentariosUsuario;
                const bar = document.getElementById('status-bar');
                if (bar) bar.innerHTML = contadorComentariosUsuario >= 2 ? 'â CertificaciÃ³n lista' : `MÃ³dulo: CrÃ­ticas ${contadorComentariosUsuario}/2`;
            }

            // âââââââââââââââ CHATBOT âââââââââââââââ
            var BOT_KB = [
                { keys: ['linea de masas', 'metodo de direccion'], resp: 'La <strong>lÃ­nea de masas</strong> consiste en recoger las ideas dispersas del pueblo, sintetizarlas y devolverlas organizadas como acciÃ³n colectiva. Es el mÃ©todo central del texto <em>Sobre los mÃ©todos de direcciÃ³n</em>.' },
                { keys: ['identidad colectiva'], resp: 'La <strong>identidad colectiva</strong> se construye sobre bienes comunes y trabajo compartido. No es una marca, es el resultado de la reproducciÃ³n social y la autonomÃ­a del pueblo.' },
                { keys: ['procomun', 'bien comun'], resp: 'El <strong>ProcomÃºn</strong> son los bienes que pertenecen al pueblo: tierra, agua, conocimiento, espacios pÃºblicos. La identidad colectiva se ancla en su defensa.' },
                { keys: ['soberania tecnologica', 'tecnologia'], resp: 'La <strong>soberanÃ­a tecnolÃ³gica</strong> significa tener infraestructuras digitales propias para no depender de plataformas que pueden silenciar causas populares.' },
                { keys: ['municipalismo'], resp: 'El <strong>municipalismo</strong> propone construir el cambio desde las comunidades locales, con gestiÃ³n directa y poder ciudadano.' },
                { keys: ['movilizar', 'convocatoria'], resp: 'Una causa moviliza cuando: 1) expresa una necesidad <strong>real y sentida</strong> del territorio, 2) los lÃ­deres practican la escucha activa, y 3) la organizaciÃ³n convierte la indignaciÃ³n en acciÃ³n concreta.' },
                { keys: ['hola', 'buenos dias', 'buenas'], resp: 'Â¡Hola! Soy el <strong>LiderazgoBot</strong>. Puedo responder preguntas sobre los textos de formaciÃ³n y la metodologÃ­a polÃ­tica de la escuela. Â¿QuÃ© quieres saber?' },
                { keys: ['quien eres', 'que eres'], resp: 'Soy el <strong>LiderazgoBot</strong>, asistente de la Escuela Vanguardia y Desarrollo.' }
            ];

            function getBotResp(q) {
                var lo = q.toLowerCase();
                for (var i = 0; i < BOT_KB.length; i++) {
                    for (var j = 0; j < BOT_KB[i].keys.length; j++) {
                        if (lo.indexOf(BOT_KB[i].keys[j]) >= 0) return BOT_KB[i].resp;
                    }
                }
                return 'Interesante. Ese tema aÃºn estÃ¡ siendo integrado. Te sugiero revisar los textos de la <strong>Biblioteca</strong> o plantearlo en el <strong>Foro Ãgora</strong>.';
            }

            function addMsg(who, text) {
                var box = document.getElementById('chat-box');
                var d = document.createElement('div');
                d.style.cssText = 'display:flex;' + (who === 'user' ? 'justify-content:flex-end;' : 'justify-content:flex-start;');
                var bubble = document.createElement('div');
                bubble.style.cssText = who === 'user'
                    ? 'background:var(--primary);color:white;font-size:13px;padding:10px 16px;border-radius:18px 18px 4px 18px;max-width:75%;line-height:1.5;box-shadow:0 2px 6px rgba(139,0,0,0.3);'
                    : 'background:#f3f4f6;color:#1a1a1a;font-size:13px;padding:10px 16px;border-radius:18px 18px 18px 4px;max-width:80%;line-height:1.5;';
                bubble.innerHTML = text;
                d.appendChild(bubble);
                box.appendChild(d);
                box.scrollTop = box.scrollHeight;
                return d;
            }

            function showTyping() {
                var box = document.getElementById('chat-box');
                var d = document.createElement('div');
                d.style.cssText = 'display:flex;justify-content:flex-start;';
                var b = document.createElement('div');
                b.style.cssText = 'background:#f3f4f6;padding:12px 16px;border-radius:18px 18px 18px 4px;';
                b.innerHTML = '<span style="display:inline-flex;gap:4px;align-items:center;"><span style="width:7px;height:7px;background:#9ca3af;border-radius:50%;animation:bounce 0.6s infinite;"></span><span style="width:7px;height:7px;background:#9ca3af;border-radius:50%;animation:bounce 0.6s 0.15s infinite;"></span><span style="width:7px;height:7px;background:#9ca3af;border-radius:50%;animation:bounce 0.6s 0.3s infinite;"></span></span>';
                d.appendChild(b);
                box.appendChild(d);
                box.scrollTop = box.scrollHeight;
                return d;
            }

            function preguntaSugerida(txt) {
                document.getElementById('chat-input').value = txt;
                preguntarBot();
            }

            function preguntarBot() {
                var inp = document.getElementById('chat-input');
                var q = inp.value.trim();
                if (!q) return;
                inp.value = '';
                var sug = document.getElementById('chat-suggestions');
                if (sug) sug.style.display = 'none';
                addMsg('user', q);
                var typing = showTyping();
                setTimeout(function () { typing.remove(); addMsg('bot', getBotResp(q)); }, 700 + Math.random() * 400);
            }

            function initBot() {
                var box = document.getElementById('chat-box');
                if (box && box.children.length === 0) {
                    setTimeout(function () {
                        addMsg('bot', 'Â¡Hola! Soy el <strong>LiderazgoBot</strong> de la Escuela Vanguardia y Desarrollo. Puedo responder preguntas sobre los textos de formaciÃ³n y la metodologÃ­a polÃ­tica. Usa las sugerencias o escribe tu consulta.');
                    }, 400);
                }
            }

            // âââââââââââââââ NUBE Y MURO DINÃMICOS âââââââââââââââ
            async function cargarNube() {
                var res = await db.from('nube_palabras').select('palabra').order('fecha', { ascending: true }).then(r => r);
                if (res && res.data) {
                    var nube = document.getElementById('nube-palabras');
                    if (!nube) return;
                    nube.innerHTML = '';
                    res.data.forEach(function (row) {
                        var span = document.createElement('span');
                        var size = Math.floor(Math.random() * 12 + 12);
                        span.className = 'nube-palabra';
                        span.style.cssText = 'font-size:' + size + 'px;font-weight:600;color:var(--primary);';
                        span.innerText = row.palabra;
                        nube.appendChild(span);
                    });
                }
            }

            async function cargarPropuestasMuro() {
                var res = await db.from('propuestas').select('*').order('fecha', { ascending: false }).then(r => r);
                if (res && res.data && res.data.length > 0) {
                    var muro = document.getElementById('muro-actividades');
                    muro.innerHTML = '';
                    res.data.forEach(function (prop) {
                        var card = document.createElement('div');
                        card.style.cssText = 'background:white;padding:16px;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.08);border:1px solid #e5e7eb;';
                card.setAttribute('data-propuesta-id', prop ? prop.id : '');
                        var fecha = new Date(prop.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
                        card.innerHTML = '<p style="font-weight:700;font-size:10px;text-transform:uppercase;color:#9ca3af;margin-bottom:6px;">' + prop.tipo + ' <span style="font-weight:400;color:#d1d5db;margin-left:6px;">' + fecha + '</span></p>' +
                            '<p style="color:#374151;font-style:italic;border-left:4px solid #d1d5db;padding-left:10px;margin-bottom:12px;">"' + prop.texto + '"</p>' +
                            '<div class="comentario-critico" style="padding:10px;border-radius:6px;">' +
                            '<p style="font-size:10px;text-transform:uppercase;font-weight:700;color:var(--gold);margin-bottom:6px;">Comentario crÃ­tico (obligatorio):</p>' +
                            '<input type="text" placeholder="Aporta una crÃ­tica constructiva..." style="font-size:12px;width:100%;background:transparent;border-bottom:1px solid #d1d5db;outline:none;padding:4px;font-family:\'Inter\',sans-serif;">' +
                            '<button onclick="agregarComentarioCritico(this)" style="font-size:10px;background:#fef9c3;padding:3px 10px;border-radius:6px;margin-top:6px;border:none;cursor:pointer;font-family:\'Inter\',sans-serif;color:#7a6212;font-weight:600;">Enviar crÃ­tica</button>' +
                            '</div><div class="comentarios-lista" style="margin-top:8px;font-size:11px;color:#6b7280;"></div>';
                        muro.appendChild(card);
                    });
                }
            }

            let horasRestantes = 23;
            setInterval(() => {
                if (horasRestantes > 0) horasRestantes--;
                const el = document.getElementById('cuenta-foro');
                if (el) el.innerText = horasRestantes;
            }, 3600000);


            async function cargarDatosForo() {
                try {
                    // Cargar modulos
                    var resMod = await db.from('modulos').select('id, nombre');
                    if (resMod.data) modulosForo = resMod.data;

                    // Llenar selectores
                    var filter = document.getElementById('foro-modulo-filter');
                    if (filter) {
                        filter.innerHTML = '<option value="all">Ver Todos los Mï¿½dulos</option>';
                        modulosForo.forEach(m => {
                            filter.innerHTML += '<option value="' + m.id + '">' + m.nombre + '</option>';
                        });
                    }

                    // Cargar preguntas activas
                    var resPreg = await db.from('preguntas_foro').select('*').eq('activa', true).order('id');
                    if (resPreg.data) preguntasForo = resPreg.data;

                    // Cargar nubes (palabras)
                    var resNube = await db.from('nube_palabras').select('*');
                    if (resNube.data) nubesForo = resNube.data;

                    renderForoDinamico();
                } catch (e) { console.warn(e); }
            }

            window.renderForoDinamico = function () {
                var container = document.getElementById('foro-dinamico-container');
                if (!container) return;
                var fId = document.getElementById('foro-modulo-filter')?.value || 'all';

                var moShow = modulosForo;
                if (fId !== 'all') moShow = modulosForo.filter(m => String(m.id) === fId);

                container.innerHTML = '';
                if (moShow.length === 0 || preguntasForo.length === 0) {
                    container.innerHTML = '<div style="text-align:center;padding:40px;color:#9ca3af;font-size:13px;">No hay preguntas disponibles ahora.</div>';
                    return;
                }

                moShow.forEach(mod => {
                    // Preguntas para este mï¿½dulo
                    let pregs = preguntasForo.filter(p => p.id_modulo === mod.id);
                    if (pregs.length === 0) return; // Si no hay preguntas, no mostrar modulo

                    let htmlMod = '<div style="background:white;padding:20px;border-radius:10px;box-shadow:0 1px 3px rgba(0,0,0,0.1);border-left:4px solid var(--primary);"><h3 style="font-weight:900;font-size:15px;margin-bottom:16px;text-transform:uppercase;color:var(--primary);">' + mod.nombre + '</h3>';

                    // Clasificar
                    let focos = pregs.filter(p => p.tipo === 'foco');
                    let nubep = pregs.filter(p => p.tipo === 'nube');

                    // Focos
                    focos.forEach((f, idx) => {
                        htmlMod += '<div style="margin-bottom:16px;"><p style="font-weight:700;font-size:13px;"><span style="background:#fef9c3;padding:2px 8px;border-radius:4px;color:black;">Foco ' + (idx+1) + ':</span> ' + f.pregunta + '</p>';
                        htmlMod += '<div style="display:flex;margin-top:8px;gap:8px;">';
                        htmlMod += '<input type="text" id="resp-foco-' + f.id + '" placeholder="Tu respuesta breve..." style="flex:1;border:1px solid #d1d5db;padding:8px 12px;border-radius:8px;font-size:13px;font-family:\'Inter\',sans-serif;outline:none;">';
                        htmlMod += '<button onclick="responderFoco(' + f.id + ', \'resp-foco-' + f.id + '\')" style="background:var(--primary);color:white;padding:8px 14px;border-radius:8px;font-size:13px;border:none;cursor:pointer;font-weight:600;">Enviar</button>';
                        htmlMod += '</div></div>';
                        htmlMod += '<div style="margin-top:6px;">';
                        htmlMod += '<button onclick="verRespuestasFoco(' + f.id + ', this)" style="font-size:11px;color:#6b7280;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:6px;padding:5px 12px;cursor:pointer;font-family:\'Inter\',sans-serif;display:inline-flex;align-items:center;gap:5px;"><i class=\"fa-regular fa-eye\"></i> Ver respuestas</button>';
                        htmlMod += '<div id="respuestas-foco-' + f.id + '" style="display:none;margin-top:8px;"></div>';
                        htmlMod += '</div>';
                    });

                    // Nubes
                    nubep.forEach(n => {
                        htmlMod += '<div style="background:#1a1a1a;color:white;padding:20px;border-radius:10px;text-align:center;margin-top:20px;">';
                        htmlMod += '<p style="font-size:1.05rem;margin-bottom:12px;font-weight:300;font-style:italic;">"' + n.pregunta + '"</p>';
                        htmlMod += '<input type="text" id="input-nube-' + mod.id + '" placeholder="Tu respuesta en una palabra..." style="width:100%;padding:10px;color:black;border-radius:8px;margin-bottom:10px;font-size:13px;outline:none;border:none;">';
                        htmlMod += '<button onclick="enviarPalabraNube(' + mod.id + ', \'input-nube-' + mod.id + '\')" style="background:var(--primary);color:white;width:100%;padding:11px;border-radius:8px;font-size:13px;font-weight:700;text-transform:uppercase;border:none;cursor:pointer;">Contribuir a Nube</button>';

                        htmlMod += '<div style="background:#2a2a2a;padding:16px;border-radius:10px;margin-top:16px;">';
                        htmlMod += '<p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;color:#a3a3a3;">Identidad colectiva</p>';
                        htmlMod += '<div id="nube-dinamica-' + mod.id + '" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;min-height:60px;">';

                        let palabrasMod = nubesForo.filter(np => np.id_modulo === mod.id);
                        palabrasMod.forEach(pw => {
                            let sz = Math.floor(Math.random() * 8 + 12);
                            htmlMod += '<span class="nube-palabra" style="font-size:' + sz + 'px;font-weight:600;color:#fca5a5;">' + pw.palabra + '</span>';
                        });

                        htmlMod += '</div></div></div>';
                    });

                    htmlMod += '</div>';
                    container.innerHTML += htmlMod;
                });

            }
    