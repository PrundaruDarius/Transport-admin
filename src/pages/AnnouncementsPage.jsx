import { useCallback, useState } from "react";
import Button from "../components/Button.jsx";
import ErrorBox from "../components/ErrorBox.jsx";
import Loader from "../components/Loader.jsx";
import Modal from "../components/Modal.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Table from "../components/Table.jsx";
import TextInput from "../components/TextInput.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { announcementsService } from "../services/announcementsService.js";
import { formatDate, getErrorMessage } from "../utils/formatters.js";

const emptyForm = {
  title: "",
  content: "",
};

export default function AnnouncementsPage() {
  const fetchAnnouncements = useCallback(
    () => announcementsService.getAll(),
    []
  );

  const { data, loading, error, execute } = useAsync(fetchAnnouncements);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [actionError, setActionError] = useState("");

  const announcements = Array.isArray(data) ? data : [];

  function openCreate() {
    setSelectedAnnouncement(null);
    setForm(emptyForm);
    setActionError("");
    setModalOpen(true);
  }

  function openEdit(row) {
    setSelectedAnnouncement(row);
    setForm({
      title: row.title || "",
      content: row.content || "",
    });
    setActionError("");
    setModalOpen(true);
  }

  async function saveAnnouncement(event) {
  event.preventDefault();
  setActionError("");

  if (!form.title.trim() || !form.content.trim()) {
    setActionError("Titlul și conținutul sunt obligatorii.");
    return;
  }

  try {
    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      createdAt: selectedAnnouncement?.createdAt || new Date().toISOString(),
    };

    if (selectedAnnouncement?.id) {
      await announcementsService.update(selectedAnnouncement.id, payload);
    } else {
      await announcementsService.create(payload);
    }

    setModalOpen(false);
    setSelectedAnnouncement(null);
    setForm(emptyForm);
    execute();
  } catch (err) {
    setActionError(getErrorMessage(err));
  }
}

  async function deleteAnnouncement(id) {
    if (!confirm("Sigur vrei să ștergi acest anunț?")) return;

    try {
      await announcementsService.remove(id);
      execute();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  const columns = [
    {
      key: "title",
      label: "Titlu",
    },
    {
      key: "content",
      label: "Conținut",
    },
    {
      key: "createdAt",
      label: "Creat la",
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: "actions",
      label: "Acțiuni",
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => openEdit(row)}>
            Modifică
          </Button>

          <Button variant="danger" onClick={() => deleteAnnouncement(row.id)}>
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
        title="Announcements Management"
        subtitle="Administrare anunțuri."
        actionLabel="Adaugă anunț"
        onAction={openCreate}
      />

      <ErrorBox message={error} />

      <Table
        columns={columns}
        data={announcements}
        emptyText="Nu există anunțuri."
      />

      <Modal
        open={modalOpen}
        title={selectedAnnouncement ? "Modificare anunț" : "Creare anunț"}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={saveAnnouncement} className="space-y-4">
          <ErrorBox message={actionError} />

          <TextInput
            label="Titlu"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
          />

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Conținut
            </span>

            <textarea
              rows={5}
              value={form.content}
              onChange={(e) =>
                setForm({
                  ...form,
                  content: e.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Scrie conținutul anunțului..."
            />
          </label>

          <Button type="submit">
            {selectedAnnouncement ? "Salvează modificările" : "Creează anunț"}
          </Button>
        </form>
      </Modal>
    </>
  );
}