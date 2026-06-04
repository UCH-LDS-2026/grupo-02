package backend.models;

import jakarta.persistence.*;

@Entity
@Table(name = "mesa")
public class Mesa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_mesa")
    private Integer idMesa;

    @Column(name = "numero_mesa", unique = true, nullable = false)
    private Integer numeroMesa;

    @Column(nullable = false)
    private Integer capacidad;

    @Column(columnDefinition = "VARCHAR(50) DEFAULT 'LIBRE'")
    private String estado = "LIBRE";

    // Getters y Setters
    public Integer getIdMesa() { return idMesa; }
    public void setIdMesa(Integer idMesa) { this.idMesa = idMesa; }

    public Integer getNumeroMesa() { return numeroMesa; }
    public void setNumeroMesa(Integer numeroMesa) { this.numeroMesa = numeroMesa; }

    public Integer getCapacidad() { return capacidad; }
    public void setCapacidad(Integer capacidad) { this.capacidad = capacidad; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}