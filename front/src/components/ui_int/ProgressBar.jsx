function ProgressBar({ value = 0, max = 100, label, className = "" }) {
    const safeMax = max > 0 ? max : 1;
    const safeValue = Math.max(0, Math.min(value, safeMax));
    const percentage = (safeValue / safeMax) * 100;

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <div className="mb-1 text-sm text-white/90">
                    {label}
                </div>
            )}
            <div className="h-3 w-full overflow-hidden rounded-full bg-black/30">
                <div
                    className="h-full rounded-full bg-emerald-400 transition-[width] duration-300 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

export default ProgressBar;