import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Stack,
  CardActionArea,
  alpha,
  SxProps,
  Theme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Book } from "../../services/bookService/bookService";

interface BookCardProps {
  book: Book;
  disableLink?: boolean;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "translateY(-4px)",
    borderColor: theme.palette.primary.light,
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 12px 32px rgba(0,0,0,0.5)"
        : "0 12px 32px rgba(44, 36, 32, 0.12)",
  },
}));

const CoverWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  paddingTop: "140%",
  width: "100%",
  backgroundColor: theme.palette.action.hover,
  overflow: "hidden",
}));

const StyledCardMedia = styled(CardMedia)({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transition: "transform 0.5s ease",
  "&:hover": {
    transform: "scale(1.05)",
  },
}) as typeof CardMedia;

const MultiLineEllipsis = styled(Typography)<{ lines: number }>(({ lines }) => ({
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
}));


const styles: Record<string, SxProps<Theme>> = {
  actionArea: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    borderRadius: "inherit",
  },
  genreChip: {
    height: 20,
    fontSize: "0.65rem",
    fontWeight: 700,
    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
    color: "primary.main",
    border: "none",
  },
  ageChip: {
    height: 20,
    fontSize: "0.65rem",
    borderColor: "divider",
  },
  priceContainer: {
    mt: "auto",
    pt: 2,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
};

export default function BookCard({ book, disableLink = false }: BookCardProps) {

  const originalPrice =
    book.discountPercentage > 0
      ? (book.price / (1 - book.discountPercentage / 100)).toFixed(2)
      : null;

  return (
    <StyledCard elevation={0}>
      <CardActionArea
        component={disableLink ? "div" : Link}
        to={disableLink ? undefined : `/book/${book.id}`}
        sx={styles.actionArea}
      >
        <CoverWrapper>
          {book.coverImageUrl ? (
            <StyledCardMedia component="img" image={book.coverImageUrl} alt={book.title} />
          ) : (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                color: "text.disabled",
              }}
            >
              <Typography variant="caption">No Cover</Typography>
            </Box>
          )}
        </CoverWrapper>

        <CardContent sx={{ flexGrow: 1, p: 2, display: "flex", flexDirection: "column" }}>
          <Stack direction="row" spacing={0.5} sx={{ mb: 1.5 }}>
            <Chip label={book.genre} size="small" sx={styles.genreChip} />
            <Chip label={book.ageGroup} size="small" variant="outlined" sx={styles.ageChip} />
          </Stack>

          <MultiLineEllipsis variant="h6" lines={2} sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.2 }}>
            {book.title}
          </MultiLineEllipsis>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: "0.8rem", fontStyle: "italic" }}>
            by {book.authors.map((a) => `${a.firstName} ${a.lastName}`).join(", ")}
          </Typography>

          <MultiLineEllipsis variant="body2" color="text.secondary" lines={3} sx={{ fontSize: "0.8rem" }}>
            {book.description}
          </MultiLineEllipsis>

          <Box sx={styles.priceContainer}>
            <Box>
              {originalPrice && (
                <Typography
                  variant="caption"
                  sx={{ textDecoration: "line-through", color: "text.disabled", display: "block", lineHeight: 1 }}
                >
                  ${originalPrice}
                </Typography>
              )}
              <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main", lineHeight: 1 }}>
                ${book.price.toFixed(2)}
              </Typography>
            </Box>

            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                color: book.stockQuantity > 0 ? "success.main" : "error.main",
              }}
            >
              {book.stockQuantity > 0 ? `${book.stockQuantity} in stock` : "Out of stock"}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </StyledCard>
  );
}