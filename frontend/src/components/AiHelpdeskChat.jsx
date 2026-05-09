import { useEffect, useMemo, useRef, useState } from "react";
import api from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import { asArray } from "../utils/apiData";
import { formatCurrency, formatDate } from "../utils/format";

const INITIAL_MESSAGE = {
  id: "welcome",
  sender: "bot",
  text:
    "Hi, I am EMS Assist. Ask me about events, prices, seats, booking, cancellations, login, or admin support.",
};

const QUICK_PROMPTS = [
  "Upcoming events",
  "How to book?",
  "Ticket price",
  "Available seats",
];

function normalize(value) {
  return String(value || "").toLowerCase();
}

function includesAny(text, words) {
  return words.some((word) => text.includes(word));
}

function sortUpcoming(events) {
  const now = new Date();
  return [...events]
    .filter((eventItem) => !eventItem.date || new Date(eventItem.date) >= now)
    .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
}

function findMatchingEvents(events, query) {
  const terms = normalize(query)
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 2);

  return events.filter((eventItem) => {
    const haystack = normalize(
      [eventItem.name, eventItem.category, eventItem.city, eventItem.venue, eventItem.description].join(" ")
    );
    return terms.some((term) => haystack.includes(term));
  });
}

function formatEventLine(eventItem) {
  return `${eventItem.name} - ${eventItem.city || eventItem.venue || "Venue TBA"} - ${formatDate(
    eventItem.date
  )} - ${formatCurrency(eventItem.price)} - ${eventItem.availableSeats ?? 0} seats left`;
}

function getBotReply(message, events, isAuthenticated, isAdmin) {
  const text = normalize(message);
  const matches = findMatchingEvents(events, message);
  const usefulMatches = matches.slice(0, 3);
  const upcoming = sortUpcoming(events).slice(0, 3);

  if (includesAny(text, ["hello", "hi", "hey", "help", "support"])) {
    return "I can help you find events, compare prices, check available seats, explain booking steps, and guide you to login or registration.";
  }

  if (includesAny(text, ["upcoming", "next", "latest", "featured", "events", "event list"])) {
    if (upcoming.length === 0) {
      return "No upcoming events are loaded right now. Please check the Events page or try again after the backend is running.";
    }
    return `Here are upcoming events:\n${upcoming.map(formatEventLine).join("\n")}`;
  }

  if (includesAny(text, ["book", "booking", "ticket", "reserve", "cart"])) {
    if (!isAuthenticated) {
      return "To book an event: open Events, choose an event, login as a user, add it to cart, then submit the booking request for admin approval.";
    }
    if (isAdmin) {
      return "Admins manage events and approve bookings from the admin dashboard. Use a user account to place attendee bookings.";
    }
    return "To book: open Events, view an event, add it to cart, then submit your booking request. You can track approval from My Bookings.";
  }

  if (includesAny(text, ["price", "cost", "fee", "amount", "cheap", "expensive"])) {
    if (usefulMatches.length > 0) {
      return `Price details:\n${usefulMatches.map((eventItem) => `${eventItem.name}: ${formatCurrency(eventItem.price)}`).join("\n")}`;
    }
    if (upcoming.length > 0) {
      return `Current event prices:\n${upcoming.map((eventItem) => `${eventItem.name}: ${formatCurrency(eventItem.price)}`).join("\n")}`;
    }
    return "Event prices appear on every event card and details page. I could not load event data right now.";
  }

  if (includesAny(text, ["seat", "capacity", "available", "availability", "full"])) {
    if (usefulMatches.length > 0) {
      return `Seat availability:\n${usefulMatches
        .map((eventItem) => `${eventItem.name}: ${eventItem.availableSeats ?? 0}/${eventItem.capacity ?? 0} seats`)
        .join("\n")}`;
    }
    if (upcoming.length > 0) {
      return `Available seats:\n${upcoming
        .map((eventItem) => `${eventItem.name}: ${eventItem.availableSeats ?? 0}/${eventItem.capacity ?? 0} seats`)
        .join("\n")}`;
    }
    return "Seat availability is shown on each event card. If it shows 0 seats, booking is disabled.";
  }

  if (includesAny(text, ["cancel", "refund", "delete booking"])) {
    return "For cancellation help, open My Bookings and check the booking status. If it is already approved, contact the event organizer or admin before the event date.";
  }

  if (includesAny(text, ["login", "sign in", "register", "account", "admin"])) {
    return "Users should use User Login or Register. Website administrators should use the separate Admin Login page. Admin accounts cannot login through the user portal.";
  }

  if (includesAny(text, ["location", "city", "venue", "where"])) {
    if (usefulMatches.length > 0) {
      return `Location details:\n${usefulMatches
        .map((eventItem) => `${eventItem.name}: ${eventItem.city || eventItem.venue || "Venue TBA"}`)
        .join("\n")}`;
    }
    return "Use the city filter on the Events page to find events by location. You can also ask me for a city name, like 'events in Bengaluru'.";
  }

  if (usefulMatches.length > 0) {
    return `I found these matching events:\n${usefulMatches.map(formatEventLine).join("\n")}`;
  }

  return "I can help with event search, booking steps, prices, seats, locations, login, registration, and booking approval. Try asking 'upcoming events' or 'how to book'.";
}

function AiHelpdeskChat() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [events, setEvents] = useState([]);
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const isOpenRef = useRef(isOpen);
  const responseTimerRef = useRef(null);

  const subtitle = useMemo(() => {
    if (typing) return "Typing...";
    return isAuthenticated ? `Online for ${user?.name || "your account"}` : "Online now";
  }, [isAuthenticated, typing, user?.name]);

  useEffect(() => {
    api
      .get("/events")
      .then((res) => setEvents(asArray(res.data)))
      .catch(() => setEvents([]));
  }, []);

  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) {
      setUnread(0);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [isOpen, messages, typing]);

  const sendMessage = (value) => {
    const text = value.trim();
    if (!text || typing) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setTyping(true);

    responseTimerRef.current = window.setTimeout(() => {
      const botMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: getBotReply(text, events, isAuthenticated, isAdmin),
      };
      setMessages((prev) => [...prev, botMessage]);
      setTyping(false);
      if (!isOpenRef.current) setUnread((count) => count + 1);
      responseTimerRef.current = null;
    }, 360);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (isAdmin) {
    return null;
  }

  const closeChat = () => {
    if (responseTimerRef.current) {
      window.clearTimeout(responseTimerRef.current);
      responseTimerRef.current = null;
    }
    setIsOpen(false);
    setMessages([INITIAL_MESSAGE]);
    setInput("");
    setTyping(false);
    setUnread(0);
  };

  return (
    <aside className={`ai-chat ${isOpen ? "open" : ""}`} aria-label="AI event helpdesk">
      {isOpen && (
        <section className="ai-chat-panel">
          <header className="ai-chat-header">
            <div>
              <span className="ai-chat-kicker">AI Helpdesk</span>
              <h3>EMS Assist</h3>
              <p>{subtitle}</p>
            </div>
            <button className="ai-chat-close" type="button" onClick={closeChat} aria-label="Close chat">
              x
            </button>
          </header>

          <div className="ai-chat-messages" role="log" aria-live="polite">
            {messages.map((message) => (
              <div className={`ai-message ${message.sender}`} key={message.id}>
                {message.text.split("\n").map((line, index) => (
                  <p key={`${message.id}-${index}`}>{line}</p>
                ))}
              </div>
            ))}
            {typing && (
              <div className="ai-message bot compact">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="ai-chat-prompts" aria-label="Suggested questions">
            {QUICK_PROMPTS.map((prompt) => (
              <button type="button" key={prompt} onClick={() => sendMessage(prompt)}>
                {prompt}
              </button>
            ))}
          </div>

          <form className="ai-chat-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about events..."
              aria-label="Ask EMS Assist"
            />
            <button type="submit" disabled={!input.trim() || typing}>
              Send
            </button>
          </form>
        </section>
      )}

      <button
        className="ai-chat-launcher"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close AI helpdesk" : "Open AI helpdesk"}
      >
        <span className="ai-chat-icon" aria-hidden="true">
          <span className="ai-robot-head">
            <span className="ai-robot-eye" />
            <span className="ai-robot-eye" />
          </span>
        </span>
        {!isOpen && unread > 0 && <b>{unread}</b>}
      </button>
    </aside>
  );
}

export default AiHelpdeskChat;
