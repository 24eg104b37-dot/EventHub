package edu.eventhub.model;
import jakarta.persistence.*;
@Entity @Table(name="event_registrations")
public class Registration {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 private Long eventId; private String name; private String email; private String registeredAt;
 public Registration(){} public Long getId(){return id;} public void setId(Long v){id=v;}
 public Long getEventId(){return eventId;} public void setEventId(Long v){eventId=v;}
 public String getName(){return name;} public void setName(String v){name=v;}
 public String getEmail(){return email;} public void setEmail(String v){email=v;}
 public String getRegisteredAt(){return registeredAt;} public void setRegisteredAt(String v){registeredAt=v;}
}
