import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  CircularProgress,
  Chip,
  useTheme,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface UserRanking {
  user: User;
  averageScore: number;
  totalCakes: number;
  totalRatings: number;
}


interface SeasonRankingProps {
  seasonId: string;
}

export function SeasonRanking({ seasonId }: SeasonRankingProps) {
  const [rankings, setRankings] = useState<UserRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    async function fetchRankings() {
      try {
        setIsLoading(true);
        setError(null);

        // Récupérer les gâteaux, notes et utilisateurs pour cette saison
        // Seulement pour les semaines où show_scores = true
        const { data, error } = await supabase
          .from('ratings')
          .select(`
            appearance,
            taste,
            theme_adherence,
            cake_id,
            cakes!inner(
              user_id,
              users!inner(
                id,
                name,
                email,
                avatar_url,
                role,
                created_at
              ),
              weeks!inner(
                season_id,
                show_scores
              )
            )
          `)
          .eq('cakes.weeks.season_id', seasonId)
          .eq('cakes.weeks.show_scores', true);

        if (error) throw error;

        // Grouper par utilisateur (un seul gâteau par utilisateur par saison)
        const userStats = new Map<string, {
          user: User;
          scores: number[];
          cakeId: string;
        }>();

        // Ignorer les types pour simplifier avec les données Supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data?.forEach((rating: any) => {
          const cake = rating.cakes;
          const user = cake.users;
          // Normaliser les notes sur 5 : appearance et theme_adherence sont sur 2.5, taste sur 5
          const normalizedAppearance = (rating.appearance / 2.5) * 5;
          const normalizedTaste = rating.taste; // Déjà sur 5
          const normalizedTheme = (rating.theme_adherence / 2.5) * 5;
          const avgRating = (normalizedAppearance + normalizedTaste + normalizedTheme) / 3;

          if (!userStats.has(user.id)) {
            userStats.set(user.id, {
              user: user as User,
              scores: [],
              cakeId: rating.cake_id,
            });
          }

          const stats = userStats.get(user.id)!;
          stats.scores.push(avgRating);
        });

        // Calculer les classements (un gâteau par utilisateur)
        const rankingData: UserRanking[] = Array.from(userStats.entries()).map(([, stats]) => ({
          user: stats.user,
          averageScore: stats.scores.length > 0 ? stats.scores.reduce((a, b) => a + b) / stats.scores.length : 0,
          totalCakes: 1, // Toujours 1 gâteau par utilisateur par saison
          totalRatings: stats.scores.length,
        }));

        // Trier par note moyenne décroissante, puis par nombre de notes reçues
        rankingData.sort((a, b) => {
          if (Math.abs(a.averageScore - b.averageScore) < 0.01) {
            return b.totalRatings - a.totalRatings; // Plus de notes reçues = mieux classé en cas d'égalité
          }
          return b.averageScore - a.averageScore;
        });

        setRankings(rankingData);
      } catch (err) {
        console.error('Erreur lors de la récupération du classement:', err);
        setError('Impossible de charger le classement');
      } finally {
        setIsLoading(false);
      }
    }

    if (seasonId) {
      fetchRankings();
    }
  }, [seasonId]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (rankings.length === 0) {
    return (
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmojiEventsIcon color="primary" />
            Top 3 de la saison
          </Typography>
          <Typography color="text.secondary">
            Le classement sera disponible une fois que les notes de la saison seront révélées par l'administrateur.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return `${index + 1}`;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return '#FFD700'; // Gold
      case 1:
        return '#C0C0C0'; // Silver
      case 2:
        return '#CD7F32'; // Bronze
      default:
        return theme.palette.text.secondary;
    }
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEventsIcon color="primary" />
          Top 3 de la saison
        </Typography>
        
        <Stack spacing={2}>
          {rankings.slice(0, 3).map((ranking, index) => (
            <Box
              key={ranking.user.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: 'action.hover',
                border: index === 0 ? `2px solid ${getRankColor(0)}` : '1px solid transparent',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              {/* Rang */}
              <Box
                sx={{
                  minWidth: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: getRankColor(index),
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                }}
              >
                {getRankIcon(index)}
              </Box>

              {/* Avatar et nom */}
              <Avatar
                src={ranking.user.avatar_url}
                sx={{ width: 40, height: 40 }}
              >
                {ranking.user.name.charAt(0).toUpperCase()}
              </Avatar>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {ranking.user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {ranking.totalRatings} note{ranking.totalRatings > 1 ? 's' : ''} reçue{ranking.totalRatings > 1 ? 's' : ''}
                </Typography>
              </Box>

              {/* Score moyen */}
              <Box sx={{ textAlign: 'right' }}>
                <Chip
                  label={`${ranking.averageScore.toFixed(1)}/5`}
                  color={index === 0 ? 'primary' : 'default'}
                  variant={index === 0 ? 'filled' : 'outlined'}
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                  }}
                />
              </Box>
            </Box>
          ))}
        </Stack>
        
        {rankings.length > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Podium basé sur la note moyenne du gâteau soumis par chaque participant
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
