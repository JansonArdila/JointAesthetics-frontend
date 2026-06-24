import React, { useState } from 'react';
import ProductImageGallery from './ProductImageGallery';
import { formatPrice, formatQuantity } from '../utils/formatters';
import { getImageUrl } from '../utils/getImageUrl';


const ProductCard = ({ product, onEdit, onDelete, onImageDelete, onSetMain }) => {
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const getCategoryBadge = (category) => {
        const badges = {
            sudadera: { label: 'Sudadera', class: 'badge-primary' },
            buzo: { label: 'Buzo', class: 'badge-secondary' },
            camisilla: { label: 'Camisilla', class: 'badge-warning' },
            pantaloneta: { label: 'Pantaloneta', class: 'badge-primary' },
            camisa: { label: 'Camisa', class: 'badge-secondary' },
            top: { label: 'Top', class: 'badge-warning' },
        };

        const badge = badges[category] || { label: category, class: 'badge-primary' };
        return <span className={`badge ${badge.class}`}>{badge.label}</span>;
    };

    const getStockStatus = (quantity) => {
        if (quantity > 20) return { text: 'Alto', color: 'text-green-600', bg: 'bg-green-50' };
        if (quantity > 10) return { text: 'Medio', color: 'text-yellow-600', bg: 'bg-yellow-50' };
        return { text: 'Bajo', color: 'text-red-600', bg: 'bg-red-50' };
    };

    const stockStatus = getStockStatus(product.cantidad);

    // Calcular valores formateados
    const precioFormateado = formatPrice(product.precio);
    const cantidadFormateada = formatQuantity(product.cantidad);
    const valorTotal = parseFloat(product.precio) * parseInt(product.cantidad);
    const valorTotalFormateado = formatPrice(valorTotal);

    // Encontrar imagen principal o la primera
    const mainImage = product.imagenes?.find(img => img.es_principal) || product.imagenes?.[0];

    return (
        <>
            <div className="card animate-fade-in hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sección de imagen */}
                    <div className="lg:w-1/3">
                        <div className="relative">
                            {mainImage ? (
                                <button
                                    onClick={() => setShowImageModal(true)}
                                    className="w-full h-64 lg:h-full rounded border border-gray-300 bg-gray-100 overflow-hidden"
                                >
                                    <div className="w-full h-full rounded border border-gray-300 bg-gray-100 overflow-hidden">
                                        <img
                                            src={mainImage.imagen_nombre}
                                            alt={product.nombre}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                </button>
                            ) : (
                                <div className="w-full h-64 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                                    <svg className="w-16 h-16 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm text-gray-500">Sin imágenes</span>
                                </div>
                            )}

                            {/* Contador de imágenes */}
                            {product.imagenes && product.imagenes.length > 1 && (
                                <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    +{product.imagenes.length - 1}
                                </div>
                            )}

                            {/* Badge de categoría */}
                            <div className="absolute top-3 left-3">
                                {getCategoryBadge(product.categoria)}
                            </div>
                        </div>

                        {/* Miniaturas adicionales (máximo 3) */}
                        {product.imagenes && product.imagenes.length > 1 && (
                            <div className="flex space-x-2 mt-3 overflow-x-auto">
                                {product.imagenes.slice(0, 4).map((image, index) => (
                                    <button
                                        key={image.id}
                                        onClick={() => {
                                            setSelectedImageIndex(index);
                                            setShowImageModal(true);
                                        }}
                                        className="flex-shrink-0 w-16 h-16 rounded border border-gray-300 overflow-hidden"
                                    >
                                        <img
                                            src={image.imagen_nombre}
                                            alt={`Miniatura ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                                {product.imagenes.length > 4 && (
                                    <div className="flex-shrink-0 w-16 h-16 rounded border border-gray-300 bg-gray-100 flex items-center justify-center text-gray-500">
                                        +{product.imagenes.length - 4}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Información del producto */}
                    <div className="lg:w-2/3">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.nombre}</h3>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="badge bg-gray-100 text-gray-800">
                                        Talla: {product.talla}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-4 h-4 rounded-full border border-gray-300"
                                            style={{ backgroundColor: product.color.toLowerCase() }}
                                            title={product.color}
                                        />
                                        <span className="text-sm text-gray-600">{product.color}</span>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full ${stockStatus.bg}`}>
                                        <span className={`text-sm font-semibold ${stockStatus.color}`}>
                                            {stockStatus.text}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-3xl font-bold text-primary-600">
                                    {precioFormateado}
                                </div>
                                <div className="text-lg">
                                    <span className="text-gray-600">Stock: </span>
                                    <span className={`font-bold ${product.cantidad > 10 ? 'text-green-600' : 'text-red-600'}`}>
                                        {cantidadFormateada} unidades
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Valor total en inventario</h4>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {valorTotalFormateado}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Imágenes</h4>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {product.imagenes?.length || 0} imágenes
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button
                                        onClick={() => onEdit(product)}
                                        className="btn-outline flex-1 flex items-center justify-center gap-2 py-3"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Editar Producto
                                    </button>
                                    <button
                                        onClick={() => onDelete(product.id)}
                                        className="btn-danger flex-1 flex items-center justify-center gap-2 py-3"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Eliminar Producto
                                    </button>
                                </div>

                                {product.imagenes && product.imagenes.length > 0 && (
                                    <button
                                        onClick={() => setShowImageModal(true)}
                                        className="w-full mt-3 btn-outline flex items-center justify-center gap-2 py-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Ver todas las imágenes ({product.imagenes.length})
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para ver todas las imágenes */}
            {showImageModal && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">
                                Galería de imágenes: {product.nombre}
                            </h3>
                            <button
                                onClick={() => setShowImageModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                            <ProductImageGallery
                                images={product.imagenes}
                                productId={product.id}
                                onImageDelete={onImageDelete}
                                onSetMain={onSetMain}
                                editable={true}
                            />
                        </div>

                        <div className="p-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowImageModal(false)}
                                className="btn-primary w-full"
                            >
                                Cerrar galería
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductCard;