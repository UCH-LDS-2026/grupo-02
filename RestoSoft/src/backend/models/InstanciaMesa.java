package backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "instancia_mesa")
public class InstanciaMesa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_instancia")
    private Integer idInstancia;

    // Conexión real con Mesa
    @ManyToOne
    @JoinColumn(name = "id_mesa", nullable = false)
    private Mesa mesa;

    // Conexión real con Usuario
    @ManyToOne
    @JoinColumn(name = "id_mozo", nullable = false)
    private Usuario mozo;

    @Column(name = "fecha_apertura")
    private LocalDateTime fechaApertura;

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_actual", length = 50)
    private EstadoMesa estadoActual; // Usamos el Enum para no pifiar

    // Constructor
    public InstanciaMesa() {}

    // Getters y Setters
    public Integer getIdInstancia() { return idInstancia; }
    public void setIdInstancia(Integer idInstancia) { this.idInstancia = idInstancia; }

    public Mesa getMesa() { return mesa; }
    public void setMesa(Mesa mesa) { this.mesa = mesa; }

    public Usuario getMozo() { return mozo; }
    public void setMozo(Usuario mozo) { this.mozo = mozo; }

    public LocalDateTime getFechaApertura() { return fechaApertura; }
    public void setFechaApertura(LocalDateTime fechaApertura) { this.fechaApertura = fechaApertura; }

    public LocalDateTime getFechaCierre() { return fechaCierre; }
    public void setFechaCierre(LocalDateTime fechaCierre) { this.fechaCierre = fechaCierre; }

    public EstadoMesa getEstadoActual() { return estadoActual; }
    public void setEstadoActual(EstadoMesa estadoActual) { this.estadoActual = estadoActual; }
}