import React, { useState } from "react";
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
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

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

  const handleSearch = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      navigate(`/search?q=${searchQuery}`);
      if (isMobile) {
        setMobileMenuOpen(false);
      }
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
          { text: "Profile", icon: <PersonIcon />, to: "/profile" },
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
              <Search sx={{ flexGrow: 1, mx: 2, maxWidth: 400 }}>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search blogs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearch}
                />
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
                        to="/profile"
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
