import Badge from './Badge'

export default function BillCard({ bill }) {
  const isPaid = bill.status === 'paid'

  return (
    <div className="card-hover tap-scale" style={{
      background: isPaid
        ? '#fff'
        : 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
      borderRadius: 20,
      padding: 18,
      boxShadow: isPaid
        ? '0 2px 16px rgba(0,0,0,0.06)'
        : '0 6px 20px rgba(255,107,107,0.30)',
      cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <span style={{ fontWeight: 800, fontSize: 15, color: isPaid ? '#111' : '#fff' }}>{bill.title}</span>
        {isPaid ? (
          <Badge type="paid" />
        ) : (
          <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(255,255,255,0.25)', color: '#fff', borderRadius: 8, padding: '3px 10px', letterSpacing: 0.5 }}>UNPAID</span>
        )}
      </div>
      <p style={{ fontSize: 13, color: isPaid ? '#999' : 'rgba(255,255,255,0.75)', margin: '4px 0' }}>Total: ₹{bill.total}</p>
      {!isPaid && (
        <p style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: '6px 0 2px', lineHeight: 1 }}>
          ₹{bill.amount_owed} <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.8 }}>pending</span>
        </p>
      )}
      <p style={{ fontSize: 12, color: isPaid ? '#aaa' : 'rgba(255,255,255,0.65)', textAlign: 'right', margin: '4px 0 0' }}>
        by {bill.created_by}
      </p>
    </div>
  )
}
