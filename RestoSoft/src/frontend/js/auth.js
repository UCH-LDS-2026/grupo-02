document.getElementById('loginForm').addEventListener('submit', async (event) => {
    // 1. Evitamos que la página se recargue al tocar el botón
    event.preventDefault();

    // 2. Capturamos lo que escribió el usuario
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    // Ocultamos el error por si quedó prendido de un intento anterior
    errorMessage.style.display = 'none';

    try {
        // 3. Hacemos la petición a tu API en Spring Boot
        // Recordá que configuramos Java para recibir los datos en la URL (@RequestParam)
        const response = await fetch(`http://localhost:8080/api/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
            method: 'POST'
        });

        // 4. Si el login es exitoso (Código 200)
        if (response.ok) {
            const usuario = await response.json();
            
            // Guardamos los datos del usuario en la memoria del navegador
            localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));

            // ¡Acá está la magia de los roles! Redirigimos según quién entró
            if (usuario.rol === 'MOZO') {
                window.location.href = 'salon.html';
            } else if (usuario.rol === 'COCINERO') {
                window.location.href = 'cocina.html';
            } else if (usuario.rol === 'ADMIN' || usuario.rol === 'CAJERO') {
                window.location.href = 'administracion.html';
            } else {
                window.location.href = 'salon.html'; // Default por si acaso
            }
        } else {
            // 5. Si Java devuelve 401 Unauthorized, mostramos el texto rojo
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("No se pudo conectar con el servidor. ¿Asegurate de que Spring Boot esté corriendo (Run)?");
    }
});