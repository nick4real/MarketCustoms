import { Link } from "react-router";
interface Props {
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

function MenuPanel({ isMenuOpen, toggleMenu }: Props) {
  if (!isMenuOpen) {
    return null;
  }

  return (
    <>
      <menu className="flex flex-col gap-2 z-50 fixed top-0 left-0 h-full w-64 bg-amber-900/20 md:hidden">
        <li>
          <Link to="/" onClick={toggleMenu}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/dashboard" onClick={toggleMenu}>
            Dashboard
          </Link>
        </li>
      </menu>
    </>
  );
}
export default MenuPanel;
