package backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "factura")
public class Factura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_factura")
    private Integer idFactura;

    @Column(name = "id_instancia", nullable = false)
    private Integer idInstancia;

    @Column(name = "id_cajero", nullable = false)
    private Integer idCajero;

    @Column(name = "fecha_factura", updatable = false)
    private LocalDateTime fechaFactura;

    @Column(nullable = false)
    private Double total;

    @Column(name = "metodo_pago")
    private String metodoPago;

    @PrePersist
    protected void alCrear() {
        if (fechaFactura == null) {
            fechaFactura = LocalDateTime.now();
        }
    }

    // Getters y Setters
    public Integer getIdFactura() { return idFactura; }
    public void setIdFactura(Integer idFactura) { this.idFactura = idFactura; }

    public Integer getIdInstancia() { return idInstancia; }
    public void setIdInstancia(Integer idInstancia) { this.idInstancia = idInstancia; }

    public Integer getIdCajero() { return idCajero; }
    public void setIdCajero(Integer idCajero) { this.idCajero = idCajero; }

    public LocalDateTime getFechaFactura() { return fechaFactura; }
    public void setFechaFactura(LocalDateTime fechaFactura) { this.fechaFactura = fechaFactura; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }

    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }
}