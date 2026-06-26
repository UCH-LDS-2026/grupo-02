package backend.controllers;

import backend.models.HistorialMesa;
import backend.repositories.HistorialMesaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/historial-mesas")
@CrossOrigin(origins = "*")
public class HistorialController {

    @Autowired
    private HistorialMesaRepository historialMesaRepository;

    @GetMapping
    public List<HistorialMesa> obtenerTodoElHistorial() {
        return historialMesaRepository.findAll();
    }
}