import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WaitlistPage from "@/pages/WaitlistPage";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WaitlistPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
