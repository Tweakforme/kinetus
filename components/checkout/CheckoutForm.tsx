"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import { quoteCheckout, submitOrder, type CheckoutState } from "@/app/(site)/checkout/actions";
import { OrderSummary, type SummaryFigures } from "@/components/cart/OrderSummary";
import buttons from "@/components/ui/buttons.module.css";
import {
  AGE_STATEMENT,
  FIELD,
  PROVINCES,
  RESEARCH_STATEMENT,
  validateCheckout,
  type FieldErrors,
} from "@/lib/checkout-fields";
import { formatCad } from "@/lib/pricing";
import { SITE_NAME } from "@/lib/site";
import styles from "./CheckoutForm.module.css";

export type CheckoutLine = {
  variantId: string;
  name: string;
  variantLabel: string;
  quantity: number;
  lineTotalCents: number;
};

type CheckoutFormProps = {
  lines: CheckoutLine[];
  initialFigures: SummaryFigures;
};

const IDLE: CheckoutState = { status: "idle" };

const inputId = (name: string) => `checkout-${name}`;

type FieldProps = {
  name: string;
  label: string;
  error?: string;
  optional?: boolean;
  hint?: string;
  children: (props: {
    id: string;
    name: string;
    "aria-invalid": true | undefined;
    "aria-describedby": string | undefined;
  }) => ReactNode;
};

function Field({ name, label, error, optional, hint, children }: FieldProps) {
  const id = inputId(name);
  const described = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {optional && <span className={styles.optional}> (optional)</span>}
      </label>
      {children({
        id,
        name,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": described || undefined,
      })}
      {hint && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Checkout (deck slide 21 flow): contact details, the Canadian shipping address, an
 * optional note, the two required confirmations from the client's Terms (never
 * pre-ticked), and a plain statement that no payment is taken on the site. The browser
 * checks the fields first for quick feedback; the server action checks everything again.
 * The summary beside the form is priced on the server and refreshed when the city or
 * province changes (local delivery; tax once it is switched on).
 */
export function CheckoutForm({ lines, initialFigures }: CheckoutFormProps) {
  const [state, formAction, submitting] = useActionState(submitOrder, IDLE);
  // Seeded from the server's response too, so errors render without JavaScript.
  const [errors, setErrors] = useState<FieldErrors>(state.errors ?? {});
  const [message, setMessage] = useState<string | undefined>(state.message);
  const [seenAttempt, setSeenAttempt] = useState(state.attempt);
  const [figures, setFigures] = useState(initialFigures);
  const [, startQuote] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const values = state.values ?? {};

  // A new server response replaces whatever the browser check showed.
  if (state.attempt !== seenAttempt) {
    setSeenAttempt(state.attempt);
    setErrors(state.errors ?? {});
    setMessage(state.message);
  }

  // After a failed submission, move focus to the message so it is announced and seen.
  useEffect(() => {
    if (state.status === "error") {
      alertRef.current?.focus();
    }
  }, [state]);

  const requote = () => {
    const form = formRef.current;
    if (!form) {
      return;
    }
    const data = new FormData(form);
    const city = String(data.get(FIELD.city) ?? "");
    const province = String(data.get(FIELD.province) ?? "");
    startQuote(async () => {
      try {
        const next = await quoteCheckout(city, province);
        if (next) {
          setFigures(next);
        }
      } catch {
        // Keep the figures shown; the order is priced again on submission anyway.
      }
    });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    const data = new FormData(event.currentTarget);
    const result = validateCheckout((name) => {
      const value = data.get(name);
      return typeof value === "string" ? value : "";
    });
    if (!result.ok) {
      event.preventDefault();
      setErrors(result.errors);
      setMessage("Please correct the highlighted fields.");
      const first = Object.keys(result.errors)[0];
      if (first) {
        document.getElementById(inputId(first))?.focus();
      }
      return;
    }
    setErrors({});
    setMessage(undefined);
  };

  const clearError = (name: string) => {
    if (errors[name as keyof FieldErrors]) {
      const next = { ...errors };
      delete next[name as keyof FieldErrors];
      setErrors(next);
    }
  };

  return (
    <div className={styles.layout}>
      <form
        ref={formRef}
        action={formAction}
        onSubmit={onSubmit}
        noValidate
        className={styles.form}
        aria-describedby="checkout-message"
      >
        <div
          id="checkout-message"
          ref={alertRef}
          tabIndex={-1}
          role="alert"
          className={message ? styles.alert : styles.alertEmpty}
        >
          {message}
        </div>

        {/* Remounts after a failed submission so fields show what was submitted. */}
        <div key={state.attempt ?? "initial"} className={styles.sections}>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Contact</legend>
            <div className={styles.grid}>
              <Field name={FIELD.name} label="Full name" error={errors[FIELD.name]}>
                {(props) => (
                  <input
                    {...props}
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={120}
                    defaultValue={values[FIELD.name]}
                    className={styles.input}
                    onInput={() => clearError(FIELD.name)}
                  />
                )}
              </Field>
              <Field name={FIELD.email} label="Email" error={errors[FIELD.email]}>
                {(props) => (
                  <input
                    {...props}
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    maxLength={254}
                    defaultValue={values[FIELD.email]}
                    className={styles.input}
                    onInput={() => clearError(FIELD.email)}
                  />
                )}
              </Field>
              <Field
                name={FIELD.phone}
                label="Phone"
                error={errors[FIELD.phone]}
                hint="For questions about your order."
              >
                {(props) => (
                  <input
                    {...props}
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    maxLength={20}
                    defaultValue={values[FIELD.phone]}
                    className={styles.input}
                    onInput={() => clearError(FIELD.phone)}
                  />
                )}
              </Field>
            </div>
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Shipping address</legend>
            <div className={styles.grid}>
              <div className={styles.full}>
                <Field name={FIELD.line1} label="Address line 1" error={errors[FIELD.line1]}>
                  {(props) => (
                    <input
                      {...props}
                      type="text"
                      autoComplete="address-line1"
                      required
                      maxLength={200}
                      defaultValue={values[FIELD.line1]}
                      className={styles.input}
                      onInput={() => clearError(FIELD.line1)}
                    />
                  )}
                </Field>
              </div>
              <div className={styles.full}>
                <Field
                  name={FIELD.line2}
                  label="Address line 2"
                  optional
                  error={errors[FIELD.line2]}
                >
                  {(props) => (
                    <input
                      {...props}
                      type="text"
                      autoComplete="address-line2"
                      maxLength={200}
                      defaultValue={values[FIELD.line2]}
                      className={styles.input}
                    />
                  )}
                </Field>
              </div>
              <Field name={FIELD.city} label="City" error={errors[FIELD.city]}>
                {(props) => (
                  <input
                    {...props}
                    type="text"
                    autoComplete="address-level2"
                    required
                    maxLength={100}
                    defaultValue={values[FIELD.city]}
                    className={styles.input}
                    onInput={() => clearError(FIELD.city)}
                    onBlur={requote}
                  />
                )}
              </Field>
              <Field
                name={FIELD.province}
                label="Province or territory"
                error={errors[FIELD.province]}
              >
                {(props) => (
                  <select
                    {...props}
                    autoComplete="address-level1"
                    required
                    defaultValue={values[FIELD.province] ?? ""}
                    className={`${styles.input} ${styles.select}`}
                    onChange={() => {
                      clearError(FIELD.province);
                      requote();
                    }}
                  >
                    <option value="" disabled>
                      Choose
                    </option>
                    {PROVINCES.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field name={FIELD.postalCode} label="Postal code" error={errors[FIELD.postalCode]}>
                {(props) => (
                  <input
                    {...props}
                    type="text"
                    autoComplete="postal-code"
                    autoCapitalize="characters"
                    required
                    maxLength={7}
                    defaultValue={values[FIELD.postalCode]}
                    className={styles.input}
                    onInput={() => clearError(FIELD.postalCode)}
                  />
                )}
              </Field>
              <div className={styles.field}>
                <label htmlFor="checkout-country" className={styles.label}>
                  Country
                </label>
                <input
                  id="checkout-country"
                  type="text"
                  value="Canada"
                  readOnly
                  aria-describedby="checkout-country-hint"
                  className={`${styles.input} ${styles.readOnly}`}
                />
                <p id="checkout-country-hint" className={styles.hint}>
                  Orders ship within Canada only.
                </p>
              </div>
            </div>
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Order note</legend>
            <Field name={FIELD.note} label="Note" optional error={errors[FIELD.note]}>
              {(props) => (
                <textarea
                  {...props}
                  rows={4}
                  maxLength={1000}
                  defaultValue={values[FIELD.note]}
                  className={`${styles.input} ${styles.textarea}`}
                />
              )}
            </Field>
          </fieldset>

          {/* Honeypot: off-screen and out of the tab order; people leave it empty. */}
          <div className={styles.trap} aria-hidden="true">
            <label htmlFor={inputId(FIELD.honeypot)}>Website</label>
            <input
              id={inputId(FIELD.honeypot)}
              name={FIELD.honeypot}
              type="text"
              tabIndex={-1}
              autoComplete="off"
              defaultValue=""
            />
          </div>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Confirmations</legend>
            <div className={styles.checks}>
              {[
                { name: FIELD.age, text: AGE_STATEMENT },
                { name: FIELD.research, text: RESEARCH_STATEMENT },
              ].map((check) => {
                const id = inputId(check.name);
                const error = errors[check.name];
                return (
                  <div key={check.name} className={styles.check}>
                    <input
                      id={id}
                      name={check.name}
                      type="checkbox"
                      required
                      defaultChecked={values[check.name] === "on"}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? `${id}-error` : undefined}
                      className={styles.checkbox}
                      onChange={() => clearError(check.name)}
                    />
                    <label htmlFor={id} className={styles.checkLabel}>
                      {check.text}
                    </label>
                    {error && (
                      <p id={`${id}-error`} className={`${styles.error} ${styles.checkError}`}>
                        {error}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </fieldset>

          <section className={styles.payment} aria-labelledby="checkout-payment-heading">
            <h2 id="checkout-payment-heading" className={styles.legend}>
              Payment
            </h2>
            <p>
              No payment is taken on this site. After you place your order, {SITE_NAME} will contact
              you by email to arrange payment by Interac e-Transfer. Your order is not confirmed
              until payment has been arranged.
            </p>
            <p className={styles.terms}>
              By placing an order you agree to the{" "}
              <Link href="/terms" className={styles.inlineLink}>
                Terms and Conditions
              </Link>
              .
            </p>
          </section>

          <button
            type="submit"
            className={`${buttons.solid} ${styles.submit}`}
            aria-disabled={submitting || undefined}
            onClick={(event) => {
              if (submitting) {
                event.preventDefault();
              }
            }}
          >
            {submitting ? "Placing order" : "Place order"}
          </button>
        </div>
      </form>

      <aside className={styles.side} aria-label="Order summary">
        <div className={styles.card}>
          <OrderSummary figures={figures} headingId="checkout-summary-heading" />
          <ul className={styles.lines} aria-label="Items">
            {lines.map((line) => (
              <li key={line.variantId} className={styles.line}>
                <span className={styles.lineName}>
                  {line.name} <span className={styles.lineVariant}>{line.variantLabel}</span>
                  <span className={styles.lineQuantity}> &times; {line.quantity}</span>
                </span>
                <span className={`numeric ${styles.lineTotal}`}>
                  {formatCad(line.lineTotalCents)}
                </span>
              </li>
            ))}
          </ul>
          <Link href="/cart" className={styles.editCart}>
            Edit cart
          </Link>
        </div>
      </aside>
    </div>
  );
}
