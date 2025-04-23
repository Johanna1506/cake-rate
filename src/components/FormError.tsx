import { Typography } from '@mui/material';

interface FormErrorProps {
    error?: string;
    touched?: boolean;
}

export const FormError = ({ error, touched }: FormErrorProps) => {
    if (!error || !touched) return null;

    return (
        <Typography
            color="error"
            variant="caption"
            sx={{
                display: 'block',
                mt: 0.5,
                ml: 2,
                fontSize: '0.75rem'
            }}
        >
            {error}
        </Typography>
    );
};