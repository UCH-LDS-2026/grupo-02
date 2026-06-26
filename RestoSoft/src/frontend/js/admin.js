let usuarioLogueadoGlobal = null;
let mesaParaCobrar = null;
let listaClientesAdmin = [];
let totalSinDescuento = 0;

document.addEventListener("DOMContentLoaded", () => {

    // 1. CONTROL DE SEGURIDAD (Solo CAJERO o ADMIN)
    const userStored = localStorage.getItem('usuarioLogueado');
    if (!userStored) {
        window.location.href = 'index.html';
        return;
    }

    usuarioLogueadoGlobal = JSON.parse(userStored);

    if (usuarioLogueadoGlobal.rol !== 'ADMIN' && usuarioLogueadoGlobal.rol !== 'CAJERO') {
        alert("Acceso denegado. No tienes permisos para ingresar a la Administración.");
        window.location.href = 'salon.html';
        return;
    }

    document.getElementById('nombreUsuario').textContent = `${usuarioLogueadoGlobal.nombre} (${usuarioLogueadoGlobal.rol})`;

    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('usuarioLogueado');
        window.location.href = 'index.html';
    });

    // 2. NAVEGACIÓN DEL MENÚ LATERAL
    const links = document.querySelectorAll('.sidebar-link');
    const sections = document.querySelectorAll('.admin-section');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Quitamos clase active de todos
            links.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Activamos el clickeado
            e.target.classList.add('active');
            const targetId = e.target.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');

            // NAVEGACIÓN DEL MENÚ LATERAL
            if (targetId === 'sec-caja') {
                cargarMesasPorCobrar();
                cargarClientesAdmin();
            }
            if (targetId === 'sec-menu') {
                cargarProductosAdmin();
            }
            if (targetId === 'sec-usuarios') {
                cargarUsuariosAdmin();
                cargarClientesAdmin();
            }
            if (targetId === 'sec-salon') {
                cargarEditorSalon();
            }
            if (targetId === 'sec-arqueo' || targetId === 'sec-ventas') {
                cargarArqueoYVentas();
            }
        });
    });

    // 3. INICIO DE MÓDULO CAJA
    cargarMesasPorCobrar();
    cargarClientesAdmin();
    setInterval(cargarMesasPorCobrar, 15000); // Refresca cada 15 segundos

    // Botón de cobro
    document.getElementById('btnRegistrarCobro').addEventListener('click', registrarCobro);
});

// --- LÓGICA DEL MÓDULO: CAJA Y COBROS ---

async function cargarMesasPorCobrar() {
    try {
        const response = await fetch('http://localhost:8080/api/mesas');
        if (!response.ok) return;

        const mesas = await response.json();
        // Filtramos solo las que el mozo marcó para cobrar
        const mesasPendientes = mesas.filter(m => m.estado === 'POR_COBRAR');

        const contenedor = document.getElementById('listaMesasCobrar');
        contenedor.innerHTML = '';

        if (mesasPendientes.length === 0) {
            contenedor.innerHTML = '<p style="color:gray; text-align:center; padding: 20px;">No hay mesas pendientes de cobro.</p>';
            return;
        }

        mesasPendientes.forEach(mesa => {
            const div = document.createElement('div');
            div.className = 'mesa-cobrar-card';
            if (mesaParaCobrar && mesaParaCobrar.idMesa === mesa.idMesa) {
                div.classList.add('selected');
            }

            div.innerHTML = `
                <div>
                    <strong style="font-size: 1.2rem;">Mesa ${mesa.numeroMesa}</strong>
                </div>
                <span style="background: #fee2e2; color: #ef4444; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">
                    Pendiente
                </span>
            `;

            div.addEventListener('click', () => abrirDetalleCobro(mesa, div));
            contenedor.appendChild(div);
        });

    } catch (error) {
        console.error("Error al cargar mesas por cobrar:", error);
    }
}

async function abrirDetalleCobro(mesa, elementoHtml) {
    mesaParaCobrar = mesa;

    // Remarcamos la mesa seleccionada visualmente
    document.querySelectorAll('.mesa-cobrar-card').forEach(el => el.classList.remove('selected'));
    if (elementoHtml) elementoHtml.classList.add('selected');

    document.getElementById('panelDetalleCobro').style.display = 'block';
    document.getElementById('cobroNroMesa').textContent = mesa.numeroMesa;

    const listaConsumo = document.getElementById('cobroListaItems');
    listaConsumo.innerHTML = '<li style="text-align:center;">Calculando cuenta...</li>';

    try {
        // 1. Traemos la instancia para saber el ID de la instancia activa y el mozo
        const resInstancia = await fetch(`http://localhost:8080/api/instancias/mesa/${mesa.idMesa}`);
        const instancia = await resInstancia.json();
        mesaParaCobrar.idInstanciaActual = instancia.idInstancia;
        document.getElementById('cobroMozo').textContent = `Atendido por: ${instancia.mozo.nombre}`;

        // 2. Traemos todas las comandas de esa instancia
        const resComanda = await fetch(`http://localhost:8080/api/comandas/instancia/${instancia.idInstancia}`);
        const comandas = await resComanda.json();

        listaConsumo.innerHTML = '';
        let total = 0;

        comandas.forEach(comanda => {
            if (comanda.items) {
                comanda.items.forEach(item => {
                    const isCancelado = item.cancelado === true;
                    if (!isCancelado) {
                        total += parseFloat(item.subtotal);
                    }

                    const estiloFila = isCancelado
                        ? "text-decoration: line-through; color: #9ca3af; display:flex; justify-content:space-between; padding: 8px 0; border-bottom: 1px solid #eee;"
                        : "display:flex; justify-content:space-between; padding: 8px 0; border-bottom: 1px solid #eee;";

                    listaConsumo.innerHTML += `
                        <li style="${estiloFila}">
                            <span>${item.cantidad}x ${item.producto.nombre}</span>
                            <span>$${item.subtotal}</span>
                        </li>
                    `;
                });
            }
        });

        // 3. PREPARAMOS LOS TOTALES PARA EL DESCUENTO
        const descFinal = document.getElementById('cobroTotalMesa');
        // Usamos el atributo inmutable que preparamos en la función actualizarTotalCaja
        descFinal.setAttribute('data-total-base', total); 
        descFinal.textContent = `$${total.toFixed(2)}`;
        
        document.getElementById('selectClienteCobro').value = "0"; // Reiniciamos el cliente
        actualizarTotalCaja(); // Refrescamos la visual

        // 4. ASIGNAMOS LA ACCIÓN AL BOTÓN DE COBRO
        const btnCobrar = document.getElementById('btnRegistrarCobro');
        // Clonamos el botón para matar eventos de mesas anteriores y que no se dupliquen cobros
        const nuevoBtnCobrar = btnCobrar.cloneNode(true);
        btnCobrar.parentNode.replaceChild(nuevoBtnCobrar, btnCobrar);

        // Le inyectamos la función correcta usando la variable global actualizada
        nuevoBtnCobrar.addEventListener('click', () => {
            registrarFacturaYLiberar(mesaParaCobrar.idMesa, mesaParaCobrar.idInstanciaActual);
        });

    } catch (e) {
        console.error("Error obteniendo detalles del cobro", e);
        listaConsumo.innerHTML = '<li style="color:red;">Error al cargar los datos</li>';
    }
}

// ==========================================
// LÓGICA DEL MÓDULO: MENÚ Y PRECIOS
// ==========================================

let productosAdmin = [];

// Eventos de los botones del formulario
document.getElementById('btnNuevoProducto').addEventListener('click', () => abrirFormularioProducto());
document.getElementById('btnCancelarFormProducto').addEventListener('click', () => {
    document.getElementById('panelFormProducto').style.display = 'none';
});
document.getElementById('btnGuardarProducto').addEventListener('click', guardarProducto);

async function cargarProductosAdmin() {
    try {
        const response = await fetch('http://localhost:8080/api/productos');
        productosAdmin = await response.json();

        const tbody = document.getElementById('tablaProductosAdmin');
        tbody.innerHTML = '';

        productosAdmin.forEach(prod => {
            tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px; color: #6b7280;">#${prod.idProducto}</td>
                    <td style="padding: 12px; font-weight: bold;">${prod.nombre}</td>
                    <td style="padding: 12px; color: #10b981; font-weight: bold;">$${prod.precio}</td>
                    <td style="padding: 12px; text-align: right;">
                        <button onclick="abrirFormularioProducto(${prod.idProducto})" class="btn-info" style="padding: 5px 10px; font-size: 0.85rem; margin-right: 5px;">Editar</button>
                        <button onclick="eliminarProducto(${prod.idProducto})" class="btn-danger" style="padding: 5px 10px; font-size: 0.85rem;">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

function abrirFormularioProducto(idProducto = null) {
    const panel = document.getElementById('panelFormProducto');
    const titulo = document.getElementById('tituloFormProducto');
    const inputId = document.getElementById('formProductoId');
    const inputNombre = document.getElementById('formProductoNombre');
    const inputPrecio = document.getElementById('formProductoPrecio');
    const selectCategoria = document.getElementById('formProductoCategoria');

    if (idProducto) {
        const producto = productosAdmin.find(p => p.idProducto === idProducto);
        titulo.textContent = 'Editar Producto';
        inputId.value = producto.idProducto;
        inputNombre.value = producto.nombre;
        inputPrecio.value = producto.precio;

        if (producto.categoria) {
            selectCategoria.value = producto.categoria.idCategoria || producto.categoria.id || 1;
        }
    } else {
        titulo.textContent = 'Añadir Nuevo Producto';
        inputId.value = '';
        inputNombre.value = '';
        inputPrecio.value = '';
        selectCategoria.value = '1';
    }

    panel.style.display = 'block';
    inputNombre.focus();
}

async function guardarProducto() {
    const id = document.getElementById('formProductoId').value;
    const nombre = document.getElementById('formProductoNombre').value.trim();
    const precio = parseFloat(document.getElementById('formProductoPrecio').value);
    const idCategoriaStr = document.getElementById('formProductoCategoria').value;

    if (!nombre || isNaN(precio) || precio <= 0) {
        alert("Por favor, ingrese un nombre válido y un precio mayor a 0.");
        return;
    }
    const payload = {
        nombre: nombre,
        precio: precio,
        categoria: {
            idCategoria: parseInt(idCategoriaStr),
            id: parseInt(idCategoriaStr)
        }
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:8080/api/productos/${id}` : 'http://localhost:8080/api/productos';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            document.getElementById('panelFormProducto').style.display = 'none';
            cargarProductosAdmin();
        } else {
            alert("Error al guardar el producto en el servidor.");
        }
    } catch (error) {
        alert("Falla de conexión al intentar guardar.");
    }
}

async function eliminarProducto(idProducto) {
    if (!confirm("¿Estás seguro de que querés eliminar este producto?")) return;

    try {
        const response = await fetch(`http://localhost:8080/api/productos/${idProducto}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            cargarProductosAdmin();
        } else {
            alert("No se pudo eliminar. Es posible que el producto esté asociado a comandas existentes.");
        }
    } catch (error) {
        alert("Falla de conexión al intentar eliminar.");
    }
}

// ==========================================
// LÓGICA DEL MÓDULO: USUARIOS
// ==========================================

let listaUsuariosAdmin = [];

document.getElementById('btnNuevoUsuario').addEventListener('click', () => abrirFormularioUsuario());
document.getElementById('btnCancelarFormUsuario').addEventListener('click', () => {
    document.getElementById('panelFormUsuario').style.display = 'none';
});
document.getElementById('btnGuardarUsuario').addEventListener('click', guardarUsuario);

async function cargarUsuariosAdmin() {
    try {
        const response = await fetch('http://localhost:8080/api/usuarios');
        listaUsuariosAdmin = await response.json();

        const tbody = document.getElementById('tablaUsuariosAdmin');
        tbody.innerHTML = '';

        listaUsuariosAdmin.forEach(user => {
            // Verificamos si está desactivado
            const isDesactivado = user.activo === false || user.activo === 0;

            let colorRol = '#6b7280';
            if (user.rol === 'ADMIN') colorRol = '#ef4444';
            if (user.rol === 'MOZO') colorRol = '#3b82f6';
            if (user.rol === 'COCINA') colorRol = '#f59e0b';
            if (user.rol === 'CAJERO') colorRol = '#10b981';

            const currentId = user.id || user.idUsuario;
            const loggedId = usuarioLogueadoGlobal.id || usuarioLogueadoGlobal.idUsuario;

            // Estilos para la fila dependiendo de si está activo o inactivo
            const estiloFila = isDesactivado
                ? "border-bottom: 1px solid #e5e7eb; background-color: #f9fafb; color: #9ca3af; text-decoration: line-through;"
                : "border-bottom: 1px solid #e5e7eb;";

            // Estilos para la etiqueta del Rol
            const spanRol = isDesactivado
                ? `<span style="background-color: #e5e7eb; color: #9ca3af; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">${user.rol}</span>`
                : `<span style="background-color: ${colorRol}20; color: ${colorRol}; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">${user.rol}</span>`;

            // Botones dependiendo del estado
            const accionHTML = isDesactivado
                ? `<span style="color: #ef4444; font-weight: bold; font-size: 0.85rem; margin-right: 10px;">Inactivo</span>
                   <button onclick="reactivarUsuario(${currentId})" class="btn-success" style="padding: 5px 10px; font-size: 0.85rem;">Reactivar</button>`
                : `<button onclick="abrirFormularioUsuario(${currentId})" class="btn-info" style="padding: 5px 10px; font-size: 0.85rem; margin-right: 5px;">Editar</button>
                   <button onclick="eliminarUsuario(${currentId})" class="btn-danger" style="padding: 5px 10px; font-size: 0.85rem;" ${currentId === loggedId ? 'disabled' : ''}>Desactivar</button>`;

            tbody.innerHTML += `
                <tr style="${estiloFila}">
                    <td style="padding: 12px; font-weight: bold;">${user.nombre} ${user.apellido}</td>
                    <td style="padding: 12px;">${user.email}</td>
                    <td style="padding: 12px;">${spanRol}</td>
                    <td style="padding: 12px; text-align: right;">${accionHTML}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error al cargar usuarios:", error);
    }
}

async function reactivarUsuario(idUsuario) {
    if (!confirm("¿Deseas reactivar el acceso de este usuario al sistema?")) return;

    // Buscamos el usuario y lo ponemos activo nuevamente
    const user = listaUsuariosAdmin.find(u => (u.id || u.idUsuario) === idUsuario);
    user.activo = true;

    try {
        const response = await fetch(`http://localhost:8080/api/usuarios/${idUsuario}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        if (response.ok) {
            cargarUsuariosAdmin();
        } else {
            alert("No se pudo reactivar el usuario.");
        }
    } catch (error) {
        alert("Falla de conexión.");
    }
}

function abrirFormularioUsuario(idUsuario = null) {
    const panel = document.getElementById('panelFormUsuario');
    const titulo = document.getElementById('tituloFormUsuario');
    const inputId = document.getElementById('formUsuarioId');
    const inputNombre = document.getElementById('formUsuarioNombre');
    const inputApellido = document.getElementById('formUsuarioApellido');
    const inputEmail = document.getElementById('formUsuarioEmail');
    const inputPassword = document.getElementById('formUsuarioPassword');
    const selectRol = document.getElementById('formUsuarioRol');

    if (idUsuario) {
        // SOLUCIÓN: Buscamos el usuario usando la misma lógica flexible
        const user = listaUsuariosAdmin.find(u => (u.id || u.idUsuario) === idUsuario);
        titulo.textContent = 'Editar Usuario';
        inputId.value = user.id || user.idUsuario;
        inputNombre.value = user.nombre;
        inputApellido.value = user.apellido;
        inputEmail.value = user.email;
        inputPassword.value = user.password;
        selectRol.value = user.rol;
    } else {
        titulo.textContent = 'Añadir Nuevo Usuario';
        inputId.value = '';
        inputNombre.value = '';
        inputApellido.value = '';
        inputEmail.value = '';
        inputPassword.value = '';
        selectRol.value = 'MOZO';
    }

    panel.style.display = 'block';
    inputNombre.focus();
}
async function guardarUsuario() {
    const id = document.getElementById('formUsuarioId').value;

    const payload = {
        nombre: document.getElementById('formUsuarioNombre').value.trim(),
        apellido: document.getElementById('formUsuarioApellido').value.trim(),
        email: document.getElementById('formUsuarioEmail').value.trim(),
        password: document.getElementById('formUsuarioPassword').value.trim(),
        rol: document.getElementById('formUsuarioRol').value,
        activo: true
    };

    if (!payload.nombre || !payload.email || !payload.password) {
        alert("El nombre, email y contraseña son obligatorios.");
        return;
    }

    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:8080/api/usuarios/${id}` : 'http://localhost:8080/api/usuarios';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            document.getElementById('panelFormUsuario').style.display = 'none';
            cargarUsuariosAdmin();
        } else {
            alert("Error al guardar el usuario. Puede que el email ya exista.");
        }
    } catch (error) {
        alert("Falla de conexión.");
    }
}

async function eliminarUsuario(idUsuario) {
    if (!confirm("¿Eliminar a este empleado del sistema?")) return;

    try {
        const response = await fetch(`http://localhost:8080/api/usuarios/${idUsuario}`, { method: 'DELETE' });
        if (response.ok) {
            cargarUsuariosAdmin();
        } else {
            alert("No se puede borrar. Seguramente este usuario tiene comandas o cobros registrados.");
        }
    } catch (error) {
        alert("Falla de conexión.");
    }
}

// ==========================================
// LÓGICA DEL MÓDULO: CLIENTES (DESCUENTOS)
// ==========================================

document.getElementById('btnNuevoCliente').addEventListener('click', () => abrirFormularioCliente());
document.getElementById('btnCancelarFormCliente').addEventListener('click', () => document.getElementById('panelFormCliente').style.display = 'none');
document.getElementById('btnGuardarCliente').addEventListener('click', guardarCliente);

async function cargarClientesAdmin() {
    try {
        const response = await fetch('http://localhost:8080/api/clientes');
        listaClientesAdmin = await response.json();

        // Llenar tabla de Administración
        const tbody = document.getElementById('tablaClientesAdmin');
        if (tbody) {
            tbody.innerHTML = '';
            listaClientesAdmin.forEach(cli => {
                const isDesactivado = cli.activo === false;
                const estilo = isDesactivado ? "background-color: #f9fafb; color: #9ca3af; text-decoration: line-through;" : "";
                const currentId = cli.idCliente || cli.id;

                const acciones = isDesactivado
                    ? `<button onclick="reactivarCliente(${currentId})" class="btn-success" style="padding: 5px; font-size: 0.8rem;">Reactivar</button>`
                    : `<button onclick="abrirFormularioCliente(${currentId})" class="btn-info" style="padding: 5px; font-size: 0.8rem; margin-right: 5px;">Editar</button>
                       <button onclick="desactivarCliente(${currentId})" class="btn-danger" style="padding: 5px; font-size: 0.8rem;">Desactivar</button>`;

                tbody.innerHTML += `
                    <tr style="border-bottom: 1px solid #e5e7eb; ${estilo}">
                        <td style="padding: 12px; font-weight: bold;">${cli.nombreCompleto}</td>
                        <td style="padding: 12px;"><span class="badge" style="background:#10b981;">-${cli.porcentajeDescuento}%</span></td>
                        <td style="padding: 12px; text-align: right;">${acciones}</td>
                    </tr>
                `;
            });
        }

        // Llenar selector de la Caja
        const selectCobro = document.getElementById('selectClienteCobro');
        if (selectCobro) {
            selectCobro.innerHTML = '<option value="0">Consumidor Final (0%)</option>';
            listaClientesAdmin.filter(c => c.activo).forEach(cli => {
                selectCobro.innerHTML += `<option value="${cli.porcentajeDescuento}">${cli.nombreCompleto} (-${cli.porcentajeDescuento}%)</option>`;
            });
        }
    } catch (e) { console.error(e); }
}

function abrirFormularioCliente(id = null) {
    const p = document.getElementById('panelFormCliente');
    if (id) {
        const cli = listaClientesAdmin.find(c => (c.idCliente || c.id) === id);
        document.getElementById('tituloFormCliente').textContent = 'Editar Cliente';
        document.getElementById('formClienteId').value = id;
        document.getElementById('formClienteNombre').value = cli.nombreCompleto;
        document.getElementById('formClienteDescuento').value = cli.porcentajeDescuento;
    } else {
        document.getElementById('tituloFormCliente').textContent = 'Añadir Cliente';
        document.getElementById('formClienteId').value = '';
        document.getElementById('formClienteNombre').value = '';
        document.getElementById('formClienteDescuento').value = '';
    }
    p.style.display = 'block';
}

async function guardarCliente() {
    const id = document.getElementById('formClienteId').value;
    const payload = {
        nombreCompleto: document.getElementById('formClienteNombre').value.trim(),
        porcentajeDescuento: parseInt(document.getElementById('formClienteDescuento').value),
        activo: true
    };
    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:8080/api/clientes/${id}` : 'http://localhost:8080/api/clientes';

    await fetch(url, { method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    document.getElementById('panelFormCliente').style.display = 'none';
    cargarClientesAdmin();
}

async function desactivarCliente(id) {
    if (!confirm("¿Desactivar cliente?")) return;
    const cli = listaClientesAdmin.find(c => (c.idCliente || c.id) === id);
    cli.activo = false;
    await fetch(`http://localhost:8080/api/clientes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cli) });
    cargarClientesAdmin();
}

async function reactivarCliente(id) {
    const cli = listaClientesAdmin.find(c => (c.idCliente || c.id) === id);
    cli.activo = true;
    await fetch(`http://localhost:8080/api/clientes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cli) });
    cargarClientesAdmin();
}

// Listener para cuando el cajero cambia de cliente en el combobox
document.getElementById('selectClienteCobro').addEventListener('change', actualizarTotalCaja);

function actualizarTotalCaja() {
    const descuentoPorcentaje = parseInt(document.getElementById('selectClienteCobro').value) || 0;
    const descOriginal = document.getElementById('cobroSubtotalOriginal');
    const descFinal = document.getElementById('cobroTotalMesa');

    // Extraemos el total base de un atributo inmutable, si no existe, lo creamos
    let baseTotal = parseFloat(descFinal.getAttribute('data-total-base'));

    if (isNaN(baseTotal)) {
        // Leemos el texto original del HTML al abrir la caja por primera vez
        const textoOriginal = descOriginal.style.display !== 'none' ? descOriginal.textContent : descFinal.textContent;
        baseTotal = parseFloat(textoOriginal.replace('$', '')) || 0;
        // Lo guardamos como atributo intocable en la etiqueta HTML
        descFinal.setAttribute('data-total-base', baseTotal);
    }

    if (descuentoPorcentaje > 0) {
        const montoDescuento = baseTotal * (descuentoPorcentaje / 100);
        const totalFinal = baseTotal - montoDescuento;

        descOriginal.style.display = 'block';
        descOriginal.textContent = `$${baseTotal.toFixed(2)}`;
        descFinal.textContent = `$${totalFinal.toFixed(2)}`;
    } else {
        descOriginal.style.display = 'none';
        descFinal.textContent = `$${baseTotal.toFixed(2)}`;
    }
}
// ==========================================
// LÓGICA DEL MÓDULO: EDITOR DE SALÓN (DRAG & DROP)
// ==========================================
let mesasDelMapa = [];
let mesaArrastrada = null;
let sectorActivoMapa = 'Planta Baja';
let mesaSeleccionadaMapaId = null;

// Lógica de las pestañas del mapa
document.querySelectorAll('.tab-admin-mapa').forEach(btn => {
    btn.addEventListener('click', function () {
        // 1. Le quitamos la clase 'active' a todos los botones
        document.querySelectorAll('.tab-admin-mapa').forEach(b => b.classList.remove('active'));

        // 2. Se la agregamos SOLO al botón que acabamos de tocar
        this.classList.add('active');

        // 3. ACTUALIZAMOS LA VARIABLE GLOBAL (Usando 'this' arreglamos el bug)
        sectorActivoMapa = this.getAttribute('data-sector');

        // 4. Redibujamos el lienzo
        dibujarMesasEnLienzo();
    });
});

// Botón Añadir Mesa
document.getElementById('btnAgregarMesaMapa').addEventListener('click', async () => {
    const numero = prompt(`Ingrese el número de la nueva mesa para ${sectorActivoMapa}:`);
    if (!numero) return;

    const nuevaMesa = {
        numeroMesa: parseInt(numero),
        capacidad: 4, // Por defecto
        estado: 'LIBRE',
        sector: sectorActivoMapa,
        posicionX: 0,
        posicionY: 0
    };

    try {
        await fetch('http://localhost:8080/api/mesas', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevaMesa)
        });
        cargarEditorSalon();
    } catch (e) { alert("Error al crear mesa"); }
});

async function cargarEditorSalon() {
    try {
        const response = await fetch('http://localhost:8080/api/mesas');
        mesasDelMapa = await response.json();
        dibujarMesasEnLienzo();
    } catch (error) { console.error(error); }
}

function dibujarMesasEnLienzo() {
    const lienzo = document.getElementById('lienzoSalon');
    lienzo.innerHTML = '';

    const mesasFiltradas = mesasDelMapa.filter(m => m.sector === sectorActivoMapa || (!m.sector && sectorActivoMapa === 'Planta Baja'));

    mesasFiltradas.forEach(mesa => {
        const divMesa = document.createElement('div');
        divMesa.className = 'mesa-draggable';
        // Si esta mesa es la que estaba seleccionada, la mantenemos marcada
        if (mesa.idMesa === mesaSeleccionadaMapaId) divMesa.classList.add('seleccionada');

        divMesa.style.width = '80px';
        divMesa.style.height = '80px';
        divMesa.id = `mesa-drag-${mesa.idMesa}`;
        divMesa.innerHTML = `Mesa<br>${mesa.numeroMesa}`;
        divMesa.dataset.id = mesa.idMesa;
        divMesa.style.left = `${mesa.posicionX || 0}px`;
        divMesa.style.top = `${mesa.posicionY || 0}px`;

        divMesa.addEventListener('mousedown', iniciarArrastre);
        lienzo.appendChild(divMesa);
    });
}

// Clic en un lugar vacío del lienzo deselecciona todo
document.getElementById('lienzoSalon').addEventListener('mousedown', (e) => {
    if (e.target.id === 'lienzoSalon') {
        mesaSeleccionadaMapaId = null;
        document.querySelectorAll('.mesa-draggable').forEach(m => m.classList.remove('seleccionada'));
        document.getElementById('btnEliminarMesaMapa').style.display = 'none';
    }
});

function iniciarArrastre(e) {
    mesaArrastrada = e.target;

    //Seleccionar visualmente la mesa al tocarla
    mesaSeleccionadaMapaId = parseInt(mesaArrastrada.dataset.id);
    document.querySelectorAll('.mesa-draggable').forEach(m => m.classList.remove('seleccionada'));
    mesaArrastrada.classList.add('seleccionada');
    document.getElementById('btnEliminarMesaMapa').style.display = 'inline-block';

    document.addEventListener('mousemove', arrastrar);
    document.addEventListener('mouseup', soltar);
}

// Evento para ELIMINAR la mesa seleccionada
document.getElementById('btnEliminarMesaMapa').addEventListener('click', async () => {
    if (!mesaSeleccionadaMapaId) return;
    if (!confirm("¿Estás seguro de que querés eliminar esta mesa definitivamente?")) return;

    try {
        const response = await fetch(`http://localhost:8080/api/mesas/${mesaSeleccionadaMapaId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            mesaSeleccionadaMapaId = null;
            document.getElementById('btnEliminarMesaMapa').style.display = 'none';
            cargarEditorSalon(); // Recargamos para que desaparezca
        } else {
            alert("No podés eliminar esta mesa porque ya tiene historial de comandas. Usá la base de datos si necesitás forzar el borrado.");
        }
    } catch (error) {
        alert("Falla de conexión al intentar eliminar.");
    }
});

function arrastrar(e) {
    if (!mesaArrastrada) return;
    const rectLienzo = document.getElementById('lienzoSalon').getBoundingClientRect();
    let x = e.clientX - rectLienzo.left - (mesaArrastrada.offsetWidth / 2);
    let y = e.clientY - rectLienzo.top - (mesaArrastrada.offsetHeight / 2);

    x = Math.round(x / 80) * 80;
    y = Math.round(y / 80) * 80;

    if (x < 0) x = 0; if (y < 0) y = 0;
    if (x > 720) x = 720; if (y > 520) y = 520;

    mesaArrastrada.style.left = `${x}px`;
    mesaArrastrada.style.top = `${y}px`;
}

function soltar() {
    if (!mesaArrastrada) return;
    const id = parseInt(mesaArrastrada.dataset.id);
    const mesaObj = mesasDelMapa.find(m => m.idMesa === id);
    if (mesaObj) {
        mesaObj.posicionX = parseInt(mesaArrastrada.style.left);
        mesaObj.posicionY = parseInt(mesaArrastrada.style.top);
    }
    document.removeEventListener('mousemove', arrastrar);
    document.removeEventListener('mouseup', soltar);
    mesaArrastrada = null;
}

document.getElementById('btnGuardarMapa').addEventListener('click', async () => {
    const btn = document.getElementById('btnGuardarMapa');
    btn.textContent = "Guardando..."; btn.disabled = true;
    try {
        const promesas = mesasDelMapa.map(mesa => {
            return fetch(`http://localhost:8080/api/mesas/${mesa.idMesa}/posicion`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ posicionX: mesa.posicionX || 0, posicionY: mesa.posicionY || 0 })
            });
        });
        await Promise.all(promesas);
        alert("¡Guardado!");
    } catch (e) { alert("Error"); }
    finally { btn.textContent = "💾 Guardar Distribución"; btn.disabled = false; }
});

// ==========================================
// LÓGICA DEL MÓDULO: ARQUEO Y VENTAS
// ==========================================

async function cargarArqueoYVentas() {
    try {
        const response = await fetch('http://localhost:8080/api/facturas');
        if (!response.ok) return;

        const facturas = await response.json();
        const tbody = document.getElementById('tablaVentasAdmin');
        tbody.innerHTML = '';

        let totalGeneral = 0, totalEfectivo = 0, totalTarjetas = 0, totalMP = 0;

        facturas.slice().reverse().forEach(fac => {
            const monto = parseFloat(fac.total);
            totalGeneral += monto;

            if (fac.metodoPago === 'EFECTIVO') totalEfectivo += monto;
            else if (fac.metodoPago === 'MERCADO_PAGO') totalMP += monto;
            else totalTarjetas += monto;

            // TRADUCTOR DE FECHAS DE SPRING BOOT
            let fechaLegible = "Fecha desconocida";
            if (fac.fechaFactura) {
                let fParsed;
                if (Array.isArray(fac.fechaFactura)) {
                    // Spring envía [Año, Mes, Dia, Hora, Minuto]
                    fParsed = new Date(fac.fechaFactura[0], fac.fechaFactura[1] - 1, fac.fechaFactura[2], fac.fechaFactura[3] || 0, fac.fechaFactura[4] || 0);
                } else {
                    fParsed = new Date(fac.fechaFactura);
                }
                fechaLegible = fParsed.toLocaleString('es-AR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });
            }

            const metodoLimpio = fac.metodoPago ? fac.metodoPago.replace('_', ' ') : 'DESCONOCIDO';

            tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px; font-weight: bold; color: #4b5563;">#${fac.idFactura.toString().padStart(6, '0')}</td>
                    <td style="padding: 12px; color: #6b7280;">${fechaLegible}</td>
                    <td style="padding: 12px;"><span class="badge" style="background: #374151;">${metodoLimpio}</span></td>
                    <td style="padding: 12px; text-align: right; font-weight: bold; color: #10b981;">$${monto.toFixed(2)}</td>
                </tr>
            `;
        });

        document.getElementById('arqueoTotal').textContent = `$${totalGeneral.toFixed(2)}`;
        document.getElementById('arqueoEfectivo').textContent = `$${totalEfectivo.toFixed(2)}`;
        document.getElementById('arqueoTarjetas').textContent = `$${totalTarjetas.toFixed(2)}`;
        document.getElementById('arqueoMP').textContent = `$${totalMP.toFixed(2)}`;

    } catch (error) {
        console.error("Error al cargar facturas y arqueo:", error);
    }
}

// Evento de Tiempos con el mismo traductor de fechas
document.getElementById('btnVerTiempos')?.addEventListener('click', async () => {
    const panel = document.getElementById('panelTiempos');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';

    if (panel.style.display === 'block') {
        const tbody = document.getElementById('tablaTiemposAdmin');
        tbody.innerHTML = '<tr><td colspan="3">Cargando métricas...</td></tr>';

        try {
            const response = await fetch('http://localhost:8080/api/historial-mesas');
            const historial = await response.json();
            console.log(historial);
            tbody.innerHTML = '';

            historial.slice().reverse().forEach(h => {
                let horaStr = "Desconocida";
                if (h.timestamp) {
                    let fObj;
                    if (Array.isArray(h.timestamp)) {
                        fObj = new Date(h.timestamp[0], h.timestamp[1] - 1, h.timestamp[2], h.timestamp[3] || 0, h.timestamp[4] || 0, h.timestamp[5] || 0);
                    } else {
                        fObj = new Date(h.timestamp);
                    }
                    horaStr = fObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                }

                tbody.innerHTML += `
                    <tr style="border-bottom: 1px dashed #e5e7eb;">
                        <td style="padding: 10px; font-weight: bold;">Mesa ${h.mesa.numeroMesa}</td>
                        <td style="padding: 10px;"><span style="color:#6b7280;">${h.estadoAnterior || 'N/A'}</span> ➡️ <span style="font-weight:bold; color:#3b82f6;">${h.estadoNuevo}</span></td>
                        <td style="padding: 10px; color: #4b5563;">${horaStr}</td>
                    </tr>
                `;
            });
        } catch (e) {
            tbody.innerHTML = '<tr><td colspan="3">Error al cargar tiempos.</td></tr>';
        }
    }
});

// Asegurate de que el botón de tu HTML llame a esta función pasándole el ID de la mesa
async function registrarFacturaYLiberar(idMesa, idInstanciaActiva) {
    const totalTexto = document.getElementById('cobroTotalMesa').textContent || "0";
    const totalMesa = parseFloat(totalTexto.replace('$', ''));
    const metodoPagoSelect = document.getElementById('selectMetodoPago');
    const metodoPago = metodoPagoSelect ? metodoPagoSelect.value : 'EFECTIVO';

    const idCajero = usuarioLogueadoGlobal.id || usuarioLogueadoGlobal.idUsuario;

    const nuevaFactura = {
        idInstancia: idInstanciaActiva || 1, // Si no hay instancia, usa un default temporal
        idCajero: idCajero,
        total: totalMesa,
        metodoPago: metodoPago
    };

    try {
        // 1. Guardamos la venta en el historial (Arqueo)
        await fetch('http://localhost:8080/api/facturas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaFactura)
        });

        // 2. Liberamos la mesa
        await fetch(`http://localhost:8080/api/mesas/${idMesa}/estado?nuevoEstado=LIBRE`, {
            method: 'PUT'
        });

        alert("Cobro registrado y mesa liberada con éxito.");

        // 3. Recargar vistas
        cargarArqueoYVentas();
        // Si tenés una función para cerrar el modal de cobro, llamala acá
    } catch (error) {
        alert("Error al procesar la factura.");
    }
}
