import { ArrowRight } from "lucide-react";
import FeatureCard from "./feature";
import Section from "./section";
import { features } from "./data";
import bg from "../assets/bgGridGrey.svg";
import CarouselDemo from "./motivation";

import "../fonts.css";
import PrimaryButton from "./button";

const Home = () => {
  return (
    <div className="min-h-screen relative">
      <header className="relative text-black py-24 px-4 flex items-center justify-center">
        <div
          className="rotate-180 absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${bg})`,
            opacity: 0.5,
          }}
        ></div>
        <div className="relative z-10 container mx-auto flex flex-col items-center text-center">
          {/* Text section */}
          <div className="md:w-2/3 lg:w-1/2 mb-8">
            <h1
              className="text-4xl md:text-7xl mb-4"
              style={{ fontFamily: "SfBold" }}
            >
              AI Voice Assistant{" "}
              <span className="text-primary_blue">Chatbot</span>
            </h1>
            <p className="text-xl mb-8" style={{ fontFamily: "SfLight" }}>
              Experience the future of AI interaction through text and voice
            </p>
            <div className="flex justify-center">
              <PrimaryButton title="GET STARTED" className="relative z-10" />
            </div>
          </div>
        </div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${bg})`,
            opacity: 0.5,
          }}
        ></div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <Section title="Features">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </Section>

        <Section title="Why We Built This">
          <div className="flex justify-center items-center">
            <CarouselDemo />
          </div>
        </Section>

        <Section title="Ready to Get Started?" className="text-center">
          <button className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-blue-700 transition-colors inline-flex items-center">
            Try It Now
            <ArrowRight className="ml-2" />
          </button>
        </Section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 AI Voice Assistant Chatbot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
