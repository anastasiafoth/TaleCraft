export default function Redirection({ message }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="text-success text-5xl">✓</div>
      <h2 className="text-xl font-bold">{message["message"]}</h2>
      <p className="text-sm opacity-70">Redirecting to login page...</p>
      <span className="loading loading-dots loading-5xl"></span>
    </div>
  );
}
