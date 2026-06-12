package backend.controllers;

import backend.models.Mesa;
import backend.models.EstadoMesa;
import backend.repositories.MesaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/mesas")
@CrossOrigin(origins = "*") // Esto es magia pura: evita que el navegador bloquee tu HTML más adelante
public class MesaController {

    @Autowired
    private MesaRepository mesaRepository;

    // 1. Endpoint para crear una mesa (Así tenemos datos para probar)
    @PostMapping
    public Mesa crearMesa(@RequestBody Mesa nuevaMesa) {
        return mesaRepository.save(nuevaMesa);
    }

    // 2. Endpoint para ver todas las mesas (Para cargar el mapa del salón)
    @GetMapping
    public List<Mesa> obtenerTodasLasMesas() {
        return mesaRepository.findAll();
    }

    // 3. Endpoint para cambiar el estado (Issue 1: Apertura de mesa)
    @PutMapping("/{id}/estado")
    public ResponseEntity<Mesa> cambiarEstado(@PathVariable Integer id, @RequestParam EstadoMesa nuevoEstado) {
        Optional<Mesa> mesaOptional = mesaRepository.findById(id);

        if (mesaOptional.isPresent()) {
            Mesa mesa = mesaOptional.get();
            mesa.setEstado(nuevoEstado);
            mesaRepository.save(mesa);
            return ResponseEntity.ok(mesa);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}