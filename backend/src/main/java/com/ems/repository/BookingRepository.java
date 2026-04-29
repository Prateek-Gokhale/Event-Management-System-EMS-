package com.ems.repository;

import com.ems.entity.Booking;
import com.ems.entity.enums.BookingStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserIdOrderByBookingDateDesc(Long userId);
    List<Booking> findAllByOrderByBookingDateDesc();
    boolean existsByUserIdAndEventIdAndStatus(Long userId, Long eventId, BookingStatus status);
    long countByEventIdAndStatus(Long eventId, BookingStatus status);
    long countByUserId(Long userId);

    @Modifying
    @Query("delete from Booking b where b.user.id = :userId")
    void deleteAllByUserId(Long userId);

    @Modifying
    @Query("delete from Booking b where b.event.id = :eventId")
    void deleteAllByEventId(Long eventId);
}
