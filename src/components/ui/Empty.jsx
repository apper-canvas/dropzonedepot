import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Empty = ({ 
  title = "No files uploaded yet", 
  description = "Drag and drop files here or click browse to get started",
  action,
  className 
}) => {
  return (
    <div className={cn("flex items-center justify-center py-16", className)}>
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto">
          <ApperIcon name="Upload" className="w-10 h-10 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-secondary text-sm">{description}</p>
        </div>

        {action && (
          <div className="pt-2">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default Empty;