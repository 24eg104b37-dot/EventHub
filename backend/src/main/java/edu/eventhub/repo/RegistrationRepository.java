package edu.eventhub.repo;
import edu.eventhub.model.Registration; import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface RegistrationRepository extends JpaRepository<Registration,Long> { List<Registration> findByEventId(Long eventId); boolean existsByEventIdAndEmailIgnoreCase(Long eventId,String email); void deleteByEventId(Long eventId); void deleteByEventIdAndEmailIgnoreCase(Long eventId,String email); List<Registration> findByEmailIgnoreCase(String email); }
