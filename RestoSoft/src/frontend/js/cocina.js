document.addEventListener("DOMContentLoaded", () => {
    
    // 1. CONTROL DE SEGURIDAD
    const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado'));
    
    // Ahora permitimos COCINA, ADMIN y también MOZO
    if (!usuarioLogueado || (usuarioLogueado.rol !== 'COCINA' && usuarioLogueado.rol !== 'ADMIN' && usuarioLogueado.rol !== 'MOZO')) {
        window.location.href = 'index.html';
        return; 
    }
    
    // Le mostramos su nombre real, ya sea Mozo o Chef
    document.getElementById('nombreUsuario').textContent = `${usuarioLogueado.nombre} (${usuarioLogueado.rol})`;

    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('usuarioLogueado');
        window.location.href = 'index.html';
    });

    const navAdmin = document.querySelector('a[href="administracion.html"]');
    if (navAdmin && (usuarioLogueado.rol === 'MOZO' || usuarioLogueado.rol === 'COCINA')) {
        navAdmin.style.display = 'none';
    }

    // 2. CARGAR EL TABLERO INICIAL
    cargarTablero();

    // 3. RECARGA AUTOMÁTICA (Opcional pero recomendado)
    // Recarga los pedidos cada 10 segundos para que el chef no tenga que apretar F5
    setInterval(cargarTablero, 10000); 
});

async function cargarTablero() {
    try {
        const response = await fetch('http://localhost:8080/api/comandas');
        const comandas = await response.json();

        // Limpiamos las tres columnas
        const colPendientes = document.getElementById('columnaPendientes');
        const colProduccion = document.getElementById('columnaProduccion');
        const colListos = document.getElementById('columnaListos');
        
        colPendientes.innerHTML = '';
        colProduccion.innerHTML = '';
        colListos.innerHTML = '';

        let contPendientes = 0, contProduccion = 0, contListos = 0;

        comandas.forEach(comanda => {
            // Solo dibujamos si NO está entregada (las entregadas ya no le importan a la cocina)
            if (comanda.estado !== 'ENTREGADO') {
                const ticket = crearTicketHTML(comanda);

                if (comanda.estado === 'PENDIENTE') {
                    colPendientes.appendChild(ticket);
                    contPendientes++;
                } else if (comanda.estado === 'EN_PRODUCCION') {
                    colProduccion.appendChild(ticket);
                    contProduccion++;
                } else if (comanda.estado === 'LISTO') {
                    colListos.appendChild(ticket);
                    contListos++;
                }
            }
        });

        // Actualizamos los numeritos de las insignias (badges) arriba de cada columna
        document.querySelector('.column-pendientes .badge').textContent = contPendientes;
        document.querySelector('.column-produccion .badge').textContent = contProduccion;
        document.querySelector('.column-listos .badge').textContent = contListos;

    } catch (error) {
        console.error("Error al cargar el tablero:", error);
    }
}

function crearTicketHTML(comanda) {
    const div = document.createElement('div');
    div.className = 'ticket-card';

    // Extraemos solo la hora de la fecha larguísima que manda Java
    const hora = new Date(comanda.fechaCreacion).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    // Armamos la lista de platos (si Java nos mandó el array de items)
    let itemsHTML = '';
    if (comanda.items && comanda.items.length > 0) {
        comanda.items.forEach(item => {
            itemsHTML += `
                <li>
                    <span class="item-qty">${item.cantidad}x</span> ${item.producto.nombre}
                    ${item.comentario ? `<span class="item-comment">📝 ${item.comentario}</span>` : ''}
                </li>
            `;
        });
    } else {
        itemsHTML = '<li>Sin platos cargados</li>';
    }

    // Configuramos el botón de abajo según en qué estado esté
    let botonHTML = '';
    if (comanda.estado === 'PENDIENTE') {
        botonHTML = `<button class="btn-ticket btn-preparar" onclick="cambiarEstadoComanda(${comanda.idComanda}, 'EN_PRODUCCION')">Empezar a Preparar</button>`;
    } else if (comanda.estado === 'EN_PRODUCCION') {
        botonHTML = `<button class="btn-ticket btn-listo" onclick="cambiarEstadoComanda(${comanda.idComanda}, 'LISTO')">Marcar como Listo</button>`;
    } else {
        botonHTML = `<span style="display:block; text-align:center; color:#10b981; font-weight:bold; font-size:0.9rem;">Esperando al mozo...</span>`;
    }

    div.innerHTML = `
        <div class="ticket-header">
            Mesa ${comanda.mesa.numeroMesa}
            <span class="ticket-time">⏰ ${hora}</span>
        </div>
        <div class="ticket-body">
            <span class="ticket-mozo">Mozo: ${comanda.usuario.nombre}</span>
            <ul class="ticket-items">
                ${itemsHTML}
            </ul>
        </div>
        <div class="ticket-footer">
            ${botonHTML}
        </div>
    `;

    return div;
}

// Función que manda el PUT al backend cuando tocamos el botón de la tarjeta
async function cambiarEstadoComanda(idComanda, nuevoEstado) {
    try {
        const response = await fetch(`http://localhost:8080/api/comandas/${idComanda}/estado?nuevoEstado=${nuevoEstado}`, {
            method: 'PUT'
        });

        if (response.ok) {
            // Si el backend lo aceptó, recargamos el tablero entero para que la tarjeta cambie de columna
            cargarTablero();
        } else {
            alert("Error al actualizar el estado de la comanda.");
        }
    } catch (error) {
        console.error("Falla de conexión:", error);
    }
}