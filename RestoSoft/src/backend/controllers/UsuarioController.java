package backend.controllers;

import backend.models.Usuario;
import backend.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping
    public List<Usuario> obtenerTodos() {
        return usuarioRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> crearUsuario(@RequestBody Usuario nuevoUsuario) {
        // Podrías validar que el email no exista aquí
        Usuario guardado = usuarioRepository.save(nuevoUsuario);
        return ResponseEntity.ok(guardado);
    }

  @PutMapping("/{id}")
    public ResponseEntity<?> actualizarUsuario(@PathVariable Integer id, @RequestBody Usuario datos) {
        Optional<Usuario> userOpt = usuarioRepository.findById(id);
        if (userOpt.isPresent()) {
            Usuario existente = userOpt.get();
            existente.setNombre(datos.getNombre());
            existente.setApellido(datos.getApellido());
            existente.setEmail(datos.getEmail());
            existente.setPassword(datos.getPassword());
            existente.setRol(datos.getRol());
            
            // NUEVO: Permitimos actualizar el estado (para reactivaciones)
            if (datos.getActivo() != null) {
                existente.setActivo(datos.getActivo());
            }
            
            usuarioRepository.save(existente);
            return ResponseEntity.ok(existente);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Integer id) {
        Optional<Usuario> userOpt = usuarioRepository.findById(id);
        if (userOpt.isPresent()) {
            Usuario existente = userOpt.get();
            // BORRADO LÓGICO: Solo lo marcamos como inactivo
            existente.setActivo(false);
            usuarioRepository.save(existente);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}