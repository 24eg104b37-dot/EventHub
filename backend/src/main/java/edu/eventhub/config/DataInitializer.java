package edu.eventhub.config;

import edu.eventhub.model.Event;
import edu.eventhub.repo.EventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private final EventRepository eventRepository;

    public DataInitializer(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @Override
    public void run(String... args) {
        try {
            if (eventRepository.count() == 0) {
                log.info("Database is empty. Seeding initial events for EventHub...");

                eventRepository.save(createEvent(
                    "Designing for Tomorrow", "Design", "2026-10-22", "10:00 AM",
                    "Anurag University · Seminar Hall", "Hyderabad", 0, 120, 86,
                    "A creative meetup exploring human-centered design, product thinking and the ideas shaping what comes next.",
                    "lavender", "✳"
                ));

                eventRepository.save(createEvent(
                    "Build & Beyond Hackathon", "Technology", "2026-10-25", "09:30 AM",
                    "Innovation Lab, Block C", "Hyderabad", 199, 150, 112,
                    "Bring your team, prototype a bold idea and learn from mentors across engineering and product.",
                    "peach", "⌘"
                ));

                eventRepository.save(createEvent(
                    "Campus Music Evening", "Music", "2026-10-29", "05:00 PM",
                    "Open Air Theatre", "Hyderabad", 99, 300, 214,
                    "An evening of student bands, acoustic sets and good company under the lights.",
                    "blue", "♫"
                ));

                eventRepository.save(createEvent(
                    "Startup Stories: From Idea to Impact", "Business", "2026-11-02", "11:00 AM",
                    "Auditorium, Main Building", "Hyderabad", 0, 180, 93,
                    "Founders share honest lessons on building products, finding customers and staying resilient.",
                    "green", "↗"
                ));

                eventRepository.save(createEvent(
                    "Photography Walk", "Lifestyle", "2026-11-06", "07:00 AM",
                    "University Main Gate", "Hyderabad", 49, 40, 28,
                    "Explore visual storytelling, practice composition and capture campus life with fellow creators.",
                    "pink", "◉"
                ));

                eventRepository.save(createEvent(
                    "Future of AI Meetup", "Technology", "2026-11-12", "02:00 PM",
                    "Computer Science Auditorium", "Hyderabad", 149, 200, 147,
                    "A practical conversation about AI tools, responsible innovation and opportunities for students.",
                    "dark", "✦"
                ));

                log.info("Successfully seeded 6 default events.");
            }
        } catch (Exception ex) {
            log.warn("Could not seed initial events (database might still be initializing): {}", ex.getMessage());
        }
    }

    private Event createEvent(String title, String category, String date, String time, String venue, String city,
                              int price, int seats, int attendees, String description, String color, String emoji) {
        Event e = new Event();
        e.setTitle(title);
        e.setCategory(category);
        e.setDate(date);
        e.setTime(time);
        e.setVenue(venue);
        e.setCity(city);
        e.setPrice(price);
        e.setSeats(seats);
        e.setAttendees(attendees);
        e.setDescription(description);
        e.setColor(color);
        e.setEmoji(emoji);
        return e;
    }
}
