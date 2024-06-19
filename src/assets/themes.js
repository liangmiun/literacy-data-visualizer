import { createTheme } from "@mui/material/styles";
import { grey, brown } from "@mui/material/colors";
import SvgIcon from "@mui/material/SvgIcon";

export const grayTheme = createTheme({
  palette: {
    primary: {
      light: grey[300],
      main: grey[500],
      dark: grey[700],
      darker: grey[900],
    },
    secondary: {
      light: brown[500],
      main: brown[500],
      dark: brown[500],
      darker: brown[500],
    },
  },
});

export const EmptyCheckBoxBlankIcon = ({ fontSize }) => {
  return (
    <SvgIcon fontSize={fontSize}>
      <svg focusable="false" aria-hidden="true" data-testid="CheckBoxBlankIcon">
        <path
          d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5"
          fill={grayTheme.palette.primary.main}
        ></path>
      </svg>
    </SvgIcon>
  );
};
