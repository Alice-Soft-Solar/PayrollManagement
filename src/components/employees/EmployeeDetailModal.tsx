"use client";

import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";
import { EmployeeProfile } from "@/types/employee";

interface EmployeeDetailModalProps {
  open: boolean;
  loading: boolean;
  profile: EmployeeProfile | null;
  onClose: () => void;
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <p>
    <strong>{label}:</strong> <span className="profile-value">{value}</span>
  </p>
);

export const EmployeeDetailModal = ({
  open,
  loading,
  profile,
  onClose,
}: EmployeeDetailModalProps) => {
  return (
    <Modal open={open} title="Employee Profile" onClose={onClose}>
      {loading ? (
        <Skeleton height={260} />
      ) : profile ? (
        <div className="stack-16">
          <div className="profile-section">
            <h4>Personal Info</h4>
            <div className="detail-grid">
              <Row label="Name" value={profile.employee.name} />
              <Row label="Role" value={profile.employee.role} />
              <Row label="Status" value={profile.employee.status} />
              <Row label="Salary Type" value={profile.employee.salaryType} />
            </div>
          </div>

          <div className="profile-section">
            <h4>Contact Info</h4>
            <div className="detail-grid">
              <Row label="Phone" value={profile.employee.phone} />
              <Row label="Email" value={profile.employee.email} />
            </div>
          </div>

          <div className="profile-section">
            <h4>Address</h4>
            <div className="detail-grid">
              <Row label="Address" value={profile.employee.address} />
              <Row label="City" value={profile.employee.city} />
              <Row label="Pincode" value={profile.employee.pincode} />
            </div>
          </div>

          <div className="profile-section">
            <h4>Identity</h4>
            <div className="detail-grid">
              <Row label="Aadhaar" value={profile.employee.aadhaar} />
              <Row label="PAN" value={profile.employee.pan} />
            </div>
          </div>

          <div className="profile-section">
            <h4>Bank Details</h4>
            <div className="detail-grid">
              <Row label="Bank" value={profile.employee.bankName} />
              <Row label="Account" value={profile.employee.accountNumber} />
              <Row label="IFSC" value={profile.employee.ifsc} />
            </div>
          </div>

          <div className="profile-section">
            <h4>Work Details</h4>
            <div className="detail-grid">
              <Row
                label="Base Salary"
                value={formatCurrency(profile.employee.baseSalary)}
              />
              <Row
                label="Hourly Rate"
                value={formatCurrency(profile.employee.hourlyRate)}
              />
            </div>
          </div>

          <div className="profile-section">
            <h4>Attendance Summary</h4>
            <div className="detail-grid">
              <Row label="Present" value={String(profile.summary.presentDays)} />
              <Row label="Absent" value={String(profile.summary.absentDays)} />
            </div>
          </div>

          <div className="profile-section">
            <h4>Payroll Summary</h4>
            <div className="detail-grid">
              <Row
                label="Total Net Paid"
                value={formatCurrency(profile.summary.totalNetPaid)}
              />
              <Row
                label="Pending Payroll"
                value={String(profile.summary.pendingPayrollCount)}
              />
            </div>
          </div>
        </div>
      ) : (
        <p>No profile found.</p>
      )}
    </Modal>
  );
};
