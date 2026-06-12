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

    @Column(name = "id_mesa", nullable = false)
    private Integer idMesa;

    @Column(name = "id_mozo", nullable = false)
    private Integer idMozo;

    @Column(name = "fecha_apertura")
    private LocalDateTime fechaApertura;

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @Column(name = "estado_actual", length = 50)
    private String estadoActual;

    // Constructor vacío obligatorio para JPA
    public InstanciaMesa() {
    }

    // Getters y Setters

    public Integer getIdInstancia() {
        return idInstancia;
    }

    public void setIdInstancia(Integer idInstancia) {
        this.idInstancia = idInstancia;
    }

    public Integer getIdMesa() {
        return idMesa;
    }

    public void setIdMesa(Integer idMesa) {
        this.idMesa = idMesa;
    }

    public Integer getIdMozo() {
        return idMozo;
    }

    public void setIdMozo(Integer idMozo) {
        this.idMozo = idMozo;
    }

    public LocalDateTime getFechaApertura() {
        return fechaApertura;
    }

    public void setFechaApertura(LocalDateTime fechaApertura) {
        this.fechaApertura = fechaApertura;
    }

    public LocalDateTime getFechaCierre() {
        return fechaCierre;
    }

    public void setFechaCierre(LocalDateTime fechaCierre) {
        this.fechaCierre = fechaCierre;
    }

    public String getEstadoActual() {
        return estadoActual;
    }

    public void setEstadoActual(String estadoActual) {
        this.estadoActual = estadoActual;
    }
}