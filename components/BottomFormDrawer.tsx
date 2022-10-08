import { nanoid } from 'nanoid';
import React, { useCallback, useLayoutEffect, useRef } from 'react';
import { useEffect, useState } from 'react';

type BottomFormDrawerProps = {
  open?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  children: React.ReactNode;
};

type BottomFormDrawerContextType = {
  openDrawer: () => void;
  closeDrawer: () => void;
};

export const bottomFormDrawerContext = React.createContext<
  BottomFormDrawerContextType | undefined
>(undefined);

export function useBottomFormDrawer() {
  const context = React.useContext(bottomFormDrawerContext);

  if (context === undefined) {
    throw new Error('useBottomFormDrawer must be use within its Provider');
  }

  return context;
}
const BottomFormDrawer: React.FC<BottomFormDrawerProps> = ({ children }) => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formKey, setFormKey] = useState<string>(nanoid());
  const formRef = useRef<HTMLDivElement | null>(null);
  const [formHeight, setFormHeight] = useState<number | undefined>(undefined);

  const openDrawer = useCallback(() => {
    setShowForm(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setFormKey(nanoid());
    setShowForm(false);
  }, []);

  useEffect(() => {
    setFormHeight(formRef.current?.clientHeight);
  }, []);

  console.log("formHeight: ", formHeight);
  return (
    <bottomFormDrawerContext.Provider
      value={{
        openDrawer,
        closeDrawer,
      }}
    >
      <div
        // Using inline style for dynamic height since tailwind won't know the value on compile
        style={{
          transform: `${showForm ? 'translateY(0)' : `translateY(${(formHeight ?? 256) + 30}px)`}`
        }}
        className={`bg-cyan-100 border-t-2 bottom-0 h-auto p-4 w-full fixed flex flex-col justify-between items-center transition-[all] duration-500 ease-in-out 
        `}
      >
        <div className="flex justify-center mb-8 ">
          {!showForm ? (
            <button
              className="py-2 px-4 uppercase font-semibold text-cyan-600"
              type={'button'}
              onClick={() => {
                setShowForm(true);
              }}
            >
              Add Record
            </button>
          ) : (
            <button
              className="uppercase text-xs p-2 font-semibold text-gray-500"
              type={'button'}
              onClick={() => {
                setFormKey(nanoid());
                setShowForm(false);
              }}
            >
              Close
            </button>
          )}
        </div>
        <div
          className={`flex flex-col gap-2 w-full sm:w-72 transition-all duration-1000 ease-linear ${
            showForm ? 'visible' : 'invisible'
          }`}
        >
          {/* Using key to remount - this resets the form */}
          <div key={formKey} ref={formRef}>
            {children}
          </div>
        </div>
      </div>
    </bottomFormDrawerContext.Provider>
  );
};

export default BottomFormDrawer;
