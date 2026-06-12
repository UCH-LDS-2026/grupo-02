package backend.repositories;

import backend.models.HistorialMesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HistorialMesaRepository extends JpaRepository<HistorialMesa, Integer> {
}