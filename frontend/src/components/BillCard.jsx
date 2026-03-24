import Badge from './Badge'

export default function BillCard({ bill }) {
  const isPaid = bill.status === 'paid'

  return (
    <div className="card-hover tap-scale brutal-card" style={{
      background: isPaid ? '#111' : '#CCFF00',
      border: isPaid ? '2px solid #333' : '2px solid #000',
      borderRadius: 24,
      padding: '24px 20px',
      color: isPaid ? '#fff' : '#000',
      boxShadow: isPaid ? 'none' : '4px 6px 0px #000',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontWeight: 900, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>{bill.title}</span>
        {isPaid ? (
          <span style={{ fontSize: 10, fontWeight: 900, background: '#333', color: '#aaa', borderRadius: 8, padding: '4px 10px', letterSpacing: 1 }}>SETTLED</span>
        ) : (
          <span style={{ fontSize: 10, fontWeight: 900, background: '#000', color: '#fff', borderRadius: 8, padding: '4px 10px', letterSpacing: 1 }}>UNPAID</span>
        )}
      </div>
      
      {!isPaid && (
        <p style={{ fontSize: 42, fontWeight: 900, margin: '8px 0 16px', lineHeight: 1, letterSpacing: -1.5 }}>
          ₹{bill.amount_owed}
        </p>
      )}

      {isPaid && (
        <p style={{ fontSize: 28, fontWeight: 900, margin: '8px 0 16px', lineHeight: 1, color: '#555', letterSpacing: -1 }}>
          ₹{bill.total}
        </p>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        <p style={{ fontSize: 13, fontWeight: 800, opacity: 0.6 }}>TOTAL: ₹{bill.total}</p>
        <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', opacity: 0.8 }}>BY {bill.created_by.split(' ')[0]}</p>
      </div>
    </div>
  )
}
