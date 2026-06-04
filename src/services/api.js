const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Función para obtener URL de imagen
export const getImageUrl = (imageName) => {
    if (!imageName) return null;
    return `${API_URL.replace('/api', '')}/uploads/${imageName}`;
};

// Función helper para manejar respuestas HTTP
const handleResponse = async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        console.error('Error completo del backend:', data); // <-- aquí vemos TODO
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    return data;
};

// Obtener token del localStorage
const getToken = () => localStorage.getItem('token');

// Configuración base para fetch
const createRequest = (method, data = null, isFormData = false) => {
    const config = {
        method,
        headers: {}
    };

    const token = getToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (!isFormData && data) {
        config.headers['Content-Type'] = 'application/json';
        config.body = JSON.stringify(data);
    } else if (data) {
        config.body = data;
    }

    return config;
};

// Función para crear FormData
const createFormData = (data) => {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
        if (key !== 'imagenes' && data[key] !== undefined && data[key] !== null) {
            formData.append(key, data[key]);
        }
    });

    if (data.imagenes && Array.isArray(data.imagenes)) {
        data.imagenes.forEach(imagen => {
            if (imagen instanceof File) {
                formData.append('imagenes', imagen);
            }
        });
    }

    return formData;
};

// Servicio de autenticación
export const authService = {
    login: async (email, password) => {
        const response = await fetch(
            `${API_URL}/auth/login`,
            createRequest('POST', { email, password })
        );
        return handleResponse(response);
    },

    register: async (userData) => {
        const response = await fetch(
            `${API_URL}/auth/register`,
            createRequest('POST', userData)
        );
        return handleResponse(response);
    },

    getProfile: async () => {
        const response = await fetch(
            `${API_URL}/auth/profile`,
            createRequest('GET')
        );
        return handleResponse(response);
    },

    updateProfile: async (profileData) => {
        const response = await fetch(
            `${API_URL}/auth/profile`,
            createRequest('PUT', profileData)
        );
        return handleResponse(response);
    }
};

// Servicio de productos
export const productService = {
    getAll: async () => {
        const response = await fetch(`${API_URL}/products`);
        return handleResponse(response);
    },

    getById: async (id) => {
        const response = await fetch(`${API_URL}/products/${id}`);
        return handleResponse(response);
    },

    getByCategory: async (category) => {
        const response = await fetch(`${API_URL}/products/categoria/${category}`);
        return handleResponse(response);
    },

    // Solo admin
    create: async (productData) => {
        const formData = createFormData(productData);
        const response = await fetch(
            `${API_URL}/products`,
            createRequest('POST', formData, true)
        );
        return handleResponse(response);
    },

    update: async (id, productData) => {
        const formData = createFormData(productData);
        const response = await fetch(
            `${API_URL}/products/${id}`,
            createRequest('PUT', formData, true)
        );
        return handleResponse(response);
    },

    delete: async (id) => {
        const response = await fetch(
            `${API_URL}/products/${id}`,
            createRequest('DELETE')
        );
        return handleResponse(response);
    },

    deleteImage: async (imageId) => {
        const response = await fetch(
            `${API_URL}/products/image/${imageId}`,
            createRequest('DELETE')
        );
        return handleResponse(response);
    },

    setMainImage: async (imageId) => {
        const response = await fetch(
            `${API_URL}/products/image/${imageId}/main`,
            createRequest('PUT')
        );
        return handleResponse(response);
    },

    reorderImages: async (ordenes) => {
        const response = await fetch(
            `${API_URL}/products/reorder-images`,
            createRequest('POST', { ordenes })
        );
        return handleResponse(response);
    }
};

// Servicio de carrito
export const cartService = {
    getCart: async () => {
        const response = await fetch(
            `${API_URL}/cart`,
            createRequest('GET')
        );
        return handleResponse(response);
    },

    addToCart: async (producto_id, cantidad) => {
        const response = await fetch(
            `${API_URL}/cart/add`,
            createRequest('POST', { producto_id, cantidad })
        );
        return handleResponse(response);
    },

    updateCartItem: async (id, cantidad) => {
        const response = await fetch(
            `${API_URL}/cart/item/${id}`,
            createRequest('PUT', { cantidad })
        );
        return handleResponse(response);
    },

    removeCartItem: async (id) => {
        const response = await fetch(
            `${API_URL}/cart/item/${id}`,
            createRequest('DELETE')
        );
        return handleResponse(response);
    },

    clearCart: async () => {
        const response = await fetch(
            `${API_URL}/cart/clear`,
            createRequest('DELETE')
        );
        return handleResponse(response);
    }
};

// Servicio de pedidos
export const orderService = {
    createOrder: async (formData) => {
        const response = await fetch(
            `${API_URL}/orders`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            }
        );
        return handleResponse(response);
    },

    getUserOrders: async () => {
        const response = await fetch(
            `${API_URL}/orders/my-orders`,
            createRequest('GET')
        );
        return handleResponse(response);
    },

    // Solo admin
    getAllOrders: async () => {
        const response = await fetch(
            `${API_URL}/orders/all`,
            createRequest('GET')
        );
        return handleResponse(response);
    },

    updateOrderStatus: async (id, data) => {
        const response = await fetch(
            `${API_URL}/orders/${id}/status`,
            createRequest('PUT', data)
        );
        return handleResponse(response);
    },

    validatePayment: async (id) => {
        const response = await fetch(
            `${API_URL}/orders/${id}/validate`,
            createRequest('PUT')
        );
        return handleResponse(response);
    }


};