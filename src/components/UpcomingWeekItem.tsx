import { Avatar, Card, CardContent, IconButton, Typography, Box } from "@mui/material";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Week } from "../types";
import { useNavigate } from "react-router-dom";

interface UpcomingWeekItemProps {
  week: Week;
}

export function UpcomingWeekItem({ week }: UpcomingWeekItemProps) {
  const navigate = useNavigate();

  return (
    <Card sx={{ transition: "all 0.2s ease-in-out", "&:hover": { transform: "translateY(-2px)", boxShadow: 3 } }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
            {week.user && (
              <IconButton onClick={() => week.user?.id && navigate(`/profile/${week.user.id}`)} sx={{ p: 0 }}>
                <Avatar
                  src={week.user.avatar_url}
                  alt={week.user.name}
                  sx={{ width: 56, height: 56, border: "2px solid", borderColor: "primary.main", cursor: "pointer", backgroundColor: "primary.main", "&:hover": { opacity: 0.8 } }}
                >
                  {week.user.name?.[0] || "U"}
                </Avatar>
              </IconButton>
            )}
            <Box>
              <Typography variant="h6" component="h2" sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}>
                {format(new Date(week.start_date), "dd MMMM", { locale: fr })} - {format(new Date(week.end_date), "dd MMMM yyyy", { locale: fr })}
              </Typography>
              {week.user ? (
                <Typography variant="subtitle1" sx={{ color: "text.secondary", display: "flex", alignItems: "center", gap: 1 }}>
                  Participant : {week.user.name}
                </Typography>
              ) : (
                <Typography variant="subtitle1" color="text.secondary" sx={{ fontStyle: "italic" }}>
                  Aucun participant assigné
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}


