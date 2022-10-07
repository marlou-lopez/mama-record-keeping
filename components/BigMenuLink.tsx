import React from 'react';

type BigMenuLink = {
  children: React.ReactNode;
  size?: 'medium' | 'large';
};

const BigMenuLink = React.forwardRef<HTMLAnchorElement, BigMenuLink>(
  function BigMenuLink({ size = 'large', ...props }, ref) {
    const large = 'h-48 p-12 text-3xl';
    const medium = 'h-32 p-8 text-2xl';
    return (
      <a
        {...props}
        ref={ref}
        className={`bg-blue-600 w-80 m-2 flex items-center justify-center text-3xl text-white rounded-md font-medium ${
          size === 'large' ? large : medium
        }`}
      >
        {props.children}
      </a>
    );
  }
);

export default BigMenuLink;
