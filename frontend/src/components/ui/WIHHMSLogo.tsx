const WIHHMSLogo: React.FC<{ size?: 'small' | 'large' }> = ({ size = 'small' }) => {
  const dimensions = size === 'large' ? 'w-24 h-24' : 'w-16 h-16'; // Increased size for "large"

  return (
    <div className={`${dimensions} flex items-center justify-center`}>
      <img
        src="/logo.png"
        alt="WIHHMS Logo"
        className="object-contain"
      />
    </div>
  );
};

export default WIHHMSLogo;