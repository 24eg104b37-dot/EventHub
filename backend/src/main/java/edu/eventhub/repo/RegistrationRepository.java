package edu.eventhub.repo;

import edu.eventhub.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByEventId(Long eventId);
    boolean existsByEventIdAndEmailIgnoreCase(Long eventId, String email);

    @Transactional
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM Registration r WHERE r.eventId = :eventId")
    void deleteByEventId(@Param("eventId") Long eventId);

    @Transactional
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM Registration r WHERE r.eventId = :eventId AND lower(r.email) = lower(:email)")
    void deleteByEventIdAndEmailIgnoreCase(@Param("eventId") Long eventId, @Param("email") String email);

    List<Registration> findByEmailIgnoreCase(String email);
}
