export function StatusBadge({status}:{status:string|null}){return <span className={`status-badge status-${status?.toLowerCase()??'unknown'}`}>{status??'Unknown'}</span>}
