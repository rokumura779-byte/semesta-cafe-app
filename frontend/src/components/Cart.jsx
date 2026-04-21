import "../styles/cart.css";
import { fmt } from "./menu";

export default function Cart({ cart, onChangeQty, onOrder, onClose }) {
  const items = Object.values(cart).filter((i) => i.qty > 0);
  const total = items.reduce((a, b) => a + b.price * b.qty, 0);

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <span className="cart-title">Keranjang Belanja</span>
          <button className="cart-close" onClick={onClose} aria-label="Tutup">✕</button>
        </div>

        <div className="cart-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <p>Keranjang masih kosong</p>
              <span>Tambahkan menu favoritmu</span>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.name}</span>
                    <span className="cart-item-price">{fmt(item.price)}</span>
                  </div>
                  <div className="cart-qty">
                    <button className="qty-btn" onClick={() => onChangeQty(item.id, -1)}>−</button>
                    <span className="qty-num">{item.qty}</span>
                    <button className="qty-btn" onClick={() => onChangeQty(item.id, 1)}>+</button>
                  </div>
                </div>
              ))}

              <div className="cart-total">
                <span>Total</span>
                <span>{fmt(total)}</span>
              </div>

              <div className="cart-summary">
                <div className="cart-summary-row">
                  <span>Subtotal ({items.reduce((a, b) => a + b.qty, 0)} item)</span>
                  <span>{fmt(total)}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Ongkir (area UMP)</span>
                  <span className="free-tag">Gratis</span>
                </div>
              </div>

              <button className="cart-order-btn" onClick={onOrder}>
                Pesan Sekarang
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}