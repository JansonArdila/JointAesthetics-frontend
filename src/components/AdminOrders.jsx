import React, { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import { formatPrice } from '../utils/formatters';
import { getImageUrl } from '../utils/getImageUrl';

const statusColors = {
    pendiente: 'bg-gray-300 text-gray-800',
    confirmado: 'bg-blue-500 text-white',
    en_camino: 'bg-yellow-400 text-black',
    entregado: 'bg-green-500 text-white',
    cancelado: 'bg-red-500 text-white'
};

// Formatea una fecha a formato dd/mm/yyyy
const formatDate = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Mes empieza en 0
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;

};



const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalImage, setModalImage] = useState(null);
    const [cancelReason, setCancelReason] = useState({});
    const [shippingModalOpen, setShippingModalOpen] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [modalMessage, setModalMessage] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);


    const showMessageModal = ({
        type = 'info',
        title = '',
        message = '',
        onConfirm = null
    }) => {
        setModalMessage({ type, title, message, onConfirm });
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await orderService.getAllOrders();
            setOrders(data);
        } catch (error) {
            console.error('Error al obtener pedidos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, estado, extraData = {}) => {
        try {
            const motivo = cancelReason[orderId]?.trim();

            // Validar motivo si el estado es cancelado
            if (estado === 'cancelado' && !motivo) {
                showMessageModal({
                    type: 'error',
                    title: 'Motivo requerido',
                    message: 'Debes escribir un motivo de cancelación.'
                });
                return;
            }

            await orderService.updateOrderStatus(orderId, {
                estado,
                motivo_cancelacion: motivo || undefined,
                ...extraData
            });

            fetchOrders();
        } catch (error) {
            console.error('Error actualizando estado: ', error);
        }
    };

    // Abrir modal para número de guía
    const handleOpenShippingModal = (orderId) => {
        setCurrentOrderId(orderId);
        setShippingModalOpen(true);
    };

    // Confirmar envío y enviar número de guía
    const handleConfirmShipping = async () => {
        if (!trackingNumber) {
            showMessageModal({
                type: 'error',
                title: 'Número de guía requerido',
                message: 'Debes ingresar un número de guía para continuar'
            });
            return;
        }

        await handleUpdateStatus(currentOrderId, 'en_camino', { numero_guia: trackingNumber });
        setShippingModalOpen(false);
        setTrackingNumber('');
        setCurrentOrderId(null);
    };


    return (
        <div className="p-4 w-full">
            <h2 className="text-2xl font-bold mb-4">Pedidos</h2>

            {loading ? (
                <div>Cargando...</div>
            ) : (
                <div className="w-full overflow-x-auto">
                    <table className="w-full table-auto border-collapse border">
                        <thead>
                            <tr className="bg-gray-100 text-sm">
                                <th className="p-2 border">ID</th>
                                <th className="p-2 border">Usuario</th>
                                <th className="p-2 border">Productos</th>
                                <th className="p-2 border">Dirección</th>
                                <th className="p-2 border">Total</th>
                                <th className="p-2 border">Estado</th>
                                <th className="p-2 border">Fecha</th>
                                <th className="p-2 border">Comprobante</th>
                                <th className="p-2 border">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id} className="border-b">
                                    <td className="p-2 border">{order.id}</td>
                                    <td className="p-2 border">{order.usuario_id}</td>
                                    <td className="p-2 border">
                                        <div className="space-y-2 maw-w-xs">
                                            {order.carrito?.items?.map((item) => {
                                                const mainImage =
                                                    item.producto?.imagenes?.find(img => img.es_principal) ||
                                                    item.producto?.imagenes?.[0];

                                                return (
                                                    <div key={item.id} className="flex grap-2 items-center">
                                                        {mainImage && (
                                                            <img
                                                                src={getImageUrl(mainImage.imagen_nombre)}
                                                                alt={item.producto?.nombre}
                                                                className="w-10 h-10 object-cover rounded"
                                                            />
                                                        )}
                                                        <div className="text-xs">
                                                            <p className="font-semibold">
                                                                {item.producto?.nombre}
                                                            </p>
                                                            <p className="text-gray-600">
                                                                Talla: {item.producto?.talla} · Cant: {item.cantidad}
                                                            </p>
                                                            <p className="text-gray-500">
                                                                {formatPrice(item.precio_unitario)} c/u
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </td>
                                    <td className="p-2 border text-sm text-gray-700 max-w-xs">
                                        {order.direccion_entrega || 'No especificada'}
                                    </td>
                                    <td className="p-2 border">${order.total}</td>
                                    <td className="p-2 border">
                                        <span className={`px-2 py-1 rounded ${statusColors[order.estado]}`}>
                                            {order.estado}
                                        </span>
                                    </td>
                                    <td className="p-2 border">{formatDate(order.fecha_pedido)}</td>
                                    <td className="p-2 border">
                                        {order.comprobante_pago && (
                                            <img
                                                src={getImageUrl(order.comprobante_pago)}
                                                alt="Comprobante"
                                                className="w-16 h-16 object-cover cursor-pointer"
                                                onClick={() => setModalImage(getImageUrl(order.comprobante_pago))}
                                            />
                                        )}
                                    </td>
                                    <td className="p-2 border space-x-2">
                                        {order.estado !== 'cancelado' ? (
                                            <>
                                                {/* ESTADO PENDIENTE - Solo Confirmar y Cancelar */}
                                                {order.estado === 'pendiente' ? (
                                                    <div className="flex flex-col gap-2">
                                                        <button
                                                            className="bg-blue-500 text-white px-2 py-1 rounded"
                                                            onClick={() => orderService.validatePayment(order.id).then(fetchOrders)}
                                                        >
                                                            Confirmar
                                                        </button>
                                                        <div className="flex gap-1">
                                                            <input
                                                                type="text"
                                                                placeholder="Motivo cancelación"
                                                                value={cancelReason[order.id] || ''}
                                                                onChange={(e) =>
                                                                    setCancelReason({ ...cancelReason, [order.id]: e.target.value })
                                                                }
                                                                className="border px-1 py-0.5 rounded flex-1"
                                                            />
                                                            <button
                                                                className="bg-red-500 text-white px-2 py-1 rounded"
                                                                onClick={() => {
                                                                    const motivo = cancelReason[order.id]?.trim();

                                                                    if (!motivo) {
                                                                        showMessageModal({
                                                                            type: 'error',
                                                                            title: 'Motivo obligatorio',
                                                                            message: 'Debes escribir un motivo de cancelación antes de continuar.'
                                                                        });
                                                                        return;
                                                                    }

                                                                    showMessageModal({
                                                                        type: 'confirm',
                                                                        title: 'Cancelar pedido',
                                                                        message: '¿Estás seguro de cancelar este pedido? Esta acción no se puede deshacer.',
                                                                        onConfirm: () => handleUpdateStatus(order.id, 'cancelado')
                                                                    });
                                                                }}
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* ESTADO CONFIRMADO o EN_CAMINO - En camino, Entregado y Cancelar */
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex gap-1">
                                                            <button
                                                                className="bg-green-500 text-white px-2 py-1 rounded flex-1"
                                                                onClick={() => handleOpenShippingModal(order.id)}
                                                            >
                                                                En camino
                                                            </button>
                                                            <button
                                                                className="bg-indigo-500 text-white px-2 py-1 rounded flex-1"
                                                                onClick={() => handleUpdateStatus(order.id, 'entregado')}
                                                            >
                                                                Entregado
                                                            </button>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <input
                                                                type="text"
                                                                placeholder="Motivo cancelación"
                                                                value={cancelReason[order.id] || ''}
                                                                onChange={(e) =>
                                                                    setCancelReason({ ...cancelReason, [order.id]: e.target.value })
                                                                }
                                                                className="border px-1 py-0.5 rounded flex-1"
                                                            />
                                                            <button
                                                                className="bg-red-500 text-white px-2 py-1 rounded"
                                                                onClick={() => {
                                                                    const motivo = cancelReason[order.id]?.trim();

                                                                    if (!motivo) {
                                                                        showMessageModal({
                                                                            type: 'error',
                                                                            title: 'Motivo obligatorio',
                                                                            message: 'Debes escribir un motivo de cancelación antes de continuar.'
                                                                        });
                                                                        return;
                                                                    }

                                                                    showMessageModal({
                                                                        type: 'confirm',
                                                                        title: 'Cancelar pedido',
                                                                        message: '¿Estás seguro de cancelar este pedido? Esta acción no se puede deshacer.',
                                                                        onConfirm: () => handleUpdateStatus(order.id, 'cancelado')
                                                                    });
                                                                }}
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            /* ESTADO CANCELADO - Solo mensaje */
                                            <span className="text-gray-400">Acciones deshabilitadas</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal para imagen */}
            {modalImage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-4 rounded relative max-w-xl">
                        <button
                            className="absolute top-2 right-2 text-red-500 font-bold"
                            onClick={() => setModalImage(null)}
                        >
                            X
                        </button>
                        <img src={modalImage} alt="Comprobante grande" className="max-h-[80vh] object-contain" />
                    </div>
                </div>
            )}

            {/* Modal para número de guía */}
            {shippingModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-4 rounded relative max-w-md">
                        <h3 className="text-lg font-bold mb-2">Ingresar número de guía</h3>
                        <input
                            type="text"
                            placeholder="Número de guía"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            className="border w-full px-2 py-1 rounded mb-4"
                        />
                        <div className="flex justify-end space-x-2">
                            <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handleConfirmShipping}>
                                Guardar
                            </button>
                            <button className="bg-gray-300 px-3 py-1 rounded" onClick={() => setShippingModalOpen(false)}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalMessage && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4
                    ${modalMessage.type === 'error'
                                    ? 'bg-red-100'
                                    : modalMessage.type === 'confirm'
                                        ? 'bg-yellow-100'
                                        : 'bg-blue-100'}`}
                            >
                                {modalMessage.type === 'error' && (
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                                {modalMessage.type === 'info' && (
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                                    </svg>
                                )}
                                {modalMessage.type === 'confirm' && (
                                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m9-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </div>

                            <h3 className="text-2xl font-bold mb-2">{modalMessage.title}</h3>
                            <p className="text-gray-600 mb-6">{modalMessage.message}</p>

                            <div className="flex space-x-3">
                                {modalMessage.type === 'confirm' ? (
                                    <>
                                        <button
                                            onClick={() => setModalMessage(null)}
                                            className="btn-outline flex-1"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={() => {
                                                modalMessage.onConfirm?.();
                                                setModalMessage(null);
                                            }}
                                            className="btn-primary flex-1"
                                        >
                                            Confirmar
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setModalMessage(null)}
                                        className="btn-primary w-full"
                                    >
                                        Entendido
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;


