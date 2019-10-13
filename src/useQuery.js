import { useLocation } from 'react-router'

export default function useQuery() {
  return new URLSearchParams(useLocation().search.slice(1));
}
