import {useState} from "react";

interface Props {
  readonly initialCount?: number;
}

export default function Counter({initialCount = 0}: Props) {
  const [count, setCount] = useState(initialCount);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-xl font-semibold text-gray-800">
        React Counter Island
      </h3>
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            setCount(count - 1);
          }}
          className="rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none">
          -
        </button>
        <span className="text-2xl font-bold text-gray-700">{count}</span>
        <button
          onClick={() => {
            setCount(count + 1);
          }}
          className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none">
          +
        </button>
      </div>
      <p className="mt-4 text-sm text-gray-600">
        This is a React component rendered as an Astro island with client-side
        interactivity.
      </p>
    </div>
  );
}
