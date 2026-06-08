import { useCallback, useState } from "react";
import Button from "../components/Button.jsx";
import ErrorBox from "../components/ErrorBox.jsx";
import Loader from "../components/Loader.jsx";
import Modal from "../components/Modal.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Table from "../components/Table.jsx";
import TextInput from "../components/TextInput.jsx";
import { useAuthContext } from "../context/AuthContext.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { usersService } from "../services/usersService.js";
import { getErrorMessage } from "../utils/formatters.js";

const emptyCreateForm = {
  email: "",
  password: "",
  type: "Controller",
};

const hiddenEmailPrefixes = [
  "register_",
  "login_",
  "duplicate_",
  "wrongpass_",
  "test_",
];

function normalizeUser(user) {
  const roles = user.roles ?? user.Roles ?? [];

  return {
    ...user,
    displayId: user.id ?? user.Id ?? "",
    displayEmail: user.email ?? user.Email ?? "",
    displayRoles: Array.isArray(roles) ? roles : [],
    displayIsDisabled: user.isDisabled ?? user.IsDisabled ?? false,
  };
}

function isSuperAdminUser(user) {
  return user.displayRoles.includes("SuperAdmin");
}

function isAdminUser(user) {
  return user.displayRoles.includes("Admin");
}

function shouldHideUser(user) {
  const email = String(user.displayEmail || "").toLowerCase();

  return hiddenEmailPrefixes.some((prefix) => email.startsWith(prefix));
}

function canManageUser(currentUserIsSuperAdmin, targetUser) {
  if (isSuperAdminUser(targetUser)) return false;

  if (isAdminUser(targetUser) && !currentUserIsSuperAdmin) {
    return false;
  }

  return true;
}

export default function UsersPage() {
  const { hasRole } = useAuthContext();

  const currentUserIsSuperAdmin = hasRole(["SuperAdmin"]);

  const roleOptions = currentUserIsSuperAdmin
    ? ["User", "Controller", "Admin"]
    : ["User", "Controller"];

  const fetchUsers = useCallback(() => usersService.getAll(), []);
  const { data, loading, error, execute } = useAsync(fetchUsers);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("User");

  const [actionError, setActionError] = useState("");

  const users = Array.isArray(data)
    ? data.map(normalizeUser).filter((user) => !shouldHideUser(user))
    : [];

  function openCreate(type) {
    setCreateForm({
      email: "",
      password: "",
      type,
    });

    setActionError("");
    setCreateModalOpen(true);
  }

  function openRoleModal(user) {
    if (!canManageUser(currentUserIsSuperAdmin, user)) {
      alert("Nu ai voie să modifici rolurile acestui utilizator.");
      return;
    }

    setSelectedUser(user);
    setSelectedRole("User");
    setActionError("");
    setRoleModalOpen(true);
  }

  async function saveUser(event) {
    event.preventDefault();
    setActionError("");

    if (!createForm.email.trim() || !createForm.password.trim()) {
      setActionError("Emailul și parola sunt obligatorii.");
      return;
    }

    try {
      const payload = {
        email: createForm.email.trim(),
        password: createForm.password.trim(),
      };

      if (createForm.type === "Admin") {
        await usersService.createAdmin(payload);
      } else {
        await usersService.createController(payload);
      }

      setCreateModalOpen(false);
      setCreateForm(emptyCreateForm);
      execute();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  async function addRole(event) {
    event.preventDefault();
    setActionError("");

    if (!selectedUser?.displayId || !selectedRole) {
      setActionError("Selectează utilizatorul și rolul.");
      return;
    }

    if (!canManageUser(currentUserIsSuperAdmin, selectedUser)) {
      setActionError("Nu ai voie să modifici rolurile acestui utilizator.");
      return;
    }

    if (selectedRole === "Admin" && !currentUserIsSuperAdmin) {
      setActionError("Doar SuperAdmin poate adăuga rolul Admin.");
      return;
    }

    if (selectedRole === "SuperAdmin") {
      setActionError("Rolul SuperAdmin nu poate fi adăugat din frontend.");
      return;
    }

    try {
      await usersService.addRole(selectedUser.displayId, selectedRole);

      setRoleModalOpen(false);
      setSelectedUser(null);
      execute();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  async function removeRole(user, roleName) {
    if (!canManageUser(currentUserIsSuperAdmin, user)) {
      alert("Nu ai voie să modifici rolurile acestui utilizator.");
      return;
    }

    if (roleName === "SuperAdmin") {
      alert("Rolul SuperAdmin nu poate fi eliminat din frontend.");
      return;
    }

    if (roleName === "Admin" && !currentUserIsSuperAdmin) {
      alert("Doar SuperAdmin poate elimina rolul Admin.");
      return;
    }

    if (!confirm(`Sigur elimini rolul ${roleName}?`)) return;

    try {
      await usersService.removeRole(user.displayId, roleName);
      execute();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  async function disableUser(user) {
    if (!canManageUser(currentUserIsSuperAdmin, user)) {
      alert("Nu ai voie să dezactivezi acest utilizator.");
      return;
    }

    if (!confirm("Sigur dezactivezi acest utilizator?")) return;

    try {
      await usersService.disable(user.displayId);
      execute();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  const columns = [
    {
      key: "displayEmail",
      label: "Email",
      render: (row) => (
        <div className="max-w-[420px] break-all text-sm text-slate-700">
          {row.displayEmail}
        </div>
      ),
    },
    {
      key: "displayRoles",
      label: "Roluri",
      render: (row) => {
        if (!row.displayRoles.length) {
          return <span className="text-slate-400">Fără rol</span>;
        }

        return (
          <div className="flex max-w-[260px] flex-wrap gap-2">
            {row.displayRoles.map((role) => (
              <span
                key={role}
                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
              >
                {role}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: "displayIsDisabled",
      label: "Status",
      render: (row) =>
        row.displayIsDisabled ? (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            Dezactivat
          </span>
        ) : (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            Activ
          </span>
        ),
    },
    {
      key: "actions",
      label: "Acțiuni",
      render: (row) => {
        const canManage = canManageUser(currentUserIsSuperAdmin, row);

        const removableRoles = row.displayRoles.filter((role) => {
          if (role === "SuperAdmin") return false;
          if (role === "Admin" && !currentUserIsSuperAdmin) return false;
          return true;
        });

        return (
          <div className="grid min-w-[500px] grid-cols-3 items-start gap-2">
            <Button
              variant="secondary"
              disabled={!canManage}
              onClick={() => openRoleModal(row)}
            >
              Adaugă rol
            </Button>

            <div className="flex flex-col gap-2">
              {removableRoles.length > 0 ? (
                removableRoles.map((role) => (
                  <Button
                    key={role}
                    variant="secondary"
                    disabled={!canManage}
                    onClick={() => removeRole(row, role)}
                  >
                    Elimină {role}
                  </Button>
                ))
              ) : (
                <span className="rounded-xl bg-slate-50 px-3 py-2 text-center text-sm text-slate-400">
                  Fără rol eliminabil
                </span>
              )}
            </div>

            <Button
              variant="danger"
              disabled={!canManage || row.displayIsDisabled}
              onClick={() => disableUser(row)}
            >
              Dezactivează
            </Button>
          </div>
        );
      },
    },
  ];

  if (loading) return <Loader />;

  return (
    <>
      <PageHeader
        title="Users Management"
        subtitle="Administrare utilizatori, roluri și status."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Button onClick={() => openCreate("Controller")}>
          Creează Controller
        </Button>

        {currentUserIsSuperAdmin && (
          <Button variant="success" onClick={() => openCreate("Admin")}>
            Creează Admin
          </Button>
        )}
      </div>

      <ErrorBox message={error} />

      <Table columns={columns} data={users} emptyText="Nu există utilizatori." />

      <Modal
        open={createModalOpen}
        title={
          createForm.type === "Admin" ? "Creare Admin" : "Creare Controller"
        }
        onClose={() => setCreateModalOpen(false)}
      >
        <form onSubmit={saveUser} className="space-y-4">
          <ErrorBox message={actionError} />

          <TextInput
            label="Email"
            type="email"
            value={createForm.email}
            onChange={(e) =>
              setCreateForm({
                ...createForm,
                email: e.target.value,
              })
            }
            placeholder="ex: admin@test.com"
          />

          <TextInput
            label="Parolă"
            type="password"
            value={createForm.password}
            onChange={(e) =>
              setCreateForm({
                ...createForm,
                password: e.target.value,
              })
            }
            placeholder="ex: Test123"
          />

          <Button type="submit">
            {createForm.type === "Admin"
              ? "Creează Admin"
              : "Creează Controller"}
          </Button>
        </form>
      </Modal>

      <Modal
        open={roleModalOpen}
        title="Adaugă rol"
        onClose={() => setRoleModalOpen(false)}
      >
        <form onSubmit={addRole} className="space-y-4">
          <ErrorBox message={actionError} />

          <div>
            <p className="mb-2 text-sm text-slate-600">
              Utilizator:{" "}
              <span className="font-semibold">
                {selectedUser?.displayEmail}
              </span>
            </p>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Rol
              </span>

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <Button type="submit">Adaugă rol</Button>
        </form>
      </Modal>
    </>
  );
}