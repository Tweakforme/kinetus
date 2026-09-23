"use client";

import { useRouter } from "next/navigation";
import { useId } from "react";
import { SORT_OPTIONS, withSort, type SortKey } from "@/lib/sort";
import styles from "./SortControl.module.css";

type SortControlProps = {
  /** The listing's page 1 URL; a new sort always starts from page 1. */
  base: string;
  current: SortKey | null;
};

/**
 * "Sort by" select for the catalogue listings. Changing it loads the listing's first page
 * with `?sort=`, rendered on the server. Without JavaScript the form submits the same GET
 * request through the button inside <noscript>.
 */
export function SortControl({ base, current }: SortControlProps) {
  const router = useRouter();
  const selectId = useId();

  return (
    <form method="get" action={base} className={styles.form}>
      <label htmlFor={selectId} className={styles.label}>
        Sort by
      </label>
      <select
        id={selectId}
        name="sort"
        className={styles.select}
        defaultValue={current ?? ""}
        key={current ?? "default"}
        onChange={(event) => {
          const value = event.target.value as SortKey | "";
          router.push(withSort(base, value === "" ? null : value), { scroll: false });
        }}
      >
        <option value="">Catalogue order</option>
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit" className={styles.submit}>
          Sort
        </button>
      </noscript>
    </form>
  );
}
