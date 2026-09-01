import React from 'react'

const HeaderCell = ({ children, className = "" }) => (
    <div className={`text-[8px] font-semibold uppercase tracking-wide text-slate-400 ${className}`}>
        {children}
    </div>
);

function OrderItemsHeader({ className = 'grid grid-cols-[28px_minmax(130px,1.7fr)_minmax(96px,1.05fr)_58px_64px_82px_58px_96px_34px]', currencySymbol = "₹" }) {
    return (
        <div className={`sticky top-0 z-10 items-center gap-2 border-b border-slate-100 bg-gray-100 text-white px-2.5 py-2 ${className}`}>
            <HeaderCell>#</HeaderCell>
            <HeaderCell>Product / Model *</HeaderCell>
            <HeaderCell>Series</HeaderCell>
            <HeaderCell>Weight</HeaderCell>
            <HeaderCell>Qty *</HeaderCell>
            <HeaderCell>Rate ({currencySymbol}) *</HeaderCell>
            <HeaderCell>GST</HeaderCell>
            <HeaderCell>Line Value ({currencySymbol})</HeaderCell>
            <HeaderCell className="text-center">Action</HeaderCell>
        </div>
    )
}

export default OrderItemsHeader
