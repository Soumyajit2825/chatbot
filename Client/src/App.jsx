import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Home from "./components/home";
import Chatbot from "./components/chatbot";
import Assistant from "./components/assistant";
import logo from "./assets/react.svg";

// import PrimaryButton from "./components/button";
import SecondaryButton from "./components/button2";

import DropDownArrow from "./assets/dropdownArrow.svg";

const navElementMembers = [
  { title: "Home", href: "/", haveChildren: false },
  { title: "Chat", href: "/chat", haveChildren: false },
  { title: "Assistant", href: "/ai", haveChildren: false },
  { title: "FAQ", href: "/faq", haveChildren: false },
];

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavOpened, setIsNavOpened] = useState(1000);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (idx) => {
    setIsNavOpened(idx === isNavOpened ? 1000 : idx);
  };

  return (
    <Router>
      <div className="App">
        <header
          className={`fixed ${
            isScrolled ? "top-2" : "top-4"
          } w-full z-50 px-[3.5%] duration-200 animate-fade`}
        >
          <nav
            className={`bg-white/50 backdrop-blur-lg h-fit w-full flex rounded-full border-[1.5px] border-primary_blue justify-between px-5 py-2 items-center`}
          >
            <Link to="/" aria-label="Go to home page">
              <img src={logo} alt="React Logo" className="h-8" />
            </Link>
            <ul className="flex sm:space-x-40 space-x-2 items-center justify-center">
              {navElementMembers.map((item, idx) => (
                <li key={idx} className="relative">
                  {!item.haveChildren ? (
                    <Link
                      to={item.href}
                      className={`${
                        isNavOpened === idx
                          ? "text-primary_blue"
                          : "text-gray-600"
                      } font-semibold text-lg hover:text-primary_blue transition-colors duration-300`}
                      onClick={() => handleClick(idx)}
                      style={{ fontFamily: "SfLight" }}
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <div className="relative">
                      <button
                        onClick={() => handleClick(idx)}
                        className={`${
                          isNavOpened === idx
                            ? "text-primary_blue"
                            : "text-gray-600"
                        } font-semibold text-lg hover:text-primary_blue transition-colors duration-300 flex items-center`}
                      >
                        {item.title}
                        <DropDownArrow
                          className={`ml-1 ${
                            isNavOpened === idx ? "rotate-180" : ""
                          } transition-transform duration-300`}
                        />
                      </button>
                      {isNavOpened === idx && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                          {item.children.map((child, childIdx) => (
                            <Link
                              key={childIdx}
                              to={child.href}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              {child.subtitle}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <SecondaryButton title="GET STARTED" className="relative z-10" />
          </nav>
        </header>
        <main className="pt-32 p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chatbot />} />
            <Route path="/ai" element={<Assistant />} />
            <Route path="/faq" element={<Assistant />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
