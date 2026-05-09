package com.ems.repository;

import com.ems.entity.Coupon;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCodeIgnoreCase(String code);
    Optional<Coupon> findByCodeIgnoreCaseAndActiveTrue(String code);
}
