import { useState } from 'react';

import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

import { auditService } from '../../services/auditService';

const actionConfig = {
    viewed_record: {
        icon: '👁️',
        label: 'Viewed Record',
    },
    added_record: {
        icon: '➕',
        label: 'Added Clinical Record',
    },
    verified_assistance: {
        icon: '✓',
        label: 'Verified Assistance',
    },
    saved_draft: {
        icon: '📝',
        label: 'Saved Draft',
    },

    submitted_record: {
        icon: '🔒',
        label: 'Submitted Record',
    },
};

export const AuditActivity = () => {
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [logs] = useState(() => auditService.getLogs())

    const filteredLogs =
    selectedFilter === 'all'
        ? logs
        : logs.filter(
            (log) => log.action === selectedFilter
        );

    return (
        <div className="space-y-6">

        {/* Page header */}
        <section>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Audit Activity
            </h1>

            <p className="mt-2 text-gray-600">
            Review activity related to patient records and clinical actions.
            </p>
        </section>

        {/* Information notice */}
        <Card>
            <div className="flex items-start gap-3">
            <span className="text-xl">🔒</span>

            <div>
                <h2 className="font-semibold text-gray-900">
                Patient record activity
                </h2>

                <p className="text-sm text-gray-600 mt-1">
                Access to sensitive patient information is recorded so that
                activity can be reviewed when needed.
                </p>
            </div>
            </div>
        </Card>

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
                All Activity
            </Button>

            <Button
                variant={
                selectedFilter === 'viewed_record'
                    ? 'primary'
                    : 'secondary'
                }
                size="sm"
                onClick={() => setSelectedFilter('viewed_record')}
            >
                Viewed Records
            </Button>

            <Button
                variant={
                selectedFilter === 'added_record'
                    ? 'primary'
                    : 'secondary'
                }
                size="sm"
                onClick={() => setSelectedFilter('added_record')}
            >
                Added Records
            </Button>

            <Button
                variant={
                selectedFilter === 'verified_assistance'
                    ? 'primary'
                    : 'secondary'
                }
                size="sm"
                onClick={() =>
                setSelectedFilter('verified_assistance')
                }
            >
                Assistance
            </Button>

            </div>
        </section>

        {/* Activity list */}
        <section className="space-y-4">

            <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
                Activity Log
            </h2>

            <span className="text-sm text-gray-500">
                {filteredLogs.length} entr
                {filteredLogs.length === 1 ? 'y' : 'ies'}
            </span>
            </div>

            {filteredLogs.length > 0 ? (
            <div className="space-y-3">

                {filteredLogs.map((log) => {
                const action =
                    actionConfig[log.action] || {
                    icon: '📋',
                    label: 'Activity',
                    };

                return (
                    <Card key={log.id}>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">

                        {/* Action icon */}
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span>{action.icon}</span>
                        </div>

                        {/* Activity details */}
                        <div className="flex-1 min-w-0">

                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">

                            <div>
                            <div className="flex flex-wrap items-center gap-2">

                                <h3 className="font-semibold text-gray-900">
                                {action.label}
                                </h3>

                                <Badge variant="pending">
                                Audit Log
                                </Badge>

                            </div>

                            <p className="text-sm text-gray-600 mt-1">
                                {log.description}
                            </p>
                            </div>

                            <span className="text-xs text-gray-500 whitespace-nowrap">
                            {new Date(
                                log.timestamp
                            ).toLocaleString()}
                            </span>

                        </div>

                        {/* Metadata */}
                        <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">

                            <div>
                            <span className="text-gray-500">
                                Clinician:{' '}
                            </span>

                            <span className="font-medium text-gray-700">
                                {log.clinicianName}
                            </span>
                            </div>

                            <div>
                            <span className="text-gray-500">
                                Patient:{' '}
                            </span>

                            <span className="font-medium text-gray-700">
                                {log.patientName}
                            </span>
                            </div>

                        </div>

                        </div>

                    </div>
                    </Card>
                );
                })}

            </div>
            ) : (
            <Card className="text-center py-10">
                <p className="text-gray-600">
                No activity found.
                </p>

                <p className="text-sm text-gray-500 mt-2">
                Try selecting a different activity filter.
                </p>
            </Card>
            )}

        </section>

        </div>
    );
};