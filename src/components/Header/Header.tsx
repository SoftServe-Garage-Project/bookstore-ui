import { useState, MouseEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  IconButton,
  InputBase,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Typography,
  useTheme as useMuiTheme,
  useMediaQuery,
  SxProps,
  Theme,
} from "@mui/material";
import {
  Search as SearchIcon,
  ShoppingCart,
  AccountCircle,
  Menu as MenuIcon,
  LocalShipping,
  ReceiptLong,
  LocalOffer,
  Edit,
  Logout,
  Login,
  ArrowBack,
} from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";
import { authService } from "../../services/authService/authService";
import { useTheme } from "../../ThemeContext";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.85),
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.divider}`,
  backdropFilter: "blur(12px)",
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  letterSpacing: ".05rem",
  color: theme.palette.primary.main,
  cursor: "pointer",
  marginRight: theme.spacing(2),
  display: "none",
  [theme.breakpoints.up("sm")]: { display: "flex" },
}));

const SearchContainer = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(
    theme.palette.mode === "dark"
      ? theme.palette.common.white
      : theme.palette.common.black,
    0.05
  ),
  "&:hover, &:focus-within": {
    backgroundColor: alpha(
      theme.palette.mode === "dark"
        ? theme.palette.common.white
        : theme.palette.common.black,
      0.08
    ),
  },
  marginRight: theme.spacing(2),
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    maxWidth: "500px",
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
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.text.primary,
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: "100%",
  },
}));

const styles: Record<string, SxProps<Theme>> = {
  toolbar: {
    justifyContent: "space-between",
  },
  actionGroup: {
    display: "flex",
    alignItems: "center",
    gap: 0.5,
  },
  menuPaper: {
    elevation: 3,
    sx: {
      mt: 1.5,
      borderRadius: 2,
      minWidth: 220,
      filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
    },
  },
  userEmailBox: {
    px: 2,
    py: 1.5,
  },
};

interface HeaderProps {
  enableSideMenu?: boolean;
  onToggleMenu?: () => void;
  isMenuOpen?: boolean;
}

export default function Header({ enableSideMenu, onToggleMenu }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useMuiTheme();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  const [searchValue, setSearchValue] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const userEmail = authService.getUserEmail();
  const isAdmin = authService.getUserRoles() === "ROLE_ADMIN";

  const isHomePage = location.pathname === "/";

  const handleProfileMenuOpen = (event: MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleSearch = () => {
    if (searchValue.trim())
      navigate(`/?title=${encodeURIComponent(searchValue.trim())}`);
  };

  const navigateAndClose = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  const handleLogout = async () => {
    await authService.logout();
    handleMenuClose();
    navigate("/login");
  };

  return (
    <StyledAppBar position="sticky" elevation={0}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={styles.toolbar}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {isMobile && (
              <>
                {!isHomePage ? (
                  <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    onClick={() => navigate(-1)}
                    sx={{ mr: 1 }}
                  >
                    <ArrowBack />
                  </IconButton>
                ) : (
                  enableSideMenu && (
                    <IconButton
                      size="large"
                      edge="start"
                      color="inherit"
                      onClick={onToggleMenu}
                      sx={{ mr: 1 }}
                    >
                      <MenuIcon />
                    </IconButton>
                  )
                )}
              </>
            )}

            <LogoText variant="h6" onClick={() => navigate("/")}>
              Bookstore
            </LogoText>
          </Box>

          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <SearchContainer>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Book title..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </SearchContainer>
          </Box>

          <Box sx={styles.actionGroup}>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

            {!isMobile && userEmail && (
              <>
                <IconButton
                  color="inherit"
                  onClick={() => navigate("/orders")}
                  title="Orders"
                >
                  <LocalShipping />
                </IconButton>
                <IconButton
                  color="inherit"
                  onClick={() => navigate("/transactions")}
                  title="Transactions"
                >
                  <ReceiptLong />
                </IconButton>
              </>
            )}

            <IconButton
              color="inherit"
              onClick={() => navigate("/cart")}
              title="Cart"
            >
              <Badge badgeContent={0} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>

            <IconButton color="inherit" onClick={handleProfileMenuOpen}>
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        PaperProps={styles.menuPaper as any}
      >
        {userEmail ? (
          <>
            <Box sx={styles.userEmailBox}>
              <Typography variant="body2" color="text.secondary" noWrap>
                {userEmail}
              </Typography>
            </Box>
            <Divider />

            {isMobile && (
              <>
                <MenuItem onClick={() => navigateAndClose("/orders")}>
                  <ListItemIcon>
                    <LocalShipping fontSize="small" />
                  </ListItemIcon>
                  Orders
                </MenuItem>
                <MenuItem onClick={() => navigateAndClose("/transactions")}>
                  <ListItemIcon>
                    <ReceiptLong fontSize="small" />
                  </ListItemIcon>
                  Transactions
                </MenuItem>
                <Divider />
              </>
            )}

            {isAdmin && (
              <>
                <MenuItem onClick={() => navigateAndClose("/promocodes")}>
                  <ListItemIcon>
                    <LocalOffer fontSize="small" />
                  </ListItemIcon>
                  Promocodes
                </MenuItem>
                <MenuItem onClick={() => navigateAndClose("/editbook")}>
                  <ListItemIcon>
                    <Edit fontSize="small" />
                  </ListItemIcon>
                  Edit Books
                </MenuItem>
                <Divider />
              </>
            )}

            <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
              <ListItemIcon>
                <Logout fontSize="small" color="error" />
              </ListItemIcon>
              Sign Out
            </MenuItem>
          </>
        ) : (
          <MenuItem onClick={() => navigateAndClose("/login")}>
            <ListItemIcon>
              <Login fontSize="small" />
            </ListItemIcon>
            Login / Register
          </MenuItem>
        )}
      </Menu>
    </StyledAppBar>
  );
}
