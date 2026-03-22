"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { auditService } from "@/services/audit.service";
import { AuditEntry } from "@/types/audit";

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await auditService.getRecentAsync(100);
      setEvents(data);
      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return <Skeleton height={260} />;
  }

  if (!events.length) {
    return (
      <Card title="Audit Trail">
        <EmptyState
          title="No audit events"
          description="No tracked audit events are available yet."
        />
      </Card>
    );
  }

  return (
    <Card title="Audit Trail">
      <DataTable
        columns={[
          { key: "timestamp", header: "Timestamp" },
          { key: "action", header: "Action" },
          { key: "role", header: "Role" },
          { key: "entityId", header: "Entity" },
          { key: "message", header: "Message" },
        ]}
        data={events}
      />
    </Card>
  );
}
