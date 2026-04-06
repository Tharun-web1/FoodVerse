import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));

    useEffect(() => {
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                
                const getRole = (p) => {
                    const val = p.role || p.roles || p.authorities || p.authority;
                    if (!val) return "USER";
                    if (typeof val === 'string') return val;
                    if (Array.isArray(val)) {
                        const first = val[0];
                        if (typeof first === 'string') return first;
                        if (first && typeof first === 'object') return first.authority || first.name || first.role || "USER";
                    }
                    if (typeof val === 'object') return val.authority || val.name || val.role || "USER";
                    return "USER";
                };

                const role = getRole(payload).replace("ROLE_", "").toUpperCase();
                const storedRole = localStorage.getItem("user_role");
                
                setUser({ 
                    username: payload.sub || payload.username || "User",
                    role: (role === "USER" && storedRole) ? storedRole : role
                });
            } catch (e) {
                console.error("Auth initialization error:", e);
                setUser({ username: "User", role: localStorage.getItem("user_role") || "USER" });
            }
            localStorage.setItem("token", token);
        } else {
            setUser(null);
            localStorage.removeItem("token");
            localStorage.removeItem("user_role");
        }
    }, [token]);

    const login = (newToken) => {
        setToken(newToken);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("username");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};
