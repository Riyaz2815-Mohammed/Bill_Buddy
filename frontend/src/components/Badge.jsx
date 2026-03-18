export default function Badge({ type = 'unpaid' }) {
  const isPaid = type === 'paid'
  return (
    <span style={{
      background: isPaid ? '#E0F5EC' : '#FFE8E8',
      color: isPaid ? '#2AB876' : '#E53E3E',
      borderRadius: 20,
      padding: '4px 12px',
      fontSize: 12,
      fontWeight: 600,
      whiteSpace: 'nowrap',
      display: 'inline-block',
    }}>
      {isPaid ? 'Paid' : 'Unpaid'}
    </span>
  )
}
