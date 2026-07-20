import { useNavigate } from "react-router-dom";
import EmptyState from "../../components/ui/EmptyState";
import { Compass } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[80vh] w-full p-6">
      <div className="max-w-md w-full mx-auto">
        <EmptyState
          icon={Compass}
          title="Page Not Found"
          description="We couldn't find the page you're looking for. It might have been moved, deleted, or you might have a typo in the URL."
          actionLabel="Back to Dashboard"
          onAction={() => navigate("/dashboard", { replace: true })}
        />
      </div>
    </div>
  );
};

export default NotFound;
