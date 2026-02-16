import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useLocation,
} from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { JobJournal } from "./pages/JobJournal";
import { MockInterview } from "./pages/MockInterview";

function AppLayout() {
  const location = useLocation();

  const navItems = [
    { to: "/", label: "GoodJobs", icon: "\u25A1" },
    { to: "/jobs", label: "Journal", icon: "\u2630" },
    { to: "/interview", label: "Interview", icon: "\u25C7" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Centered tab nav — Airbnb-style */}
      <nav className="sticky top-0 z-50 bg-background">
        <div className="flex justify-center gap-8 pt-5 pb-0">
          {navItems.map((item) => {
            const isActive =
              item.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={`relative pb-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground rounded-full" />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

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
          const isActive =
            item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
                isActive
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
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
