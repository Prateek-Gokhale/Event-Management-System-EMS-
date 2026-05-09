package com.ems.repository;

import com.ems.entity.Review;
import java.util.List;
import java.util.Optional;
import java.util.Collection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByEventIdOrderByCreatedAtDesc(Long eventId);
    Optional<Review> findByUserEmailAndEventId(String email, Long eventId);

    @Query("""
            select r.event.id as eventId,
                   avg(r.rating) as averageRating,
                   count(r.id) as reviewCount
            from Review r
            where r.event.id in :eventIds
            group by r.event.id
            """)
    List<ReviewEventStats> findEventStats(Collection<Long> eventIds);

    @Modifying
    @Query("delete from Review r where r.user.id = :userId")
    void deleteAllByUserId(Long userId);

    @Modifying
    @Query("delete from Review r where r.event.id = :eventId")
    void deleteAllByEventId(Long eventId);
}
