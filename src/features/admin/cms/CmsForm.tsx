import type { LandingConfig } from "@/types/config";
import { useConfigStore } from "@/stores/useConfigStore";
import { CollapsibleSection } from "@/features/admin/cms/CollapsibleSection";

const ACCENT_OPTIONS = [
  { id: "teal", color: "#0E8C7E" },
  { id: "indigo", color: "#4A55E5" },
  { id: "amber", color: "#D77F1F" },
  { id: "ruby", color: "#C53A4C" },
  { id: "violet", color: "#7A3CC2" },
  { id: "forest", color: "#3F7A3A" },
];

export function CmsForm() {
  const config = useConfigStore((s) => s.config);
  const patchConfig = useConfigStore((s) => s.patchConfig);
  const lastSavedChatMode = useConfigStore((s) => s.lastSavedChatMode);
  const chatModeDirty =
    lastSavedChatMode !== null && config.chat_mode !== lastSavedChatMode;

  const patchHero = (sub: Partial<LandingConfig["hero"]>) =>
    patchConfig({ hero: sub });
  const patchHeroCard = (sub: Partial<LandingConfig["hero"]["card"]>) =>
    patchConfig({ hero: { card: sub } });
  const patchTheme = (sub: Partial<LandingConfig["theme"]>) =>
    patchConfig({ theme: sub });
  const patchTrust = (sub: Partial<LandingConfig["trust"]>) =>
    patchConfig({ trust: sub });
  const patchSection1 = (sub: Partial<LandingConfig["section1"]>) =>
    patchConfig({ section1: sub });
  const patchSection2 = (sub: Partial<LandingConfig["section2"]>) =>
    patchConfig({ section2: sub });
  const patchFooter = (sub: Partial<LandingConfig["footer"]>) =>
    patchConfig({ footer: sub });
  const patchWidget = (sub: Partial<LandingConfig["widget"]>) =>
    patchConfig({ widget: sub });

  const setS1Item = (
    i: number,
    key: keyof LandingConfig["section1"]["items"][number],
    v: string,
  ) => {
    const items = config.section1.items.map((it, ix) =>
      ix === i ? { ...it, [key]: v } : it,
    );
    patchSection1({ items });
  };
  const setS1Bullet = (i: number, bi: number, v: string) => {
    const items = config.section1.items.map((it, ix) => {
      if (ix !== i) return it;
      const bullets = [...it.bullets];
      bullets[bi] = v;
      return { ...it, bullets };
    });
    patchSection1({ items });
  };
  const setS2Item = (
    i: number,
    key: keyof LandingConfig["section2"]["items"][number],
    v: string,
  ) => {
    const items = config.section2.items.map((it, ix) =>
      ix === i ? { ...it, [key]: v } : it,
    );
    patchSection2({ items });
  };
  const setStat = (i: number, key: "num" | "lbl", v: string) => {
    const items = config.stats.items.map((it, ix) =>
      ix === i ? { ...it, [key]: v } : it,
    );
    patchConfig({ stats: { items } });
  };
  const setRow = (i: number, key: "k" | "v", v: string) => {
    const rows = config.hero.card.rows.map((r, ix) =>
      ix === i ? { ...r, [key]: v } : r,
    );
    patchHeroCard({ rows });
  };

  return (
    <>
      <CollapsibleSection ix="✱" title="Chat mode" defaultOpen>
        <p
          style={{
            color: "var(--ink-2)",
            fontSize: 13,
            marginBottom: 12,
            lineHeight: 1.5,
          }}
        >
          Controls whether the public landing chat widget is open to anonymous
          visitors, or only to signed-in team members.
        </p>
        <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
          {([
            {
              value: "public",
              title: "Public",
              hint: "Anyone can chat with Aira from the marketing landing page.",
            },
            {
              value: "internal",
              title: "Internal",
              hint: 'Anonymous visitors see a "Sign in to chat" prompt. Signed-in users (any role) chat normally.',
            },
          ] as const).map((opt) => (
            <label
              key={opt.value}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: 10,
                padding: "10px 12px",
                border:
                  config.chat_mode === opt.value
                    ? "1px solid var(--teal)"
                    : "1px solid var(--line)",
                borderRadius: 8,
                cursor: "pointer",
                background:
                  config.chat_mode === opt.value
                    ? "rgba(31, 199, 174, 0.06)"
                    : "transparent",
              }}
            >
              <input
                type="radio"
                name="chat_mode"
                value={opt.value}
                checked={config.chat_mode === opt.value}
                onChange={() => patchConfig({ chat_mode: opt.value })}
                style={{ marginTop: 3, accentColor: "var(--teal)" }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{opt.title}</div>
                <div style={{ color: "var(--ink-2)", fontSize: 12.5, marginTop: 2 }}>
                  {opt.hint}
                </div>
              </div>
            </label>
          ))}
        </div>
        {lastSavedChatMode !== null && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 9999,
              fontSize: 12,
              fontFamily: "var(--mono)",
              color: "var(--ink-2)",
              background: "var(--surface-2, #f6f7f8)",
              border: chatModeDirty
                ? "1px dashed var(--amber, #D77F1F)"
                : "1px solid var(--line)",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 9999,
                background:
                  lastSavedChatMode === "internal"
                    ? "var(--amber, #D77F1F)"
                    : "var(--teal)",
                display: "inline-block",
              }}
            />
            Currently saved:{" "}
            <b style={{ color: "var(--ink)" }}>
              {lastSavedChatMode === "public" ? "Public" : "Internal"}
            </b>
            {chatModeDirty && (
              <span style={{ color: "var(--amber, #D77F1F)", marginLeft: 4 }}>
                · unsaved change
              </span>
            )}
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection ix="◐" title="Public landing visibility" defaultOpen>
        <p
          style={{
            color: "var(--ink-2)",
            fontSize: 13,
            marginBottom: 12,
            lineHeight: 1.5,
          }}
        >
          When hidden, visiting <code>/</code> redirects straight to{" "}
          <code>/login</code>. Useful for internal-only deployments where the
          marketing page isn&apos;t meant for the public.
        </p>
        <label
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 10,
            padding: "10px 12px",
            border: "1px solid var(--line)",
            borderRadius: 8,
            cursor: "pointer",
            background: config.landing_hidden
              ? "rgba(31, 199, 174, 0.06)"
              : "transparent",
            borderColor: config.landing_hidden ? "var(--teal)" : "var(--line)",
          }}
        >
          <input
            type="checkbox"
            checked={!!config.landing_hidden}
            onChange={(e) => patchConfig({ landing_hidden: e.target.checked })}
            style={{ marginTop: 3, accentColor: "var(--teal)" }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              Hide public landing page
            </div>
            <div style={{ color: "var(--ink-2)", fontSize: 12.5, marginTop: 2 }}>
              {config.landing_hidden
                ? 'Anonymous visitors land on the sign-in page.'
                : 'The marketing landing page is publicly reachable at "/".'}
            </div>
          </div>
        </label>
      </CollapsibleSection>

      <CollapsibleSection ix="01" title="Identity" defaultOpen>
        <label className="field">
          <div className="field-label">
            <span>Brand name</span>
            <span>{config.brand.length}/40</span>
          </div>
          <input
            className="input"
            value={config.brand}
            onChange={(e) => patchConfig({ brand: e.target.value })}
          />
        </label>
        <label className="field">
          <div className="field-label">
            <span>Tagline</span>
          </div>
          <input
            className="input"
            value={config.tagline}
            onChange={(e) => patchConfig({ tagline: e.target.value })}
          />
        </label>
        <label className="field">
          <div className="field-label">
            <span>Nav items</span>
            <span>comma-separated</span>
          </div>
          <input
            className="input"
            value={config.nav.join(", ")}
            onChange={(e) =>
              patchConfig({
                nav: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
          />
        </label>
      </CollapsibleSection>

      <CollapsibleSection ix="02" title="Theme">
        <div className="field">
          <div className="field-label">
            <span>Accent color</span>
            <span>{config.theme.accent.toUpperCase()}</span>
          </div>
          <div className="swatch-row">
            {ACCENT_OPTIONS.map((o) => (
              <button
                type="button"
                key={o.id}
                className="swatch"
                style={{ background: o.color }}
                data-on={config.theme.accent === o.color}
                onClick={() => patchTheme({ accent: o.color })}
                aria-label={o.id}
              />
            ))}
            <label
              className="swatch"
              style={{
                background: "var(--paper)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <input
                type="color"
                value={config.theme.accent}
                onChange={(e) => patchTheme({ accent: e.target.value })}
                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
              />
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--muted)" strokeWidth="1.3">
                <path d="M7 2v10M2 7h10" />
              </svg>
            </label>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection ix="03" title="Hero">
        <label className="field">
          <div className="field-label"><span>Eyebrow</span></div>
          <input
            className="input"
            value={config.hero.eyebrow}
            onChange={(e) => patchHero({ eyebrow: e.target.value })}
          />
        </label>
        <label className="field">
          <div className="field-label">
            <span>Title</span>
            <span>supports &lt;em&gt; · &lt;br&gt;</span>
          </div>
          <textarea
            className="textarea"
            rows={3}
            value={config.hero.title}
            onChange={(e) => patchHero({ title: e.target.value })}
          />
        </label>
        <label className="field">
          <div className="field-label"><span>Body</span></div>
          <textarea
            className="textarea"
            rows={4}
            value={config.hero.body}
            onChange={(e) => patchHero({ body: e.target.value })}
          />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <label className="field">
            <div className="field-label"><span>Primary CTA</span></div>
            <input
              className="input"
              value={config.hero.ctaPrimary}
              onChange={(e) => patchHero({ ctaPrimary: e.target.value })}
            />
          </label>
          <label className="field">
            <div className="field-label"><span>Secondary CTA</span></div>
            <input
              className="input"
              value={config.hero.ctaSecondary}
              onChange={(e) => patchHero({ ctaSecondary: e.target.value })}
            />
          </label>
        </div>
      </CollapsibleSection>

      <CollapsibleSection ix="04" title="Hero highlight card">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 8 }}>
          <label className="field">
            <div className="field-label"><span>Card label</span></div>
            <input
              className="input"
              value={config.hero.card.label}
              onChange={(e) => patchHeroCard({ label: e.target.value })}
            />
          </label>
          <label className="field">
            <div className="field-label"><span>Status pill</span></div>
            <input
              className="input"
              value={config.hero.card.livePill}
              onChange={(e) => patchHeroCard({ livePill: e.target.value })}
            />
          </label>
        </div>
        <div className="field">
          <div className="field-label"><span>Rows</span></div>
          {config.hero.card.rows.map((r, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 6, marginBottom: 6 }}>
              <input className="input" value={r.k} onChange={(e) => setRow(i, "k", e.target.value)} />
              <input className="input" value={r.v} onChange={(e) => setRow(i, "v", e.target.value)} />
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection ix="05" title="Trust strip">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <label className="field">
            <div className="field-label"><span>Headline</span></div>
            <input
              className="input"
              value={config.trust.count}
              onChange={(e) => patchTrust({ count: e.target.value })}
            />
          </label>
          <label className="field">
            <div className="field-label"><span>Sub</span></div>
            <input
              className="input"
              value={config.trust.sub}
              onChange={(e) => patchTrust({ sub: e.target.value })}
            />
          </label>
        </div>
      </CollapsibleSection>

      <CollapsibleSection ix="06" title="Marquee">
        <label className="field">
          <div className="field-label">
            <span>Items</span>
            <span>comma-separated</span>
          </div>
          <textarea
            className="textarea"
            rows={2}
            value={config.marquee.join(", ")}
            onChange={(e) =>
              patchConfig({
                marquee: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
          />
        </label>
      </CollapsibleSection>

      <CollapsibleSection ix="07" title={`Section 1 · ${config.section1.eyebrow}`}>
        <label className="field">
          <div className="field-label"><span>Eyebrow</span></div>
          <input
            className="input"
            value={config.section1.eyebrow}
            onChange={(e) => patchSection1({ eyebrow: e.target.value })}
          />
        </label>
        <label className="field">
          <div className="field-label"><span>Title</span></div>
          <textarea
            className="textarea"
            rows={2}
            value={config.section1.title}
            onChange={(e) => patchSection1({ title: e.target.value })}
          />
        </label>
        <label className="field">
          <div className="field-label"><span>Body</span></div>
          <textarea
            className="textarea"
            rows={3}
            value={config.section1.body}
            onChange={(e) => patchSection1({ body: e.target.value })}
          />
        </label>
        <div className="field">
          <div className="field-label"><span>Items</span></div>
          {config.section1.items.map((p, i) => (
            <details
              key={i}
              style={{
                marginBottom: 8,
                border: "1px solid var(--rule)",
                borderRadius: 10,
                padding: "10px 14px",
                background: "var(--paper)",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontSize: 13.5,
                  fontWeight: 500,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  <span style={{ fontFamily: "var(--mono)", color: "var(--muted)", fontSize: 11, marginRight: 8 }}>
                    {p.n}
                  </span>
                  {p.title}
                </span>
                {p.featured && (
                  <span className="pill" style={{ color: "var(--teal-deep)", borderColor: "var(--teal)" }}>
                    <span className="pill-dot" />
                    Featured
                  </span>
                )}
              </summary>
              <div style={{ marginTop: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  <input
                    className="input"
                    value={p.title}
                    onChange={(e) => setS1Item(i, "title", e.target.value)}
                    placeholder="Title"
                  />
                  <input
                    className="input"
                    value={p.meta}
                    onChange={(e) => setS1Item(i, "meta", e.target.value)}
                    placeholder="Meta"
                  />
                </div>
                <div style={{ marginTop: 6 }}>
                  {p.bullets.map((b, bi) => (
                    <input
                      key={bi}
                      className="input"
                      value={b}
                      onChange={(e) => setS1Bullet(i, bi, e.target.value)}
                      placeholder={`Bullet ${bi + 1}`}
                      style={{ marginBottom: 6 }}
                    />
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection ix="08" title="Stats">
        {config.stats.items.map((s, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 6, marginBottom: 6 }}>
            <input
              className="input"
              value={s.num}
              onChange={(e) => setStat(i, "num", e.target.value)}
            />
            <input
              className="input"
              value={s.lbl}
              onChange={(e) => setStat(i, "lbl", e.target.value)}
            />
          </div>
        ))}
      </CollapsibleSection>

      <CollapsibleSection ix="09" title={`Section 2 · ${config.section2.eyebrow}`}>
        <label className="field">
          <div className="field-label"><span>Eyebrow</span></div>
          <input
            className="input"
            value={config.section2.eyebrow}
            onChange={(e) => patchSection2({ eyebrow: e.target.value })}
          />
        </label>
        <label className="field">
          <div className="field-label"><span>Title</span></div>
          <textarea
            className="textarea"
            rows={2}
            value={config.section2.title}
            onChange={(e) => patchSection2({ title: e.target.value })}
          />
        </label>
        <label className="field">
          <div className="field-label"><span>Body</span></div>
          <textarea
            className="textarea"
            rows={3}
            value={config.section2.body}
            onChange={(e) => patchSection2({ body: e.target.value })}
          />
        </label>
        <div className="field">
          <div className="field-label"><span>Steps</span></div>
          {config.section2.items.map((s, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 6, marginBottom: 6 }}>
              <input
                className="input"
                value={s.n}
                onChange={(e) => setS2Item(i, "n", e.target.value)}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <input
                  className="input"
                  value={s.t}
                  onChange={(e) => setS2Item(i, "t", e.target.value)}
                  placeholder="Title"
                />
                <textarea
                  className="textarea"
                  rows={2}
                  value={s.d}
                  onChange={(e) => setS2Item(i, "d", e.target.value)}
                  placeholder="Description"
                />
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection ix="10" title="Footer">
        <label className="field">
          <div className="field-label"><span>Intro</span></div>
          <textarea
            className="textarea"
            rows={3}
            value={config.footer.intro}
            onChange={(e) => patchFooter({ intro: e.target.value })}
          />
        </label>
        <label className="field">
          <div className="field-label"><span>Big background word</span></div>
          <input
            className="input"
            value={config.footer.bigWord}
            onChange={(e) => patchFooter({ bigWord: e.target.value })}
          />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          <input
            className="input"
            value={config.footer.bottomLeft}
            onChange={(e) => patchFooter({ bottomLeft: e.target.value })}
            placeholder="© line"
          />
          <input
            className="input"
            value={config.footer.bottomCenter}
            onChange={(e) => patchFooter({ bottomCenter: e.target.value })}
            placeholder="Center text"
          />
          <input
            className="input"
            value={config.footer.bottomRight}
            onChange={(e) => patchFooter({ bottomRight: e.target.value })}
            placeholder="Version"
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection ix="11" title="Chatbot widget">
        <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: 10 }}>
          <label className="field">
            <div className="field-label"><span>Initial</span></div>
            <input
              className="input"
              value={config.widget.initial}
              maxLength={2}
              onChange={(e) => patchWidget({ initial: e.target.value })}
            />
          </label>
          <label className="field">
            <div className="field-label"><span>Bot name</span></div>
            <input
              className="input"
              value={config.widget.name}
              onChange={(e) => patchWidget({ name: e.target.value })}
            />
          </label>
        </div>
        <label className="field">
          <div className="field-label"><span>Welcome message</span></div>
          <textarea
            className="textarea"
            rows={3}
            value={config.widget.welcome}
            onChange={(e) => patchWidget({ welcome: e.target.value })}
          />
        </label>
        <label className="field">
          <div className="field-label">
            <span>Starter prompts</span>
            <span>one per line</span>
          </div>
          <textarea
            className="textarea"
            rows={4}
            value={config.widget.suggestions.join("\n")}
            onChange={(e) =>
              patchWidget({
                suggestions: e.target.value.split("\n").filter(Boolean),
              })
            }
          />
        </label>
      </CollapsibleSection>
    </>
  );
}
