export default function Card({
  obj = null,
  img = null,
  title,
  info = null,
  actions = null,
}) {
  // Empty/placeholder card
  if (!obj) {
    return (
      <div className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden w-full">
        <figure className="w-full h-full bg-base-200 flex items-center justify-center">
          <span className="text-6xl text-base-content/40">+</span>
        </figure>

        <div className="card-body p-4 gap-2">{title}</div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden w-full">
      {img && (
        <figure>
          <img
            src={img.src}
            alt={img.alt}
            className="w-full h-48 object-cover"
          />
        </figure>
      )}

      <div className="card-body p-4 gap-2">
        {title}

        {info?.map((line, i) => (
          <p key={i} className="text-sm text-base-content/60 line-clamp-3">
            {line}
          </p>
        ))}

        {actions && (
          <div className="card-actions justify-end mt-auto gap-2">
            {Object.entries(actions).map(
              ([label, { fn, className = "btn-ghost" }]) => (
                <button
                  key={label}
                  onClick={() => fn(obj)}
                  className={`btn btn-sm ${className}`}
                >
                  {label}
                </button>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
