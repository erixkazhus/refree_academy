import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface RulebookPdfDocument {
  filename: string;
  title: string;
  version: string;
  effectiveDate: string;
  description: string;
  sizeBytes: number;
  available: boolean;
  downloadUrl: string;
}

const FALLBACK_PDFS: RulebookPdfDocument[] = [
  {
    filename: 'FIBA-Official-Basketball-Rules-2026-v1.1.pdf',
    title: '2026 Official Basketball Rules & Basketball Equipment',
    version: 'Version 1.1',
    effectiveDate: '1 October 2026',
    description:
      'Complete 2026 FIBA rulebook covering Rules 1–8 (Articles 1–51), Basketball Equipment specifications, Referees’ Signals, Scoresheet, Protest Procedure, and Instant Replay System / Head Coach’s Challenge.',
    sizeBytes: 7909740,
    available: true,
    downloadUrl: '/api/pdfs/FIBA-Official-Basketball-Rules-2026-v1.1.pdf',
  },
  {
    filename: 'FIBA-Official-Basketball-Rules-2026-OBRI-Interpretations-v1.0.pdf',
    title: '2026 Official Basketball Rules – Official Interpretations (OBRI)',
    version: 'Version 1.0',
    effectiveDate: '1 October 2026',
    description:
      'Official Basketball Rules Interpretations (OBRI) clarifying game situations, disruptive and flagrant fouls, technical foul categories, cylinder/verticality, shot clock resets, and IRS review scenarios.',
    sizeBytes: 2385953,
    available: true,
    downloadUrl: '/api/pdfs/FIBA-Official-Basketball-Rules-2026-OBRI-Interpretations-v1.0.pdf',
  },
];

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return 'PDF';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

export const PdfDownloadsPage: React.FC = () => {
  const [pdfs, setPdfs] = useState<RulebookPdfDocument[]>(FALLBACK_PDFS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadPdfs = async () => {
      try {
        const res = await fetch('/api/pdfs', { credentials: 'include' });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = (await res.json()) as RulebookPdfDocument[];
        if (active && Array.isArray(data) && data.length > 0) {
          setPdfs(data);
        }
      } catch {
        if (active) {
          setError('Loaded cached document catalog because the backend metadata request failed.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    loadPdfs();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10">
      <div className="mb-6">
        <Link
          to="/rules"
          className="text-sm font-medium text-[#5a5852] hover:text-[#f54e00] no-underline inline-flex items-center gap-1.5"
        >
          ← Back to Official FIBA Rulebook Study Guide
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-[#26251e] text-white rounded-2xl p-8 md:p-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6 border border-[#26251e]">
        <div className="max-w-3xl">
          <span className="inline-block bg-[#f54e00] text-white rounded-full px-3.5 py-1 text-[11px] font-mono-clock uppercase tracking-wider font-semibold mb-4">
            Official FIBA Documents · 2026 Edition
          </span>
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight m-0 text-white">
            Official FIBA Rulebook PDF Downloads
          </h1>
          <p className="text-sm md:text-base text-[#e6e5e0] mt-3 mb-0 leading-relaxed">
            Download the official 2026 FIBA Basketball Rules and Official Interpretations (OBRI) PDF manuals directly for offline study and referee exam preparation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link to="/rules" className="btn-on-image no-underline">
            Browse Articles Online →
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-[#cfcdc4] bg-white px-4 py-3 text-xs text-[#5a5852]">
          {error}
        </div>
      )}

      {/* Document Cards */}
      <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {pdfs.map((doc) => (
          <article
            key={doc.filename}
            className="border border-[#e6e5e0] bg-white rounded-xl p-7 flex flex-col justify-between gap-6 hover:border-[#cfcdc4] transition-colors"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-[#26251e] text-white rounded-full px-3 py-1 text-xs font-mono-clock font-medium">
                    {doc.version}
                  </span>
                  <span className="bg-[#f7f7f4] border border-[#e6e5e0] text-[#26251e] rounded-full px-3 py-1 text-xs font-medium">
                    Effective {doc.effectiveDate}
                  </span>
                </div>
                <span className="text-xs font-mono-clock font-medium text-[#807d72]">
                  PDF · {formatBytes(doc.sizeBytes)}
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-medium text-[#26251e] m-0">
                {doc.title}
              </h2>

              <p className="text-sm text-[#5a5852] leading-relaxed mt-3 mb-0">
                {doc.description}
              </p>

              <p className="text-xs font-mono-clock text-[#807d72] mt-4 mb-0 break-all">
                {doc.filename}
              </p>
            </div>

            <div className="pt-4 border-t border-[#e6e5e0] flex flex-wrap items-center justify-between gap-3">
              {doc.available ? (
                <a
                  href={doc.downloadUrl}
                  download={doc.filename}
                  className="btn-primary no-underline inline-flex items-center gap-2"
                >
                  Download PDF ↓
                </a>
              ) : (
                <span className="text-xs font-medium text-[#cf2d56]">
                  File currently unavailable on server
                </span>
              )}
              {loading && (
                <span className="text-xs text-[#807d72]">Checking file status…</span>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
};
