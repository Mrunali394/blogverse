import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Tooltip as MuiTooltip,
  IconButton,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { InfoOutlined, TrendingUp } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { getBlogStats, getCategories } from "../services/blogService";

const COLORS = [
  "#0FA4AF",
  "#2196F3",
  "#FF9800",
  "#4CAF50",
  "#F44336",
  "#9C27B0",
];

interface ViewData {
  name: string;
  views: number;
  trend: number;
}

interface CategoryCount {
  name: string;
  value: number;
}

interface PerformanceMetric {
  label: string;
  value: number;
  trend: number;
  icon: JSX.Element;
}

function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalComments: 0,
    averageReadTime: 0,
    engagementRate: 0,
    categoryCounts: [] as CategoryCount[],
    viewTrend: [] as ViewData[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, categoriesData] = await Promise.all([
          getBlogStats(),
          getCategories(),
        ]);

        const categoryData = categoriesData.map((cat: string) => ({
          name: cat,
          value:
            statsData.categoryCounts.find((c: any) => c.name === cat)?.value ||
            0,
        }));

        setStats({
          totalViews: statsData.totalViews,
          totalComments: statsData.totalComments,
          averageReadTime: statsData.averageReadTime || 0,
          engagementRate: statsData.engagementRate || 0,
          categoryCounts: categoryData,
          viewTrend: statsData.viewTrend || [],
        });
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const performanceMetrics: PerformanceMetric[] = [
    {
      label: "Total Views",
      value: stats.totalViews,
      trend: 12.5,
      icon: <TrendingUp />,
    },
    {
      label: "Comments",
      value: stats.totalComments,
      trend: 8.3,
      icon: <TrendingUp />,
    },
    {
      label: "Avg. Read Time",
      value: stats.averageReadTime,
      trend: 5.2,
      icon: <TrendingUp />,
    },
    {
      label: "Engagement Rate",
      value: stats.engagementRate,
      trend: 15.7,
      icon: <TrendingUp />,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 600,
          background: "linear-gradient(45deg, #024950 30%, #0FA4AF 90%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 4,
        }}
      >
        Analytics Dashboard
      </Typography>

      <Grid container spacing={3}>
        {performanceMetrics.map((metric) => (
          <Grid item xs={12} sm={6} md={3} key={metric.label}>
            <Card
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              sx={{
                background: "linear-gradient(45deg, #024950 30%, #0FA4AF 90%)",
                color: "white",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6">{metric.label}</Typography>
                  {metric.icon}
                </Box>
                <Typography variant="h4" sx={{ my: 2 }}>
                  {typeof metric.value === "number"
                    ? metric.value.toLocaleString()
                    : metric.value}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    variant="body2"
                    sx={{ color: metric.trend >= 0 ? "#4caf50" : "#f44336" }}
                  >
                    {metric.trend >= 0 ? "+" : ""}
                    {metric.trend}%
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    vs last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">Post Views Over Time</Typography>
                <MuiTooltip title="Shows the trend of post views over the last 6 months">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoOutlined fontSize="small" />
                  </IconButton>
                </MuiTooltip>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={stats.viewTrend}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tickFormatter={(value) => {
                        const [year, month] = value.split("-");
                        return new Date(
                          parseInt(year),
                          parseInt(month) - 1
                        ).toLocaleDateString(undefined, { month: "short" });
                      }}
                    />
                    <YAxis tickFormatter={(value) => value.toLocaleString()} />
                    <Tooltip
                      formatter={(value: number) => [
                        value.toLocaleString(),
                        "Views",
                      ]}
                      labelFormatter={(label) => {
                        const [year, month] = label.split("-");
                        return new Date(
                          parseInt(year),
                          parseInt(month) - 1
                        ).toLocaleDateString(undefined, {
                          month: "long",
                          year: "numeric",
                        });
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="#0FA4AF"
                      strokeWidth={2}
                      dot={{ stroke: "#0FA4AF", strokeWidth: 2 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Posts by Category
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryCounts}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label
                    >
                      {stats.categoryCounts.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Engagement Metrics
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {[
                  {
                    label: "Total Views",
                    value: stats.totalViews,
                    icon: <TrendingUp />,
                  },
                  {
                    label: "Comments",
                    value: stats.totalComments,
                    icon: <TrendingUp />,
                  },
                ].map((metric, index) => (
                  <Grid item xs={6} key={metric.label}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 2,
                        textAlign: "center",
                        background:
                          "linear-gradient(45deg, #024950 30%, #0FA4AF 90%)",
                        color: "white",
                        transition: "transform 0.3s ease-in-out",
                        "&:hover": {
                          transform: "translateY(-4px)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 1,
                        }}
                      >
                        {metric.icon}
                      </Box>
                      <Typography variant="h4">
                        {metric.value.toLocaleString()}
                      </Typography>
                      <Typography variant="body2">{metric.label}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Analytics;
