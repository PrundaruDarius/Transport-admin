import { useCallback, useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import ErrorBox from "../components/ErrorBox.jsx";
import Loader from "../components/Loader.jsx";
import Modal from "../components/Modal.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Table from "../components/Table.jsx";
import TextInput from "../components/TextInput.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { timetableService } from "../services/timetableService.js";
import { stationsService } from "../services/stationsService.js";
import { getErrorMessage } from "../utils/formatters.js";

const emptyForm = {
  stationId: "",
  lineCode: "",
  hour: "",
  minutes: "",
  isActive: true,
};

function normalizeTimetable(item) {
  const minutes = item.minutes ?? item.Minutes ?? [];

  return {
    ...item,
    displayStationId: item.stationId ?? item.StationId ?? "",
    displayLineCode: item.lineCode ?? item.LineCode ?? "",
    displayHour: item.hour ?? item.Hour ?? "",
    displayMinutes: Array.isArray(minutes) ? minutes : [],
    displayIsActive: item.isActive ?? item.IsActive ?? true,
  };
}

function parseMinutes(value) {
  return String(value)
    .split(",")
    .map((x) => Number(x.trim()))
    .filter((x) => !Number.isNaN(x));
}

function areMinutesValid(minutes) {
  return (
    Array.isArray(minutes) &&
    minutes.length > 0 &&
    minutes.every((m) => Number.isInteger(m) && m >= 0 && m <= 59)
  );
}

export default function TimetablePage() {
  const fetchTimetable = useCallback(() => timetableService.getAll(), []);
  const { data, loading, error, execute } = useAsync(fetchTimetable);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [actionError, setActionError] = useState("");
  const [stationsMap, setStationsMap] = useState({});

  const timetable = Array.isArray(data) ? data.map(normalizeTimetable) : [];

  useEffect(() => {
    async function loadStations() {
      try {
        const stations = await stationsService.getAll();

        const map = {};

        if (Array.isArray(stations)) {
          stations.forEach((station) => {
            const id = station.id ?? station.Id ?? station.stationId ?? station.StationId;
            const name = station.name ?? station.Name ?? station.stationName ?? station.StationName;

            if (id !== undefined && id !== null) {
              map[String(id)] = name || "";
            }
          });
        }

        setStationsMap(map);
      } catch {
        setStationsMap({});
      }
    }

    loadStations();
  }, []);

  function getStationLabel(stationId) {
    const key = String(stationId);
    const stationName = stationsMap[key];

    if (stationName) {
      return `${stationId} - ${stationName}`;
    }

    return stationId;
  }

  function openCreate() {
    setSelectedEntry(null);
    setForm(emptyForm);
    setActionError("");
    setModalOpen(true);
  }

  function openEdit(row) {
    setSelectedEntry(row);
    setForm({
      stationId: row.displayStationId,
      lineCode: row.displayLineCode,
      hour: row.displayHour,
      minutes: row.displayMinutes.join(", "),
      isActive: row.displayIsActive,
    });
    setActionError("");
    setModalOpen(true);
  }

  async function saveTimetable(event) {
    event.preventDefault();
    setActionError("");

    const stationId = Number(form.stationId);
    const hour = Number(form.hour);
    const minutes = parseMinutes(form.minutes);

    if (!stationId || !form.lineCode.trim()) {
      setActionError("Station ID și Line Code sunt obligatorii.");
      return;
    }

    if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
      setActionError("Ora trebuie să fie între 0 și 23.");
      return;
    }

    if (!areMinutesValid(minutes)) {
      setActionError(
        "Minutele trebuie să fie numere între 0 și 59, separate prin virgulă."
      );
      return;
    }

    try {
      if (selectedEntry) {
        await timetableService.update(
          selectedEntry.displayStationId,
          selectedEntry.displayLineCode,
          selectedEntry.displayHour,
          {
            minutes,
            isActive: Boolean(form.isActive),
          }
        );
      } else {
        await timetableService.create({
          stationId,
          lineCode: form.lineCode.trim(),
          hour,
          minutes,
        });
      }

      setModalOpen(false);
      setSelectedEntry(null);
      setForm(emptyForm);
      execute();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  async function toggleEntry(row) {
    try {
      if (row.displayIsActive) {
        await timetableService.deactivate(
          row.displayStationId,
          row.displayLineCode,
          row.displayHour
        );
      } else {
        await timetableService.activate(
          row.displayStationId,
          row.displayLineCode,
          row.displayHour
        );
      }

      execute();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  async function deleteEntry(row) {
    if (!confirm("Sigur vrei să ștergi această intrare din orar?")) return;

    try {
      await timetableService.remove(
        row.displayStationId,
        row.displayLineCode,
        row.displayHour
      );

      execute();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  const columns = [
    {
      key: "displayStationId",
      label: "Stație",
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900">
            {getStationLabel(row.displayStationId)}
          </div>
        </div>
      ),
    },
    {
      key: "displayLineCode",
      label: "Linie",
      render: (row) => row.displayLineCode,
    },
    {
      key: "displayHour",
      label: "Ora",
      render: (row) => row.displayHour,
    },
    {
      key: "displayMinutes",
      label: "Minute",
      render: (row) => row.displayMinutes.join(", "),
    },
    {
      key: "displayIsActive",
      label: "Status",
      render: (row) =>
        row.displayIsActive ? (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            Activ
          </span>
        ) : (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            Inactiv
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
            variant={row.displayIsActive ? "secondary" : "success"}
            onClick={() => toggleEntry(row)}
          >
            {row.displayIsActive ? "Dezactivează" : "Activează"}
          </Button>

          <Button variant="danger" onClick={() => deleteEntry(row)}>
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
        title="Timetable Management"
        subtitle="Administrare orar."
        actionLabel="Adaugă intrare"
        onAction={openCreate}
      />

      <ErrorBox message={error} />

      <Table
        columns={columns}
        data={timetable}
        emptyText="Nu există intrări în orar."
      />

      <Modal
        open={modalOpen}
        title={selectedEntry ? "Modificare orar" : "Creare intrare orar"}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={saveTimetable} className="space-y-4">
          <ErrorBox message={actionError} />

          <TextInput
            label="Station ID"
            type="number"
            value={form.stationId}
            disabled={!!selectedEntry}
            onChange={(e) =>
              setForm({
                ...form,
                stationId: e.target.value,
              })
            }
            placeholder="ex: 1001"
          />

          <TextInput
            label="Line Code"
            value={form.lineCode}
            disabled={!!selectedEntry}
            onChange={(e) =>
              setForm({
                ...form,
                lineCode: e.target.value,
              })
            }
            placeholder="ex: 1"
          />

          <TextInput
            label="Ora"
            type="number"
            value={form.hour}
            disabled={!!selectedEntry}
            onChange={(e) =>
              setForm({
                ...form,
                hour: e.target.value,
              })
            }
            placeholder="ex: 8"
          />

          <TextInput
            label="Minute"
            value={form.minutes}
            onChange={(e) =>
              setForm({
                ...form,
                minutes: e.target.value,
              })
            }
            placeholder="ex: 0, 15, 30, 45"
          />

          {selectedEntry && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({
                    ...form,
                    isActive: e.target.checked,
                  })
                }
              />
              Activ
            </label>
          )}

          <Button type="submit">
            {selectedEntry ? "Salvează modificările" : "Creează intrare"}
          </Button>
        </form>
      </Modal>
    </>
  );
}