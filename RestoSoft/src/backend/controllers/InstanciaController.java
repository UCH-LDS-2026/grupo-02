package backend.controllers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import backend.models.InstanciaMesa;
import backend.repositories.InstanciaMesaRepository;

@RestController
@RequestMapping("/api/instancias")
@CrossOrigin(origins = "*")
public class InstanciaController {
    @Autowired
    private InstanciaMesaRepository instanciaRepository;

    @GetMapping("/mesa/{idMesa}")
    public ResponseEntity<InstanciaMesa> getInstanciaActiva(@PathVariable Integer idMesa) {
        // Buscamos la última instancia de la mesa que tenga fechaCierre null
    return instanciaRepository.findTopByMesaIdMesaOrderByFechaAperturaDesc(idMesa)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
    }
}