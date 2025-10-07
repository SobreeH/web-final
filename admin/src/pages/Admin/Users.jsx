import React, { useEffect, useMemo, useState, useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";

const emptyForm = { name: "", email: "", password: "" };

const Users = () => {
  const { aToken, users, getAllUsers, createUser, updateUser, deleteUser } =
    useContext(AdminContext);

  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState("");

  useEffect(() => {
    const run = async () => {
      if (!aToken) return;
      setLoading(true);
      await getAllUsers();
      setLoading(false);
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aToken]);

  const sorted = useMemo(() => {
    return [...(users || [])].sort(
      (a, b) => b?._id?.localeCompare?.(a?._id) ?? 0
    );
  }, [users]);

  const openAdd = () => {
    setForm(emptyForm);
    setShowAdd(true);
  };

  const openEdit = (u) => {
    setEditId(u._id);
    setForm({ name: u.name || "", email: u.email || "", password: "" }); // password optional
    setShowEdit(true);
  };

  const closeModals = () => {
    setShowAdd(false);
    setShowEdit(false);
    setEditId("");
    setForm(emptyForm);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submitAdd = async (e) => {
    e.preventDefault();
    const ok = await createUser(form);
    if (ok) closeModals();
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    const payload = { name: form.name, email: form.email };
    if (form.password !== "") payload.password = form.password; // optional
    const ok = await updateUser(editId, payload);
    if (ok) closeModals();
  };

  const confirmDelete = async (id) => {
    const yes = window.confirm(
      "Delete this user and ALL their appointments? This cannot be undone."
    );
    if (!yes) return;
    await deleteUser(id);
  };

  return (
    <div className="p-4 md:p-6 w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-semibold">Users</h2>
        <div className="flex gap-2">
          <button
            onClick={() => getAllUsers()}
            className="text-sm px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50"
          >
            Refresh
          </button>
          <button
            onClick={openAdd}
            className="text-sm px-3 py-1.5 rounded bg-primary text-white hover:opacity-90"
          >
            Add User
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading users…</div>
      ) : sorted.length === 0 ? (
        <div className="text-gray-500">No users found.</div>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-left px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((u) => (
                <tr key={u._id} className="border-t">
                  <td className="px-4 py-2 align-top">{u.name || "—"}</td>
                  <td className="px-4 py-2 align-top">{u.email || "—"}</td>
                  <td className="px-4 py-2 align-top">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(u._id)}
                        className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={submitAdd}
            className="bg-white rounded shadow-lg w-full max-w-md p-4 space-y-3"
          >
            <h3 className="text-lg font-semibold">Add User</h3>
            <div>
              <label className="text-sm">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="text-sm">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="text-sm">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                className="w-full border rounded p-2"
                minLength={8}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeModals}
                className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded bg-primary text-white hover:opacity-90"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={submitEdit}
            className="bg-white rounded shadow-lg w-full max-w-md p-4 space-y-3"
          >
            <h3 className="text-lg font-semibold">Edit User</h3>
            <div>
              <label className="text-sm">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="text-sm">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="text-sm">
                Password (leave blank to keep unchanged)
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                className="w-full border rounded p-2"
                minLength={form.password ? 8 : undefined}
                placeholder="••••••••"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeModals}
                className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded bg-primary text-white hover:opacity-90"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Users;
