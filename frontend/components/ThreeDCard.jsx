import { Link } from "react-router-dom";

export default function ThreeDCard({ getStartedPath, title, info }) {
  return (
    <div className="hover-3d my-12 mx-2 cursor-pointer">
      <div className="card w-96 h-128 bg-white rounded-2xl shadow-inner">
        <div className="card-body">
          <div className="flex justify-between mb-10">
            <div className="text-3xl font-bold ">{title}</div>
          </div>
          <div className="text-lg mb-4 opacity-40">{info}</div>
          <Link
            to={getStartedPath()}
            className="btn btn-primary text-white mt-auto"
          >
            Get Started
          </Link>
        </div>
      </div>

    </div>
  );
}
