import {useCallback, useState} from "react";

export default function App() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    setCount((prevCount) => prevCount + 1);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
        <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
          Hello World!
        </h1>
        <p className="mb-8 text-lg leading-relaxed text-gray-600">
          Welcome to your React + Tailwind CSS template
        </p>
        <button
          onClick={handleClick}
          className="mb-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:translate-y-0">
          Click me!
        </button>
        <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
          <span className="text-xl font-semibold text-gray-800">
            Clicks: {count}
          </span>
        </div>
      </div>
    </div>
  );
}
