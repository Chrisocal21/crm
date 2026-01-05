# Unified CRM Data System - Integration Guide

## Overview
This system connects all CRM views (Kanban, Calendar, Timeline, Tasks, Clients, Bids) with a single source of truth so changes in one view automatically synchronize across all others.

## What Was Built

### 1. Core Data Context (`src/context/DataContext.jsx`)
- Centralized state management for all entities
- Auto-synchronization between related items
- Persistent localStorage integration
- Query helpers for cross-referencing data

### 2. Unified View Components
All view components have been updated with synchronized data:

- **KanbanViewUnified.jsx** - Drag-and-drop with auto-sync to tasks, calendar, timeline
- **CalendarViewUnified.jsx** - Shows all items with dates, updates source entities
- **TimelineViewUnified.jsx** - Visualizes project schedules with real-time status sync
- **TasksViewUnified.jsx** - Tasks linked to projects/clients, completion updates projects
- **ClientsViewUnified.jsx** - Aggregated view of all client data with click-to-filter
- **BidsViewUnified.jsx** - Accepting bids auto-creates projects in Kanban

## Key Features

### Cross-View Synchronization
1. **Kanban → Everything**
   - Moving a card to "Completed" marks project tasks as completed
   - Status changes update task statuses automatically
   - Tags propagate to related tasks

2. **Tasks → Projects**
   - Completing all project tasks updates project status
   - Task dates sync with project timelines

3. **Bids → Projects**
   - Accepting a bid creates a new project
   - Project appears immediately in Kanban
   - Auto-creates initial task for the project

4. **Clients → All Views**
   - Clicking a client filters all views to show their data
   - Unified view of projects, tasks, and bids per client

5. **Calendar & Timeline**
   - Both display projects, tasks, and events
   - Changes sync back to source entities

## How to Integrate into App.jsx

### Step 1: Import the DataProvider
```javascript
import { DataProvider } from './context/DataContext'
```

### Step 2: Wrap your app with DataProvider
Replace the main return statement in App.jsx:

```javascript
return (
  <DataProvider>
    {/* Your existing app content */}
    <div className="min-h-screen bg-gradient-to-br...">
      {/* All your current JSX */}
    </div>
  </DataProvider>
)
```

### Step 3: Update View Component Imports
Replace the old view imports with unified versions:

```javascript
// Old imports
import KanbanView from './components/views/KanbanView'
import CalendarView from './components/views/CalendarView'
// ... etc

// New imports
import KanbanView from './components/views/KanbanViewUnified'
import CalendarView from './components/views/CalendarViewUnified'
import TimelineView from './components/views/TimelineViewUnified'
import TasksView from './components/views/TasksViewUnified'
import ClientsView from './components/views/ClientsViewUnified'
import BidsView from './components/views/BidsViewUnified'
```

### Step 4: Update View Component Props
The unified components use the DataContext, so you can remove data prop drilling:

```javascript
// Old way (passing all data as props)
<KanbanView 
  orders={orders}
  clients={clients}
  kanbanFilters={kanbanFilters}
  setKanbanFilters={setKanbanFilters}
  openNewOrderModal={openNewOrderModal}
  openOrderDetailModal={openOrderDetailModal}
  dataManager={dataManager}
  loadData={loadData}
  activeConfig={activeConfig}
/>

// New way (minimal props, data comes from context)
<KanbanView 
  openNewOrderModal={openNewOrderModal}
  openOrderDetailModal={openOrderDetailModal}
  activeConfig={activeConfig}
/>
```

## Data Schema

### Project/Order
```javascript
{
  id: string,
  orderNumber: string,
  clientId: string,
  status: string,
  items: array,
  pricing: { total, paid, balance },
  tags: array,
  dueDate: ISO string,
  startDate: ISO string,
  store: string,
  priority: string,
  createdAt: ISO string,
  updatedAt: ISO string
}
```

### Task
```javascript
{
  id: string,
  title: string,
  description: string,
  projectId: string | null,  // Links to project
  clientId: string | null,   // Links to client
  status: 'pending' | 'in-progress' | 'completed',
  priority: 'low' | 'medium' | 'high',
  dueDate: ISO string,
  tags: array,
  syncWithProject: boolean,  // Auto-sync with project status
  createdAt: ISO string,
  updatedAt: ISO string
}
```

### Event
```javascript
{
  id: string,
  title: string,
  startDate: ISO string,
  endDate: ISO string,
  allDay: boolean,
  linkedTo: {              // Links to other entities
    type: 'project' | 'task',
    id: string
  },
  createdAt: ISO string,
  updatedAt: ISO string
}
```

### Bid
```javascript
{
  id: string,
  bidNumber: string,
  clientId: string,
  status: 'draft' | 'sent' | 'accepted' | 'rejected',
  items: array,
  subtotal: number,
  tax: number,
  total: number,
  validUntil: ISO string,
  createdAt: ISO string,
  updatedAt: ISO string
}
```

## API Reference

### DataContext Methods

#### Project Operations
- `updateProject(projectId, updates)` - Update project and sync related items
- `addProject(project)` - Add new project
- `deleteProject(projectId)` - Delete project (archives related tasks)

#### Task Operations
- `updateTask(taskId, updates)` - Update task and sync to project
- `addTask(task)` - Add new task
- `deleteTask(taskId)` - Delete task

#### Client Operations
- `updateClient(clientId, updates)` - Update client
- `addClient(client)` - Add new client
- `deleteClient(clientId)` - Delete client

#### Bid Operations
- `updateBid(bidId, updates)` - Update bid (accepting converts to project)
- `addBid(bid)` - Add new bid
- `deleteBid(bidId)` - Delete bid

#### Query Helpers
- `getProjectsByClient(clientId)` - Get all client projects
- `getTasksByProject(projectId)` - Get all project tasks
- `getTasksByClient(clientId)` - Get all client tasks
- `getBidsByClient(clientId)` - Get all client bids
- `getAllCalendarItems()` - Get all items with dates for calendar
- `getClientSummary(clientId)` - Get complete client statistics

## Synchronization Rules

### Status Mapping
When a project status changes, related tasks update:
- `pending` → `pending`
- `designing/production/printing/finishing` → `in-progress`
- `ready/delivered/completed` → `completed`

### Automatic Actions
1. **Moving Kanban Card:**
   - Updates project status
   - Syncs task statuses
   - Updates calendar dates if applicable

2. **Completing All Tasks:**
   - Auto-marks project as completed
   - Updates in Kanban board
   - Reflects in timeline

3. **Accepting Bid:**
   - Creates new project
   - Appears in Kanban board
   - Creates initial task
   - Links to client

4. **Changing Dates:**
   - Calendar updates sync to projects/tasks
   - Timeline reflects changes
   - Due date badges update in Kanban

## Testing the Integration

1. **Test Kanban → Tasks:**
   - Create a project in Kanban
   - Add tasks linked to that project
   - Move project card between columns
   - Verify task statuses update

2. **Test Tasks → Kanban:**
   - Mark all tasks for a project as complete
   - Check Kanban board - project should show completed

3. **Test Bids → Kanban:**
   - Create a bid
   - Accept the bid
   - Check Kanban - new project should appear

4. **Test Client Filtering:**
   - Click a client in Clients view
   - Verify Kanban filters to show only that client's projects

5. **Test Calendar/Timeline:**
   - Projects with due dates appear in both views
   - Changes in one reflect in the other

## Migration from Old System

The unified system is backward compatible with your existing localStorage data:
- Old `anchor_crm_orders` becomes `projects`
- Old `anchor_crm_tasks` continues to work
- Old `anchor_crm_clients` continues to work
- Old `anchor_crm_bids` continues to work

Data is automatically loaded from localStorage on initialization.

## Benefits

✅ Single source of truth - no data duplication
✅ Real-time synchronization across all views
✅ Automatic relationship management
✅ Reduced prop drilling
✅ Easier to add new features
✅ Better data consistency
✅ Improved user experience with seamless updates

## Next Steps

1. Wrap App.jsx with DataProvider
2. Update component imports to use unified versions
3. Test synchronization between views
4. Add any custom business logic in DataContext
5. Extend with additional entities (invoices, notes, etc.)
