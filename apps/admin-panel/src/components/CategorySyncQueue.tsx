import { useEffect, useState, useCallback } from "react";
import { Check, X, RefreshCw, ShieldAlert } from "lucide-react";
import { categorySyncQueueService } from "../services";
import type { CategorySyncConflict } from "../services";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface CategorySyncQueueProps {
  // Lets the parent (sidebar badge) know how many are pending
  onPendingCountChange?: (count: number) => void;
}

export function CategorySyncQueue({
  onPendingCountChange,
}: CategorySyncQueueProps) {
  const [conflicts, setConflicts] = useState<CategorySyncConflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categorySyncQueueService.getPending();
      setConflicts(data);
      onPendingCountChange?.(data.length);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load category sync queue",
      );
    } finally {
      setLoading(false);
    }
  }, [onPendingCountChange]);

  useEffect(() => {
    void load();
  }, [load]);

  const resolve = async (productId: string, decision: "approve" | "deny") => {
    try {
      setResolvingId(productId);
      if (decision === "approve") {
        await categorySyncQueueService.approve(productId);
        toast.success("Category updated to BUSY value");
      } else {
        await categorySyncQueueService.deny(productId);
        toast.success("BUSY change rejected — current category kept");
      }
      const remaining = conflicts.filter((c) => c.productId !== productId);
      setConflicts(remaining);
      onPendingCountChange?.(remaining.length);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not resolve this conflict",
      );
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            Category Sync Review
          </h3>
          <p className="text-sm text-muted-foreground">
            BUSY wants to change a category that was manually set here. Nothing
            is applied until you decide.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh
        </Button>
      </div>

      <Card>
        {loading ? (
          <CardContent className="py-10 text-center text-muted-foreground">
            Loading…
          </CardContent>
        ) : error ? (
          <CardContent className="py-10 text-center">
            <p className="text-destructive mb-3">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void load()}>
              Retry
            </Button>
          </CardContent>
        ) : conflicts.length === 0 ? (
          <CardContent className="py-10 text-center text-muted-foreground">
            No pending conflicts — every manually-set category matches BUSY.
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Current (admin-set)</TableHead>
                <TableHead>BUSY wants</TableHead>
                <TableHead>Detected</TableHead>
                <TableHead className="text-right">Decision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conflicts.map((c) => (
                <TableRow key={c.productId}>
                  <TableCell className="font-medium">{c.productName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{c.currentCategory}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.busyCategory}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {c.detectedAt
                      ? new Date(c.detectedAt).toLocaleString("en-IN")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={resolvingId === c.productId}
                      onClick={() => void resolve(c.productId, "deny")}
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Keep current
                    </Button>
                    <Button
                      size="sm"
                      disabled={resolvingId === c.productId}
                      onClick={() => void resolve(c.productId, "approve")}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Use BUSY
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
