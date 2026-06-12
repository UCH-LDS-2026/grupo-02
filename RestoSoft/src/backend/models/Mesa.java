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

    // AQUÍ ESTÁ LA MAGIA: Le decimos a Java que use el Enum en lugar de String
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition ="ENUM('LIBRE','OCUPADA','PEDIDO_EN_CURSO','EN_MESA','POR_COBRAR') DEFAULT 'LIBRE'")
    private EstadoMesa estado = EstadoMesa.LIBRE;

    // Getters y Setters
    public Integer getIdMesa() { return idMesa; }
    public void setIdMesa(Integer idMesa) { this.idMesa = idMesa; }

    public Integer getNumeroMesa() { return numeroMesa; }
    public void setNumeroMesa(Integer numeroMesa) { this.numeroMesa = numeroMesa; }

    public Integer getCapacidad() { return capacidad; }
    public void setCapacidad(Integer capacidad) { this.capacidad = capacidad; }

    // Los Getters y Setters ahora usan EstadoMesa
    public EstadoMesa getEstado() { return estado; }
    public void setEstado(EstadoMesa estado) { this.estado = estado; }
}