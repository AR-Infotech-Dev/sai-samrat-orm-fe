import React from 'react';
import { Check } from 'lucide-react';
import clsx from 'clsx';

const SelectItem = ({ label, value, isSelected, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(value)}
      className={clsx(
        'px-4 py-2 flex items-center justify-between cursor-pointer rounded-md transition-colors',
        isSelected ? 'bg-orange-100 text-orange-700' : 'hover:bg-slate-50 text-gray-800'
      )}
    >
      <span>{label}</span>
      {isSelected && <Check size={16} className="text-orange-500" />}
    </div>
  );
};

export default SelectItem;
