import React from 'react';
import { formatPrice, formatNumber, formatLargeNumber } from '../utils/formatters';

const StatsCard = ({
    title,
    value,
    type = 'number',
    formatOptions = {},
    icon,
    color = 'primary',
    trend,
    subtitle,
    loading = false
}) => {
    const getColorClasses = () => {
        const colors = {
            primary: 'text-primary-600 bg-primary-50',
            secondary: 'text-secondary-600 bg-secondary-50',
            danger: 'text-danger-600 bg-danger-50',
            warning: 'text-warning-600 bg-warning-50',
            success: 'text-green-600 bg-green-50',
            info: 'text-blue-600 bg-blue-50',
        };
        return colors[color] || colors.primary;
    };

    const formatValue = () => {
        if (loading) return '...';

        switch (type) {
            case 'price':
                return formatPrice(value, formatOptions);
            case 'large':
                return formatLargeNumber(value);
            case 'percent':
                return `${formatNumber(value, { decimals: 1 })}%`;
            default:
                return formatNumber(value, { decimals: 0, ...formatOptions });
        }
    };

    const getTrendIcon = () => {
        if (!trend) return null;

        if (trend > 0) {
            return (
                <span className="flex items-center text-green-600 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    {Math.abs(trend)}%
                </span>
            );
        } else if (trend < 0) {
            return (
                <span className="flex items-center text-red-600 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    {Math.abs(trend)}%
                </span>
            );
        }
        return null;
    };

    return (
        <div className="card">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    {subtitle && (
                        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
                {icon && (
                    <div className={`p-2 rounded-lg ${getColorClasses()}`}>
                        {icon}
                    </div>
                )}
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <p className={`text-3xl font-bold ${loading ? 'text-gray-300' : 'text-gray-900'}`}>
                        {formatValue()}
                    </p>
                    {trend !== undefined && (
                        <div className="mt-2">
                            {getTrendIcon()}
                        </div>
                    )}
                </div>

                {loading && (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                )}
            </div>
        </div>
    );
};

export default StatsCard;