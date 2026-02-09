import { useState, useEffect } from "react";
import {
  Book,
  Author,
  Genre,
  AgeGroup,
  fetchLanguages,
  fetchGenres,
  fetchAgeGroups,
} from "../../services/bookService/bookService";
import Button from "../Button/Button";
import styles from "./BookEditorModal.module.css";

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

export default function BookEditorModal({
  isOpen,
  onClose,
  book,
  onSave,
  onDelete,
}: BookEditorModalProps) {
  const [formData, setFormData] = useState<Partial<Book>>(DEFAULT_BOOK);

  const [languages, setLanguages] = useState<{ code: string; name: string }[]>(
    []
  );
  const [genres, setGenres] = useState<Genre[]>([]);
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);

  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          const [langs, gens, ages] = await Promise.all([
            fetchLanguages(),
            fetchGenres(),
            fetchAgeGroups(),
          ]);
          setLanguages(langs);
          setGenres(gens);
          setAgeGroups(ages);
        } catch (err) {
          console.error("Error loading dictionaries:", err);
        }
      };
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (book) {
        const data = JSON.parse(JSON.stringify(book));
        if (languages.length > 0) {
          const found = languages.find(
            (l) => l.name === data.languageCode || l.code === data.languageCode
          );
          if (found) data.languageCode = found.code;
        }

        setFormData(data);
      } else {
        setFormData({ ...DEFAULT_BOOK });
      }
    }
  }, [isOpen, book, languages]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleAuthorChange = (
    index: number,
    field: keyof Author,
    value: string
  ) => {
    const newAuthors = [...(formData.authors || [])];
    newAuthors[index] = { ...newAuthors[index], [field]: value };
    setFormData({ ...formData, authors: newAuthors });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{book ? `Edit: ${book.title}` : "Add New Book"}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
          }}
          className={styles.form}
        >
          <div className={styles.section}>
            <label>Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <label>Authors</label>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    authors: [
                      ...(formData.authors || []),
                      { firstName: "", lastName: "" },
                    ],
                  })
                }
                className={styles.addBtn}
              >
                + Add Author
              </button>
            </div>
            {formData.authors?.map((author, index) => (
              <div key={index} className={styles.row}>
                <input
                  placeholder="First Name"
                  value={author.firstName}
                  onChange={(e) =>
                    handleAuthorChange(index, "firstName", e.target.value)
                  }
                  required
                />
                <input
                  placeholder="Last Name"
                  value={author.lastName}
                  onChange={(e) =>
                    handleAuthorChange(index, "lastName", e.target.value)
                  }
                  required
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        authors: formData.authors?.filter(
                          (_, i) => i !== index
                        ),
                      })
                    }
                    className={styles.removeBtn}
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className={styles.grid}>
            <div className={styles.group}>
              <label>Genre</label>
              <select
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                required
              >
                <option value="">Select genre</option>
                {genres.map((g) => (
                  <option key={g.name} value={g.name}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.group}>
              <label>Age Group</label>
              <select
                name="ageGroup"
                value={formData.ageGroup}
                onChange={handleChange}
                required
              >
                <option value="">Select age group</option>
                {ageGroups.map((a) => (
                  <option key={a.name} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.group}>
              <label>Language</label>
              <select
                name="languageCode"
                value={formData.languageCode}
                onChange={handleChange}
                required
              >
                <option value="">Select language</option>
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.group}>
              <label>Published Year</label>
              <input
                type="number"
                name="publishedYear"
                value={formData.publishedYear}
                onChange={handleChange}
              />
            </div>

            <div className={styles.group}>
              <label>Page Count</label>
              <input
                type="number"
                name="pageCount"
                value={formData.pageCount}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.group}>
              <label>Price ($)</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
              />
            </div>
            <div className={styles.group}>
              <label>Discount (%)</label>
              <input
                type="number"
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleChange}
              />
            </div>
            <div className={styles.group}>
              <label>Stock</label>
              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.section}>
            <label>Cover Image URL</label>
            <input
              name="coverImageUrl"
              value={formData.coverImageUrl || ""}
              onChange={handleChange}
            />
          </div>

          <div className={styles.actions}>
            {book && onDelete && (
              <Button
                type="button"
                variant="error"
                onClick={() => onDelete(book.id)}
              >
                Delete
              </Button>
            )}
            <div className={styles.rightActions}>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Book Data</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
