package com.ems.repository;

import com.ems.entity.Review;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByEventIdOrderByCreatedAtDesc(Long eventId);
    Optional<Review> findByUserEmailAndEventId(String email, Long eventId);
    @Modifying
    @Query("delete from Review r where r.user.id = :userId")
    void deleteAllByUserId(Long userId);

    @Modifying
    @Query("delete from Review r where r.event.id = :eventId")
    void deleteAllByEventId(Long eventId);
}
