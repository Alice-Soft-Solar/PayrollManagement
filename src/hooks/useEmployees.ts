"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { employeeService } from "@/services/employee.service";
import {
  Employee,
  EmployeeFilters,
  EmployeeFormInput,
  EmployeeProfile,
} from "@/types/employee";

const defaultFilters: EmployeeFilters = {
  search: "",
  role: "ALL",
  status: "ALL",
};

export const useEmployees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filters, setFilters] = useState<EmployeeFilters>(defaultFilters);
  const [selectedProfile, setSelectedProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async (incomingFilters?: Partial<EmployeeFilters>) => {
    if (loading) {
      setLoading(true);
    } else {
      setIsFetching(true);
    }
    setError(null);

    try {
      const nextFilters = { ...filters, ...incomingFilters };
      const data = await employeeService.getEmployees(nextFilters);
      setEmployees(data);
      if (incomingFilters) {
        setFilters(nextFilters);
      }
    } catch {
      setError("Failed to fetch employees.");
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [filters, loading]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const addEmployee = useCallback(async (payload: EmployeeFormInput) => {
    setActionLoading(true);
    try {
      const employee = await employeeService.addEmployee(payload, user?.role);
      await fetchEmployees();
      return employee;
    } finally {
      setActionLoading(false);
    }
  }, [fetchEmployees, user?.role]);

  const updateEmployee = useCallback(async (id: string, payload: EmployeeFormInput) => {
    setActionLoading(true);
    try {
      const employee = await employeeService.updateEmployee(id, payload, user?.role);
      await fetchEmployees();
      return employee;
    } finally {
      setActionLoading(false);
    }
  }, [fetchEmployees, user?.role]);

  const deactivateEmployee = useCallback(async (id: string) => {
    setActionLoading(true);
    try {
      const employee = await employeeService.deactivateEmployee(id, user?.role);
      await fetchEmployees();
      return employee;
    } finally {
      setActionLoading(false);
    }
  }, [fetchEmployees, user?.role]);

  const activateEmployee = useCallback(async (id: string) => {
    setActionLoading(true);
    try {
      const employee = await employeeService.activateEmployee(id, user?.role);
      await fetchEmployees();
      return employee;
    } finally {
      setActionLoading(false);
    }
  }, [fetchEmployees, user?.role]);

  const deleteEmployee = useCallback(async (id: string) => {
    setActionLoading(true);
    try {
      await employeeService.deleteEmployee(id, user?.role);
      await fetchEmployees();
    } finally {
      setActionLoading(false);
    }
  }, [fetchEmployees, user?.role]);

  const getEmployeeProfile = useCallback(async (id: string) => {
    setProfileLoading(true);
    setError(null);
    try {
      const profile = await employeeService.getEmployeeProfile(id);
      setSelectedProfile(profile);
      return profile;
    } catch {
      setError("Failed to load employee detail.");
      throw new Error("Failed to load employee detail.");
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const clearSelectedProfile = useCallback(() => {
    setSelectedProfile(null);
  }, []);

  return {
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
  };
};
