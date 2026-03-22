"use client";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default function FaceMismatchPage() {
  return (
    <Card title="Face Mismatch Review">
      <EmptyState
        title="No flagged entries"
        description="Face mismatch approvals will appear here with approve/reject actions."
      />
    </Card>
  );
}
