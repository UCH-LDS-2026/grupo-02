package backend.controllers;

import backend.models.Cliente;
import backend.repositories.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*")
public class ClienteController {

    @Autowired
    private ClienteRepository clienteRepository;

    @GetMapping
    public List<Cliente> obtenerTodos() { return clienteRepository.findAll(); }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Cliente cliente) {
        return ResponseEntity.ok(clienteRepository.save(cliente));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Cliente datos) {
        Optional<Cliente> opt = clienteRepository.findById(id);
        if (opt.isPresent()) {
            Cliente c = opt.get();
            c.setNombreCompleto(datos.getNombreCompleto());
            c.setPorcentajeDescuento(datos.getPorcentajeDescuento());
            if (datos.getActivo() != null) c.setActivo(datos.getActivo());
            return ResponseEntity.ok(clienteRepository.save(c));
        }
        return ResponseEntity.notFound().build();
    }
}