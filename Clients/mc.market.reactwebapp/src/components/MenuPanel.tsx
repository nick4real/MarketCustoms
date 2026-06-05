interface Props {
  isMenuOpen: boolean;
}

function MenuPanel({ isMenuOpen }: Props) {
  if (!isMenuOpen) {
    return null;
  }

  return (
    <>
      <menu className="flex flex-col gap-2 z-50 fixed top-0 left-0 h-full w-64 bg-amber-900/20 md:hidden">
        <li>
          <a href="/">Home</a>
        </li>
        <li>
          <a href="/">About</a>
        </li>
        <li>
          <a href="/">Contact</a>
        </li>
        <li>
          <a href="/">Login</a>
        </li>
      </menu>
    </>
  );
}
export default MenuPanel;
