import { memo } from "react";
import {
  Box,
  Drawer,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  FormControl,
  Select,
  Button,
  Skeleton,
  useTheme,
  useMediaQuery,
  IconButton,
  Toolbar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SortIcon from "@mui/icons-material/Sort";
import CategoryIcon from "@mui/icons-material/Category";
import { useGenres } from "../../hooks/useGenres/useGenres";

const SORT_OPTIONS = [
  { label: "Price: Low to High", value: "price,asc" },
  { label: "Price: High to Low", value: "price,desc" },
  { label: "Newest First", value: "publishedYear,desc" },
  { label: "Name: A-Z", value: "title,asc" },
] as const;

interface SidePanelProps {
  selectedGenre?: string;
  selectedSort?: string;
  onGenreChange: (genre: string | undefined) => void;
  onSortChange: (sort: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const SidePanel = ({
  selectedGenre,
  selectedSort = "price,asc",
  onGenreChange,
  onSortChange,
  isOpen,
  onClose,
}: SidePanelProps) => {
  const { genres, isLoading} = useGenres();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleGenreSelect = (genreName?: string) => {
    onGenreChange(genreName);
    if (isMobile) onClose();
  };

  const drawerContent = (
    <Box
      sx={{
        width: 280,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 3,
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 3,
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" fontWeight={700} color="primary">
          Filters
        </Typography>
        {isMobile && (
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: "auto", pr: 1 }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="overline"
            sx={{
              fontWeight: 800,
              color: "text.secondary",
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <SortIcon fontSize="small" /> Sort By
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value)}
              sx={{ borderRadius: 3 }}
            >
              {SORT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box>
          <Typography
            variant="overline"
            sx={{
              fontWeight: 800,
              color: "text.secondary",
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <CategoryIcon fontSize="small" /> Genres
          </Typography>
          <List sx={{ p: 0 }}>
            <ListItem disablePadding>
              <ListItemButton
                selected={!selectedGenre}
                onClick={() => handleGenreSelect(undefined)}
                sx={{ borderRadius: 2, mb: 0.5 }}
              >
                <ListItemText
                  primary="All Books"
                  primaryTypographyProps={{
                    fontSize: "0.9rem",
                    fontWeight: !selectedGenre ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>

            {isLoading
              ? [1, 2, 3, 4, 5].map((i) => (
                  <Skeleton
                    key={i}
                    variant="text"
                    height={40}
                    sx={{ my: 0.5, borderRadius: 2 }}
                  />
                ))
              : genres.map((genre) => (
                  <ListItem key={genre.name} disablePadding>
                    <ListItemButton
                      selected={selectedGenre === genre.name}
                      onClick={() => handleGenreSelect(genre.name)}
                      sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        "&.Mui-selected": {
                          bgcolor: "primary.main",
                          color: "white",
                          "&:hover": { bgcolor: "primary.dark" },
                        },
                      }}
                    >
                      <ListItemText
                        primary={genre.name}
                        primaryTypographyProps={{
                          fontSize: "0.9rem",
                          fontWeight: selectedGenre === genre.name ? 600 : 500,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
          </List>
        </Box>
      </Box>

      <Box sx={{ pt: 2, mt: "auto" }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={onClose}
          sx={{
            borderRadius: 3,
            py: 1.5,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Show Results
        </Button>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      anchor="left"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 280,
          borderRight: "1px solid",
          borderColor: "divider",
          zIndex: (theme) => theme.zIndex.appBar - 1,
          boxShadow: isMobile ? 10 : 0,
        },
      }}
    >
      {!isMobile && <Toolbar />}
      {drawerContent}
    </Drawer>
  );
};

export default memo(SidePanel);
