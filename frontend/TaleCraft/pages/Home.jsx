import heroBg from "../src/assets/images/background.jpg";
import heroImage from "../src/assets/images/hero_image.png";

export default function Home() {
  return (
    <div
      className="hero min-h-screen bg-no-repeat"
      style={{
        backgroundImage: `url(${heroBg})`,
      }}
    >
      <div className="hero-content flex-col lg:flex-row gap-10">
        <img src={heroImage} className="max-w-sm" />
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Bring stories to life,</h1>
          <h1 className="text-5xl font-bold">together.</h1>
          <p className="py-6">
            The ultimate platform where authors create magical interactive
            storybooks, and parents personalize them to make their child the
            hero of every adventure.
          </p>
          <button className="btn btn-primary ">Get Started</button>
        </div>
      </div>
    </div>
  );
}
