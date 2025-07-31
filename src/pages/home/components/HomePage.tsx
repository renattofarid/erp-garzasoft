import { api } from "@/lib/config";
import { useEffect, useState } from "react";

async function getTypes() {
  const { data } = await api.get("/tipo-usuarios");
  return data;
}

export default function HomePage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getTypes()
      .then((data) => {
        setData(data);
        console.log("User types fetched successfully:", data);
      })
      .catch((error) => {
        console.error("Error fetching user types:", error);
      });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl font-bold">Welcome to the Home Page</h1>
      <p className="mt-4 text-lg">This is the main page of the application.</p>
    </div>
  );
}
