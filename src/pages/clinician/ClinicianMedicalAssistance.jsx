import { useState } from 'react';

import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

import {
  // eslint-disable-next-line no-unused-vars
  getPendingAssistanceRequests,
  mockMedicalAssistanceRequests,
} from '../../data/mockMedicalAssistance';

// Clinician: Medical Assistance
// View and manage patient assistance requests

const assistanceTypeIcons = {
  'medication-refill': '💊',
  prescription: '📝',
  appointment: '📅',
  urgent: '🚨',
  question: '❓',
};

const priorityConfig = {
  low: {
    color: 'bg-gray-100 text-gray-700',
    label: 'Low',
  },
  normal: {
    color: 'bg-blue-100 text-blue-700',
    label: 'Normal',
  },
  high: {
    color: 'bg-yellow-100 text-yellow-700',
    label: 'High',
  },
  urgent: {
    color: 'bg-red-100 text-red-700',
    label: 'Urgent',
  },
};

const statusConfig = {
  pending: {
    color: 'pending',
    label: 'Pending',
  },
  'in-progress': {
    color: 'pending',
    label: 'In Progress',
  },
  resolved: {
    color: 'verified',
    label: 'Resolved',
  },
  closed: {
    color: 'pending',
    label: 'Closed',
  },
};

export const ClinicianMedicalAssistance = () => {
  const [requests, setRequests] = useState(
    mockMedicalAssistanceRequests
  );

  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredRequests =
    selectedFilter === 'all'
      ? requests
      : requests.filter(
          (request) => request.status === selectedFilter
        );

  const handleStartRequest = (requestId) => {
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: 'in-progress',
              assignedTo: 'clinician-001',
            }
          : request
      )
    );
  };

  const handleResolveRequest = (requestId) => {
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: 'resolved',
              assignedTo: 'clinician-001',
              resolvedAt: new Date().toISOString(),
            }
          : request
      )
    );
  };

  return (
    <div className="space-y-6">

      {/* Page header */}
      <section>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Medical Assistance
        </h1>

        <p className="mt-2 text-gray-600">
          Review and manage patient assistance requests.
        </p>
      </section>

      {/* Summary cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <Card>
          <p className="text-sm text-gray-600">
            Total Requests
          </p>

          <p className="text-2xl font-bold text-gray-900 mt-1">
            {requests.length}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600">
            Pending
          </p>

          <p className="text-2xl font-bold text-gray-900 mt-1">
            {
              requests.filter(
                (request) => request.status === 'pending'
              ).length
            }
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600">
            In Progress
          </p>

          <p className="text-2xl font-bold text-gray-900 mt-1">
            {
              requests.filter(
                (request) => request.status === 'in-progress'
              ).length
            }
          </p>
        </Card>

      </section>

      {/* Filters */}
      <section>
        <div className="flex flex-wrap gap-2">

          <Button
            variant={
              selectedFilter === 'all'
                ? 'primary'
                : 'secondary'
            }
            size="sm"
            onClick={() => setSelectedFilter('all')}
          >
            All
          </Button>

          <Button
            variant={
              selectedFilter === 'pending'
                ? 'primary'
                : 'secondary'
            }
            size="sm"
            onClick={() => setSelectedFilter('pending')}
          >
            Pending
          </Button>

          <Button
            variant={
              selectedFilter === 'in-progress'
                ? 'primary'
                : 'secondary'
            }
            size="sm"
            onClick={() => setSelectedFilter('in-progress')}
          >
            In Progress
          </Button>

          <Button
            variant={
              selectedFilter === 'resolved'
                ? 'primary'
                : 'secondary'
            }
            size="sm"
            onClick={() => setSelectedFilter('resolved')}
          >
            Resolved
          </Button>

        </div>
      </section>

      {/* Requests */}
      <section className="space-y-4">

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Assistance Requests
          </h2>

          <span className="text-sm text-gray-500">
            {filteredRequests.length} result
            {filteredRequests.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredRequests.length > 0 ? (
          <div className="space-y-4">

            {filteredRequests.map((request) => {
              const typeIcon =
                assistanceTypeIcons[request.type] || '❓';

              const priorityStyle =
                priorityConfig[request.priority];

              const statusStyle =
                statusConfig[request.status];

              return (
                <Card key={request.id}>

                  <div className="space-y-4">

                    {/* Request header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                      <div className="flex items-start gap-3">

                        <span className="text-2xl">
                          {typeIcon}
                        </span>

                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {request.title}
                          </h3>

                          <p className="text-sm text-gray-600 mt-1">
                            Patient: {request.patientName}
                          </p>
                        </div>

                      </div>

                      <Badge variant={statusStyle.color}>
                        {statusStyle.label}
                      </Badge>

                    </div>

                    {/* Request details */}
                    <div className="space-y-2">

                      <p className="text-sm text-gray-700">
                        {request.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-sm">

                        <span
                          className={`px-2 py-1 rounded ${priorityStyle.color}`}
                        >
                          {priorityStyle.label} Priority
                        </span>

                        <span className="text-gray-500">
                          {new Date(
                            request.createdAt
                          ).toLocaleDateString()}
                        </span>

                        {request.assignedTo && (
                          <span className="text-gray-600">
                            Assigned to clinician
                          </span>
                        )}

                      </div>

                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">

                      {request.status === 'pending' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            handleStartRequest(request.id)
                          }
                        >
                          Start Request
                        </Button>
                      )}

                      {request.status === 'in-progress' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            handleResolveRequest(request.id)
                          }
                        >
                          Mark as Resolved
                        </Button>
                      )}

                      {request.status === 'resolved' && (
                        <span className="text-sm text-green-700 py-2">
                          ✓ Request resolved
                        </span>
                      )}

                    </div>

                  </div>

                </Card>
              );
            })}

          </div>
        ) : (
          <Card className="text-center py-10">

            <p className="text-gray-600">
              No requests found.
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Try selecting a different filter.
            </p>

          </Card>
        )}

      </section>

    </div>
  );
};