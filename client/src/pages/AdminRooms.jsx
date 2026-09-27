 
import Sidebar from '../components/admin/Sidebar';
import RoomsGrid from '../components/admin/RoomsGrid';

function AdminRooms() {
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{ marginLeft: 240, flex: 1, padding: 24, background: 'var(--light-bg)', minHeight: '100vh' }}>
                <h1 style={{ color: 'var(--navy)', fontFamily: 'Playfair Display, serif', marginBottom: 25 }}>
                    Rooms
                </h1>
                <RoomsGrid />
            </main>
        </div>
    );
}

export default AdminRooms;