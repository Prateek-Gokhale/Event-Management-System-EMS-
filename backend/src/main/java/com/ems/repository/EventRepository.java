package com.ems.repository;

import com.ems.entity.Event;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findAllByOrderByDateAsc();
}
