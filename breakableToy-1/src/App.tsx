import "./App.css";
import DemoPage from "./todos/page";
import { ThemeProvider } from "@/components/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <DemoPage />
    </ThemeProvider>
  );
}

export default App;
