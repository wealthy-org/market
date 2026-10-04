import React from 'react';

export const PhantomIcon: React.FC<{ size?: number; className?: string }> = ({ size = 32, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 128 128"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ borderRadius: size * 0.25, flexShrink: 0 }}
  >
    <rect width="128" height="128" rx="28" fill="#AB9FF2" />
    <path
      d="M105.7 66.8C103.5 87.2 86.4 103 65.6 103C42.8 103 24.3 84.5 24.3 61.7C24.3 39.5 41.9 21.4 63.9 20.4C64.6 20.4 65.2 21 65.2 21.7V31.5C65.2 32.2 64.6 32.8 63.9 32.8C48.2 33.8 35.8 46.8 35.8 62.7C35.8 78.9 49.1 92 65.3 92C80.2 92 92.4 80.9 94.3 66.4C94.4 65.6 95.1 65 95.9 65H104.6C105.3 65 105.9 65.9 105.7 66.8Z"
      fill="#4C4480"
      opacity="0.1"
    />
    <path
      d="M93.3 68.3C93.3 54.3 82.8 43 69.8 43C56.8 43 46.3 54.3 46.3 68.3C46.3 79.5 54.6 82.8 59.3 82.8C62.7 82.8 63.8 80.6 66.1 80.6C68.4 80.6 69.5 82.8 72.8 82.8C76.2 82.8 77.3 80.6 79.6 80.6C81.9 80.6 83 82.8 86.3 82.8C91.1 82.8 93.3 78.4 93.3 68.3Z"
      fill="white"
    />
    <circle cx="59.5" cy="65.5" r="4.2" fill="#534BB1" />
    <circle cx="76.5" cy="65.5" r="4.2" fill="#534BB1" />
  </svg>
);

export const MetaMaskIcon: React.FC<{ size?: number; className?: string }> = ({ size = 32, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ flexShrink: 0 }}
  >
    <rect width="32" height="32" rx="7" fill="#FBF8F4" />
    {/* MetaMask Orange Fox Official Shapes */}
    <path
      d="M26.4 7L17.7 13.5L19.4 9.5L26.4 7Z"
      fill="#E2761B"
      stroke="#E2761B"
      strokeWidth="0.2"
    />
    <path
      d="M5.6 7L12.5 9.5L14.3 13.5L5.6 7Z"
      fill="#E2761B"
      stroke="#E2761B"
      strokeWidth="0.2"
    />
    <path
      d="M23.1 20.3L20.8 23.9L25.8 25.3L27.2 20.4L23.1 20.3Z"
      fill="#E2761B"
      stroke="#E2761B"
      strokeWidth="0.2"
    />
    <path
      d="M4.8 20.4L6.2 25.3L11.2 23.9L8.9 20.3L4.8 20.4Z"
      fill="#E2761B"
      stroke="#E2761B"
      strokeWidth="0.2"
    />
    <path
      d="M10.9 14.8L9.3 17.2L14.3 17.4L14.1 12.1L10.9 14.8Z"
      fill="#E2761B"
      stroke="#E2761B"
      strokeWidth="0.2"
    />
    <path
      d="M21.1 14.8L17.8 12L17.7 17.4L22.7 17.2L21.1 14.8Z"
      fill="#E2761B"
      stroke="#E2761B"
      strokeWidth="0.2"
    />
    <path
      d="M11.2 23.9L13.9 22.5L11.5 20.4L11.2 23.9Z"
      fill="#D7C1B3"
      stroke="#D7C1B3"
      strokeWidth="0.2"
    />
    <path
      d="M20.8 23.9L20.5 20.4L18.1 22.5L20.8 23.9Z"
      fill="#D7C1B3"
      stroke="#D7C1B3"
      strokeWidth="0.2"
    />
    <path
      d="M13.9 22.5L18.1 22.5L16 25.5L13.9 22.5Z"
      fill="#233447"
      stroke="#233447"
      strokeWidth="0.2"
    />
    <path
      d="M18.1 22.5L20.5 20.4L17.7 17.4L16 19.8L16 22.5L18.1 22.5Z"
      fill="#CC6228"
      stroke="#CC6228"
      strokeWidth="0.2"
    />
    <path
      d="M11.5 20.4L13.9 22.5L16 22.5L16 19.8L14.3 17.4L11.5 20.4Z"
      fill="#CC6228"
      stroke="#CC6228"
      strokeWidth="0.2"
    />
    <path
      d="M22.7 17.2L17.7 17.4L16 19.8L17.7 21.2L20.5 20.4L23.1 20.3L22.7 17.2Z"
      fill="#E2761B"
      stroke="#E2761B"
      strokeWidth="0.2"
    />
    <path
      d="M9.3 17.2L8.9 20.3L11.5 20.4L14.3 21.2L16 19.8L14.3 17.4L9.3 17.2Z"
      fill="#E2761B"
      stroke="#E2761B"
      strokeWidth="0.2"
    />
    <path
      d="M17.7 13.5L26.4 7L24.8 14.8L21.1 14.8L22.7 17.2L27.2 20.4L25.8 25.3L21.6 24.1L20.8 23.9L18.1 22.5L16 25.5L13.9 22.5L11.2 23.9L10.4 24.1L6.2 25.3L4.8 20.4L9.3 17.2L10.9 14.8L7.2 14.8L5.6 7L14.3 13.5L16 11.2L17.7 13.5Z"
      fill="#F6851B"
    />
  </svg>
);

export const RabbyIcon: React.FC<{ size?: number; className?: string }> = ({ size = 32, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 128 128"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ borderRadius: size * 0.25, flexShrink: 0 }}
  >
    <rect width="128" height="128" rx="28" fill="#8697FF" />
    {/* Rabby White Bunny with Blue & Pink detailing */}
    <path
      d="M48 24C44 24 40 32 40 44C40 56 46 64 50 64C54 64 58 56 58 44C58 32 52 24 48 24Z"
      fill="white"
    />
    <path
      d="M80 24C76 24 70 32 70 44C70 56 74 64 78 64C82 64 88 56 88 44C88 32 84 24 80 24Z"
      fill="white"
    />
    <path
      d="M49 32C47 32 44 38 44 46C44 54 48 58 50 58C52 58 54 54 54 46C54 38 51 32 49 32Z"
      fill="#FFB5BA"
    />
    <path
      d="M79 32C77 32 74 38 74 46C74 54 78 58 80 58C82 58 84 54 84 46C84 38 81 32 79 32Z"
      fill="#FFB5BA"
    />
    <path
      d="M64 48C42 48 32 62 32 78C32 94 46 104 64 104C82 104 96 94 96 78C96 62 86 48 64 48Z"
      fill="white"
    />
    <circle cx="50" cy="74" r="5" fill="#1E2342" />
    <circle cx="78" cy="74" r="5" fill="#1E2342" />
    <circle cx="51.5" cy="72.5" r="1.5" fill="white" />
    <circle cx="79.5" cy="72.5" r="1.5" fill="white" />
    <ellipse cx="64" cy="82" rx="4" ry="2.5" fill="#FF8D96" />
    <circle cx="42" cy="82" r="4.5" fill="#FFD4D7" />
    <circle cx="86" cy="82" r="4.5" fill="#FFD4D7" />
  </svg>
);

export const InjectedIcon: React.FC<{ size?: number; className?: string }> = ({ size = 32, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 128 128"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ borderRadius: size * 0.25, flexShrink: 0 }}
  >
    <rect width="128" height="128" rx="28" fill="#11120F" />
    {/* Clean Web3 Injected / Ethereum Diamond Shield */}
    <path
      d="M64 24L36 70.8L64 87.2L92 70.8L64 24Z"
      fill="#A7FF63"
      opacity="0.9"
    />
    <path
      d="M64 24L64 87.2L92 70.8L64 24Z"
      fill="#58C939"
      opacity="0.6"
    />
    <path
      d="M64 92.8L36 76.4L64 104L92 76.4L64 92.8Z"
      fill="#A7FF63"
    />
    <path
      d="M64 92.8L64 104L92 76.4L64 92.8Z"
      fill="#58C939"
      opacity="0.6"
    />
  </svg>
);
