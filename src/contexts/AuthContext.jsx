import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService, cartService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState(null);
    const [cartItemsCount, setCartItemsCount] = useState(0);

    useEffect(() => {
        // Verificar si hay un usuario almacenado
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        // Actualizar contador del carrito cuando cambia el usuario
        if (user) {
            fetchCart();
        } else {
            setCart(null);
            setCartItemsCount(0);
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            const cartData = await cartService.getCart();
            setCart(cartData);
            const totalItems = cartData?.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0;
            setCartItemsCount(totalItems);
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await authService.login(email, password);

            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            setUser(response.user);
            await fetchCart();

            return { success: true, user: response.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authService.register(userData);
            console.log('Respuesta de register:', response);

            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            setUser(response.user);
            await fetchCart();

            return { success: true, user: response.user };
        } catch (error) {
            console.error('Error en register:', error);
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setCart(null);
        setCartItemsCount(0);
    };

    const updateCartCount = (count) => {
        setCartItemsCount(count);
    };

    const updateCart = (newCart) => {
        setCart(newCart);
        const totalItems = newCart?.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0;
        setCartItemsCount(totalItems);
    };

    const value = {
        user,
        loading,
        cart,
        cartItemsCount,
        login,
        register,
        logout,
        updateCartCount,
        updateCart,
        fetchCart
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);