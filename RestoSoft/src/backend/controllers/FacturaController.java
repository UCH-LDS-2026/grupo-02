package backend.controllers;

import backend.models.Factura;
import backend.repositories.FacturaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facturas")
@CrossOrigin(origins = "*")
public class FacturaController {

    @Autowired
    private FacturaRepository facturaRepository;

    // Endpoint para cargar las tablas y arqueos del cajero
    @GetMapping
    public List<Factura> obtenerTodas() {
        return facturaRepository.findAll();
    }

    // Endpoint al que llama el botón "Registrar Pago y Liberar Mesa"
    @PostMapping
    public ResponseEntity<Factura> crearFactura(@RequestBody Factura nuevaFactura) {
        Factura facturaGuardada = facturaRepository.save(nuevaFactura);
        return ResponseEntity.ok(facturaGuardada);
    }
}