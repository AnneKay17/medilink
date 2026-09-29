// Temporary file to test components - delete after verification
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';

import { Modal } from '../../components/common/Modal';
import { SearchBar } from '../../components/common/SearchBar';
import { useState } from 'react';
import { Button } from '../../components/common/Button';

export const ComponentShowcase = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (value) => {
    console.log('Search for:', value);
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1000);
  };
  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Card */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Card Component</h2>
          <Card>
            <h3 className="font-semibold mb-2">Sample Card</h3>
            <p>This is example content inside a card.</p>
          </Card>
        </section>

        {/* Badges - Severity */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Badge - Severity Levels</h2>
          <div className="space-y-3">
            <Badge variant="life-threatening">Anaphylaxis</Badge>
            <Badge variant="severe">Severe reaction</Badge>
            <Badge variant="moderate">Moderate reaction</Badge>
            <Badge variant="mild">Mild reaction</Badge>
          </div>
        </section>

        {/* Badges - Status */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Badge - Status</h2>
          <div className="space-y-3">
            <Badge variant="active">Active</Badge>
            <Badge variant="pending">Pending</Badge>
            <Badge variant="verified">Verified</Badge>
            <Badge variant="discontinued">Discontinued</Badge>
          </div>
        </section>

        {/* LoadingSpinner */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Loading Spinner</h2>
          <div className="space-y-8">
            <div>
              <p className="text-sm text-gray-600 mb-4">Small</p>
              <LoadingSpinner size="sm" message="Loading..." />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-4">Medium (default)</p>
              <LoadingSpinner message="Searching patients..." />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-4">Large</p>
              <LoadingSpinner size="lg" message="Loading records..." />
            </div>
          </div>
        </section>

        {/* EmptyState */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Empty State</h2>
          <Card>
            <EmptyState 
              title="No allergies recorded"
              description="Your record shows no documented allergies."
            />
          </Card>
        </section>

        {/* EmptyState with action */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Empty State with Action</h2>
          <Card>
            <EmptyState 
              title="No facilities found"
              description="Try expanding your search radius."
              actionLabel="Adjust filters"
              onAction={() => alert('Action clicked!')}
            />
          </Card>
        </section>

        {/* ErrorMessage */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Error Message</h2>
          <div className="space-y-4">
            <ErrorMessage 
              message="Invalid email or password"
            />
            <ErrorMessage 
              message="Network connection failed. Please try again."
              onDismiss={() => alert('Dismissed!')}
            />
            <ErrorMessage 
              type="warning"
              message="This record is incomplete. Add missing information."
              onDismiss={() => alert('Dismissed!')}
            />
          </div>
        </section>

        {/* Modal Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Modal</h2>
          
          <div className="space-y-4">
            <Button 
              onClick={() => setIsModalOpen(true)}
              variant="primary"
            >
              Open Modal
            </Button>

            <Modal
              isOpen={isModalOpen}
              title="Add Clinical Record"
              onClose={() => setIsModalOpen(false)}
              size="md"
              footer={
                <>
                  <Button 
                    variant="secondary"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Save
                  </Button>
                </>
              }
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Record Type
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option>Diagnosis</option>
                    <option>Medication</option>
                    <option>Allergy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Details
                  </label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24"
                    placeholder="Enter record details..."
                  />
                </div>
              </div>
            </Modal>
          </div>
        </section>

        {/* Modal - Small Size */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Modal - Small</h2>
          <Button onClick={() => setIsModalOpen(true)} variant="primary">
            Open Small Modal
          </Button>
          <Modal
            isOpen={false}
            title="Confirm Action"
            onClose={() => {}}
            size="sm"
          >
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this record?
            </p>
          </Modal>
        </section>

        {/* Modal - Large */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Modal - Large</h2>
          <Button onClick={() => setIsModalOpen(true)} variant="primary">
            Open Large Modal
          </Button>
          <Modal
            isOpen={false}
            title="Patient Full History"
            onClose={() => {}}
            size="lg"
          >
            <p className="text-gray-600">Large modal content...</p>
          </Modal>
        </section>

        {/* SearchBar Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">SearchBar - Medium (Default)</h2>
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            onSearch={handleSearch}
            placeholder="Search by patient name or ID"
            size="md"
            isLoading={isSearching}
          />
        </section>

        {/* SearchBar - Small */}
        <section>
          <h2 className="text-2xl font-bold mb-6">SearchBar - Small</h2>
          <SearchBar
            value=""
            onChange={() => {}}
            onSearch={() => {}}
            placeholder="Quick search..."
            size="sm"
          />
        </section>

        {/* SearchBar - Large */}
        <section>
          <h2 className="text-2xl font-bold mb-6">SearchBar - Large</h2>
          <SearchBar
            value=""
            onChange={() => {}}
            onSearch={() => {}}
            placeholder="Search for healthcare facilities..."
            size="lg"
          />
        </section>

        {/* SearchBar - Loading State */}
        <section>
          <h2 className="text-2xl font-bold mb-6">SearchBar - Loading State</h2>
          <SearchBar
            value="Nomsa Dlamini"
            onChange={() => {}}
            onSearch={() => {}}
            placeholder="Search by patient name or ID"
            isLoading={true}
          />
        </section>

        {/* SearchBar - Disabled */}
        <section>
          <h2 className="text-2xl font-bold mb-6">SearchBar - Disabled</h2>
          <SearchBar
            value=""
            onChange={() => {}}
            placeholder="Search disabled..."
            disabled={true}
          />
        </section>
      </div>
    </div>
  );
};