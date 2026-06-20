package backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "comanda")
public class Comanda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_comanda")
    private Integer idComanda;

    // Relación directa con la entidad Mesa
    @ManyToOne
    @JoinColumn(name = "id_mesa", nullable = false)
    private Mesa mesa;

    // Relación directa con la entidad Usuario (el mozo)
    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    // Mantenemos idInstancia por si lo usás a futuro para historial de turnos
    @Column(name = "id_instancia", nullable = true)
    private Integer idInstancia;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('PENDIENTE','EN_PRODUCCION','LISTO','ENTREGADO') DEFAULT 'PENDIENTE'")
    private EstadoComanda estado = EstadoComanda.PENDIENTE;

    // Getters y Setters
    public Integer getIdComanda() { return idComanda; }
    public void setIdComanda(Integer idComanda) { this.idComanda = idComanda; }

    public Mesa getMesa() { return mesa; }
    public void setMesa(Mesa mesa) { this.mesa = mesa; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Integer getIdInstancia() { return idInstancia; }
    public void setIdInstancia(Integer idInstancia) { this.idInstancia = idInstancia; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public EstadoComanda getEstado() { return estado; }
    public void setEstado(EstadoComanda estado) { this.estado = estado; }
}