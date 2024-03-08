import { createTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

export const greyTheme = createTheme({
  palette: {
    primary: {
      light: grey[300],
      main: grey[500],
      dark: grey[700],
      darker: grey[900],
    },
  },
});
