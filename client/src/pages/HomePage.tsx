import React from "react";
import { useAuthStore } from "../store/application.store";

const HomePage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <main className="flex-1 p-4">
        <h2 className="text-2xl font-bold">Welcome, {user?.firstName}!</h2>
        <p className="mt-2 text-gray-700">
          This is your home page. Enjoy exploring the app!
        </p>
      </main>
    </div>
  );
};

export default HomePage;
