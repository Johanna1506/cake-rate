import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { keyframes } from "@mui/system";
import { useTheme } from "@context/ThemeContext";

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export function NotFound() {
  const navigate = useNavigate();
  const { mode } = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        textAlign: "center",
        p: 3,

      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "200px",
          height: "200px",
          mb: 4,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: mode === 'dark' ? '#4a5759' : '#ffffff',
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: mode === 'dark'
              ? '0 0 20px rgba(0,0,0,0.3)'
              : '0 0 20px rgba(0,0,0,0.1)',
            animation: `${bounce} 2s infinite`,
          }}
        >
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: "4rem",
              fontWeight: "bold",
              color: mode === 'dark' ? '#b0c4b1' : '#4a5759',
              textShadow: mode === 'dark'
                ? '2px 2px 4px rgba(0,0,0,0.3)'
                : '2px 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            404
          </Typography>
        </Box>
        <Box
          sx={{
            position: "absolute",
            top: "-20px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "40px",
            height: "40px",
            background: mode === 'dark' ? '#b0c4b1' : '#4a5759',
            borderRadius: "50%",
            animation: `${spin} 3s linear infinite`,
          }}
        />
      </Box>

      <Typography
        variant="h4"
        component="h2"
        gutterBottom
        sx={{
          color: mode === 'dark' ? '#ffffff' : '#4a5759',
          fontWeight: "bold",
          textShadow: mode === 'dark'
            ? '1px 1px 2px rgba(0,0,0,0.3)'
            : '1px 1px 2px rgba(0,0,0,0.1)',
        }}
      >
        Oups ! Ce gâteau n'existe pas
      </Typography>

      <Typography
        variant="body1"
        paragraph
        sx={{
          maxWidth: "600px",
          mb: 4,
          color: mode === 'dark' ? '#b0c4b1' : '#84a59d',
        }}
      >
        Il semble que le gâteau que vous cherchez a été mangé ou n'a jamais existé.
        Ne vous inquiétez pas, nous avons plein d'autres délicieux gâteaux à découvrir !
      </Typography>

      <Button
        variant="contained"
        onClick={() => navigate("/")}

      >
        Retour à la pâtisserie
      </Button>
    </Box>
  );
}