import { useState, useEffect } from "react";
import {profile} from "./page.tsx"
export default function header() {
  return (
    <section className="flex justify-center items-center h-screen">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4">
          <h1 className="text-xl font-bold mb-2">Profile</h1>
          {profile.pictureUrl && (
            <div className="flex items-center mb-4">
              <img
                className="w-20 h-20 rounded-full mr-4"
                src={profile.pictureUrl}
                alt={profile.displayName}
              />
              <div>
                <div className="text-lg font-bold">{profile.displayName}</div>
                <div className="text-sm">{profile.statusMessage}</div>
              </div>
            </div>
          )}
          {isLoggedIn && (
            <button
              onClick={logout}
              className="block w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
