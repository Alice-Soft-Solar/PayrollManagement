"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { PayrollPreview } from "@/components/payroll/PayrollPreview";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { usePayroll } from "@/hooks/usePayroll";
import { useRole } from "@/hooks/useRole";

export default function PayrollPreviewPage() {
  const params = useSearchParams();
  const { user } = useAuth();
  const { canPerform } = useRole(user?.role);
  const { showToast } = useToast();
  const {
    month,
    preview,
    currentMonthRun,
    payrollLocked,
    loading,
    actionLoading,
    error,
    setMonth,
    generatePreview,
    runPayroll,
  } = usePayroll();
  const canRunPayroll = canPerform("payroll:run");
  const hasCurrentRun = Boolean(currentMonthRun);

  useEffect(() => {
    const selectedMonth = params.get("month");
    if (selectedMonth && selectedMonth !== month) {
      setMonth(selectedMonth);
    }
  }, [month, params, setMonth]);

  useEffect(() => {
    generatePreview().catch(() => {
      showToast("Unable to load payroll preview.", "error");
    });
  }, [month, generatePreview, showToast]);

  const handleRun = async () => {
    try {
      await runPayroll();
      showToast("Payroll run completed.", "success");
    } catch {
      showToast("Payroll run failed.", "error");
    }
  };

  return (
    <div className="stack-24">
      <Card title="Payroll Preview">
        <div className="section-actions">
          <div className="row-actions">
            <Link href="/payroll">
              <Button variant="secondary">
                <ArrowLeft size={16} />
                Back to Payroll
              </Button>
            </Link>
            <input
              className="input"
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            />
          </div>
          <Button
            onClick={handleRun}
            disabled={payrollLocked || !canRunPayroll || hasCurrentRun}
            isLoading={actionLoading}
          >
            <CheckCircle2 size={16} />
            Run Payroll
          </Button>
        </div>
        {error ? <p className="alert-error">{error}</p> : null}
      </Card>

      <Card title="Preview Output">
        {loading ? <Skeleton height={260} /> : preview ? <PayrollPreview preview={preview} /> : null}
      </Card>
    </div>
  );
}
