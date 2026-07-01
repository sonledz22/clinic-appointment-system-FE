import { InputText } from 'primereact/inputtext';
import { appIcons } from '@/constants/appIcons';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar = ({ value, onChange, placeholder = 'Tìm kiếm...', className = '' }: Readonly<SearchBarProps>) => (
  <span className={`search-bar ${className}`.trim()}>
    <i className={`${appIcons.search} search-bar__icon`} aria-hidden="true" />
    <InputText className="search-bar__input" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
  </span>
);

export default SearchBar;