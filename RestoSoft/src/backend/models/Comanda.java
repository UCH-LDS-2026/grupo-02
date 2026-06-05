package backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comanda")
public class Comanda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_comanda")
    private Integer idComanda;

    // Conecta con el turno actual de la mesa
    @Column(name = "id_instancia", nullable = false)
    private Integer idInstancia;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('PENDIENTE','EN_PRODUCCION','LISTO','ENTREGADO') DEFAULT 'PENDIENTE'")
    private EstadoComanda estado = EstadoComanda.PENDIENTE;

    // Getters y Setters
    public Integer getIdComanda() { return idComanda; }
    public void setIdComanda(Integer idComanda) { this.idComanda = idComanda; }

    public Integer getIdInstancia() { return idInstancia; }
    public void setIdInstancia(Integer idInstancia) { this.idInstancia = idInstancia; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public EstadoComanda getEstado() { return estado; }
    public void setEstado(EstadoComanda estado) { this.estado = estado; }
}