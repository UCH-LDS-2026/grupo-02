package backend.repositories;

import backend.models.InstanciaMesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InstanciaMesaRepository extends JpaRepository<InstanciaMesa, Integer> {

    Optional<InstanciaMesa> findByIdMesa(Integer idMesa);

    Optional<InstanciaMesa> findTopByIdMesaOrderByIdInstanciaDesc(Integer idMesa);
}