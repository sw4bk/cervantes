import { Container, Typography, Box } from '@mui/material';

function Grupos() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Grupos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión de grupos
        </Typography>
      </Box>
    </Container>
  );
}

export default Grupos;

