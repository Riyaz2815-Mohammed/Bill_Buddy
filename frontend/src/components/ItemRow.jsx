export default function ItemRow({ item, onDelete, onPriceChange, onNameChange, onQuantityChange }) {
  const amount = (item.quantity * item.price).toFixed(2)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px', background: '#111', borderRadius: 16, border: '1px solid #333' }}>
      <input
        value={item.name}
        onChange={e => onNameChange && onNameChange(item.id, e.target.value)}
        placeholder="ITEM NAME"
        readOnly={!onNameChange}
        style={{
          flex: 1,
          minWidth: 50,
          border: 'none',
          background: 'transparent',
          fontSize: 14,
          fontWeight: 900,
          color: '#fff',
          outline: 'none',
          fontFamily: 'Inter, sans-serif',
          textTransform: 'uppercase',
          letterSpacing: 0.5
        }}
      />
      {/* QUANTITY */}
      <div style={{ background: '#222', borderRadius: 8, padding: '4px', width: 44, flexShrink: 0, border: '1px solid #444', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: '#888', fontWeight: 900, marginBottom: 2 }}>QTY</span>
        <input
          type="number"
          value={item.quantity || 1}
          onChange={e => onQuantityChange && onQuantityChange(item.id, parseInt(e.target.value) || 1)}
          readOnly={!onQuantityChange}
          style={{
            width: '100%', border: 'none', background: 'transparent',
            fontSize: 14, fontWeight: 900, color: '#fff', textAlign: 'center', outline: 'none'
          }}
        />
      </div>

      <span style={{ color: '#666', fontWeight: 900, fontSize: 12 }}>x</span>

      {/* RATE */}
      <div style={{ background: '#222', borderRadius: 8, padding: '4px', width: 56, flexShrink: 0, border: '1px solid #444', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: '#888', fontWeight: 900, marginBottom: 2 }}>RATE</span>
        <input
          type="number"
          value={item.price}
          onChange={e => onPriceChange && onPriceChange(item.id, Number(e.target.value))}
          readOnly={!onPriceChange}
          style={{
            width: '100%', border: 'none', background: 'transparent',
            fontSize: 14, fontWeight: 900, color: '#fff', textAlign: 'center', outline: 'none'
          }}
        />
      </div>

      <span style={{ color: '#666', fontWeight: 900, fontSize: 12 }}>=</span>

      {/* AMOUNT (Total) */}
      <div style={{
        background: '#CCFF00', borderRadius: 10, padding: '6px', width: 64, flexShrink: 0,
        textAlign: 'center', border: '2px solid #000', display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <span style={{ fontSize: 9, color: '#000', fontWeight: 900, opacity: 0.7, marginBottom: 2 }}>AMT</span>
        <div style={{ fontSize: 13, fontWeight: 900, color: '#000', fontFamily: 'Inter' }}>
          {amount}
        </div>
      </div>
      {onDelete && (
        <button onClick={() => onDelete(item.id)} className="tap-scale" style={{ background: '#FF00E5', border: '2px solid #000', borderRadius: 10, cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#000" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" />
          </svg>
        </button>
      )}
    </div>
  )
}
