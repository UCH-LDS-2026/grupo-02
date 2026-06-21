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

    // 4. CARGA INICIAL
    cargarMesas();
    cargarMenu();

    // 5. LÓGICA DEL BOTÓN 'X' DEL PANEL
    document.getElementById('btnCerrarPanel').addEventListener('click', () => {
        document.getElementById('faseContenido').style.display = 'none';
        document.getElementById('faseVacia').style.display = 'flex';
        mesaSeleccionada = null;
        carritoPreview = []; 
        renderizarPreview();
    });

    // 6. EVENTOS DE APERTURA Y COMANDAS
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

    // 7. EVENTOS DE CIERRE DE MESA
    document.getElementById('btnEstadoComiendo').addEventListener('click', () => cambiarEstadoMesaLocal('OCUPADA'));
    document.getElementById('btnEstadoCobrar').addEventListener('click', () => cambiarEstadoMesaLocal('POR_COBRAR'));
});

async function cargarMesas() {
    try {
        const response = await fetch('http://localhost:8080/api/mesas');
        const mesas = await response.json();
        const gridMesas = document.getElementById('gridMesas');
        
        gridMesas.innerHTML = ''; 

        mesas.forEach(mesa => {
            const mesaCard = document.createElement('div');
            mesaCard.classList.add('mesa-card');
            
            if (mesa.estado === 'LIBRE') mesaCard.classList.add('mesa-libre');
            else if (mesa.estado === 'OCUPADA') mesaCard.classList.add('mesa-ocupada');
            else if (mesa.estado === 'PEDIDO_EN_CURSO') mesaCard.classList.add('mesa-pedido');
            else if (mesa.estado === 'POR_COBRAR') mesaCard.classList.add('mesa-cobrar');

            mesaCard.innerHTML = `
                <h3>${mesa.numeroMesa}</h3>
                <p>${mesa.estado.replace(/_/g, ' ')}</p>
                <small>Cap: ${mesa.capacidad}</small>
            `;

            mesaCard.addEventListener('click', () => abrirPanelComanda(mesa));
            gridMesas.appendChild(mesaCard);
        });

    } catch (error) {
        console.error("Error al cargar las mesas:", error);
    }
}

// EL CEREBRO DEL PANEL - AHORA ASYNC PARA PERMITIR AWAIT
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
                document.getElementById('resumenHora').textContent = new Date(instancia.fechaApertura).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                mesaSeleccionada.idInstanciaActual = instancia.idInstancia;
            }
        } catch (e) {
            console.log("No se pudo obtener la instancia activa");
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
            carritoPreview.push({ producto: producto, cantidad: 1, comentario: "" });
        }
        renderizarPreview();
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
                <strong>${item.producto.nombre}</strong>
                <div class="preview-controls">
                    <button onclick="modificarCantidad(${index}, -1)">-</button>
                    <span>${item.cantidad}</span>
                    <button onclick="modificarCantidad(${index}, 1)">+</button>
                    <span>$${subtotal}</span>
                </div>
            </div>
        `;
        listaPreview.appendChild(li);
    });
}

async function enviarPedidoACocina() {
    if (carritoPreview.length === 0 || !mesaSeleccionada) return;
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paqueteComanda)
        });
        if (response.ok) {
            carritoPreview = [];
            renderizarPreview();
            mesaSeleccionada.estado = 'PEDIDO_EN_CURSO';
            await cargarMesas();
            alert("¡Pedido enviado a la cocina exitosamente!");
        }
    } catch (error) {
        alert("Falla de conexión.");
    }
}

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
        }
    } catch (error) {
        console.error("Falla de conexión:", error);
    }
}