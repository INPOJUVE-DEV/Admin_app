import { PropsWithChildren } from 'react'
import { Paper, Stack } from '@mui/material'

export function SearchFilters({ children }: PropsWithChildren) {
  return (
    <Paper sx={{ p: 2.5, mb: 3 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        useFlexGap
        sx={{ flexWrap: 'wrap' }}
      >
        {children}
      </Stack>
    </Paper>
  )
}
