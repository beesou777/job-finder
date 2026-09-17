"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  FileText,
  HelpCircle,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  loadProductCatalog,
  loadProductOrders,
  Product,
  ProductOrder,
  requestProductQuote,
  startProductCheckout,
  verifyProductOrder,
} from "@/lib/products";

export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [payingCode, setPayingCode] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const searchParams = useSearchParams();

  async function refreshOrders() {
    try {
      setOrdersLoading(true);
      const items = await loadProductOrders();
      setOrders(items);
    } catch {
      // Gracefully ignore if user not signed in yet
    } finally {
      setOrdersLoading(false);
    }
  }

  useEffect(() => {
    const payment = searchParams.get("payment");
    const orderId = searchParams.get("order");

    if (payment === "verified") {
      setNotice(
        "Payment verified successfully! Your service order is confirmed below. You can now use your deliverables immediately.",
      );
    } else if (payment === "pending") {
      setNotice(
        'Your payment is awaiting confirmation from eSewa. You can click "Check status" on your order below.',
      );
    } else if (payment === "not-completed") {
      setError(
        "The eSewa payment was cancelled or not completed. No charges were made and no order access was granted.",
      );
    }

    if (orderId && payment === "pending") {
      void verifyProductOrder(orderId)
        .then(refreshOrders)
        .catch(() => {});
    }
  }, [searchParams]);

  useEffect(() => {
    void loadProductCatalog()
      .then((value) => setProducts(value.products))
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : "Could not load service catalog."),
      );
    void refreshOrders();
  }, []);

  async function pay(product: Product) {
    setPayingCode(product.code);
    setError("");
    try {
      const quoteRes = (await requestProductQuote(product.code)) as {
        quote?: { id?: string };
      };
      if (!quoteRes.quote?.id) throw new Error("Could not create an order quote.");

      const checkout = await startProductCheckout(quoteRes.quote.id);

      const form = document.createElement("form");
      form.method = "POST";
      form.action = checkout.formUrl;
      Object.entries(checkout.fields).forEach(([name, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Could not initialize payment.");
      setPayingCode(null);
    }
  }

  async function checkOrderStatus(orderId: string) {
    setVerifyingId(orderId);
    setError("");
    try {
      await verifyProductOrder(orderId);
      setNotice("Order status updated successfully.");
      await refreshOrders();
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Could not verify status with eSewa.");
    } finally {
      setVerifyingId(null);
    }
  }

  function getProductName(code: string) {
    switch (code) {
      case "professional_cv":
        return "Professional CV Review";
      case "application_pack":
        return "Job-Specific Application Pack";
      case "job_hunt_pack":
        return "Job Hunt Pack";
      default:
        return code.replace(/_/g, " ");
    }
  }

  function getProductGuide(code: string): {
    summary: string;
    steps: { num: number; title: string; detail: string; link?: { label: string; href: string } }[];
  } {
    switch (code) {
      case "professional_cv":
        return {
          summary:
            "KamKhoj will review your uploaded CV and produce an ATS-optimised, fact-checked résumé. Everything is grounded in what you have already provided — no invented content.",
          steps: [
            {
              num: 1,
              title: "Check your Career Profile",
              detail:
                "Open your profile and make sure your work history, skills, and education are filled in correctly. The better your profile, the stronger your CV.",
              link: { label: "Open Profile", href: "/dashboard/profile" },
            },
            {
              num: 2,
              title: "Create a Document Pack",
              detail:
                'Go to Application Documents and click "New pack". KamKhoj will draft your improved résumé based on your profile and CV.',
              link: { label: "Go to Documents", href: "/dashboard/documents" },
            },
            {
              num: 3,
              title: "Review & Confirm Accuracy",
              detail:
                "Open the document editor, read through every claim, and tick the Review checkbox to confirm the content is accurate. Only reviewed documents can be added to the tracker.",
            },
            {
              num: 4,
              title: "Download & Submit",
              detail:
                "Download your polished résumé and use it for job applications. You can create a new pack whenever your profile is updated.",
            },
          ],
        };
      case "application_pack":
        return {
          summary:
            "For each specific job you want to apply to, KamKhoj generates a tailored résumé + cover letter matched to that role's requirements.",
          steps: [
            {
              num: 1,
              title: "Find a job in Matches",
              detail:
                "Browse your personalised job matches. When you find a role you want to apply for, open it.",
              link: { label: "View Job Matches", href: "/dashboard/matches" },
            },
            {
              num: 2,
              title: 'Click "Prepare Documents"',
              detail:
                "Each job card has a Prepare Documents button. This generates a résumé + cover letter tailored specifically to that job's description and requirements.",
            },
            {
              num: 3,
              title: "Review both documents",
              detail:
                "Open each document in the editor, read it carefully, and tick the Review checkbox. This confirms the content is accurate before you submit.",
              link: { label: "Go to Documents", href: "/dashboard/documents" },
            },
            {
              num: 4,
              title: "Track your application",
              detail:
                "Add the application to your tracker. Record the stage (Applied, Interview, Offer) and add private notes.",
              link: { label: "Open Tracker", href: "/dashboard/applications" },
            },
          ],
        };
      case "job_hunt_pack":
        return {
          summary:
            "The complete end-to-end bundle: CV review + up to 5 job-specific application packs + full access to the application tracker. Best for an active, structured job search.",
          steps: [
            {
              num: 1,
              title: "Start with your Profile & CV",
              detail:
                "Complete your Career Profile so the AI has accurate data to work from. The stronger your profile, the better every document will be.",
              link: { label: "Open Profile", href: "/dashboard/profile" },
            },
            {
              num: 2,
              title: "Get your professional CV",
              detail:
                "Go to Documents and create a General CV pack. This is your polished base résumé — review and download it.",
              link: { label: "Go to Documents", href: "/dashboard/documents" },
            },
            {
              num: 3,
              title: "Pick your best-matched jobs",
              detail:
                "Browse Matches and identify up to 5 roles that fit your goals. Click Prepare Documents on each to get tailored application packs.",
              link: { label: "View Job Matches", href: "/dashboard/matches" },
            },
            {
              num: 4,
              title: "Review all documents",
              detail:
                "For each document pack, open the editor, confirm accuracy, and tick the Review checkbox. Reviewed packs unlock the tracker button.",
            },
            {
              num: 5,
              title: "Track every application",
              detail:
                "Add each application to the tracker. Move it through stages as you hear back — Applied → Interview → Offer or Rejected. Add private notes at each step.",
              link: { label: "Open Tracker", href: "/dashboard/applications" },
            },
          ],
        };
      default:
        return {
          summary: "Your service is active. Go to your dashboard to use it.",
          steps: [],
        };
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-8">
      {/* Header */}
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-800">
          <Sparkles className="h-3.5 w-3.5" />
          KamKhoj Career Services
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#102e67] sm:text-4xl">
          Supercharge Your Job Search
        </h1>
        <p className="max-w-3xl text-base text-zinc-600 sm:text-lg">
          Invest in proven application support. From tailored ATS-optimized CVs to comprehensive job
          hunt bundles, get real deliverables grounded strictly in your verified background.
        </p>
      </header>

      {/* Alerts */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <div className="font-semibold">{error}</div>
        </div>
      )}
      {notice && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <div className="font-medium">{notice}</div>
        </div>
      )}

      {/* eSewa Sandbox Testing Instructions */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50/40 to-blue-50/20 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-blue-900">
                eSewa Sandbox Test Environment
              </h2>
            </div>
            <p className="text-xs text-blue-950/80">
              Payments are in test mode. When redirected to eSewa, use these sandbox credentials:
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 font-mono font-medium text-blue-900 shadow-xs">
              eSewa ID: <strong className="font-bold">9841000000</strong>
            </span>
            <span className="rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 font-mono font-medium text-blue-900 shadow-xs">
              MPIN: <strong className="font-bold">1122</strong>
            </span>
            <span className="rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 font-mono font-medium text-blue-900 shadow-xs">
              OTP: <strong className="font-bold">123456</strong>
            </span>
          </div>
        </div>
      </div>

      {/* User Order History Section */}
      {orders.length > 0 && (
        <section aria-labelledby="purchased-orders-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="purchased-orders-heading" className="text-xl font-bold text-[#102e67]">
                Your Purchased Services & Orders
              </h2>
              <p className="text-sm text-zinc-600">
                Access your active packages and delivery actions.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void refreshOrders()}
              disabled={ordersLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${ordersLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {orders.map((order) => {
              const isComplete = order.status === "complete";
              const isPending = order.status === "pending";

              return (
                <div
                  key={order.id}
                  className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                          Order #{order.id.slice(0, 8)}
                        </span>
                        <h3 className="text-lg font-bold text-zinc-900">
                          {getProductName(order.productCode)}
                        </h3>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isComplete
                            ? "bg-emerald-100 text-emerald-800"
                            : isPending
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {isComplete ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" /> Paid & Verified
                          </>
                        ) : isPending ? (
                          <>
                            <Clock className="h-3 w-3" /> Pending Verification
                          </>
                        ) : (
                          "Failed"
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600">
                      <div>
                        Amount:{" "}
                        <strong className="font-semibold text-zinc-900">
                          NPR {order.amountNpr.toLocaleString()}
                        </strong>
                      </div>
                      <div>Date: {new Date(order.createdAt).toLocaleDateString()}</div>
                      {order.providerReference && (
                        <div className="col-span-2 text-zinc-600">
                          Ref:{" "}
                          <span className="font-mono text-zinc-700">{order.providerReference}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fulfillment Action */}
                  <div className="mt-5 border-t border-zinc-100 pt-4">
                    {isComplete ? (
                      <div className="space-y-2">
                        {order.productCode === "professional_cv" && (
                          <Link
                            href="/dashboard/documents"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-primary/90"
                          >
                            <FileText className="h-4 w-4" />
                            Open Documents to Tailor CV
                          </Link>
                        )}
                        {order.productCode === "application_pack" && (
                          <Link
                            href="/dashboard/matches"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-primary/90"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Pick a Job in Matches to Tailor
                          </Link>
                        )}
                        {order.productCode === "job_hunt_pack" && (
                          <div className="flex gap-2">
                            <Link
                              href="/dashboard/matches"
                              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary/90"
                            >
                              <Zap className="h-3.5 w-3.5" />
                              View Curated Jobs
                            </Link>
                            <Link
                              href="/dashboard/documents"
                              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              Application Packs
                            </Link>
                          </div>
                        )}
                        <p className="text-center text-[11px] text-zinc-600">
                          Deliverable unlocked and ready in your workspace.
                        </p>

                        {/* "How to use" expandable guide */}
                        <div className="mt-3 border-t border-zinc-100 pt-3">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedOrder(expandedOrder === order.id ? null : order.id)
                            }
                            className="flex w-full items-center justify-between gap-2 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-700 hover:border-primary/40 hover:bg-blue-50 hover:text-primary transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              <HelpCircle className="h-3.5 w-3.5" />
                              How do I use this service?
                            </span>
                            {expandedOrder === order.id ? (
                              <ChevronUp className="h-3.5 w-3.5 shrink-0" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                            )}
                          </button>

                          {expandedOrder === order.id &&
                            (() => {
                              const guide = getProductGuide(order.productCode);
                              return (
                                <div className="mt-3 space-y-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                                  <p className="text-xs leading-relaxed text-zinc-700">
                                    {guide.summary}
                                  </p>
                                  <ol className="space-y-3">
                                    {guide.steps.map((step) => (
                                      <li key={step.num} className="flex gap-3">
                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white">
                                          {step.num}
                                        </span>
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold text-zinc-800">
                                            {step.title}
                                          </p>
                                          <p className="text-[11px] leading-relaxed text-zinc-600">
                                            {step.detail}
                                          </p>
                                          {step.link && (
                                            <Link
                                              href={step.link.href}
                                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                                            >
                                              {step.link.label}
                                              <ExternalLink className="h-3 w-3" />
                                            </Link>
                                          )}
                                        </div>
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              );
                            })()}
                        </div>
                      </div>
                    ) : isPending ? (
                      <button
                        type="button"
                        disabled={verifyingId === order.id}
                        onClick={() => void checkOrderStatus(order.id)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
                      >
                        {verifyingId === order.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Checking with eSewa…
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4" />
                            Check / Confirm Payment Status
                          </>
                        )}
                      </button>
                    ) : (
                      <p className="text-xs text-red-600">
                        Payment was not completed. You can re-order from the catalog below.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Products Catalog */}
      <section aria-labelledby="catalog-heading" className="space-y-6">
        <div>
          <h2 id="catalog-heading" className="text-2xl font-bold text-[#102e67]">
            Available Packages
          </h2>
          <p className="text-sm text-zinc-600">
            Transparent pricing with zero hidden fees. Real human and model assistance.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {products.map((product) => {
            const isHuntPack = product.code === "job_hunt_pack";
            const isBusy = payingCode === product.code;

            return (
              <article
                key={product.code}
                className={`relative flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-xs transition hover:shadow-md ${
                  isHuntPack ? "border-blue-600 ring-2 ring-blue-600/20" : "border-zinc-200"
                }`}
              >
                {isHuntPack && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                    BEST VALUE BUNDLE
                  </span>
                )}

                <div className="space-y-4">
                  <header>
                    <h3 className="text-xl font-bold text-zinc-900">{product.name}</h3>
                    <p className="mt-1 text-xs text-zinc-600">
                      {product.code === "professional_cv" &&
                        "Comprehensive CV structure & clarity polish"}
                      {product.code === "application_pack" &&
                        "Tailored application for 1 specific vacancy"}
                      {product.code === "job_hunt_pack" &&
                        "Complete package for serious job seekers"}
                    </p>
                  </header>

                  <div className="flex items-baseline gap-1 text-3xl font-extrabold text-[#102e67]">
                    <span className="text-sm font-semibold text-zinc-600">NPR</span>
                    {product.amountNpr.toLocaleString()}
                  </div>

                  <hr className="border-zinc-100" />

                  <ul className="space-y-2.5 text-sm text-zinc-600">
                    {product.deliverables.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    type="button"
                    disabled={!!payingCode}
                    onClick={() => void pay(product)}
                    className={`w-full rounded-xl py-3 text-center text-sm font-bold transition disabled:opacity-50 ${
                      isHuntPack
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                        : "bg-[#102e67] text-white hover:bg-[#102e67]/90"
                    }`}
                  >
                    {isBusy ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Redirecting to eSewa…
                      </span>
                    ) : (
                      `Pay NPR ${product.amountNpr.toLocaleString()} with eSewa`
                    )}
                  </button>
                  <p className="mt-2 text-center text-[11px] text-zinc-600">
                    Instant sandbox checkout · No card required
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Trust & Guarantee Section */}
      <section className="grid gap-6 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 sm:grid-cols-3 sm:p-8">
        <div className="space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h4 className="font-bold text-zinc-900">100% Fact-Grounded</h4>
          <p className="text-xs leading-relaxed text-zinc-600">
            We never fabricate credentials, employment dates, or fake skills. Every document is
            built purely on your verified profile facts.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h4 className="font-bold text-zinc-900">Official Portal Direct</h4>
          <p className="text-xs leading-relaxed text-zinc-600">
            You maintain full control. We inspect the employer's official destination and format
            documents to match their exact requirements.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <HelpCircle className="h-5 w-5" />
          </div>
          <h4 className="font-bold text-zinc-900">Support & Revision</h4>
          <p className="text-xs leading-relaxed text-zinc-600">
            Every paid service includes bounded revision rounds. If you need adjustments to your
            tailored draft, we refine it until it is right.
          </p>
        </div>
      </section>
    </main>
  );
}
