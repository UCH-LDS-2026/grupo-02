package backend.controllers;

import backend.models.Mesa;
import backend.models.Usuario;
import backend.models.EstadoMesa;
import backend.models.HistorialMesa;
import backend.models.InstanciaMesa;
import backend.repositories.MesaRepository;
import backend.repositories.UsuarioRepository;
import backend.repositories.HistorialMesaRepository;
import backend.repositories.InstanciaMesaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/mesas")
@CrossOrigin(origins = "*")
public class MesaController {

    @Autowired
    private MesaRepository mesaRepository;

    @Autowired
    private HistorialMesaRepository historialMesaRepository;

    @Autowired
    private InstanciaMesaRepository instanciaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping
    public ResponseEntity<Mesa> crearMesa(@RequestBody Mesa nuevaMesa) {
        // Validaciones de seguridad por si el Frontend manda datos vacíos
        if (nuevaMesa.getEstado() == null) {
            nuevaMesa.setEstado(EstadoMesa.LIBRE);
        }
        if (nuevaMesa.getSector() == null || nuevaMesa.getSector().isEmpty()) {
            nuevaMesa.setSector("Planta Baja");
        }
        
        Mesa mesaGuardada = mesaRepository.save(nuevaMesa);
        return ResponseEntity.ok(mesaGuardada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarMesa(@PathVariable Integer id) {
        if (mesaRepository.existsById(id)) {
            try {
                mesaRepository.deleteById(id);
                return ResponseEntity.ok().build();
            } catch (Exception e) {
                return ResponseEntity.badRequest()
                        .body("No se puede eliminar la mesa porque tiene facturas o comandas en el historial.");
            }
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping
    public List<Mesa> obtenerTodasLasMesas() {
        return mesaRepository.findAll();
    }

    @PutMapping("/{id}/posicion")
    public ResponseEntity<?> actualizarPosicion(@PathVariable Integer id, @RequestBody Mesa coordenadas) {
        Optional<Mesa> mesaOpt = mesaRepository.findById(id);
        if (mesaOpt.isPresent()) {
            Mesa mesa = mesaOpt.get();
            mesa.setPosicionX(coordenadas.getPosicionX());
            mesa.setPosicionY(coordenadas.getPosicionY());
            mesaRepository.save(mesa);
            return ResponseEntity.ok(mesa);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable Integer id,
            @RequestParam EstadoMesa nuevoEstado,
            @RequestParam(required = false) Integer idUsuario) {

        Optional<Mesa> mesaOptional = mesaRepository.findById(id);

        if (mesaOptional.isPresent()) {
            Mesa mesa = mesaOptional.get();
            EstadoMesa estadoAnterior = mesa.getEstado();

            InstanciaMesa instanciaActiva = null;

            if (estadoAnterior == EstadoMesa.LIBRE && nuevoEstado == EstadoMesa.OCUPADA) {
                if (idUsuario == null)
                    return ResponseEntity.badRequest().body("Falta el ID del Mozo");

                Usuario mozo = usuarioRepository.findById(idUsuario).orElseThrow();

                instanciaActiva = new InstanciaMesa();
                instanciaActiva.setMesa(mesa);
                instanciaActiva.setMozo(mozo);
                instanciaActiva.setFechaApertura(LocalDateTime.now());
                instanciaActiva.setEstadoActual(nuevoEstado);
                instanciaActiva = instanciaRepository.save(instanciaActiva);
            }

            mesa.setEstado(nuevoEstado);
            mesaRepository.save(mesa);

            HistorialMesa registro = new HistorialMesa();
            registro.setMesa(mesa);
            registro.setEstadoAnterior(estadoAnterior);
            registro.setEstadoNuevo(nuevoEstado);
            historialMesaRepository.save(registro);

            if (instanciaActiva != null) {
                return ResponseEntity.ok(new MesaConInstanciaDTO(mesa, instanciaActiva.getIdInstancia(),
                        instanciaActiva.getMozo().getNombre(), instanciaActiva.getFechaApertura().toString()));
            }

            return ResponseEntity.ok(mesa);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    public static class MesaConInstanciaDTO {
        public Mesa mesa;
        public Integer idInstanciaActiva;
        public String nombreMozoApertura;
        public String horaApertura;

        public MesaConInstanciaDTO(Mesa m, Integer idInstancia, String nombre, String hora) {
            this.mesa = m;
            this.idInstanciaActiva = idInstancia;
            this.nombreMozoApertura = nombre;
            this.horaApertura = hora;
        }
    }
}