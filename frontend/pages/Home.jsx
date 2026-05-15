import ThreeDCard from "../components/ThreeDCard";
import { Link } from "react-router-dom";
import { useAuth } from "../src/AuthContext";

const heroBg =
  "https://pub-5c6211fe5e5e407fa14819f4ac3be544.r2.dev/main%20page/background.jpg";
const heroImage =
  "https://pub-5c6211fe5e5e407fa14819f4ac3be544.r2.dev/main%20page/hero_image.png";
const sectionImage =
  "https://pub-5c6211fe5e5e407fa14819f4ac3be544.r2.dev/main%20page/section_img.png";

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
            <div className="max-w-xs md:max-w-xl">
              <h1 className="text-3xl font-bold md:text-5xl">
                Bring stories to life,
              </h1>
              <h1 className="text-3xl font-bold md:text-5xl">together.</h1>
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
          <h2 className="text-white text-5xl text-center font-bold">
            What is TaleCraft?
          </h2>
        </div>
      </section>

      {/* Footer Section */}
      <section
        className="min-h-screen flex flex-col items-center lg:flex-row lg:justify-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <ThreeDCard
          className="mt-10"
          getStartedPath={getStartedPath}
          title="For Authors"
          info="You can easily create, manage, and publish interactive storybooks through an intuitive platform designed for creativity and flexibility. You can structure the stories into chapters and pages, enrich them with characters, and continuously refine your content. The system supports a smooth publishing workflow, allowing you to share your stories with a wider audience and update them whenever needed."
        />
        <ThreeDCard
          getStartedPath={getStartedPath}
          title="For Parents"
          info="You have the ability to create personalized versions of storybooks tailored specifically to your children. You can customize characters, names, and certain story elements to make each story feel unique and meaningful. This personalization helps create a deeper emotional connection, making reading time more engaging and special for both you and your child."
        />
        <ThreeDCard
          className="mb-10"
          getStartedPath={getStartedPath}
          title="For Children"
          info="You can explore and enjoy personalized stories that are tailored just for you, making reading more fun and immersive. The platform also includes reading progress tracking, allowing you to see how far you’ve come and stay motivated. By combining storytelling with interactivity, it encourages regular reading habits and supports early the love for reading in an enjoyable way."
        />
      </section>
    </div>
  );
}
