function Footer() {
  return (
    <>
      <footer className="border w-full">
        <div className="flex h-16 items-center justify-center bg-white text-black dark:bg-neutral-950 dark:text-white">
          <p>Powered by React. {new Date().getFullYear()}</p>
        </div>
      </footer>
    </>
  );
}

export default Footer;
