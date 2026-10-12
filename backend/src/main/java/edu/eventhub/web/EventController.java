package edu.eventhub.web;

import edu.eventhub.model.Event;
import edu.eventhub.model.Registration;
import edu.eventhub.repo.EventRepository;
import edu.eventhub.repo.RegistrationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(
    origins = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS, RequestMethod.HEAD}
)
public class EventController {

    private static final Logger log = LoggerFactory.getLogger(EventController.class);

    private final EventRepository events;
    private final RegistrationRepository registrations;

    public EventController(EventRepository events, RegistrationRepository registrations) {
        this.events = events;
        this.registrations = registrations;
    }

    @GetMapping
    public List<Event> all(@RequestParam(required = false) String q, @RequestParam(required = false) String category) {
        return events.search(blank(q), blank(category));
    }

    private String blank(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }

    @GetMapping("/{id}")
    public Event one(@PathVariable Long id) {
        return events.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
    }

    @PostMapping
    public Event create(@RequestBody Event e) {
        if (e.getTitle() == null || e.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title is required");
        }
        // Force MySQL auto-increment ID generation instead of client-generated IDs
        e.setId(null);
        if (e.getAttendees() == null) {
            e.setAttendees(0);
        }
        Event saved = events.save(e);
        log.info("Created new event with database id: {}", saved.getId());
        return saved;
    }

    @PutMapping("/{id}")
    public Event update(@PathVariable Long id, @RequestBody Event e) {
        Event old = events.findById(id).orElse(null);
        if (old != null) {
            e.setId(old.getId());
        } else {
            e.setId(id);
        }
        return events.save(e);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void delete(@PathVariable Long id, @RequestParam(required = false) String title) {
        log.info("Request to delete event id: {}, title: {}", id, title);
        try {
            registrations.deleteByEventId(id);
        } catch (Exception ex) {
            log.warn("Could not delete registrations for event id {}: {}", id, ex.getMessage());
        }

        if (events.existsById(id)) {
            events.deleteById(id);
            log.info("Successfully deleted event id: {}", id);
            return;
        }

        // Fallback: match by title if id was a client-side mock ID (e.g. Date.now())
        if (title != null && !title.isBlank()) {
            events.findAll().stream()
                .filter(e -> title.trim().equalsIgnoreCase(e.getTitle().trim()))
                .findFirst()
                .ifPresent(e -> {
                    try {
                        registrations.deleteByEventId(e.getId());
                    } catch (Exception ignored) {}
                    events.deleteById(e.getId());
                    log.info("Successfully deleted event with matched title '{}' and id: {}", title, e.getId());
                });
        }
    }

    @GetMapping("/{id}/registrations")
    public List<Registration> registrations(@PathVariable Long id) {
        return registrations.findByEventId(id);
    }

    @PostMapping("/{id}/registrations")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Registration register(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Event e = one(id);
        String name = body.get("name");
        String email = body.get("email");

        if (name == null || name.isBlank() || email == null || !email.contains("@")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Valid name and email are required");
        }

        if (registrations.existsByEventIdAndEmailIgnoreCase(id, email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This email is already registered");
        }

        if (e.getAttendees() != null && e.getSeats() != null && e.getAttendees() >= e.getSeats()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Event is full");
        }

        Registration r = new Registration();
        r.setEventId(id);
        r.setName(name);
        r.setEmail(email);
        r.setRegisteredAt(Instant.now().toString());
        Registration saved = registrations.save(r);

        e.setAttendees((e.getAttendees() == null ? 0 : e.getAttendees()) + 1);
        events.save(e);
        return saved;
    }

    @DeleteMapping("/{id}/registrations")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void cancelRegistration(@PathVariable Long id, @RequestParam String email) {
        Event e = events.findById(id).orElse(null);
        registrations.deleteByEventIdAndEmailIgnoreCase(id, email);
        if (e != null) {
            e.setAttendees(Math.max(0, (e.getAttendees() == null ? 0 : e.getAttendees()) - 1));
            events.save(e);
        }
    }
}
