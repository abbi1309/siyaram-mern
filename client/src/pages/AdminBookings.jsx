 
import Sidebar from '../components/admin/Sidebar';
import BookingsTable from '../components/admin/BookingsTable';

function AdminBookings() {
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{ marginLeft: 240, flex: 1, padding: 24, background: 'var(--light-bg)', minHeight: '100vh' }}>
                <h1 style={{ color: 'var(--navy)', fontFamily: 'Playfair Display, serif', marginBottom: 25 }}>
                    Bookings
                </h1>
                <BookingsTable />
            </main>
        </div>
    );
}

export default AdminBookings;