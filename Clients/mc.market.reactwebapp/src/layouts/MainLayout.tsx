import Footer from "../components/Footer";
import Header from "../components/Header";
import MenuPanel from "../components/MenuPanel";
import { useState } from "react";

function MainLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <Header isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      <MenuPanel isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      <main className="mt-14 border w-full xl:w-8xl flex">{children}</main>
      <Footer />
    </>
  );
}

export default MainLayout;
