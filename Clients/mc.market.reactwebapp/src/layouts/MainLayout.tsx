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
      <MenuPanel isMenuOpen={isMenuOpen} />
      <main className="mt-14 border w-full lg:w-5xl">{children}</main>
      <Footer />
    </>
  );
}

export default MainLayout;
