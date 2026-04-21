import { useState, useCallback } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Menu from "./components/menu";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Cart from "./components/Cart";
import Reservation from "./components/Reservation";
import "./App.css";

export default function App() {
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [resOpen, setResOpen] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }, []);

  const handleAddCart = useCallback((item) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: { ...item, qty: (prev[item.id]?.qty || 0) + 1 },
    }));
    showToast(`${item.name} ditambahkan ke keranjang`);
  }, [showToast]);

  const handleChangeQty = useCallback((id, delta) => {
    setCart((prev) => {
      const next = { ...prev };
      if (!next[id]) return next;
      next[id] = { ...next[id], qty: next[id].qty + delta };
      if (next[id].qty <= 0) delete next[id];
      return next;
    });
  }, []);

  const handleOrder = useCallback(() => {
    const total = Object.values(cart).reduce((a, b) => a + b.price * b.qty, 0);
    const fmt = (n) => "Rp " + n.toLocaleString("id-ID");
    setCart({});
    setCartOpen(false);
    showToast(`Pesanan berhasil dikirim! Total: ${fmt(total)}`);
  }, [cart, showToast]);

  const cartCount = Object.values(cart).reduce((a, b) => a + b.qty, 0);

  return (
    <>
      <Navbar
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenRes={() => setResOpen(true)}
      />

      <main>
        <Hero
          onOpenMenu={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
          onOpenRes={() => setResOpen(true)}
        />
        <Menu cart={cart} onAddCart={handleAddCart} />
        <About />
        <Contact />
      </main>

      <Footer />

      {cartOpen && (
        <Cart
          cart={cart}
          onChangeQty={handleChangeQty}
          onOrder={handleOrder}
          onClose={() => setCartOpen(false)}
        />
      )}

      {resOpen && (
        <Reservation
          onClose={() => setResOpen(false)}
          onToast={showToast}
        />
      )}

      {toast && (
        <div style={{
          position: "fixed",
          bottom: 28,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#1C2B1E",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: 8,
          fontSize: 13,
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 700,
          zIndex: 500,
          whiteSpace: "nowrap",
          animation: "toastFade 2.8s ease forwards",
          pointerEvents: "none",
        }}>
          {toast}
        </div>
      )}
    </>
  );
}