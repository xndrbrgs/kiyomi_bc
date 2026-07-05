const Navbar = () => {
  return (
    <nav className="w-full border-b shadow-lg bg-white">
      <div className="px-[clamp(16px,24px)] flex md:flex-row flex-col justify-between items-center">
        <h1 className="text-[clamp(24px,36px)] font-bold uppercase">
        The Kool Kids Book Club
        </h1>
        <span className="text-gray-600">Share your reading notes!</span>
      </div>
    </nav>
  );
};

export default Navbar;
