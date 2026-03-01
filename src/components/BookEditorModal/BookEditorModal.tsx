import { useState, useEffect, ChangeEvent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Typography,
  Grid,
  Stack,
  Divider,
  alpha,
  SxProps,
  Theme,
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

import {
  Book,
  Author,
  Genre,
  AgeGroup,
  fetchLanguages,
  fetchGenres,
  fetchAgeGroups,
} from "../../services/bookService/bookService";


const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    backgroundColor: alpha(
      theme.palette.mode === "dark" ? theme.palette.common.white : theme.palette.common.black,
      0.04
    ),
    transition: "all 0.2s ease-in-out",
    "& fieldset": { borderColor: theme.palette.divider },
    "&:hover fieldset": { borderColor: alpha(theme.palette.primary.main, 0.4) },
    "&.Mui-focused": {
      backgroundColor: alpha(
        theme.palette.mode === "dark" ? theme.palette.common.white : theme.palette.common.black,
        0.07
      ),
      "& fieldset": { borderWidth: "1px !important" },
    },
  },
  "& .MuiInputBase-input": {
    "&:-webkit-autofill": {
      WebkitBoxShadow: `0 0 0 100px ${theme.palette.background.paper} inset !important`,
    },
  },
}));

const SectionLabel = styled(Typography)(({ theme }) => ({
  variant: "overline",
  color: theme.palette.primary.main,
  fontWeight: 700,
  letterSpacing: "0.1em",
  marginBottom: theme.spacing(1),
  display: "block",
}));

const AuthorRow = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
}));


const styles: Record<string, SxProps<Theme>> = {
  dialogPaper: {
    borderRadius: 3,
    backgroundImage: "none",
    bgcolor: "background.paper",
  },
  actions: {
    p: 3,
    justifyContent: "space-between",
    borderTop: "1px solid",
    borderColor: "divider",
  },
};



interface BookEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  book?: Book | null;
  onSave: (bookData: Partial<Book>) => void;
  onDelete?: (id: number) => void;
}

const DEFAULT_BOOK: Omit<Book, "id"> = {
  title: "",
  description: "",
  genre: "",
  ageGroup: "",
  publishedYear: new Date().getFullYear(),
  languageCode: "",
  authors: [{ firstName: "", lastName: "" }],
  price: 0,
  stockQuantity: 0,
  discountPercentage: 0,
  pageCount: 0,
  coverImageUrl: "",
};

export default function BookEditorModal({ isOpen, onClose, book, onSave, onDelete }: BookEditorModalProps) {
  const [formData, setFormData] = useState<Partial<Book>>(DEFAULT_BOOK);
  const [languages, setLanguages] = useState<{ code: string; name: string }[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);

  useEffect(() => {
    if (isOpen) {
      (async () => {
        try {
          const [langs, gens, ages] = await Promise.all([
            fetchLanguages(),
            fetchGenres(),
            fetchAgeGroups(),
          ]);
          setLanguages(langs);
          setGenres(gens);
          setAgeGroups(ages);
        } catch (err) { console.error(err); }
      })();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (book) {
        const data = JSON.parse(JSON.stringify(book));
        const found = languages.find(l => l.name === data.languageCode || l.code === data.languageCode);
        if (found) data.languageCode = found.code;
        setFormData(data);
      } else {
        setFormData({ ...DEFAULT_BOOK });
      }
    }
  }, [isOpen, book, languages]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleAuthorChange = (index: number, field: keyof Author, value: string) => {
    const newAuthors = [...(formData.authors || [])];
    newAuthors[index] = { ...newAuthors[index], [field]: value };
    setFormData({ ...formData, authors: newAuthors });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: styles.dialogPaper }}>
      <DialogTitle sx={{ fontWeight: 800, pr: 6 }}>
        {book ? `Edit: ${book.title}` : "Add New Book"}
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 12, top: 12, color: "text.secondary" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <SectionLabel variant="overline">Basic Information</SectionLabel>
            <Stack spacing={2.5}>
              <StyledTextField fullWidth label="Book Title" name="title" value={formData.title} onChange={handleChange} required />
              <StyledTextField fullWidth label="Description" name="description" value={formData.description} onChange={handleChange} multiline rows={3} />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <SectionLabel variant="overline" sx={{ mb: 0 }}>Authors</SectionLabel>
              <Button size="small" startIcon={<AddIcon />} onClick={() => setFormData({
                ...formData,
                authors: [...(formData.authors || []), { firstName: "", lastName: "" }],
              })}>
                Add Author
              </Button>
            </Box>
            <Stack spacing={1.5}>
              {formData.authors?.map((author, index) => (
                <AuthorRow key={index}>
                  <StyledTextField label="First Name" size="small" fullWidth value={author.firstName} onChange={(e) => handleAuthorChange(index, "firstName", e.target.value)} />
                  <StyledTextField label="Last Name" size="small" fullWidth value={author.lastName} onChange={(e) => handleAuthorChange(index, "lastName", e.target.value)} />
                  {index > 0 && (
                    <IconButton color="error" size="small" onClick={() => setFormData({
                      ...formData,
                      authors: formData.authors?.filter((_, i) => i !== index),
                    })}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </AuthorRow>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12 }}><Divider /></Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <StyledTextField select fullWidth label="Genre" name="genre" value={formData.genre} onChange={handleChange} required>
              {genres.map((g) => <MenuItem key={g.name} value={g.name}>{g.name}</MenuItem>)}
            </StyledTextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <StyledTextField select fullWidth label="Age Group" name="ageGroup" value={formData.ageGroup} onChange={handleChange} required>
              {ageGroups.map((a) => <MenuItem key={a.name} value={a.name}>{a.name}</MenuItem>)}
            </StyledTextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <StyledTextField select fullWidth label="Language" name="languageCode" value={formData.languageCode} onChange={handleChange} required>
              {languages.map((l) => <MenuItem key={l.code} value={l.code}>{l.name}</MenuItem>)}
            </StyledTextField>
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}><StyledTextField fullWidth type="number" label="Year" name="publishedYear" value={formData.publishedYear} onChange={handleChange} /></Grid>
          <Grid size={{ xs: 6, md: 3 }}><StyledTextField fullWidth type="number" label="Pages" name="pageCount" value={formData.pageCount} onChange={handleChange} /></Grid>
          <Grid size={{ xs: 6, md: 3 }}><StyledTextField fullWidth type="number" label="Price ($)" name="price" value={formData.price} onChange={handleChange} /></Grid>
          <Grid size={{ xs: 6, md: 3 }}><StyledTextField fullWidth type="number" label="Stock" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} /></Grid>
          <Grid size={{ xs: 12 }}>
            <StyledTextField fullWidth label="Cover Image URL" name="coverImageUrl" value={formData.coverImageUrl || ""} onChange={handleChange} />
          </Grid>
          
        </Grid>
      </DialogContent>

      <DialogActions sx={styles.actions}>
        <Box>
          {book && onDelete && (
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(book.id)}>
              Delete Book
            </Button>
          )}
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button color="inherit" onClick={onClose}>Cancel</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={() => onSave(formData)} sx={{ px: 4, borderRadius: 2 }}>
            Save Changes
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}