import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { JobJournal } from "./pages/JobJournal";
import { MockInterview } from "./pages/MockInterview";

function AppLayout() {
  const location = useLocation();

  const navItems = [
    { to: "/", label: "Dashboard", icon: "\u25A1" },
    { to: "/jobs", label: "Journal", icon: "\u2630" },
    { to: "/interview", label: "Interview", icon: "\u25C7" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center justify-between border-b px-6 py-4 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <NavLink to="/" className="text-xl font-bold" style={{ fontFamily: "'DM Serif Display', serif" }}>
          GoodJob
        </NavLink>
        <div className="flex gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-foreground ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-center border-b px-4 py-3 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <span className="text-lg font-bold" style={{ fontFamily: "'DM Serif Display', serif" }}>
          GoodJob
        </span>
      </div>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/jobs" element={<JobJournal />} />
          <Route path="/interview" element={<MockInterview />} />
        </Routes>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-card/95 backdrop-blur-sm z-50 flex justify-around py-2 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const isActive = item.to === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
                isActive ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
