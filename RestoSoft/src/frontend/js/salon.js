// Variables globales para mantener el estado
let mesaSeleccionada = null;
let usuarioLogueadoGlobal = null;
let menuProductos = [];
let carritoPreview = [];

document.addEventListener("DOMContentLoaded", () => {

    // 1. CONTROL DE SEGURIDAD
    const userStored = localStorage.getItem('usuarioLogueado');
    if (!userStored) {
        window.location.href = 'index.html';
        return;
    }

    usuarioLogueadoGlobal = JSON.parse(userStored);

    // Mostramos nombre
    const nombreDisplay = document.getElementById('nombreUsuario');
    if (nombreDisplay) {
        nombreDisplay.textContent = `Hola, ${usuarioLogueadoGlobal.nombre} (${usuarioLogueadoGlobal.rol})`;
    }

    // 2. SEGURIDAD DE MENÚ
    const navAdmin = document.getElementById('navAdmin');
    if (navAdmin && (usuarioLogueadoGlobal.rol === 'MOZO' || usuarioLogueadoGlobal.rol === 'COCINA')) {
        navAdmin.style.display = 'none';
    }

    // 3. LOGOUT
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('usuarioLogueado');
            window.location.href = 'index.html';
        });
    }

    // 4. LÓGICA DE LAS PESTAÑAS DE SECTORES
    const botonesSector = document.querySelectorAll('.tab-btn');
    botonesSector.forEach(boton => {
        boton.addEventListener('click', (e) => {
            botonesSector.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    // 5. CARGA INICIAL
    cargarMesas();
    cargarMenu();
    setInterval(cargarMesas, 10000);

    // 6. LÓGICA DEL BOTÓN 'X' DEL PANEL
    document.getElementById('btnCerrarPanel').addEventListener('click', () => {
        document.getElementById('faseContenido').style.display = 'none';
        document.getElementById('faseVacia').style.display = 'flex';
        mesaSeleccionada = null;
        carritoPreview = [];
        renderizarPreview();
    });

    // 7. EVENTOS DE APERTURA Y COMANDAS
    document.getElementById('btnAbrirMesa').addEventListener('click', abrirMesa);

    document.getElementById('selectProducto').addEventListener('change', (event) => {
        const idProducto = event.target.value;
        if (idProducto) {
            agregarAlPreview(idProducto);
            event.target.value = "";
        }
    });

    document.getElementById('btnCancelarPreview').addEventListener('click', () => {
        carritoPreview = [];
        renderizarPreview();
    });

    document.getElementById('btnConfirmarPedido').addEventListener('click', enviarPedidoACocina);

    // 8. EVENTOS DE CIERRE DE MESA
    document.getElementById('btnEstadoComiendo').addEventListener('click', marcarComoComiendo);
    document.getElementById('btnEstadoCobrar').addEventListener('click', () => cambiarEstadoMesaLocal('POR_COBRAR'));
});

async function cargarMesas() {
    try {
        // Obtenemos las mesas
        const response = await fetch('http://localhost:8080/api/mesas');
        const mesas = await response.json();

        // Obtenemos las comandas para ver si alguna está "LISTO"
        const responseComandas = await fetch('http://localhost:8080/api/comandas');
        const comandas = await responseComandas.json();

        // Filtramos qué IDs de mesa tienen pedidos listos
        const mesasConPedidosListos = comandas
            .filter(c => c.estado === 'LISTO')
            .map(c => c.mesa.idMesa);

        const gridMesas = document.getElementById('gridMesas');
        gridMesas.innerHTML = '';

        mesas.forEach(mesa => {
            const mesaCard = document.createElement('div');
            mesaCard.classList.add('mesa-card');

            if (mesa.estado === 'LIBRE') mesaCard.classList.add('mesa-libre');
            else if (mesa.estado === 'OCUPADA') mesaCard.classList.add('mesa-ocupada');
            else if (mesa.estado === 'PEDIDO_EN_CURSO') mesaCard.classList.add('mesa-pedido');
            else if (mesa.estado === 'POR_COBRAR') mesaCard.classList.add('mesa-cobrar');

            // LÓGICA DE LA CAMPANITA
            let alertaHTML = '';
            if (mesasConPedidosListos.includes(mesa.idMesa)) {
                mesaCard.style.border = '3px solid #10b981';
                mesaCard.classList.add('parpadeo-listo');
                alertaHTML = `<div style="color: #10b981; font-weight: bold; font-size: 1.2rem; margin-top: 5px; text-align: center;">🔔 ¡LISTO!</div>`;
            }

            mesaCard.innerHTML = `
                <h3>${mesa.numeroMesa}</h3>
                <p>${mesa.estado.replace(/_/g, ' ')}</p>
                <small>Cap: ${mesa.capacidad}</small>
                ${alertaHTML}
            `;

            mesaCard.addEventListener('click', () => abrirPanelComanda(mesa));
            gridMesas.appendChild(mesaCard);
        });

    } catch (error) {
        console.error("Error al cargar las mesas:", error);
    }
}

// EL CEREBRO DEL PANEL
async function abrirPanelComanda(mesa) {
    mesaSeleccionada = mesa;

    const faseVacia = document.getElementById('faseVacia');
    const faseContenido = document.getElementById('faseContenido');
    const faseApertura = document.getElementById('faseApertura');
    const faseActiva = document.getElementById('faseActiva');
    const panelFooter = document.getElementById('panelFooterAcciones');
    const titulo = document.getElementById('tituloMesa');

    titulo.textContent = `Mesa ${mesa.numeroMesa}`;
    faseVacia.style.display = 'none';
    faseContenido.style.display = 'flex';

    // Limpiamos la preview temporal al cambiar de mesa
    carritoPreview = [];
    renderizarPreview();

    if (mesa.estado === 'LIBRE') {
        faseApertura.style.display = 'block';
        faseActiva.style.display = 'none';
        panelFooter.style.display = 'none';

        const contMozo = document.getElementById('contenedorMozo');
        if (usuarioLogueadoGlobal.rol === 'ADMIN') {
            contMozo.innerHTML = `<input type="text" id="inputMozo" value="${usuarioLogueadoGlobal.nombre}" class="form-input" style="width:100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;">`;
        } else {
            contMozo.innerHTML = `<input type="text" id="inputMozo" value="${usuarioLogueadoGlobal.nombre}" class="form-input" disabled style="width:100%; padding: 0.5rem; background-color: #e5e7eb; border: 1px solid #ccc; border-radius: 4px;">`;
        }
    } else {
        try {
            const response = await fetch(`http://localhost:8080/api/instancias/mesa/${mesa.idMesa}`);
            if (response.ok) {
                const instancia = await response.json();
                document.getElementById('resumenMozo').textContent = instancia.mozo.nombre;
                document.getElementById('resumenHora').textContent = new Date(instancia.fechaApertura).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                mesaSeleccionada.idInstanciaActual = instancia.idInstancia;

                // Buscamos el consumo activo (los ítems que ya se enviaron en TODAS las comandas)
                const resComanda = await fetch(`http://localhost:8080/api/comandas/instancia/${instancia.idInstancia}`);
                const listaConsumo = document.getElementById('listaConsumo');

                if (listaConsumo) {
                    listaConsumo.innerHTML = ''; // Limpiamos la lista antes de llenarla

                    if (resComanda.ok) {
                        const comandasDeInstancia = await resComanda.json(); // Recibimos un Array

                        // Unificamos todos los items de todas las comandas en una sola lista
                        let todosLosItems = [];
                        comandasDeInstancia.forEach(comanda => {
                            if (comanda.items) {
                                todosLosItems.push(...comanda.items);
                            }
                        });

                       if (todosLosItems.length > 0) {
                            todosLosItems.forEach(item => {
                                // 1. Preguntamos si el ítem fue cancelado
                                const isCancelado = item.cancelado === true;
                                
                                // 2. Definimos el estilo: si está cancelado, tachado y gris. Si no, normal.
                                const estiloFila = isCancelado 
                                    ? "display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; padding:8px; background:#e5e7eb; border-radius:4px; text-decoration: line-through; color: #9ca3af;" 
                                    : "display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; padding:8px; background:#f3f4f6; border-radius:4px;";
                                
                                // 3. Definimos el botón: si está cancelado, mostramos un texto. Si no, la basurita.
                                const accionHTML = isCancelado 
                                    ? `<span style="font-size:0.8rem; font-style:italic; color: #ef4444;">Cancelado</span>` 
                                    : `<button onclick="borrarItemConsumo(${item.idItem})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:1.2rem;" title="Cancelar Pedido">🗑️</button>`;

                                listaConsumo.innerHTML += `
                                    <li style="${estiloFila}">
                                        <span><strong>${item.cantidad}x</strong> ${item.producto.nombre}</span>
                                        <div style="display:flex; align-items:center; gap:10px;">
                                            <span style="font-weight:bold;">$${item.subtotal}</span>
                                            ${accionHTML}
                                        </div>
                                    </li>
                                `;
                            });
                        } else {
                            listaConsumo.innerHTML = '<p style="color:gray;">No hay consumo registrado.</p>';
                        }
                    } else {
                        listaConsumo.innerHTML = '<p style="color:gray;">No hay consumo registrado.</p>';
                    }
                }
            }
        } catch (e) {
            console.log("No se pudo obtener la instancia activa o el consumo", e);
        }

        faseApertura.style.display = 'none';
        faseActiva.style.display = 'block';
        panelFooter.style.display = 'flex';
    }
}

async function abrirMesa() {
    if (!mesaSeleccionada) return;

    const btn = document.getElementById('btnAbrirMesa');
    btn.disabled = true;
    btn.textContent = 'Abriendo...';

    try {
        const url = `http://localhost:8080/api/mesas/${mesaSeleccionada.idMesa}/estado?nuevoEstado=OCUPADA&idUsuario=${usuarioLogueadoGlobal.id}`;

        const responseMesa = await fetch(url, { method: 'PUT' });

        if (responseMesa.ok) {
            const data = await responseMesa.json();

            mesaSeleccionada.estado = 'OCUPADA';

            if (data.idInstanciaActiva) {
                mesaSeleccionada.idInstanciaActual = data.idInstanciaActiva;
            }

            await cargarMesas();
            abrirPanelComanda(mesaSeleccionada);
        } else {
            alert("Hubo un error al intentar abrir la mesa.");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("No se pudo conectar con el servidor.");
    } finally {
        btn.disabled = false;
        btn.textContent = 'Confirmar Apertura';
    }
}

// --- FUNCIONES DE LA FASE 2: COMANDAS ---

async function cargarMenu() {
    try {
        const response = await fetch('http://localhost:8080/api/productos');
        menuProductos = await response.json();

        const selectProducto = document.getElementById('selectProducto');
        selectProducto.innerHTML = '<option value="">Seleccione un producto...</option>';

        menuProductos.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.idProducto;
            option.textContent = `${producto.nombre} - $${producto.precio}`;
            selectProducto.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar el menú:", error);
    }
}

function agregarAlPreview(idProductoBuscado) {
    const producto = menuProductos.find(p => p.idProducto == idProductoBuscado);

    if (producto) {
        const itemExistente = carritoPreview.find(item => item.producto.idProducto == idProductoBuscado);

        if (itemExistente) {
            itemExistente.cantidad++;
        } else {
            carritoPreview.push({
                producto: producto,
                cantidad: 1,
                comentario: ""
            });
        }
        renderizarPreview();
    }
}

function modificarCantidad(index, delta) {
    carritoPreview[index].cantidad += delta;
    if (carritoPreview[index].cantidad <= 0) {
        carritoPreview.splice(index, 1);
    }
    renderizarPreview();
}

function eliminarDelPreview(index) {
    carritoPreview.splice(index, 1);
    renderizarPreview();
}

function actualizarComentario(index, texto) {
    carritoPreview[index].comentario = texto;
}

function toggleComentario(index) {
    const input = document.getElementById(`comentario-${index}`);
    if (input.style.display === 'none') {
        input.style.display = 'block';
        input.focus();
    } else {
        if (input.value.trim() === '') {
            input.style.display = 'none';
        }
    }
}

function renderizarPreview() {
    const listaPreview = document.getElementById('listaPreview');
    listaPreview.innerHTML = '';

    let totalTemporal = 0;

    carritoPreview.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'preview-item';

        const subtotal = item.producto.precio * item.cantidad;
        totalTemporal += subtotal;

        li.innerHTML = `
            <div class="preview-item-main">
                <div style="display: flex; flex-direction: column;">
                    <strong>${item.producto.nombre}</strong>
                    <span style="font-size: 0.8rem; color: #6b7280;">$${item.producto.precio} c/u</span>
                </div>
                <div class="preview-controls">
                    <button class="btn-qty" onclick="modificarCantidad(${index}, -1)">-</button>
                    <span style="font-weight: bold; min-width: 20px; text-align: center;">${item.cantidad}</span>
                    <button class="btn-qty" onclick="modificarCantidad(${index}, 1)">+</button>
                    
                    <span style="margin-left: 0.5rem; font-weight: bold; width: 55px; text-align: right;">$${subtotal}</span>
                    
                    <button class="btn-icon" onclick="toggleComentario(${index})" title="Aclaraciones">✏️</button>
                    <button class="btn-icon" onclick="eliminarDelPreview(${index})" title="Eliminar">🗑️</button>
                </div>
            </div>
            <input type="text" 
                   class="comentario-input" 
                   id="comentario-${index}" 
                   placeholder="Ej: Sin cebolla..." 
                   value="${item.comentario}" 
                   onchange="actualizarComentario(${index}, this.value)"
                   style="display: ${item.comentario ? 'block' : 'none'};">
        `;
        listaPreview.appendChild(li);
    });

    const btnConfirmar = document.getElementById('btnConfirmarPedido');

    if (carritoPreview.length > 0) {
        const liTotal = document.createElement('li');
        liTotal.style.display = 'flex';
        liTotal.style.justifyContent = 'space-between';
        liTotal.style.fontWeight = 'bold';
        liTotal.style.borderTop = '2px solid #ccc';
        liTotal.style.paddingTop = '0.75rem';
        liTotal.style.marginTop = '0.5rem';
        liTotal.innerHTML = `
            <span>TOTAL ESTIMADO</span>
            <span>$${totalTemporal}</span>
        `;
        listaPreview.appendChild(liTotal);
        btnConfirmar.disabled = false;
    } else {
        btnConfirmar.disabled = true;
    }
}

async function enviarPedidoACocina() {
    if (carritoPreview.length === 0 || !mesaSeleccionada) return;

    const btn = document.getElementById('btnConfirmarPedido');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    const paqueteComanda = {
        idMesa: mesaSeleccionada.idMesa,
        idUsuario: usuarioLogueadoGlobal.id,
        idInstancia: mesaSeleccionada.idInstanciaActual,
        detalles: carritoPreview.map(item => ({
            idProducto: item.producto.idProducto,
            cantidad: item.cantidad,
            comentarios: item.comentario
        }))
    };

    try {
        const response = await fetch('http://localhost:8080/api/comandas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paqueteComanda)
        });

        if (response.ok) {
            carritoPreview = [];
            renderizarPreview();

            mesaSeleccionada.estado = 'PEDIDO_EN_CURSO';
            await cargarMesas();

            alert("¡Pedido enviado a la cocina exitosamente!");
        } else {
            alert("Error al enviar el pedido. Por favor, intentá nuevamente.");
        }
    } catch (error) {
        console.error("Error al comunicar con el backend:", error);
        alert("Falla de conexión.");
    } finally {
        btn.textContent = 'Enviar a Cocina';
        if (carritoPreview.length > 0) btn.disabled = false;
    }
}

// --- FUNCIONES DE LA FASE 3: CIERRE DE MESA ---
async function cambiarEstadoMesaLocal(nuevoEstado) {
    if (!mesaSeleccionada) return;

    try {
        const response = await fetch(`http://localhost:8080/api/mesas/${mesaSeleccionada.idMesa}/estado?nuevoEstado=${nuevoEstado}`, {
            method: 'PUT'
        });

        if (response.ok) {
            mesaSeleccionada.estado = nuevoEstado;
            await cargarMesas();
            abrirPanelComanda(mesaSeleccionada);
        } else {
            alert("Error al cambiar el estado de la mesa.");
        }
    } catch (error) {
        console.error("Falla de conexión al cambiar estado:", error);
    }
}

// LÓGICA PARA EL BOTÓN COMIENDO
async function marcarComoComiendo() {
    if (!mesaSeleccionada) return;

    try {
        // 1. Buscamos todas las comandas de esta instancia
        const resComanda = await fetch(`http://localhost:8080/api/comandas/instancia/${mesaSeleccionada.idInstanciaActual}`);
        if (resComanda.ok) {
            const comandas = await resComanda.json();

            // 2. A todas las que estén en la bandeja listas, las pasamos a ENTREGADO
            for (let c of comandas) {
                if (c.estado === 'LISTO') {
                    await fetch(`http://localhost:8080/api/comandas/${c.idComanda}/estado?nuevoEstado=ENTREGADO`, { method: 'PUT' });
                }
            }
        }
    } catch (e) {
        console.error("Error al avisar a cocina que se entregó el pedido", e);
    }

    // 3. Cambiamos la mesa a OCUPADA (esto recarga las mesas y quita la campanita)
    cambiarEstadoMesaLocal('OCUPADA');
}

// --- FUNCION DE CANCELACIÓN DE ITEMS ---
async function borrarItemConsumo(idItem) {
    // Validación de seguridad para que nunca mande un undefined
    if (!idItem) {
        alert("No se puede identificar el ítem a cancelar.");
        return;
    }

    // Obtenemos el ID correcto del usuario (probamos con .id y .idUsuario por las dudas)
    const userId = usuarioLogueadoGlobal.id || usuarioLogueadoGlobal.idUsuario;
    if (!userId) {
        alert("Error de sesión: No se encuentra el ID del usuario.");
        return;
    }

    // 1. Pedimos el motivo al mozo
    const motivo = prompt("Por favor, ingrese el motivo de la cancelación:");
    
    // Si presiona "Cancelar" o la 'X' en la ventanita, cortamos la ejecución
    if (motivo === null) return; 
    
    // Si no escribe nada y le da a Aceptar, lo retamos
    if (motivo.trim() === "") {
        alert("¡Debe ingresar una justificación obligatoria para cancelar un producto!");
        return;
    }

    try {
        const url = `http://localhost:8080/api/comandas/items/${idItem}/cancelar?idUsuario=${userId}&motivo=${encodeURIComponent(motivo)}`;
        
        const response = await fetch(url, { method: 'PUT' });

        if (response.ok) {
            abrirPanelComanda(mesaSeleccionada);
        } else {
            alert("No se pudo cancelar el producto del sistema.");
        }
    } catch (error) {
        console.error("Falla de conexión:", error);
        alert("Hubo un error al intentar comunicar con el servidor.");
    }
}