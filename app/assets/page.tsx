import { TopBar } from "@/components/layout/TopBar";
import { KpiCard } from "@/components/shared/KpiCard";
import { AssetCard } from "@/components/assets/AssetCard";
import { getActiveAlerts, getLiveAssets } from "@/lib/simulation";
import { formatKw } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default function AssetsPage() {
  const assets = getLiveAssets();
  const alerts = getActiveAlerts();

  const generators = assets.filter((a) => ["solar_farm", "wind_turbine", "hydro_plant"].includes(a.type));
  const totalCapacityKw = generators.reduce((s, a) => s + a.capacityKw, 0);
  const totalOutputKw = generators.reduce((s, a) => s + a.currentOutputKw, 0);
  const avgHealth = Math.round(assets.reduce((s, a) => s + a.healthScore, 0) / assets.length);
  const needingAttention = assets.filter((a) => a.status !== "normal").length;

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Clean Energy Assets" subtitle="Live inventory and health across the VPP fleet" />

      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Fleet Size" value={`${assets.length} assets`} hint="6 asset classes, one VPP" />
          <KpiCard
            label="Generation Capacity"
            value={formatKw(totalCapacityKw)}
            accent="green"
            hint={`${formatKw(totalOutputKw)} producing now`}
          />
          <KpiCard
            label="Average Fleet Health"
            value={`${avgHealth}/100`}
            accent={avgHealth >= 90 ? "green" : "warning"}
            hint="weighted across all assets"
          />
          <KpiCard
            label="Needs Attention"
            value={`${needingAttention}`}
            accent={needingAttention === 0 ? "green" : "warning"}
            hint={needingAttention === 0 ? "fleet fully operational" : `${alerts.length} active alerts`}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} alert={alerts.find((al) => al.assetId === asset.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
