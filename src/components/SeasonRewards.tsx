import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Grid,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import ShareIcon from "@mui/icons-material/Share";
import { Season } from "../types";
import { useNavigate } from "react-router-dom";

interface SeasonRewardsProps {
  season: Season;
}

export function SeasonRewards({ season }: SeasonRewardsProps) {
  const navigate = useNavigate();

  if (!season.achievements) return null;

  return (
    <Box sx={{ mt: 6, px: { xs: 2, sm: 4 } }}>
      {season.winner && (
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h5"
            sx={{
              mb: 3,
              fontWeight: 600,
              textAlign: "center",
              color: "primary.main",
            }}
          >
            🏆 Grand Gagnant de la Saison
          </Typography>
          <Card
            onClick={() =>
              season.winner && navigate(`/profile/${season.winner.id}`)
            }
            sx={{
              background: "background.paper",
              borderRadius: 4,
              border: "none",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
              transition: "transform 0.2s ease-in-out",
              cursor: "pointer",
              "&:hover": {
                transform: "translateY(-4px)",
              },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Avatar
                  src={season.winner.avatar_url}
                  alt={season.winner.name}
                  sx={{
                    width: { xs: 96, sm: 120 },
                    height: { xs: 96, sm: 120 },
                    border: "4px solid",
                    borderColor: "primary.main",
                    backgroundColor: "primary.main",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                  }}
                >
                  {season.winner.name?.[0] || "W"}
                </Avatar>
                <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      mb: 1,
                    }}
                  >
                    {season.winner.name}
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Vainqueur de la saison "{season.theme}"
                  </Typography>
                  <Chip
                    icon={<EmojiEventsIcon />}
                    label="Grand Gagnant"
                    color="primary"
                    sx={{
                      fontWeight: 600,
                      fontSize: "1.1rem",
                      height: 48,
                      px: 3,
                      borderRadius: 3,
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      <Typography
        variant="h5"
        sx={{
          mb: 4,
          fontWeight: 600,
          textAlign: "center",
          color: "primary.main",
        }}
      >
        Récompenses spéciales
      </Typography>
      <Grid container spacing={3}>
        {season.achievements
          .filter(
            (achievement) => achievement.achievement_type !== "season_winner"
          )
          .map((achievement) => (
            <Grid item xs={12} sm={6} md={4} key={achievement.id}>
              <Card
                sx={{
                  background: "background.paper",
                  borderRadius: 4,
                  border: "none",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
                  height: "100%",
                  transition: "transform 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 3,
                      textAlign: "center",
                    }}
                  >
                    <Avatar
                      src={achievement.user?.avatar_url}
                      alt={achievement.user?.name}
                      sx={{
                        width: 96,
                        height: 96,
                        border: "4px solid",
                        borderColor: "primary.main",
                        backgroundColor: "primary.main",
                        boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                      }}
                    >
                      {achievement.user?.name?.[0] || "U"}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          mb: 1,
                        }}
                      >
                        {achievement.user?.name}
                      </Typography>
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {achievement.achievement_type === "best_taste" &&
                          "Meilleur goût"}
                        {achievement.achievement_type === "best_appearance" &&
                          "Meilleure présentation"}
                        {achievement.achievement_type === "best_theme" &&
                          "Meilleur respect du thème"}
                      </Typography>
                      <Chip
                        icon={
                          achievement.achievement_type === "best_taste" ? (
                            <RestaurantMenuIcon />
                          ) : achievement.achievement_type ===
                            "best_appearance" ? (
                            <EmojiEventsIcon />
                          ) : (
                            <ShareIcon />
                          )
                        }
                        label={
                          achievement.achievement_type === "best_taste"
                            ? "Goût"
                            : achievement.achievement_type === "best_appearance"
                            ? "Présentation"
                            : "Thème"
                        }
                        color="primary"
                        sx={{
                          fontWeight: 600,
                          fontSize: "1.1rem",
                          height: 48,
                          px: 3,
                          borderRadius: 3,
                        }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>
    </Box>
  );
}
