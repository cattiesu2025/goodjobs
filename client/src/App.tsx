import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { JobJournal } from "./pages/JobJournal";
import { MockInterview } from "./pages/MockInterview";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <nav className="border-b px-4 py-3 flex gap-4">
          <NavLink to="/" className={({ isActive }) =>
            isActive ? "font-bold" : "text-muted-foreground"
          }>Dashboard</NavLink>
          <NavLink to="/jobs" className={({ isActive }) =>
            isActive ? "font-bold" : "text-muted-foreground"
          }>Job Journal</NavLink>
          <NavLink to="/interview" className={({ isActive }) =>
            isActive ? "font-bold" : "text-muted-foreground"
          }>Mock Interview</NavLink>
        </nav>
        <main className="p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jobs" element={<JobJournal />} />
            <Route path="/interview" element={<MockInterview />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
