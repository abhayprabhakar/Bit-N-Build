import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';

const items = [
  {
    icon: <SettingsSuggestRoundedIcon />,
    title: 'Verifiable Trust',
    description:
      'Our product effortlessly adjusts to your needs, boosting efficiency and simplifying your tasks. Track every rupee through an immutable ledger, providing a single source of truth that cannot be altered or deleted.',
  },
  {
    icon: <ConstructionRoundedIcon />,
    title: 'Structured Control',
    description:
      'Mirror your real-world organization with a hierarchical system, allowing you to allocate and manage budgets with precision across departments and sub-departments.',
  },
  {
    icon: <ThumbUpAltRoundedIcon />,
    title: 'Intuitive Oversight',
    description:
      'Empower stakeholders with a public-facing dashboard where interactive charts make complex financial data easy for anyone to understand and explore.',
  },
  {
    icon: <AutoFixHighRoundedIcon />,
    title: 'Guaranteed Authenticity',
    description:
      'Rely on a system where every transaction is cryptographically chained, ensuring the data is authentic, traceable, and reliable.',
  },
  {
    icon: <SupportAgentRoundedIcon />,
    title: 'Secure Collaboration',
    description:
      'Manage your team effectively with role-based access and multi-stage approval workflows, ensuring funds are handled with accountability.',
  },
  {
    icon: <QueryStatsRoundedIcon />,
    title: 'Insightful Analytics',
    description:
      'Make informed decisions with automated, consolidated reports that provide a clear overview of spending across your entire department and its subsidiaries.',
  },
];

export default function Highlights() {
  return (
    <Box
      id="highlights"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        color: 'white',
        bgcolor: 'grey.900',
      }}
    >
      <Container
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: { sm: '100%', md: '60%' },
            textAlign: { sm: 'left', md: 'center' },
          }}
        >
          <Typography component="h2" variant="h4" gutterBottom>
            Highlights
          </Typography>
          <Typography variant="body1" sx={{ color: 'grey.400' }}>
            Explore why our product stands out: adaptability, durability,
            user-friendly design, and innovation. Enjoy reliable customer support and
            precision in every detail.
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {items.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Stack
                direction="column"
                component={Card}
                spacing={1}
                useFlexGap
                sx={{
                  color: 'inherit',
                  p: 3,
                  height: '100%',
                  borderColor: 'hsla(220, 25%, 25%, 0.3)',
                  backgroundColor: 'grey.800',
                }}
              >
                <Box sx={{ opacity: '50%' }}>{item.icon}</Box>
                <div>
                  <Typography gutterBottom sx={{ fontWeight: 'medium' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.400' }}>
                    {item.description}
                  </Typography>
                </div>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
