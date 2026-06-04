import React from 'react';
import { getImageUrl } from '../utils/getImageUrl';

const categories = [
    { key: 'sudadera', label: 'Sudadera', image: 'LogoJA.png' },
    { key: 'buzo', label: 'Buzo', image: 'BuzoFrontalBlanco.png' },
    { key: 'camisilla', label: 'Camisilla', image: 'CamisaNuevaNegraFrontal.png' },
    { key: 'camisa', label: 'Camisa', image: 'CamisaFrontalBlanco.png' },
    { key: 'pantaloneta', label: 'Pantaloneta', image: 'LogoJA.png' },
    { key: 'top', label: 'Top', image: 'LogoJA.png' },
];

const CategorySlider = ({ onSelectCategory }) => {
    return (
        <div className="overflow-x-auto py-6 flex justify-center">
            <div className="flex gap-6 px-4 min-w-max">
                {categories.map(cat => (
                    <div
                        key={cat.key}
                        onClick={() => {
                            onSelectCategory(cat.key);
                            document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
                        }}

                        className="
              cursor-pointer
              transition-all
              duration-300
              transform
              hover:scale-105
              hover:shadow-xl
              rounded-xl
              bg-transparent
            "
                    >
                        <div className="w-48 h-64 relative rounded-xl overflow-hidden">
                            <img
                                src={`/${cat.image}`}
                                alt={cat.label}
                                className="w-full h-full object-cover"
                            />


                            {/* Overlay suave al hover */}
                            <div className="
                absolute inset-0
                bg-black/0
                hover:bg-black/30
                transition-all
                flex items-center justify-center
              ">
                                <span className="text-white text-xl font-semibold opacity-0 hover:opacity-100 transition">
                                    {cat.label}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategorySlider;
