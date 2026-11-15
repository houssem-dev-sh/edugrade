import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

function MainLayout({ children }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Student Management
          </Typography>

          <Button color="inherit" onClick={() => navigate("/dashboard")}>
            Dashboard
          </Button>

          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ padding: 3 }}>{children}</Box>
    </div>
  );
}

export default MainLayout;
