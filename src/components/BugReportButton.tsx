"use client"

import { Fab, Tooltip } from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';
import { useTheme } from "@mui/material/styles";

const BugReportButton = () => {
  const theme = useTheme();

  return (
    <>
      <Tooltip title="Report an issue" slotProps={{tooltip: { sx: {color: `${theme.palette.text.primary}`, }}}}>
        <Fab 
          color="primary" 
          href="https://github.com/phasmatic3d/saw/issues"
          target='_blank'
          role="link"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <BugReportIcon />
        </Fab>
      </Tooltip>
    </>
  );
};

export default BugReportButton;