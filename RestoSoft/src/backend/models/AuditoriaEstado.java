package backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria_estado")
public class AuditoriaEstado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_auditoria")
    private Integer idAuditoria;

    @Column(name = "id_instancia")
    private Integer idInstancia;

    @Column(name = "estado_anterior")
    private String estadoAnterior;

    @Column(name = "estado_nuevo")
    private String estadoNuevo;

    @Column(name = "fecha_cambio")
    private LocalDateTime fechaCambio;

    @Column(name = "usuario_responsable")
    private Integer usuarioResponsable;

    @Column(name = "motivo_contingencia")
    private String motivoContingencia;

    public Integer getIdAuditoria() {
        return idAuditoria;
    }

    public void setIdAuditoria(Integer idAuditoria) {
        this.idAuditoria = idAuditoria;
    }

    public Integer getIdInstancia() {
        return idInstancia;
    }

    public void setIdInstancia(Integer idInstancia) {
        this.idInstancia = idInstancia;
    }

    public String getEstadoAnterior() {
        return estadoAnterior;
    }

    public void setEstadoAnterior(String estadoAnterior) {
        this.estadoAnterior = estadoAnterior;
    }

    public String getEstadoNuevo() {
        return estadoNuevo;
    }

    public void setEstadoNuevo(String estadoNuevo) {
        this.estadoNuevo = estadoNuevo;
    }

    public LocalDateTime getFechaCambio() {
        return fechaCambio;
    }

    public void setFechaCambio(LocalDateTime fechaCambio) {
        this.fechaCambio = fechaCambio;
    }

    public Integer getUsuarioResponsable() {
        return usuarioResponsable;
    }

    public void setUsuarioResponsable(Integer usuarioResponsable) {
        this.usuarioResponsable = usuarioResponsable;
    }

    public String getMotivoContingencia() {
        return motivoContingencia;
    }

    public void setMotivoContingencia(String motivoContingencia) {
        this.motivoContingencia = motivoContingencia;
    }
}