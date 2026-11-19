import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import ValidationError from './ValidationError';
import { getFormInputClass } from './formInput.styles';



const DatePickerInput = React.forwardRef(({ value, onClick },error, ref) => (
  <button
    onClick={onClick}
    ref={ref}
    className={`${getFormInputClass(false, "flex items-center justify-between py-2 text-left")}`}
  >
    <span>{value || 'Select date'}</span>
    <CalendarIcon size={16} className="text-gray-500 ml-2" />
  </button>
));

const CustomDatePicker = ({
  selectedDate,
  onChange,
  placeholder = 'Select date',
  minDate = null,
  maxDate = null,
  disabled = false,
}) => {
  return (
    <div className="w-full">
      <DatePicker
        selected={selectedDate}
        onChange={onChange}
        dateFormat="yyyy-MM-dd"
        placeholderText={placeholder}
        minDate={minDate}
        maxDate={maxDate}
        customInput={<DatePickerInput />}
        disabled={disabled}
        popperPlacement="bottom-start"
        className="w-full py-1.5"
      />
      {error && (
        <ValidationError error={error} />
      )}
    </div>
  );
};

export default CustomDatePicker;
