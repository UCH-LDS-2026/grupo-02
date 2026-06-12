package backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "historial_mesa")
public class HistorialMesa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Conectamos el historial con la mesa específica
    @ManyToOne
    @JoinColumn(name = "mesa_id", nullable = false)
    private Mesa mesa;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_anterior")
    private EstadoMesa estadoAnterior;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_nuevo", nullable = false)
    private EstadoMesa estadoNuevo;

    // Se autocompleta con la hora del sistema al crearse
    @Column(name = "timestamp_cambio", nullable = false, updatable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    // Getters y Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Mesa getMesa() { return mesa; }
    public void setMesa(Mesa mesa) { this.mesa = mesa; }

    public EstadoMesa getEstadoAnterior() { return estadoAnterior; }
    public void setEstadoAnterior(EstadoMesa estadoAnterior) { this.estadoAnterior = estadoAnterior; }

    public EstadoMesa getEstadoNuevo() { return estadoNuevo; }
    public void setEstadoNuevo(EstadoMesa estadoNuevo) { this.estadoNuevo = estadoNuevo; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}