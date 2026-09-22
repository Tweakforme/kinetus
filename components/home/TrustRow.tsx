import { FlaskIcon, LockIcon, MapleLeafIcon, ShieldCheckIcon } from "@/components/icons/LineIcons";
import { Container } from "@/components/layout/Container";
import { TrustBar, type TrustItem } from "@/components/ui/TrustBar";
import { PACKAGING } from "@/lib/site";
import styles from "./TrustRow.module.css";

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

/** White full-bleed band with hairline top and bottom carrying the four-item TrustBar. */
export function TrustRow() {
  return (
    <div className={styles.band} data-reveal="">
      <Container>
        <TrustBar items={ITEMS} variant="row" label="Supplier facts" className={styles.trust} />
      </Container>
    </div>
  );
}
