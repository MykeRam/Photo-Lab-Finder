type SearchBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
};

export function SearchBar({ query, onQueryChange }: SearchBarProps) {
  return (
    <label className="search-bar">
      <span className="search-bar__label">Search NYC boroughs or neighborhoods</span>
      <input
        className="search-bar__input"
        type="search"
        value={query}
        placeholder="Try Brooklyn, Astoria, or Chelsea"
        onChange={(event) => onQueryChange(event.target.value)}
      />
    </label>
  );
}
