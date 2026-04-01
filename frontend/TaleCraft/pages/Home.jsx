import heroBg from "../src/assets/images/background.jpg";
import heroImage from "../src/assets/images/hero_image.png";
import { Link } from "react-router-dom";
import { useAuth } from "../src/AuthContext";

export default function Home() {
  const { user } = useAuth();

  const getStartedPath = () => {
    if (!user) return "/login";
    if (user.role === "Author") return "/author";
    if (user.role === "Parent") return "/parent";
    return "/login";
  };

  return (
    <div
      className="hero min-h-screen bg-no-repeat"
      style={{
        backgroundImage: `url(${heroBg})`,
      }}
    >
      <div className="hero-content flex-col lg:flex-row gap-10">
        <img src={heroImage} className="max-w-xl" />
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Bring stories to life,</h1>
          <h1 className="text-5xl font-bold">together.</h1>
          <p className="py-6">
            The ultimate platform where authors create magical interactive
            storybooks, and parents personalize them to make their child the
            hero of every adventure.
          </p>
          <div className="flex gap-4">
            <Link to={getStartedPath()} className="btn btn-primary text-white">
              Get Started
            </Link>
            <Link to="/about" className="btn btn-secondary text-white">
              Get to know TaleCraft
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
