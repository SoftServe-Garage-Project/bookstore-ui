import React, { useEffect, useState } from "react";
import {
  promoCodeService,
  PromoCode,
} from "../../services/promoCodeService/promoCodeService";
import { StatusModal } from "../../components/StatusModal/StatusModal";
import Button from "../../components/Button/Button";
import Header from "../../components/Header/Header";
import styles from "./PromoCodePage.module.css";

const PromoCodePage = () => {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPromo, setCurrentPromo] = useState<Partial<PromoCode> | null>(
    null
  );

  const loadPromos = async () => {
    try {
      const data = await promoCodeService.getAll();
      setPromos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromos();
  }, []);

  const handleToggle = async (id: number, currentStatus: boolean) => {
    await promoCodeService.toggleActive(id, !currentStatus);
    loadPromos();
  };

  const openEdit = (promo?: PromoCode) => {
    setCurrentPromo(
      promo || {
        code: "",
        discountPercentage: 10,
        isActive: true,
        validFrom: new Date().toISOString().slice(0, 16),
      }
    );
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!currentPromo) return;
    try {
      if (currentPromo.id) {
        await promoCodeService.update(currentPromo.id, currentPromo);
      } else {
        await promoCodeService.create(currentPromo);
      }
      setIsModalOpen(false);
      loadPromos();
    } catch (e) {
      alert("Error saving promo code");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header isMenuOpen={false} onToggleMenu={() => {}} />
      <main className={styles.container}>
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>Promo Codes</h1>
          {!loading && (
            <Button onClick={() => openEdit()}>+ Create New Promo</Button>
          )}
        </header>

        {loading ? (
          <div className={styles.loader}>Loading promos...</div>
        ) : promos.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No promo codes yet</h2>
            <p>Create your first promotional code to get started.</p>
            <Button onClick={() => openEdit()}>Create First Promo</Button>
          </div>
        ) : (
          <div className={styles.promoGrid}>
            {promos.map((promo) => (
              <div
                key={promo.id}
                className={`${styles.promoCard} ${!promo.isActive ? styles.inactive : ""}`}
              >
                <div className={styles.promoInfo}>
                  <div className={styles.badge}>
                    {promo.discountPercentage}% OFF
                  </div>
                  <h3 className={styles.promoCodeText}>{promo.code}</h3>
                  <p className={styles.description}>
                    {promo.description || "No description"}
                  </p>
                  <p className={styles.expiry}>
                    Valid from: {new Date(promo.validFrom).toLocaleDateString()}
                  </p>
                </div>

                <div className={styles.promoActions}>
                  <div className={styles.usageInfo}>
                    <span className={styles.label}>Usage</span>
                    <span className={styles.usageValue}>
                      {promo.currentUses} / {promo.maxUses || "∞"}
                    </span>
                  </div>
                  <div className={styles.btnGroup}>
                    <button
                      className={styles.editBtn}
                      onClick={() => openEdit(promo)}
                    >
                      Edit
                    </button>
                    <button
                      className={
                        promo.isActive
                          ? styles.deactivateBtn
                          : styles.activateBtn
                      }
                      onClick={() => handleToggle(promo.id, promo.isActive)}
                    >
                      {promo.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <StatusModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          type={currentPromo?.id ? "success" : "success"}
          title={currentPromo?.id ? "Edit Promo Code" : "Create New Promo"}
          buttonText="Save Changes"
          message={
            <div className={styles.modalForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Promo Code</label>
                  <input
                    value={currentPromo?.code || ""}
                    onChange={(e) =>
                      setCurrentPromo({
                        ...currentPromo!,
                        code: e.target.value,
                      })
                    }
                    placeholder="e.g. SUMMER2026"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Discount %</label>
                  <input
                    type="number"
                    value={currentPromo?.discountPercentage || ""}
                    onChange={(e) =>
                      setCurrentPromo({
                        ...currentPromo!,
                        discountPercentage: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Min Order ($)</label>
                  <input
                    type="number"
                    value={currentPromo?.minOrderAmount || ""}
                    onChange={(e) =>
                      setCurrentPromo({
                        ...currentPromo!,
                        minOrderAmount: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Max Uses ($)</label>
                  <input
                    type="number"
                    value={currentPromo?.maxUses || ""}
                    onChange={(e) =>
                      setCurrentPromo({
                        ...currentPromo!,
                        maxUses: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <Button variant="primary" onClick={handleSave} fullWidth>
                Confirm & Save
              </Button>
            </div>
          }
        />
      </main>
    </div>
  );
};

export default PromoCodePage;
