let usuarioLogueadoGlobal = null;
let mesaParaCobrar = null;

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

           // Si entra a Caja, recargamos los datos
            if(targetId === 'sec-caja') cargarMesasPorCobrar();
            
            if(targetId === 'sec-menu') cargarProductosAdmin();
        });
    });

    // 3. INICIO DE MÓDULO CAJA
    cargarMesasPorCobrar();
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
            if(mesaParaCobrar && mesaParaCobrar.idMesa === mesa.idMesa) {
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
    elementoHtml.classList.add('selected');

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

        document.getElementById('cobroTotalMesa').textContent = `$${total.toFixed(2)}`;

    } catch (e) {
        console.error("Error obteniendo detalles del cobro", e);
        listaConsumo.innerHTML = '<li style="color:red;">Error al cargar los datos</li>';
    }
}

async function registrarCobro() {
    if (!mesaParaCobrar) return;

    const btn = document.getElementById('btnRegistrarCobro');
    btn.disabled = true;
    btn.textContent = 'Procesando...';

    // Aquí en la Fase 4 llamaremos al endpoint que crea la "Factura" real.
    // Por ahora, para liberar el ciclo, simplemente pasamos la mesa a LIBRE,
    // lo cual permite que el mozo la vuelva a usar inmediatamente.
    try {
        const response = await fetch(`http://localhost:8080/api/mesas/${mesaParaCobrar.idMesa}/estado?nuevoEstado=LIBRE`, {
            method: 'PUT'
        });

        if (response.ok) {
            alert("¡Cobro registrado exitosamente! La mesa ya está libre.");
            document.getElementById('panelDetalleCobro').style.display = 'none';
            mesaParaCobrar = null;
            cargarMesasPorCobrar();
        } else {
            alert("Hubo un error al liberar la mesa.");
        }
    } catch (error) {
        alert("Falla de conexión al cobrar.");
    } finally {
        btn.disabled = false;
        btn.textContent = '✅ Registrar Pago y Liberar Mesa';
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
        
        if(producto.categoria) {
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