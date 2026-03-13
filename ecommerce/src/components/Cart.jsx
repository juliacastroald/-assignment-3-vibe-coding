import { useState } from 'react'

const SHIPPING_ESTIMATES = [
  { prefixes: ['0', '1', '2'], days: '2–4 business days' },
  { prefixes: ['3'],           days: '4–6 business days' },
  { prefixes: ['4', '5', '6'], days: '3–5 business days' },
  { prefixes: ['7', '8'],      days: '4–6 business days' },
  { prefixes: ['9'],           days: '5–7 business days' },
]

function getShippingEstimate(zip) {
  if (!/^\d{5}$/.test(zip)) return null
  const entry = SHIPPING_ESTIMATES.find(e => e.prefixes.includes(zip[0]))
  return entry ? entry.days : '5–7 business days'
}

function Cart({ cart, total, onClose, onRemove, onUpdateQty, onCheckout }) {
  const [zip, setZip] = useState('')
  const shippingEstimate = getShippingEstimate(zip)

  return (
    <div className="cart-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cart-drawer">
        <div className="cart-header">
          <h2>Your Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})</h2>
          <button className="cart-close" onClick={onClose} aria-label="Close cart">×</button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <p className="cart-empty">Your cart is empty.</p>
          ) : (
            cart.map((item) => (
              <div className="cart-item" key={item.name}>
                <div
                  className="cart-item-thumb"
                  style={{
                    background: 'linear-gradient(160deg, #1a3a7c 0%, #2d5bb9 100%)',
                    color: 'white',
                    fontSize: '2rem',
                  }}
                >
                  {item.name.includes('Jacket') ? '🧥' : item.name.includes('Tee') ? '👕' : item.name.includes('Belt') ? '🪢' : '👖'}
                </div>
                <div className="cart-item-info">
                  <p className="cart-item-name">{item.name}</p>
                  {(item.waist || item.length) && (
                    <p className="cart-item-size">
                      Size: W{item.waist} × L{item.length}
                    </p>
                  )}
                  {item.value === 0 ? (
                    <p className="cart-item-free-badge">🎁 FREE – Promotional Gift</p>
                  ) : (
                    <>
                      <p className="cart-item-price">${item.value.toFixed(2)} each</p>
                      <div className="cart-item-controls">
                        <div className="cart-qty-control">
                          <button onClick={() => onUpdateQty(item.name, item.quantity - 1)}>−</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => onUpdateQty(item.name, item.quantity + 1)}>+</button>
                        </div>
                        <button className="cart-remove" onClick={() => onRemove(item.name)}>
                          Remove
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                  {item.value === 0 ? <span style={{ color: '#2a9d5c' }}>FREE</span> : `$${(item.value * item.quantity).toFixed(2)}`}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="zip-estimate">
            <div className="zip-row">
              <label className="zip-label" htmlFor="zip-input">Estimate shipping:</label>
              <input
                id="zip-input"
                className="zip-input"
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="ZIP code"
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            {shippingEstimate && (
              <p className="shipping-estimate">🚚 Estimated delivery: <strong>{shippingEstimate}</strong></p>
            )}
          </div>

          <div className="cart-total-row">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <p className="cart-subtotal-note">Shipping and taxes calculated at checkout</p>
          <button
            className="btn-checkout"
            onClick={onCheckout}
            disabled={cart.length === 0}
          >
            Checkout — ${total.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Cart
