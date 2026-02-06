# How to View Analytics Graphs

## Step-by-Step Guide

### 1. Navigate to Datasets Page
- Go to: `http://localhost:3000/datasets`
- You'll see your uploaded dataset "1st" with status "processed"

### 2. Click "Analyze" Button
- Click the blue "Analyze" button next to your dataset
- This will take you to: `http://localhost:3000/analytics/6984da561574867d960397f3`

### 3. Select a Metric
- You'll see three metric buttons at the top:
  - **revenue**
  - **orders**
  - **customers**
- Click on any metric (e.g., "revenue")

### 4. Run Analytics
- After selecting a metric, click the green "Run Analytics" button
- Wait a few seconds for processing

### 5. View the Graphs
Once analytics completes, you'll see:

#### Summary Statistics (Top Section)
- Mean, Median, Standard Deviation, Min, Max values
- Displayed in colorful cards

#### Line Chart (Middle Section)
- Shows trend over time
- Blue line with data points
- X-axis: dates
- Y-axis: metric values

#### Bar Chart (Bottom Section)
- Same data in bar format
- Green bars
- Better for comparing individual values

#### Anomalies (If Any)
- Red-highlighted section showing unusual data points
- Includes row number and reason for anomaly

## Available Metrics
Based on your API response, you have these metrics:
- **revenue**: Financial data trends
- **orders**: Order volume analysis
- **customers**: Customer count patterns

## Quick Access
Direct link to your analytics page:
`http://localhost:3000/analytics/6984da561574867d960397f3`

## Troubleshooting
If graphs don't appear:
1. Make sure you selected a metric
2. Click "Run Analytics" button
3. Wait for the loading spinner to finish
4. Check browser console for errors
