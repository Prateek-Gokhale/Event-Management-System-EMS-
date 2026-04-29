package com.ems.repository;

import com.ems.entity.Favorite;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserEmailOrderByEventDateAsc(String email);
    Optional<Favorite> findByUserEmailAndEventId(String email, Long eventId);
    boolean existsByUserEmailAndEventId(String email, Long eventId);
    @Modifying
    @Query("delete from Favorite f where f.user.id = :userId")
    void deleteAllByUserId(Long userId);

    @Modifying
    @Query("delete from Favorite f where f.event.id = :eventId")
    void deleteAllByEventId(Long eventId);
}
