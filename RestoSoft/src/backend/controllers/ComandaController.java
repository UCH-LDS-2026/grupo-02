package backend.controllers;

import backend.models.Comanda;
import backend.models.EstadoComanda;
import backend.models.ItemComanda;
import backend.models.Mesa;
import backend.models.Producto;
import backend.models.Usuario;
import backend.repositories.ComandaRepository;
import backend.repositories.ItemComandaRepository;
import backend.repositories.MesaRepository;
import backend.repositories.ProductoRepository;
import backend.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/comandas")
@CrossOrigin(origins = "*")
public class ComandaController {

    @Autowired
    private ComandaRepository comandaRepository;

    @Autowired
    private ItemComandaRepository itemComandaRepository;

    @Autowired
    private MesaRepository mesaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ProductoRepository productoRepository;

    // 1. Endpoint que recibe el JSON, arma la cabecera y calcula los subtotales automáticamente
    @PostMapping
    public ResponseEntity<?> crearComanda(@RequestBody ComandaRequest request) {
        
        Optional<Mesa> mesaOpt = mesaRepository.findById(request.idMesa);
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(request.idUsuario);

        if (mesaOpt.isEmpty() || usuarioOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Mesa o Usuario no encontrados.");
        }

      // A. Guardamos la cabecera del pedido
        Comanda nuevaComanda = new Comanda();
        nuevaComanda.setMesa(mesaOpt.get());
        nuevaComanda.setUsuario(usuarioOpt.get());
        nuevaComanda.setEstado(EstadoComanda.PENDIENTE); 
        
        // Asignamos el valor que viaja desde el Frontend
        nuevaComanda.setIdInstancia(request.idInstancia); 
        
        Comanda comandaGuardada = comandaRepository.save(nuevaComanda);

        // B. Recorremos los detalles, calculamos el subtotal de cada uno y guardamos
        for (ItemRequest itemReq : request.detalles) {
            Optional<Producto> prodOpt = productoRepository.findById(itemReq.idProducto);
            
            if (prodOpt.isPresent()) {
                Producto producto = prodOpt.get();
                
                ItemComanda nuevoItem = new ItemComanda();
                nuevoItem.setComanda(comandaGuardada);
                nuevoItem.setProducto(producto);
                nuevoItem.setCantidad(itemReq.cantidad);
                nuevoItem.setComentario(itemReq.comentarios);
                
                BigDecimal precioProducto = producto.getPrecio(); 
                BigDecimal cantidadItems = BigDecimal.valueOf(itemReq.cantidad);
                BigDecimal subtotalCalculado = precioProducto.multiply(cantidadItems);
                
                nuevoItem.setSubtotal(subtotalCalculado);
                
                itemComandaRepository.save(nuevoItem);
            }
        }

        return ResponseEntity.ok(comandaGuardada);
    }

    // 2. Endpoint para ver todos los pedidos
    @GetMapping
    public List<Comanda> obtenerTodasLasComandas() {
        return comandaRepository.findAll();
    }
    @GetMapping("/instancia/{idInstancia}")
    public ResponseEntity<Comanda> obtenerComandaPorInstancia(@PathVariable Integer idInstancia) {
        return comandaRepository.findByIdInstancia(idInstancia)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Endpoint para agregar un plato a una comanda específica
    @PostMapping("/{idComanda}/items")
    public ItemComanda agregarItemAComanda(@PathVariable Integer idComanda, @RequestBody ItemComanda nuevoItem) {
        Comanda comanda = comandaRepository.findById(idComanda).orElseThrow();
        nuevoItem.setComanda(comanda);
        return itemComandaRepository.save(nuevoItem);
    }

    // 4. Endpoint para cambiar el estado general del ticket
    @PutMapping("/{id}/estado")
    public ResponseEntity<Comanda> cambiarEstadoComanda(
            @PathVariable Integer id, 
            @RequestParam EstadoComanda nuevoEstado) {
        
        Optional<Comanda> comandaOptional = comandaRepository.findById(id);

        if (comandaOptional.isPresent()) {
            Comanda comanda = comandaOptional.get();
            comanda.setEstado(nuevoEstado);
            comandaRepository.save(comanda);
            return ResponseEntity.ok(comanda);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

   // --- CLASES AUXILIARES (DTOs) ---
    public static class ComandaRequest {
        public Integer idMesa;
        public Integer idUsuario;
        public Integer idInstancia;
        public List<ItemRequest> detalles;
    }

    public static class ItemRequest {
        public Integer idProducto;
        public Integer cantidad;
        public String comentarios;
    }
}