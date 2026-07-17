function DefaultLabel({ label, required }) {
    return (
        <label className="text-xs text-gray-500">
            {label}
            {required ? <span className="text-red-500"> *</span> : null}
        </label>
    );
}

export default DefaultLabel;