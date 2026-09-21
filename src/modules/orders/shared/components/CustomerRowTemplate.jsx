import React from 'react'
import { FileDigit } from 'lucide-react';
const CustomerRowTemplate = ({ item, isSelected, onClick, style }) => {
    const customer = item.original || {};
    return (
        <div onClick={onClick} className={`cursor-pointer px-4 py-2 hover:bg-gray-100 flex items-start justify-between text-sm ${isSelected ? "bg-blue-50" : ""}`}>
            <div className="relative flex w-full items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="font-medium text-gray-900">
                        {customer.name || "Unnamed Client"}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                        {customer.customer_type && (
                            <span className={`capitalize px-1.5 text-[8px] text-white ${customer.customer_type == 'domestic' ? 'bg-green-500' : customer.customer_type == 'export' ? 'bg-purple-500' : 'bg-amber-500'} rounded-md`}>{customer.customer_type}</span>
                        )}
                    </div>
                </div>

                {isSelected && (
                    <span className="absolute right-0 top-0 shrink-0 text-xs font-medium text-green-600">
                        Selected
                    </span>
                )}
            </div>
        </div>
    );
};

export default CustomerRowTemplate
