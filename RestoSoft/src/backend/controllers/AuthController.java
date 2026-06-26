package backend.controllers;

import backend.models.Usuario;
import backend.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String email, @RequestParam String password) {
        // Buscamos si existe el usuario por email
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);

        if (usuarioOpt.isPresent() && usuarioOpt.get().getPassword().equals(password)) {
            Usuario usuarioValido = usuarioOpt.get();
            
            // PARCHE DE SEGURIDAD: Evitar login de usuarios desactivados (Borrado Lógico)
            if (usuarioValido.getActivo() == null || !usuarioValido.getActivo()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                     .body("Error: Este usuario ha sido desactivado del sistema.");
            }

            // Por seguridad, borramos la contraseña antes de mandarla al frontend
            usuarioValido.setPassword(null); 
            return ResponseEntity.ok(usuarioValido);
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                             .body("Error: Credenciales incorrectas."); // 401 Error de credenciales
    }
}