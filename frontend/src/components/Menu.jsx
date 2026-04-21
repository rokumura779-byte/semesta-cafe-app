import { useState } from "react";
import "../styles/menu.css";

const sections = [
  { id: "alacarte", cat: "food", title: "Special A'la Carte", items: [
    { id: 1, name: "Nasi Goreng Semesta", price: 18000 },
    { id: 2, name: "Nasi Goreng Oriental Coffee", price: 15000 },
    { id: 3, name: "Nasi Goreng Pluto", price: 13000 },
    { id: 4, name: "Nasi Magelangan", price: 15000 },
    { id: 5, name: "Nasi Omlet", price: 15000 },
    { id: 6, name: "Nasi Telor", price: 14000 },
  ]},
  { id: "noodle", cat: "food", title: "Special Noodle", items: [
    { id: 7, name: "Mie Goreng Semesta", price: 18000 },
    { id: 8, name: "Mie Kuah Semesta", price: 18000 },
    { id: 9, name: "Mie Ayam Goreng", price: 15000 },
    { id: 10, name: "Mie Oily Pluto", price: 15000 },
  ]},
  { id: "ricebowl", cat: "food", title: "Chicken Rice Bowl", items: [
    { id: 11, name: "Sambal Matah", price: 19000 },
    { id: 12, name: "Ayam Semesta", price: 15000 },
    { id: 13, name: "Teriyaki", price: 19000 },
    { id: 14, name: "Lada Hitam", price: 19000 },
    { id: 15, name: "Mentega", price: 19000 },
  ]},
  { id: "snack", cat: "food", title: "Semesta Snack", items: [
    { id: 16, name: "Kentang", price: 16000 },
    { id: 17, name: "Nugget", price: 14000 },
    { id: 18, name: "Sosis", price: 14000 },
    { id: 19, name: "Otak-Otak", price: 14000 },
    { id: 20, name: "Mix Platter", price: 20000 },
    { id: 21, name: "Canai Manis", price: 17000 },
    { id: 22, name: "Roti Bakar", price: 17000 },
  ]},
  { id: "milkbased", cat: "drink", title: "Semesta Milk Based", items: [
    { id: 30, name: "Greentea", price: 19000 },
    { id: 31, name: "Cookie's", price: 18000 },
    { id: 32, name: "Taro", price: 18000 },
    { id: 33, name: "Red Velvet", price: 17000 },
    { id: 34, name: "Chocolate", price: 17000 },
    { id: 35, name: "Strawberry", price: 16000 },
    { id: 36, name: "Vanilla", price: 16000 },
    { id: 37, name: "Susu Murni", price: 15000 },
  ]},
  { id: "signature", cat: "drink", title: "Semesta Signature Choice", items: [
    { id: 40, name: "Semesta Strawberry", price: 18000 },
    { id: 41, name: "Semesta Manggo", price: 18000 },
    { id: 42, name: "Semesta Pinapple", price: 18000 },
    { id: 43, name: "Choco Strawberry", price: 18000 },
    { id: 44, name: "Choco Hazelnut", price: 19000 },
    { id: 45, name: "Choco Mint", price: 19000 },
  ]},
  { id: "others", cat: "drink", title: "Others — Tea & Friend", items: [
    { id: 50, name: "Lemon Tea", price: 14000 },
    { id: 51, name: "Leacy Tea", price: 14000 },
    { id: 52, name: "Teh Tarik", price: 14000 },
    { id: 53, name: "Jahe / Jahe Susu", price: 14000 },
    { id: 54, name: "Mineral", price: 6000 },
  ]},
  { id: "espresso", cat: "drink", title: "Coffee — Espresso Based", items: [
    { id: 60, name: "Semesta Coffee", price: 16000 },
    { id: 61, name: "Cookies Coffee", price: 19000 },
    { id: 62, name: "Mocachino", price: 19000 },
    { id: 63, name: "Vanilla Latte", price: 19000 },
    { id: 64, name: "Hazelnut Coffee", price: 19000 },
    { id: 65, name: "Caramel Machiato", price: 19000 },
    { id: 66, name: "Black Moon", price: 19000 },
    { id: 67, name: "Supernova", price: 19000 },
    { id: 68, name: "Cappucino", price: 16000 },
    { id: 69, name: "Coffee Latte", price: 16000 },
    { id: 70, name: "Americano", price: 15000 },
    { id: 71, name: "Espresso", price: 13000 },
  ]},
  { id: "manualbrew", cat: "drink", title: "Coffee — Manual Brew", items: [
    { id: 75, name: "Tubruk", price: 12000 },
    { id: 76, name: "Tubruk Susu", price: 14000 },
    { id: 77, name: "Vietnam Drip", price: 16000 },
    { id: 78, name: "V60", price: 17000 },
  ]},
  { id: "squash", cat: "drink", title: "Semesta Squash & Mujito", items: [
    { id: 80, name: "Orange", price: 14000 },
    { id: 81, name: "Manggo", price: 14000 },
    { id: 82, name: "Melon", price: 14000 },
    { id: 83, name: "Strawberry", price: 14000 },
    { id: 84, name: "Lemonade", price: 14000 },
    { id: 85, name: "Virgin Mujito", price: 16000 },
    { id: 86, name: "Arbei Mujito", price: 16000 },
    { id: 87, name: "Orange Mujito", price: 16000 },
  ]},
  { id: "bundling", cat: "bundle", title: "Semesta Bundling", badge: "HEMAT", items: [
    { id: 90, name: "Merkurius Bundling", price: 16000, sub: "Mie Ayam Goreng & Es Teh" },
    { id: 91, name: "Venus Bundling", price: 24000, sub: "Rice Bowl & Lemon Tea" },
    { id: 92, name: "Earth Bundling", price: 26000, sub: "Steak Chicken & Lemon Tea" },
    { id: 93, name: "Mars Bundling", price: 14000, sub: "Nasi Goreng Pluto & Es Teh" },
  ]},
];

const CATS = [
  { id: "all", label: "Semua" },
  { id: "food", label: "Makanan" },
  { id: "drink", label: "Minuman" },
  { id: "bundle", label: "Bundling" },
];

export const fmt = (n) => "Rp " + n.toLocaleString("id-ID");

export default function Menu({ cart, onAddCart }) {
  const [activeCat, setActiveCat] = useState("all");
  const filtered = activeCat === "all" ? sections : sections.filter((s) => s.cat === activeCat);

  return (
    <section className="menu-section" id="menu">
      <div className="menu-hero">
        <span className="menu-hero-tag">Our Menu</span>
        <h2 className="menu-hero-title">Temukan Favoritmu</h2>
        <p className="menu-hero-sub">Free delivery area UMP Kampus 1 · @semesta_cafe · 0889 5772 061</p>
      </div>

      <div className="menu-tabs-wrap">
        <div className="menu-tabs">
          {CATS.map((c) => (
            <button
              key={c.id}
              className={`menu-tab${activeCat === c.id ? " active" : ""}`}
              onClick={() => setActiveCat(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="menu-content">
        {filtered.map((sec) => (
          <div key={sec.id} className="menu-group">
            <div className="menu-group-header">
              <div className="menu-group-bar" />
              <span className="menu-group-title">{sec.title}</span>
              {sec.badge && <span className="menu-group-badge">{sec.badge}</span>}
            </div>
            <div className="menu-items">
              {sec.items.map((item) => (
                <div key={item.id} className="menu-item">
                  <div className="menu-item-info">
                    <span className="menu-item-name">{item.name}</span>
                    {item.sub && <span className="menu-item-sub">{item.sub}</span>}
                  </div>
                  <div className="menu-item-right">
                    <span className="menu-item-price">{fmt(item.price)}</span>
                    <button
                      className={`menu-add-btn${cart[item.id] ? " added" : ""}`}
                      onClick={() => onAddCart(item)}
                      aria-label={`Tambah ${item.name}`}
                    >
                      {cart[item.id] ? "✓" : "+"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}