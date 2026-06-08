import { useCallback, useState } from "react";
import Button from "../components/Button.jsx";
import ErrorBox from "../components/ErrorBox.jsx";
import Loader from "../components/Loader.jsx";
import Modal from "../components/Modal.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Table from "../components/Table.jsx";
import TextInput from "../components/TextInput.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { pricesService } from "../services/pricesService.js";
import { getErrorMessage } from "../utils/formatters.js";

function flattenPrices(pricesObject) {
  if (!pricesObject || typeof pricesObject !== "object") return [];

  const allowedCategories = ["singleTickets", "subscriptions"];

  return Object.entries(pricesObject).flatMap(([category, items]) => {
    if (!allowedCategories.includes(category)) return [];
    if (!Array.isArray(items)) return [];

    return items
      .filter((item) => item.id && item.name && item.price)
      .map((item) => ({
        ...item,
        category,
      }));
  });
}

export default function PricesPage() {
  const fetchPrices = useCallback(() => pricesService.getAll(), []);
  const { data, loading, error, execute } = useAsync(fetchPrices);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    id: "",
    name: "",
    price: "",
  });
  const [actionError, setActionError] = useState("");

  const prices = flattenPrices(data);

  function openEdit(row) {
    setForm({
      id: row.id,
      name: row.name || "",
      price: row.price || "",
    });

    setActionError("");
    setModalOpen(true);
  }

  async function savePrice(event) {
    event.preventDefault();
    setActionError("");

    if (!form.id || !form.name || !form.price) {
      setActionError("Completează numele și prețul.");
      return;
    }

    try {
      await pricesService.update(form.id, {
        name: form.name,
        price: form.price,
      });

      setModalOpen(false);
      execute();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  const columns = [
    {
      key: "category",
      label: "Categorie",
    },
    {
      key: "id",
      label: "ID",
    },
    {
      key: "name",
      label: "Nume",
    },
    {
      key: "price",
      label: "Preț",
    },
    {
      key: "actions",
      label: "Acțiuni",
      render: (row) => (
        <Button variant="secondary" onClick={() => openEdit(row)}>
          Modifică
        </Button>
      ),
    },
  ];

  if (loading) return <Loader />;

  return (
    <>
      <PageHeader
        title="Prices Management"
        subtitle="Modificare prețuri pentru bilete și abonamente."
      />

      <ErrorBox message={error} />

      <Table columns={columns} data={prices} emptyText="Nu există prețuri." />

      <Modal
        open={modalOpen}
        title="Modificare preț"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={savePrice} className="space-y-4">
          <ErrorBox message={actionError} />

          <TextInput label="ID" value={form.id} disabled />

          <TextInput
            label="Nume"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

          <TextInput
            label="Preț"
            value={form.price}
            onChange={(e) =>
              setForm({
                ...form,
                price: e.target.value,
              })
            }
            placeholder="ex: 6 Lei"
          />

          <Button type="submit">Salvează</Button>
        </form>
      </Modal>
    </>
  );
}