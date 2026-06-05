package backend.repositories;

import backend.models.Comanda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ComandaRepository extends JpaRepository<Comanda, Integer> {

    Optional<Comanda> findByIdInstancia(Integer idInstancia);

}