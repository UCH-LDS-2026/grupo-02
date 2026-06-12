package backend.repositories;

import backend.models.Mesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MesaRepository extends JpaRepository<Mesa, Integer> {
    // Solo con extender JpaRepository, Spring Boot ya nos regala métodos como:
    // save(), findAll(), findById(), deleteById()
}