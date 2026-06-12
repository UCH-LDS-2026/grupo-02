package backend.controllers;

import backend.models.HistorialMesa;
import backend.repositories.HistorialMesaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/historial")
@CrossOrigin(origins = "*")
public class HistorialController {

    @Autowired
    private HistorialMesaRepository historialMesaRepository;

    // Endpoint GET para que la pantalla de administración liste los cambios y demoras
    @GetMapping
    public List<HistorialMesa> obtenerHistorial() {
        return historialMesaRepository.findAll();
    }
}