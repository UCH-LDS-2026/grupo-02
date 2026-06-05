package backend.repositories;

import backend.models.ItemComanda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemComandaRepository extends JpaRepository<ItemComanda, Integer> {

    List<ItemComanda> findByComanda_IdComanda(Integer idComanda);

}