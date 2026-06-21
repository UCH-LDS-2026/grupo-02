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

    // Repositorios nuevos para la gestión del Turno (Instancia)
    @Autowired
    private InstanciaMesaRepository instanciaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping
    public Mesa crearMesa(@RequestBody Mesa nuevaMesa) {
        return mesaRepository.save(nuevaMesa);
    }

    @GetMapping
    public List<Mesa> obtenerTodasLasMesas() {
        return mesaRepository.findAll();
    }

    // Endpoint mejorado: ahora recibe el id del mozo que toca el botón
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable Integer id, 
            @RequestParam EstadoMesa nuevoEstado,
            @RequestParam(required = false) Integer idUsuario) { 

        Optional<Mesa> mesaOptional = mesaRepository.findById(id);

        if (mesaOptional.isPresent()) {
            Mesa mesa = mesaOptional.get();
            EstadoMesa estadoAnterior = mesa.getEstado();
            
            // 1. LÓGICA DE INSTANCIA (TURNO DE MESA)
            InstanciaMesa instanciaActiva = null;

            // Si pasa de Libre a Ocupada, creamos una apertura oficial
            if (estadoAnterior == EstadoMesa.LIBRE && nuevoEstado == EstadoMesa.OCUPADA) {
                if (idUsuario == null) return ResponseEntity.badRequest().body("Falta el ID del Mozo");
                
                Usuario mozo = usuarioRepository.findById(idUsuario).orElseThrow();
                
                instanciaActiva = new InstanciaMesa();
                instanciaActiva.setMesa(mesa);
                instanciaActiva.setMozo(mozo);
                instanciaActiva.setFechaApertura(LocalDateTime.now());
                instanciaActiva.setEstadoActual(nuevoEstado);
                instanciaActiva = instanciaRepository.save(instanciaActiva);
            }

            // 2. ACTUALIZACIÓN ESTÁNDAR
            mesa.setEstado(nuevoEstado);
            mesaRepository.save(mesa);
            
            // 3. HISTORIAL CLÁSICO
            HistorialMesa registro = new HistorialMesa();
            registro.setMesa(mesa);
            registro.setEstadoAnterior(estadoAnterior);
            registro.setEstadoNuevo(nuevoEstado);
            historialMesaRepository.save(registro); 
            
            // Si creamos una instancia, devolvemos un objeto que agrupe la mesa y su nuevo idInstancia
            if (instanciaActiva != null) {
                return ResponseEntity.ok(new MesaConInstanciaDTO(mesa, instanciaActiva.getIdInstancia(), instanciaActiva.getMozo().getNombre(), instanciaActiva.getFechaApertura().toString()));
            }

            return ResponseEntity.ok(mesa);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // DTO Auxiliar para devolverle al Frontend los datos del Turno creado
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