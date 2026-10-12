package edu.eventhub.repo;

import edu.eventhub.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByEventId(Long eventId);
    boolean existsByEventIdAndEmailIgnoreCase(Long eventId, String email);

    @Transactional
    @Modifying
    void deleteByEventId(Long eventId);

    @Transactional
    @Modifying
    void deleteByEventIdAndEmailIgnoreCase(Long eventId, String email);

    List<Registration> findByEmailIgnoreCase(String email);
}
