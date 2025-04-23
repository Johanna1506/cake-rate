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
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { Week } from '../types';
import { CakeDetails } from "./CakeDetails";

interface ActiveWeekCardProps {
  week: Week;
  currentUser: any;
  onAddCake: (weekId: string) => void;
}

export function ActiveWeekCard({ week, currentUser, onAddCake }: ActiveWeekCardProps) {
  const { data: cake } = useWeekCake(week.id);
  const [showRatingModal, setShowRatingModal] = useState(false);

  return (
    <Box>
      <Card
        sx={{
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 3
          },
          overflow: 'visible'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* En-tête de la carte */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
              {week.user && (
                <Avatar
                  src={week.user.avatar_url}
                  alt={week.user.name}
                  sx={{
                    width: 64,
                    height: 64,
                    border: '2px solid',
                    borderColor: 'primary.main',
                    boxShadow: 2
                  }}
                >
                  {week.user.name?.[0] || "U"}
                </Avatar>
              )}
              <Box>
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 1
                  }}
                >
                  {format(new Date(week.start_date), "dd MMMM", { locale: fr })} - {format(new Date(week.end_date), "dd MMMM yyyy", { locale: fr })}
                </Typography>

                {week.user ? (
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    Participant : {week.user.name}
                  </Typography>
                ) : (
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ fontStyle: 'italic' }}
                  >
                    Aucun participant assigné
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>

              {week.user?.id === currentUser?.id && !cake && (
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  startIcon={<AddIcon />}
                  onClick={() => onAddCake(week.id)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1
                  }}
                >
                  Ajouter votre gâteau
                </Button>
              )}
            </Box>
          </Box>

          {/* Contenu du gâteau */}
          {cake && (
            <CakeDetails
              cake={cake}
              week={week}
              currentUser={currentUser}
              onVote={() => setShowRatingModal(true)}
            />
          )}
        </CardContent>
      </Card>

      <Dialog
        open={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => setShowRatingModal(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary',
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