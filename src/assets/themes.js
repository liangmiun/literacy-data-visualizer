import { createTheme } from "@mui/material/styles";
import { grey, brown } from "@mui/material/colors";

export const greyTheme = createTheme({
  palette: {
    primary: {
      light: grey[500],
      main: grey[500],
      dark: grey[500],
      darker: grey[500],
    },
    secondary: {
      light: brown[500],
      main: brown[500],
      dark: brown[500],
      darker: brown[500],
    },
  },
});

export const oldGreyTheme = createTheme({
  components: {
    // Override styles for MUI Checkbox
    MuiCheckbox: {
      styleOverrides: {
        root: {
          // Apply grey color for unchecked state
          color: brown[500],
          "&.Mui-checked": {
            // Keep or enhance grey color for checked state
            color: brown[500],
          },
        },
      },
    },
  },
});
