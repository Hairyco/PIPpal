import { useState } from 'react';
import { Building2, CheckCircle2, User } from 'lucide-react';
import {
  agencyServices,
  individualSpecialties,
  supplierTypeInfo,
  type SupplierType,
} from '../../data/supplierVetting';

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/30';

const labelClass = 'mb-1.5 block text-xs font-medium text-muted-foreground';

export function SupplierApplicationForm() {
  const [supplierType, setSupplierType] = useState<SupplierType>('individual');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="dex-card text-center">
        <div className="relative z-[1] py-8">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
          <h3 className="mt-4 text-xl font-bold text-white">Application received</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Thanks for applying to become a Rex preferred supplier. Our vetting team will review
            your submission and email you within 5–7 business days with next steps.
          </p>
        </div>
      </div>
    );
  }

  const typeInfo = supplierTypeInfo[supplierType];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="mb-3 text-sm font-medium text-white">I am applying as</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(['individual', 'agency'] as const).map((type) => {
            const info = supplierTypeInfo[type];
            const selected = supplierType === type;
            const Icon = type === 'individual' ? User : Building2;

            return (
              <button
                key={type}
                type="button"
                onClick={() => setSupplierType(type)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  selected
                    ? 'border-sky-500/50 bg-sky-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className={`mt-0.5 h-5 w-5 shrink-0 ${selected ? 'text-sky-400' : 'text-muted-foreground'}`}
                  />
                  <div>
                    <p className="font-semibold text-white">{info.title}</p>
                    <p className="text-xs text-sky-400">{info.subtitle}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{info.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="dex-card">
        <div className="relative z-[1] space-y-4">
          <h3 className="font-semibold text-white">{typeInfo.title} application</h3>

          {supplierType === 'individual' ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="full-name">
                    Full name
                  </label>
                  <input id="full-name" name="fullName" required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="portfolio">
                    Portfolio URL
                  </label>
                  <input
                    id="portfolio"
                    name="portfolio"
                    type="url"
                    placeholder="https://"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="github">
                    GitHub or LinkedIn
                  </label>
                  <input
                    id="github"
                    name="profile"
                    type="url"
                    placeholder="https://"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="specialty">
                    Primary specialty
                  </label>
                  <select id="specialty" name="specialty" required className={inputClass}>
                    <option value="">Select…</option>
                    {individualSpecialties.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass} htmlFor="experience">
                    Years of experience
                  </label>
                  <select id="experience" name="experience" required className={inputClass}>
                    <option value="">Select…</option>
                    <option value="1-2">1–2 years</option>
                    <option value="3-5">3–5 years</option>
                    <option value="5-10">5–10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="bio">
                  About you & recent work
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  required
                  placeholder="What do you build? Link 2–3 shipped projects founders should know about."
                  className={inputClass}
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="agency-name">
                    Agency / studio name
                  </label>
                  <input id="agency-name" name="agencyName" required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="website">
                    Website
                  </label>
                  <input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="contact-name">
                    Primary contact
                  </label>
                  <input id="contact-name" name="contactName" required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="agency-email">
                    Work email
                  </label>
                  <input
                    id="agency-email"
                    name="email"
                    type="email"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="team-size">
                    Team size
                  </label>
                  <select id="team-size" name="teamSize" required className={inputClass}>
                    <option value="">Select…</option>
                    <option value="2-5">2–5 people</option>
                    <option value="6-15">6–15 people</option>
                    <option value="16-50">16–50 people</option>
                    <option value="50+">50+ people</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass} htmlFor="service">
                    Core service
                  </label>
                  <select id="service" name="service" required className={inputClass}>
                    <option value="">Select…</option>
                    {agencyServices.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="case-studies">
                  Case studies or portfolio link
                </label>
                <input
                  id="case-studies"
                  name="caseStudies"
                  type="url"
                  placeholder="https://"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="agency-bio">
                  About your agency
                </label>
                <textarea
                  id="agency-bio"
                  name="bio"
                  rows={4}
                  required
                  placeholder="Services, industries, typical project size, and notable clients or launches."
                  className={inputClass}
                />
              </div>
            </>
          )}

          <label className="flex items-start gap-2.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              required
              className="mt-0.5 rounded border-white/20 bg-white/5"
            />
            I understand Rex vetting includes identity verification, portfolio review, and a
            quality assessment before preferred supplier status is granted.
          </label>

          <button type="submit" className="dex-btn w-full justify-center sm:w-auto">
            Submit for vetting
          </button>
        </div>
      </div>
    </form>
  );
}
