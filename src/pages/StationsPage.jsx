import { useCallback, useState } from "react";
import Button from "../components/Button.jsx";
import ErrorBox from "../components/ErrorBox.jsx";
import Loader from "../components/Loader.jsx";
import Modal from "../components/Modal.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Table from "../components/Table.jsx";
import TextInput from "../components/TextInput.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { stationsService } from "../services/stationsService.js";
import { getErrorMessage } from "../utils/formatters.js";

const emptyForm = {
  lineId: "",
  name: "",
  order: "",
};

function normalizeStation(station) {
  return {
    ...station,

    displayId: station.id ?? station.Id ?? station.stationId ?? station.StationId ?? "",

    displayLineId:
      station.lineId ??
      station.LineId ??
      station.lineID ??
      station.LineID ??
      "",

    displayName:
      station.name ??
      station.Name ??
      station.stationName ??
      station.StationName ??
      "",

    displayOrder:
      station.order ??
      station.Order ??
      station.stopOrder ??
      station.StopOrder ??
      station.position ??
      station.Position ??
      "",
  };
}

export default function StationsPage() {
  const fetchStations = useCallback(() => stationsService.getAll(), []);
  const { data, loading, error, execute } = useAsync(fetchStations);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [actionError, setActionError] = useState("");

  const stations = Array.isArray(data) ? data.map(normalizeStation) : [];

  function openCreate() {
    setSelectedStation(null);
    setForm(emptyForm);
    setActionError("");
    setModalOpen(true);
  }

  function openEdit(row) {
    setSelectedStation(row);

    setForm({
      lineId: row.displayLineId || "",
      name: row.displayName || "",
      order: row.displayOrder || "",
    });

    setActionError("");
    setModalOpen(true);
  }

  async function saveStation(event) {
  event.preventDefault();
  setActionError("");

  const lineId = Number(form.lineId);
  const order = Number(form.order);

  if (!form.lineId || !form.name.trim() || form.order === "") {
    setActionError("Line ID, numele stației și ordinea sunt obligatorii.");
    return;
  }

  if (!Number.isInteger(lineId) || lineId <= 0) {
    setActionError("Line ID trebuie să fie un număr pozitiv.");
    return;
  }

  if (!Number.isInteger(order) || order < 0) {
    setActionError("Ordinea trebuie să fie un număr mai mare sau egal cu 0.");
    return;
  }

  try {
    const payload = {
      lineId,
      name: form.name.trim(),
      order,
    };

    if (selectedStation?.displayId) {
      await stationsService.update(selectedStation.displayId, payload);
    } else {
      await stationsService.create(payload);
    }

    setModalOpen(false);
    setSelectedStation(null);
    setForm(emptyForm);
    execute();
  } catch (err) {
    setActionError(getErrorMessage(err));
  }
}

  async function deleteStation(id) {
    if (!confirm("Sigur vrei să ștergi această stație?")) return;

    try {
      await stationsService.remove(id);
      execute();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  const columns = [
    {
      key: "displayId",
      label: "ID",
      render: (row) => row.displayId,
    },
    {
      key: "displayLineId",
      label: "Line ID",
      render: (row) => row.displayLineId,
    },
    {
      key: "displayName",
      label: "Nume stație",
      render: (row) => row.displayName,
    },
    {
      key: "displayOrder",
      label: "Ordine",
      render: (row) => row.displayOrder,
    },
    {
      key: "actions",
      label: "Acțiuni",
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => openEdit(row)}>
            Modifică
          </Button>

          <Button variant="danger" onClick={() => deleteStation(row.displayId)}>
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
        title="Stations Management"
        subtitle="Administrare stații."
        actionLabel="Adaugă stație"
        onAction={openCreate}
      />

      <ErrorBox message={error} />

      <Table
        columns={columns}
        data={stations}
        emptyText="Nu există stații."
      />

      <Modal
        open={modalOpen}
        title={selectedStation ? "Modificare stație" : "Creare stație"}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={saveStation} className="space-y-4">
          <ErrorBox message={actionError} />

          <TextInput
            label="Line ID"
            type="number"
            value={form.lineId}
            onChange={(e) =>
              setForm({
                ...form,
                lineId: e.target.value,
              })
            }
            placeholder="ex: 1"
          />

          <TextInput
            label="Nume stație"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            placeholder="ex: Gară"
          />

          <TextInput
            label="Ordine"
            type="number"
            value={form.order}
            onChange={(e) =>
              setForm({
                ...form,
                order: e.target.value,
              })
            }
            placeholder="ex: 1"
          />

          <Button type="submit">
            {selectedStation ? "Salvează modificările" : "Creează stație"}
          </Button>
        </form>
      </Modal>
    </>
  );
}