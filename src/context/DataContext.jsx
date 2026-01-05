import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export const DataProvider = ({ children }) => {
  // Unified state management
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('anchor_crm_orders')
    return saved ? JSON.parse(saved) : []
  })

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('anchor_crm_tasks')
    return saved ? JSON.parse(saved) : []
  })

  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('anchor_crm_clients')
    return saved ? JSON.parse(saved) : []
  })

  const [bids, setBids] = useState(() => {
    const saved = localStorage.getItem('anchor_crm_bids')
    return saved ? JSON.parse(saved) : []
  })

  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('anchor_crm_events')
    return saved ? JSON.parse(saved) : []
  })

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('anchor_crm_notes')
    return saved ? JSON.parse(saved) : []
  })

  // Persist to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('anchor_crm_orders', JSON.stringify(projects))
  }, [projects])

  useEffect(() => {
    localStorage.setItem('anchor_crm_tasks', JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem('anchor_crm_clients', JSON.stringify(clients))
  }, [clients])

  useEffect(() => {
    localStorage.setItem('anchor_crm_bids', JSON.stringify(bids))
  }, [bids])

  useEffect(() => {
    localStorage.setItem('anchor_crm_events', JSON.stringify(events))
  }, [events])

  useEffect(() => {
    localStorage.setItem('anchor_crm_notes', JSON.stringify(notes))
  }, [notes])

  // ============================================================================
  // PROJECT/ORDER OPERATIONS
  // ============================================================================

  const updateProject = useCallback((projectId, updates) => {
    setProjects(prev => {
      const updated = prev.map(p => 
        p.id === projectId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
      
      // Sync related data
      const project = updated.find(p => p.id === projectId)
      if (project) {
        // If status changed, update related tasks
        if (updates.status) {
          syncProjectStatusToTasks(projectId, updates.status)
        }
        
        // If dates changed, update related tasks and events
        if (updates.dueDate || updates.startDate) {
          syncProjectDatesToRelated(projectId, updates)
        }
        
        // If tags changed, propagate to related items
        if (updates.tags) {
          syncProjectTagsToRelated(projectId, updates.tags)
        }
      }
      
      return updated
    })
  }, [])

  const addProject = useCallback((project) => {
    const newProject = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setProjects(prev => [...prev, newProject])
    return newProject
  }, [])

  const deleteProject = useCallback((projectId) => {
    setProjects(prev => prev.filter(p => p.id !== projectId))
    // Optionally clean up or archive related tasks
    setTasks(prev => prev.map(t => 
      t.projectId === projectId ? { ...t, projectId: null, archivedProject: projectId } : t
    ))
  }, [])

  // ============================================================================
  // TASK OPERATIONS
  // ============================================================================

  const updateTask = useCallback((taskId, updates) => {
    setTasks(prev => {
      const updated = prev.map(t =>
        t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      )
      
      // Sync task changes back to project
      const task = updated.find(t => t.id === taskId)
      if (task && task.projectId) {
        syncTaskToProject(task)
      }
      
      return updated
    })
  }, [])

  const addTask = useCallback((task) => {
    const newTask = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setTasks(prev => [...prev, newTask])
    return newTask
  }, [])

  const deleteTask = useCallback((taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }, [])

  // ============================================================================
  // CLIENT OPERATIONS
  // ============================================================================

  const updateClient = useCallback((clientId, updates) => {
    setClients(prev => prev.map(c =>
      c.id === clientId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    ))
  }, [])

  const addClient = useCallback((client) => {
    const newClient = {
      ...client,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setClients(prev => [...prev, newClient])
    return newClient
  }, [])

  const deleteClient = useCallback((clientId) => {
    setClients(prev => prev.filter(c => c.id !== clientId))
  }, [])

  // ============================================================================
  // BID OPERATIONS
  // ============================================================================

  const updateBid = useCallback((bidId, updates) => {
    setBids(prev => {
      const updated = prev.map(b =>
        b.id === bidId ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
      )
      
      // If bid is accepted, create a project
      const bid = updated.find(b => b.id === bidId)
      if (bid && updates.status === 'accepted' && bid.status !== 'accepted') {
        convertBidToProject(bid)
      }
      
      return updated
    })
  }, [])

  const addBid = useCallback((bid) => {
    const newBid = {
      ...bid,
      id: Date.now().toString(),
      bidNumber: `BID-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setBids(prev => [...prev, newBid])
    return newBid
  }, [])

  const deleteBid = useCallback((bidId) => {
    setBids(prev => prev.filter(b => b.id !== bidId))
  }, [])

  // ============================================================================
  // EVENT OPERATIONS
  // ============================================================================

  const updateEvent = useCallback((eventId, updates) => {
    setEvents(prev => prev.map(e =>
      e.id === eventId ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
    ))
    
    // Sync event changes back to related entities
    const event = events.find(e => e.id === eventId)
    if (event && event.linkedTo) {
      syncEventToLinkedEntity(event, updates)
    }
  }, [events])

  const addEvent = useCallback((event) => {
    const newEvent = {
      ...event,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setEvents(prev => [...prev, newEvent])
    return newEvent
  }, [])

  const deleteEvent = useCallback((eventId) => {
    setEvents(prev => prev.filter(e => e.id !== eventId))
  }, [])

  // ============================================================================
  // SYNCHRONIZATION HELPERS
  // ============================================================================

  const syncProjectStatusToTasks = useCallback((projectId, newStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.projectId === projectId && t.syncWithProject !== false) {
        // Map project status to task status
        const taskStatus = mapProjectStatusToTask(newStatus)
        return { ...t, status: taskStatus, updatedAt: new Date().toISOString() }
      }
      return t
    }))
  }, [])

  const syncProjectDatesToRelated = useCallback((projectId, dateUpdates) => {
    // Update related tasks
    setTasks(prev => prev.map(t => {
      if (t.projectId === projectId && t.syncWithProject !== false) {
        const updates = {}
        if (dateUpdates.dueDate && !t.dueDate) {
          updates.dueDate = dateUpdates.dueDate
        }
        return { ...t, ...updates, updatedAt: new Date().toISOString() }
      }
      return t
    }))

    // Update related events
    setEvents(prev => prev.map(e => {
      if (e.linkedTo?.type === 'project' && e.linkedTo?.id === projectId) {
        const updates = {}
        if (dateUpdates.dueDate) {
          updates.endDate = dateUpdates.dueDate
        }
        if (dateUpdates.startDate) {
          updates.startDate = dateUpdates.startDate
        }
        return { ...e, ...updates, updatedAt: new Date().toISOString() }
      }
      return e
    }))
  }, [])

  const syncProjectTagsToRelated = useCallback((projectId, tags) => {
    setTasks(prev => prev.map(t => {
      if (t.projectId === projectId && t.syncWithProject !== false) {
        return { ...t, tags, updatedAt: new Date().toISOString() }
      }
      return t
    }))
  }, [])

  const syncTaskToProject = useCallback((task) => {
    if (!task.projectId) return
    
    setProjects(prev => prev.map(p => {
      if (p.id === task.projectId) {
        // Check if all project tasks are complete
        const projectTasks = tasks.filter(t => t.projectId === task.projectId)
        const allComplete = projectTasks.every(t => t.status === 'completed')
        
        const updates = {}
        if (allComplete && p.status !== 'completed') {
          updates.status = 'completed'
        }
        
        return { ...p, ...updates, updatedAt: new Date().toISOString() }
      }
      return p
    }))
  }, [tasks])

  const syncEventToLinkedEntity = useCallback((event, updates) => {
    if (event.linkedTo?.type === 'project' && updates.startDate) {
      updateProject(event.linkedTo.id, { startDate: updates.startDate })
    } else if (event.linkedTo?.type === 'task' && updates.startDate) {
      updateTask(event.linkedTo.id, { dueDate: updates.startDate })
    }
  }, [])

  const convertBidToProject = useCallback((bid) => {
    const newProject = {
      clientId: bid.clientId,
      orderNumber: `ORD-${Date.now()}`,
      status: 'pending',
      items: bid.items || [],
      pricing: {
        subtotal: bid.subtotal,
        tax: bid.tax,
        total: bid.total,
        paid: 0
      },
      tags: bid.tags || [],
      notes: `Converted from bid ${bid.bidNumber}`,
      bidId: bid.id,
      store: 'direct',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    addProject(newProject)
    
    // Create a task for the new project
    addTask({
      title: `Start project for ${bid.clientId}`,
      projectId: newProject.id,
      clientId: bid.clientId,
      status: 'pending',
      priority: 'high',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    })
  }, [addProject, addTask])

  // Helper function to map project status to task status
  const mapProjectStatusToTask = (projectStatus) => {
    const statusMap = {
      'pending': 'pending',
      'designing': 'in-progress',
      'production': 'in-progress',
      'printing': 'in-progress',
      'finishing': 'in-progress',
      'ready': 'completed',
      'delivered': 'completed',
      'completed': 'completed',
      'cancelled': 'cancelled'
    }
    return statusMap[projectStatus] || 'pending'
  }

  // ============================================================================
  // QUERY HELPERS - Get related data
  // ============================================================================

  const getProjectsByClient = useCallback((clientId) => {
    return projects.filter(p => p.clientId === clientId)
  }, [projects])

  const getTasksByProject = useCallback((projectId) => {
    return tasks.filter(t => t.projectId === projectId)
  }, [tasks])

  const getTasksByClient = useCallback((clientId) => {
    return tasks.filter(t => t.clientId === clientId)
  }, [tasks])

  const getBidsByClient = useCallback((clientId) => {
    return bids.filter(b => b.clientId === clientId)
  }, [bids])

  const getEventsByProject = useCallback((projectId) => {
    return events.filter(e => e.linkedTo?.type === 'project' && e.linkedTo?.id === projectId)
  }, [events])

  const getEventsByDate = useCallback((date) => {
    const dateStr = new Date(date).toISOString().split('T')[0]
    return events.filter(e => {
      const eventDate = new Date(e.startDate).toISOString().split('T')[0]
      return eventDate === dateStr
    })
  }, [events])

  const getAllCalendarItems = useCallback(() => {
    // Combine projects with due dates, tasks with due dates, and events
    const items = []
    
    // Add projects with due dates
    projects.filter(p => p.dueDate).forEach(p => {
      items.push({
        id: p.id,
        type: 'project',
        title: p.orderNumber || `Order ${p.id}`,
        date: p.dueDate,
        startDate: p.startDate,
        endDate: p.dueDate,
        status: p.status,
        clientId: p.clientId,
        tags: p.tags,
        data: p
      })
    })
    
    // Add tasks with due dates
    tasks.filter(t => t.dueDate).forEach(t => {
      items.push({
        id: t.id,
        type: 'task',
        title: t.title,
        date: t.dueDate,
        startDate: t.dueDate,
        endDate: t.dueDate,
        status: t.status,
        priority: t.priority,
        projectId: t.projectId,
        clientId: t.clientId,
        tags: t.tags,
        data: t
      })
    })
    
    // Add events
    events.forEach(e => {
      items.push({
        id: e.id,
        type: 'event',
        title: e.title,
        date: e.startDate,
        startDate: e.startDate,
        endDate: e.endDate,
        allDay: e.allDay,
        linkedTo: e.linkedTo,
        data: e
      })
    })
    
    return items.sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [projects, tasks, events])

  const getClientSummary = useCallback((clientId) => {
    const clientProjects = getProjectsByClient(clientId)
    const clientTasks = getTasksByClient(clientId)
    const clientBids = getBidsByClient(clientId)
    
    const totalRevenue = clientProjects.reduce((sum, p) => sum + (p.pricing?.total || 0), 0)
    const totalPaid = clientProjects.reduce((sum, p) => sum + (p.pricing?.paid || 0), 0)
    const pendingTasks = clientTasks.filter(t => t.status === 'pending').length
    const activeBids = clientBids.filter(b => b.status === 'sent' || b.status === 'draft').length
    
    return {
      projectCount: clientProjects.length,
      taskCount: clientTasks.length,
      bidCount: clientBids.length,
      totalRevenue,
      totalPaid,
      pendingTasks,
      activeBids,
      projects: clientProjects,
      tasks: clientTasks,
      bids: clientBids
    }
  }, [getProjectsByClient, getTasksByClient, getBidsByClient])

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value = {
    // State
    projects,
    tasks,
    clients,
    bids,
    events,
    notes,
    
    // Project operations
    updateProject,
    addProject,
    deleteProject,
    
    // Task operations
    updateTask,
    addTask,
    deleteTask,
    
    // Client operations
    updateClient,
    addClient,
    deleteClient,
    
    // Bid operations
    updateBid,
    addBid,
    deleteBid,
    
    // Event operations
    updateEvent,
    addEvent,
    deleteEvent,
    
    // Query helpers
    getProjectsByClient,
    getTasksByProject,
    getTasksByClient,
    getBidsByClient,
    getEventsByProject,
    getEventsByDate,
    getAllCalendarItems,
    getClientSummary
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export default DataContext
