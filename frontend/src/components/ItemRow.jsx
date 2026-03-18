export default function ItemRow({ item, onDelete, onPriceChange, onNameChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
      <input
        value={item.name}
        onChange={e => onNameChange && onNameChange(item.id, e.target.value)}
        placeholder="Item name"
        readOnly={!onNameChange}
        style={{
          flex: 1,
          border: 'none',
          background: 'transparent',
          fontSize: 14,
          color: '#111',
          outline: 'none',
          fontFamily: 'Inter, sans-serif',
          borderBottom: '1px solid #E0E0E0',
          paddingBottom: 4,
        }}
      />
      <div style={{
        background: '#E0E0E0',
        borderRadius: 12,
        padding: '4px 12px',
        minWidth: 60,
        textAlign: 'center',
      }}>
        <input
          type="number"
          value={item.price}
          onChange={e => onPriceChange && onPriceChange(item.id, Number(e.target.value))}
          readOnly={!onPriceChange}
          style={{
            width: 50,
            border: 'none',
            background: 'transparent',
            fontSize: 14,
            fontWeight: 600,
            color: '#111',
            textAlign: 'center',
            outline: 'none',
            fontFamily: 'Inter, sans-serif',
          }}
        />
      </div>
      {onDelete && (
        <button onClick={() => onDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#E53E3E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  )
}
