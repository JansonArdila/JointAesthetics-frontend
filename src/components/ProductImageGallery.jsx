import React, { useState } from 'react';
import { getImageUrl } from '../services/api';

const ProductImageGallery = ({ images, productId, onImageDelete, onSetMain, onReorder, editable = false }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [draggingIndex, setDraggingIndex] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-64 md:h-96 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-gray-500">No hay imágenes disponibles</p>
                </div>
            </div>
        );
    }

    const currentImage = images[currentIndex];
    const imageUrl = currentImage.imagen_url;

    const handlePrev = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const handleDragStart = (e, index) => {
        if (!editable) return;
        setDraggingIndex(index);
        setIsDragging(true);
        e.dataTransfer.setData('text/plain', index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (!editable || draggingIndex === null) return;

        if (draggingIndex !== index) {
            const newImages = [...images];
            const [draggedItem] = newImages.splice(draggingIndex, 1);
            newImages.splice(index, 0, draggedItem);

            // Actualizar orden en las imágenes
            newImages.forEach((img, idx) => {
                img.orden = idx;
            });

            if (onReorder) {
                onReorder(newImages);
            }
            setDraggingIndex(index);
        }
    };

    const handleDragEnd = () => {
        setDraggingIndex(null);
        setIsDragging(false);
    };

    return (
        <div className="space-y-4">
            {/* Imagen principal con navegación */}
            <div className="relative">
                <div className="bg-gray-100 border rounded-lg p-4 flex items-center justify-center">
                    <img
                        src={imageUrl}
                        alt={`Imagen ${currentIndex + 1} de ${images.length}`}
                        className="max-w-full max-h-96 object-contain rounded-lg bg-white cursor-pointer"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Yzk5OWEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+SW1hZ2VuIG5vIGRpc3BvbmlibGU8L3RleHQ+PC9zdmc+';
                        }}
                    />
                </div>

                {/* Controles de navegación */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all"
                            aria-label="Imagen anterior"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all"
                            aria-label="Siguiente imagen"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}

                {/* Indicador de imagen actual */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all ${index === currentIndex
                                ? 'bg-white scale-125'
                                : 'bg-white/50 hover:bg-white/80'
                                }`}
                            aria-label={`Ir a imagen ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Badge de imagen principal */}
                {currentImage.es_principal && (
                    <div className="absolute top-4 left-4 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                        Principal
                    </div>
                )}
            </div>

            {/* Miniaturas */}
            {images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto py-2">
                    {images.map((image, index) => (
                        <div
                            key={image.id}
                            className={`flex-shrink-0 relative group ${isDragging && draggingIndex === index ? 'opacity-50' : ''
                                }`}
                            draggable={editable}
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                        >
                            <button
                                onClick={() => setCurrentIndex(index)}
                                className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex
                                    ? 'border-blue-500 ring-2 ring-blue-200'
                                    : 'border-gray-300 hover:border-blue-300'
                                    }`}
                            >
                                <img
                                    src={image.imagen_url}
                                    alt={`Miniatura ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>

                            {editable && (
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1">
                                    {!image.es_principal && (
                                        <button
                                            onClick={() => onSetMain && onSetMain(image.id)}
                                            className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                                            title="Marcar como principal"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onImageDelete && onImageDelete(image.id)}
                                        className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                                        title="Eliminar imagen"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            {image.es_principal && (
                                <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                                    ★
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Información de la galería */}
            <div className="text-sm text-gray-600">
                <p>
                    Imagen {currentIndex + 1} de {images.length}
                    {currentImage.es_principal && ' • Imagen principal'}
                </p>
                {editable && (
                    <p className="mt-1 text-xs text-gray-500">
                        Arrastra las miniaturas para reordenar • Haz clic en los íconos para gestionar
                    </p>
                )}
            </div>
        </div>
    );
};

export default ProductImageGallery;