import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Typography,
  Divider,
  alpha,
  SxProps,
  Theme,
  Tooltip,
  Snackbar,
  Alert,
  DialogActions,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import * as service from "../../services/bookService/bookService";

// --- ТИПЫ ---
type CatalogType = "genres" | "languages" | "ageGroups";

interface CatalogData {
  genres: any[];
  languages: any[];
  ageGroups: any[];
}

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType: CatalogType;
}

// --- СТИЛИЗОВАННЫЕ КОМПОНЕНТЫ ---
const StyledTextField = styled(TextField)(({ theme }) => ({
  mb: 1,
  "& .MuiOutlinedInput-root": {
    backgroundColor: alpha(
      theme.palette.mode === "dark"
        ? theme.palette.common.white
        : theme.palette.common.black,
      0.05
    ),
    "&.Mui-focused": {
      backgroundColor: alpha(
        theme.palette.mode === "dark"
          ? theme.palette.common.white
          : theme.palette.common.black,
        0.08
      ),
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.divider,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: alpha(theme.palette.primary.main, 0.5),
    },
  },
}));

const styles: Record<string, SxProps<Theme>> = {
  dialogPaper: {
    borderRadius: 3,
    backgroundImage: "none",
  },
  headerActions: {
    position: "absolute",
    right: 8,
    top: 8,
    display: "flex",
    gap: 0.5,
    zIndex: 1,
  },
  listContainer: {
    mt: 1,
    maxHeight: "350px",
    overflowY: "auto",
    minHeight: "100px",
  },
  deleteBtn: {
    opacity: 0.8,
    transition: "all 0.2s",
    "&:hover": { opacity: 1, bgcolor: "error.light", color: "white" },
  },
};

export default function CatalogModal({
  isOpen,
  onClose,
  initialType,
}: CatalogModalProps) {
  const [activeTab, setActiveTab] = useState<CatalogType>(initialType);
  const [data, setData] = useState<CatalogData>({
    genres: [],
    languages: [],
    ageGroups: [],
  });
  const [newItem, setNewItem] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const showMsg = (
    message: string,
    severity: "success" | "error" = "success"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialType);
    }
  }, [isOpen, initialType]);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [genres, languages, ageGroups] = await Promise.all([
        service.fetchGenres(),
        service.fetchLanguages(),
        service.fetchAgeGroups(),
      ]);
      setData({ genres, languages, ageGroups });
    } catch (err) {
      console.error("Failed to load catalog data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) loadAllData();
  }, [isOpen, loadAllData]);

  const handleAdd = async () => {
    try {
      if (activeTab === "genres") await service.createGenre(newItem);
      if (activeTab === "languages") await service.createLanguage(newItem);
      if (activeTab === "ageGroups") await service.createAgeGroup(newItem);
      setNewItem({});
      await loadAllData();
      showMsg("Item added successfully", "success");
    } catch (err) {
      showMsg("Error adding item", "error");
    }
  };

  const askDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmAndExecuteDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      if (activeTab === "genres") await service.deleteGenre(deleteConfirmId);
      if (activeTab === "languages")
        await service.deleteLanguage(deleteConfirmId);
      if (activeTab === "ageGroups")
        await service.deleteAgeGroup(deleteConfirmId);

      showMsg("Item deleted successfully");
      loadAllData();
    } catch (err) {
      showMsg("Delete failed. Item might be in use by books.", "error");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const currentItems = data[activeTab] || [];

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: styles.dialogPaper }}
      >
        <Box sx={styles.headerActions}>
          <Tooltip title="Refresh data">
            <IconButton onClick={loadAllData} size="small" color="primary">
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <DialogTitle sx={{ pb: 0, fontWeight: 700 }}>
          Catalog Management
        </DialogTitle>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 1 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => {
              setActiveTab(val);
              setNewItem({});
            }}
            variant="fullWidth"
          >
            <Tab
              label="Genres"
              value="genres"
              sx={{ textTransform: "none", fontWeight: 600 }}
            />
            <Tab
              label="Languages"
              value="languages"
              sx={{ textTransform: "none", fontWeight: 600 }}
            />
            <Tab
              label="Age Groups"
              value="ageGroups"
              sx={{ textTransform: "none", fontWeight: 600 }}
            />
          </Tabs>
        </Box>

        <DialogContent sx={{ mt: 2 }}>
          {" "}
          {/* форма додавання*/}
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}
          >
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              {activeTab === "languages" ? (
                <>
                  <StyledTextField
                    size="small"
                    label="Code (EN)"
                    sx={{ flex: 1 }}
                    value={newItem.code || ""}
                    onChange={(e) =>
                      setNewItem({ ...newItem, code: e.target.value })
                    }
                  />
                  <StyledTextField
                    size="small"
                    label="Name"
                    sx={{ flex: 2 }}
                    value={newItem.name || ""}
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                  />
                </>
              ) : (
                <>
                  <StyledTextField
                    size="small"
                    label="Name"
                    fullWidth={activeTab === "genres"}
                    sx={{ flex: 1 }}
                    value={newItem.name || ""}
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                  />
                  {activeTab === "ageGroups" && (
                    <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                      <StyledTextField
                        size="small"
                        label="Min Age"
                        type="number"
                        sx={{ flex: 1 }}
                        value={newItem.minAge || ""}
                        onChange={(e) =>
                          setNewItem({ ...newItem, minAge: e.target.value })
                        }
                      />
                      <StyledTextField
                        size="small"
                        label="Max Age"
                        type="number"
                        sx={{ flex: 1 }}
                        value={newItem.maxAge || ""}
                        onChange={(e) =>
                          setNewItem({ ...newItem, maxAge: e.target.value })
                        }
                      />
                    </Box>
                  )}
                  <StyledTextField
                    size="small"
                    label="Description"
                    fullWidth
                    value={newItem.description || ""}
                    onChange={(e) =>
                      setNewItem({ ...newItem, description: e.target.value })
                    }
                  />
                </>
              )}
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              disabled={!newItem.name && !newItem.code}
              sx={{ alignSelf: "flex-end", borderRadius: 2 }}
            >
              Add
            </Button>
          </Box>
          <Divider />
          <Box sx={styles.listContainer}>
            {" "}
            {/* список всього */}
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress size={30} />
              </Box>
            ) : (
              <List disablePadding>
                {currentItems.map((item, idx) => (
                  <ListItem
                    key={item.id || idx}
                    divider
                    secondaryAction={
                      <IconButton
                        edge="end"
                        color="error"
                        size="small"
                        onClick={() => askDelete(item.id)}
                        sx={styles.deleteBtn}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={item.name || item.code}
                      secondary={
                        item.description ||
                        (item.minAge !== undefined
                          ? `Age range: ${item.minAge} - ${item.maxAge}`
                          : `Code: ${item.code}`)
                      }
                      primaryTypographyProps={{
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                      secondaryTypographyProps={{ fontSize: "0.75rem" }}
                    />
                  </ListItem>
                ))}
                {currentItems.length === 0 && !isLoading && (
                  <Typography
                    variant="body2"
                    sx={{ textAlign: "center", py: 4, color: "text.secondary" }}
                  >
                    Nothing here yet.
                  </Typography>
                )}
              </List>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* удалялка */}
      <Dialog
        open={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this item? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button
            onClick={() => setDeleteConfirmId(null)}
            sx={{ color: "text.secondary", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmAndExecuteDelete}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
