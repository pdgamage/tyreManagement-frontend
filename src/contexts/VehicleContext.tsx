import React, { createContext, useState, useEffect, useContext } from "react";
import { Vehicle, ApiResponse } from "../types/api";
import { apiUrls } from "../config/api";

interface VehicleContextType {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  fetchVehicles: () => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, "id">) => Promise<Vehicle>;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export const VehicleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrls.vehicles());
      const result = await response.json();

      // If result is an array, use it directly
      const vehiclesArray = Array.isArray(result) ? result : result.data || [];

      setVehicles(vehiclesArray);
      console.log("Fetched vehicles:", vehiclesArray);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const addVehicle = async (
    vehicleData: Omit<Vehicle, "id">
  ): Promise<Vehicle> => {
    try {
      const response = await fetch(apiUrls.vehicles(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehicleData),
      });

      const result: ApiResponse<Vehicle> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add vehicle");
      }

      if (!result.data) {
        throw new Error("No data returned");
      }

      setVehicles((prev) => [...prev, result.data as Vehicle]);
      await fetchVehicles();
      return result.data as Vehicle;
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to add vehicle");
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <VehicleContext.Provider
      value={{ vehicles, loading, error, fetchVehicles, addVehicle }}
    >
      {children}
    </VehicleContext.Provider>
  );

};

export const useVehicles = () => {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error("useVehicles must be used within a VehicleProvider");
  }
  return context;
};
