import { useCallback, useState } from "react";
import Button from "../components/Button.jsx";
import ErrorBox from "../components/ErrorBox.jsx";
import Loader from "../components/Loader.jsx";
import Modal from "../components/Modal.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Table from "../components/Table.jsx";
import TextInput from "../components/TextInput.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { linesService } from "../services/linesService.js";
import { getErrorMessage } from "../utils/formatters.js";

const emptyForm = {
  code: "",
  name: "",
};

export default function LinesPage() {
  const fetchLines = useCallback(() => linesService.getAll(), []);

  const { data, loading, error, execute } = useAsync(fetchLines);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [actionError, setActionError] = useState("");

  const lines = Array.isArray(data) ? data : [];

  function openCreate() {
    setSelectedLine(null);
    setForm(emptyForm);
    setActionError("");
    setModalOpen(true);
  }

  function openEdit(row) {
    setSelectedLine(row);
    setForm({
      code: row.code || "",
      name: row.name || "",
    });
    setActionError("");
    setModalOpen(true);
  }

  async function saveLine(event) {
    event.preventDefault();
    setActionError("");

    if (!form.code.trim() || !form.name.trim()) {
      setActionError("Codul și numele liniei sunt obligatorii.");
      return;
    }

    try {
      const payload = {
        code: form.code.trim(),
        name: form.name.trim(),
      };

      if (selectedLine?.id) {
        await linesService.update(selectedLine.id, payload);
      } else {
        await linesService.create(payload);
      }

      setModalOpen(false);
      setSelectedLine(null);
      setForm(emptyForm);
      execute();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  async function toggleLine(row) {
    try {
      if (row.isActive) {
        await linesService.deactivate(row.id);
      } else {
        await linesService.activate(row.id);
      }

      execute();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  async function deleteLine(id) {
    if (!confirm("Sigur vrei să ștergi permanent această linie?")) return;

    try {
      await linesService.remove(id);
      execute();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  const columns = [
    {
      key: "id",
      label: "ID",
    },
    {
      key: "code",
      label: "Cod",
    },
    {
      key: "name",
      label: "Nume linie",
    },
    {
      key: "isActive",
      label: "Status",
      render: (row) =>
        row.isActive ? (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            Activă
          </span>
        ) : (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            Inactivă
          </span>
        ),
    },
    {
      key: "actions",
      label: "Acțiuni",
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => openEdit(row)}>
            Modifică
          </Button>

          <Button
            variant={row.isActive ? "secondary" : "success"}
            onClick={() => toggleLine(row)}
          >
            {row.isActive ? "Dezactivează" : "Activează"}
          </Button>

          <Button variant="danger" onClick={() => deleteLine(row.id)}>
            Șterge
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <Loader />;

  return (
    <>
      <PageHeader
        title="Lines Management"
        subtitle="Administrare linii de transport."
        actionLabel="Adaugă linie"
        onAction={openCreate}
      />

      <ErrorBox message={error} />

      <Table columns={columns} data={lines} emptyText="Nu există linii." />

      <Modal
        open={modalOpen}
        title={selectedLine ? "Modificare linie" : "Creare linie"}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={saveLine} className="space-y-4">
          <ErrorBox message={actionError} />

          <TextInput
            label="Cod linie"
            value={form.code}
            onChange={(e) =>
              setForm({
                ...form,
                code: e.target.value,
              })
            }
            placeholder="ex: 5"
          />

          <TextInput
            label="Nume linie"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            placeholder="ex: Gară - Centru Nou"
          />

          <Button type="submit">
            {selectedLine ? "Salvează modificările" : "Creează linie"}
          </Button>
        </form>
      </Modal>
    </>
  );
}