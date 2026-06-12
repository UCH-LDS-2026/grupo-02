package backend.controllers;

import backend.models.Mesa;
import backend.models.EstadoMesa;
import backend.models.HistorialMesa; 
import backend.repositories.MesaRepository;
import backend.repositories.HistorialMesaRepository; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/mesas")
@CrossOrigin(origins = "*")
public class MesaController {

    @Autowired
    private MesaRepository mesaRepository;

    // 1. Inyectamos el repositorio del historial
    @Autowired
    private HistorialMesaRepository historialMesaRepository;

    @PostMapping
    public Mesa crearMesa(@RequestBody Mesa nuevaMesa) {
        return mesaRepository.save(nuevaMesa);
    }

    @GetMapping
    public List<Mesa> obtenerTodasLasMesas() {
        return mesaRepository.findAll();
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Mesa> cambiarEstado(@PathVariable Integer id, @RequestParam EstadoMesa nuevoEstado) {
        Optional<Mesa> mesaOptional = mesaRepository.findById(id);

        if (mesaOptional.isPresent()) {
            Mesa mesa = mesaOptional.get();
            
            // 2. CAPTURAMOS EL ESTADO ANTES DEL CAMBIO
            EstadoMesa estadoAnterior = mesa.getEstado();
            
            // 3. Actualizamos la mesa normalmente
            mesa.setEstado(nuevoEstado);
            mesaRepository.save(mesa);
            
            // 4. GUARDAMOS AUTOMÁTICAMENTE EL REGISTRO EN EL HISTORIAL
            HistorialMesa registro = new HistorialMesa();
            registro.setMesa(mesa);
            registro.setEstadoAnterior(estadoAnterior);
            registro.setEstadoNuevo(nuevoEstado);
            historialMesaRepository.save(registro); // Se guarda con el timestamp actual
            
            return ResponseEntity.ok(mesa);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}