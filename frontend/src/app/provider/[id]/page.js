import providers from "@/data/providers-inr.json";
import { rankProviders } from "@/lib/ranking";

export default async function ProviderDetailPage({ params }) {
  const { id } = await params;

  const ranked = rankProviders(providers, "best_overall");
  const provider = ranked.find((p) => p.id === id);

  if (!provider) {
    return (
      <main className="comparison-container">
        <section className="comparison-content">
          <p className="empty-state">Provider not found.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="comparison-container">
      <section className="comparison-content">
        <p className="launching-soon-text">Provider detail</p>
        <h1 className="waitlist-title" style={{ marginBottom: 16 }}>{provider.name}</h1>
        <span className={`status-pill ${provider.isLive ? "live" : "offline"}`}>
          {provider.isLive ? "Live" : "Offline"}
        </span>
        <p className="waitlist-description" style={{ marginBottom: 16 }}>{provider.notes}</p>

        <article className="provider-card">
          <div className="provider-metrics">
            <p><span>Effective Price</span>₹{provider.effectivePrice.toFixed(2)}</p>
            <p><span>KYC</span>{provider.kycLevel}</p>
            <p><span>Payment Methods</span>{provider.paymentMethods.join(", ")}</p>
            <p><span>Settlement</span>{provider.settlementMins[0]}-{provider.settlementMins[1]} mins</p>
            <p><span>Limits</span>₹{provider.limitsInr.min.toLocaleString()} - ₹{provider.limitsInr.max.toLocaleString()}</p>
            <p><span>Review</span>{provider.review.rating}/5 ({provider.review.sampleSize})</p>
          </div>
        </article>
      </section>
    </main>
  );
}
