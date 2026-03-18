export default function Avatar({ seed, size = 40, online = false }) {
  const url = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed || 'default'}`
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <img
        src={url}
        alt={seed}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: '2px solid #E0E0E0',
          objectFit: 'cover',
          background: '#f5f5f5',
          display: 'block',
        }}
      />
      {online && (
        <div style={{
          position: 'absolute',
          bottom: 1,
          right: 1,
          width: 10,
          height: 10,
          background: '#2AB876',
          borderRadius: '50%',
          border: '2px solid #fff',
        }} />
      )}
    </div>
  )
}
