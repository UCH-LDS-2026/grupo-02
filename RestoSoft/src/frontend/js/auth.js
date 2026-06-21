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
        const response = await fetch(`http://localhost:8080/api/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
            method: 'POST'
        });

        // 4. Si el login es exitoso (Código 200)
        if (response.ok) {
            // EXTRAEMOS EL USUARIO DEL JSON DE RESPUESTA
            const usuario = await response.json(); 
            
            // Guardamos el usuario y mandamos a TODOS al salón
            localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));
            window.location.href = 'salon.html';
        } else {
            // Mostramos el mensaje de error visual en lugar de un alert molesto
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Usuario o contraseña incorrectos';
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("No se pudo conectar con el servidor. Por favor, intentá más tarde.");
    }
});