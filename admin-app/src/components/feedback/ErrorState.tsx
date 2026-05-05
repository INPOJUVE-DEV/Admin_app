import { Button, Paper, Stack, Typography } from '@mui/material'

interface ErrorStateProps {
  title?: string
  description: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'No fue posible cargar la información',
  description,
  onRetry,
}: ErrorStateProps) {
  return (
    <Paper sx={{ p: 4 }}>
      <Stack spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {title}
        </Typography>
        <Typography color="text.secondary">{description}</Typography>
        {onRetry ? (
          <Button variant="contained" onClick={onRetry}>
            Reintentar
          </Button>
        ) : null}
      </Stack>
    </Paper>
  )
}
