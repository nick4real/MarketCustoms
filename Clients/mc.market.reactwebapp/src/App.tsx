import "./App.css";
import Home from "./pages/Home";
import MainLayout from "./layouts/MainLayout";

function App() {
  const body = document.body;
  body.classList.add("dark:bg-neutral-950");
  body.classList.add("dark:text-white");
  body.classList.add("bg-white");
  body.classList.add("text-black");
  body.classList.add("overflow-x-hidden");
  body.classList.add("min-h-screen");
  body.classList.add("items-center");

  const root = document.getElementById("root");
  root.classList.add("w-full");
  root.classList.add("items-center");
  root.classList.add("flex");
  root.classList.add("flex-col");
  root.classList.add("min-w-[320px]");

  return (
    <MainLayout>
      <Home />
    </MainLayout>
  );
}

export default App;
