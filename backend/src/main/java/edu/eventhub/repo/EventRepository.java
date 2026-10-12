package edu.eventhub.repo;
import edu.eventhub.model.Event; import org.springframework.data.jpa.repository.JpaRepository; import org.springframework.data.jpa.repository.Query; import org.springframework.data.repository.query.Param; import java.util.List;
public interface EventRepository extends JpaRepository<Event,Long> {
 @Query("select e from Event e where (:q is null or lower(e.title) like lower(concat('%',:q,'%')) or lower(e.venue) like lower(concat('%',:q,'%')) or lower(e.city) like lower(concat('%',:q,'%'))) and (:category is null or e.category=:category)")
 List<Event> search(@Param("q") String q,@Param("category") String category);
}
