import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">
        Welcome, {user?.firstName} {user?.lastName}!
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {user?.role === 'STUDENT' && (
          <>
            <DashboardCard
              title="Search Tutors"
              description="Find and book sessions with expert tutors"
              link="/search-tutors"
              icon="🔍"
            />
            <DashboardCard
              title="My Bookings"
              description="View and manage your upcoming sessions"
              link="/my-bookings"
              icon="📅"
            />
            <DashboardCard
              title="Profile"
              description="Update your personal information"
              link="/profile"
              icon="👤"
            />
          </>
        )}

        {user?.role === 'TUTOR' && (
          <>
            <DashboardCard
              title="Tutor Dashboard"
              description="View your upcoming sessions and students"
              link="/tutor/dashboard"
              icon="🎓"
            />
            <DashboardCard
              title="Manage Slots"
              description="Create and manage your availability"
              link="/tutor/manage-slots"
              icon="⏰"
            />
            <DashboardCard
              title="Profile"
              description="Update your tutor profile and rates"
              link="/profile"
              icon="👤"
            />
          </>
        )}

        {user?.role === 'ADMIN' && (
          <>
            <DashboardCard
              title="Admin Dashboard"
              description="View system statistics and metrics"
              link="/admin/dashboard"
              icon="📊"
            />
            <DashboardCard
              title="User Management"
              description="Manage all users and their roles"
              link="/admin/users"
              icon="👥"
            />
            <DashboardCard
              title="Booking Management"
              description="View and manage all bookings"
              link="/admin/bookings"
              icon="📋"
            />
          </>
        )}
      </div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  link: string;
  icon: string;
}

function DashboardCard({ title, description, link, icon }: DashboardCardProps) {
  return (
    <Link to={link} className="card hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </Link>
  );
}
