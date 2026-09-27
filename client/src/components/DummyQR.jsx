export default function DummyQR({ amount }) {
  // Fake QR ke liye ek public API
  const qrData = encodeURIComponent(
    `upi://pay?pa=dummy@siyarampalace&pn=Siyaram%20Palace&am=${amount}&cu=INR`
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${qrData}`;

  return (
    <div style={{ textAlign: 'center', padding: 16 }}>
      <img src={qrUrl} alt="Dummy QR" width={220} height={220} />
      <p style={{ marginTop: 8, color: '#888', fontSize: 13 }}>
        🧪 Dummy QR — scan karne pe paisa nahi katega
      </p>
    </div>
  );
}