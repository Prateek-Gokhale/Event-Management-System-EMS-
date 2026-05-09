import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "ems_cart";

function getInitialCartState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(getInitialCartState);

  const sync = (next) => {
    setItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Cart persistence is optional; keep the in-memory cart usable.
    }
  };

  const addToCart = (eventItem) => {
    if (items.find((item) => item.id === eventItem.id)) {
      return false;
    }
    sync([...items, eventItem]);
    return true;
  };

  const removeFromCart = (eventId) => {
    sync(items.filter((item) => item.id !== eventId));
  };

  const clearCart = () => {
    sync([]);
  };

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      addToCart,
      removeFromCart,
      clearCart,
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
