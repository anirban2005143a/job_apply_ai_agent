"use client";

import React from "react";

export default function Toast({ message }: { message: string }) {
  return (
    <div className="fixed right-4 top-4 z-50 rounded bg-(--primary) text-white px-4 py-2 shadow-md">
      {message}
    </div>
  );
}
