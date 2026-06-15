// Variables globales para mantener el estado
let mesaSeleccionada = null;
let usuarioLogueadoGlobal = null;

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. CONTROL DE SEGURIDAD
    usuarioLogueadoGlobal = JSON.parse(localStorage.getItem('usuarioLogueado'));
    
    if (!usuarioLogueadoGlobal || (usuarioLogueadoGlobal.rol !== 'MOZO' && usuarioLogueadoGlobal.rol !== 'ADMIN')) {
        window.location.href = 'index.html';
        return; 
    }

    document.getElementById('nombreUsuario').textContent = `Hola, ${usuarioLogueadoGlobal.nombre}`;

    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('usuarioLogueado');
        window.location.href = 'index.html';
    });

    // 2. CARGAR LAS MESAS DESDE JAVA
    cargarMesas();

    // 3. LÓGICA DEL BOTÓN 'X'
    document.getElementById('btnCerrarPanel').addEventListener('click', () => {
        document.getElementById('faseContenido').style.display = 'none';
        document.getElementById('faseVacia').style.display = 'flex';
        mesaSeleccionada = null; // Limpiamos la selección
    });

    // 4. EVENTO: BOTÓN CONFIRMAR APERTURA
    document.getElementById('btnAbrirMesa').addEventListener('click', abrirMesa);
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

// EL CEREBRO DEL PANEL CAMALEÓN
function abrirPanelComanda(mesa) {
    mesaSeleccionada = mesa; // Guardamos en la variable global
    
    const faseVacia = document.getElementById('faseVacia');
    const faseContenido = document.getElementById('faseContenido');
    const faseApertura = document.getElementById('faseApertura');
    const faseActiva = document.getElementById('faseActiva');
    const panelFooter = document.getElementById('panelFooterAcciones');
    const titulo = document.getElementById('tituloMesa');
    
    titulo.textContent = `Mesa ${mesa.numeroMesa}`;
    faseVacia.style.display = 'none';
    faseContenido.style.display = 'flex';

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
        faseApertura.style.display = 'none';
        faseActiva.style.display = 'block';
        panelFooter.style.display = 'flex'; 

        document.getElementById('resumenMozo').textContent = usuarioLogueadoGlobal.nombre; 
        document.getElementById('resumenHora').textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        // Si hay valor en el input (de cuando la abrimos), lo mostramos. Si no, queda pendiente.
        const comensalesInput = document.getElementById('inputComensales').value;
        document.getElementById('resumenComensales').textContent = comensalesInput || "?"; 
    }
}

// FUNCIÓN PARA ABRIR LA MESA EN EL BACKEND
async function abrirMesa() {
    if (!mesaSeleccionada) return;

    const btn = document.getElementById('btnAbrirMesa');
    btn.disabled = true;
    btn.textContent = 'Abriendo...';

    try {
        // 1. Enviamos el PUT a Java para cambiar el estado
        const responseMesa = await fetch(`http://localhost:8080/api/mesas/${mesaSeleccionada.idMesa}/estado?nuevoEstado=OCUPADA`, {
            method: 'PUT'
        });

        if (responseMesa.ok) {
            // 2. Actualizamos la variable local
            mesaSeleccionada.estado = 'OCUPADA';
            
            // 3. Recargamos el mapa para que la mesa se pinte de rojo
            await cargarMesas();
            
            // 4. Forzamos la vista al estado ACTIVO (Fase 2)
            abrirPanelComanda(mesaSeleccionada);
        } else {
            alert("Hubo un error al intentar abrir la mesa.");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("No se pudo conectar con el servidor.");
    } finally {
        // Restauramos el botón
        btn.disabled = false;
        btn.textContent = 'Confirmar Apertura';
    }
}