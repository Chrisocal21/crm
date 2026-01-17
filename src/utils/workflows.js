// Automated Workflow System
// Triggers actions based on data changes

export class WorkflowEngine {
  constructor() {
    this.triggers = []
    this.enabled = true
  }

  // Register a workflow trigger
  register(trigger) {
    this.triggers.push({
      id: trigger.id || Date.now().toString(),
      name: trigger.name,
      event: trigger.event, // 'quote.accepted', 'invoice.overdue', etc.
      condition: trigger.condition, // Function that returns true/false
      action: trigger.action, // Function to execute
      enabled: trigger.enabled !== false
    })
  }

  // Process an event
  async process(event, data) {
    if (!this.enabled) return

    const matchingTriggers = this.triggers.filter(t => 
      t.enabled && t.event === event
    )

    for (const trigger of matchingTriggers) {
      try {
        // Check condition
        if (trigger.condition && !trigger.condition(data)) {
          continue
        }

        // Execute action
        await trigger.action(data)
        
        console.log(`✅ Workflow executed: ${trigger.name}`)
      } catch (error) {
        console.error(`❌ Workflow error: ${trigger.name}`, error)
      }
    }
  }

  // Disable all workflows
  disable() {
    this.enabled = false
  }

  // Enable all workflows
  enable() {
    this.enabled = true
  }

  // Get all registered triggers
  getTriggers() {
    return this.triggers
  }
}

// Default workflows
export const defaultWorkflows = [
  {
    id: 'quote-accepted-create-order',
    name: 'Create Order from Accepted Quote',
    event: 'quote.accepted',
    condition: (quote) => quote.status === 'accepted',
    action: async (quote) => {
      // This will be handled in the component
      console.log('Trigger: Create order from quote', quote.quoteNumber)
    }
  },
  {
    id: 'invoice-overdue-notify',
    name: 'Notify on Overdue Invoice',
    event: 'invoice.overdue',
    condition: (invoice) => {
      const dueDate = new Date(invoice.dueDate)
      const today = new Date()
      return invoice.status === 'unpaid' && dueDate < today
    },
    action: async (invoice) => {
      console.log('Trigger: Invoice overdue notification', invoice.invoiceNumber)
      // Could send email, create task, show notification, etc.
    }
  },
  {
    id: 'order-completed-feedback',
    name: 'Request Feedback on Completed Order',
    event: 'order.completed',
    condition: (order) => order.status === 'completed',
    action: async (order) => {
      console.log('Trigger: Request feedback for order', order.orderNumber)
      // Could create a task, send email, etc.
    }
  },
  {
    id: 'client-new-welcome',
    name: 'Send Welcome Email to New Client',
    event: 'client.created',
    condition: (client) => client.id,
    action: async (client) => {
      console.log('Trigger: Welcome new client', client.name)
      // Could send welcome email, create onboarding tasks
    }
  },
  {
    id: 'task-overdue-reminder',
    name: 'Remind About Overdue Tasks',
    event: 'task.overdue',
    condition: (task) => {
      const dueDate = new Date(task.dueDate)
      const today = new Date()
      return !task.completed && dueDate < today
    },
    action: async (task) => {
      console.log('Trigger: Task overdue reminder', task.title)
      // Could create notification, send email
    }
  },
  {
    id: 'inventory-low-stock',
    name: 'Alert on Low Inventory',
    event: 'inventory.low',
    condition: (item) => item.quantity <= (item.reorderPoint || 5),
    action: async (item) => {
      console.log('Trigger: Low inventory alert', item.name)
      // Could create task to reorder, send notification
    }
  }
]

// Helper to trigger workflows
export const triggerWorkflow = (workflowEngine, event, data) => {
  if (workflowEngine) {
    workflowEngine.process(event, data)
  }
}
