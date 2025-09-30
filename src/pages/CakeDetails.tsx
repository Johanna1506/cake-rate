import {
  Container,
  Typography,
  Box,
  Card,
  CardMedia,
  Paper,
  Button,
  Avatar,
  Chip,
  Skeleton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useCake, useCakeRatings } from "@hooks/useCakeQuery";
import { useHasRole } from "@hooks/useAuthQuery";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { CakeRatings } from "@components/CakeRatings";

export function CakeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAdmin = useHasRole("ADMIN");

  const { data: cake, isLoading } = useCake(id);
  const { data: ratings } = useCakeRatings(id);

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Button
          variant="text"
          onClick={() => navigate(-1)}
          sx={{ mt: 4, mb: 2 }}
          startIcon={<ArrowBackIcon />}
        >
          Retour
        </Button>

        <Card sx={{ mb: 4 }}>
          <Skeleton variant="rectangular" height={400} />
          <Box sx={{ p: 3 }}>
            <Skeleton variant="text" width="60%" height={40} />
            <Box sx={{ mb: 2 }}>
              <Skeleton variant="rectangular" width={120} height={32} />
            </Box>
            <Skeleton variant="text" width="40%" height={24} />
            <Skeleton variant="text" width="80%" height={24} />
            <Skeleton variant="text" width="90%" height={24} />

            <Box sx={{ mb: 4 }}>
              <Skeleton variant="text" width="30%" height={32} />
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
              >
                <Skeleton variant="rectangular" width="100%" height={40} />
                <Skeleton variant="rectangular" width="100%" height={40} />
                <Skeleton variant="rectangular" width="100%" height={40} />
              </Box>
            </Box>

            <Skeleton variant="text" width="30%" height={32} />
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
              <Skeleton variant="rectangular" width="100%" height={80} />
              <Skeleton variant="rectangular" width="100%" height={80} />
            </Box>
          </Box>
        </Card>
      </Container>
    );
  }

  if (!cake) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
          Gâteau non trouvé
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Button
        variant="text"
        onClick={() => navigate(-1)}
        sx={{ mt: 4, mb: 2 }}
        startIcon={<ArrowBackIcon />}
      >
        Retour
      </Button>

      <Card sx={{ mb: 4 }}>
        <CardMedia
          component="img"
          height="400"
          image={cake.image_url}
          alt={cake.description}
          sx={{ objectFit: "cover" }}
        />
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            {cake.user?.name}
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Chip
              label={cake.week?.season?.theme}
              color="primary"
              sx={{
                fontWeight: "bold",
                backgroundColor: "primary.main",
                color: "white",
                "& .MuiChip-label": {
                  px: 2,
                },
              }}
            />
          </Box>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {cake.week?.start_date &&
              format(new Date(cake.week.start_date), "dd MMMM yyyy", {
                locale: fr,
              })}
            {" - "}
            {cake.week?.end_date &&
              format(new Date(cake.week.end_date), "dd MMMM yyyy", {
                locale: fr,
              })}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {cake.description}
          </Typography>

          <Box sx={{ mb: 4 }}>
            {isAdmin && ratings && ratings.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom>
                  Liste des votants
                </Typography>
                <List sx={{ mb: 3 }}>
                  {ratings.map((rating) => (
                    <ListItem key={rating.id}>
                      <ListItemAvatar>
                        <IconButton
                          onClick={() =>
                            rating.user?.id &&
                            navigate(`/profile/${rating.user.id}`)
                          }
                          sx={{ p: 0 }}
                        >
                          <Avatar
                            src={rating.user?.avatar_url}
                            alt={rating.user?.name}
                            sx={{
                              cursor: "pointer",
                              backgroundColor: "primary.main",
                              "&:hover": {
                                opacity: 0.8,
                              },
                            }}
                          >
                            {rating.user?.name?.[0] || "U"}
                          </Avatar>
                        </IconButton>
                      </ListItemAvatar>
                      <ListItemText
                        primary={rating.user?.name}
                        secondary={format(
                          new Date(rating.created_at),
                          "dd MMMM yyyy",
                          {
                            locale: fr,
                          }
                        )}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {cake.week?.show_scores ? (
              <CakeRatings cake={{ ...cake, ratings }} />
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Les notes ne sont pas encore disponibles
              </Typography>
            )}
          </Box>

          {ratings && ratings.some((rating) => rating.comment) && (
            <>
              <Typography variant="h6" gutterBottom>
                Commentaires
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {ratings
                  .filter((rating) => rating.comment)
                  .map((rating, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 2,
                        borderLeft: "4px solid",
                        borderColor: "primary.main",
                        backgroundColor: "rgba(25, 118, 210, 0.04)",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <IconButton
                          onClick={() =>
                            rating.user?.id &&
                            navigate(`/profile/${rating.user.id}`)
                          }
                          sx={{ p: 0 }}
                        >
                          <Avatar
                            src={rating.user?.avatar_url}
                            alt={rating.user?.name}
                            sx={{
                              cursor: "pointer",
                              backgroundColor: "primary.main",
                              "&:hover": {
                                opacity: 0.8,
                              },
                            }}
                          >
                            {rating.user?.name?.[0] || "U"}
                          </Avatar>
                        </IconButton>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600 }}
                        >
                          {rating.user?.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {rating.comment}
                      </Typography>
                    </Paper>
                  ))}
              </Box>
            </>
          )}
        </Box>
      </Card>
    </Container>
  );
}
