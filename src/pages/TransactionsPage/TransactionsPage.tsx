import React, { useEffect, useState } from "react";
import { transactionService, TransactionPageResponse, BalanceResponse } from "../../services/transactionService/transactionService";
import Button from "../../components/Button/Button";
import Header from "../../components/Header/Header";
import Pagination from "../../components/Pagination/Pagination";
import { StatusModal, ModalType } from "../../components/StatusModal/StatusModal";
import styles from "./TransactionsPage.module.css";
import walletIcon from "../../assets/icons/package.svg";

const TransactionsPage = () => {
  const [data, setData] = useState<TransactionPageResponse | null>(null);
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [modal, setModal] = useState({
    isOpen: false,
    type: "success" as ModalType,
    title: "",
    message: ""
  });

  const loadData = async (page: number = 0) => {
    try {
      setLoading(true);
      const [transData, balData] = await Promise.all([
        transactionService.getTransactions(page),
        transactionService.getBalance()
      ]);
      setData(transData);
      setBalance(balData);
    } catch (error) {
      console.error("Load failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(0); }, []);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(topUpAmount);
    if (!amount || amount <= 0) return;

    try {
      await transactionService.topUp(amount);
      setModal({
        isOpen: true,
        type: "success",
        title: "Success!",
        message: `Successfully deposited $${amount.toFixed(2)} to your account.`
      });
      setTopUpAmount("");
      loadData(data?.number || 0);
    } catch (err) {
      setModal({ isOpen: true, type: "error", title: "Failed", message: "Transaction declined." });
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header isMenuOpen={isMenuOpen} onToggleMenu={() => setIsMenuOpen(!isMenuOpen)} />

      <main className={styles.container}>
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>Transactions</h1>
          <p className={styles.subtitle}>
            {data?.totalElements || 0} operations in your history
          </p>
        </header>

        <div className={styles.transactionsGrid}>
          <section className={styles.mainList}>
            {!data || data.content.length === 0 ? (
              <div className={styles.emptyCard}>
                <img className={styles.emptyIcon} src={walletIcon} alt="Empty" />
                <h2>No history yet</h2>
                <p>Your financial operations will appear here.</p>
              </div>
            ) : (
              <>
                {data.content.map((tx) => (
                  <article key={tx.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <div>
                        <span className={styles.sideLabel}>ID #{tx.id}</span>
                        <span className={styles.subtitle}>{new Date(tx.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className={`${styles.statusBadge} ${tx.status === 'COMPLETED' ? styles.statusPaid : styles.statusPending}`}>
                        {tx.status}
                      </div>
                    </div>

                    <div className={styles.orderBody}>
                      <div className={styles.itemRow}>
                        <div className={styles.itemInfo}>
                          <span className={styles.bookTitle}>{tx.description || tx.type}</span>
                          <span className={styles.itemQty}>{tx.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.orderFooter}>
                      <div>
                        <span className={styles.sideLabel}>Method</span>
                        <span className={styles.subtitle}>{tx.paymentMethod}</span>
                      </div>
                      <div className={styles.totalSection}>
                        <span className={`${styles.totalAmount} ${tx.type === 'DEPOSIT' ? styles.positiveAmount : ''}`}>
                          {tx.type === 'DEPOSIT' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
                <Pagination
                  currentPage={data.number}
                  totalPages={data.totalPages}
                  onPageChange={loadData}
                  loading={loading}
                />
              </>
            )}
          </section>

          <aside className={styles.summarySticky}>
            <div className={styles.summaryCard}>
              <div className={styles.balanceInfo}>
                <span className={styles.sideLabel}>Current Balance</span>
                <div className={styles.finalPrice}>
                  ${balance?.balance.toFixed(2) || "0.00"}
                </div>
              </div>

              <form onSubmit={handleTopUp} className={styles.topUpForm}>
                <div>
                  <span className={styles.sideLabel}>Top Up Amount</span>
                  <input
                    type="number"
                    className={styles.amountInput}
                    placeholder="0.00"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                  />
                </div>
                <Button type="submit" fullWidth disabled={!topUpAmount}>
                  Confirm Deposit
                </Button>
              </form>
            </div>
          </aside>
        </div>
      </main>

      <StatusModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </div>
  );
};

export default TransactionsPage;