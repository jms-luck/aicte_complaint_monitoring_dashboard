import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getInstitution, getInstitutionCases } from "@/api/institutions";
import { getOverlaps } from "@/api/overlaps";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge, OverlapStatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Edit,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  Briefcase,
  AlertTriangle,
  GitMerge,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className={`rounded-lg p-4 ${color}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────────

function OverviewTab({ id }: { id: string }) {
  const { data: institution } = useQuery({
    queryKey: ["institution", id],
    queryFn: () => getInstitution(id),
  });

  if (!institution) return null;

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
      {/* Contact info */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-400" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase">Type</p>
              <p className="text-gray-900">{institution.institution_type ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase">Status</p>
              <Badge variant={institution.is_active ? "success" : "secondary"}>
                {institution.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          {institution.address && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-gray-900">{institution.address}</p>
                <p className="text-gray-500">
                  {[institution.city, institution.district, institution.state]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
          )}

          {institution.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">{institution.phone}</span>
            </div>
          )}

          {institution.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <a href={`mailto:${institution.email}`} className="text-indigo-600 hover:underline">
                {institution.email}
              </a>
            </div>
          )}

          {institution.website && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-400" />
              <a
                href={institution.website}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:underline"
              >
                {institution.website}
              </a>
            </div>
          )}

          <div className="pt-1">
            <p className="text-xs text-gray-400">
              Record created: {formatDate(institution.created_at)} ·
              Last updated: {formatDate(institution.updated_at)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="space-y-4">
        <StatCard
          label="Total Complaints"
          value={(institution as any).total_complaints ?? 0}
          icon={FileText}
          color="bg-blue-50 text-blue-800"
        />
        <StatCard
          label="Active Cases"
          value={(institution as any).active_cases ?? 0}
          icon={Briefcase}
          color="bg-indigo-50 text-indigo-800"
        />
      </div>
    </div>
  );
}

// ── Cases tab ─────────────────────────────────────────────────────────────────

function CasesTab({ id }: { id: string }) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["institution-cases", id, page],
    queryFn: () => getInstitutionCases(id, { page, size: 15 }),
  });

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          No cases found for this institution.
        </p>
      ) : (
        <>
          <div className="space-y-2">
            {data?.items.map((c) => (
              <Link
                key={c.id}
                to={`/cases/${c.id}`}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-indigo-700">
                      {c.case_number}
                    </span>
                    <Badge variant="outline" className="text-xs">{c.bureau?.code ?? "—"}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{c.subject}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={c.status} />
                  {!!(c.expected_disposal_date && new Date(c.expected_disposal_date) < new Date() && c.status !== "disposed" && c.status !== "closed") && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>

          {data && data.pages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-400">{data.total} total cases</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Prev
                </Button>
                <span className="text-xs text-gray-500 self-center">
                  {page} / {data.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Overlaps tab ──────────────────────────────────────────────────────────────

function OverlapsTab({ id }: { id: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["overlaps", { institution_id: id }],
    queryFn: () => getOverlaps({ size: 20 }),
  });

  const institutionOverlaps = data?.items ?? [];

  if (isLoading) return <Skeleton className="h-32 w-full" />;

  if (institutionOverlaps.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        No overlap alerts for this institution.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {institutionOverlaps.map((alert) => (
        <Link
          key={alert.id}
          to={`/overlaps/${alert.id}`}
          className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50 p-3 hover:bg-amber-100 transition-colors"
        >
          <div>
            <div className="flex items-center gap-2">
              <GitMerge className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-amber-800 text-sm">{alert.alert_number}</span>
              <Badge variant="secondary" className="text-xs capitalize">
                {alert.match_type.replace(/_/g, " ")}
              </Badge>
            </div>
            <p className="text-xs text-amber-700 mt-0.5">
              Bureaus: {(alert.bureaus_involved ?? []).length} involved
            </p>
          </div>
          <div className="flex items-center gap-2">
            <OverlapStatusBadge status={alert.status} />
            <ExternalLink className="h-4 w-4 text-amber-500" />
          </div>
        </Link>
      ))}
    </div>
  );
}

// ── Aliases tab ───────────────────────────────────────────────────────────────

function AliasesTab({ id }: { id: string }) {
  const { data: institution } = useQuery({
    queryKey: ["institution", id],
    queryFn: () => getInstitution(id),
  });

  const ALIAS_LABELS: Record<string, string> = {
    abbreviation: "Abbreviation",
    former_name: "Former Name",
    common_name: "Common Name",
    other: "Other",
  };

  if (!(institution as any)?.aliases || (institution as any).aliases.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        No aliases registered for this institution.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {(institution as any).aliases.map((alias: any) => (
        <div
          key={alias.id}
          className="flex items-center justify-between rounded border border-gray-100 p-3"
        >
          <div>
            <p className="text-sm font-medium text-gray-900">{alias.alias}</p>
            <p className="text-xs text-gray-400">{ALIAS_LABELS[alias.alias_type] ?? alias.alias_type}</p>
          </div>
          <Badge variant="secondary" className="capitalize text-xs">
            {alias.alias_type.replace(/_/g, " ")}
          </Badge>
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function InstitutionProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: institution, isLoading } = useQuery({
    queryKey: ["institution", id],
    queryFn: () => getInstitution(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!institution) {
    return <div className="p-6 text-gray-500">Institution not found.</div>;
  }

  return (
    <div>
      <PageHeader
        title={institution.name}
        subtitle={
          institution.permanent_id
            ? `AICTE ID: ${institution.permanent_id}`
            : "No AICTE Permanent ID registered"
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Institutions", href: "/institutions" },
          { label: institution.name },
        ]}
        actions={
          <div className="flex gap-2">
            <Badge
              variant={institution.is_active ? "success" : "secondary"}
              className="self-center"
            >
              {institution.is_active ? "Active" : "Inactive"}
            </Badge>
            <Button
              variant="outline"
              onClick={() => navigate(`/institutions/${id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        }
      />

      <div className="p-6">
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cases">
              Cases
              {((institution as any).active_cases ?? 0) > 0 && (
                <span className="ml-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs px-1.5 py-0.5">
                  {(institution as any).active_cases ?? 0}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="overlaps">Overlap Alerts</TabsTrigger>
            <TabsTrigger value="aliases">
              Aliases
              {((institution as any).aliases?.length ?? 0) > 0 && (
                <span className="ml-1.5 rounded-full bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5">
                  {(institution as any).aliases?.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab id={id!} />
          </TabsContent>

          <TabsContent value="cases">
            <CasesTab id={id!} />
          </TabsContent>

          <TabsContent value="overlaps">
            <OverlapsTab id={id!} />
          </TabsContent>

          <TabsContent value="aliases">
            <AliasesTab id={id!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
