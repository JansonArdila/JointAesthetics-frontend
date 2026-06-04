const API_URL = 'http://localhost:5000/api/orders';

export const orderService = {
    getAllOrders: async () => {
        const res = await fetch(`${API_URL}/all`, { credentials: 'include' });
        return res.json();
    },
    updateOrderStatus: async (id, estado, motivo_cancelacion = null) => {
        const body = { estado };
        if (motivo_cancelacion) body.motivo_cancelacion = motivo_cancelacion;

        const response = await fetch(
            `${API_URL}/orders/${id}/status`,
            createRequest('PUT', body)
        );
        return handleResponse(response);
    },
    validatePayment: async (id) => {
        const res = await fetch(`${API_URL}/${id}/validate`, {
            method: 'PUT',
            credentials: 'include'
        });
        return res.json();
    }
};
