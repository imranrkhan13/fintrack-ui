# Fintrack — Finance Dashboard

A clean, interactive finance dashboard built with React, TypeScript, and Recharts.

## Tech Stack

- **React 18** with TypeScript
- **Recharts** for data visualizations
- **Lucide React** for icons
- **date-fns** for date formatting
- **Vite** for fast dev/build
- **CSS** with Inter font (no UI framework — hand-crafted styles)

## Setup & Run

```bash
cd finance-dashboard
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173)

To build for production:
```bash
npm run build
npm run preview
```

## Features

### Dashboard Overview
- **Summary cards**: Total Balance, Total Income, Total Expenses — with savings rate and a mini progress bar
- **Monthly Trend chart**: Area chart showing income vs expenses month by month
- **Spending Breakdown**: Donut chart showing top 6 expense categories with a legend

### Transactions
- Full transaction list with Date, Description, Category, Type, Amount
- **Search** by description or category
- **Filter** by type (all / income / expense) and category
- **Sort** by date or amount, ascending or descending
- Admin users can **Add**, **Edit**, and **Delete** transactions via a modal

### Role-Based UI
- Toggle between **Admin** and **Viewer** in the header
- **Admin**: full CRUD access, Add button visible, edit/delete icons on hover
- **Viewer**: read-only, no mutation controls, yellow banner reminder
- Role is persisted in localStorage

### Insights
- Highest spending category
- Savings rate with a good/warning signal
- Month-over-month expense comparison
- Income to expense ratio

### State Management
- **React Context + useReducer** for global state
- State includes: transactions, role, filterType, filterCategory, searchQuery, sortBy, sortOrder
- Full state persisted to **localStorage** on every change

### Export
- **CSV export** button in the header — downloads all current transactions as a `.csv` file

## Design Decisions

- White background, black text, Inter font — as specified
- Minimal, editorial aesthetic — clean grid, subtle borders, no heavy shadows
- Smooth CSS animations (`slideUp`, `fadeIn`, `scaleIn`) on all dynamic content
- Fully responsive: 3-col → 1-col on mobile, nav icons only on small screens
- Empty states handled gracefully with a clear message and reset action
- No emoji — Lucide icons throughout

## Folder Structure

```
src/
  components/
    Header.tsx        # Navigation, role switcher, export
    SummaryCards.tsx  # Three KPI cards
    Charts.tsx        # TrendChart + CategoryChart
    Transactions.tsx  # List, search, filter, CRUD modal
    Insights.tsx      # Four insight cards
  context/
    AppContext.tsx     # Global state, reducer, localStorage persistence
  data/
    mockData.ts       # 40 realistic mock transactions + constants
  types/
    index.ts          # TypeScript interfaces
  utils/
    index.ts          # Pure calculation functions
  App.tsx             # Root, tab routing
  index.css           # All styles
  main.tsx            # Entry
```
# fintrack-ui
