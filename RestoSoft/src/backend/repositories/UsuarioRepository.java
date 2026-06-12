package backend.repositories;

import backend.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    // Este método mágico de Spring Data JPA busca directamente por el campo email
    Optional<Usuario> findByEmail(String email);
}