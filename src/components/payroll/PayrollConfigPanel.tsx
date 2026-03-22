"use client";

import { PayrollConfig } from "@/types/payroll";

interface PayrollConfigPanelProps {
  config: PayrollConfig;
  disabled?: boolean;
  onUpdate: (key: keyof PayrollConfig, value: number | boolean) => void;
}

export const PayrollConfigPanel = ({
  config,
  disabled = false,
  onUpdate,
}: PayrollConfigPanelProps) => {
  return (
    <div className="config-grid">
      <label className="input-group">
        <span className="input-label">PF %</span>
        <input
          className="input"
          type="number"
          min={0}
          step={0.01}
          defaultValue={config.pfRate}
          disabled={disabled}
          onBlur={(event) => onUpdate("pfRate", Number(event.target.value || 0))}
        />
      </label>
      <label className="input-group">
        <span className="input-label">ESI %</span>
        <input
          className="input"
          type="number"
          min={0}
          step={0.01}
          defaultValue={config.esiRate}
          disabled={disabled}
          onBlur={(event) => onUpdate("esiRate", Number(event.target.value || 0))}
        />
      </label>
      <label className="input-group">
        <span className="input-label">TDS %</span>
        <input
          className="input"
          type="number"
          min={0}
          step={0.01}
          defaultValue={config.tdsRate}
          disabled={disabled}
          onBlur={(event) => onUpdate("tdsRate", Number(event.target.value || 0))}
        />
      </label>
      <label className="input-group">
        <span className="input-label">Overtime Rate</span>
        <input
          className="input"
          type="number"
          min={0}
          step={1}
          defaultValue={config.overtimeRate}
          disabled={disabled}
          onBlur={(event) => onUpdate("overtimeRate", Number(event.target.value || 0))}
        />
      </label>
      <label className="input-group">
        <span className="input-label">Meal Subsidy Value</span>
        <input
          className="input"
          type="number"
          min={0}
          step={1}
          defaultValue={config.mealSubsidyValue}
          disabled={disabled}
          onBlur={(event) =>
            onUpdate("mealSubsidyValue", Number(event.target.value || 0))
          }
        />
      </label>
      <label className="input-group">
        <span className="input-label">Working Days</span>
        <input
          className="input"
          type="number"
          min={1}
          step={1}
          defaultValue={config.workingDays}
          disabled={disabled}
          onBlur={(event) => onUpdate("workingDays", Number(event.target.value || 0))}
        />
      </label>
      <label className="input-group">
        <span className="input-label">TDS Enabled</span>
        <select
          className="input"
          disabled={disabled}
          defaultValue={String(config.tdsEnabled)}
          onChange={(event) => onUpdate("tdsEnabled", event.target.value === "true")}
        >
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>
      </label>
    </div>
  );
};
