import { Chip } from '@mui/material'

const styleMap: Record<string, { color: string; borderColor: string; backgroundColor: string }> = {
  pending: { color: '#7b9300', borderColor: 'rgba(184,212,0,0.72)', backgroundColor: 'rgba(184,212,0,0.12)' },
  'Por enviar': { color: '#7b9300', borderColor: 'rgba(184,212,0,0.72)', backgroundColor: 'rgba(184,212,0,0.12)' },
  accepted: { color: '#1b8f70', borderColor: 'rgba(31,181,148,0.62)', backgroundColor: 'rgba(31,181,148,0.12)' },
  Recibidos: { color: '#1b8f70', borderColor: 'rgba(31,181,148,0.62)', backgroundColor: 'rgba(31,181,148,0.12)' },
  active: { color: '#145a22', borderColor: 'rgba(20,90,34,0.28)', backgroundColor: 'rgba(20,90,34,0.08)' },
  success: { color: '#145a22', borderColor: 'rgba(20,90,34,0.28)', backgroundColor: 'rgba(20,90,34,0.08)' },
  rejected: { color: '#e4007c', borderColor: 'rgba(228,0,124,0.42)', backgroundColor: 'rgba(228,0,124,0.08)' },
  Rechazados: { color: '#e4007c', borderColor: 'rgba(228,0,124,0.42)', backgroundColor: 'rgba(228,0,124,0.08)' },
  blocked: { color: '#4f6b50', borderColor: 'rgba(79,107,80,0.28)', backgroundColor: 'rgba(79,107,80,0.08)' },
  error: { color: '#e4007c', borderColor: 'rgba(228,0,124,0.42)', backgroundColor: 'rgba(228,0,124,0.08)' },
  'Con incidencia': { color: '#e4007c', borderColor: 'rgba(228,0,124,0.42)', backgroundColor: 'rgba(228,0,124,0.08)' },
  'En camino': { color: '#1fb594', borderColor: 'rgba(31,181,148,0.42)', backgroundColor: 'rgba(31,181,148,0.08)' },
}

export function StatusBadge({ value }: { value: string | null | undefined }) {
  const normalized = value ?? 'Sin dato'
  const styles = styleMap[normalized] ?? {
    color: '#145a22',
    borderColor: 'rgba(20,90,34,0.28)',
    backgroundColor: 'rgba(20,90,34,0.08)',
  }

  return (
    <Chip
      label={normalized}
      size="small"
      variant="outlined"
      sx={{
        color: styles.color,
        borderColor: styles.borderColor,
        backgroundColor: styles.backgroundColor,
        fontWeight: 700,
      }}
    />
  )
}
