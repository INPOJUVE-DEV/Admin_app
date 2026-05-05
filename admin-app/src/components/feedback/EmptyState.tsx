import { Paper, Stack, Typography } from '@mui/material'

interface EmptyStateProps {
  title: string
  description: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Stack spacing={1}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {title}
        </Typography>
        <Typography color="text.secondary">{description}</Typography>
      </Stack>
    </Paper>
  )
}
