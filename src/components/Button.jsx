function Button({ children, type = "primary", full = false, ...props }) {
  const base = "inline-block px-4 py-2 rounded font-medium transition text-center";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "border border-blue-600 text-blue-600 hover:bg-blue-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const fullWidth = full ? "w-full" : "";

  return (
    <button className={`${base} ${variants[type]} ${fullWidth}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
