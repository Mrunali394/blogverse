import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import { useState, useMemo, createContext } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import CreatePost from "./pages/blog/CreatePost";
import BlogPost from "./pages/blog/BlogPost";
import CategoryPosts from "./pages/blog/CategoryPosts";
import CategoryView from "./pages/blog/CategoryView";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ExploreBlogsPage from "./pages/blog/ExploreBlogsPage";
import Analytics from "./pages/Analytics";
import UserProfile from "./pages/UserProfile";
import Search from "./pages/Search";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Box } from "@mui/material";
import { NotificationsProvider } from "./context/NotificationsContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const ColorModeContext = createContext({
  toggleColorMode: () => {},
});

function App() {
  const [mode, setMode] = useState<"light" | "dark">("light");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#0FA4AF",
            light: "#AFDDE5",
            dark: "#024950",
            contrastText: "#FFFFFF",
          },
          secondary: {
            main: "#024950",
            light: "#0FA4AF",
            dark: "#003135",
            contrastText: "#FFFFFF",
          },
          background: {
            default: mode === "light" ? "#F5FAFB" : "#003135",
            paper: mode === "light" ? "#FFFFFF" : "#024950",
          },
          text: {
            primary: mode === "light" ? "#003135" : "#FFFFFF",
            secondary: mode === "light" ? "#024950" : "#AFDDE5",
          },
          error: {
            main: "#FF6B6B",
            light: "#FF8585",
            dark: "#FF5252",
          },
          warning: {
            main: "#0FA4AF",
            light: "#AFDDE5",
            dark: "#024950",
          },
          info: {
            main: "#024950",
            light: "#0FA4AF",
            dark: "#003135",
          },
          success: {
            main: "#0FA4AF",
            light: "#AFDDE5",
            dark: "#024950",
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 800,
            fontSize: "3.5rem",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          },
          h2: {
            fontWeight: 700,
            fontSize: "2.75rem",
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
          },
          h3: {
            fontWeight: 700,
            fontSize: "2.25rem",
            lineHeight: 1.2,
          },
          h4: {
            fontWeight: 600,
            fontSize: "1.75rem",
            lineHeight: 1.2,
          },
          h5: {
            fontWeight: 600,
            fontSize: "1.5rem",
            lineHeight: 1.2,
          },
          h6: {
            fontWeight: 600,
            fontSize: "1.25rem",
            lineHeight: 1.2,
          },
          body1: {
            fontSize: "1rem",
            lineHeight: 1.5,
          },
          body2: {
            fontSize: "0.875rem",
            lineHeight: 1.5,
          },
          button: {
            textTransform: "none",
            fontWeight: 600,
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                padding: "8px 16px",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <NotificationsProvider>
            <Router>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "100vh",
                }}
              >
                <Navbar />
                <Box component="main" sx={{ flexGrow: 1 }}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                      path="/forgot-password"
                      element={<ForgotPassword />}
                    />
                    <Route
                      path="/reset-password/:token"
                      element={<ResetPassword />}
                    />
                    <Route path="/blog/:id" element={<BlogPost />} />
                    <Route
                      path="/write"
                      element={
                        <ProtectedRoute>
                          <CreatePost />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/me"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/profile/:userId" element={<UserProfile />} />
                    <Route
                      path="/category/:category"
                      element={<CategoryView />}
                    />
                    <Route path="/explore" element={<ExploreBlogsPage />} />
                    <Route
                      path="/analytics"
                      element={
                        <ProtectedRoute>
                          <Analytics />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/user/:userId" element={<UserProfile />} />
                    <Route path="/search" element={<Search />} />
                  </Routes>
                </Box>
                <Footer />
              </Box>
            </Router>
            <ToastContainer position="bottom-right" />
          </NotificationsProvider>
        </AuthProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
