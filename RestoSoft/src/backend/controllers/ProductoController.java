package backend.controllers;

import backend.models.Producto;
import backend.repositories.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;

    // Endpoint para que el Frontend cargue el menú en el panel lateral
    @GetMapping
    public List<Producto> obtenerMenu() {
        // En un futuro acá podemos filtrar para que solo traiga los que tienen disponible=true
        return productoRepository.findAll();
    }
}