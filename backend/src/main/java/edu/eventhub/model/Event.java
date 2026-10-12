package edu.eventhub.model;
import jakarta.persistence.*;
@Entity @Table(name="events")
public class Event {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 private String title; private String category; private String date; private String time;
 private String venue; private String city; private Integer price=0; private Integer seats=100; private Integer attendees=0;
 @Column(length=2000) private String description; private String color; private String emoji;
 public Event() {}
 public Long getId(){return id;} public void setId(Long v){id=v;}
 public String getTitle(){return title;} public void setTitle(String v){title=v;}
 public String getCategory(){return category;} public void setCategory(String v){category=v;}
 public String getDate(){return date;} public void setDate(String v){date=v;}
 public String getTime(){return time;} public void setTime(String v){time=v;}
 public String getVenue(){return venue;} public void setVenue(String v){venue=v;}
 public String getCity(){return city;} public void setCity(String v){city=v;}
 public Integer getPrice(){return price;} public void setPrice(Integer v){price=v;}
 public Integer getSeats(){return seats;} public void setSeats(Integer v){seats=v;}
 public Integer getAttendees(){return attendees;} public void setAttendees(Integer v){attendees=v;}
 public String getDescription(){return description;} public void setDescription(String v){description=v;}
 public String getColor(){return color;} public void setColor(String v){color=v;}
 public String getEmoji(){return emoji;} public void setEmoji(String v){emoji=v;}
}
