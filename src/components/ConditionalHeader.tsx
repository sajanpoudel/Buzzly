'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitialsFromEmail } from '@/utils/stringUtils';

interface UserInfo {
  name: string;
  email: string;
  picture: string;
}

export default function ConditionalHeader() {
  const pathname = usePathname();
  const isLoginPage = pathname === '/';
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const storedTokens = localStorage.getItem('gmail_tokens');
      if (storedTokens) {
        const tokens = JSON.parse(storedTokens);
        try {
          const response = await fetch('https://emailapp-backend.onrender.com/auth/user-info', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tokens }),
          });
          if (response.ok) {
            const data = await response.json();
            setUserInfo(data);
          } else {
            console.error('Failed to fetch user info');
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      }
    };

    if (!isLoginPage) {
      fetchUserInfo();
    }
  }, [isLoginPage]);

  if (isLoginPage) {
    return null;
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold dark:text-white">Your App Name</h1>
        <div className="flex items-center space-x-4">
          <Avatar>
            {userInfo && userInfo.picture ? (
              <AvatarImage src={userInfo.picture} alt={userInfo.name || userInfo.email} />
            ) : (
              <AvatarFallback>
                {userInfo ? getInitialsFromEmail(userInfo.email) : 'U'}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
      </div>
    </header>
  );
}