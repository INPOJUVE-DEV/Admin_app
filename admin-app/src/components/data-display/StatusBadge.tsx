import { Chip } from '@mui/material'

const styleMap: Record<string, { color: string; borderColor: string; backgroundColor: string }> = {
  pending: { color: '#d7e56a', borderColor: 'rgba(196,219,45,0.58)', backgroundColor: 'rgba(196,219,45,0.16)' },
  'Por enviar': { color: '#d7e56a', borderColor: 'rgba(196,219,45,0.58)', backgroundColor: 'rgba(196,219,45,0.16)' },
  accepted: { color: '#7ee4c0', borderColor: 'rgba(61,195,155,0.46)', backgroundColor: 'rgba(61,195,155,0.14)' },
  Recibidos: { color: '#7ee4c0', borderColor: 'rgba(61,195,155,0.46)', backgroundColor: 'rgba(61,195,155,0.14)' },
  active: { color: '#8ef0a5', borderColor: 'rgba(62,207,109,0.38)', backgroundColor: 'rgba(62,207,109,0.14)' },
  success: { color: '#8ef0a5', borderColor: 'rgba(62,207,109,0.38)', backgroundColor: 'rgba(62,207,109,0.14)' },
  rejected: { color: '#ff8dbe', borderColor: 'rgba(255,95,162,0.42)', backgroundColor: 'rgba(255,95,162,0.14)' },
  Rechazados: { color: '#ff8dbe', borderColor: 'rgba(255,95,162,0.42)', backgroundColor: 'rgba(255,95,162,0.14)' },
  blocked: { color: '#c3d3c5', borderColor: 'rgba(165,186,170,0.28)', backgroundColor: 'rgba(165,186,170,0.1)' },
  error: { color: '#ff8dbe', borderColor: 'rgba(255,95,162,0.42)', backgroundColor: 'rgba(255,95,162,0.14)' },
  'Con incidencia': { color: '#ff8dbe', borderColor: 'rgba(255,95,162,0.42)', backgroundColor: 'rgba(255,95,162,0.14)' },
  'En camino': { color: '#8fe5ee', borderColor: 'rgba(83,196,213,0.4)', backgroundColor: 'rgba(83,196,213,0.14)' },
}

export function StatusBadge({ value }: { value: string | null | undefined }) {
  const normalized = value ?? 'Sin dato'
  const styles = styleMap[normalized] ?? {
    color: '#8ef0a5',
    borderColor: 'rgba(62,207,109,0.38)',
    backgroundColor: 'rgba(62,207,109,0.14)',
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
