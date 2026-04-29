package com.ems.controller;

import com.ems.entity.Event;
import com.ems.entity.Favorite;
import com.ems.entity.User;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.EventRepository;
import com.ems.repository.FavoriteRepository;
import com.ems.repository.UserRepository;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    public FavoriteController(FavoriteRepository favoriteRepository, UserRepository userRepository, EventRepository eventRepository) {
        this.favoriteRepository = favoriteRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
    }

    @GetMapping
    public ResponseEntity<List<Long>> getFavoriteEventIds(Authentication authentication) {
        List<Long> eventIds = favoriteRepository.findByUserEmailOrderByEventDateAsc(authentication.getName())
                .stream()
                .map(favorite -> favorite.getEvent().getId())
                .toList();
        return ResponseEntity.ok(eventIds);
    }

    @PostMapping("/{eventId}")
    public ResponseEntity<List<Long>> addFavorite(@PathVariable Long eventId, Authentication authentication) {
        if (!favoriteRepository.existsByUserEmailAndEventId(authentication.getName(), eventId)) {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
            Favorite favorite = new Favorite();
            favorite.setUser(user);
            favorite.setEvent(event);
            favoriteRepository.save(favorite);
        }
        return getFavoriteEventIds(authentication);
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<List<Long>> removeFavorite(@PathVariable Long eventId, Authentication authentication) {
        favoriteRepository.findByUserEmailAndEventId(authentication.getName(), eventId)
                .ifPresent(favoriteRepository::delete);
        return getFavoriteEventIds(authentication);
    }
}
