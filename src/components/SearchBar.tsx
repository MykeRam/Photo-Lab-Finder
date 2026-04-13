type SearchBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
};

export function SearchBar({ query, onQueryChange }: SearchBarProps) {
  return (
    <label className="search-bar">
      <span className="search-bar__label">Search NYC city areas or ZIP codes</span>
      <input
        className="search-bar__input"
        type="search"
        value={query}
        placeholder="Try Brooklyn, Chelsea, or 11211"
        onChange={(event) => onQueryChange(event.target.value)}
      />
    </label>
  );
}
