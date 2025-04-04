import React, { useState, useEffect, useRef } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Container,
  InputBase,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  alpha,
  styled,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Paper,
} from "@mui/material";
import {
  Search as SearchIcon,
  KeyboardArrowDown,
  Edit as EditIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Menu as MenuIcon,
  Category as CategoryIcon,
  Article,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import { debounce } from "lodash";
import { toast } from "react-toastify";
import { searchBlogs } from "../services/blogService";
import { searchUsers } from "../services/userService";

interface SearchResultItem {
  _id: string;
  title?: string;
  name?: string;
  type: "blog" | "user";
  profilePicture?: string;
}

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
      "&:focus": {
        width: "30ch",
      },
    },
  },
}));

const categories = [
  { id: 1, name: "Technology", icon: "🚀", color: "#1A237E" },
  { id: 2, name: "Design", icon: "🎨", color: "#B71C1C" },
  { id: 3, name: "Development", icon: "💻", color: "#1B5E20" },
  { id: 4, name: "Business", icon: "📈", color: "#4A148C" },
  { id: 5, name: "Lifestyle", icon: "🌟", color: "#E65100" },
  { id: 6, name: "Science", icon: "🔬", color: "#01579B" },
  { id: 7, name: "Food & Cooking", icon: "🍳", color: "#BF360C" },
  { id: 8, name: "Travel", icon: "✈️", color: "#0D47A1" },
  { id: 9, name: "Health & Fitness", icon: "💪", color: "#2E7D32" },
  { id: 10, name: "Arts & Culture", icon: "🎭", color: "#6A1B9A" },
  { id: 11, name: "Education", icon: "📚", color: "#C2185B" },
  { id: 12, name: "Environment", icon: "🌱", color: "#1B5E20" },
];

function Navbar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [categoryAnchorEl, setCategoryAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesAnchor, setCategoriesAnchor] = useState<null | HTMLElement>(
    null
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCategoryMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCategoryAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCategoryAnchorEl(null);
  };

  const debouncedSearch = debounce(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      setIsSearching(true);
      const [{ blogs: blogResults }, userResults] = await Promise.all([
        searchBlogs(query),
        searchUsers(query),
      ]);

      const combinedResults = [
        ...(blogResults?.map((blog: any) => ({
          _id: blog._id,
          title: blog.title,
          type: "blog" as const,
        })) || []),
        ...(userResults?.map((user: any) => ({
          _id: user._id,
          name: user.name,
          profilePicture: user.profilePicture,
          type: "user" as const,
        })) || []),
      ].slice(0, 5);

      setSearchResults(combinedResults);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to perform search");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      debouncedSearch(query);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleSearchNavigate = (result: SearchResultItem) => {
    setShowResults(false);
    setSearchQuery("");
    if (result.type === "blog") {
      navigate(`/blog/${result._id}`);
    } else {
      navigate(`/user/${result._id}`); // Changed from /profile/ to /user/
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const mobileMenuItems = [
    {
      text: "Categories",
      icon: <CategoryIcon />,
      onClick: () => setCategoryAnchorEl(null),
      hasSubmenu: true,
    },
    { text: "Write", icon: <EditIcon />, to: "/write" },
    ...(user
      ? [
          { text: "Dashboard", icon: <DashboardIcon />, to: "/dashboard" },
          { text: "Profile", icon: <PersonIcon />, to: `/user/${user._id}` }, // Changed from /profile to /user/:id
          { text: "Logout", icon: <LogoutIcon />, onClick: handleLogout },
        ]
      : [
          { text: "Login", icon: <PersonIcon />, to: "/login" },
          { text: "Sign Up", icon: <PersonIcon />, to: "/register" },
        ]),
  ];

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "nowrap",
          }}
        >
          {/* Mobile Menu Icon */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleMobileMenu}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <Logo size="small" showText={false} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(45deg, #024950 30%, #0FA4AF 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              BlogVerse
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <>
              <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
                <Button
                  startIcon={<CategoryIcon />}
                  endIcon={<KeyboardArrowDown />}
                  onClick={(e) => setCategoriesAnchor(e.currentTarget)}
                  sx={{
                    color: "inherit",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                    },
                  }}
                >
                  Categories
                </Button>
                <Menu
                  anchorEl={categoriesAnchor}
                  open={Boolean(categoriesAnchor)}
                  onClose={() => setCategoriesAnchor(null)}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      minWidth: 200,
                      background:
                        theme.palette.mode === "dark"
                          ? "rgba(0, 30, 60, 0.8)"
                          : "rgba(255, 255, 255, 0.8)",
                      backdropFilter: "blur(10px)",
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    },
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem
                      key={category.id}
                      onClick={() => {
                        setCategoriesAnchor(null);
                        navigate(`/category/${category.name.toLowerCase()}`);
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        py: 1.5,
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.1
                          ),
                        },
                      }}
                    >
                      <Typography sx={{ fontSize: "1.2rem" }}>
                        {category.icon}
                      </Typography>
                      <Typography
                        sx={{
                          color: category.color,
                          fontWeight: 500,
                        }}
                      >
                        {category.name}
                      </Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
              <Search
                ref={searchRef}
                sx={{ flexGrow: 1, mx: 2, maxWidth: 400, position: "relative" }}
              >
                <SearchIconWrapper>
                  {isSearching ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SearchIcon />
                  )}
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search blogs and users..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      navigate("/search", { state: { query: searchQuery } });
                      setShowResults(false);
                      setSearchQuery("");
                    }
                  }}
                />
                {showResults && searchResults.length > 0 && (
                  <Paper
                    sx={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      mt: 1,
                      maxHeight: 400,
                      overflow: "auto",
                      zIndex: 1000,
                      bgcolor: "background.paper",
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      boxShadow: 3,
                    }}
                  >
                    {searchResults.map((result) => (
                      <MenuItem
                        key={result._id}
                        onClick={() => handleSearchNavigate(result)}
                        sx={{
                          py: 1,
                          px: 2,
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        {result.type === "user" ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Avatar
                              src={result.profilePicture}
                              sx={{ width: 32, height: 32 }}
                            >
                              {result.name?.[0]}
                            </Avatar>
                            <Typography>{result.name}</Typography>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Article color="primary" />
                            <Typography>{result.title}</Typography>
                          </Box>
                        )}
                      </MenuItem>
                    ))}
                    <MenuItem
                      onClick={() => {
                        navigate("/search", { state: { query: searchQuery } });
                        setShowResults(false);
                        setSearchQuery("");
                      }}
                      sx={{
                        justifyContent: "center",
                        color: "primary.main",
                        borderTop: 1,
                        borderColor: "divider",
                      }}
                    >
                      View all results
                    </MenuItem>
                  </Paper>
                )}
              </Search>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {user ? (
                  <>
                    <Button
                      component={Link}
                      to="/write"
                      startIcon={<EditIcon />}
                      sx={{
                        color: "inherit",
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.common.white,
                            0.1
                          ),
                        },
                      }}
                    >
                      Write
                    </Button>
                    <IconButton
                      onClick={handleProfileMenuOpen}
                      size="small"
                      sx={{ ml: 2 }}
                    >
                      <Avatar
                        alt={user.name}
                        src={user.profilePicture}
                        sx={{ width: 32, height: 32 }}
                      />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                      PaperProps={{
                        sx: {
                          mt: 1.5,
                          minWidth: 180,
                          background:
                            theme.palette.mode === "dark"
                              ? "rgba(0, 30, 60, 0.8)"
                              : "rgba(255, 255, 255, 0.8)",
                          backdropFilter: "blur(10px)",
                          border: `1px solid ${alpha(
                            theme.palette.divider,
                            0.1
                          )}`,
                        },
                      }}
                    >
                      <MenuItem
                        component={Link}
                        to="/dashboard"
                        onClick={handleMenuClose}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          py: 1.5,
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.1
                            ),
                          },
                        }}
                      >
                        <DashboardIcon />
                        <Typography>Dashboard</Typography>
                      </MenuItem>
                      <MenuItem
                        component={Link}
                        to={`/user/${user._id}`} // Changed from /profile to /user/:id
                        onClick={handleMenuClose}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          py: 1.5,
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.1
                            ),
                          },
                        }}
                      >
                        <PersonIcon />
                        <Typography>Profile</Typography>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleMenuClose();
                          handleLogout();
                        }}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          py: 1.5,
                          color: theme.palette.error.main,
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.error.main,
                              0.1
                            ),
                          },
                        }}
                      >
                        <LogoutIcon />
                        <Typography>Logout</Typography>
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <>
                    <Button
                      component={Link}
                      to="/login"
                      sx={{
                        color: "inherit",
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.common.white,
                            0.1
                          ),
                        },
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      component={Link}
                      to="/register"
                      variant="contained"
                      sx={{
                        textTransform: "none",
                        background:
                          "linear-gradient(135deg, #0FA4AF 0%, #AFDDE5 100%)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #024950 0%, #0FA4AF 100%)",
                        },
                      }}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </Box>
            </>
          )}
        </Toolbar>
      </Container>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            background:
              theme.palette.mode === "dark"
                ? "rgba(0, 30, 60, 0.8)"
                : "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          },
        }}
      >
        <List sx={{ width: 250, pt: 2 }}>
          {mobileMenuItems.map((item, index) => (
            <ListItem
              key={index}
              button
              component={item.to ? Link : "div"}
              to={item.to}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                }
                setMobileMenuOpen(false);
              }}
              sx={{
                py: 1.5,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </AppBar>
  );
}

export default Navbar;
