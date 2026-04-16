import heroBg from "../src/assets/images/background.jpg";
import heroImage from "../src/assets/images/hero_image.png";
import sectionImage from "../src/assets/images/section_img.png";
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
    <div>
      {/* Hero Section */}
      <section
        className="hero min-h-screen  bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="h-screen flex items-center justify-center">
          <div className="hero-content flex-col lg:flex-row gap-10">
            <img src={heroImage} className="xs: max-w-xs md:max-w-xl" />
            <div className="max-w-md">
              <h1 className="text-5xl font-bold">Bring stories to life,</h1>
              <h1 className="text-5xl font-bold">together.</h1>
              <p className="py-6">
                The ultimate platform where authors create magical interactive
                storybooks, and parents personalize them to make their child the
                hero of every adventure.
              </p>
              <div className="flex gap-4">
                <Link
                  to={getStartedPath()}
                  className="btn btn-primary text-white"
                >
                  Get Started
                </Link>
                <Link to="/about" className="btn btn-secondary text-white">
                  Get to know TaleCraft
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Parallax Section */}
      <section
        className="h-screen min-h-screen bg-no-repeat bg-cover bg-center"
        style={{
          backgroundImage: `url(${sectionImage})`,
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="h-full flex items-center justify-center bg-black/30">
          <h2 className="text-white text-5xl font-bold">What is TaleCraft?</h2>
        </div>
      </section>

      {/* Footer Section */}
      <section
        className="h-screen flex items-center justify-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <h1 className="text-4xl font-bold">Get started!</h1>
      </section>
    </div>
  );
}
