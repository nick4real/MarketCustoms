function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header>
        <div>
          <div className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between gap-12 px-4 text-black backdrop-blur-xs transition dark:bg-neutral-900/20 dark:text-white">
            <div className="absolute inset-x-2 top-full h-px bg-black/20 dark:bg-white/20"></div>
            <div className="mr-auto">
              <a href="/" className="">
                Marketplace
              </a>
            </div>
            <div className="">
              <button className="">Sign in</button>
            </div>
          </div>
        </div>
      </header>
      <main className="mt-14 flex-grow">
        <div className="mx-32 border-1">{children}</div>
      </main>
      <footer className="">
        <div className="inset-x-0 flex h-16 items-center justify-center bg-white dark:bg-neutral-950">
          <p className="text-white/90">Powered by React. {new Date().getFullYear()}</p>
        </div>
      </footer>
    </>
  );
}

export default MainLayout;
