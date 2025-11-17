import { Container, Typography, Box } from '@mui/material';

function Mapa() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mapa
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visualización de mapas de gateways y sensores
        </Typography>
      </Box>
    </Container>
  );
}

export default Mapa;

