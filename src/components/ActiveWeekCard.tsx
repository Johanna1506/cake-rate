import { useState } from "react";
import { useWeekCake } from "@hooks/useWeekQuery";
import { CakeRatingForm } from "@components/CakeRatingForm";
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Button,
  Dialog,
  DialogContent,
  Typography,
  IconButton,
} from "@mui/material";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";
import { Week, User } from "../types";
import { CakeDetails } from "./CakeDetails";
import { useNavigate } from "react-router-dom";

interface ActiveWeekCardProps {
  week: Week;
  currentUser: User;
  onAddCake: (weekId: string) => void;
}

export function ActiveWeekCard({
  week,
  currentUser,
  onAddCake,
}: ActiveWeekCardProps) {
  const { data: cake } = useWeekCake(week.id);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const navigate = useNavigate();

  return (
    <Box>
      <Card
        sx={{
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: 3,
          },
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* En-tête de la carte */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "center", sm: "flex-start" },
              mb: 3,
              gap: { xs: 2, sm: 0 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: { xs: 2, sm: 3 },
                alignItems: "center",
                flexDirection: { xs: "column", sm: "row" },
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              {week.user && (
                <IconButton
                  onClick={() =>
                    week.user?.id && navigate(`/profile/${week.user.id}`)
                  }
                  sx={{ p: 0 }}
                >
                  <Avatar
                    src={week.user.avatar_url}
                    alt={week.user.name}
                    sx={{
                      width: { xs: 48, sm: 64 },
                      height: { xs: 48, sm: 64 },
                      border: "2px solid",
                      backgroundColor: "primary.main",
                      cursor: "pointer",
                      "&:hover": {
                        opacity: 0.8,
                      },
                    }}
                  >
                    {week.user.name?.[0] || "U"}
                  </Avatar>
                </IconButton>
              )}
              <Box>
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    mb: 1,
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  }}
                >
                  {format(new Date(week.start_date), "dd MMMM", { locale: fr })}{" "}
                  -{" "}
                  {format(new Date(week.end_date), "dd MMMM yyyy", {
                    locale: fr,
                  })}
                </Typography>

                {week.user ? (
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: "text.secondary",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      justifyContent: { xs: "center", sm: "flex-start" },
                    }}
                  >
                    Participant : {week.user.name}
                  </Typography>
                ) : (
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ fontStyle: "italic" }}
                  >
                    Aucun participant assigné
                  </Typography>
                )}
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: { xs: "center", sm: "flex-end" },
                gap: 2,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              {week.user?.id === currentUser?.id && !cake && (
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  startIcon={<AddIcon />}
                  onClick={() => onAddCake(week.id)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  Ajouter votre gâteau
                </Button>
              )}
            </Box>
          </Box>

          {/* Contenu du gâteau */}
          {cake ? (
            <CakeDetails
              cake={cake}
              currentUser={currentUser}
              onViewDetails={() => navigate(`/cake-history/${cake.id}`)}
              onVote={() => setShowRatingModal(true)}
            />
          ) : week.user ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 3,
                px: 2,
                bgcolor: "background.paper",
                borderRadius: 1,
                border: "1px dashed",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ fontStyle: "italic", textAlign: "center" }}
              >
                🎂 Notre chef pâtissier·ère est en train de préparer une
                surprise sucrée...
                <br />
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ opacity: 0.7 }}
                >
                  (On entend déjà le bruit du batteur électrique !)
                </Typography>
              </Typography>
            </Box>
          ) : null}
        </CardContent>
      </Card>

      <Dialog
        open={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent
          sx={{
            position: "relative",
            p: { xs: 2, sm: 3 },
          }}
        >
          <IconButton
            onClick={() => setShowRatingModal(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "text.secondary",
              "&:hover": {
                color: "text.primary",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          {cake && (
            <CakeRatingForm
              cakeId={cake.id}
              onClose={() => setShowRatingModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
