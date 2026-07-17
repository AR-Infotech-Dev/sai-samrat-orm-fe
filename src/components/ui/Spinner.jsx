const Spinner = ({ size = 'sm' }) => (
  <span
    className={`spinner spinner-${size}`}
    aria-hidden="true"
  />
);

export default Spinner;
