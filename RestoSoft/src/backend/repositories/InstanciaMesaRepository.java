package backend.repositories;

import backend.models.InstanciaMesa;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface InstanciaMesaRepository extends JpaRepository<InstanciaMesa, Integer> {
    Optional<InstanciaMesa> findTopByMesaIdMesaOrderByFechaAperturaDesc(Integer idMesa);
}