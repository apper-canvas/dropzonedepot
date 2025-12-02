import { cn } from "@/utils/cn";

const ProgressBar = ({ 
  progress = 0, 
  showPercentage = true, 
  animated = false,
  className 
}) => {
  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex justify-between items-center">
        {showPercentage && (
          <span className="text-sm font-medium text-gray-700">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            animated && progress > 0 && progress < 100 
              ? "gradient-progress" 
              : "bg-gradient-to-r from-primary to-blue-600"
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        >
          {animated && progress > 0 && progress < 100 && (
            <div className="h-full bg-white bg-opacity-20 animate-shimmer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white via-opacity-30 to-transparent transform -skew-x-12 animate-shimmer"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;