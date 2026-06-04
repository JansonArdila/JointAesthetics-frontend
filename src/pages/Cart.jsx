import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService, orderService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../utils/formatters';
import { getImageUrl } from '../utils/getImageUrl';


const Cart = () => {
    const [cart, setCart] = useState({ items: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState(null);
    const [direccionEntrega, setDireccionEntrega] = useState('');
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [comprobante, setComprobante] = useState(null);
    const [previewComprobante, setPreviewComprobante] = useState(null);
    const [showClearCartModal, setShowClearCartModal] = useState(false);
    const [clearingCart, setClearingCart] = useState(false);


    const { user, updateCart } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const data = await cartService.getCart();
            //console.log('Cart data:', data);
            setCart(data);
        } catch (err) {
            showMessageModal({ type: 'error', tittle: 'Error', message: 'Error al cargar el carrito: ' + err.message });
        } finally {
            setLoading(false);
        }
    };

    const showMessageModal = ({ type = 'info', title = '', message = '', onConfirm = null }) => {
        setModalMessage({ type, title, message, onConfirm });
    };

    const handleUpdateQuantity = async (itemId, cantidad) => {
        try {
            await cartService.updateCartItem(itemId, cantidad);
            // Actualizamos solo la cantidad localmente
            setCart((prevCart) => ({
                ...prevCart,
                items: prevCart.items.map(item =>
                    item.id === itemId ? { ...item, cantidad } : item
                )
            }));
            updateCart({
                ...cart,
                items: cart.items.map(item =>
                    item.id === itemId ? { ...item, cantidad } : item
                )
            });
        } catch (err) {
            if (err.message.includes('status: 400')) {
                showMessageModal({ type: 'error', title: 'Sin Stock', message: 'No hay más stock de este producto' });
            } else {
                showMessageModal({ type: 'error', title: 'Error', message: 'Error al actualizar cantidad: ' + err.message });
            }
        }
    };

    const handleRemoveItem = async (itemId) => {
        showMessageModal({
            type: 'confirm',
            title: '¿Eliminar este producto del carrito?',
            message: 'Esta acción eliminará el producto de tu carrito.',
            onConfirm: async () => {
                try {
                    await cartService.removeCartItem(itemId);
                    const updatedCart = await cartService.getCart();
                    setCart(updatedCart ?? { items: [] });
                    updateCart(updatedCart ?? { items: [] });
                } catch (err) {
                    showMessageModal({ type: 'error', title: 'Error', message: 'Error al eliminar producto: ' + err.message });
                }
            }
        });
    };

    // 👉 NUEVO: confirma el vaciado
    const handleClearCart = () => {
        showMessageModal({
            type: 'confirm',
            title: '¿Vaciar carrito?',
            message: 'Esta acción eliminará todos los productos de tu carrito.',
            onConfirm: async () => {
                try {
                    setClearingCart(true);
                    await cartService.clearCart();
                    const updatedCart = await cartService.getCart();
                    setCart(updatedCart ?? { items: [] });
                    updateCart(updatedCart ?? { items: [] });
                } catch (err) {
                    showMessageModal({ type: 'error', title: 'Error', message: 'Error al vaciar carrito: ' + err.message });
                } finally {
                    setClearingCart(false);
                }
            }
        });
    };



    const handleCheckout = async () => {
        if (!direccionEntrega.trim()) {
            showMessageModal({ type: 'error', title: 'Error', message: 'Por favor ingresa la dirección de entrega' });
            return;
        }

        if (!comprobante) {
            showMessageModal({ type: 'error', title: 'Error', message: 'Debes subir el comprobante de pago' });
            return;
        }

        const formData = new FormData();
        formData.append('direccion_entrega', direccionEntrega);
        formData.append('comprobante', comprobante);

        try {
            await orderService.createOrder(formData);
            setCart(null);
            // Actualizar contador en contexto
            updateCart(null);
            showMessageModal({
                type: 'info',
                title: '¡Pedido Confirmado!',
                message: 'Tu pedido ha sido procesado exitosamente y el stock ha sido actualizado.',
                onConfirm: () => navigate('/orders')
            });
        } catch (err) {
            showMessageModal({ type: 'error', title: 'Error', message: 'Error al crear pedido: ' + err.message });
        }
    };


    const handleComprobante = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        // Validación básica
        if (!file.type.startsWith('image/')) {
            showMessageModal({ type: 'error', title: 'Error', message: 'Solo se permiten imágenes' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showMessageModal({ type: 'error', title: 'Error', message: 'La imagen no puede superar 5MB' });
            return;
        }

        setComprobante(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewComprobante(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveComprobante = () => {
        setComprobante(null);
        setPreviewComprobante(null);
    };


    if (loading) return <div className="spinner"></div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Carrito de Compras</h1>

            {!cart?.items?.length ? (
                <div className="text-center py-12">
                    <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Tu carrito está vacío</h3>
                    <p className="text-gray-500 mb-6">Agrega algunos productos para comenzar</p>
                    <button onClick={() => navigate('/')} className="btn-primary">Ver Productos</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="card">
                            <div className="space-y-4">
                                {cart.items.map((item) => (
                                    <div key={`${item.producto.id}-${item.id}`} className="flex items-center border-b pb-4">
                                        <div className="w-24 h-24 flex-shrink-0">
                                            <img
                                                src={item.producto.imagenes?.[0]?.imagen_nombre
                                                    ? getImageUrl(item.producto.imagenes[0].imagen_nombre)
                                                    : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Yzk5OWEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+SW1hZ2VuIG5vIGRpc3BvbmlibGU8L3RleHQ+PC9zdmc+'}
                                                alt={item.producto.nombre}
                                                className="w-full h-full object-cover rounded"
                                            />
                                        </div>

                                        <div className="ml-4 flex-1">
                                            <h3 className="font-bold">{item.producto.nombre}</h3>
                                            <p className="text-gray-600 capitalize">{item.producto.categoria}</p>
                                            <p className="text-lg font-bold text-primary-600">
                                                {formatPrice(item.precio_unitario)}
                                            </p>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.cantidad - 1))}
                                                    className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100"
                                                    disabled={item.cantidad <= 1}
                                                >-</button>
                                                <span className="w-8 text-center">{item.cantidad}</span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, item.cantidad + 1)}
                                                    className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100"
                                                >+</button>
                                            </div>

                                            <div className="text-right min-w-[100px]">
                                                <p className="font-bold">
                                                    {formatPrice(item.precio_unitario * item.cantidad)}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 flex justify-between">
                                <button onClick={handleClearCart} className="btn-outline">
                                    Vaciar Carrito
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="card">
                            <h3 className="text-xl font-bold mb-4">Resumen del Pedido</h3>
                            <h2 className="text-l font-bold mb-4">* Para realizar tu pedido debes agregar tus productos al carrito y realizar el pago parcial del 50% de tu compra al nequi 3185651450 (JAN ARD)</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span>Pago parcial (50% NEQUI)</span>
                                    <span>
                                        {formatPrice(cart.items.reduce((sum, item) =>
                                            sum + (parseFloat(item.precio_unitario) * parseInt(item.cantidad) / 2), 0
                                        ))}
                                    </span>
                                </div>

                                <div className="flex justify-between border-t pt-3">
                                    <span className="font-bold">Total</span>
                                    <span className="text-2xl font-bold text-primary-600">
                                        {formatPrice(cart.items.reduce((sum, item) =>
                                            sum + (parseFloat(item.precio_unitario) * parseInt(item.cantidad)), 0
                                        ))}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Dirección de Entrega</label>
                                <textarea
                                    value={direccionEntrega}
                                    onChange={(e) => setDireccionEntrega(e.target.value)}
                                    className="input-field h-32"
                                    placeholder="Ingresa la dirección donde deseas recibir tu pedido"
                                    required
                                />
                            </div>

                            <button onClick={handleCheckout} className="btn-primary w-full py-3">
                                Confirmar Pedido
                            </button>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Comprobante de pago Nequi (50%)</label>

                                <label className="cursor-pointer">
                                    <div className="input-field flex items-center justify-center gap-2 py-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        Subir comprobante
                                        <input type="file" accept="image/*" onChange={handleComprobante} className="hidden" />
                                    </div>
                                </label>

                                <p className="mt-1 text-xs text-gray-500">
                                    Suba el pantallazo del pago del 50% (SUBTOTAL) por Nequi
                                </p>

                                {previewComprobante && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Comprobante cargado</h4>

                                        <div className="relative inline-block group">
                                            <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-300">
                                                <img src={previewComprobante} alt="Comprobante de pago" className="w-full h-full object-cover" />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleRemoveComprobante}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Eliminar comprobante"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-gray-500 mt-4">* El pago del otro 50% se realizará contra entrega en la puerta de tu casa</p>
                            <p className="text-sm text-gray-500 mt-4">* RECUERDA QUE EL PEDIDO SERÁ APROBADO DESPUÉS DE QUE SUBAS EL COMPROBANTE DE NEQUI Y CONFIRMES TU COMPRA.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal centralizado */}
            {modalMessage && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4
                                ${modalMessage.type === 'error' ? 'bg-red-100' : modalMessage.type === 'confirm' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
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
                                        <button onClick={() => setModalMessage(null)} className="btn-outline flex-1">
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={() => {
                                                modalMessage.onConfirm?.();
                                                setModalMessage(null);
                                            }}
                                            className="btn-primary flex-1"
                                        >
                                            {clearingCart ? 'Procesando...' : 'Confirmar'}
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => {
                                        modalMessage.onConfirm?.();
                                        setModalMessage(null);
                                    }} className="btn-primary w-full">
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

export default Cart;