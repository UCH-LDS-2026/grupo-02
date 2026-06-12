package backend.repositories;

import backend.models.AuditoriaEstado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditoriaEstadoRepository
        extends JpaRepository<AuditoriaEstado, Integer> {
}