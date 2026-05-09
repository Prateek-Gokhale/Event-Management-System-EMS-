package com.ems.repository;

import com.ems.entity.Booking;
import com.ems.entity.enums.BookingStatus;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserIdOrderByBookingDateDesc(Long userId);
    List<Booking> findAllByOrderByBookingDateDesc();
    boolean existsByUserIdAndEventIdAndStatus(Long userId, Long eventId, BookingStatus status);
    long countByEventIdAndStatus(Long eventId, BookingStatus status);
    long countByEventIdAndStatusIn(Long eventId, Collection<BookingStatus> statuses);
    long countByEventIdAndStatusInAndIdNot(Long eventId, Collection<BookingStatus> statuses, Long id);
    long countByUserId(Long userId);

    @Query("""
            select b.event.id as eventId,
                   sum(case when b.status = com.ems.entity.enums.BookingStatus.BOOKED then 1 else 0 end) as bookedSeats,
                   count(b.id) as reservedSeats
            from Booking b
            where b.event.id in :eventIds and b.status in :statuses
            group by b.event.id
            """)
    List<BookingEventStats> findEventStats(Collection<Long> eventIds, Collection<BookingStatus> statuses);

    @Modifying
    @Query("delete from Booking b where b.user.id = :userId")
    void deleteAllByUserId(Long userId);

    @Modifying
    @Query("delete from Booking b where b.event.id = :eventId")
    void deleteAllByEventId(Long eventId);
}
