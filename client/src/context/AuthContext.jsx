// ============================================
// AUTH CONTEXT
// User authentication state manage karta hai
// Login, Register, Logout, Update User
// ============================================

// React hooks
import { createContext, useContext, useState, useEffect } from 'react';

// Axios instance (base URL + interceptors)
import API from '../api/axios';

// Toast notifications
import toast from 'react-hot-toast';

// Context banao
const AuthContext = createContext();


// ============================================
// AUTH PROVIDER — Poora app isse wrap hoga
// ============================================
export function AuthProvider({ children }) {
    // ---------- STATE ----------
    // Logged-in user ka data (null = not logged in)
    const [user, setUser] = useState(null);

    // Loading state — app load hote waqt
    const [loading, setLoading] = useState(true);


    // ============================================
    // EFFECT: App load pe saved user check karo
    // localStorage se user uthao
    // ============================================
    useEffect(() => {
        // localStorage se saved data nikalo
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        // Dono hain to user set karo
        if (savedUser && token) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                // Corrupt data — clear karo
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        // Loading complete
        setLoading(false);
    }, []);


    // ============================================
    // LOGIN — User login karta hai
    // ============================================
    const login = async (email, password) => {
        try {
            const { data } = await API.post('/auth/login', {
                email,
                password,
            });

            if (data.success) {
                // Token + user localStorage me save karo
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // State update karo
                setUser(data.user);

                toast.success(`Welcome back, ${data.user.name}!`);

                // Success return karo
                return { success: true, user: data.user };
            }

            return { success: false, message: data.message };
        } catch (error) {
            const msg = error.response?.data?.message || 'Login failed';
            toast.error(msg);
            return { success: false, message: msg };
        }
    };


    // ============================================
    // REGISTER — Naya user banao
    // ============================================
    const register = async (name, email, phone, password) => {
        try {
            const { data } = await API.post('/auth/register', {
                name,
                email,
                phone,
                password,
            });

            if (data.success) {
                // Token + user save karo
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // State update
                setUser(data.user);

                toast.success('Account created!');

                return { success: true, user: data.user };
            }

            return { success: false, message: data.message };
        } catch (error) {
            const msg =
                error.response?.data?.message || 'Registration failed';
            toast.error(msg);
            return { success: false, message: msg };
        }
    };


    // ============================================
    // LOGOUT — User logout karta hai
    // ============================================
    const logout = () => {
        // localStorage clear karo
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // State clear karo
        setUser(null);

        toast.success('Logged out');
    };


    // ============================================
    // UPDATE USER — Profile update ke baad use karo
    // AuthContext ka user data refresh karta hai
    // (Bina page reload kiye navbar me naya naam dikhega)
    // ============================================
    const updateUser = (newUserData) => {
        // Purane user data + naya data merge karo
        // Example: { name: 'Rahul', phone: '9876...' }
        const updatedUser = { ...user, ...newUserData };

        // React state update — UI turant refresh hoga
        setUser(updatedUser);

        // localStorage bhi update karo — page refresh pe bhi naya data rahe
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };


    // ============================================
    // RENDER — Context value provide karo
    // ============================================
    return (
        <AuthContext.Provider
            value={{
                user,               // User data
                loading,            // Loading state
                login,              // Login function
                register,           // Register function
                logout,             // Logout function
                updateUser,         // 👈 NAYA: Profile update ke baad

                // Computed values (boolean flags)
                isLoggedIn: !!user,
                isAdmin: user?.role === 'admin',
                isStaff:
                    user?.role === 'staff' || user?.role === 'admin',
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}


// ============================================
// useAuth HOOK
// Custom hook — context use karne ke liye
// Koi bhi component use kar sakta hai:
//   const { user, login, logout } = useAuth();
// ============================================
export const useAuth = () => {
    const context = useContext(AuthContext);

    // Agar AuthProvider ke bahar use kare to error
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
};