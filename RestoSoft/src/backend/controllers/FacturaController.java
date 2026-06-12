package backend.controllers;

import backend.models.*;
import backend.repositories.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/facturas")
@CrossOrigin(origins = "*")
public class FacturaController {

    @Autowired
    private FacturaRepository facturaRepository;

    @Autowired
    private MesaRepository mesaRepository;

    @Autowired
    private InstanciaMesaRepository instanciaMesaRepository;

    @Autowired
    private ComandaRepository comandaRepository;

    @Autowired
    private ItemComandaRepository itemComandaRepository;

    @PostMapping("/facturar/{idMesa}")
    public ResponseEntity<?> facturarMesa(
            @PathVariable Integer idMesa,
            @RequestParam Integer idCajero,
            @RequestParam String metodoPago) {

        Optional<InstanciaMesa> instanciaOpt =
                instanciaMesaRepository
                        .findTopByIdMesaOrderByIdInstanciaDesc(idMesa);

        if (instanciaOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("No existe una instancia para esta mesa");
        }

        InstanciaMesa instancia = instanciaOpt.get();

        Optional<Comanda> comandaOpt =
                comandaRepository.findByIdInstancia(
                        instancia.getIdInstancia());

        if (comandaOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("No existe una comanda asociada");
        }

        Comanda comanda = comandaOpt.get();

        List<ItemComanda> items =
                itemComandaRepository.findByComanda_IdComanda(
                        comanda.getIdComanda());

        BigDecimal total = items.stream()
                .map(ItemComanda::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Factura factura = new Factura();
        factura.setIdInstancia(instancia.getIdInstancia());
        factura.setIdCajero(idCajero);
        factura.setMetodoPago(metodoPago);
        factura.setFechaFactura(LocalDateTime.now());
        factura.setTotal(total);

        facturaRepository.save(factura);

        instancia.setFechaCierre(LocalDateTime.now());
        instancia.setEstadoActual("CERRADA");
        instanciaMesaRepository.save(instancia);

        Optional<Mesa> mesaOpt = mesaRepository.findById(idMesa);

        if (mesaOpt.isPresent()) {
            Mesa mesa = mesaOpt.get();
            mesa.setEstado(EstadoMesa.LIBRE);
            mesaRepository.save(mesa);
        }

        return ResponseEntity.ok(factura);
    }
}