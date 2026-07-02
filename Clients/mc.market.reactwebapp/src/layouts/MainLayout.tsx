import Footer from "../components/Footer";
import Header from "../components/Header";
import MenuPanel from "../components/MenuPanel";
import { useState } from "react";

function MainLayout({ children }: { children: React.ReactNode }) {
  /* States */
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /* Handlers */
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      <MenuPanel isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      <main className="mx-auto mt-14 flex w-full max-w-8xl flex-1 flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
