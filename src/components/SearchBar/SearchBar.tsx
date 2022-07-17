import React, { memo, useCallback, useState } from "react";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Autocomplete from "@mui/material/Autocomplete";
import {
  AppBar,
  Avatar,
  Box,
  Card,
  CardContent,
  CardMedia,
  Divider,
  IconButton,
  Link,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  styled,
  Tooltip,
  Typography,
} from "@mui/material";
import AddressBook from "components/SearchBar/components/AddressBook";
import BlockheightChip from "components/SearchBar/components/BlockheightChip";
import SettingsIcon from "@mui/icons-material/Settings";
import { Logout, Settings } from "@mui/icons-material";
import HelpIcon from "@mui/icons-material/Help";
import useAccount from "hooks/useAccount";
import SLink from "components/SLink";
import JUPDialog from "components/JUPDialog";

const drawerWidth = 240;

const menuProps = {
  elevation: 0,
  sx: {
    overflow: "visible",
    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
    mt: 1.5,
    "& .MuiAvatar-root": {
      width: 32,
      height: 32,
      ml: -0.5,
      mr: 1,
    },
    "&:before": {
      content: '""',
      display: "block",
      position: "absolute",
      top: 0,
      right: 14,
      width: 10,
      height: 10,
      bgcolor: "background.paper",
      transform: "translateY(-50%) rotate(45deg)",
      zIndex: 0,
    },
  },
};

// Placeholder values for the autocomplete
const placeHolderVals = ["test", "hello"];

const SearchBar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [aboutMenuIsOpen, setAboutMenuIsOpen] = useState<boolean>(false);
  const open = Boolean(anchorEl);
  const { userLogout } = useAccount();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCloseAboutDialog = useCallback(() => {
    setAboutMenuIsOpen(false);
  }, []);

  return (
    <>
      <JUPDialog isOpen={aboutMenuIsOpen} closeFn={handleCloseAboutDialog}>
        <Box sx={{ height: "400px", width: "600px" }}>
          <StyledCard variant="outlined">
            <Stack sx={{ margin: "10px" }} direction="row">
              <CardMedia sx={{ objectFit: "scale-down" }} component={"img"} height="80" image="../assets/logo512.png"></CardMedia>
              <CardMedia sx={{ objectFit: "scale-down" }} component={"img"} height="80" image="../assets/unc_large.png"></CardMedia>
            </Stack>
            <CardContent>
              <StyledTypography>
                The Jupiter Project aims to make blockchain accessible and safe for everyone. Jupiter’s military-grade encryption helps ensure that
                user data is private and secure. Through our elite encryption capabilities, Jupiter can power secure dApps on public and private
                networks based on our client’s wishes.
              </StyledTypography>
              <StyledDivider />
              <StyledTypography>
                The Jupiter Wallet was designed and developed by Up North Coding, winners of the 2022 Jupiter Hackathon. Core developers for the
                wallet include:
              </StyledTypography>
              <StyledTypography>Nathan Bowers</StyledTypography>
              <StyledTypography>Vance Walsh</StyledTypography>
              <StyledDivider />
              <StyledTypography>
                For general development inquiries contact: <Link href="mailto:inqiury@upnorthcoding.com">inquiry@upnorthcoding.com</Link>
              </StyledTypography>
              <StyledTypography>
                For Jupiter related inquiries contact: <Link href="mailto:infop@sigwo.com">info@sigwo.com</Link>
              </StyledTypography>
            </CardContent>
          </StyledCard>
        </Box>
      </JUPDialog>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <SearchStack direction="row" spacing={2}>
          <Autocomplete
            sx={{ minWidth: 300, margin: "10px" }}
            size="small"
            freeSolo
            options={placeHolderVals.map((option) => option)}
            renderInput={(params) => <TextField {...params} label="Search" />}
          />
          <AddressBook />
          <BlockheightChip />
          <Tooltip title="Account settings">
            <IconButton onClick={handleClick} color="primary">
              <SettingsIcon></SettingsIcon>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={menuProps}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem>
              <Avatar /> My account
            </MenuItem>
            <Divider />
            <MenuItem>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <MenuItem divider onClick={() => setAboutMenuIsOpen(true)}>
              <ListItemIcon>
                <HelpIcon fontSize="small" />
              </ListItemIcon>
              About
            </MenuItem>
            <SLink href={"/"}>
              <MenuItem onClick={userLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <StyledLogoutText primary="Logout" />
              </MenuItem>
            </SLink>
          </Menu>
        </SearchStack>
      </AppBar>
    </>
  );
};
const StyledCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(4),
  marginTop: theme.spacing(5),
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(2),
}));

// MUST: Figure out how to style this with the theme (theme.palette.primary has no effect)
const StyledLogoutText = styled(ListItemText)(({ theme }) => ({
  "& .MuiListItemText-primary": {
    color: "red",
  },
}));

const SearchStack = styled(Stack)(() => ({
  justifyContent: "center",
  alignItems: "center",
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(2),
}));

export default memo(SearchBar);
