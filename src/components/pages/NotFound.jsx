import React from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center space-y-8 p-8 bg-white rounded-2xl shadow-lg max-w-md mx-4">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto">
          <ApperIcon name="FileQuestion" className="w-10 h-10 text-primary" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <h2 className="text-2xl font-bold text-gray-900">Page Not Found</h2>
          <p className="text-secondary">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate("/")}
            className="w-full"
          >
            <ApperIcon name="Home" className="w-5 h-5 mr-2" />
            Go Home
          </Button>
          
          <Button
            variant="ghost"
            size="md"
            onClick={() => window.history.back()}
            className="w-full"
          >
            <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;