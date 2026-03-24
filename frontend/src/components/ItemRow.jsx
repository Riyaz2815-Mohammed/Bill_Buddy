export default function ItemRow({ item, onDelete, onPriceChange, onNameChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#111', borderRadius: 16, border: '1px solid #333' }}>
      <input
        value={item.name}
        onChange={e => onNameChange && onNameChange(item.id, e.target.value)}
        placeholder="ITEM NAME"
        readOnly={!onNameChange}
        style={{
          flex: 1,
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
      <div style={{
        background: '#CCFF00',
        borderRadius: 12,
        padding: '6px 12px',
        minWidth: 70,
        textAlign: 'center',
        border: '2px solid #000'
      }}>
        <input
          type="number"
          value={item.price}
          onChange={e => onPriceChange && onPriceChange(item.id, Number(e.target.value))}
          readOnly={!onPriceChange}
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
            fontSize: 16,
            fontWeight: 900,
            color: '#000',
            textAlign: 'center',
            outline: 'none',
            fontFamily: 'Inter, sans-serif',
          }}
        />
      </div>
      {onDelete && (
        <button onClick={() => onDelete(item.id)} className="tap-scale" style={{ background: '#FF00E5', border: '2px solid #000', borderRadius: 12, cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#000" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" />
          </svg>
        </button>
      )}
    </div>
  )
}
