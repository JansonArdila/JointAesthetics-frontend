// src/components/ImageModal.jsx
import React from "react";
import { getImageUrl } from "../utils/getImageUrl";

const ImageModal = ({ images, selectedIndex, onClose, onSelectImage }) => {
    if (!images || selectedIndex === null) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 max-w-3xl w-full relative">

                {/* Cerrar */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 bg-white text-gray-800 hover:bg-gray-200 text-xl p-2 rounded-full shadow-md"
                >
                    X
                </button>

                {/* Imagen grande */}
                <img
                    src={getImageUrl(images[selectedIndex].imagen_nombre)}
                    alt="Vista ampliada"
                    className="w-full max-h-[70vh] object-contain rounded-lg"
                />


                {/* Miniaturas */}
                <div className="flex gap-2 mt-4 overflow-x-auto">
                    {images.map((img, index) => (
                        <img
                            key={img.id}
                            src={getImageUrl(img.imagen_nombre)}
                            onClick={() => onSelectImage(index)}
                            className={`w-20 h-20 rounded cursor-pointer border ${index === selectedIndex
                                ? "border-blue-500"
                                : "border-gray-300"
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ImageModal;

