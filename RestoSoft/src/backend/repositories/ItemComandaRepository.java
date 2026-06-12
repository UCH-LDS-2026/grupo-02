package backend.repositories;

import backend.models.ItemComanda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemComandaRepository extends JpaRepository<ItemComanda, Integer> {
}