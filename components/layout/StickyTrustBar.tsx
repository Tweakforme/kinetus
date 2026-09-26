import { FlaskIcon, LockIcon, MapleLeafIcon, ShieldCheckIcon } from "@/components/icons/LineIcons";
import { TrustBar, type TrustItem } from "@/components/ui/TrustBar";
import { PACKAGING } from "@/lib/site";
import { Container } from "./Container";
import styles from "./StickyTrustBar.module.css";

/**
 * Deck slide 4's four trust items with the client's packaging string where one exists and
 * neutral, structural copy elsewhere (location, batch reference on the label, sealed
 * packaging, shipping within Canada).
 */
const ITEMS: TrustItem[] = [
  {
    Icon: MapleLeafIcon,
    accent: "red",
    title: "PROUDLY CANADIAN",
    copy: "Based in Canada. Serving qualified research customers.",
  },
  {
    Icon: FlaskIcon,
    title: PACKAGING.qualityYouCanTrust,
    copy: "Third-party tested. Batch-specific COA available.",
  },
  {
    Icon: LockIcon,
    title: "TRACEABLE & DOCUMENTED",
    copy: "Every unit is labelled with a batch reference.",
  },
  {
    Icon: ShieldCheckIcon,
    title: "SECURE & DISCREET",
    copy: "Sealed packaging. Discreet shipping within Canada.",
  },
];

/**
 * The four supplier facts in a white band placed directly above the research-use band.
 * On a wide, tall window (see the module) it is sticky: pinned to the bottom of the window
 * while its parent section scrolls past, settling in its place above the research-use
 * band at the end. It stays in the page flow, so it never permanently covers anything:
 * every line of the page can be scrolled clear of it. On phones, tablets and short windows
 * it is a plain band at the foot of the page. Where it appears is set by
 * TRUST_BAR_SITE_WIDE (lib/site.ts).
 */
export function StickyTrustBar() {
  return (
    <div className={styles.band} data-trust-bar="">
      <Container>
        <TrustBar items={ITEMS} variant="row" label="Supplier facts" className={styles.trust} />
      </Container>
    </div>
  );
}
