import React from "react";

export default function Footer() {
  return (
    <footer className="py-4 text-center text-sm text-gray-500">
      © {new Date().getFullYear()} @chinchinbooth. All rights reserved.
    </footer>
  );
}
