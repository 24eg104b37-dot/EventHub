package edu.eventhub.web;
import edu.eventhub.model.Event; import edu.eventhub.model.Registration; import edu.eventhub.repo.EventRepository; import edu.eventhub.repo.RegistrationRepository;
import org.springframework.http.HttpStatus; import org.springframework.web.bind.annotation.*; import org.springframework.web.server.ResponseStatusException;
import java.time.Instant; import java.util.List; import java.util.Map;
@RestController @RequestMapping("/api/events") @CrossOrigin(origins="*")
public class EventController {
 private final EventRepository events; private final RegistrationRepository registrations;
 public EventController(EventRepository events,RegistrationRepository registrations){this.events=events;this.registrations=registrations;}
 @GetMapping public List<Event> all(@RequestParam(required=false) String q,@RequestParam(required=false) String category){return events.search(blank(q),blank(category));}
 private String blank(String s){return s==null||s.isBlank()?null:s;}
 @GetMapping("/{id}") public Event one(@PathVariable Long id){return events.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Event not found"));}
 @PostMapping public Event create(@RequestBody Event e){if(e.getTitle()==null||e.getTitle().isBlank())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Title is required");if(e.getAttendees()==null)e.setAttendees(0);return events.save(e);}
 @PutMapping("/{id}") public Event update(@PathVariable Long id,@RequestBody Event e){Event old=one(id);e.setId(old.getId());return events.save(e);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id){one(id);registrations.deleteByEventId(id);events.deleteById(id);}
 @GetMapping("/{id}/registrations") public List<Registration> registrations(@PathVariable Long id){one(id);return registrations.findByEventId(id);}
 @PostMapping("/{id}/registrations") @ResponseStatus(HttpStatus.CREATED) public Registration register(@PathVariable Long id,@RequestBody Map<String,String> body){Event e=one(id);String name=body.get("name"),email=body.get("email");if(name==null||name.isBlank()||email==null||!email.contains("@"))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Valid name and email are required");if(registrations.existsByEventIdAndEmailIgnoreCase(id,email))throw new ResponseStatusException(HttpStatus.CONFLICT,"This email is already registered");if(e.getAttendees()!=null&&e.getSeats()!=null&&e.getAttendees()>=e.getSeats())throw new ResponseStatusException(HttpStatus.CONFLICT,"Event is full");Registration r=new Registration();r.setEventId(id);r.setName(name);r.setEmail(email);r.setRegisteredAt(Instant.now().toString());Registration saved=registrations.save(r);e.setAttendees((e.getAttendees()==null?0:e.getAttendees())+1);events.save(e);return saved;}
 @DeleteMapping("/{id}/registrations") @ResponseStatus(HttpStatus.NO_CONTENT) public void cancelRegistration(@PathVariable Long id,@RequestParam String email){Event e=one(id);if(!registrations.existsByEventIdAndEmailIgnoreCase(id,email))throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Registration not found");registrations.deleteByEventIdAndEmailIgnoreCase(id,email);e.setAttendees(Math.max(0,(e.getAttendees()==null?0:e.getAttendees())-1));events.save(e);}
}
