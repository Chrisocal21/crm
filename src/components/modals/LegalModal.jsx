import React, { useState } from 'react'

const LegalModal = ({ isOpen, onClose, document }) => {
  if (!isOpen) return null

  const content = {
    privacy: {
      title: 'Privacy Policy',
      lastUpdated: 'January 17, 2026',
      sections: [
        {
          heading: 'Introduction',
          content: 'ANCHOR by Probably Fine Studios ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we handle information when you use our Customer Relationship Management (CRM) application.'
        },
        {
          heading: 'Data Storage',
          content: 'Our CRM system uses browser localStorage exclusively for data storage. This means all data is stored locally in your browser, no data is transmitted to external servers, no data is stored in cloud databases, and all information remains on your device.'
        },
        {
          heading: 'Information We Collect',
          content: 'When you use our CRM, the following data is stored locally: Business Information, Client Records, Orders & Quotes, Invoices, Tasks & Timesheets, Calendar & Timeline, User Settings, Authentication Data, and File Attachments (Base64 encoded).'
        },
        {
          heading: 'How We Use Your Information',
          content: 'Since all data is stored locally in your browser: We do not access your data - Data never leaves your device. We do not share your data - No third-party access to your information. We do not sell your data - No data is collected or monetized. We do not analyze your data - No analytics or tracking of your CRM usage. Your data is used exclusively by you to manage client relationships, track orders and projects, generate invoices and quotes, schedule tasks and appointments, and monitor business analytics.'
        },
        {
          heading: 'Data Security',
          content: 'Browser Protection: Data security depends on your browser\'s security and your device security. Access Control: Only users with access to your device and browser can view the data. No Transmission: Since data is never transmitted, there\'s no risk of interception. To protect your data: Use strong passwords, keep your device secure, don\'t share portal access codes publicly, log out when using shared devices, and regularly backup your data using the export feature.'
        },
        {
          heading: 'Your Rights',
          content: 'Since all data is stored locally on your device, you have complete control: Right to Access - All your data is directly accessible in the CRM interface and can be exported to JSON. Right to Modify - Edit any record at any time. Right to Delete - Delete individual records or clear all data through Settings. Right to Export - Export all data to JSON format at any time.'
        },
        {
          heading: 'Third-Party Services',
          content: 'Currently, our CRM does not use any third-party services (No external APIs, no cloud storage, no analytics services, no tracking, no payment processors, no email services). Future versions may include optional integrations which will be opt-in and disclosed in an updated policy.'
        },
        {
          heading: 'Cookies and Tracking',
          content: 'Our CRM does not use cookies or tracking technologies. No analytics cookies, no advertising cookies, no tracking scripts, and no third-party trackers. The only browser storage used is localStorage for CRM data persistence.'
        },
        {
          heading: 'Contact Us',
          content: 'If you have questions about this Privacy Policy: Email: privacy@probablyfinestudios.com or visit our GitHub repository for technical questions.'
        }
      ]
    },
    terms: {
      title: 'Terms of Service',
      lastUpdated: 'January 17, 2026',
      sections: [
        {
          heading: 'Agreement to Terms',
          content: 'By accessing and using ANCHOR by Probably Fine Studios, you agree to be bound by these Terms of Service. If you do not agree to these Terms, do not use the Service.'
        },
        {
          heading: 'Description of Service',
          content: 'ANCHOR is a browser-based customer relationship management application that stores all data locally in your browser (localStorage), provides tools for managing clients, orders, invoices, tasks, and business operations, does not transmit data to external servers, and operates entirely within your web browser.'
        },
        {
          heading: 'Use License',
          content: 'We grant you a limited, non-exclusive, non-transferable, revocable license to use ANCHOR for your business purposes. You may use it for commercial business, customize it, install on multiple devices, export your data, and create multiple user accounts. You may not sell, rent, lease, sublicense, reverse engineer (except as permitted by open-source license), remove copyright notices, use for illegal purposes, or attempt to hack or damage the application.'
        },
        {
          heading: 'Data Ownership',
          content: 'You own all data stored in the CRM. We do not access, collect, or control your data. All data remains on your local device. You are the data controller under GDPR/privacy laws.'
        },
        {
          heading: 'Data Responsibility',
          content: 'You are responsible for: Accuracy of data entered, backing up your data regularly (using export feature), compliance with privacy laws regarding client data you store, securing your device and browser, and any data loss due to browser clearing or device failure.'
        },
        {
          heading: 'Limitation of Liability',
          content: 'Since all data is stored locally, we are not liable for any data loss from any cause, browser malfunctions, device failures, or accidental data deletion. To the maximum extent permitted by law, our liability is limited to the amount you paid for the Service (if any), and we are not liable for indirect, incidental, or consequential damages.'
        },
        {
          heading: 'Service Availability',
          content: 'The Service is provided on an "as-is" and "as-available" basis with no guarantees of uptime, bug-free operation, support, or that features won\'t change. We make no warranties that the Service will meet your requirements or be uninterrupted.'
        },
        {
          heading: 'Critical Warnings',
          content: '⚠️ DATA BACKUP WARNING: All data is stored in browser localStorage. Always export backups regularly. Clearing browser data will delete all CRM information permanently. ⚠️ NO CLOUD SYNC: Data is NOT synced across devices. Each browser/device has its own separate data. Use export/import to transfer data between devices.'
        },
        {
          heading: 'Contact Information',
          content: 'For questions about these Terms: Email: legal@probablyfinestudios.com or Support: help@probablyfinestudios.com'
        }
      ]
    },
    license: {
      title: 'MIT License',
      lastUpdated: 'January 17, 2026',
      sections: [
        {
          heading: 'License Terms',
          content: 'Copyright (c) 2026 Probably Fine Studios. Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.'
        },
        {
          heading: 'Warranty Disclaimer',
          content: 'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.'
        },
        {
          heading: 'What This Means',
          content: 'The MIT License allows you to: Use the software for any purpose (personal or commercial), modify and customize the code, distribute and share the software, sublicense and include in proprietary software, and sell or use in commercial products. Requirements: Include this license and copyright notice in any copies, and provide credit to the original authors. The software is provided "as-is" with no guarantees, and authors are not liable for any damages or issues.'
        },
        {
          heading: 'For Users',
          content: 'You can modify it for your business needs, deploy it for your company, white-label it (with attribution), and customize any features freely.'
        },
        {
          heading: 'For Developers',
          content: 'Fork it and make your own version, contribute back with pull requests, create commercial products based on it - just keep the license notice in your code.'
        }
      ]
    }
  }

  const doc = content[document] || content.privacy

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800/50">
          <div>
            <h2 className="text-2xl font-bold text-white">{doc.title}</h2>
            <p className="text-sm text-slate-400 mt-1">Last Updated: {doc.lastUpdated}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)] space-y-6">
          {doc.sections.map((section, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold text-white mb-2">{section.heading}</h3>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line">{section.content}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-700 bg-slate-800/50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default LegalModal
