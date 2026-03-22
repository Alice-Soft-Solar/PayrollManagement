"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, FilterX, PencilLine, Search, Trash2, UserCheck, UserX } from "lucide-react";

import { EmployeeDetailModal } from "@/components/employees/EmployeeDetailModal";
import { EmployeeFormModal } from "@/components/employees/EmployeeFormModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable } from "@/components/ui/DataTable";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useEmployees } from "@/hooks/useEmployees";
import { formatDate } from "@/lib/utils";
import { Employee, EmployeeFormInput } from "@/types/employee";

export default function EmployeesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"activate" | "deactivate" | "delete">("deactivate");
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [targetEmployeeId, setTargetEmployeeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();
  const {
    employees,
    filters,
    selectedProfile,
    loading,
    isFetching,
    profileLoading,
    actionLoading,
    error,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deactivateEmployee,
    activateEmployee,
    deleteEmployee,
    getEmployeeProfile,
    clearSelectedProfile,
  } = useEmployees();

  const uniqueRoles = useMemo(
    () => ["ALL", ...new Set(employees.map((item) => item.role))],
    [employees],
  );

  const clearFilters = () => {
    setSearchTerm("");
    fetchEmployees({ search: "", role: "ALL", status: "ALL" });
  };

  useEffect(() => {
    setSearchTerm(filters.search);
  }, [filters.search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchTerm !== filters.search) {
        fetchEmployees({ search: searchTerm });
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [searchTerm, filters.search, fetchEmployees]);

  const handleFormSubmit = async (payload: EmployeeFormInput) => {
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, payload);
        showToast("Employee updated successfully.", "success");
      } else {
        await addEmployee(payload);
        showToast("Employee added successfully.", "success");
      }
      setFormOpen(false);
      setEditingEmployee(null);
    } catch {
      showToast("Unable to save employee.", "error");
    }
  };

  const handleOpenDetail = async (id: string) => {
    try {
      await getEmployeeProfile(id);
      setDetailOpen(true);
    } catch {
      showToast("Unable to fetch employee detail.", "error");
    }
  };

  const handleConfirmAction = async () => {
    if (!targetEmployeeId) {
      return;
    }

    try {
      if (confirmAction === "activate") {
        await activateEmployee(targetEmployeeId);
        showToast("Employee activated.", "success");
      } else if (confirmAction === "deactivate") {
        await deactivateEmployee(targetEmployeeId);
        showToast("Employee deactivated.", "success");
      } else {
        await deleteEmployee(targetEmployeeId);
        showToast("Employee deleted.", "success");
      }
      setConfirmOpen(false);
      setTargetEmployeeId(null);
    } catch {
      showToast("Action failed for selected employee.", "error");
    }
  };

  const confirmTitle =
    confirmAction === "activate"
      ? "Activate Employee"
      : confirmAction === "deactivate"
        ? "Deactivate Employee"
        : "Delete Employee";

  const confirmDescription =
    confirmAction === "activate"
      ? "This will mark the employee as ACTIVE."
      : confirmAction === "deactivate"
        ? "This will mark the employee as INACTIVE (soft delete)."
        : "This will permanently remove the employee record.";

  const confirmButtonLabel =
    confirmAction === "activate"
      ? "Activate"
      : confirmAction === "deactivate"
        ? "Deactivate"
        : "Delete";

  if (loading) {
    return <Skeleton height={260} />;
  }

  return (
    <div className="stack-24">
      <Card title="Employees">
        <div className="section-actions">
          <p className="muted">Manage your workforce records</p>
          <Button onClick={() => setFormOpen(true)}>Add Employee</Button>
        </div>

        <div className="filters-row">
          <label className="icon-field">
            <Search size={16} />
            <input
              className="input"
              placeholder="Search by name, email or phone"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
          <select
            className="input"
            value={filters.role}
            onChange={(event) => fetchEmployees({ role: event.target.value })}
          >
            {uniqueRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={filters.status}
            onChange={(event) =>
              fetchEmployees({ status: event.target.value as "ACTIVE" | "INACTIVE" | "ALL" })
            }
          >
            <option value="ALL">ALL STATUS</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
          <button className="icon-button" onClick={clearFilters} aria-label="Clear filters" title="Clear filters">
            <FilterX size={16} />
          </button>
        </div>
      </Card>

      <Card title="Employee Table">
        {error ? <p className="alert-error">{error}</p> : null}
        {isFetching ? (
          <div className="table-inline-loading">
            <Spinner />
            <span>Updating results...</span>
          </div>
        ) : null}

        <DataTable
          columns={[
            { key: "name", header: "Name" },
            { key: "role", header: "Role" },
            { key: "salaryType", header: "Salary Type" },
            { key: "phone", header: "Phone" },
            { key: "email", header: "Email" },
            { key: "status", header: "Status" },
            {
              key: "createdAt",
              header: "Created",
              render: (value) => formatDate(String(value)),
            },
            {
              key: "id",
              header: "Action",
              render: (value, row) => (
                <div className="row-actions">
                  <button
                    className="action-icon-button"
                    onClick={() => handleOpenDetail(String(value))}
                    aria-label="View employee"
                    title="View"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className="action-icon-button"
                    onClick={() => {
                      setEditingEmployee(row as Employee);
                      setFormOpen(true);
                    }}
                    aria-label="Edit employee"
                    title="Edit"
                  >
                    <PencilLine size={16} />
                  </button>
                  <button
                    className="action-icon-button"
                    onClick={() => {
                      setTargetEmployeeId(String(value));
                      setConfirmAction((row as Employee).status === "INACTIVE" ? "activate" : "deactivate");
                      setConfirmOpen(true);
                    }}
                    aria-label={(row as Employee).status === "INACTIVE" ? "Activate employee" : "Deactivate employee"}
                    title={(row as Employee).status === "INACTIVE" ? "Activate" : "Deactivate"}
                  >
                    {(row as Employee).status === "INACTIVE" ? <UserCheck size={16} /> : <UserX size={16} />}
                  </button>
                  <button
                    className="action-icon-button danger"
                    onClick={() => {
                      setTargetEmployeeId(String(value));
                      setConfirmAction("delete");
                      setConfirmOpen(true);
                    }}
                    aria-label="Delete employee"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ),
            },
          ]}
          data={employees}
        />
      </Card>

      <EmployeeFormModal
        open={formOpen}
        mode={editingEmployee ? "edit" : "add"}
        initialEmployee={editingEmployee}
        loading={actionLoading}
        onClose={() => {
          setFormOpen(false);
          setEditingEmployee(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <EmployeeDetailModal
        open={detailOpen}
        loading={profileLoading}
        profile={selectedProfile}
        onClose={() => {
          setDetailOpen(false);
          clearSelectedProfile();
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={confirmTitle}
        description={confirmDescription}
        confirmText={confirmButtonLabel}
        loading={actionLoading}
        onConfirm={handleConfirmAction}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}
