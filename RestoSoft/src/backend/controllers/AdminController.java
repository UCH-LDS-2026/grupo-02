package backend.controllers;


import backend.dto.ForzarEstadoRequest;
import backend.models.AuditoriaEstado;
import backend.models.Mesa;
import backend.repositories.AuditoriaEstadoRepository;
import backend.repositories.MesaRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private MesaRepository mesaRepository;

    @Autowired
    private AuditoriaEstadoRepository auditoriaRepository;

    @PutMapping("/mesas/{id}/forzar-estado")
    public ResponseEntity<?> forzarEstado(
            @PathVariable Integer id,
            @RequestBody ForzarEstadoRequest request) {

        Optional<Mesa> mesaOpt = mesaRepository.findById(id);

        if (mesaOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Mesa mesa = mesaOpt.get();

        String estadoAnterior = mesa.getEstado().name();

        mesa.setEstado(request.getNuevoEstado());
        mesaRepository.save(mesa);

        AuditoriaEstado auditoria = new AuditoriaEstado();
        auditoria.setEstadoAnterior(estadoAnterior);
        auditoria.setEstadoNuevo(request.getNuevoEstado().name());
        auditoria.setFechaCambio(LocalDateTime.now());
        auditoria.setMotivoContingencia(request.getMotivo());

        auditoriaRepository.save(auditoria);

        return ResponseEntity.ok(mesa);
    }
    @GetMapping("/test")
public String test() {
    return "AdminController funcionando";
}
}
