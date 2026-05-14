import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-book-dashed-icon lucide-book-dashed"
      >
        <path d="M12 17h1.5" />
        <path d="M12 22h1.5" />
        <path d="M12 2h1.5" />
        <path d="M17.5 22H19a1 1 0 0 0 1-1" />
        <path d="M17.5 2H19a1 1 0 0 1 1 1v1.5" />
        <path d="M20 14v3h-2.5" />
        <path d="M20 8.5V10" />
        <path d="M4 10V8.5" />
        <path d="M4 19.5V14" />
        <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H8" />
        <path d="M8 22H6.5a1 1 0 0 1 0-5H8" />
      </svg>
    ),
    title: "Authors",
    description:
      "Create, manage, and publish interactive storybooks with chapters and pages.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-brush-icon lucide-brush"
      >
        <path d="m11 10 3 3" />
        <path d="M6.5 21A3.5 3.5 0 1 0 3 17.5a2.62 2.62 0 0 1-.708 1.792A1 1 0 0 0 3 21z" />
        <path d="M9.969 17.031 21.378 5.624a1 1 0 0 0-3.002-3.002L6.967 14.031" />
      </svg>
    ),
    title: "Parents",
    description:
      "Create personalized versions of books for their children with customizable characters.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-book-open-text-icon lucide-book-open-text"
      >
        <path d="M12 7v14" />
        <path d="M16 12h2" />
        <path d="M16 8h2" />
        <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
        <path d="M6 12h2" />
        <path d="M6 8h2" />
      </svg>
    ),
    title: "Children",
    description: "Read personalized stories with reading progress tracking.",
  },
];

export default function About() {
  return (
    <section className="grid min-h-screen w-full grid-cols-1 items-center md:grid-cols-2">
      <img
        src="https://pub-5c6211fe5e5e407fa14819f4ac3be544.r2.dev/main%20page/bg-about-2.png"
        alt="contact"
        className="hidden h-full w-full object-cover object-center md:block"
      />
      <div className="p-6 sm:p-12 lg:p-16">
        <div className="container mx-auto ">
          <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
            <div className="col-span-3 w-full">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-1.5 text-sm font-medium">
                <span>Get to know us</span>
              </div>
              <h2 className="mb-4 text-3xl font-bold text-balance md:text-4xl lg:text-5xl">
                About TaleCraft
              </h2>
              <p className="text-muted-foreground mb-10 max-w-2xl text-base  md:text-lg lg:mb-12">
                Every component is crafted with precision and care, ensuring you
                get the best tools to build exceptional digital experiences.
              </p>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                {FEATURES.map(({ icon, title, description }) => (
                  <div key={title} className="group">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 transition-transform group-hover:scale-110">
                      {icon}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
