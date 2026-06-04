import React, { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../utils/formatters';
import { getImageUrl } from '../services/api';


const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { user } = useAuth();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await orderService.getUserOrders();
            setOrders(data);
            setError('');
        } catch (err) {
            setError('Error al cargar los pedidos: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pendiente': return 'bg-yellow-100 text-yellow-800';
            case 'confirmado': return 'bg-blue-100 text-blue-800';
            case 'en_camino': return 'bg-purple-100 text-purple-800';
            case 'entregado': return 'bg-green-100 text-green-800';
            case 'cancelado': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        const statusMap = {
            'pendiente': 'Pendiente',
            'confirmado': 'Confirmado',
            'en_camino': 'En camino',
            'entregado': 'Entregado',
            'cancelado': 'Cancelado'
        };
        return statusMap[status] || status;
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="spinner"></div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Mis Pedidos</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {orders.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay pedidos</h3>
                    <p className="text-gray-500 mb-6">Aún no has realizado ningún pedido.</p>
                    <a href="/" className="btn-primary">
                        Ver Productos
                    </a>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order.id} className="card">
                            <div className="flex flex-wrap justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold">Pedido #{order.id}</h3>
                                    {/* Mostrar número de guía solo cuando el estado sea "en_camino" */}
                                    {order.estado === 'en_camino' && order.numero_guia && (
                                        <p className="text-lg font-bold">
                                            Número de guía: {order.numero_guia}
                                        </p>
                                    )}
                                    <p className="text-gray-600">
                                        {new Date(order.fecha_pedido).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4 mt-2 md:mt-0">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.estado)}`}>
                                        {getStatusText(order.estado)}
                                    </span>
                                    <span className="text-2xl font-bold text-primary-600">
                                        {formatPrice(order.total)}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="font-bold mb-3">Productos:</h4>
                                <div className="space-y-3">
                                    {order.carrito?.items?.map(item => {
                                        const mainImage = item.producto?.imagenes?.find(img => img.es_principal) || item.producto?.imagenes?.[0];
                                        return (
                                            <div key={item.id} className="flex justify-between items-center">
                                                <div className="flex items-center space-x-3">
                                                    {mainImage && (
                                                        <div className="w-16 h-16 flex-shrink-0">
                                                            <img
                                                                src={getImageUrl(mainImage.imagen_nombre)}
                                                                alt={item.producto?.nombre}
                                                                className="w-full h-full object-cover rounded"
                                                            />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium">{item.producto?.nombre}</p>
                                                        <p className="text-sm text-gray-600">
                                                            Talla: {item.producto?.talla} |
                                                            Cantidad: {item.cantidad}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold">
                                                        {formatPrice(item.precio_unitario * item.cantidad)}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {formatPrice(item.precio_unitario)} c/u
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <h5 className="font-bold text-gray-700 mb-1">Dirección de entrega</h5>
                                        <p className="text-gray-600">{order.direccion_entrega}</p>
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-700 mb-1">Método de pago</h5>
                                        <p className="text-gray-600 capitalize">
                                            {order.metodo_pago ? order.metodo_pago.replace('_', ' ') : 'No definido'}
                                        </p>
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-700 mb-1">Fecha estimada de entrega</h5>
                                        <p className="text-gray-600">
                                            {order.fecha_entrega_estimada
                                                ? new Date(order.fecha_entrega_estimada).toLocaleDateString('es-ES')
                                                : 'Por confirmar'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 🔴 MOTIVO DE CANCELACIÓN */}
                            {order.estado === 'cancelado' && order.motivo_cancelacion && (
                                <div className="border-t border-red-200 pt-4 mt-4 bg-red-50 rounded">
                                    <h5 className="font-bold text-red-700 mb-1">
                                        Motivo de cancelación
                                    </h5>
                                    <p className="text-red-600">
                                        {order.motivo_cancelacion}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;