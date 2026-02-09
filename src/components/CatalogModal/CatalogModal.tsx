import { useState, useEffect } from "react";
import styles from "./CatalogModal.module.css";
import Button from "../Button/Button";
import * as service from "../../services/bookService/bookService";

type CatalogType = "genres" | "languages" | "ageGroups";

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType: CatalogType;
}

export default function CatalogModal({
  isOpen,
  onClose,
  initialType,
}: CatalogModalProps) {
  const [activeTab, setActiveTab] = useState<CatalogType>(initialType);
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "genres") setItems(await service.fetchGenres());
      if (activeTab === "languages") setItems(await service.fetchLanguages());
      if (activeTab === "ageGroups") setItems(await service.fetchAgeGroups());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) loadData();
  }, [isOpen, activeTab]);

  const handleAdd = async () => {
    try {
      if (activeTab === "genres") await service.createGenre(newItem);
      if (activeTab === "languages") await service.createLanguage(newItem);
      if (activeTab === "ageGroups") await service.createAgeGroup(newItem);
      setNewItem({});
      loadData();
    } catch (err) {
      alert("Error adding item");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      if (activeTab === "genres") await service.deleteGenre(id);
      if (activeTab === "languages") await service.deleteLanguage(id);
      if (activeTab === "ageGroups") await service.deleteAgeGroup(id);
      loadData();
    } catch (err) {
      alert("Error. Item might be in use by books.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.tabs}>
          <button
            className={activeTab === "genres" ? styles.active : ""}
            onClick={() => setActiveTab("genres")}
          >
            Genres
          </button>
          <button
            className={activeTab === "languages" ? styles.active : ""}
            onClick={() => setActiveTab("languages")}
          >
            Languages
          </button>
          <button
            className={activeTab === "ageGroups" ? styles.active : ""}
            onClick={() => setActiveTab("ageGroups")}
          >
            Age Groups
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.addForm}>
            {activeTab === "languages" ? (
              <>
                <input
                  placeholder="Code (EN)"
                  value={newItem.code || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, code: e.target.value })
                  }
                />
                <input
                  placeholder="Name (English)"
                  value={newItem.name || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                />
              </>
            ) : (
              <>
                <input
                  placeholder="Name"
                  value={newItem.name || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                />
                <input
                  placeholder="Description"
                  value={newItem.description || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                />
              </>
            )}
            <Button onClick={handleAdd}>Add</Button>
          </div>

          <ul className={styles.list}>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              items.map((item, idx) => (
                <li key={idx} className={styles.item}>
                  <div>
                    <strong>{item.name || item.code}</strong>
                    <span>{item.description}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(item.code || item.name)}
                    className={styles.delBtn}
                  >
                    &times;
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
