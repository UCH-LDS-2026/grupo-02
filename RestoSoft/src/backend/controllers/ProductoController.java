package backend.controllers;

import backend.models.Producto;
import backend.repositories.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;

    // 1. LEER (Obtener todos los productos)
    @GetMapping
    public List<Producto> obtenerMenu() {
        return productoRepository.findAll();
    }

    // 2. CREAR (Añadir un nuevo producto)
    @PostMapping
    public ResponseEntity<Producto> crearProducto(@RequestBody Producto nuevoProducto) {
        Producto productoGuardado = productoRepository.save(nuevoProducto);
        return ResponseEntity.ok(productoGuardado);
    }

 // 3. ACTUALIZAR (Modificar un producto existente)
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarProducto(@PathVariable Integer id, @RequestBody Producto productoDetalles) {
        Optional<Producto> productoOptional = productoRepository.findById(id);

        if (productoOptional.isPresent()) {
            Producto productoExistente = productoOptional.get();
            
            // Actualizamos los campos
            productoExistente.setNombre(productoDetalles.getNombre());
            productoExistente.setPrecio(productoDetalles.getPrecio());
            
            if(productoDetalles.getCategoria() != null) {
                productoExistente.setCategoria(productoDetalles.getCategoria());
            }
            
            productoRepository.save(productoExistente);
            return ResponseEntity.ok(productoExistente);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 4. ELIMINAR (Borrar un producto)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarProducto(@PathVariable Integer id) {
        if (productoRepository.existsById(id)) {
            try {
                productoRepository.deleteById(id);
                return ResponseEntity.ok().body("Producto eliminado exitosamente.");
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Error: No se puede eliminar el producto porque ya está registrado en comandas pasadas.");
            }
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}