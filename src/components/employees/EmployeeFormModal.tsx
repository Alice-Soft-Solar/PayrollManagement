"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Employee, EmployeeFormInput } from "@/types/employee";

interface EmployeeFormModalProps {
  open: boolean;
  mode: "add" | "edit";
  initialEmployee?: Employee | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: EmployeeFormInput) => Promise<void>;
}

const defaultValues: EmployeeFormInput = {
  name: "",
  phone: "",
  email: "",
  password: "",
  address: "",
  city: "",
  pincode: "",
  aadhaar: "",
  pan: "",
  bankName: "",
  accountNumber: "",
  ifsc: "",
  role: "Machine Operator",
  salaryType: "DAILY",
  baseSalary: 0,
  hourlyRate: 0,
};

export const EmployeeFormModal = ({
  open,
  mode,
  initialEmployee,
  loading = false,
  onClose,
  onSubmit,
}: EmployeeFormModalProps) => {
  const {
    register,
    watch,
    reset,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EmployeeFormInput>({ defaultValues });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (initialEmployee) {
      reset({
        name: initialEmployee.name,
        phone: initialEmployee.phone,
        email: initialEmployee.email,
        password: initialEmployee.password,
        address: initialEmployee.address,
        city: initialEmployee.city,
        pincode: initialEmployee.pincode,
        aadhaar: initialEmployee.aadhaar,
        pan: initialEmployee.pan,
        bankName: initialEmployee.bankName,
        accountNumber: initialEmployee.accountNumber,
        ifsc: initialEmployee.ifsc,
        role: initialEmployee.role,
        salaryType: initialEmployee.salaryType,
        baseSalary: initialEmployee.baseSalary,
        hourlyRate: initialEmployee.hourlyRate,
      });
      return;
    }

    reset(defaultValues);
  }, [open, initialEmployee, reset]);

  const salaryType = watch("salaryType");

  return (
    <Modal
      open={open}
      title={mode === "add" ? "Add Employee" : "Edit Employee"}
      onClose={onClose}
    >
      <form className="stack-16" onSubmit={handleSubmit(onSubmit)}>
        <div className="detail-grid">
          <label className="input-group"><span className="input-label">Full Name</span><input className="input" {...register("name", { required: "Full name is required." })} /></label>
          <label className="input-group"><span className="input-label">Phone</span><input className="input" {...register("phone", { required: "Phone is required.", pattern: { value: /^\d{10}$/, message: "Phone must be 10 digits." } })} /></label>
          <label className="input-group"><span className="input-label">Email</span><input className="input" {...register("email", { required: "Email is required.", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email format." } })} /></label>
          <label className="input-group"><span className="input-label">Password</span><input className="input" {...register("password", { required: "Password is required." })} /></label>
        </div>

        <button type="button" className="link-button" onClick={() => setValue("password", `PWD${Math.floor(100000 + Math.random() * 900000)}`)}>Auto-generate Password</button>

        <div className="detail-grid">
          <label className="input-group"><span className="input-label">Address</span><input className="input" {...register("address", { required: "Address is required." })} /></label>
          <label className="input-group"><span className="input-label">City</span><input className="input" {...register("city", { required: "City is required." })} /></label>
          <label className="input-group"><span className="input-label">Pincode</span><input className="input" {...register("pincode", { required: "Pincode is required.", pattern: { value: /^\d{6}$/, message: "Pincode must be 6 digits." } })} /></label>
          <label className="input-group"><span className="input-label">Aadhaar</span><input className="input" {...register("aadhaar", { required: "Aadhaar is required.", pattern: { value: /^\d{12}$/, message: "Aadhaar must be 12 digits." } })} /></label>
          <label className="input-group"><span className="input-label">PAN</span><input className="input" {...register("pan", { required: "PAN is required." })} /></label>
          <label className="input-group"><span className="input-label">Bank Name</span><input className="input" {...register("bankName", { required: "Bank name is required." })} /></label>
          <label className="input-group"><span className="input-label">Account Number</span><input className="input" {...register("accountNumber", { required: "Account number is required.", pattern: { value: /^\d+$/, message: "Account number must be numeric." } })} /></label>
          <label className="input-group"><span className="input-label">IFSC</span><input className="input" {...register("ifsc", { required: "IFSC is required." })} /></label>
        </div>

        <div className="detail-grid">
          <label className="input-group"><span className="input-label">Role</span><input className="input" {...register("role", { required: "Role is required." })} /></label>
          <label className="input-group"><span className="input-label">Salary Type</span><select className="input" {...register("salaryType", { required: "Salary type is required." })}><option value="DAILY">DAILY</option><option value="MONTHLY">MONTHLY</option></select></label>
          <label className="input-group"><span className="input-label">Base Salary</span><input className="input" type="number" {...register("baseSalary", { required: salaryType === "MONTHLY" ? "Base salary is required." : false, min: { value: 0, message: "Invalid amount." }, valueAsNumber: true })} /></label>
          <label className="input-group"><span className="input-label">Hourly Rate</span><input className="input" type="number" {...register("hourlyRate", { required: salaryType === "DAILY" ? "Hourly rate is required." : false, min: { value: 0, message: "Invalid amount." }, valueAsNumber: true })} /></label>
        </div>

        {Object.values(errors)[0]?.message ? <p className="alert-error">{String(Object.values(errors)[0]?.message)}</p> : null}
        <Button type="submit" isLoading={loading}>{mode === "add" ? "Create Employee" : "Save Changes"}</Button>
      </form>
    </Modal>
  );
};
