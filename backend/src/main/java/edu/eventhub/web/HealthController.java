package edu.eventhub.web;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class HealthController {

    @GetMapping({"/", "/health", "/api/health"})
    public Map<String, Object> health() {
        return Map.of(
            "status", "UP",
            "service", "EventHub Backend API",
            "timestamp", System.currentTimeMillis()
        );
    }
}
