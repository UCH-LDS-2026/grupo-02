package backend.controllers;

import backend.models.Comanda;
import backend.models.ItemComanda;
import backend.repositories.ComandaRepository;
import backend.repositories.ItemComandaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comandas")
@CrossOrigin(origins = "*")
public class ComandaController {

    @Autowired
    private ComandaRepository comandaRepository;

    // Agregamos el repositorio de los ítems
    @Autowired
    private ItemComandaRepository itemComandaRepository;

    // 1. Endpoint para crear la cabecera del pedido (El que ya probaste)
    @PostMapping
    public Comanda crearComanda(@RequestBody Comanda nuevaComanda) {
        return comandaRepository.save(nuevaComanda);
    }

    // 2. Endpoint para ver todos los pedidos
    @GetMapping
    public List<Comanda> obtenerTodasLasComandas() {
        return comandaRepository.findAll();
    }

    // 3. Endpoint para agregar un plato a una comanda específica
    @PostMapping("/{idComanda}/items")
    public ItemComanda agregarItemAComanda(@PathVariable Integer idComanda, @RequestBody ItemComanda nuevoItem) {
        // Buscamos la comanda en la base de datos
        Comanda comanda = comandaRepository.findById(idComanda).orElseThrow();
        
        // Le decimos al plato a qué ticket pertenece
        nuevoItem.setComanda(comanda);
        
        // Lo guardamos
        return itemComandaRepository.save(nuevoItem);
    }
    @PutMapping("/{id}/estado")
    public org.springframework.http.ResponseEntity<Comanda> cambiarEstadoComanda(
            @PathVariable Integer id, 
            @RequestParam backend.models.EstadoComanda nuevoEstado) {
        
        java.util.Optional<Comanda> comandaOptional = comandaRepository.findById(id);

        if (comandaOptional.isPresent()) {
            Comanda comanda = comandaOptional.get();
            comanda.setEstado(nuevoEstado);
            comandaRepository.save(comanda);
            return org.springframework.http.ResponseEntity.ok(comanda);
        } else {
            return org.springframework.http.ResponseEntity.notFound().build();
        }
    }
}