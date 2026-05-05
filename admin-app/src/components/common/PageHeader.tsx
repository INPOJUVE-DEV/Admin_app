import { Box, Stack, Typography } from '@mui/material'

interface PageHeaderProps {
  title: string
  subtitle: string
  actions?: React.ReactNode
  children?: React.ReactNode
}

export function PageHeader({ title, subtitle, actions, children }: PageHeaderProps) {
  return (
    <Box sx={{ mb: 3.5 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: {
            xs: 'flex-start',
            md: 'center',
          },
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75, maxWidth: 720 }}>
            {subtitle}
          </Typography>
        </Box>
        {actions}
      </Stack>
      {children}
    </Box>
  )
}
