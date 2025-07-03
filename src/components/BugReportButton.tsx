"use client"

import { Fab, Tooltip } from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';

const BugReportButton = () => {

  return (
    <>
      <Tooltip title="Report a bug">
        <Fab 
          color="primary" 
          href="https://github.com/phasmatic3d/saw/issues"
          target='_blank'
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