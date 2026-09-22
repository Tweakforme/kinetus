import { SearchIcon } from "@/components/icons/LineIcons";
import buttons from "@/components/ui/buttons.module.css";
import { SEARCH_QUERY_MAX_LENGTH } from "@/lib/products";
import { HEADER_ICON_LINKS } from "@/lib/site";
import styles from "./SearchForm.module.css";

type SearchFormProps = {
  /** The query already applied, echoed into the field. */
  query: string;
  className?: string;
};

/**
 * Plain GET form for /search?q=: a labelled search field and a solid button. No client
 * state; the page re-renders on submit.
 */
export function SearchForm({ query, className }: SearchFormProps) {
  return (
    <form
      role="search"
      action={HEADER_ICON_LINKS.search.href}
      method="get"
      className={className ? `${styles.form} ${className}` : styles.form}
    >
      <label htmlFor="search-query" className="visually-hidden">
        {HEADER_ICON_LINKS.search.label}
      </label>
      <input
        id="search-query"
        className={styles.input}
        type="search"
        name="q"
        defaultValue={query}
        placeholder="Search by product name"
        autoComplete="off"
        maxLength={SEARCH_QUERY_MAX_LENGTH}
      />
      <button type="submit" className={`${buttons.solid} ${styles.button}`}>
        <SearchIcon size={20} />
        Search
      </button>
    </form>
  );
}
