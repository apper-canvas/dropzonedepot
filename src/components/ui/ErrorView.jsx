import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const ErrorView = ({ error = "Something went wrong", onRetry, className }) => {
  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100", className)}>
      <div className="text-center space-y-6 p-8 bg-white rounded-2xl shadow-lg max-w-md mx-4">
        <div className="w-16 h-16 bg-error bg-opacity-10 rounded-full flex items-center justify-center mx-auto">
          <ApperIcon name="AlertCircle" className="w-8 h-8 text-error" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900">Oops! Something went wrong</h3>
          <p className="text-secondary text-sm">{error}</p>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            <ApperIcon name="RotateCcw" className="w-4 h-4" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorView;