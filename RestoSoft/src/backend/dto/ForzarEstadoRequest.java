package backend.dto;

import backend.models.EstadoMesa;

public class ForzarEstadoRequest {

    private EstadoMesa nuevoEstado;
    private String motivo;

    public EstadoMesa getNuevoEstado() {
        return nuevoEstado;
    }

    public void setNuevoEstado(EstadoMesa nuevoEstado) {
        this.nuevoEstado = nuevoEstado;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }
}